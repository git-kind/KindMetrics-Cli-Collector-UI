import type { Company, CreateCompanyInput } from '../../models/company';
import type { CompanyRepository } from '../company.repository';

const companies: Company[] = [
  {
    id: '7f8c2a91-4f12-4a6d-b123-9c1e8d7f1234',
    code: 'PATITO-FEO',
    name: 'PatitoFeo',
    databaseName: 'KindMetrics_PatitoFeo',
    status: 'ACTIVE',
    logo: '/kind-logo.png',
  },
  {
    id: '24b89cf3-8866-4c6b-85c7-b6103e5ec0d1',
    code: 'RUFUS',
    name: 'Rufus',
    databaseName: 'KindMetrics_Rufus',
    status: 'ACTIVE',
    logo: '/kind-logo.png',
  },
  {
    id: 'a4f8538e-7c60-49d1-bbf0-59028f3d6ac2',
    code: 'SAXOFON',
    name: 'Saxofon',
    databaseName: 'KindMetrics_Saxofon',
    status: 'ACTIVE',
    logo: '/kind-logo.png',
  },
];

const delay = () => new Promise<void>((resolve) => setTimeout(resolve, 150));

export class MockCompanyRepository implements CompanyRepository {
  async list(): Promise<Company[]> {
    await delay();
    return companies.map((company) => ({ ...company }));
  }

  async getById(id: string): Promise<Company | null> {
    await delay();
    const company = companies.find((item) => item.id.toLowerCase() === id.trim().toLowerCase());
    return company ? { ...company } : null;
  }

  async create(input: CreateCompanyInput): Promise<Company | null> {
    await delay();
    const normalizedCode = input.code.trim().toLowerCase();
    const normalizedDatabase = input.databaseName.trim().toLowerCase();
    const duplicate = companies.some(
      (company) =>
        company.code.toLowerCase() === normalizedCode ||
        company.databaseName.toLowerCase() === normalizedDatabase,
    );
    if (duplicate) return null;

    const company: Company = {
      ...input,
      id: globalThis.crypto.randomUUID(),
      name: input.name.trim(),
      code: input.code.trim(),
      databaseName: input.databaseName.trim(),
      status: 'ACTIVE',
      logo: '/kind-logo.png',
    };
    companies.push(company);
    return { ...company };
  }
}

export const mockCompanyRepository = new MockCompanyRepository();