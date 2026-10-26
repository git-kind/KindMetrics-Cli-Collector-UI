import type {
  ExtractionAvailableData,
  ExtractionMethod,
  ExtractionMethodInput,
  ExtractionMethodProtocol,
} from 'src/models/extraction-method';

export interface ExtractionMethodRepository {
  list(): Promise<ExtractionMethod[]>;
  getById(id: string): Promise<ExtractionMethod | null>;
  create(value: ExtractionMethodInput): Promise<ExtractionMethod | null>;
  update(id: string, value: ExtractionMethodInput): Promise<ExtractionMethod | null>;
  delete(id: string): Promise<boolean>;
  getAvailableData(methodIds: string[]): Promise<ExtractionAvailableData[]>;
  getProtocolOptions(): ExtractionMethodProtocol[];
}