import axios from 'axios';
import { apiClient } from 'src/services/apiClient';
import type {
  CreateExtractionMethodDto,
  ExtractionMethodApiData,
  ExtractionMethodDto,
  ExtractionMethodTestDto,
  UpdateExtractionMethodDto,
} from '../models/extraction-method.dto';
import type {
  ExtractionAvailableData,
  ExtractionConnectionTestResult,
  ExtractionMethod,
  ExtractionMethodInput,
  ExtractionMethodType,
} from '../models/extraction-method';
import type { ExtractionMethodRepository } from './extraction-method.repository';

const methodTypes: ExtractionMethodType[] = ['SNMP', 'API', 'MICROSOFT_GRAPH', 'WEBHOOK'];

function companyMethodsPath(companyId: string): string {
  return `/companies/${encodeURIComponent(companyId)}/extraction-methods`;
}

function ensureApiConfigured(): void {
  if (!apiClient.defaults.baseURL) throw new Error('VITE_API_BASE_URL no está configurada.');
}

function unwrap<T>(data: ExtractionMethodApiData<T>): T {
  if (!data || data.success === false || data.data === null || data.data === undefined) {
    throw new Error(data?.errors?.[0]?.message ?? data?.message ?? 'La API no devolvió datos válidos.');
  }
  return data.data;
}

function mapMethod(value: ExtractionMethodDto): ExtractionMethod {
  if (!value || typeof value !== 'object' || typeof value.id !== 'string' || typeof value.name !== 'string') {
    throw new Error('La API devolvió un método de extracción con formato inválido.');
  }
  return {
    ...value,
    description: value.description ?? '',
    connection: value.connection ?? {},
    target: value.target ?? null,
    discovery: value.discovery ?? { status: 'CONFIGURED', completedAt: null, resources: [] },
    availableData: value.availableData ?? [],
  };
}

async function request<T>(operation: () => Promise<T>, fallbacks?: ReadonlyMap<number, T>): Promise<T> {
  ensureApiConfigured();
  try {
    return await operation();
  } catch (error) {
    if (axios.isAxiosError<ExtractionMethodApiData<unknown>>(error)) {
      const fallback = fallbacks?.get(error.response?.status ?? 0);
      if (fallback !== undefined) return fallback;
      const payload = error.response?.data;
      const message = payload?.errors?.[0]?.message ?? payload?.message;
      if (message) throw new Error(message);
    }
    throw error;
  }
}

export class ApiExtractionMethodRepository implements ExtractionMethodRepository {
  async list(companyId: string): Promise<ExtractionMethod[]> {
    return request(async () => {
      const response = await apiClient.get<ExtractionMethodApiData<ExtractionMethodDto[]>>(companyMethodsPath(companyId));
      const data = unwrap(response.data);
      if (!Array.isArray(data)) throw new Error('La API devolvió una lista de métodos inválida.');
      return data.map(mapMethod);
    });
  }

  async getById(companyId: string, id: string): Promise<ExtractionMethod | null> {
    return request(async () => {
      const response = await apiClient.get<ExtractionMethodApiData<ExtractionMethodDto>>(`${companyMethodsPath(companyId)}/${encodeURIComponent(id)}`);
      return mapMethod(unwrap(response.data));
    }, new Map<number, ExtractionMethod | null>([[404, null]]));
  }

  async create(companyId: string, value: ExtractionMethodInput): Promise<ExtractionMethod | null> {
    return request(async () => {
      const response = await apiClient.post<ExtractionMethodApiData<ExtractionMethodDto>>(companyMethodsPath(companyId), value satisfies CreateExtractionMethodDto);
      return mapMethod(unwrap(response.data));
    }, new Map<number, ExtractionMethod | null>([[409, null]]));
  }

  async update(companyId: string, id: string, value: ExtractionMethodInput): Promise<ExtractionMethod | null> {
    return request(async () => {
      const response = await apiClient.patch<ExtractionMethodApiData<ExtractionMethodDto>>(`${companyMethodsPath(companyId)}/${encodeURIComponent(id)}`, value satisfies UpdateExtractionMethodDto);
      return mapMethod(unwrap(response.data));
    }, new Map<number, ExtractionMethod | null>([[404, null], [409, null]]));
  }

  async delete(companyId: string, id: string): Promise<boolean> {
    return request(async () => {
      const response = await apiClient.delete<ExtractionMethodApiData<unknown>>(`${companyMethodsPath(companyId)}/${encodeURIComponent(id)}`);
      return response.data.success;
    }, new Map<number, boolean>([[404, false]]));
  }

  async testConnection(companyId: string, id: string): Promise<ExtractionConnectionTestResult> {
    return request(async () => {
      const response = await apiClient.post<ExtractionMethodApiData<ExtractionMethodTestDto>>(`${companyMethodsPath(companyId)}/${encodeURIComponent(id)}/test`);
      const result = unwrap(response.data);
      return {
        success: result.success,
        messageKey: result.messageKey ?? (result.success
          ? 'extractionMethods.messages.connectionSuccess'
          : 'extractionMethods.messages.connectionError'),
      };
    });
  }

  async runDiscovery(companyId: string, id: string): Promise<ExtractionMethod | null> {
    return request(async () => {
      const response = await apiClient.post<ExtractionMethodApiData<ExtractionMethodDto>>(`${companyMethodsPath(companyId)}/${encodeURIComponent(id)}/discovery`);
      return mapMethod(unwrap(response.data));
    });
  }

  async getAvailableData(companyId: string, methodIds: string[]): Promise<ExtractionAvailableData[]> {
    if (!methodIds.length) return [];
    const methods = await this.list(companyId);
    const requestedIds = new Set(methodIds);
    return methods.filter((method) => requestedIds.has(method.id)).flatMap((method) => method.availableData);
  }

  getTypeOptions(): ExtractionMethodType[] {
    return [...methodTypes];
  }
}

export const apiExtractionMethodRepository = new ApiExtractionMethodRepository();