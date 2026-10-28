import type { Service, ServiceConnectionTestResult, ServiceFilters, ServiceTypeCatalogItem, ServiceUsage, ServiceFormDraft } from 'src/models/services/Service';
import { apiServiceRepository } from 'src/repositories/services/ApiServiceRepository';

export class ServiceService {
  private serviceTypeCatalog: ServiceTypeCatalogItem[] | null = null;

  async listServiceTypes(): Promise<ServiceTypeCatalogItem[]> {
    this.serviceTypeCatalog = await apiServiceRepository.listTypes();
    return this.serviceTypeCatalog;
  }

  listServices(filters: ServiceFilters = { search: '', type: '', status: '' }): Promise<Service[]> {
    return apiServiceRepository.list(filters);
  }

  getService(id: string): Promise<Service | null> {
    return apiServiceRepository.getById(id);
  }

  async createService(value: ServiceFormDraft): Promise<Service | null> {
    const serviceTypeId = this.getServiceTypeId(value);
    return apiServiceRepository.create({
      serviceTypeId,
      code: value.code.trim(),
      name: value.name.trim(),
      description: value.description?.trim() || null,
      isActive: value.enabled,
    });
  }

  async updateService(id: string, value: ServiceFormDraft): Promise<Service | null> {
    const serviceTypeId = this.getServiceTypeId(value);
    return apiServiceRepository.update(id, {
      serviceTypeId,
      code: value.code.trim(),
      name: value.name.trim(),
      description: value.description?.trim() || null,
      isActive: value.enabled,
    });
  }

  duplicateService(id: string): Promise<Service | null> {
    return apiServiceRepository.duplicate(id);
  }

  toggleStatus(id: string, enabled: boolean): Promise<Service | null> {
    return apiServiceRepository.setStatus(id, enabled);
  }

  deleteService(id: string): Promise<boolean> {
    return apiServiceRepository.delete(id);
  }

  testConnection(id: string): Promise<ServiceConnectionTestResult> {
    return apiServiceRepository.testConnection(id);
  }

  getUsage(id: string): Promise<ServiceUsage[]> {
    return apiServiceRepository.getUsage(id);
  }

  getDefaultDraft(types: ServiceTypeCatalogItem[] = this.serviceTypeCatalog ?? []): ServiceFormDraft {
    const defaultType = types.find((type) => type.code === 'REST_API');
    return {
      code: '',
      name: '',
      description: '',
      type: defaultType?.code ?? 'REST_API',
      serviceTypeId: defaultType?.id ?? null,
      authType: 'NONE',
      status: 'ACTIVE',
      enabled: true,
      connectionConfig: {
        timeout: 30000,
      },
      additionalParameters: [],
    };
  }

  private getServiceTypeId(value: ServiceFormDraft): number {
    const id = value.serviceTypeId;
    const selectedType = this.serviceTypeCatalog?.find((item) => item.id === id);
    if (!Number.isSafeInteger(id) || id === null || id <= 0 || !selectedType) {
      throw new Error('Selecciona un Tipo de Servicio válido del catálogo.');
    }
    return id;
  }
}

export const serviceService = new ServiceService();
