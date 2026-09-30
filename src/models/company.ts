export type CompanyStatus = 'ACTIVE' | 'INACTIVE';

export interface Company {
	id: string;
	code: string;
	name: string;
	databaseName: string;
	status: CompanyStatus;
	logo: string;
}

export interface CreateCompanyInput {
	name: string;
	code: string;
	databaseName: string;
}

export type CreateCompanyResult =
	| { success: true; company: Company }
	| { success: false; reason: 'required' | 'duplicate' };
