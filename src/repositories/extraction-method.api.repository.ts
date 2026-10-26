import axios from 'axios';
import { apiClient, withCompanyCode } from 'src/services/apiClient';
import { getActiveCompanyCode } from 'src/services/session/sessionService';
import type {
  CreateExtractionMethodDto,
  CreateEquipmentExtractionMethodDto,
  EquipmentExtractionMethodDto,
  ExtractionMethodApiData,
  ExtractionMethodDto,
  UpdateExtractionMethodDto,
  UpdateEquipmentExtractionMethodDto,
} from 'src/models/extraction-method.dto';
import type {
  EquipmentExtractionMethod,
  EquipmentExtractionMethodInput,
  ExtractionAvailableData,
  ExtractionMethod,
  ExtractionMethodInput,
  ExtractionMethodProtocol,
} from 'src/models/extraction-method';
import { getAvailableDataFromMethod } from 'src/models/extraction-method';

function methodsPath(): string {
  return '/extraction-methods';
}

function ensureApiConfigured(): void {
  if (!apiClient.defaults.baseURL) throw new Error('VITE_API_BASE_URL no está configurada.');
}

function parseJson(value: unknown): Record<string, unknown> | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'string') {
    try {
      const parsed: unknown = JSON.parse(value);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? parsed as Record<string, unknown>
        : null;
    } catch {
      throw new Error('La API devolvió JSON inválido para un método de extracción.');
    }
  }
  return typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function unwrap<T>(response: ExtractionMethodApiData<T>): T {
  if (!response || response.success === false || response.data === null || response.data === undefined) {
    throw new Error(response?.errors?.[0]?.message ?? response?.message ?? 'La API no devolvió datos válidos.');
  }
  return response.data;
}

function mapMethod(value: ExtractionMethodDto): ExtractionMethod {
  if (!value || typeof value !== 'object' || value.id === undefined || typeof value.code !== 'string') {
    throw new Error('La API devolvió un método de extracción con formato inválido.');
  }
  return {
    ...value,
    id: String(value.id),
    description: value.description ?? null,
    configurationSchema: parseJson(value.configurationSchema),
    parameters: (value.parameters ?? []).map((parameter) => ({ ...parameter, id: String(parameter.id), extractionMethodId: String(parameter.extractionMethodId) })),
    requests: (value.requests ?? []).map((request) => ({
      ...request,
      id: String(request.id),
      extractionMethodId: String(request.extractionMethodId),
      requestConfig: parseJson(request.requestConfig) ?? {},
      fields: (request.fields ?? []).map((field) => ({ ...field, id: String(field.id), requestId: String(field.requestId) })),
    })),
    versions: (value.versions ?? []).map((version) => ({
      ...version,
      id: String(version.id),
      extractionMethodId: String(version.extractionMethodId),
      definitionSnapshot: parseJson(version.definitionSnapshot) ?? {},
    })),
  };
}

async function withApiErrors<Value>(operation: () => Promise<Value>): Promise<Value> {
  ensureApiConfigured();
  try {
    return await operation();
  } catch (error) {
    if (axios.isAxiosError<ExtractionMethodApiData<unknown>>(error)) {
      const response = error.response?.data;
      const message = response?.errors?.[0]?.message ?? response?.message;
      if (message) throw new Error(message);
    }
    throw error;
  }
}

export async function listExtractionMethods(): Promise<ExtractionMethod[]> {
  const companyCode = getActiveCompanyCode();

  return withApiErrors(async () => {
    const response = await apiClient.get<ExtractionMethodApiData<ExtractionMethodDto[]>>(methodsPath(), {
      headers: withCompanyCode({}, companyCode),
    });
    const methods = unwrap(response.data);
    if (!Array.isArray(methods)) throw new Error('La API devolvió una lista de métodos inválida.');
    return methods.map(mapMethod);
  });
}

export async function getExtractionMethodById(id: string): Promise<ExtractionMethod | null> {
  const companyCode = getActiveCompanyCode();

  return withApiErrors(async () => {
    try {
      const response = await apiClient.get<ExtractionMethodApiData<ExtractionMethodDto>>(
        `${methodsPath()}/${encodeURIComponent(id)}`,
        { headers: withCompanyCode({}, companyCode) },
      );
      return mapMethod(unwrap(response.data));
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) return null;
      throw error;
    }
  });
}

export async function createExtractionMethod(value: ExtractionMethodInput): Promise<ExtractionMethod | null> {
  const companyCode = getActiveCompanyCode();

  return withApiErrors(async () => {
    try {
      const body: CreateExtractionMethodDto = value;
      const response = await apiClient.post<ExtractionMethodApiData<ExtractionMethodDto>>(methodsPath(), body, {
        headers: withCompanyCode({}, companyCode),
      });
      return mapMethod(unwrap(response.data));
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) return null;
      throw error;
    }
  });
}

