export type InstallationStatus = 'NOT_CONFIGURED' | 'CONFIGURED' | 'ERROR';
export type ConnectionTestState = 'idle' | 'testing' | 'success' | 'error';

export interface InstallationCompany {
  id: string;
  code: string;
  name: string;
}

export interface DatabaseConfiguration {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
}

export interface InstallationConfiguration {
  companyId: string;
  database: DatabaseConfiguration;
}

export interface ConnectionTestResult {
  success: boolean;
  messageKey: 'installation.connection.success' | 'installation.connection.error';
}
