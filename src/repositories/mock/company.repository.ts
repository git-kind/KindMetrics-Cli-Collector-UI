import type { Company, CreateCompanyInput, UpdateCompanyInput } from '../../models/company';
import type { CompanyRepository } from '../company.repository';

const companyStorageKey = 'kindmetrics.mock.companies';

const seedCompanies: Company[] = [
  {
    id: '7f8c2a91-4f12-4a6d-b123-9c1e8d7f1234',
    code: 'PATITO-FEO',
    name: 'PatitoFeo',
    shortName: 'Patito',
    databaseName: 'KindMetrics_PatitoFeo',
    status: 'ACTIVE',
    logo: '/kind-logo.png',
    timezone: 'UTC',
    locale: 'es',
    configJson: { databaseName: 'KindMetrics_PatitoFeo' },
  },
  {
    id: '24b89cf3-8866-4c6b-85c7-b6103e5ec0d1',
    code: 'RUFUS',
    name: 'Rufus',
    shortName: 'Rufus',
    databaseName: 'KindMetrics_Rufus',
    status: 'ACTIVE',
    logo: '/kind-logo.png',
    timezone: 'UTC',
    locale: 'es',
    configJson: { databaseName: 'KindMetrics_Rufus' },
  },
  {
    id: 'a4f8538e-7c60-49d1-bbf0-59028f3d6ac2',
    code: 'SAXOFON',
    name: 'Saxofon',
    shortName: 'Saxo',
    databaseName: 'KindMetrics_Saxofon',
    status: 'ACTIVE',
    logo: '/kind-logo.png',
    timezone: 'UTC',
    locale: 'es',
    configJson: { databaseName: 'KindMetrics_Saxofon' },
  },
];

function readCompanies(): Company[] {
  try {
    const savedCompanies = localStorage.getItem(companyStorageKey);
    if (savedCompanies) {
      const storedCompanies = JSON.parse(savedCompanies) as Array<Partial<Company> & Pick<Company, 'id' | 'code' | 'name'>>;
      return storedCompanies.map((company) => ({
        ...company,
        shortName: company.shortName ?? company.code ?? company.name,
        databaseName: company.databaseName ?? String(company.configJson?.databaseName ?? ''),
        status: company.status ?? 'ACTIVE',
        logo: company.logo ?? '/kind-logo.png',
        timezone: company.timezone ?? 'UTC',
        locale: company.locale ?? 'es',
        configJson: company.configJson ?? {},
      }));
    }
  } catch {
    localStorage.removeItem(companyStorageKey);
  }
  return seedCompanies.map((company) => ({ ...company }));
}

const companies = readCompanies();

function persistCompanies(): void {
  localStorage.setItem(companyStorageKey, JSON.stringify(companies));
}

const delay = () => new Promise<void>((resolve) => setTimeout(resolve, 150));

export class MockCompanyRepository implements CompanyRepository {
  async getAllCompanies(): Promise<Company[]> {
    await delay();
    return companies.map((company) => ({ ...company }));
  }

  async getCompanyById(id: string): Promise<Company | null> {
    await delay();
    const company = companies.find((item) => item.id.toLowerCase() === id.trim().toLowerCase());
    return company ? { ...company } : null;
  }

  async createCompany(input: CreateCompanyInput): Promise<Company | null> {
    await delay();
    const normalizedCode = input.code.trim().toLowerCase();
    const normalizedDatabase = input.databaseName?.trim().toLowerCase();
    const duplicate = companies.some(
      (company) =>
        company.code.toLowerCase() === normalizedCode ||
        (!!normalizedDatabase && company.databaseName.toLowerCase() === normalizedDatabase),
    );
    if (duplicate) return null;

    const company: Company = {
      ...input,
      id: globalThis.crypto.randomUUID(),
      name: input.name.trim(),
      shortName: input.shortName.trim(),
      code: input.code.trim(),
      databaseName: input.databaseName?.trim() ?? '',
      status: 'ACTIVE',
      logo: '/kind-logo.png',
      timezone: input.timezone,
      locale: input.locale,
      configJson: input.databaseName?.trim()
        ? { ...input.configJson, databaseName: input.databaseName.trim() }
        : input.configJson,
    };
    companies.push(company);
    persistCompanies();
    return { ...company };
  }

  async updateCompany(id: string, input: UpdateCompanyInput): Promise<Company | null> {
    await delay();
    const index = companies.findIndex((item) => item.id.toLowerCase() === id.trim().toLowerCase());
    if (index < 0) return null;
    const existingCompany = companies[index];
    if (!existingCompany) return null;

    const normalizedCode = input.code.trim().toLowerCase();
    const normalizedDatabase = input.databaseName.trim().toLowerCase();
    const duplicate = companies.some(
      (company, companyIndex) => companyIndex !== index && (
        company.code.toLowerCase() === normalizedCode
        || company.databaseName.toLowerCase() === normalizedDatabase
      ),
    );
    if (duplicate) return null;

    const updatedCompany: Company = {
      ...existingCompany,
      name: input.name.trim(),
      shortName: input.shortName.trim(),
      code: input.code.trim(),
      databaseName: input.databaseName.trim(),
      status: input.status,
      timezone: input.timezone,
      locale: input.locale,
      configJson: { ...input.configJson, databaseName: input.databaseName.trim() },
    };
    companies[index] = updatedCompany;
    persistCompanies();
    return { ...updatedCompany };
  }

  async deleteCompany(id: string): Promise<boolean> {
    await delay();
    const index = companies.findIndex((item) => item.id.toLowerCase() === id.trim().toLowerCase());
    if (index < 0) return false;
    companies.splice(index, 1);
    persistCompanies();
    return true;
  }
}

export const mockCompanyRepository = new MockCompanyRepository();