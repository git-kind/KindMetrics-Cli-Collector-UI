import { createI18n } from 'vue-i18n';
import es from './locales/es';
import en from './locales/en';

export const i18n = createI18n({
  legacy: false,
  locale: 'es',
  fallbackLocale: 'en',
  messages: { es, en },
});
