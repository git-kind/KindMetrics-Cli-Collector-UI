import type { Company, CreateCompanyInput } from '../models/company';

export interface CompanyRepository {
  list(): Promise<Company[]>;
  getById(id: string): Promise<Company | null>;
  create(input: CreateCompanyInput): Promise<Company | null>;
}