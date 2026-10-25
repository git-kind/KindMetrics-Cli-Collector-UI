import type { Company, CreateCompanyInput, UpdateCompanyInput } from '../models/company';
import axios from 'axios';
import { apiClient } from 'src/services/apiClient';

interface CompanyApiResponse<T> {
  success: boolean;
  message?: string;
  data: T | null;
  errors?: Array<{ message: string }>;
}

type CompanyApiRecord = Record<string, unknown>;

export interface CompanyRepository {
  getAllCompanies(): Promise<Company[]>;
  getCompanyById(id: string): Promise<Company | null>;
  createCompany(input: CreateCompanyInput): Promise<Company | null>;
  updateCompany(id: string, input: UpdateCompanyInput): Promise<Company | null>;
  deleteCompany(id: string): Promise<boolean>;
}

function ensureApiConfigured(): void {
  if (!apiClient.defaults.baseURL) {
    throw new Error('VITE_API_BASE_URL no está configurada.');
  }
}

export async function getAllCompanies(): Promise<Company[]> {
  ensureApiConfigured();
  return withApiErrors(async () => {
    const response = await apiClient.get<CompanyApiResponse<unknown[]>>('/companies');
    if (response.data.success === false) {
      throw new Error(response.data.message ?? 'El API no pudo cargar las empresas.');
    }
    if (!Array.isArray(response.data.data)) {
      throw new Error('El API devolvió una lista de empresas con formato inválido.');
    }
    return response.data.data.map(mapCompany);
  });
}

export async function getCompanyById(id: string): Promise<Company | null> {
  ensureApiConfigured();
  return withApiErrors(async () => {
    const response = await apiClient.get<CompanyApiResponse<unknown>>(
      `/companies/${encodeURIComponent(id)}`,
    );
    return response.data.data ? mapCompany(response.data.data) : null;
  });
}

export async function createCompany(input: CreateCompanyInput): Promise<Company | null> {
  ensureApiConfigured();
  const { databaseName, ...companyFields } = input;
  return withApiErrors(async () => {
    const response = await apiClient.post<CompanyApiResponse<unknown>>('/companies', {
      ...companyFields,
      status: 'ACTIVE',
      configJson: databaseName
        ? { ...input.configJson, databaseName }
        : input.configJson,
    });
    return response.data.data ? mapCompany(response.data.data) : null;
  });
}

export async function updateCompany(id: string, input: UpdateCompanyInput): Promise<Company | null> {
  ensureApiConfigured();
  const { databaseName, ...companyFields } = input;
  return withApiErrors(async () => {
    const response = await apiClient.patch<CompanyApiResponse<unknown>>(
      `/companies/${encodeURIComponent(id)}`,
      { ...companyFields, configJson: { ...input.configJson, databaseName } },
    );
    return response.data.data ? mapCompany(response.data.data) : null;
  });
}

export async function deleteCompany(id: string): Promise<boolean> {
  ensureApiConfigured();
  return withApiErrors(async () => {
    const response = await apiClient.delete<CompanyApiResponse<unknown>>(
      `/companies/${encodeURIComponent(id)}`,
    );
    return response.data.success;
  });
}

function readField(record: CompanyApiRecord, ...names: string[]): unknown {
  return names.map((name) => record[name]).find((value) => value !== undefined && value !== null);
}

function parseConfigJson(value: unknown): Record<string, unknown> {
  if (typeof value === 'string') {
    try {
      const parsed: unknown = JSON.parse(value);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? parsed as Record<string, unknown>
        : {};
    } catch {
      return {};
    }
  }
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function mapCompany(value: unknown): Company {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('El API devolvió una empresa con formato inválido.');
  }

  const record = value as CompanyApiRecord;
  const configJson = parseConfigJson(readField(record, 'configJson', 'config_json', 'config'));
  const id = readField(record, 'id', 'guid');
  const name = readField(record, 'name');
  const code = readField(record, 'code');
  if (typeof id !== 'string' || typeof name !== 'string' || typeof code !== 'string') {
    throw new Error('La empresa recibida del API no incluye guid, name y code.');
  }

  const shortName = readField(record, 'shortName', 'short_name');
  const databaseName = readField(record, 'databaseName', 'database_name') ?? configJson.databaseName;
  const status = readField(record, 'status');
  const timezone = readField(record, 'timezone');
  const locale = readField(record, 'locale');

  return {
    id,
    name,
    shortName: typeof shortName === 'string' ? shortName : name,
    code,
    databaseName: typeof databaseName === 'string' ? databaseName : '',
    status: status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
    logo: typeof record.logo === 'string' ? record.logo : '/kind-logo.png',
    timezone: typeof timezone === 'string' ? timezone : 'UTC',
    locale: locale === 'en' ? 'en' : 'es',
    configJson,
  };
}

async function withApiErrors<T>(request: () => Promise<T>): Promise<T> {
  try {
    return await request();
  } catch (error) {
    if (axios.isAxiosError<CompanyApiResponse<unknown>>(error)) {
      const response = error.response?.data;
      const message = response?.errors?.[0]?.message ?? response?.message;
      if (message) throw new Error(message);
    }
    throw error;
  }
}

export interface CompanyDatabaseResult {
  companyGuid: string;
  databaseName: string;
  created: boolean;
}

export async function createCompanyDatabase(companyGuid: string): Promise<CompanyDatabaseResult> {
  ensureApiConfigured();
  return withApiErrors(async () => {
    const response = await apiClient.post<CompanyApiResponse<CompanyDatabaseResult>>(
      `/companies/${encodeURIComponent(companyGuid)}/database`,
    );
    if (response.status !== 200) {
      throw new Error(`La API respondió con HTTP ${response.status} al verificar la base de datos.`);
    }
    if (!response.data.data) {
      throw new Error(response.data.message ?? 'El API no devolvió el resultado de la base de datos.');
    }
    return response.data.data;
  });
}