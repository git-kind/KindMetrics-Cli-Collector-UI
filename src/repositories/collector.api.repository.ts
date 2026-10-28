import axios from 'axios';
import { apiClient, withCompanyCode } from 'src/services/apiClient';
import type {
  Collector,
  CollectorDataStructure,
  CollectorField,
  CollectorFilters,
  CollectorFormValue,
  CollectorHealthMock,
  CollectorIndex,
  CollectorLogMock,
  CollectorReferenceData,
  CollectorTable,
  CollectorTestResultMock,
  CollectorTestType,
} from 'src/models/collector';
import type { CollectorRepository } from './collector.repository';

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ message?: string }>;
};

class CollectorApiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
  }
}

function collectorsPath(): string {
  return '/collectors';
}

function normalizeQuery(filters: CollectorFilters): Record<string, string> {
  const query: Record<string, string> = {};

  if (filters.search) query.search = filters.search;
  if (filters.status && filters.status !== 'ALL') query.status = filters.status;

  return query;
}

function unwrap<T>(value: ApiEnvelope<T> | T | null | undefined): T {
  if (value === null || value === undefined) {
    throw new Error('La API no devolvió datos válidos.');
  }

  if (typeof value === 'object' && !Array.isArray(value) && 'data' in value) {
    const envelope = value as ApiEnvelope<T>;
    if (envelope.success === false) {
      throw new Error(envelope.errors?.[0]?.message ?? envelope.message ?? 'La API devolvió un error.');
    }
    if (envelope.data === undefined || envelope.data === null) {
      throw new Error(envelope.errors?.[0]?.message ?? envelope.message ?? 'La API no devolvió datos válidos.');
    }
    return envelope.data as T;
  }

  return value as T;
}

async function request<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data as ApiEnvelope<unknown> | undefined;
      const message = data?.errors?.[0]?.message ?? data?.message ?? error.message;
      throw new CollectorApiError(message, error.response?.status);
    }
    throw error;
  }
}

function isNotFound(error: unknown): boolean {
  return (axios.isAxiosError(error) && error.response?.status === 404)
    || (error instanceof CollectorApiError && error.status === 404);
}

