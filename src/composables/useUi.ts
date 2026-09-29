import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { getSkin } from '../themes/skins';
import type { SkinId } from '../types/ui';

const dark = ref(false);
const skin = ref<SkinId>('default');

export function useUi() {
  const { locale } = useI18n();
  const currentSkin = computed(() => getSkin(skin.value));

  function applySkin(id: SkinId): void {
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
    localStorage.setItem('kindmetrics.ui.skin', id);
  }

  function toggleDark(): void {
    dark.value = !dark.value;
    sessionStorage.setItem('kindmetrics.ui.dark', String(dark.value));
  }

  function setLocale(value: string): void {
    locale.value = value;
    sessionStorage.setItem('kindmetrics.ui.locale', value);
  }

  onMounted(() => {
    dark.value = sessionStorage.getItem('kindmetrics.ui.dark') === 'true';
    const savedLocale = sessionStorage.getItem('kindmetrics.ui.locale');
    if (savedLocale) locale.value = savedLocale;
    const savedSkin = localStorage.getItem('kindmetrics.ui.skin') as SkinId | null;
    applySkin(savedSkin ?? 'default');
  });

  return {
    dark,
    locale,
    skin,
    currentSkin,
    applySkin,
    toggleDark,
    setLocale,
    setLanguage: setLocale,
  };
}
