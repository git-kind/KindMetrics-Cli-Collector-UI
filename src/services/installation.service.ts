import type {
  ConnectionTestResult,
  InstallationCompany,
  InstallationConfiguration,
  InstallationMode,
  InstallationStatus,
} from '../models/installation';
import { mockInstallationRepository } from '../repositories/mock/installation.repository';
import type { InstallationRepository } from '../repositories/installation.repository';
import { companyService } from './company.service';

const companyIdPattern = /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i;

export class InstallationService {
  constructor(private readonly repository: InstallationRepository) {}

  getStatus(): Promise<InstallationStatus> {
    return this.repository.getStatus();
  }

  getMode(): Promise<InstallationMode | null> {
    return this.repository.getMode();
  }

  setMode(mode: InstallationMode): Promise<void> {
    return this.repository.setMode(mode);
  }

  getConfiguredCompanyId(): Promise<string | null> {
    return this.repository.getConfiguredCompanyId();
  }

  getConfiguredDatabaseName(): Promise<string | null> {
    return this.repository.getConfiguredDatabaseName();
  }

  async findCompany(companyId: string): Promise<InstallationCompany | null> {
    const normalizedId = companyId.trim();
    if (!companyIdPattern.test(normalizedId)) return null;
    const company = await companyService.getCompany(normalizedId);
    return company
      ? { id: company.id, code: company.code, name: company.name, databaseName: company.databaseName }
      : null;
  }

  testConnection(configuration: InstallationConfiguration['database']): Promise<ConnectionTestResult> {
    return this.repository.testConnection(configuration);
  }

  saveConfiguration(configuration: InstallationConfiguration): Promise<boolean> {
    return this.repository.saveConfiguration(configuration);
  }
}

export const installationService = new InstallationService(mockInstallationRepository);