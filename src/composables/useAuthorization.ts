import { computed, ref } from 'vue';
import type { Company } from '../models/company';

const authenticated = ref(false);
const username = ref('');
const activeCompany = ref<Company | null>(null);
const companyContextKey = 'kindmetrics-active-company';

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
    const savedCompany = sessionStorage.getItem(companyContextKey);
    if (savedCompany) {
      try {
        activeCompany.value = JSON.parse(savedCompany) as Company;
      } catch {
        sessionStorage.removeItem(companyContextKey);
        activeCompany.value = null;
      }
    } else {
      activeCompany.value = null;
    }
  }

  function setActiveCompany(value: Company): void {
    activeCompany.value = { ...value };
    sessionStorage.setItem(companyContextKey, JSON.stringify(value));
  }

  function clearActiveCompany(): void {
    sessionStorage.removeItem(companyContextKey);
    activeCompany.value = null;
  }

  function logout() {
    authenticated.value = false;
    username.value = '';
    clearActiveCompany();
    sessionStorage.removeItem('kindmetrics-collector-auth');
    sessionStorage.removeItem('kindmetrics-collector-user');
  }

  restore();

  return {
    isAuthenticated,
    username,
    company: computed(() => activeCompany.value),
    login,
    restore,
    setActiveCompany,
    clearActiveCompany,
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
