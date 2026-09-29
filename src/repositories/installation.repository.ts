import type {
  ConnectionTestResult,
  InstallationCompany,
  InstallationConfiguration,
  InstallationStatus,
} from '../models/installation';

export interface InstallationRepository {
  getStatus(): Promise<InstallationStatus>;
  findCompany(companyId: string): Promise<InstallationCompany | null>;
  testConnection(database: InstallationConfiguration['database']): Promise<ConnectionTestResult>;
  saveConfiguration(configuration: InstallationConfiguration): Promise<boolean>;
}
