import type { User } from 'src/types/domain'
import { users } from 'src/mocks/users'

export interface LoginPayload {
  username: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const user = users.find(item => item.email.split('@')[0] === payload.username.trim().toLowerCase())
  if (user?.active && payload.password.length >= 6) {
    return {
      success: true,
      message: `Bienvenido${payload.rememberMe ? ' de nuevo' : ''}, ${payload.username.trim()}.`,
      user: structuredClone(user),
    };
  }

  return {
    success: false,
    message: 'Credenciales inválidas. Prueba con usuario "admin" y una contraseña válida.',
  };
}
