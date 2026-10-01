import type {
  ExtractionAvailableData,
  ExtractionConnectionTestResult,
  ExtractionMethod,
  ExtractionMethodInput,
  ExtractionMethodType,
} from '../models/extraction-method';

export interface ExtractionMethodRepository {
  list(companyId: string): Promise<ExtractionMethod[]>;
  getById(companyId: string, id: string): Promise<ExtractionMethod | null>;
  create(companyId: string, value: ExtractionMethodInput): Promise<ExtractionMethod | null>;
  update(companyId: string, id: string, value: ExtractionMethodInput): Promise<ExtractionMethod | null>;
  delete(companyId: string, id: string): Promise<boolean>;
  testConnection(companyId: string, id: string): Promise<ExtractionConnectionTestResult>;
  runDiscovery(companyId: string, id: string): Promise<ExtractionMethod | null>;
  getAvailableData(companyId: string, methodIds: string[]): Promise<ExtractionAvailableData[]>;
  getTypeOptions(): ExtractionMethodType[];
}