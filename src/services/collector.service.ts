import { useAuth } from '../composables/useAuthorization';
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
import { mockCollectorRepository } from '../repositories/mock/mock-collector.repository';
import type { CollectorRepository } from '../repositories/collector.repository';

export type CollectorValidationCode = 'nameRequired' | 'codeRequired' | 'invalidEquipment' | 'invalidOriginVersion';

export class CollectorValidationError extends Error {
  constructor(readonly code: CollectorValidationCode) {
    super(code);
  }
}

export class CollectorService {
  constructor(
    private readonly repository: CollectorRepository,
    private readonly getCompanyId: () => string,
  ) {}

  listCollectors(filters: CollectorFilters): Promise<Collector[]> {
    return this.repository.list(this.getCompanyId(), filters);
  }

  getCollector(id: string): Promise<Collector | null> {
    return this.repository.getById(this.getCompanyId(), id);
  }

  async createCollector(value: CollectorFormValue): Promise<Collector> {
    const normalized = await this.validateAndNormalize(value);
    return this.repository.create(this.getCompanyId(), normalized);
  }

  async updateCollector(id: string, value: CollectorFormValue): Promise<Collector | null> {
    const normalized = await this.validateAndNormalize(value);
    return this.repository.update(this.getCompanyId(), id, normalized);
  }

  deleteCollector(id: string): Promise<boolean> {
    return this.repository.delete(this.getCompanyId(), id);
  }

  activateCollector(id: string): Promise<Collector | null> {
    return this.repository.activate(this.getCompanyId(), id);
  }

  deactivateCollector(id: string): Promise<Collector | null> {
    return this.repository.deactivate(this.getCompanyId(), id);
  }

  getReferenceData(): Promise<CollectorReferenceData> {
    return this.repository.getReferenceData();
  }

  getCollectorHealth(id: string): Promise<CollectorHealthMock | null> {
    return this.repository.getHealth(this.getCompanyId(), id);
  }

  getCollectorLogs(id: string): Promise<CollectorLogMock[] | null> {
    return this.repository.getLogs(this.getCompanyId(), id);
  }

  executeCollectorTest(id: string, type: CollectorTestType): Promise<CollectorTestResultMock | null> {
    return this.repository.executeTest(this.getCompanyId(), id, type);
  }

  getDataStructure(id: string): Promise<CollectorDataStructure | null> {
    return this.repository.getDataStructure(this.getCompanyId(), id);
  }

  createTable(id: string, table: Omit<CollectorTable, 'id' | 'status' | 'fields' | 'indexes'>): Promise<CollectorTable | null> {
    return this.repository.createTable(this.getCompanyId(), id, table);
  }

  updateTable(id: string, tableId: string, table: Partial<CollectorTable>): Promise<CollectorTable | null> {
    return this.repository.updateTable(this.getCompanyId(), id, tableId, table);
  }

  deleteTable(id: string, tableId: string): Promise<boolean> {
    return this.repository.deleteTable(this.getCompanyId(), id, tableId);
  }

  createField(id: string, tableId: string, field: Omit<CollectorField, 'id'>): Promise<CollectorField | null> {
    return this.repository.createField(this.getCompanyId(), id, tableId, field);
  }

  updateField(id: string, tableId: string, fieldId: string, field: Partial<CollectorField>): Promise<CollectorField | null> {
    return this.repository.updateField(this.getCompanyId(), id, tableId, fieldId, field);
  }

  deleteField(id: string, tableId: string, fieldId: string): Promise<boolean> {
    return this.repository.deleteField(this.getCompanyId(), id, tableId, fieldId);
  }

  createIndex(id: string, tableId: string, index: Omit<CollectorIndex, 'id'>): Promise<CollectorIndex | null> {
    return this.repository.createIndex(this.getCompanyId(), id, tableId, index);
  }

  updateIndex(id: string, tableId: string, indexId: string, index: Partial<CollectorIndex>): Promise<CollectorIndex | null> {
    return this.repository.updateIndex(this.getCompanyId(), id, tableId, indexId, index);
  }

  deleteIndex(id: string, tableId: string, indexId: string): Promise<boolean> {
    return this.repository.deleteIndex(this.getCompanyId(), id, tableId, indexId);
  }

  validateStructure(id: string): Promise<{ valid: boolean; errors: string[] }> {
    return this.repository.validateStructure(this.getCompanyId(), id);
  }

  previewChanges(id: string): Promise<string[]> {
    return this.repository.previewChanges(this.getCompanyId(), id);
  }

  applyChanges(id: string): Promise<{ success: boolean; message: string }> {
    return this.repository.applyChanges(this.getCompanyId(), id);
  }

  private async validateAndNormalize(value: CollectorFormValue): Promise<CollectorFormValue> {
    const normalized = {
      ...value,
      name: value.name.trim(),
      code: value.code.trim(),
      description: value.description.trim(),
      type: value.type?.trim() || null,
      executionMode: value.executionMode?.trim() || null,
      schedule: value.schedule?.trim() || null,
    };
    if (!normalized.name) throw new CollectorValidationError('nameRequired');
    if (!normalized.code) throw new CollectorValidationError('codeRequired');

    const references = this.repository.getReferenceData();
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

const auth = useAuth();
export const collectorService = new CollectorService(
  mockCollectorRepository,
  () => auth.company.value.id,
);