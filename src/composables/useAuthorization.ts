import { computed, ref } from 'vue';
import type { Company } from '../models/company';
import { login as loginService } from 'src/services/login/loginService';
import { authenticated, clearAuthSession, username } from 'src/services/session/authSession';

const activeCompany = ref<Company | null>(null);
const companyContextKey = 'kindmetrics-active-company';

export function useAuth() {
  const isAuthenticated = computed(() => authenticated.value);

  async function login(email: string, password: string, rememberMe = false): Promise<boolean> {
    const result = await loginService({ email, password, rememberMe });
    return result.success;
  }

  function restore() {
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
    clearAuthSession();
    clearActiveCompany();
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
    return authenticated.value && [
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
