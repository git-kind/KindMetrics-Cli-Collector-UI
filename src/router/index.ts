import { createRouter as createVueRouter, createWebHistory } from 'vue-router';
import { installationService } from '../services/installation.service';

const routes = [
  {
    path: '/',
    component: () => import('layouts/LoginLayout.vue'),
    children: [
      { path: '', redirect: '/login' },
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
    const status = await installationService.getStatus();
    if (status !== 'CONFIGURED' && to.name !== 'installation') {
      return { name: 'installation', query: to.query };
    }
    if (status === 'CONFIGURED' && to.name === 'installation') return { name: 'login' };
    if (to.meta.public) return true;

    const authenticated = sessionStorage.getItem('kindmetrics-collector-auth') === '1';
    if (!authenticated) return { name: 'login', query: to.query };
    return true;
  });

  return router;
}

export default createRouter;
