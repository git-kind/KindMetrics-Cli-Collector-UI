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
    if (user.trim() !== 'admin' || password !== 'admin123') {
      return false;
    }
    username.value = user;
    authenticated.value = true;
    sessionStorage.setItem('kindmetrics-collector-auth', '1');
    return true;
  }

  function restore() {
    authenticated.value = sessionStorage.getItem('kindmetrics-collector-auth') === '1';
  }

  function logout() {
    authenticated.value = false;
    username.value = '';
    sessionStorage.removeItem('kindmetrics-collector-auth');
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
