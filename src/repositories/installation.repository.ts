import type {
  ConnectionTestResult,
  InstallationConfiguration,
  InstallationMode,
  InstallationStatus,
} from '../models/installation';

export interface InstallationRepository {
  getStatus(): Promise<InstallationStatus>;
  getMode(): Promise<InstallationMode | null>;
  setMode(mode: InstallationMode): Promise<void>;
  getConfiguredCompanyId(): Promise<string | null>;
  getConfiguredDatabaseName(): Promise<string | null>;
  testConnection(database: InstallationConfiguration['database']): Promise<ConnectionTestResult>;
  saveConfiguration(configuration: InstallationConfiguration): Promise<boolean>;
}
