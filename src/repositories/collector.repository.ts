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
	list(companyId: string, filters: CollectorFilters): Promise<Collector[]>;
	getById(companyId: string, id: string): Promise<Collector | null>;
	create(companyId: string, value: CollectorFormValue): Promise<Collector>;
	update(companyId: string, id: string, value: CollectorFormValue): Promise<Collector | null>;
	delete(companyId: string, id: string): Promise<boolean>;
	activate(companyId: string, id: string): Promise<Collector | null>;
	deactivate(companyId: string, id: string): Promise<Collector | null>;
	getReferenceData(): Promise<CollectorReferenceData>;
	getHealth(companyId: string, id: string): Promise<CollectorHealthMock | null>;
	getLogs(companyId: string, id: string): Promise<CollectorLogMock[] | null>;
	executeTest(companyId: string, id: string, type: CollectorTestType): Promise<CollectorTestResultMock | null>;
	getDataStructure(companyId: string, collectorId: string): Promise<CollectorDataStructure | null>;
	createTable(companyId: string, collectorId: string, table: Omit<CollectorTable, 'id' | 'status' | 'fields' | 'indexes'>): Promise<CollectorTable | null>;
	updateTable(companyId: string, collectorId: string, tableId: string, table: Partial<CollectorTable>): Promise<CollectorTable | null>;
	deleteTable(companyId: string, collectorId: string, tableId: string): Promise<boolean>;
	createField(companyId: string, collectorId: string, tableId: string, field: Omit<CollectorField, 'id'>): Promise<CollectorField | null>;
	updateField(companyId: string, collectorId: string, tableId: string, fieldId: string, field: Partial<CollectorField>): Promise<CollectorField | null>;
	deleteField(companyId: string, collectorId: string, tableId: string, fieldId: string): Promise<boolean>;
	createIndex(companyId: string, collectorId: string, tableId: string, index: Omit<CollectorIndex, 'id'>): Promise<CollectorIndex | null>;
	updateIndex(companyId: string, collectorId: string, tableId: string, indexId: string, index: Partial<CollectorIndex>): Promise<CollectorIndex | null>;
	deleteIndex(companyId: string, collectorId: string, tableId: string, indexId: string): Promise<boolean>;
	validateStructure(companyId: string, collectorId: string): Promise<{ valid: boolean; errors: string[] }>; 
	previewChanges(companyId: string, collectorId: string): Promise<string[]>;
	applyChanges(companyId: string, collectorId: string): Promise<{ success: boolean; message: string }>;
}
