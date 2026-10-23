export type ValidationResult = string | true;

export function validateEmail(value: string, translate: (key: string) => string): ValidationResult {
  if (!value) {
    return translate('auth.emailRequired');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
    return translate('auth.emailInvalid');
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
