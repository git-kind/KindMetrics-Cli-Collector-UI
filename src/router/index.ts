import { createRouter as createVueRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../pages/auth/LoginPage.vue'),
  },
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: '/dashboard' },
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

  router.beforeEach((to) => {
    const authenticated = sessionStorage.getItem('kindmetrics-collector-auth') === '1';
    if (to.name !== 'login' && !authenticated) return { name: 'login' };
    if (to.name === 'login' && authenticated) return { name: 'dashboard' };
    return true;
  });

  return router;
}
