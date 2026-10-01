import { shallowRef } from 'vue';
import type {
  DataMapping,
  DataMappingFormValue,
  DataMappingTestResult,
  DataMappingValidationResult,
} from '../models/mapping';

export interface MappingRepository {
  listMappings(collectorId: string): Promise<DataMapping[]>;
  getMapping(collectorId: string, id: string): Promise<DataMapping | null>;
  createMapping(collectorId: string, value: DataMappingFormValue): Promise<DataMapping>;
  updateMapping(collectorId: string, id: string, value: DataMappingFormValue): Promise<DataMapping | null>;
  deleteMapping(collectorId: string, id: string): Promise<boolean>;
  validateMapping(collectorId: string, value: DataMappingFormValue): Promise<DataMappingValidationResult>;
  testMapping(collectorId: string, id: string): Promise<DataMappingTestResult | null>;
}

const mappingRecords = shallowRef<Record<string, DataMapping[]>>({
  'co-1': [
    {
      id: 'mapping-co-1-1',
      collectorId: 'co-1',
      dataId: 'audiocodes-calls',
      acquisitionMethodId: 'method-snmp-audiocodes',
      sourceField: 'Calls',
      transformation: 'NONE',
      transformationConfig: null,
      destinationTable: 'calls',
      destinationField: 'total_calls',
      status: 'CONFIGURADA',
      createdAt: '2026-09-29T09:00:00.000Z',
      updatedAt: '2026-09-29T09:00:00.000Z',
    },
    {
      id: 'mapping-co-1-2',
      collectorId: 'co-1',
      dataId: 'audiocodes-channels',
      acquisitionMethodId: 'method-snmp-audiocodes',
      sourceField: 'Channels',
      transformation: 'NONE',
      transformationConfig: null,
      destinationTable: 'calls',
      destinationField: 'calling_number',
      status: 'CONFIGURADA',
      createdAt: '2026-09-29T09:05:00.000Z',
      updatedAt: '2026-09-29T09:05:00.000Z',
    },
  ],
});

let nextMappingId = 1;
const clone = <Value>(value: Value): Value => JSON.parse(JSON.stringify(value)) as Value;

function ensureMappings(collectorId: string): DataMapping[] {
  const current = mappingRecords.value[collectorId];
  if (current) return current;
  const originalCollectorId = collectorId.split(':').at(-1) ?? collectorId;
  const seed = mappingRecords.value[originalCollectorId] ?? [];
  const companyMappings = seed.map((mapping, index) => ({
    ...clone(mapping),
    id: `${mapping.id}-${collectorId.replace(/[^\da-z-]/gi, '-')}`,
    collectorId,
    createdAt: mapping.createdAt,
    updatedAt: mapping.updatedAt,
    ...(originalCollectorId === 'co-1' && index === 0 ? { dataId: 'audiocodes-calls', acquisitionMethodId: 'method-snmp-audiocodes', sourceField: 'Calls' } : {}),
    ...(originalCollectorId === 'co-1' && index === 1 ? { dataId: 'audiocodes-channels', acquisitionMethodId: 'method-snmp-audiocodes', sourceField: 'Channels' } : {}),
  }));
  mappingRecords.value = { ...mappingRecords.value, [collectorId]: companyMappings };
  return companyMappings;
}

const resolveStatus = (value: DataMappingFormValue): DataMapping['status'] => {
  const hasRequiredFields =
    value.dataId.trim() &&
    value.acquisitionMethodId.trim() &&
    value.sourceField.trim() &&
    value.destinationTable.trim() &&
    value.destinationField.trim() &&
    value.transformation;

  return hasRequiredFields ? 'CONFIGURADA' : 'INCOMPLETA';
};

const isDuplicateMapping = (collectorId: string, value: DataMappingFormValue, excludeId?: string): boolean => {
  const current = ensureMappings(collectorId);
  return current.some((item) => {
    if (excludeId && item.id === excludeId) return false;
    return (
      item.dataId === value.dataId &&
      item.acquisitionMethodId === value.acquisitionMethodId &&
      item.sourceField === value.sourceField &&
      item.destinationTable === value.destinationTable &&
      item.destinationField === value.destinationField
    );
  });
};

