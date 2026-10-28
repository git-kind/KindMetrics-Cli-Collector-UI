export type ServiceDriverType = 'REST_API' | 'SNMP' | 'WEBHOOK' | 'MICROSOFT_TEAMS' | 'MICROSOFT_OUTLOOK' | 'WEBEX' | 'ZOOM';

export interface ServiceDriverDefinition {
  id: string;
  code: string;
  name: string;
  type: ServiceDriverType;
  enabled: boolean;
}
