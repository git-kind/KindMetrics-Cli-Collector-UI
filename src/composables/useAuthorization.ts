import { computed } from 'vue';
import { login as loginService } from 'src/services/login/loginService';
import {
  authenticated,
  clearActiveCompany,
  clearSession,
  restore,
  setActiveCompany,
  useSession,
  username,
} from 'src/services/session/sessionService';

const { activeCompany: sessionCompany } = useSession();

export function useAuth() {
  restore();

  const isAuthenticated = computed(() => authenticated.value);
  const company = computed(() => sessionCompany.value);

  async function login(email: string, password: string, rememberMe = false): Promise<boolean> {
    const result = await loginService({ email, password, rememberMe });
    return result.success;
  }

  function logout(): void {
    clearSession();
  }

  return {
    isAuthenticated,
    username,
    company,
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