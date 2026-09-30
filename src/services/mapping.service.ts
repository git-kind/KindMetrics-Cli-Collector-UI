import type {
  DataMapping,
  DataMappingFormValue,
  DataMappingTestResult,
  DataMappingValidationResult,
} from '../models/mapping';
import { mockMappingRepository, type MappingRepository } from '../repositories/mapping.repository';

export class MappingService {
  constructor(private readonly repository: MappingRepository) {}

  listMappings(collectorId: string): Promise<DataMapping[]> {
    return this.repository.listMappings(collectorId);
  }

  getMapping(collectorId: string, id: string): Promise<DataMapping | null> {
    return this.repository.getMapping(collectorId, id);
  }

  createMapping(collectorId: string, value: DataMappingFormValue): Promise<DataMapping> {
    return this.repository.createMapping(collectorId, value);
  }

  updateMapping(collectorId: string, id: string, value: DataMappingFormValue): Promise<DataMapping | null> {
    return this.repository.updateMapping(collectorId, id, value);
  }

  deleteMapping(collectorId: string, id: string): Promise<boolean> {
    return this.repository.deleteMapping(collectorId, id);
  }

  validateMapping(collectorId: string, value: DataMappingFormValue): Promise<DataMappingValidationResult> {
    return this.repository.validateMapping(collectorId, value);
  }

  testMapping(collectorId: string, id: string): Promise<DataMappingTestResult | null> {
    return this.repository.testMapping(collectorId, id);
  }
}

export const mappingService = new MappingService(mockMappingRepository);
