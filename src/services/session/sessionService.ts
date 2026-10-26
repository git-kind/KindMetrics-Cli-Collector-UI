import { computed, ref } from 'vue';
import type { ActiveCompany, Company, CompanySessionDto } from 'src/models/company';

const sessionStorageKey = 'kindmetrics.session.context';
const legacyCompanyStorageKey = 'kindmetrics-active-company';
export const authenticated = ref(false);
export const username = ref('');
const activeCompany = ref<ActiveCompany | null>(null);
let accessToken: string | null = null;
let contextRestored = false;

interface PersistedSessionContext {
  version: 2;
  username: string;
  company: CompanySessionDto | null;
}

function getSessionStorage(): Storage | null {
  return typeof window === 'undefined' ? null : window.sessionStorage;
}

function persistContext(): void {
  const storage = getSessionStorage();
  if (!storage) return;
  storage.removeItem(legacyCompanyStorageKey);
  if (!username.value && !activeCompany.value) {
    storage.removeItem(sessionStorageKey);
    return;
  }

  const company = activeCompany.value;
  const context: PersistedSessionContext = {
    version: 2,
    username: username.value,
    company: company
      ? {
          code: company.code,
          name: company.name,
          shortName: company.shortName,
          status: company.status,
          logo: company.logo,
          timezone: company.timezone,
          locale: company.locale,
        }
      : null,
  };
  storage.setItem(sessionStorageKey, JSON.stringify(context));
}

function isPersistedCompany(value: unknown): value is CompanySessionDto {
  if (!value || typeof value !== 'object') return false;
  const company = value as Record<string, unknown>;
  return typeof company.code === 'string'
    && typeof company.name === 'string'
    && typeof company.shortName === 'string'
    && (company.status === 'ACTIVE' || company.status === 'INACTIVE');
}

function restoreSessionContext(): void {
  const storage = getSessionStorage();
  if (!storage) return;
  storage.removeItem(legacyCompanyStorageKey);
  const saved = storage.getItem(sessionStorageKey);
  if (!saved) return;

  try {
    const context: unknown = JSON.parse(saved);
    if (!context || typeof context !== 'object') throw new Error('Invalid session context');
    const parsed = context as Partial<PersistedSessionContext>;
    if (parsed.version !== 2 || typeof parsed.username !== 'string') throw new Error('Invalid session context');
    username.value = parsed.username;
    if (isPersistedCompany(parsed.company)) {
      activeCompany.value = parsed.company;
    }
  } catch {
    storage.removeItem(sessionStorageKey);
    username.value = '';
    activeCompany.value = null;
  }
}

export function establishAuthSession(email: string, token: string): void {
  username.value = email;
  activeCompany.value = null;
  accessToken = token;
  authenticated.value = true;
  persistContext();
}

export function setActiveCompany(company: Company): void {
  activeCompany.value = { ...company, configJson: { ...company.configJson } };
  persistContext();
}

export function clearActiveCompany(): void {
  activeCompany.value = null;
  persistContext();
}

export function clearSession(): void {
  username.value = '';
  accessToken = null;
  authenticated.value = false;
  activeCompany.value = null;
  contextRestored = true;
  const storage = getSessionStorage();
  storage?.removeItem(sessionStorageKey);
  storage?.removeItem(legacyCompanyStorageKey);
}

export function getAccessToken(): string | null {
  return accessToken;
}

function getSessionCompanyCodeFromStorage(): string | null {
  const storage = getSessionStorage();
  if (!storage) return null;

  try {
    const saved = storage.getItem(sessionStorageKey);
    if (!saved) return null;

    const context = JSON.parse(saved) as Partial<PersistedSessionContext>;
    const code = typeof context.company?.code === 'string' ? context.company.code.trim() : '';
    return code || null;
  } catch {
    return null;
  }
}

export function getActiveCompanyCode(): string | null {
  const currentCode = activeCompany.value?.code?.trim();
  if (currentCode) return currentCode;

  return getSessionCompanyCodeFromStorage();
}

export function restore(): void {
  if (contextRestored) return;
  contextRestored = true;
  restoreSessionContext();
}

export function useSession() {
  return {
    authenticated: computed(() => authenticated.value),
    username: computed(() => username.value),
    activeCompany: computed(() => activeCompany.value),
    isAuthenticated: computed(() => authenticated.value),
    establishAuthSession,
    setActiveCompany,
    clearActiveCompany,
    clearSession,
    getAccessToken,
    getActiveCompanyCode,
    restore,
  };
}