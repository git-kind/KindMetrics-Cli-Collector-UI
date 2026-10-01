import type {
  ExtractionAvailableData,
  ExtractionConnectionTestResult,
  ExtractionMethod,
  ExtractionMethodInput,
  ExtractionMethodType,
} from '../../models/extraction-method';
import type { ExtractionMethodRepository } from '../extraction-method.repository';

const companySeedId = '7f8c2a91-4f12-4a6d-b123-9c1e8d7f1234';
const now = '2026-09-30T08:00:00.000Z';
const available = (id: string, name: string, source: string): ExtractionAvailableData => ({
  id,
  name,
  description: name,
  source,
  status: 'AVAILABLE',
});

const templates: Omit<ExtractionMethod, 'companyId'>[] = [
  {
    id: 'method-snmp-cisco', name: 'Cisco C9300-01', type: 'SNMP', description: 'Cisco IOS-XE device telemetry.',
    status: 'ACTIVE', connection: { host: '192.168.10.50', port: 161, version: 'v2c', community: 'public' },
    target: { kind: 'DEVICE', name: 'Cisco C9300' },
    discovery: { status: 'COMPLETED', completedAt: now, definitionId: 'def-ios-xe', definitionName: 'Cisco IOS-XE', device: { name: 'Cisco C9300', manufacturer: 'Cisco', model: 'C9300', operatingSystem: 'IOS-XE', version: '17.x', sysObjectID: '1.3.6.1.4.1.9.1.2494', sysDescr: 'Cisco IOS XE Software, Version 17.x' }, resources: [] },
    availableData: [available('cisco-cpu', 'CPU', 'SNMP'), available('cisco-memory', 'Memory', 'SNMP'), available('cisco-interfaces', 'Interfaces', 'SNMP'), available('cisco-temperature', 'Temperature', 'SNMP'), available('cisco-ifName', 'ifName', 'SNMP'), available('cisco-ifAlias', 'ifAlias', 'SNMP'), available('cisco-ifOperStatus', 'ifOperStatus', 'SNMP'), available('cisco-ifInOctets', 'ifInOctets', 'SNMP'), available('cisco-ifOutOctets', 'ifOutOctets', 'SNMP')],
    createdAt: now, updatedAt: now,
  },
  {
    id: 'method-snmp-audiocodes', name: 'AudioCodes 2345', type: 'SNMP', description: 'AudioCodes SBC statistics.',
    status: 'ACTIVE', connection: { host: '192.168.10.60', port: 161, version: 'v2c', community: 'public' },
    target: { kind: 'DEVICE', name: 'AudioCodes 2345' },
    discovery: { status: 'COMPLETED', completedAt: now, definitionId: null, definitionName: null, device: { name: 'AudioCodes 2345', manufacturer: 'AudioCodes', model: 'Mediant 2345', operatingSystem: 'Mediant OS', version: '7.x' }, resources: [] },
    availableData: [available('audiocodes-calls', 'Calls', 'SNMP'), available('audiocodes-channels', 'Channels', 'SNMP'), available('audiocodes-cpu', 'CPU', 'SNMP'), available('audiocodes-memory', 'Memory', 'SNMP')],
    createdAt: now, updatedAt: now,
  },
  {
    id: 'method-api-voca', name: 'Voca 2223', type: 'API', description: 'Voca service API.',
    status: 'ACTIVE', connection: { url: 'https://api.voca.example', port: 443, authentication: 'Bearer Token', token: 'mock-token', timeout: 30 },
    target: { kind: 'ENDPOINT', name: 'Voca 2223' },
    discovery: { status: 'COMPLETED', completedAt: now, resources: ['Endpoints', 'Resources', 'Fields'] },
    availableData: [available('voca-calls', 'Calls', 'API'), available('voca-users', 'Users', 'API'), available('voca-statistics', 'Statistics', 'API')],
    createdAt: now, updatedAt: now,
  },
  {
    id: 'method-graph-patito', name: 'Patito', type: 'MICROSOFT_GRAPH', description: 'Microsoft Graph tenant resources.',
    status: 'ACTIVE', connection: { tenantId: 'tenant-patito', clientId: 'client-patito', authentication: 'Client credentials', scopes: 'Team.ReadBasic.All Channel.ReadBasic.All' },
    target: { kind: 'SERVICE', name: 'Microsoft Graph' },
    discovery: { status: 'COMPLETED', completedAt: now, resources: ['Teams', 'Channels', 'Users', 'Members', 'Messages'] },
    availableData: [available('graph-teams', 'Teams', 'MICROSOFT_GRAPH'), available('graph-channels', 'Channels', 'MICROSOFT_GRAPH'), available('graph-users', 'Users', 'MICROSOFT_GRAPH'), available('graph-messages', 'Messages', 'MICROSOFT_GRAPH')],
    createdAt: now, updatedAt: now,
  },
  {
    id: 'method-webhook-telephony', name: 'Eventos Telefonía', type: 'WEBHOOK', description: 'Inbound telephony event format (Mock only).',
    status: 'ACTIVE', connection: { endpoint: '/mock/webhooks/telephony', method: 'POST', headers: 'Content-Type: application/json', contentType: 'application/json', payloadFormat: 'JSON' },
    target: { kind: 'EVENT_SOURCE', name: 'Telefonía' },
    discovery: { status: 'CONFIGURED', completedAt: null, resources: ['Payload'] },
    availableData: [available('webhook-eventId', 'EventId', 'WEBHOOK'), available('webhook-eventType', 'EventType', 'WEBHOOK'), available('webhook-timestamp', 'Timestamp', 'WEBHOOK'), available('webhook-data', 'Data', 'WEBHOOK')],
    createdAt: now, updatedAt: now,
  },
];

