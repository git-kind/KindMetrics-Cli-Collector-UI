export type ServiceType =
  | 'REST_API'
  | 'SNMP'
  | 'WEBHOOK'
  | 'MICROSOFT_TEAMS'
  | 'MICROSOFT_OUTLOOK'
  | 'WEBEX'
  | 'ZOOM';

export type ServiceAuthType =
  | 'NONE'
  | 'BASIC'
  | 'API_KEY'
  | 'BEARER'
  | 'OAUTH2'
  | 'SNMP_COMMUNITY'
  | 'SNMPV3_USM'
  | 'MTLS'
  | 'HMAC';

export type ServiceStatus = 'ACTIVE' | 'INACTIVE';

export interface ServiceTypeCatalogItem {
  id: number;
  code: ServiceType;
  name: string;
}

export interface ServiceDriver {
  id: string;
  code: string;
  name: string;
  type: ServiceType;
  enabled: boolean;
}

export interface ServiceConnectionConfig {
  host?: string;
  port?: number;
  timeout?: number;
  retries?: number;
  url?: string;
  method?: string;
  tenantId?: string;
  clientId?: string;
  scopes?: string[];
  route?: string;
  signatureType?: string;
  [key: string]: unknown;
}

export interface ServiceParameter {
  id: string;
  key: string;
  value: string | number | boolean | Record<string, unknown> | null;
  type: 'string' | 'number' | 'boolean' | 'json';
}

export interface Service {
  id: string;
  code: string;
  name: string;
  description: string | null;
  type: ServiceType;
  driver: string;
  authType: ServiceAuthType;
  status: ServiceStatus;
  enabled: boolean;
  connectionConfig: ServiceConnectionConfig | Record<string, unknown> | null;
  additionalParameters: ServiceParameter[];
  createdAt: string;
  updatedAt: string;
}

export interface ServiceFormDraft {
  code: string;
  name: string;
  description: string;
  type: ServiceType;
  serviceTypeId: number | null;
  authType: ServiceAuthType;
  status: ServiceStatus;
  enabled: boolean;
  connectionConfig: Record<string, unknown>;
  additionalParameters: ServiceParameter[];
}

export interface ServiceFilters {
  search: string;
  type: ServiceType | '';
  status: ServiceStatus | '';
}

export interface ServiceUsage {
  id: string;
  collectorName: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface ServiceConnectionTestResult {
  success: boolean;
  status: 'SUCCESS' | 'FAILED' | 'NOT_SUPPORTED';
  message: string;
  testedAt: string;
}

export const serviceAuthOptions: Array<{ value: ServiceAuthType; label: string }> = [
  { value: 'NONE', label: 'None' },
  { value: 'BASIC', label: 'Basic' },
  { value: 'API_KEY', label: 'API Key' },
  { value: 'BEARER', label: 'Bearer' },
  { value: 'OAUTH2', label: 'OAuth 2.0' },
  { value: 'SNMP_COMMUNITY', label: 'SNMP Community' },
  { value: 'SNMPV3_USM', label: 'SNMPv3 USM' },
  { value: 'MTLS', label: 'mTLS' },
  { value: 'HMAC', label: 'HMAC' },
];
