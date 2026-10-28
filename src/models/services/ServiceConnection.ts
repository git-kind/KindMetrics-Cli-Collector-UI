export type ServiceConnectionType =
  | 'REST_API'
  | 'SNMP'
  | 'WEBHOOK'
  | 'MICROSOFT_TEAMS'
  | 'MICROSOFT_OUTLOOK'
  | 'WEBEX'
  | 'ZOOM';

export interface ServiceConnection {
  id: string;
  serviceId: string;
  type: ServiceConnectionType;
  host?: string;
  port?: number;
  url?: string;
  timeout?: number;
  retries?: number;
  tenantId?: string;
  clientId?: string;
  scopes?: string[];
  route?: string;
  signatureType?: string;
  createdAt: string;
  updatedAt: string;
}
