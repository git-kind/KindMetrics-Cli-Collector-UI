import type {
  ConnectionTestResult,
  InstallationCompany,
  InstallationConfiguration,
  InstallationStatus,
} from '../models/installation';
import { mockInstallationRepository } from '../repositories/mock/installation.repository';
import type { InstallationRepository } from '../repositories/installation.repository';

const companyIdPattern = /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i;

export class InstallationService {
  constructor(private readonly repository: InstallationRepository) {}

  getStatus(): Promise<InstallationStatus> {
    return this.repository.getStatus();
  }

  async findCompany(companyId: string): Promise<InstallationCompany | null> {
    const normalizedId = companyId.trim();
    if (!companyIdPattern.test(normalizedId)) return null;
    return this.repository.findCompany(normalizedId);
  }

  testConnection(configuration: InstallationConfiguration['database']): Promise<ConnectionTestResult> {
    return this.repository.testConnection(configuration);
  }

  saveConfiguration(configuration: InstallationConfiguration): Promise<boolean> {
    return this.repository.saveConfiguration(configuration);
  }
}

export const installationService = new InstallationService(mockInstallationRepository);