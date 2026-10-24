import type { Company, CreateCompanyInput, CreateCompanyResult, UpdateCompanyInput } from '../models/company';
import {
  createCompany as createCompanyRepository,
  createCompanyDatabase as createCompanyDatabaseRepository,
  deleteCompany as deleteCompanyRepository,
  getAllCompanies,
  getCompanyById,
  updateCompany as updateCompanyRepository,
} from '../repositories/company.repository';

export class CompanyService {
  listCompanies(): Promise<Company[]> {
    return getAllCompanies();
  }

  getCompany(id: string): Promise<Company | null> {
    return getCompanyById(id);
  }

  createCompanyDatabase(companyGuid: string) {
    return createCompanyDatabaseRepository(companyGuid);
  }

  async createCompany(input: CreateCompanyInput): Promise<CreateCompanyResult> {
    const normalized = {
      name: input.name.trim(),
      shortName: input.shortName.trim(),
      code: input.code.trim(),
      databaseName: input.databaseName?.trim() ?? '',
      timezone: input.timezone.trim() || 'UTC',
      locale: input.locale,
      configJson: input.databaseName?.trim()
        ? { ...input.configJson, databaseName: input.databaseName.trim() }
        : input.configJson,
    };
    if (!normalized.name || !normalized.shortName || !normalized.code) {
      return { success: false, reason: 'required' };
    }

    const company = await createCompanyRepository(normalized);
    return company
      ? { success: true, company }
      : { success: false, reason: 'duplicate' };
  }

  async updateCompany(id: string, input: UpdateCompanyInput): Promise<CreateCompanyResult> {
    const normalized = {
      name: input.name.trim(),
      shortName: input.shortName.trim(),
      code: input.code.trim(),
      databaseName: input.databaseName.trim(),
      timezone: input.timezone.trim() || 'UTC',
      locale: input.locale,
      configJson: { ...input.configJson, databaseName: input.databaseName.trim() },
      status: input.status,
    };
    if (!normalized.name || !normalized.shortName || !normalized.code || !normalized.databaseName) {
      return { success: false, reason: 'required' };
    }

    const company = await updateCompanyRepository(id, normalized);
    return company
      ? { success: true, company }
      : { success: false, reason: 'duplicate' };
  }

  deleteCompany(id: string): Promise<boolean> {
    return deleteCompanyRepository(id);
  }
}

export const companyService = new CompanyService();