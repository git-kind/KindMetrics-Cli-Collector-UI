import type { User } from 'src/types/domain'
export const users: User[] = [
  { id: 1, name: 'Administrador', email: 'admin@demo.local', active: true, type: 'ADMIN', createdAt: '2026-01-10', updatedAt: '2026-01-10', companyAccess: [] },
  { id: 2, name: 'Operador Demo', email: 'operator@demo.local', active: true, type: 'USER', createdAt: '2026-02-14', updatedAt: '2026-02-14', companyAccess: [
    { companyId: 1, capabilities: ['CREATOR', 'VIEWER'], directPermissions: [], collectorSync: { eligible: false, status: 'NOT_CONFIGURED' } },
    { companyId: 2, capabilities: ['VIEWER'], directPermissions: [{ resource: 'dashboard', action: 'create' }], collectorSync: { eligible: false, status: 'NOT_CONFIGURED' } }
  ] },
  { id: 3, name: 'Collector Demo', email: 'collector@demo.local', active: true, type: 'USER', createdAt: '2026-03-01', updatedAt: '2026-03-01', companyAccess: [
    { companyId: 1, capabilities: ['COLLECTOR'], directPermissions: [], collectorSync: { eligible: true, status: 'PENDING' } }
  ] }
]