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
} from '../models/collector';
import { apiCollectorRepository } from '../repositories/collector.api.repository';
import type { CollectorRepository } from '../repositories/collector.repository';
import { extractionMethodService } from './extraction-method.service';
import { getActiveCompanyCode } from './session/sessionService';
import { serviceService } from './services/serviceService';

export type CollectorValidationCode = 'nameRequired' | 'codeRequired' | 'invalidService' | 'invalidEquipment' | 'invalidOriginVersion' | 'invalidExtractionMethod' | 'invalidSelectedData' | 'sensitiveConfiguration';

export class CollectorValidationError extends Error {
  constructor(readonly code: CollectorValidationCode) {
    super(code);
  }
}

export class CollectorService {
  constructor(
    private readonly repository: CollectorRepository,
    private readonly getCompanyCode: () => string,
  ) {}

  listCollectors(filters: CollectorFilters): Promise<Collector[]> {
    return this.repository.list(this.getCompanyCode(), filters);
  }

  getCollector(id: string): Promise<Collector | null> {
    return this.repository.getById(this.getCompanyCode(), id);
  }

  async createCollector(value: CollectorFormValue): Promise<Collector> {
    const normalized = await this.validateAndNormalize(value);
    return this.repository.create(this.getCompanyCode(), normalized);
  }

  async updateCollector(id: string, value: CollectorFormValue): Promise<Collector | null> {
    const normalized = await this.validateAndNormalize(value);
    return this.repository.update(this.getCompanyCode(), id, normalized);
  }

  deleteCollector(id: string): Promise<boolean> {
    return this.repository.delete(this.getCompanyCode(), id);
  }

  activateCollector(id: string): Promise<Collector | null> {
    return this.repository.activate(this.getCompanyCode(), id);
  }

  deactivateCollector(id: string): Promise<Collector | null> {
    return this.repository.deactivate(this.getCompanyCode(), id);
  }

  getReferenceData(): Promise<CollectorReferenceData> {
    return this.repository.getReferenceData(this.getCompanyCode());
  }

  getCollectorHealth(id: string): Promise<CollectorHealthMock | null> {
    return this.repository.getHealth(this.getCompanyCode(), id);
  }

  getCollectorLogs(id: string): Promise<CollectorLogMock[] | null> {
    return this.repository.getLogs(this.getCompanyCode(), id);
  }

  executeCollector(id: string): Promise<CollectorTestResultMock | null> {
    return this.repository.executeCollector(this.getCompanyCode(), id);
  }

  synchronizeCollector(id: string): Promise<boolean> {
    return this.repository.synchronizeCollector(this.getCompanyCode(), id);
  }

  executeCollectorTest(id: string, type: CollectorTestType): Promise<CollectorTestResultMock | null> {
    return this.repository.executeTest(this.getCompanyCode(), id, type);
  }

  getDataStructure(id: string): Promise<CollectorDataStructure | null> {
    return this.repository.getDataStructure(this.getCompanyCode(), id);
  }

  createTable(id: string, table: Omit<CollectorTable, 'id' | 'status' | 'fields' | 'indexes'>): Promise<CollectorTable | null> {
    return this.repository.createTable(this.getCompanyCode(), id, table);
  }

  updateTable(id: string, tableId: string, table: Partial<CollectorTable>): Promise<CollectorTable | null> {
    return this.repository.updateTable(this.getCompanyCode(), id, tableId, table);
  }

  deleteTable(id: string, tableId: string): Promise<boolean> {
    return this.repository.deleteTable(this.getCompanyCode(), id, tableId);
  }

  createField(id: string, tableId: string, field: Omit<CollectorField, 'id'>): Promise<CollectorField | null> {
    return this.repository.createField(this.getCompanyCode(), id, tableId, field);
  }

  updateField(id: string, tableId: string, fieldId: string, field: Partial<CollectorField>): Promise<CollectorField | null> {
    return this.repository.updateField(this.getCompanyCode(), id, tableId, fieldId, field);
  }

  deleteField(id: string, tableId: string, fieldId: string): Promise<boolean> {
    return this.repository.deleteField(this.getCompanyCode(), id, tableId, fieldId);
  }

