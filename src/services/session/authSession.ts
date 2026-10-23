import { ref } from 'vue';

export const authenticated = ref(false);
export const username = ref('');

let accessToken: string | null = null;

export function establishAuthSession(email: string, token: string): void {
  username.value = email;
  accessToken = token;
  authenticated.value = true;
}

export function clearAuthSession(): void {
  username.value = '';
  accessToken = null;
  authenticated.value = false;
}

export function getAccessToken(): string | null {
  return accessToken;
}