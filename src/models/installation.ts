export type InstallationStatus = 'NOT_CONFIGURED' | 'CONFIGURED' | 'ERROR';
export type InstallationMode = 'CUSTOMER' | 'KIND';
export type ConnectionTestState = 'idle' | 'testing' | 'success' | 'error';

export interface InstallationCompany {
  id: string;
  code: string;
  name: string;
  databaseName: string;
}

export interface DatabaseConfiguration {
  databaseName: string;
}

export interface InstallationConfiguration {
  companyId: string;
  database: DatabaseConfiguration;
}

export interface ConnectionTestResult {
  success: boolean;
  messageKey: 'installation.connection.success' | 'installation.connection.error';
}
