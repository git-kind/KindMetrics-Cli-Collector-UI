import { createRouter as createVueRouter, createWebHistory } from 'vue-router';
import { installationService } from '../services/installation.service';

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
  const router = createVueRouter({
    history: createWebHistory(),
    routes,
  });

  router.beforeEach(async (to) => {
    const mode = await installationService.getMode();
    const status = await installationService.getStatus();
    const effectiveMode = mode ?? (status === 'CONFIGURED' ? 'CUSTOMER' : null);
    if (to.name === 'entry') return true;
    if (to.name === 'installation') {
      if (mode === null) return { name: 'entry' };
      if (effectiveMode === 'KIND' && to.query.createCompany === '1') {
        const authenticated = sessionStorage.getItem('kindmetrics-collector-auth') === '1';
        return authenticated ? true : { name: 'login' };
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

    const authenticated = sessionStorage.getItem('kindmetrics-collector-auth') === '1';
    if (!authenticated) return { name: 'login', query: to.query };
    const companySelected = sessionStorage.getItem('kindmetrics-active-company') !== null;
    const companyRoutes = ['company-select', 'company-create'];
    if (effectiveMode === 'KIND' && !companySelected && !companyRoutes.includes(String(to.name))) {
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
