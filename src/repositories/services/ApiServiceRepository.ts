import axios from 'axios';
import { apiClient, withCompanyCode } from 'src/services/apiClient';
import { getActiveCompanyCode } from 'src/services/session/sessionService';
import type { Service, ServiceAuthType, ServiceConnectionTestResult, ServiceFilters, ServiceType, ServiceTypeCatalogItem, ServiceUsage } from 'src/models/services/Service';
import type { ServiceApiResponse } from 'src/models/services/ServiceDtos';
import type { ServiceRepository } from './ServiceRepository';

function servicePath(): string {
  return '/services';
}

function normalizeServiceTypeCode(code: string): ServiceType {
  const aliases: Record<string, ServiceType> = {
    TEAMS: 'MICROSOFT_TEAMS',
    OUTLOOK: 'MICROSOFT_OUTLOOK',
  };
  return aliases[code] ?? code as ServiceType;
}

let cachedServiceTypes: ServiceTypeCatalogItem[] = [];

function mapService(value: unknown): Service {
  if (!value || typeof value !== 'object') {
    throw new Error('La API devolvió un servicio inválido.');
  }

  const item = value as Record<string, unknown>;
  const id = Number(item.id);
  const serviceTypeId = Number(item.serviceTypeId ?? item.service_type_id);
  const typeCode = item.serviceTypeCode ?? item.service_type_code ?? item.type;
  const code = item.code;
  const name = item.name;
  const isActive = item.isActive ?? item.is_active ?? item.enabled;
  const authTypeCode = item.authTypeCode ?? item.auth_type_code ?? item.authType;

  if (!Number.isSafeInteger(id) || id <= 0 || !Number.isSafeInteger(serviceTypeId) || typeof code !== 'string' || typeof name !== 'string') {
    throw new Error('La API devolvió un servicio con datos obligatorios inválidos.');
  }

  const type = typeof typeCode === 'string'
    ? normalizeServiceTypeCode(typeCode)
    : cachedServiceTypes.find((serviceType) => serviceType.id === serviceTypeId)?.code;
  if (!type) throw new Error('El servicio hace referencia a un Tipo de Servicio desconocido.');

  const authAliases: Record<string, ServiceAuthType> = {
    OAUTH2_CLIENT_CREDENTIALS: 'OAUTH2',
    OAUTH2_AUTHORIZATION_CODE: 'OAUTH2',
    SNMP_V3_USM: 'SNMPV3_USM',
  };
  const rawAuthType = typeof authTypeCode === 'string' ? authTypeCode : 'NONE';
  const authType = authAliases[rawAuthType] ?? rawAuthType as ServiceAuthType;
  const enabled = isActive === true || isActive === 1 || isActive === '1';

  return {
    id: String(id),
    code,
    name,
    description: typeof item.description === 'string' ? item.description : null,
    type,
    driver: String(item.driverKey ?? item.driver_key ?? ''),
    authType,
    status: enabled ? 'ACTIVE' : 'INACTIVE',
    enabled,
    connectionConfig: (item.connectionConfig ?? item.connection_config ?? null) as Service['connectionConfig'],
    additionalParameters: Array.isArray(item.additionalParameters) ? item.additionalParameters as Service['additionalParameters'] : [],
    createdAt: String(item.createdAt ?? item.created_at ?? ''),
    updatedAt: String(item.updatedAt ?? item.updated_at ?? ''),
  };
}

function mapServiceType(value: unknown): ServiceTypeCatalogItem {
  if (!value || typeof value !== 'object') {
    throw new Error('El catálogo devolvió un tipo de servicio inválido.');
  }

  const item = value as Record<string, unknown>;
  const id = Number(item.id ?? item.service_type_id ?? item.serviceTypeId);
  const rawCode = item.code ?? item.type ?? item.service_type_code ?? item.serviceTypeCode;
  const code = typeof rawCode === 'string' ? rawCode : '';
  const rawName = item.name ?? item.service_type_name ?? item.serviceTypeName;
  const name = typeof rawName === 'string' ? rawName : code;

  if (!Number.isSafeInteger(id) || id <= 0 || !code) {
    throw new Error('El catálogo devolvió un tipo de servicio sin ID numérico o código.');
  }

  return { id, code: normalizeServiceTypeCode(code), name };
}

function unwrapList<T>(data: ServiceApiResponse<T[] | { items?: T[] }> | null | undefined): T[] {
  const payload = unwrap(data);
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object' && Array.isArray(payload.items)) return payload.items;
  throw new Error('La API devolvió un catálogo inválido.');
}

function normalizeQuery(filters: ServiceFilters): Record<string, string> {
  const query: Record<string, string> = {};

  if (filters.search) query.search = filters.search;
  if (filters.type) {
    const serviceType = cachedServiceTypes.find((item) => item.code === filters.type);
    if (serviceType) query.serviceTypeId = String(serviceType.id);
  }
  if (filters.status) query.isActive = String(filters.status === 'ACTIVE');
  query.page = '1';
  query.pageSize = '50';

  return query;
}

