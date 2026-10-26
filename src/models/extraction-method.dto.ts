import type {
  ExtractionMethod,
  EquipmentExtractionMethod,
  EquipmentExtractionMethodInput,
  ExtractionMethodFieldInput,
  ExtractionMethodInput,
  ExtractionMethodParameterInput,
  ExtractionMethodProtocol,
  ExtractionMethodRequestInput,
} from './extraction-method';

export interface ExtractionMethodDto extends Omit<ExtractionMethod, 'configurationSchema' | 'parameters' | 'requests' | 'versions'> {
  configurationSchema: Record<string, unknown> | string | null;
  parameters: ExtractionMethodParameterDto[];
  requests: ExtractionMethodRequestDto[];
  versions: ExtractionMethodVersionDto[];
}

export interface ExtractionMethodParameterDto {
  id: string;
  extractionMethodId: string;
  parameterKey: string;
  dataType: string;
  defaultValue: string | null;
  isRequired: boolean;
  isSecret: boolean;
  description: string | null;
}

export interface ExtractionMethodFieldDto extends ExtractionMethodFieldInput {
  id: string;
  requestId: string;
}

export interface ExtractionMethodRequestDto extends Omit<ExtractionMethodRequestInput, 'fields' | 'requestConfig'> {
  id: string;
  extractionMethodId: string;
  requestConfig: Record<string, unknown> | string;
  fields: ExtractionMethodFieldDto[];
}

export interface ExtractionMethodVersionDto {
  id: string;
  extractionMethodId: string;
  versionNumber: number;
  definitionSnapshot: Record<string, unknown> | string;
  createdAt: string;
}

export interface EquipmentExtractionMethodDto extends Omit<EquipmentExtractionMethod, 'connectionConfig'> {
  connectionConfig: Record<string, unknown> | string | null;
}
export type CreateEquipmentExtractionMethodDto = EquipmentExtractionMethodInput;
export type UpdateEquipmentExtractionMethodDto = EquipmentExtractionMethodInput;

export interface ExtractionMethodWriteDto extends ExtractionMethodInput {
  protocol: ExtractionMethodProtocol;
  parameters: ExtractionMethodParameterInput[];
  requests: ExtractionMethodRequestInput[];
}

export type CreateExtractionMethodDto = ExtractionMethodWriteDto;
export type UpdateExtractionMethodDto = ExtractionMethodWriteDto;

export type ExtractionMethodApiData<T> = {
  success: boolean;
  message?: string;
  data: T | null;
  errors?: Array<{ message: string }>;
};
