import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { getSkin } from '../themes/skins';
import type { SkinId } from '../types/ui';

const STORAGE_SKIN = 'kindmetrics-collector-skin';
const STORAGE_LOCALE = 'kindmetrics-collector-locale';

const skin = ref<SkinId>('default');

export function useUi() {
  const { locale } = useI18n();
  const currentSkin = computed(() => getSkin(skin.value));

  function applySkin(id: SkinId) {
    skin.value = id;
    const selected = getSkin(id);
    const root = document.documentElement;
    root.style.setProperty('--km-primary', selected.primary);
    root.style.setProperty('--km-secondary', selected.secondary);
    root.style.setProperty('--km-background', selected.background);
    root.style.setProperty('--km-surface', selected.surface);
    root.style.setProperty('--km-border', selected.border);
    root.style.setProperty('--km-text', selected.text);
    root.style.setProperty('--km-muted', selected.muted);
    localStorage.setItem(STORAGE_SKIN, id);
  }

  function setLanguage(value: string) {
    locale.value = value;
    localStorage.setItem(STORAGE_LOCALE, value);
  }

  onMounted(() => {
    const savedSkin = localStorage.getItem(STORAGE_SKIN) as SkinId | null;
    const savedLocale = localStorage.getItem(STORAGE_LOCALE);
    applySkin(savedSkin ?? 'default');
    if (savedLocale) locale.value = savedLocale;
  });

  return {
    skin,
    currentSkin,
    applySkin,
    setLanguage,
  };
}
