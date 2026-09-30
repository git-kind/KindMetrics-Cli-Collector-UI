export type MappingTransformationType =
  | 'NONE'
  | 'CONVERT_TYPE'
  | 'MULTIPLY'
  | 'DIVIDE'
  | 'ADD'
  | 'SUBTRACT'
  | 'EXTRACT'
  | 'MAP_VALUE';

export type MappingStatus = 'CONFIGURADA' | 'INCOMPLETA' | 'ERROR';

export interface DataMapping {
  id: string;
  collectorId: string;
  dataId: string;
  acquisitionMethodId: string;
  sourceField: string;
  transformation: MappingTransformationType;
  transformationConfig: Record<string, unknown> | null;
  destinationTable: string;
  destinationField: string;
  status: MappingStatus;
  createdAt: string;
  updatedAt: string;
}

export type DataMappingFormValue = Omit<
  DataMapping,
  'id' | 'status' | 'createdAt' | 'updatedAt'
> & {
  status?: MappingStatus;
};

export interface DataMappingValidationResult {
  valid: boolean;
  errors: string[];
}

export interface DataMappingTestResult {
  status: 'SUCCESS' | 'ERROR';
  message: string;
  sampleValue?: string | number;
  destinationValue?: string;
}
