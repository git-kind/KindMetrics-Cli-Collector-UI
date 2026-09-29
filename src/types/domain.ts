export interface CompanyAccess {
  companyId: number;
  capabilities: string[];
  directPermissions: Array<{ resource: string; action: string }>;
  collectorSync: { eligible: boolean; status: string };
}

export interface User {
  id: number;
  name: string;
  email: string;
  active: boolean;
  type: 'ADMIN' | 'USER';
  createdAt: string;
  updatedAt: string;
  companyAccess: CompanyAccess[];
}

export interface Company {
  id: number;
  name: string;
  active: boolean;
  status: string;
}