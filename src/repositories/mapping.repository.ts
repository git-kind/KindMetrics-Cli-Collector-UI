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
      dataId: 'NumeroLlamadas',
      acquisitionMethodId: 'API - CDR',
      sourceField: 'totalCalls',
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
      dataId: 'CallingNumber',
      acquisitionMethodId: 'API - CDR',
      sourceField: 'callingNumber',
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
  const current = mappingRecords.value[collectorId] ?? [];
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
    const records = mappingRecords.value[collectorId] ?? [];
    return clone(records);
  }

  async getMapping(collectorId: string, id: string): Promise<DataMapping | null> {
    const found = (mappingRecords.value[collectorId] ?? []).find((item) => item.id === id);
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

    const current = mappingRecords.value[collectorId] ?? [];
    mappingRecords.value = {
      ...mappingRecords.value,
      [collectorId]: [...current, nextItem],
    };

    return clone(nextItem);
  }

  async updateMapping(collectorId: string, id: string, value: DataMappingFormValue): Promise<DataMapping | null> {
    const current = mappingRecords.value[collectorId] ?? [];
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
    const current = mappingRecords.value[collectorId] ?? [];
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

    const allowedDataValues = ['NumeroLlamadas', 'CallingNumber', 'CalledNumber', 'Duration', 'StartTime'];
    if (!allowedDataValues.includes(value.dataId.trim())) {
      errors.push('El dato debe existir en la configuración del Collector.');
    }

    const allowedMethods = ['API - CDR', 'SNMP - Equipo', 'Webhook - Eventos', 'Microsoft Teams'];
    if (!allowedMethods.includes(value.acquisitionMethodId.trim())) {
      errors.push('El método debe existir en la configuración del Collector.');
    }

    const allowedTables = ['calls', 'call_events'];
    if (!allowedTables.includes(value.destinationTable.trim())) {
      errors.push('La tabla debe existir en la estructura de datos.');
    }

    const allowedFieldsByTable: Record<string, string[]> = {
      calls: ['id', 'calling_number', 'called_number', 'duration', 'start_time', 'status', 'total_calls'],
      call_events: ['id', 'call_id', 'event_type', 'event_at'],
    };

    if (value.destinationTable.trim() && !allowedFieldsByTable[value.destinationTable.trim()]?.includes(value.destinationField.trim())) {
      errors.push('El campo debe existir dentro de la tabla seleccionada.');
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
