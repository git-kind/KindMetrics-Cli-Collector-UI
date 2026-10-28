import type { Service } from './Service';

export interface CreateServiceDto {
  serviceTypeId: number;
  code: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
}

export interface UpdateServiceDto extends Partial<CreateServiceDto> {
  id?: string;
}

export interface ServiceListResponse {
  items: Service[];
  total: number;
}

export interface ServiceApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors?: Array<{ message: string }>;
}
