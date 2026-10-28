import type {
	Collector,
	CollectorDataStructure,
	CollectorField,
	CollectorFilters,
	CollectorFormValue,
	CollectorHealthMock,
	CollectorIndex,
	CollectorLogMock,
	CollectorReferenceData,
	CollectorTable,
	CollectorTestResultMock,
	CollectorTestType,
} from '../models/collector';

export interface CollectorRepository {
	list(companyCode: string, filters: CollectorFilters): Promise<Collector[]>;
	getById(companyCode: string, id: string): Promise<Collector | null>;
	create(companyCode: string, value: CollectorFormValue): Promise<Collector>;
	update(companyCode: string, id: string, value: CollectorFormValue): Promise<Collector | null>;
	delete(companyCode: string, id: string): Promise<boolean>;
	activate(companyCode: string, id: string): Promise<Collector | null>;
	deactivate(companyCode: string, id: string): Promise<Collector | null>;
	getReferenceData(companyCode: string): Promise<CollectorReferenceData>;
	getHealth(companyCode: string, id: string): Promise<CollectorHealthMock | null>;
	getLogs(companyCode: string, id: string): Promise<CollectorLogMock[] | null>;
	executeCollector(companyCode: string, id: string): Promise<CollectorTestResultMock | null>;
	synchronizeCollector(companyCode: string, id: string): Promise<boolean>;
	executeTest(companyCode: string, id: string, type: CollectorTestType): Promise<CollectorTestResultMock | null>;
	getDataStructure(companyCode: string, collectorId: string): Promise<CollectorDataStructure | null>;
	createTable(companyCode: string, collectorId: string, table: Omit<CollectorTable, 'id' | 'status' | 'fields' | 'indexes'>): Promise<CollectorTable | null>;
	updateTable(companyCode: string, collectorId: string, tableId: string, table: Partial<CollectorTable>): Promise<CollectorTable | null>;
	deleteTable(companyCode: string, collectorId: string, tableId: string): Promise<boolean>;
	createField(companyCode: string, collectorId: string, tableId: string, field: Omit<CollectorField, 'id'>): Promise<CollectorField | null>;
	updateField(companyCode: string, collectorId: string, tableId: string, fieldId: string, field: Partial<CollectorField>): Promise<CollectorField | null>;
	deleteField(companyCode: string, collectorId: string, tableId: string, fieldId: string): Promise<boolean>;
	createIndex(companyCode: string, collectorId: string, tableId: string, index: Omit<CollectorIndex, 'id'>): Promise<CollectorIndex | null>;
	updateIndex(companyCode: string, collectorId: string, tableId: string, indexId: string, index: Partial<CollectorIndex>): Promise<CollectorIndex | null>;
	deleteIndex(companyCode: string, collectorId: string, tableId: string, indexId: string): Promise<boolean>;
	validateStructure(companyCode: string, collectorId: string): Promise<{ valid: boolean; errors: string[] }>; 
	previewChanges(companyCode: string, collectorId: string): Promise<string[]>;
	applyChanges(companyCode: string, collectorId: string): Promise<{ success: boolean; message: string }>;
}
