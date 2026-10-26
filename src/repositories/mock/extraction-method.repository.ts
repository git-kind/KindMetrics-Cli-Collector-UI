import type {
  ExtractionMethod,
  ExtractionMethodInput,
} from 'src/models/extraction-method';
import type { ExtractionMethodRepository } from '../extraction-method.repository';

const timestamp = '2026-10-01T08:00:00.000Z';
let nextId = 20;

const methods: ExtractionMethod[] = [
  {
    id: '1', code: 'SNMP_V2', name: 'SNMP v2', description: 'Consulta SNMP v2c para dispositivos de red.',
    protocol: 'SNMP', configurationSchema: { version: 'v2c' }, isActive: true,
    createdAt: timestamp, updatedAt: timestamp,
    parameters: [{ id: '1', extractionMethodId: '1', parameterKey: 'community', dataType: 'STRING', defaultValue: null, isRequired: true, isSecret: true, description: 'SNMP community' }],
    requests: [{
      id: '1', extractionMethodId: '1', code: 'SYSTEM_INFO', name: 'System information', requestType: 'SNMP',
      requestConfig: { oid: '1.3.6.1.2.1.1' }, isActive: true,
      fields: [{ id: '1', requestId: '1', fieldKey: 'sysName', sourcePath: '1.3.6.1.2.1.1.5.0', dataType: 'STRING', unit: null, description: 'Device hostname' }],
    }],
    versions: [{ id: '1', extractionMethodId: '1', versionNumber: 1, definitionSnapshot: {}, createdAt: timestamp }],
  },
  {
    id: '2', code: 'REST_JSON', name: 'REST JSON', description: 'Consulta HTTP con respuesta JSON.',
    protocol: 'API', configurationSchema: { baseUrl: { type: 'STRING', required: true } }, isActive: true,
    createdAt: timestamp, updatedAt: timestamp,
    parameters: [{ id: '2', extractionMethodId: '2', parameterKey: 'baseUrl', dataType: 'STRING', defaultValue: null, isRequired: true, isSecret: false, description: 'API base URL' }],
    requests: [{
      id: '2', extractionMethodId: '2', code: 'GET_STATUS', name: 'Read status', requestType: 'HTTP',
      requestConfig: { method: 'GET', path: '/status' }, isActive: true,
      fields: [{ id: '2', requestId: '2', fieldKey: 'status', sourcePath: '$.status', dataType: 'STRING', unit: null, description: 'Service status' }],
    }],
    versions: [{ id: '2', extractionMethodId: '2', versionNumber: 1, definitionSnapshot: {}, createdAt: timestamp }],
  },
];

const clone = <Value>(value: Value): Value => JSON.parse(JSON.stringify(value)) as Value;
const delay = () => new Promise<void>((resolve) => setTimeout(resolve, 80));

function hasDuplicate(value: ExtractionMethodInput, exceptId?: string): boolean {
  return methods.some((method) => method.id !== exceptId && method.code.toLowerCase() === value.code.trim().toLowerCase());
}

function materialize(value: ExtractionMethodInput, id: string, current?: ExtractionMethod): ExtractionMethod {
  const methodId = id;
  return {
    id: methodId,
    code: value.code.trim(),
    name: value.name.trim(),
    description: value.description?.trim() || null,
    protocol: value.protocol,
    configurationSchema: value.configurationSchema ? clone(value.configurationSchema) : null,
    isActive: value.isActive,
    createdAt: current?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    parameters: value.parameters.map((parameter, index) => ({
      ...clone(parameter),
      id: current?.parameters[index]?.id ?? String(nextId++),
      extractionMethodId: methodId,
    })),
    requests: value.requests.map((request, requestIndex) => {
      const requestId = current?.requests[requestIndex]?.id ?? String(nextId++);
      return {
        ...clone(request),
        id: requestId,
        extractionMethodId: methodId,
        fields: request.fields.map((field, fieldIndex) => ({
          ...clone(field),
          id: current?.requests[requestIndex]?.fields[fieldIndex]?.id ?? String(nextId++),
          requestId,
        })),
      };
    }),
    versions: [
      ...(current?.versions ?? []),
      {
        id: String(nextId++),
        extractionMethodId: methodId,
        versionNumber: (current?.versions.at(-1)?.versionNumber ?? 0) + 1,
        definitionSnapshot: clone(value as unknown as Record<string, unknown>),
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

export class MockExtractionMethodRepository implements ExtractionMethodRepository {
  async list(): Promise<ExtractionMethod[]> {
    await delay();
    return clone(methods);
  }

  async getById(id: string): Promise<ExtractionMethod | null> {
    await delay();
    const method = methods.find((item) => item.id === id);
    return method ? clone(method) : null;
  }

  async create(value: ExtractionMethodInput): Promise<ExtractionMethod | null> {
    await delay();
    if (hasDuplicate(value)) return null;
    const created = materialize(value, String(nextId++));
    methods.push(created);
    return clone(created);
  }

  async update(id: string, value: ExtractionMethodInput): Promise<ExtractionMethod | null> {
    await delay();
    const index = methods.findIndex((method) => method.id === id);
    const current = methods[index];
    if (!current || hasDuplicate(value, id)) return null;
    methods[index] = materialize(value, id, current);
    return clone(methods[index] as ExtractionMethod);
  }

  async delete(id: string): Promise<boolean> {
    await delay();
    const index = methods.findIndex((method) => method.id === id);
    if (index < 0) return false;
    methods.splice(index, 1);
    return true;
  }

  async getAvailableData(methodIds: string[]): Promise<Awaited<ReturnType<ExtractionMethodRepository['getAvailableData']>>> {
    await delay();
    const selectedMethods = methods.filter((method) => methodIds.includes(method.id));
    return clone(selectedMethods.flatMap((method) => method.requests.flatMap((request) => request.fields.map((field) => ({
      id: field.id,
      name: field.fieldKey,
      description: field.description ?? '',
      source: method.protocol,
      status: method.isActive && request.isActive ? 'AVAILABLE' as const : 'UNAVAILABLE' as const,
    })))));
  }

  getProtocolOptions(): string[] {
    return ['SNMP', 'API', 'REST', 'MICROSOFT_GRAPH', 'WEBHOOK', 'SOAP', 'SSH', 'SQL'];
  }
}

export const mockExtractionMethodRepository = new MockExtractionMethodRepository();