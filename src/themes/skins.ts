import type { SkinDefinition, SkinId } from '../types/ui';

export const skins: Record<SkinId, SkinDefinition> = {
  light: {
    id: 'light',
    nameKey: 'settings.skins.light',
    primary: '#164e83',
    secondary: '#19384b',
    background: '#f4f7f8',
    surface: '#ffffff',
    border: '#d5e0e3',
    text: '#17272d',
    muted: '#5e7077',
  },
  dark: {
    id: 'dark',
    nameKey: 'settings.skins.dark',
    primary: '#4b8bc5',
    secondary: '#19384b',
    background: '#07111e',
    surface: '#0d1c2b',
    border: '#29425d',
    text: '#f2f6fb',
    muted: '#91a4b9',
  },
};

export function getSkin(id: SkinId): SkinDefinition {
  return skins[id] ?? skins.light;
}
