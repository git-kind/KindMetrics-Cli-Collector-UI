import { createRouter as createVueRouter, createWebHistory } from 'vue-router';
import { installationService } from '../services/installation.service';
import { authenticated, restore, useSession } from 'src/services/session/sessionService';

const routes = [
  {
    path: '/',
    component: () => import('layouts/LoginLayout.vue'),
    children: [
      { path: '', redirect: '/entry' },
      { path: 'entry', name: 'entry', meta: { public: true }, component: () => import('../pages/auth/EntryPage.vue') },
      { path: 'login', name: 'login', meta: { public: true }, component: () => import('../pages/auth/LoginPage.vue') },
      {
        path: 'installation',
        name: 'installation',
        meta: { public: true },
        component: () => import('../pages/auth/InstallationPage.vue'),
      },
      {
        path: 'auth/loginPage',
        name: 'login-component',
        meta: { public: true },
        component: () => import('../components/login/LoginComponent.vue'),
      },
      {
        path: 'company/select',
        name: 'company-select',
        component: () => import('../pages/company/CompanySelectPage.vue'),
      },
      {
        path: 'company/create',
        name: 'company-create',
        component: () => import('../pages/company/CompanyCreatePage.vue'),
      },
    ]
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: 'dashboard', name: 'dashboard', component: () => import('../pages/DashboardPage.vue') },
      { path: 'admin/companies', name: 'companies', component: () => import('../pages/company/CompaniesPage.vue') },
      { path: 'equipment', name: 'equipment', component: () => import('../pages/EquipmentPage.vue') },
      { path: 'origins', name: 'origins', component: () => import('../pages/OriginsPage.vue') },
      { path: 'extraction-methods', name: 'extraction-methods', component: () => import('../pages/ExtractionMethodsPage.vue') },
      { path: 'collectors', name: 'collectors', component: () => import('../pages/CollectorsPage.vue') },
      { path: 'collectors/:id', name: 'collector-detail', component: () => import('../pages/CollectorDetailPage.vue') },
      { path: 'mappings', name: 'mappings', component: () => import('../pages/MappingsPage.vue') },
      { path: 'storage', name: 'storage', component: () => import('../pages/StoragePage.vue') },
      { path: 'settings', name: 'settings', component: () => import('../pages/settings/SettingsPage.vue') },
    ],
  },
];

export function createRouter() {
  const { activeCompany } = useSession();
  const router = createVueRouter({
    history: createWebHistory(),
    routes,
  });

  router.beforeEach(async (to) => {
    restore();
    const mode = await installationService.getMode();
    const status = await installationService.getStatus();
    const effectiveMode = mode ?? (status === 'CONFIGURED' ? 'CUSTOMER' : null);
    if (to.name === 'entry') return true;
    if (to.name === 'installation') {
      if (mode === null) return { name: 'entry' };
      if (effectiveMode === 'KIND' && (
        to.query.createCompany === '1' || typeof to.query.companyId === 'string'
      )) {
        return authenticated.value ? true : { name: 'login' };
      }
      if (effectiveMode === 'KIND' || (effectiveMode === 'CUSTOMER' && status === 'CONFIGURED')) {
        return { name: 'login' };
      }
      return true;
    }
    if (effectiveMode !== 'KIND' && status !== 'CONFIGURED') {
      return { name: 'installation', query: to.query };
    }
    if (to.meta.public) return true;

    if (!authenticated.value) return { name: 'login', query: to.query };
    if (to.name === 'companies' && effectiveMode !== 'KIND') return { name: 'dashboard' };
    const companySelected = Boolean(activeCompany.value?.id);
    const companyRoutes = ['company-select', 'company-create'];
    const companyAdminRoute = to.name === 'companies';
    if (
      effectiveMode === 'KIND'
      && !companySelected
      && !companyRoutes.includes(String(to.name))
      && !companyAdminRoute
      && to.name !== 'dashboard'
    ) {
      return { name: 'company-select' };
    }
    if (effectiveMode === 'CUSTOMER' && !companySelected) {
      return { name: 'login' };
    }
    if (effectiveMode === 'CUSTOMER' && companyRoutes.includes(String(to.name))) {
      return { name: 'dashboard' };
    }
    return true;
  });

  return router;
}

export default createRouter;
