import type { Service, ServiceConnectionTestResult, ServiceFilters, ServiceTypeCatalogItem, ServiceUsage } from 'src/models/services/Service';

export interface ServiceRepository {
  listTypes(): Promise<ServiceTypeCatalogItem[]>;
  list(filters: ServiceFilters): Promise<Service[]>;
  getById(id: string): Promise<Service | null>;
  create(payload: Record<string, unknown>): Promise<Service | null>;
  update(id: string, payload: Record<string, unknown>): Promise<Service | null>;
  duplicate(id: string): Promise<Service | null>;
  setStatus(id: string, enabled: boolean): Promise<Service | null>;
  delete(id: string): Promise<boolean>;
  testConnection(id: string): Promise<ServiceConnectionTestResult>;
  getUsage(id: string): Promise<ServiceUsage[]>;
}
