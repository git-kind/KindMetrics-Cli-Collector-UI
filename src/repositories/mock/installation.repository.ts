import type {
  ConnectionTestResult,
  InstallationConfiguration,
  InstallationMode,
  InstallationStatus,
} from '../../models/installation';
import type { InstallationRepository } from '../installation.repository';

const modeKey = 'kindmetrics.installation.mode';
const statusKey = 'kindmetrics.installation.status';
const customerCompanyKey = 'kindmetrics.installation.companyId';
const customerDatabaseKey = 'kindmetrics.installation.databaseName';

function getInitialStatus(): InstallationStatus {
  const savedStatus = localStorage.getItem(statusKey);
  if (savedStatus === 'CONFIGURED' || savedStatus === 'ERROR') return savedStatus;
  const requestedStatus = new URLSearchParams(globalThis.location?.search ?? '').get(
    'mockInstallation',
  );
  if (requestedStatus === 'CONFIGURED' || requestedStatus === 'ERROR') return requestedStatus;
  return 'NOT_CONFIGURED';
}

const delay = () => new Promise<void>((resolve) => setTimeout(resolve, 250));

export class MockInstallationRepository implements InstallationRepository {
  private status = getInitialStatus();
  private validatedDatabase: InstallationConfiguration['database'] | null = null;

  async getStatus(): Promise<InstallationStatus> {
    return this.status;
  }

  async getMode(): Promise<InstallationMode | null> {
    const mode = localStorage.getItem(modeKey);
    return mode === 'CUSTOMER' || mode === 'KIND' ? mode : null;
  }

  async setMode(mode: InstallationMode): Promise<void> {
    localStorage.setItem(modeKey, mode);
  }

  async getConfiguredCompanyId(): Promise<string | null> {
    return localStorage.getItem(customerCompanyKey);
  }

  async getConfiguredDatabaseName(): Promise<string | null> {
    return localStorage.getItem(customerDatabaseKey);
  }

  async testConnection(
    database: InstallationConfiguration['database'],
  ): Promise<ConnectionTestResult> {
    await delay();
    const shouldFail = database.databaseName.trim().length === 0;
    this.validatedDatabase = shouldFail ? null : { ...database };
    this.status = shouldFail ? 'ERROR' : 'NOT_CONFIGURED';
    localStorage.setItem(statusKey, this.status);

    return {
      success: !shouldFail,
      messageKey: shouldFail ? 'installation.connection.error' : 'installation.connection.success',
    };
  }

  async saveConfiguration(configuration: InstallationConfiguration): Promise<boolean> {
    await delay();
    const wasTested =
      this.validatedDatabase !== null &&
      JSON.stringify(this.validatedDatabase) === JSON.stringify(configuration.database);
    if (!wasTested) {
      this.status = 'ERROR';
      return false;
    }

    this.status = 'CONFIGURED';
    localStorage.setItem(statusKey, this.status);
    localStorage.setItem(customerCompanyKey, configuration.companyId);
    localStorage.setItem(customerDatabaseKey, configuration.database.databaseName);
    this.validatedDatabase = null;
    return true;
  }
}

export const mockInstallationRepository = new MockInstallationRepository();