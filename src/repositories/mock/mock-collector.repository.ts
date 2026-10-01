import { shallowRef } from 'vue';
import type {
  Collector,
  CollectorDataStructure,
  CollectorField,
  CollectorFilters,
  CollectorFormValue,
  CollectorHealthMock,
  CollectorIndex,
  CollectorLogMock,
  CollectorReferenceData,
  CollectorTable,
  CollectorTestResultMock,
  CollectorTestType,
} from '../../models/collector';
import {
  collectorHealthMock,
  collectorLogsMock,
  collectorReferenceDataMock,
  collectorsMock,
} from '../../mocks/collectors.mock';
import type { CollectorRepository } from '../collector.repository';

const collectorRecords = shallowRef<Collector[]>(structuredClone(collectorsMock));
const initialCollectorRecords = structuredClone(collectorsMock);
const seededCompanyIds = new Set(collectorsMock.map((collector) => collector.companyId));
const collectorStructures = shallowRef<Record<string, CollectorDataStructure>>({});
let nextId = 1;
let nextTableId = 1;
let nextFieldId = 1;
let nextIndexId = 1;
const delay = (duration = 140) => new Promise<void>((resolve) => setTimeout(resolve, duration));
const clone = <Value>(value: Value): Value => JSON.parse(JSON.stringify(value)) as Value;

function createDefaultStructure(collectorId: string): CollectorDataStructure {
  const timestamp = new Date().toISOString();
  return {
    id: `ds-${collectorId}`,
    collectorId,
    status: 'DEFINED',
    tables: [
      {
        id: `table-${collectorId}-calls`,
        name: 'calls',
        description: 'Registros de llamadas',
        status: 'DEFINED',
        fields: [
          { id: 'field-calls-id', name: 'id', type: 'BIGINT', nullable: false, primaryKey: true, autoIncrement: true, defaultValue: null },
          { id: 'field-calls-calling_number', name: 'calling_number', type: 'VARCHAR', length: 50, nullable: true, primaryKey: false, autoIncrement: false, defaultValue: null },
          { id: 'field-calls-called_number', name: 'called_number', type: 'VARCHAR', length: 50, nullable: true, primaryKey: false, autoIncrement: false, defaultValue: null },
          { id: 'field-calls-duration', name: 'duration', type: 'INT', nullable: true, primaryKey: false, autoIncrement: false, defaultValue: null },
          { id: 'field-calls-start_time', name: 'start_time', type: 'DATETIME', nullable: true, primaryKey: false, autoIncrement: false, defaultValue: null },
          { id: 'field-calls-status', name: 'status', type: 'VARCHAR', length: 20, nullable: true, primaryKey: false, autoIncrement: false, defaultValue: null },
        ],
        indexes: [
          { id: 'idx-calls-primary', name: 'PRIMARY', type: 'PRIMARY', fields: ['id'] },
          { id: 'idx-calls-start_time', name: 'idx_start_time', type: 'INDEX', fields: ['start_time'] },
        ],
      },
      {
        id: `table-${collectorId}-call_events`,
        name: 'call_events',
        description: 'Eventos asociados a llamadas',
        status: 'DEFINED',
        fields: [
          { id: 'field-events-id', name: 'id', type: 'BIGINT', nullable: false, primaryKey: true, autoIncrement: true, defaultValue: null },
          { id: 'field-events-call_id', name: 'call_id', type: 'BIGINT', nullable: false, primaryKey: false, autoIncrement: false, defaultValue: null },
          { id: 'field-events-event_type', name: 'event_type', type: 'VARCHAR', length: 30, nullable: true, primaryKey: false, autoIncrement: false, defaultValue: null },
          { id: 'field-events-event_at', name: 'event_at', type: 'DATETIME', nullable: true, primaryKey: false, autoIncrement: false, defaultValue: null },
        ],
        indexes: [
          { id: 'idx-events-primary', name: 'PRIMARY', type: 'PRIMARY', fields: ['id'] },
          { id: 'idx-events-call_id', name: 'idx_call_id', type: 'INDEX', fields: ['call_id'] },
        ],
      },
    ],
    lastValidationMessage: 'Estructura válida',
    previewChanges: ['Crear tabla calls', 'Crear campo start_time DATETIME'],
    createdAt: timestamp,
    updatedAt: timestamp,
  } as CollectorDataStructure & { createdAt: string; updatedAt: string };
}

