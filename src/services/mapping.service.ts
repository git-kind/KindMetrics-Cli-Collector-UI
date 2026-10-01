import type {
  DataMapping,
  DataMappingFormValue,
  DataMappingTestResult,
  DataMappingValidationResult,
} from '../models/mapping';
import { mockMappingRepository, type MappingRepository } from '../repositories/mapping.repository';
import { useAuth } from '../composables/useAuthorization';

export class MappingService {
  constructor(
    private readonly repository: MappingRepository,
    private readonly getCompanyId: () => string,
  ) {}

  private scopeCollectorId(collectorId: string): string {
    return `${this.getCompanyId()}:${collectorId}`;
  }

  listMappings(collectorId: string): Promise<DataMapping[]> {
    return this.repository.listMappings(this.scopeCollectorId(collectorId));
  }

  getMapping(collectorId: string, id: string): Promise<DataMapping | null> {
    return this.repository.getMapping(this.scopeCollectorId(collectorId), id);
  }

  createMapping(collectorId: string, value: DataMappingFormValue): Promise<DataMapping> {
    return this.repository.createMapping(this.scopeCollectorId(collectorId), value);
  }

  updateMapping(collectorId: string, id: string, value: DataMappingFormValue): Promise<DataMapping | null> {
    return this.repository.updateMapping(this.scopeCollectorId(collectorId), id, value);
  }

  deleteMapping(collectorId: string, id: string): Promise<boolean> {
    return this.repository.deleteMapping(this.scopeCollectorId(collectorId), id);
  }

  validateMapping(collectorId: string, value: DataMappingFormValue): Promise<DataMappingValidationResult> {
    return this.repository.validateMapping(this.scopeCollectorId(collectorId), value);
  }

  testMapping(collectorId: string, id: string): Promise<DataMappingTestResult | null> {
    return this.repository.testMapping(this.scopeCollectorId(collectorId), id);
  }
}

const auth = useAuth();
function activeCompanyId(): string {
  const id = auth.company.value?.id;
  if (!id) throw new Error('Active Company context is required.');
  return id;
}

export const mappingService = new MappingService(mockMappingRepository, activeCompanyId);
