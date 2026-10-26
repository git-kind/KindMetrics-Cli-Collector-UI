export type CompanyStatus = 'ACTIVE' | 'INACTIVE';

export interface CompanySessionDto {
	code: string;
	name: string;
	shortName: string;
	status: CompanyStatus;
	logo: string;
	timezone: string;
	locale: 'es' | 'en';
}

export type ActiveCompany = Company | (CompanySessionDto & {
	id?: never;
	databaseName?: never;
	configJson?: never;
});

export interface CompanyFormFields {
	name: string;
	shortName: string;
	code: string;
	status?: CompanyStatus;
}

export interface Company {
	id: string;
	code: string;
	name: string;
	shortName: string;
	databaseName: string;
	status: CompanyStatus;
	logo: string;
	timezone: string;
	locale: 'es' | 'en';
	configJson: Record<string, unknown>;
}

export interface CreateCompanyInput {
	name: string;
	shortName: string;
	code: string;
	databaseName?: string;
	timezone: string;
	locale: 'es' | 'en';
	configJson: Record<string, unknown>;
}

export interface UpdateCompanyInput extends Omit<CreateCompanyInput, 'databaseName'> {
	databaseName: string;
	status: CompanyStatus;
}

export type CreateCompanyResult =
	| { success: true; company: Company }
	| { success: false; reason: 'required' | 'duplicate' };
