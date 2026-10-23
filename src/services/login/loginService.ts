import { login as loginRepository } from 'src/repositories/login.repository';
import { establishAuthSession } from 'src/services/session/authSession';

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  try {
    const response = await loginRepository({
      email: payload.email.trim(),
      password: payload.password,
    });
    const accessToken = response.accessToken
      ?? response.access_token
      ?? response.token
      ?? response.data?.accessToken
      ?? response.data?.access_token
      ?? response.data?.token;

    if (!accessToken) {
      return { success: false, message: 'La respuesta de autenticación no incluye un token.' };
    }

    establishAuthSession(payload.email.trim(), accessToken);
    return {
      success: true,
      message: `Bienvenido${payload.rememberMe ? ' de nuevo' : ''}, ${payload.email.trim()}.`,
    };
  } catch {
    return {
      success: false,
      message: 'No fue posible iniciar sesión.',
    };
  }
}
