export type CollectorStatus = 'ACTIVE' | 'INACTIVE';
export type CollectorExecutionStatus = 'SUCCESS' | 'ERROR' | 'RUNNING';
export type CollectorTestType =
	| 'connection'
	| 'extraction'
	| 'transformation'
	| 'mapping'
	| 'storage';
export type CollectorTestStatus = 'RUNNING' | 'SUCCESS' | 'ERROR';
export type CollectorStructureStatus =
	| 'NOT_DEFINED'
	| 'DEFINED'
	| 'SYNCED'
	| 'PENDING_CHANGES'
	| 'ERROR';

export type CollectorFieldType =
	| 'BIGINT'
	| 'INT'
	| 'DECIMAL'
	| 'VARCHAR'
	| 'TEXT'
	| 'BOOLEAN'
	| 'DATE'
	| 'DATETIME'
	| 'TIMESTAMP'
	| 'JSON';

export interface CollectorField {
	id: string;
	name: string;
	type: CollectorFieldType;
	length?: number | null;
	precision?: number | null;
	scale?: number | null;
	nullable: boolean;
	primaryKey: boolean;
	autoIncrement: boolean;
	defaultValue?: string | null;
	description?: string | null;
}

export interface CollectorIndex {
	id: string;
	name: string;
	type: 'INDEX' | 'UNIQUE' | 'FULLTEXT' | 'PRIMARY';
	fields: string[];
}

export interface CollectorTable {
	id: string;
	name: string;
	description: string;
	status: CollectorStructureStatus;
	fields: CollectorField[];
	indexes: CollectorIndex[];
}

export interface CollectorDataStructure {
	id: string;
	collectorId: string;
	status: CollectorStructureStatus;
	tables: CollectorTable[];
	lastValidationMessage?: string | null;
	previewChanges?: string[];
}

export interface Collector {
	id: string;
	companyId: string;
	name: string;
	code: string;
	description: string;
	extractionMethodIds: string[];
	selectedData: string[];
	type: string | null;
	status: CollectorStatus;
	equipmentId: string | null;
	originVersionId: string | null;
	executionMode: string | null;
	schedule: string | null;
	lastExecutionAt: string | null;
	nextExecutionAt: string | null;
	lastExecutionStatus: CollectorExecutionStatus | null;
	configuration: Record<string, unknown>;
	createdAt: string;
	updatedAt: string;
}

export interface CollectorFieldDefinition {
	name: string;
	type: string;
	nullable?: boolean;
	primaryKey?: boolean;
	description?: string;
}

export interface CollectorTableDefinition {
	name: string;
	fields: CollectorFieldDefinition[];
	indexes?: string[];
}

export interface CollectorDataStructureDefinition {
	status: CollectorStructureStatus;
	tables: CollectorTableDefinition[];
	lastValidation?: string;
	pendingChanges?: string[];
}

export type AcquisitionMethodType = 'API' | 'SNMP' | 'WEBHOOK' | 'MICROSOFT_GRAPH';
export type AcquisitionDataStatus = 'ACTIVE' | 'INACTIVE' | 'WARN';

export interface CollectorConnectionConfig {
	name: string;
	type: AcquisitionMethodType;
	status: 'OK' | 'WARN' | 'ERROR';
	host?: string;
	port?: number;
	url?: string;
	username?: string;
	password?: string;
	token?: string;
	authentication?: string;
	timeout?: number;
	tls?: boolean;
	version?: string;
	community?: string;
	tenantId?: string;
	clientId?: string;
	channel?: string;
	webhookUrl?: string;
	method?: string;
	authType?: string;
	privacy?: string;
}

export interface CollectorExtractionConfig {
	name: string;
	method: AcquisitionMethodType | 'GET' | 'POST' | 'SNMP';
	httpMethod?: string;
	endpoint?: string;
	parameters?: string[];
	headers?: string[];
	responseFormat?: string;
	jsonPath?: string;
	selector?: string;
	oid?: string;
	type?: string;
}

export interface CollectorAcquisitionMethod {
	name: string;
	type: AcquisitionMethodType;
	status: AcquisitionDataStatus | 'ERROR';
	connection: CollectorConnectionConfig;
	extraction: CollectorExtractionConfig;
	lastTest?: string;
}

export interface CollectorAcquisitionDataItem {
	id: string;
	name: string;
	description: string;
	status: AcquisitionDataStatus;
	methodType: AcquisitionMethodType;
	methodName: string;
	connection: CollectorConnectionConfig;
	extraction: CollectorExtractionConfig;
	lastTest?: string;
	testResult?: {
		status: 'SUCCESS' | 'ERROR';
		message: string;
		value?: string;
		records?: number;
		source?: string;
		date?: string;
	};
}

export interface CollectorTransformation {
	name: 'NONE' | 'CONVERT_TYPE' | 'MULTIPLY' | 'DIVIDE' | 'ADD' | 'SUBTRACT' | 'EXTRACT' | 'MAP_VALUE';
	description: string;
}

export interface CollectorMappingRule {
	logicalField: string;
	description: string;
	sourceMethod: string;
	sourceField: string;
	transformation: CollectorTransformation;
	targetTable: string;
	targetField: string;
}

export interface CollectorExecutionSummary {
	mode: 'Scheduled' | 'Manual';
	schedule: string;
	lastExecutionAt: string | null;
	nextExecutionAt: string | null;
	result: 'SUCCESS' | 'ERROR' | 'RUNNING';
	recordsObtained: number;
	recordsStored: number;
}

export interface CollectorSynchronizationState {
	enabled: boolean;
	destination: string | null;
	frequency: string | null;
	lastSyncAt: string | null;
	pendingRecords: number;
	sentRecords: number;
	errorRecords: number;
	result: 'SUCCESS' | 'ERROR' | 'NOT_REQUIRED';
}

export type CollectorFormValue = Pick<
	Collector,
	| 'name'
	| 'code'
	| 'description'
	| 'extractionMethodIds'
	| 'selectedData'
	| 'type'
	| 'equipmentId'
	| 'originVersionId'
	| 'executionMode'
	| 'schedule'
	| 'configuration'
>;

export interface CollectorFilters {
	search: string;
	status: CollectorStatus | 'ALL';
}

export interface CollectorReferenceOption {
	id: string;
	name: string;
}

export interface CollectorReferenceData {
	equipment: CollectorReferenceOption[];
	originVersions: CollectorReferenceOption[];
}

export interface CollectorHealthMock {
	status: CollectorExecutionStatus | 'NOT_RUN';
	lastExecutionAt: string | null;
	lastSuccessfulExecutionAt: string | null;
	durationMs: number | null;
	recordsProcessed: number;
	errors: number;
	lastErrorKey: string | null;
}

export interface CollectorLogMock {
	id: string;
	timestamp: string;
	level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
	messageKey: string;
	executionId: string | null;
	errorKey: string | null;
	durationMs?: number | null;
	recordsProcessed?: number | null;
}

export interface CollectorTestResultMock {
	status: Exclude<CollectorTestStatus, 'RUNNING'>;
	messageKey: string;
	durationMs: number;
}
