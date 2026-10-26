export type ExtractionMethodProtocol = string;
export type ExtractionParameterType = string;
export type ExtractionRequestType = string;

export interface ExtractionMethodParameter {
  id: string;
  extractionMethodId: string;
  parameterKey: string;
  dataType: ExtractionParameterType;
  defaultValue: string | null;
  isRequired: boolean;
  isSecret: boolean;
  description: string | null;
}

export interface ExtractionMethodField {
  id: string;
  requestId: string;
  fieldKey: string;
  sourcePath: string;
  dataType: ExtractionParameterType;
  unit: string | null;
  description: string | null;
}

export interface ExtractionMethodRequest {
  id: string;
  extractionMethodId: string;
  code: string;
  name: string;
  requestType: ExtractionRequestType;
  requestConfig: Record<string, unknown>;
  isActive: boolean;
  fields: ExtractionMethodField[];
}

export interface ExtractionMethodVersion {
  id: string;
  extractionMethodId: string;
  versionNumber: number;
  definitionSnapshot: Record<string, unknown>;
  createdAt: string;
}

export interface EquipmentExtractionMethod {
  id: string;
  equipmentId: string;
  extractionMethodId: string;
  name: string;
  connectionConfig: Record<string, unknown> | null;
  credentialRef: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type EquipmentExtractionMethodInput = Pick<
  EquipmentExtractionMethod,
  'equipmentId' | 'name' | 'connectionConfig' | 'credentialRef' | 'isActive'
>;

export interface ExtractionMethod {
  id: string;
  code: string;
  name: string;
  description: string | null;
  protocol: ExtractionMethodProtocol;
  configurationSchema: Record<string, unknown> | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  parameters: ExtractionMethodParameter[];
  requests: ExtractionMethodRequest[];
  versions: ExtractionMethodVersion[];
}

export interface ExtractionMethodParameterInput {
  parameterKey: string;
  dataType: ExtractionParameterType;
  defaultValue: string | null;
  isRequired: boolean;
  isSecret: boolean;
  description: string | null;
}

export interface ExtractionMethodFieldInput {
  fieldKey: string;
  sourcePath: string;
  dataType: ExtractionParameterType;
  unit: string | null;
  description: string | null;
}

export interface ExtractionMethodRequestInput {
  code: string;
  name: string;
  requestType: ExtractionRequestType;
  requestConfig: Record<string, unknown>;
  isActive: boolean;
  fields: ExtractionMethodFieldInput[];
}

export interface ExtractionMethodInput {
  code: string;
  name: string;
  description: string | null;
  protocol: ExtractionMethodProtocol;
  configurationSchema: Record<string, unknown> | null;
  isActive: boolean;
  parameters: ExtractionMethodParameterInput[];
  requests: ExtractionMethodRequestInput[];
}

export function getAvailableDataFromMethod(method: ExtractionMethod): ExtractionAvailableData[] {
  return method.requests.flatMap((request) => request.fields.map((field) => ({
    id: field.id,
    name: field.fieldKey,
    description: field.description ?? '',
    source: method.protocol,
    status: method.isActive && request.isActive ? 'AVAILABLE' as const : 'UNAVAILABLE' as const,
  })));
}

export interface ExtractionAvailableData {
  id: string;
  name: string;
  description: string;
  source: string;
  status: 'AVAILABLE' | 'UNAVAILABLE';
}

export type ExtractionMethodType = ExtractionMethodProtocol;

export type ExtractionMethodMutationResult =
  | { success: true; method: ExtractionMethod }
  | { success: false; reason: 'required' | 'duplicate' | 'duplicate-nested' | 'not-found' };