export async function updateExtractionMethod(id: string, value: ExtractionMethodInput): Promise<ExtractionMethod | null> {
  const companyCode = getActiveCompanyCode();

  return withApiErrors(async () => {
    try {
      const body: UpdateExtractionMethodDto = value;
      const response = await apiClient.patch<ExtractionMethodApiData<ExtractionMethodDto>>(
        `${methodsPath()}/${encodeURIComponent(id)}`,
        body,
        { headers: withCompanyCode({}, companyCode) },
      );
      return mapMethod(unwrap(response.data));
    } catch (error) {
      if (axios.isAxiosError(error) && [404, 409].includes(error.response?.status ?? 0)) return null;
      throw error;
    }
  });
}

export async function deleteExtractionMethod(id: string): Promise<boolean> {
  const companyCode = getActiveCompanyCode();

  return withApiErrors(async () => {
    try {
      const response = await apiClient.delete<ExtractionMethodApiData<unknown>>(
        `${methodsPath()}/${encodeURIComponent(id)}`,
        { headers: withCompanyCode({}, companyCode) },
      );
      return response.data.success;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) return false;
      throw error;
    }
  });
}

export async function getExtractionMethodAvailableData(methodIds: string[]): Promise<ExtractionAvailableData[]> {
  if (!methodIds.length) return [];
  const requestedIds = new Set(methodIds);
  const methods = await listExtractionMethods();
  return methods
    .filter((method) => requestedIds.has(method.id))
    .flatMap(getAvailableDataFromMethod);
}

export function getExtractionMethodProtocolOptions(): ExtractionMethodProtocol[] {
  return ['SNMP', 'API', 'REST', 'MICROSOFT_GRAPH', 'WEBHOOK', 'SOAP', 'SSH', 'SQL'];
}

function equipmentBindingsPath(methodId: string): string {
  return `${methodsPath()}/${encodeURIComponent(methodId)}/equipment-bindings`;
}

function mapEquipmentBinding(value: EquipmentExtractionMethodDto): EquipmentExtractionMethod {
  if (!value || typeof value !== 'object' || value.id === undefined || value.equipmentId === undefined) {
    throw new Error('La API devolvió una asociación de equipo con formato inválido.');
  }
  return {
    ...value,
    id: String(value.id),
    equipmentId: String(value.equipmentId),
    extractionMethodId: String(value.extractionMethodId),
    connectionConfig: parseJson(value.connectionConfig),
    credentialRef: value.credentialRef ?? null,
  };
}

export async function listEquipmentExtractionMethods(methodId: string): Promise<EquipmentExtractionMethod[]> {
  const companyCode = getActiveCompanyCode();

  return withApiErrors(async () => {
    const response = await apiClient.get<ExtractionMethodApiData<EquipmentExtractionMethodDto[]>>(
      equipmentBindingsPath(methodId),
      { headers: withCompanyCode({}, companyCode) },
    );
    const bindings = unwrap(response.data);
    if (!Array.isArray(bindings)) throw new Error('La API devolvió una lista de asociaciones inválida.');
    return bindings.map(mapEquipmentBinding);
  });
}

export async function createEquipmentExtractionMethod(
  methodId: string,
  value: EquipmentExtractionMethodInput,
): Promise<EquipmentExtractionMethod | null> {
  const companyCode = getActiveCompanyCode();

  return withApiErrors(async () => {
    try {
      const body: CreateEquipmentExtractionMethodDto = value;
      const response = await apiClient.post<ExtractionMethodApiData<EquipmentExtractionMethodDto>>(
        equipmentBindingsPath(methodId),
        body,
        { headers: withCompanyCode({}, companyCode) },
      );
      return mapEquipmentBinding(unwrap(response.data));
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) return null;
      throw error;
    }
  });
}

export async function updateEquipmentExtractionMethod(
  methodId: string,
  bindingId: string,
  value: EquipmentExtractionMethodInput,
): Promise<EquipmentExtractionMethod | null> {
  const companyCode = getActiveCompanyCode();

  return withApiErrors(async () => {
    try {
      const body: UpdateEquipmentExtractionMethodDto = value;
      const response = await apiClient.patch<ExtractionMethodApiData<EquipmentExtractionMethodDto>>(
        `${equipmentBindingsPath(methodId)}/${encodeURIComponent(bindingId)}`,
        body,
        { headers: withCompanyCode({}, companyCode) },
      );
      return mapEquipmentBinding(unwrap(response.data));
    } catch (error) {
      if (axios.isAxiosError(error) && [404, 409].includes(error.response?.status ?? 0)) return null;
      throw error;
    }
  });
}

export async function deleteEquipmentExtractionMethod(methodId: string, bindingId: string): Promise<boolean> {
  const companyCode = getActiveCompanyCode();

  return withApiErrors(async () => {
    try {
      const response = await apiClient.delete<ExtractionMethodApiData<unknown>>(
        `${equipmentBindingsPath(methodId)}/${encodeURIComponent(bindingId)}`,
        { headers: withCompanyCode({}, companyCode) },
      );
      return response.data.success;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) return false;
      throw error;
    }
  });
}