export const apiCollectorRepository: CollectorRepository = {
  async list(companyCode: string, filters: CollectorFilters): Promise<Collector[]> {
    const response = await request(() => apiClient.get<ApiEnvelope<Collector[]>>(collectorsPath(), {
      params: normalizeQuery(filters),
      headers: withCompanyCode({}, companyCode),
    }));

    const payload: unknown = unwrap<unknown>(response.data);
    if (Array.isArray(payload)) return payload;
    if (payload && typeof payload === 'object' && 'items' in payload) {
      const items = (payload as { items?: unknown }).items;
      if (Array.isArray(items)) return items as Collector[];
    }
    throw new Error('La API devolvió una lista de Collectors inválida.');
  },

  async getById(companyCode: string, id: string): Promise<Collector | null> {
    try {
      const response = await request(() => apiClient.get<ApiEnvelope<Collector>>(`${collectorsPath()}/${encodeURIComponent(id)}`, {
        headers: withCompanyCode({}, companyCode),
      }));
      return unwrap(response.data);
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  },

  async create(companyCode: string, value: CollectorFormValue): Promise<Collector> {
    const response = await request(() => apiClient.post<ApiEnvelope<Collector>>(collectorsPath(), value, {
      headers: withCompanyCode({}, companyCode),
    }));
    return unwrap(response.data);
  },

  async update(companyCode: string, id: string, value: CollectorFormValue): Promise<Collector | null> {
    try {
      const response = await request(() => apiClient.patch<ApiEnvelope<Collector>>(`${collectorsPath()}/${encodeURIComponent(id)}`, value, {
        headers: withCompanyCode({}, companyCode),
      }));
      return unwrap(response.data);
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  },

  async delete(companyCode: string, id: string): Promise<boolean> {
    try {
      const response = await request(() => apiClient.delete<ApiEnvelope<unknown>>(`${collectorsPath()}/${encodeURIComponent(id)}`, {
        headers: withCompanyCode({}, companyCode),
      }));
      return (response.data as ApiEnvelope<unknown>)?.success === true;
    } catch (error) {
      if (isNotFound(error)) return false;
      throw error;
    }
  },

  async activate(companyCode: string, id: string): Promise<Collector | null> {
    const response = await request(() => apiClient.patch<ApiEnvelope<Collector>>(`${collectorsPath()}/${encodeURIComponent(id)}/status`, { status: 'ACTIVE' }, {
      headers: withCompanyCode({}, companyCode),
    }));
    return unwrap(response.data);
  },

  async deactivate(companyCode: string, id: string): Promise<Collector | null> {
    const response = await request(() => apiClient.patch<ApiEnvelope<Collector>>(`${collectorsPath()}/${encodeURIComponent(id)}/status`, { status: 'INACTIVE' }, {
      headers: withCompanyCode({}, companyCode),
    }));
    return unwrap(response.data);
  },

  async getReferenceData(companyCode: string): Promise<CollectorReferenceData> {
    const response = await request(() => apiClient.get<ApiEnvelope<CollectorReferenceData>>(`${collectorsPath()}/reference-data`, {
      headers: withCompanyCode({}, companyCode),
    }));
    return unwrap(response.data);
  },

  async getHealth(companyCode: string, id: string): Promise<CollectorHealthMock | null> {
    try {
      const response = await request(() => apiClient.get<ApiEnvelope<CollectorHealthMock>>(`${collectorsPath()}/${encodeURIComponent(id)}/health`, {
        headers: withCompanyCode({}, companyCode),
      }));
      return unwrap(response.data);
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  },

  async getLogs(companyCode: string, id: string): Promise<CollectorLogMock[] | null> {
    try {
      const response = await request(() => apiClient.get<ApiEnvelope<CollectorLogMock[]>>(`${collectorsPath()}/${encodeURIComponent(id)}/logs`, {
        headers: withCompanyCode({}, companyCode),
      }));
      return unwrap(response.data);
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  },

  async executeCollector(companyCode: string, id: string): Promise<CollectorTestResultMock | null> {
    const response = await request(() => apiClient.post<ApiEnvelope<CollectorTestResultMock>>(`${collectorsPath()}/${encodeURIComponent(id)}/execute`, {}, {
      headers: withCompanyCode({}, companyCode),
    }));
    return unwrap(response.data);
  },

  async synchronizeCollector(companyCode: string, id: string): Promise<boolean> {
    const response = await request(() => apiClient.post<ApiEnvelope<{ success: boolean }>>(`${collectorsPath()}/${encodeURIComponent(id)}/synchronize`, {}, {
      headers: withCompanyCode({}, companyCode),
    }));
    return unwrap(response.data).success;
  },

  async executeTest(companyCode: string, id: string, type: CollectorTestType): Promise<CollectorTestResultMock | null> {
    const response = await request(() => apiClient.post<ApiEnvelope<CollectorTestResultMock>>(`${collectorsPath()}/${encodeURIComponent(id)}/tests`, { type }, {
      headers: withCompanyCode({}, companyCode),
    }));
    return unwrap(response.data);
  },

  async getDataStructure(companyCode: string, collectorId: string): Promise<CollectorDataStructure | null> {
    try {
      const response = await request(() => apiClient.get<ApiEnvelope<CollectorDataStructure>>(`${collectorsPath()}/${encodeURIComponent(collectorId)}/data-structure`, {
        headers: withCompanyCode({}, companyCode),
      }));
      return unwrap(response.data);
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  },

  async createTable(companyCode: string, collectorId: string, table: Omit<CollectorTable, 'id' | 'status' | 'fields' | 'indexes'>): Promise<CollectorTable | null> {
    const response = await request(() => apiClient.post<ApiEnvelope<CollectorTable>>(`${collectorsPath()}/${encodeURIComponent(collectorId)}/data-structure/tables`, table, {
      headers: withCompanyCode({}, companyCode),
    }));
    return unwrap(response.data);
  },

  async updateTable(companyCode: string, collectorId: string, tableId: string, table: Partial<CollectorTable>): Promise<CollectorTable | null> {
    const response = await request(() => apiClient.patch<ApiEnvelope<CollectorTable>>(`${collectorsPath()}/${encodeURIComponent(collectorId)}/data-structure/tables/${encodeURIComponent(tableId)}`, table, {
      headers: withCompanyCode({}, companyCode),
    }));
    return unwrap(response.data);
  },

  async deleteTable(companyCode: string, collectorId: string, tableId: string): Promise<boolean> {
    const response = await request(() => apiClient.delete<ApiEnvelope<unknown>>(`${collectorsPath()}/${encodeURIComponent(collectorId)}/data-structure/tables/${encodeURIComponent(tableId)}`, {
      headers: withCompanyCode({}, companyCode),
    }));
    return (response.data as ApiEnvelope<unknown>)?.success === true;
  },

  async createField(companyCode: string, collectorId: string, tableId: string, field: Omit<CollectorField, 'id'>): Promise<CollectorField | null> {
    const response = await request(() => apiClient.post<ApiEnvelope<CollectorField>>(`${collectorsPath()}/${encodeURIComponent(collectorId)}/data-structure/tables/${encodeURIComponent(tableId)}/fields`, field, {
      headers: withCompanyCode({}, companyCode),
    }));
    return unwrap(response.data);
  },

  async updateField(companyCode: string, collectorId: string, tableId: string, fieldId: string, field: Partial<CollectorField>): Promise<CollectorField | null> {
    const response = await request(() => apiClient.patch<ApiEnvelope<CollectorField>>(`${collectorsPath()}/${encodeURIComponent(collectorId)}/data-structure/tables/${encodeURIComponent(tableId)}/fields/${encodeURIComponent(fieldId)}`, field, {
      headers: withCompanyCode({}, companyCode),
    }));
    return unwrap(response.data);
  },

  async deleteField(companyCode: string, collectorId: string, tableId: string, fieldId: string): Promise<boolean> {
    const response = await request(() => apiClient.delete<ApiEnvelope<unknown>>(`${collectorsPath()}/${encodeURIComponent(collectorId)}/data-structure/tables/${encodeURIComponent(tableId)}/fields/${encodeURIComponent(fieldId)}`, {
      headers: withCompanyCode({}, companyCode),
    }));
    return (response.data as ApiEnvelope<unknown>)?.success === true;
  },

  async createIndex(companyCode: string, collectorId: string, tableId: string, index: Omit<CollectorIndex, 'id'>): Promise<CollectorIndex | null> {
    const response = await request(() => apiClient.post<ApiEnvelope<CollectorIndex>>(`${collectorsPath()}/${encodeURIComponent(collectorId)}/data-structure/tables/${encodeURIComponent(tableId)}/indexes`, index, {
      headers: withCompanyCode({}, companyCode),
    }));
    return unwrap(response.data);
  },

  async updateIndex(companyCode: string, collectorId: string, tableId: string, indexId: string, index: Partial<CollectorIndex>): Promise<CollectorIndex | null> {
    const response = await request(() => apiClient.patch<ApiEnvelope<CollectorIndex>>(`${collectorsPath()}/${encodeURIComponent(collectorId)}/data-structure/tables/${encodeURIComponent(tableId)}/indexes/${encodeURIComponent(indexId)}`, index, {
      headers: withCompanyCode({}, companyCode),
    }));
    return unwrap(response.data);
  },

  async deleteIndex(companyCode: string, collectorId: string, tableId: string, indexId: string): Promise<boolean> {
    const response = await request(() => apiClient.delete<ApiEnvelope<unknown>>(`${collectorsPath()}/${encodeURIComponent(collectorId)}/data-structure/tables/${encodeURIComponent(tableId)}/indexes/${encodeURIComponent(indexId)}`, {
      headers: withCompanyCode({}, companyCode),
    }));
    return (response.data as ApiEnvelope<unknown>)?.success === true;
  },

  async validateStructure(companyCode: string, collectorId: string): Promise<{ valid: boolean; errors: string[] }> {
    const response = await request(() => apiClient.post<ApiEnvelope<{ valid: boolean; errors: string[] }>>(`${collectorsPath()}/${encodeURIComponent(collectorId)}/data-structure/validate`, {}, {
      headers: withCompanyCode({}, companyCode),
    }));
    const payload = unwrap(response.data);
    return payload ?? { valid: true, errors: [] };
  },

  async previewChanges(companyCode: string, collectorId: string): Promise<string[]> {
    const response = await request(() => apiClient.get<ApiEnvelope<string[]>>(`${collectorsPath()}/${encodeURIComponent(collectorId)}/data-structure/preview`, {
      headers: withCompanyCode({}, companyCode),
    }));
    return unwrap(response.data);
  },

  async applyChanges(companyCode: string, collectorId: string): Promise<{ success: boolean; message: string }> {
    const response = await request(() => apiClient.post<ApiEnvelope<{ success: boolean; message: string }>>(`${collectorsPath()}/${encodeURIComponent(collectorId)}/data-structure/apply`, {}, {
      headers: withCompanyCode({}, companyCode),
    }));
    return unwrap(response.data);
  },
};

export default apiCollectorRepository;