export class MockMappingRepository implements MappingRepository {
  async listMappings(collectorId: string): Promise<DataMapping[]> {
    const records = ensureMappings(collectorId);
    return clone(records);
  }

  async getMapping(collectorId: string, id: string): Promise<DataMapping | null> {
    const found = ensureMappings(collectorId).find((item) => item.id === id);
    return found ? clone(found) : null;
  }

  async createMapping(collectorId: string, value: DataMappingFormValue): Promise<DataMapping> {
    const timestamp = new Date().toISOString();
    const nextItem: DataMapping = {
      id: `mapping-${collectorId}-${nextMappingId++}`,
      collectorId,
      dataId: value.dataId.trim(),
      acquisitionMethodId: value.acquisitionMethodId.trim(),
      sourceField: value.sourceField.trim(),
      transformation: value.transformation,
      transformationConfig: value.transformationConfig ?? null,
      destinationTable: value.destinationTable.trim(),
      destinationField: value.destinationField.trim(),
      status: resolveStatus(value),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const current = ensureMappings(collectorId);
    mappingRecords.value = {
      ...mappingRecords.value,
      [collectorId]: [...current, nextItem],
    };

    return clone(nextItem);
  }

  async updateMapping(collectorId: string, id: string, value: DataMappingFormValue): Promise<DataMapping | null> {
    const current = ensureMappings(collectorId);
    const index = current.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const existing = current[index];
    if (!existing) return null;

    const updated: DataMapping = {
      id: existing.id,
      collectorId: existing.collectorId,
      dataId: value.dataId.trim(),
      acquisitionMethodId: value.acquisitionMethodId.trim(),
      sourceField: value.sourceField.trim(),
      transformation: value.transformation,
      transformationConfig: value.transformationConfig ?? null,
      destinationTable: value.destinationTable.trim(),
      destinationField: value.destinationField.trim(),
      status: resolveStatus(value),
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };

    const nextList = current.map((item) => (item.id === id ? updated : item));
    mappingRecords.value = { ...mappingRecords.value, [collectorId]: nextList };
    return clone(updated);
  }

  async deleteMapping(collectorId: string, id: string): Promise<boolean> {
    const current = ensureMappings(collectorId);
    const nextList = current.filter((item) => item.id !== id);
    if (nextList.length === current.length) return false;
    mappingRecords.value = { ...mappingRecords.value, [collectorId]: nextList };
    return true;
  }

  async validateMapping(collectorId: string, value: DataMappingFormValue): Promise<DataMappingValidationResult> {
    const errors: string[] = [];

    if (!value.dataId?.trim()) errors.push('El dato es obligatorio.');
    if (!value.acquisitionMethodId?.trim()) errors.push('El método es obligatorio.');
    if (!value.sourceField?.trim()) errors.push('El dato origen es obligatorio.');
    if (!value.transformation) errors.push('La transformación es obligatoria.');
    if (!value.destinationTable?.trim()) errors.push('La tabla de destino es obligatoria.');
    if (!value.destinationField?.trim()) errors.push('El campo de destino es obligatorio.');

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    if (isDuplicateMapping(collectorId, value)) {
      errors.push('No se permiten asignaciones duplicadas para el mismo origen y destino.');
    }

    return { valid: errors.length === 0, errors };
  }

  async testMapping(collectorId: string, id: string): Promise<DataMappingTestResult | null> {
    const mapping = await this.getMapping(collectorId, id);
    if (!mapping) return null;

    const sampleValue = mapping.sourceField === 'totalCalls' ? 1250 : 42;
    const transformedValue = mapping.transformation === 'NONE' ? sampleValue : sampleValue * 1;
    const destinationValue = `${mapping.destinationTable}.${mapping.destinationField}`;

    return {
      status: 'SUCCESS',
      message: `Asignación válida para ${mapping.dataId}.`,
      sampleValue: transformedValue,
      destinationValue,
    };
  }
}

export const mockMappingRepository = new MockMappingRepository();
