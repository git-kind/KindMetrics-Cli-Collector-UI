export type ValidationResult = string | true;

export function validateUsername(value: string, translate: (key: string) => string): ValidationResult {
  if (!value) {
    return translate('auth.usernameRequired');
  }

  if (value.trim().length < 3) {
    return translate('auth.usernameMinLength');
  }

  return true;
}

export function validatePassword(value: string, translate: (key: string) => string): ValidationResult {
  if (!value) {
    return translate('auth.passwordRequired');
  }

  if (value.length <= 6) {
    return translate('auth.passwordMinLength');
  }

  return true;
}
