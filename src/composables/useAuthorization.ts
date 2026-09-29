import { computed, ref } from 'vue';
import type { CompanyBranding } from '../types/ui';

const authenticated = ref(false);
const username = ref('');
const company = ref<CompanyBranding>({
  id: 'demo',
  name: 'PatitoFeo',
  logo: '/kind-logo.png',
});

export function useAuth() {
  const isAuthenticated = computed(() => authenticated.value);

  async function login(user: string, password: string): Promise<boolean> {
    if (user.trim() !== 'admin' || password.length <= 6) {
      return false;
    }
    username.value = user;
    authenticated.value = true;
    sessionStorage.setItem('kindmetrics-collector-auth', '1');
    sessionStorage.setItem('kindmetrics-collector-user', user.trim());
    return true;
  }

  function restore() {
    authenticated.value = sessionStorage.getItem('kindmetrics-collector-auth') === '1';
    username.value = sessionStorage.getItem('kindmetrics-collector-user') ?? '';
  }

  function logout() {
    authenticated.value = false;
    username.value = '';
    sessionStorage.removeItem('kindmetrics-collector-auth');
    sessionStorage.removeItem('kindmetrics-collector-user');
  }

  return {
    isAuthenticated,
    username,
    company,
    login,
    restore,
    logout,
  };
}

export function useAuthorization() {
  function can(permission: string): boolean {
    const authenticated = sessionStorage.getItem('kindmetrics-collector-auth') === '1';
    return authenticated && [
      'dashboard.view',
      'user.view',
      'collector.view',
      'collector.create',
      'collector.edit',
      'collector.execute',
      'collector.delete',
    ].includes(permission);
  }

  return { can };
}