  createIndex(id: string, tableId: string, index: Omit<CollectorIndex, 'id'>): Promise<CollectorIndex | null> {
    return this.repository.createIndex(this.getCompanyCode(), id, tableId, index);
  }

  updateIndex(id: string, tableId: string, indexId: string, index: Partial<CollectorIndex>): Promise<CollectorIndex | null> {
    return this.repository.updateIndex(this.getCompanyCode(), id, tableId, indexId, index);
  }

  deleteIndex(id: string, tableId: string, indexId: string): Promise<boolean> {
    return this.repository.deleteIndex(this.getCompanyCode(), id, tableId, indexId);
  }

  validateStructure(id: string): Promise<{ valid: boolean; errors: string[] }> {
    return this.repository.validateStructure(this.getCompanyCode(), id);
  }

  previewChanges(id: string): Promise<string[]> {
    return this.repository.previewChanges(this.getCompanyCode(), id);
  }

  applyChanges(id: string): Promise<{ success: boolean; message: string }> {
    return this.repository.applyChanges(this.getCompanyCode(), id);
  }

  private async validateAndNormalize(value: CollectorFormValue): Promise<CollectorFormValue> {
    const normalized = {
      ...value,
      name: value.name.trim(),
      code: value.code.trim(),
      description: value.description.trim(),
      extractionMethodIds: [...value.extractionMethodIds],
      selectedData: [...value.selectedData],
      type: value.type?.trim() || null,
      executionMode: value.executionMode?.trim() || null,
      schedule: value.schedule?.trim() || null,
    };
    if (!normalized.name) throw new CollectorValidationError('nameRequired');
    if (!normalized.code) throw new CollectorValidationError('codeRequired');
    if (!normalized.serviceId.trim()) throw new CollectorValidationError('invalidService');
    if (containsSensitiveConfiguration(normalized.configuration)) {
      throw new CollectorValidationError('sensitiveConfiguration');
    }
    if (normalized.extractionMethodIds.length === 0) throw new CollectorValidationError('invalidExtractionMethod');
    if (normalized.selectedData.length === 0) throw new CollectorValidationError('invalidSelectedData');

    const service = await serviceService.getService(normalized.serviceId);
    if (!service || !service.enabled || service.status !== 'ACTIVE') {
      throw new CollectorValidationError('invalidService');
    }

    const extractionMethods = await extractionMethodService.listMethods();
    if (normalized.extractionMethodIds.some((id) => !extractionMethods.some((method) => method.id === id))) {
      throw new CollectorValidationError('invalidExtractionMethod');
    }
    const availableData = await extractionMethodService.getAvailableData(normalized.extractionMethodIds);
    if (normalized.selectedData.some((id) => !availableData.some((item) => item.id === id))) {
      throw new CollectorValidationError('invalidSelectedData');
    }

    const references = this.repository.getReferenceData(this.getCompanyCode());
    return this.validateReferences(normalized, references);
  }

  private async validateReferences(
    value: CollectorFormValue,
    referencesPromise: Promise<CollectorReferenceData>,
  ): Promise<CollectorFormValue> {
    const references = await referencesPromise;
    if (
      value.equipmentId &&
      !references.equipment.some((equipment) => equipment.id === value.equipmentId)
    ) {
      throw new CollectorValidationError('invalidEquipment');
    }
    if (
      value.originVersionId &&
      !references.originVersions.some((origin) => origin.id === value.originVersionId)
    ) {
      throw new CollectorValidationError('invalidOriginVersion');
    }
    return value;
  }
}

function containsSensitiveConfiguration(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  if (Array.isArray(value)) return value.some(containsSensitiveConfiguration);

  return Object.entries(value).some(([key, child]) => {
    const sensitiveKey = /(password|token|secret|api.?key|authconfig|credential)$/i.test(key);
    return sensitiveKey || containsSensitiveConfiguration(child);
  });
}

function getActiveCompanyCodeFromSession(): string {
  const companyCode = getActiveCompanyCode();
  if (!companyCode) throw new Error('Active Company code is required.');
  return companyCode;
}

export const collectorService = new CollectorService(
  apiCollectorRepository,
  getActiveCompanyCodeFromSession,
);