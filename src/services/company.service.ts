import type { Company, CreateCompanyInput, CreateCompanyResult } from '../models/company';
import { mockCompanyRepository } from '../repositories/mock/company.repository';
import type { CompanyRepository } from '../repositories/company.repository';

export class CompanyService {
  constructor(private readonly repository: CompanyRepository) {}

  listCompanies(): Promise<Company[]> {
    return this.repository.list();
  }

  getCompany(id: string): Promise<Company | null> {
    return this.repository.getById(id);
  }

  async createCompany(input: CreateCompanyInput): Promise<CreateCompanyResult> {
    const normalized = {
      name: input.name.trim(),
      code: input.code.trim(),
      databaseName: input.databaseName.trim(),
    };
    if (!normalized.name || !normalized.code || !normalized.databaseName) {
      return { success: false, reason: 'required' };
    }

    const company = await this.repository.create(normalized);
    return company
      ? { success: true, company }
      : { success: false, reason: 'duplicate' };
  }
}

export const companyService = new CompanyService(mockCompanyRepository);