function keyForStructure(companyId: string, collectorId: string): string {
  return `${companyId}:${collectorId}`;
}

function keyForLogs(companyId: string, collectorId: string): string {
  return `${companyId}:${collectorId}`;
}

function getStructureState(companyId: string, collectorId: string): CollectorDataStructure {
  const key = keyForStructure(companyId, collectorId);
  let structure = collectorStructures.value[key];
  if (!structure) {
    structure = createDefaultStructure(collectorId);
    collectorStructures.value = { ...collectorStructures.value, [key]: structure };
  }
  return clone(structure);
}

function normalizeFieldName(name: string): string {
  return name.trim();
}

function validateField(field: Partial<CollectorField>, fields: CollectorField[]): string[] {
  const errors: string[] = [];
  if (!field.name || !normalizeFieldName(String(field.name))) errors.push('El nombre del campo es obligatorio.');
  const duplicate = fields.some((item) => item.name.toLowerCase() === String(field.name ?? '').trim().toLowerCase());
  if (duplicate) errors.push('No se permiten campos duplicados dentro de la tabla.');
  if (!field.type) errors.push('El tipo de dato es obligatorio.');
  if (field.type === 'VARCHAR' && (!field.length || Number(field.length) <= 0)) errors.push('VARCHAR requiere longitud válida.');
  if (field.type === 'DECIMAL' && (!field.precision || !field.scale)) errors.push('DECIMAL requiere precisión y escala.');
  if (field.primaryKey && fields.some((item) => item.primaryKey && item.id !== field.id)) errors.push('Solo puede existir una clave primaria por tabla.');
  if (field.autoIncrement && !['BIGINT', 'INT'].includes(field.type ?? '')) errors.push('Auto incremento solo aplica a BIGINT o INT.');
  return errors;
}

function findCollector(companyId: string, id: string): Collector | undefined {
  ensureCompanySeeded(companyId);
  return collectorRecords.value.find(
    (collector) => collector.companyId === companyId && collector.id === id,
  );
}

function ensureCompanySeeded(companyId: string): void {
  if (seededCompanyIds.has(companyId)) return;

  const companySeeds = initialCollectorRecords
    .filter((collector) => collector.companyId === 'demo')
    .map((collector) => ({ ...clone(collector), companyId }));
  collectorRecords.value = [...collectorRecords.value, ...companySeeds];
  seededCompanyIds.add(companyId);
}

export class MockCollectorRepository implements CollectorRepository {
  async list(companyId: string, filters: CollectorFilters): Promise<Collector[]> {
    await delay();
    ensureCompanySeeded(companyId);
    const search = filters.search.trim().toLocaleLowerCase();
    return collectorRecords.value
      .filter((collector) => collector.companyId === companyId)
      .filter((collector) => filters.status === 'ALL' || collector.status === filters.status)
      .filter(
        (collector) =>
          !search ||
          collector.code.toLocaleLowerCase().includes(search) ||
          collector.name.toLocaleLowerCase().includes(search),
      )
      .map(clone);
  }

  async getById(companyId: string, id: string): Promise<Collector | null> {
    await delay();
    const collector = findCollector(companyId, id);
    return collector ? clone(collector) : null;
  }

