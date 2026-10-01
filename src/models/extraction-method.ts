export type ExtractionMethodType = 'SNMP' | 'API' | 'MICROSOFT_GRAPH' | 'WEBHOOK';
export type ExtractionMethodStatus = 'ACTIVE' | 'INACTIVE';
export type ExtractionDiscoveryStatus = 'CONFIGURED' | 'PENDING' | 'RUNNING' | 'COMPLETED' | 'ERROR';

export interface ExtractionAvailableData {
	id: string;
	name: string;
	description: string;
	source: string;
	status: 'AVAILABLE' | 'UNAVAILABLE';
}

export interface ExtractionDiscovery {
	status: ExtractionDiscoveryStatus;
	completedAt: string | null;
	definitionId?: string | null;
	definitionName?: string | null;
	device?: {
		name: string;
		manufacturer: string;
		model: string;
		operatingSystem: string;
		version: string;
		sysObjectID?: string;
		sysDescr?: string;
	} | null;
	resources: string[];
}

export interface ExtractionMethod {
	id: string;
	companyId: string;
	name: string;
	type: ExtractionMethodType;
	description: string;
	status: ExtractionMethodStatus;
	connection: Record<string, string | number | boolean>;
	target: { kind: 'DEVICE' | 'SERVICE' | 'ENDPOINT' | 'EVENT_SOURCE'; name: string } | null;
	discovery: ExtractionDiscovery;
	availableData: ExtractionAvailableData[];
	createdAt: string;
	updatedAt: string;
}

export type ExtractionMethodInput = Pick<
	ExtractionMethod,
	'name' | 'type' | 'description' | 'connection'
>;

export type ExtractionMethodMutationResult =
	| { success: true; method: ExtractionMethod }
	| { success: false; reason: 'required' | 'duplicate' | 'not-found' };

export interface ExtractionConnectionTestResult {
	success: boolean;
	messageKey: 'extractionMethods.messages.connectionSuccess' | 'extractionMethods.messages.connectionError';
}
