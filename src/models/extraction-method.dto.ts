import type {
  ExtractionAvailableData,
  ExtractionConnectionTestResult,
  ExtractionDiscovery,
  ExtractionMethod,
  ExtractionMethodInput,
  ExtractionMethodStatus,
  ExtractionMethodType,
} from './extraction-method';

export interface ExtractionMethodDto {
  id: string;
  companyId: string;
  name: string;
  type: ExtractionMethodType;
  description: string;
  status: ExtractionMethodStatus;
  connection: Record<string, string | number | boolean>;
  target: ExtractionMethod['target'];
  discovery: ExtractionDiscovery;
  availableData: ExtractionAvailableData[];
  createdAt: string;
  updatedAt: string;
}

export type CreateExtractionMethodDto = ExtractionMethodInput;
export type UpdateExtractionMethodDto = ExtractionMethodInput;

export type ExtractionMethodApiData<T> = {
  success: boolean;
  message?: string;
  data: T | null;
  errors?: Array<{ message: string }>;
};

export interface ExtractionMethodTestDto {
  success: boolean;
  message?: string;
  messageKey?: ExtractionConnectionTestResult['messageKey'];
}