  async create(companyId: string, value: CollectorFormValue): Promise<Collector> {
    await delay();
    const timestamp = new Date().toISOString();
    const collector: Collector = {
      ...clone(value),
      id: `collector-${Date.now()}-${nextId++}`,
      companyId,
      status: 'ACTIVE',
      lastExecutionAt: null,
      nextExecutionAt: null,
      lastExecutionStatus: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    collectorRecords.value = [...collectorRecords.value, collector];
    return clone(collector);
  }

  async update(
    companyId: string,
    id: string,
    value: CollectorFormValue,
  ): Promise<Collector | null> {
    await delay();
    const existing = findCollector(companyId, id);
    if (!existing) return null;

    const updated: Collector = {
      ...existing,
      ...clone(value),
      updatedAt: new Date().toISOString(),
    };
    collectorRecords.value = collectorRecords.value.map((collector) =>
      collector.id === id && collector.companyId === companyId ? updated : collector,
    );
    return clone(updated);
  }

  async delete(companyId: string, id: string): Promise<boolean> {
    await delay();
    if (!findCollector(companyId, id)) return false;
    collectorRecords.value = collectorRecords.value.filter(
      (collector) => collector.companyId !== companyId || collector.id !== id,
    );
    return true;
  }

  activate(companyId: string, id: string): Promise<Collector | null> {
    return this.setStatus(companyId, id, 'ACTIVE');
  }

  deactivate(companyId: string, id: string): Promise<Collector | null> {
    return this.setStatus(companyId, id, 'INACTIVE');
  }

  async getReferenceData(): Promise<CollectorReferenceData> {
    await delay();
    return clone(collectorReferenceDataMock);
  }

  async getHealth(companyId: string, id: string): Promise<CollectorHealthMock | null> {
    await delay();
    const collector = findCollector(companyId, id);
    if (!collector) return null;
    const health = collectorHealthMock[id] ?? {
      status: collector.lastExecutionStatus ?? 'NOT_RUN',
      lastExecutionAt: collector.lastExecutionAt,
      lastSuccessfulExecutionAt: null,
      durationMs: null,
      recordsProcessed: 0,
      errors: 0,
      lastErrorKey: null,
    };
    return clone(health);
  }

  async getLogs(companyId: string, id: string): Promise<CollectorLogMock[] | null> {
    await delay();
    if (!findCollector(companyId, id)) return null;
    const key = keyForLogs(companyId, id);
    if (!collectorLogsMock[key]) collectorLogsMock[key] = clone(collectorLogsMock[id] ?? []);
    return clone(collectorLogsMock[key] ?? []);
  }

  async executeCollector(companyId: string, id: string): Promise<CollectorTestResultMock | null> {
    const collector = findCollector(companyId, id);
    if (!collector) return null;
    await delay(650);
    const timestamp = new Date().toISOString();
    const executionId = `run-${id}-${Date.now()}`;
    const success = collector.status === 'ACTIVE';
    const durationMs = success ? 420 : 1850;
    const recordsProcessed = success ? 125 : 0;
    const result: CollectorTestResultMock = {
      status: success ? 'SUCCESS' : 'ERROR',
      messageKey: success ? 'collectors.tests.success' : 'collectors.tests.error',
      durationMs,
    };
    collector.lastExecutionAt = timestamp;
    collector.lastExecutionStatus = result.status;
    collector.updatedAt = timestamp;
    collectorRecords.value = [...collectorRecords.value];
    const messages = success
      ? ['collectors.mockLogs.executionStarted', 'collectors.mockLogs.recordsObtained', 'collectors.mockLogs.mappingCompleted', 'collectors.mockLogs.synchronizationStarted', 'collectors.mockLogs.recordsSynchronized']
      : ['collectors.mockLogs.executionFailed'];
    const logs: CollectorLogMock[] = messages.map((messageKey, index) => ({
      id: `${executionId}-${index}`,
      timestamp,
      level: success && index === messages.length - 1 ? 'SUCCESS' : success ? 'INFO' : 'ERROR',
      messageKey,
      executionId,
      errorKey: success ? null : 'collectors.mockErrors.inactive',
      durationMs: index === messages.length - 1 ? durationMs : null,
      recordsProcessed: success ? recordsProcessed : 0,
    }));
    const logKey = keyForLogs(companyId, id);
    const existingLogs = collectorLogsMock[logKey] ?? clone(collectorLogsMock[id] ?? []);
    collectorLogsMock[logKey] = [...logs, ...existingLogs];
    return result;
  }

  async synchronizeCollector(companyId: string, id: string): Promise<boolean> {
    const collector = findCollector(companyId, id);
    if (!collector) return false;
    await delay(350);
    const timestamp = new Date().toISOString();
    const config = collector.configuration as Record<string, unknown>;
    const currentSync = (config.synchronization ?? {}) as Record<string, unknown>;
    collector.configuration = {
      ...config,
      synchronization: {
        ...currentSync,
        enabled: true,
        destination: 'KIND (Mock)',
        frequency: (currentSync.frequency as string | undefined) ?? 'Every 1 minute',
        lastSyncAt: timestamp,
        pendingRecords: 0,
        sentRecords: Number(currentSync.sentRecords ?? 0) + 125,
        errorRecords: Number(currentSync.errorRecords ?? 0),
        result: 'SUCCESS',
      },
    };
    collector.updatedAt = timestamp;
    collectorRecords.value = [...collectorRecords.value];
    const logKey = keyForLogs(companyId, id);
    const logs = collectorLogsMock[logKey] ?? clone(collectorLogsMock[id] ?? []);
    collectorLogsMock[logKey] = [{
      id: `sync-${id}-${Date.now()}`,
      timestamp,
      level: 'SUCCESS',
      messageKey: 'collectors.mockLogs.recordsSynchronized',
      executionId: `sync-${id}-${Date.now()}`,
      errorKey: null,
      durationMs: 240,
      recordsProcessed: 125,
    }, ...logs];
    return true;
  }

  async executeTest(
    companyId: string,
    id: string,
    type: CollectorTestType,
  ): Promise<CollectorTestResultMock | null> {
    if (!findCollector(companyId, id)) return null;
    await delay(650);
    const success = id === 'co-1' || (id !== 'co-3' && type !== 'connection');
    return {
      status: success ? 'SUCCESS' : 'ERROR',
      messageKey: success ? 'collectors.tests.success' : 'collectors.tests.error',
      durationMs: success ? 420 : 1850,
    };
  }

  async getDataStructure(companyId: string, collectorId: string): Promise<CollectorDataStructure | null> {
    await delay();
    const collector = findCollector(companyId, collectorId);
    if (!collector) return null;
    const structure = getStructureState(companyId, collectorId);
    return clone(structure);
  }

  async createTable(
    companyId: string,
    collectorId: string,
    table: Omit<CollectorTable, 'id' | 'status' | 'fields' | 'indexes'>,
  ): Promise<CollectorTable | null> {
    await delay();
    if (!findCollector(companyId, collectorId)) return null;
    const structure = getStructureState(companyId, collectorId);
    const name = table.name.trim();
    if (!name || structure.tables.some((item) => item.name.toLowerCase() === name.toLowerCase())) {
      return null;
    }
    const nextTable: CollectorTable = {
      id: `table-${collectorId}-${nextTableId++}`,
      name,
      description: table.description?.trim() ?? '',
      status: 'DEFINED',
      fields: [],
      indexes: [],
    };
    structure.tables = [...structure.tables, nextTable];
    structure.status = 'DEFINED';
    collectorStructures.value = { ...collectorStructures.value, [keyForStructure(companyId, collectorId)]: structure };
    return clone(nextTable);
  }

  async updateTable(companyId: string, collectorId: string, tableId: string, table: Partial<CollectorTable>): Promise<CollectorTable | null> {
    await delay();
    if (!findCollector(companyId, collectorId)) return null;
    const structure = getStructureState(companyId, collectorId);
    const index = structure.tables.findIndex((item) => item.id === tableId);
    if (index === -1) return null;
    const existing = structure.tables[index];
    if (!existing) return null;
    const nextName = table.name?.trim() ?? existing.name;
    if (!nextName || structure.tables.some((item) => item.id !== tableId && item.name.toLowerCase() === nextName.toLowerCase())) {
      return null;
    }
    const updated: CollectorTable = {
      ...existing,
      name: nextName,
      description: table.description?.trim() ?? existing.description,
    };
    structure.tables = structure.tables.map((item) => (item.id === tableId ? updated : item));
    collectorStructures.value = { ...collectorStructures.value, [keyForStructure(companyId, collectorId)]: structure };
    return clone(updated);
  }

  async deleteTable(companyId: string, collectorId: string, tableId: string): Promise<boolean> {
    await delay();
    if (!findCollector(companyId, collectorId)) return false;
    const structure = getStructureState(companyId, collectorId);
    const previousLength = structure.tables.length;
    structure.tables = structure.tables.filter((item) => item.id !== tableId);
    if (structure.tables.length === previousLength) return false;
    collectorStructures.value = { ...collectorStructures.value, [keyForStructure(companyId, collectorId)]: structure };
    return true;
  }

  async createField(companyId: string, collectorId: string, tableId: string, field: Omit<CollectorField, 'id'>): Promise<CollectorField | null> {
    await delay();
    if (!findCollector(companyId, collectorId)) return null;
    const structure = getStructureState(companyId, collectorId);
    const table = structure.tables.find((item) => item.id === tableId);
    if (!table) return null;
    const name = normalizeFieldName(field.name);
    const errors = validateField({ ...field, name }, table.fields);
    if (errors.length > 0) return null;
    const nextField: CollectorField = {
      id: `field-${nextFieldId++}`,
      ...field,
      name,
      length: field.type === 'VARCHAR' ? Number(field.length ?? 0) : field.length ?? null,
      nullable: Boolean(field.nullable),
      primaryKey: Boolean(field.primaryKey),
      autoIncrement: Boolean(field.autoIncrement),
      defaultValue: field.defaultValue ?? null,
    };
    table.fields = [...table.fields, nextField];
    structure.status = 'DEFINED';
    collectorStructures.value = { ...collectorStructures.value, [keyForStructure(companyId, collectorId)]: structure };
    return clone(nextField);
  }

  async updateField(companyId: string, collectorId: string, tableId: string, fieldId: string, field: Partial<CollectorField>): Promise<CollectorField | null> {
    await delay();
    if (!findCollector(companyId, collectorId)) return null;
    const structure = getStructureState(companyId, collectorId);
    const table = structure.tables.find((item) => item.id === tableId);
    if (!table) return null;
    const current = table.fields.find((item) => item.id === fieldId);
    if (!current) return null;
    const next = { ...current, ...field, name: normalizeFieldName(String(field.name ?? current.name)) };
    const errors = validateField(next, table.fields.filter((item) => item.id !== fieldId));
    if (errors.length > 0) return null;
    table.fields = table.fields.map((item) => (item.id === fieldId ? { ...next, nullable: Boolean(next.nullable), primaryKey: Boolean(next.primaryKey), autoIncrement: Boolean(next.autoIncrement) } : item));
    collectorStructures.value = { ...collectorStructures.value, [keyForStructure(companyId, collectorId)]: structure };
    return clone(table.fields.find((item) => item.id === fieldId) ?? null);
  }

  async deleteField(companyId: string, collectorId: string, tableId: string, fieldId: string): Promise<boolean> {
    await delay();
    const structure = getStructureState(companyId, collectorId);
    const table = structure.tables.find((item) => item.id === tableId);
    if (!table) return false;
    const previous = table.fields.length;
    table.fields = table.fields.filter((item) => item.id !== fieldId);
    table.indexes = table.indexes.filter((item) => !item.fields.includes(table.fields.find((field) => field.id === fieldId)?.name ?? ''));
    collectorStructures.value = { ...collectorStructures.value, [keyForStructure(companyId, collectorId)]: structure };
    return previous !== table.fields.length;
  }

  async createIndex(companyId: string, collectorId: string, tableId: string, index: Omit<CollectorIndex, 'id'>): Promise<CollectorIndex | null> {
    await delay();
    const structure = getStructureState(companyId, collectorId);
    const table = structure.tables.find((item) => item.id === tableId);
    if (!table) return null;
    const name = index.name.trim();
    const fields = index.fields.filter((field) => table.fields.some((item) => item.name === field));
    if (!name || !fields.length || table.indexes.some((item) => item.name.toLowerCase() === name.toLowerCase())) return null;
    const nextIndex: CollectorIndex = { id: `idx-${nextIndexId++}`, ...index, name, fields };
    table.indexes = [...table.indexes, nextIndex];
    collectorStructures.value = { ...collectorStructures.value, [keyForStructure(companyId, collectorId)]: structure };
    return clone(nextIndex);
  }

  async updateIndex(companyId: string, collectorId: string, tableId: string, indexId: string, index: Partial<CollectorIndex>): Promise<CollectorIndex | null> {
    await delay();
    const structure = getStructureState(companyId, collectorId);
    const table = structure.tables.find((item) => item.id === tableId);
    if (!table) return null;
    const current = table.indexes.find((item) => item.id === indexId);
    if (!current) return null;
    const next = { ...current, ...index, fields: index.fields?.filter((field) => table.fields.some((item) => item.name === field)) ?? current.fields };
    if (!next.name.trim() || !next.fields.length) return null;
    table.indexes = table.indexes.map((item) => (item.id === indexId ? next : item));
    collectorStructures.value = { ...collectorStructures.value, [keyForStructure(companyId, collectorId)]: structure };
    return clone(next);
  }

  async deleteIndex(companyId: string, collectorId: string, tableId: string, indexId: string): Promise<boolean> {
    await delay();
    const structure = getStructureState(companyId, collectorId);
    const table = structure.tables.find((item) => item.id === tableId);
    if (!table) return false;
    const previous = table.indexes.length;
    table.indexes = table.indexes.filter((item) => item.id !== indexId);
    collectorStructures.value = { ...collectorStructures.value, [keyForStructure(companyId, collectorId)]: structure };
    return previous !== table.indexes.length;
  }

  async validateStructure(companyId: string, collectorId: string): Promise<{ valid: boolean; errors: string[] }> {
    await delay();
    const structure = getStructureState(companyId, collectorId);
    const errors: string[] = [];
    if (!structure.tables.length) errors.push('Debe existir al menos una tabla.');
    structure.tables.forEach((table) => {
      const names = new Set<string>();
      table.fields.forEach((field) => {
        if (!field.name.trim()) errors.push(`La tabla ${table.name} contiene un campo sin nombre.`);
        if (names.has(field.name.toLowerCase())) errors.push(`La tabla ${table.name} tiene un campo duplicado: ${field.name}.`);
        names.add(field.name.toLowerCase());
        if (!field.type) errors.push(`El campo ${field.name} de la tabla ${table.name} no tiene tipo.`);
        if (field.type === 'VARCHAR' && (!field.length || Number(field.length) <= 0)) errors.push(`VARCHAR requiere longitud en ${field.name}.`);
      });
      table.indexes.forEach((index) => {
        if (!index.fields.length) errors.push(`El índice ${index.name} de la tabla ${table.name} no tiene campos.`);
        index.fields.forEach((fieldName) => {
          if (!table.fields.some((field) => field.name === fieldName)) errors.push(`El índice ${index.name} hace referencia a un campo inexistente: ${fieldName}.`);
        });
      });
    });
    const result = { valid: errors.length === 0, errors };
    const nextStructure = getStructureState(companyId, collectorId);
    nextStructure.status = result.valid ? 'DEFINED' : 'ERROR';
    nextStructure.lastValidationMessage = result.valid ? 'Estructura válida' : errors[0] ?? 'Estructura inválida';
    collectorStructures.value = { ...collectorStructures.value, [keyForStructure(companyId, collectorId)]: nextStructure };
    return result;
  }

  async previewChanges(companyId: string, collectorId: string): Promise<string[]> {
    await delay();
    const structure = getStructureState(companyId, collectorId);
    const preview = structure.tables.flatMap((table) => [
      `+ Crear tabla: ${table.name}`,
      ...table.fields.map((field) => `+ Crear campo: ${table.name}.${field.name} ${field.type}${field.length ? `(${field.length})` : ''}`),
      ...table.indexes.map((index) => `+ Crear índice: ${index.name}`),
    ]);
    const nextStructure = getStructureState(companyId, collectorId);
    nextStructure.previewChanges = preview;
    nextStructure.status = preview.length ? 'PENDING_CHANGES' : 'DEFINED';
    collectorStructures.value = { ...collectorStructures.value, [keyForStructure(companyId, collectorId)]: nextStructure };
    return preview;
  }

  async applyChanges(companyId: string, collectorId: string): Promise<{ success: boolean; message: string }> {
    await delay(400);
    const nextStructure = getStructureState(companyId, collectorId);
    nextStructure.status = 'SYNCED';
    nextStructure.lastValidationMessage = 'Estructura actualizada correctamente.';
    nextStructure.previewChanges = [];
    collectorStructures.value = { ...collectorStructures.value, [keyForStructure(companyId, collectorId)]: nextStructure };
    return { success: true, message: 'Estructura actualizada correctamente.' };
  }

  private async setStatus(
    companyId: string,
    id: string,
    status: Collector['status'],
  ): Promise<Collector | null> {
    await delay();
    const existing = findCollector(companyId, id);
    if (!existing) return null;
    const updated = { ...existing, status, updatedAt: new Date().toISOString() };
    collectorRecords.value = collectorRecords.value.map((collector) =>
      collector.id === id && collector.companyId === companyId ? updated : collector,
    );
    return clone(updated);
  }
}

export const mockCollectorRepository = new MockCollectorRepository();