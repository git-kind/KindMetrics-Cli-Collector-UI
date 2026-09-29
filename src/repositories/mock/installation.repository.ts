import type {
  ConnectionTestResult,
  InstallationCompany,
  InstallationConfiguration,
  InstallationStatus,
} from '../../models/installation';
import type { InstallationRepository } from '../installation.repository';

const mockCompany: InstallationCompany = {
  id: '7f8c2a91-4f12-4a6d-b123-9c1e8d7f1234',
  code: 'KIND-DEMO',
  name: 'KindMetrics Demo Company',
};

function getInitialStatus(): InstallationStatus {
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

  async findCompany(companyId: string): Promise<InstallationCompany | null> {
    await delay();
    return companyId.toLowerCase() === mockCompany.id ? { ...mockCompany } : null;
  }

  async testConnection(
    database: InstallationConfiguration['database'],
  ): Promise<ConnectionTestResult> {
    await delay();
    const shouldFail = database.host.trim().toLowerCase() === 'connection-error';
    this.validatedDatabase = shouldFail ? null : { ...database };
    this.status = shouldFail ? 'ERROR' : 'NOT_CONFIGURED';

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
    this.validatedDatabase = null;
    return true;
  }
}

export const mockInstallationRepository = new MockInstallationRepository();