function unwrap<T>(response: ServiceApiResponse<T> | null | undefined): T {
  if (!response || response.success === false || response.data === null || response.data === undefined) {
    throw new Error(response?.errors?.[0]?.message ?? response?.message ?? 'La API no devolvió datos válidos.');
  }
  return response.data;
}

async function request<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data as ServiceApiResponse<unknown> | undefined;
      const message = data?.errors?.[0]?.message ?? data?.message ?? error.message;
      throw new Error(message);
    }
    throw error;
  }
}

const apiServiceRepositoryImpl: ServiceRepository = {
  async listTypes(): Promise<ServiceTypeCatalogItem[]> {
    const companyCode = getActiveCompanyCode();
    const response = await request(() => apiClient.get<ServiceApiResponse<unknown[] | { items?: unknown[] }>>('/service-types', {
      headers: withCompanyCode({}, companyCode),
    }));
    cachedServiceTypes = unwrapList(response.data).map(mapServiceType);
    return cachedServiceTypes;
  },

  async list(filters: ServiceFilters): Promise<Service[]> {
    const companyCode = getActiveCompanyCode();
    if (filters.type && !cachedServiceTypes.length) cachedServiceTypes = await this.listTypes();
    const response = await request(() => apiClient.get<ServiceApiResponse<unknown[] | { items?: unknown[] }>>(servicePath(), {
      params: normalizeQuery(filters),
      headers: withCompanyCode({}, companyCode),
    }));
    return unwrapList(response.data).map(mapService);
  },

  async getById(id: string): Promise<Service | null> {
    const companyCode = getActiveCompanyCode();
    try {
      const response = await request(() => apiClient.get<ServiceApiResponse<Service>>(`${servicePath()}/${encodeURIComponent(id)}`, {
        headers: withCompanyCode({}, companyCode),
      }));
      return mapService(unwrap(response.data));
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) return null;
      throw error;
    }
  },

  async create(payload): Promise<Service | null> {
    const companyCode = getActiveCompanyCode();
    const response = await request(() => apiClient.post<ServiceApiResponse<Service>>(servicePath(), payload, {
      headers: withCompanyCode({}, companyCode),
    }));
    return mapService(unwrap(response.data));
  },

  async update(id, payload): Promise<Service | null> {
    const companyCode = getActiveCompanyCode();
    const response = await request(() => apiClient.patch<ServiceApiResponse<Service>>(`${servicePath()}/${encodeURIComponent(id)}`, payload, {
      headers: withCompanyCode({}, companyCode),
    }));
    return mapService(unwrap(response.data));
  },

  async duplicate(id): Promise<Service | null> {
    const companyCode = getActiveCompanyCode();
    const response = await request(() => apiClient.post<ServiceApiResponse<Service>>(`${servicePath()}/${encodeURIComponent(id)}/duplicate`, {}, {
      headers: withCompanyCode({}, companyCode),
    }));
    return unwrap(response.data);
  },

  async setStatus(id, enabled): Promise<Service | null> {
    const companyCode = getActiveCompanyCode();
    const response = await request(() => apiClient.patch<ServiceApiResponse<Service>>(`${servicePath()}/${encodeURIComponent(id)}/status`, { isActive: enabled }, {
      headers: withCompanyCode({}, companyCode),
    }));
    return mapService(unwrap(response.data));
  },

  async delete(id): Promise<boolean> {
    const companyCode = getActiveCompanyCode();
    try {
      const response = await request(() => apiClient.delete<ServiceApiResponse<unknown>>(`${servicePath()}/${encodeURIComponent(id)}`, {
        headers: withCompanyCode({}, companyCode),
      }));
      return response.data.success === true;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) return false;
      throw error;
    }
  },

  async testConnection(id): Promise<ServiceConnectionTestResult> {
    const companyCode = getActiveCompanyCode();
    const response = await request(() => apiClient.post<ServiceApiResponse<ServiceConnectionTestResult>>(`${servicePath()}/${encodeURIComponent(id)}/test-connection`, {}, {
      headers: withCompanyCode({}, companyCode),
    }));
    return unwrap(response.data);
  },

  async getUsage(id): Promise<ServiceUsage[]> {
    const companyCode = getActiveCompanyCode();
    const response = await request(() => apiClient.get<ServiceApiResponse<ServiceUsage[]>>(`${servicePath()}/${encodeURIComponent(id)}/usage`, {
      headers: withCompanyCode({}, companyCode),
    }));
    return unwrap(response.data);
  },
};

export const apiServiceRepository = apiServiceRepositoryImpl;
export default apiServiceRepository;
