import { useAuth } from '../composables/useAuthorization';
import type {
  ExtractionConnectionTestResult,
  ExtractionMethod,
  ExtractionMethodInput,
  ExtractionMethodMutationResult,
  ExtractionMethodType,
  ExtractionAvailableData,
} from '../models/extraction-method';
import { mockExtractionMethodRepository } from '../repositories/mock/extraction-method.repository';
import type { ExtractionMethodRepository } from '../repositories/extraction-method.repository';

export class ExtractionMethodService {
  constructor(
    private readonly repository: ExtractionMethodRepository,
    private readonly getCompanyId: () => string,
  ) {}

  listMethods(): Promise<ExtractionMethod[]> {
    return this.repository.list(this.getCompanyId());
  }

  getMethod(id: string): Promise<ExtractionMethod | null> {
    return this.repository.getById(this.getCompanyId(), id);
  }

  async createMethod(value: ExtractionMethodInput): Promise<ExtractionMethodMutationResult> {
    const normalized = this.normalize(value);
    if (!normalized.name || !normalized.type) return { success: false, reason: 'required' };
    const method = await this.repository.create(this.getCompanyId(), normalized);
    return method ? { success: true, method } : { success: false, reason: 'duplicate' };
  }

  async updateMethod(id: string, value: ExtractionMethodInput): Promise<ExtractionMethodMutationResult> {
    const normalized = this.normalize(value);
    if (!normalized.name || !normalized.type) return { success: false, reason: 'required' };
    const method = await this.repository.update(this.getCompanyId(), id, normalized);
    return method
      ? { success: true, method }
      : { success: false, reason: (await this.getMethod(id)) ? 'duplicate' : 'not-found' };
  }

  deleteMethod(id: string): Promise<boolean> {
    return this.repository.delete(this.getCompanyId(), id);
  }

  testConnection(id: string): Promise<ExtractionConnectionTestResult> {
    return this.repository.testConnection(this.getCompanyId(), id);
  }

  runDiscovery(id: string): Promise<ExtractionMethod | null> {
    return this.repository.runDiscovery(this.getCompanyId(), id);
  }

  getAvailableData(methodIds: string[]): Promise<ExtractionAvailableData[]> {
    return this.repository.getAvailableData(this.getCompanyId(), methodIds);
  }

  getTypeOptions(): ExtractionMethodType[] {
    return this.repository.getTypeOptions();
  }

  private normalize(value: ExtractionMethodInput): ExtractionMethodInput {
    return {
      ...value,
      name: value.name.trim(),
      description: value.description.trim(),
      connection: { ...value.connection },
    };
  }
}

const auth = useAuth();
function activeCompanyId(): string {
  const id = auth.company.value?.id;
  if (!id) throw new Error('Active Company context is required.');
  return id;
}

export const extractionMethodService = new ExtractionMethodService(mockExtractionMethodRepository, activeCompanyId);