const records = new Map<string, ExtractionMethod[]>([[companySeedId, templates.map((method) => ({ ...method, companyId: companySeedId }))]]);
const seededCompanies = new Set([companySeedId]);
let nextId = 1;
const delay = () => new Promise<void>((resolve) => setTimeout(resolve, 100));
const clone = <Value>(value: Value): Value => JSON.parse(JSON.stringify(value)) as Value;
const typeOptions: ExtractionMethodType[] = ['SNMP', 'API', 'MICROSOFT_GRAPH', 'WEBHOOK'];

function ensureCompany(companyId: string): ExtractionMethod[] {
  if (!seededCompanies.has(companyId)) {
    records.set(companyId, templates.map((method) => ({ ...clone(method), companyId })));
    seededCompanies.add(companyId);
  }
  return records.get(companyId) ?? [];
}

export class MockExtractionMethodRepository implements ExtractionMethodRepository {
  async list(companyId: string): Promise<ExtractionMethod[]> {
    await delay();
    return clone(ensureCompany(companyId));
  }

  async getById(companyId: string, id: string): Promise<ExtractionMethod | null> {
    await delay();
    const method = ensureCompany(companyId).find((item) => item.id === id);
    return method ? clone(method) : null;
  }

  async create(companyId: string, value: ExtractionMethodInput): Promise<ExtractionMethod | null> {
    await delay();
    const methods = ensureCompany(companyId);
    if (methods.some((item) => item.type === value.type && item.name.toLowerCase() === value.name.trim().toLowerCase())) return null;
    const timestamp = new Date().toISOString();
    const method: ExtractionMethod = {
      ...clone(value), id: `method-${Date.now()}-${nextId++}`, companyId, name: value.name.trim(),
      description: value.description.trim(), status: 'ACTIVE', target: null,
      discovery: { status: 'CONFIGURED', completedAt: null, resources: [] }, availableData: [],
      createdAt: timestamp, updatedAt: timestamp,
    };
    methods.push(method);
    return clone(method);
  }

  async update(companyId: string, id: string, value: ExtractionMethodInput): Promise<ExtractionMethod | null> {
    await delay();
    const methods = ensureCompany(companyId);
    const index = methods.findIndex((item) => item.id === id);
    if (index < 0) return null;
    const current = methods[index];
    if (!current) return null;
    const duplicate = methods.some((item) => item.id !== id && item.type === value.type && item.name.toLowerCase() === value.name.trim().toLowerCase());
    if (duplicate) return null;
    methods[index] = { ...current, ...clone(value), name: value.name.trim(), description: value.description.trim(), updatedAt: new Date().toISOString() };
    return clone(methods[index] as ExtractionMethod);
  }

  async delete(companyId: string, id: string): Promise<boolean> {
    await delay();
    const methods = ensureCompany(companyId);
    const index = methods.findIndex((item) => item.id === id);
    if (index < 0) return false;
    methods.splice(index, 1);
    return true;
  }

  async testConnection(companyId: string, id: string): Promise<ExtractionConnectionTestResult> {
    await delay();
    const method = ensureCompany(companyId).find((item) => item.id === id);
    const success = !!method && method.connection.mockConnectionError !== true;
    return { success, messageKey: success ? 'extractionMethods.messages.connectionSuccess' : 'extractionMethods.messages.connectionError' };
  }

  async runDiscovery(companyId: string, id: string): Promise<ExtractionMethod | null> {
    await delay();
    const methods = ensureCompany(companyId);
    const method = methods.find((item) => item.id === id);
    if (!method) return null;
    const discoveryResources: Record<ExtractionMethodType, string[]> = {
      SNMP: ['CPU', 'Memory', 'Interfaces', 'Temperature'],
      API: ['Endpoints', 'Resources', 'Fields'],
      MICROSOFT_GRAPH: ['Teams', 'Channels', 'Users', 'Members', 'Messages'],
      WEBHOOK: ['EventId', 'EventType', 'Timestamp', 'Data'],
    };
    if (method.type === 'WEBHOOK') {
      method.discovery = { ...method.discovery, status: 'CONFIGURED', completedAt: null, resources: discoveryResources.WEBHOOK };
    } else {
      method.discovery = { ...method.discovery, status: 'COMPLETED', completedAt: new Date().toISOString(), resources: discoveryResources[method.type] };
      if (method.type === 'SNMP' && !method.discovery.device) {
        method.discovery.device = {
          name: method.name,
          manufacturer: 'Mock Manufacturer',
          model: 'Mock Device',
          operatingSystem: 'Mock OS',
          version: '1.0',
          sysObjectID: '1.3.6.1.4.1.99999.1',
          sysDescr: 'Mock SNMP device description',
        };
        method.target = { kind: 'DEVICE', name: method.name };
      }
      if (!method.availableData.length) method.availableData = discoveryResources[method.type].map((name) => available(`${method.id}-${name.toLowerCase().replace(/\W+/g, '-')}`, name, method.type));
    }
    method.updatedAt = new Date().toISOString();
    return clone(method);
  }

  async getAvailableData(companyId: string, methodIds: string[]): Promise<ExtractionAvailableData[]> {
    await delay();
    const methods = ensureCompany(companyId);
    return clone(methods.filter((method) => methodIds.includes(method.id)).flatMap((method) => method.availableData));
  }

  getTypeOptions(): ExtractionMethodType[] {
    return [...typeOptions];
  }
}

export const mockExtractionMethodRepository = new MockExtractionMethodRepository();