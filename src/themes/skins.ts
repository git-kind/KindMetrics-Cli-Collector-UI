import type { SkinDefinition, SkinId } from '../types/ui';

export const skins: Record<SkinId, SkinDefinition> = {
  default: {
    id: 'default',
    nameKey: 'settings.skins.default',
    primary: '#0b6170',
    secondary: '#123b49',
    background: '#061923',
    surface: '#0a202b',
    border: '#294551',
    text: '#f4f8fa',
    muted: '#8ca6b2',
  },
  midnight: {
    id: 'midnight',
    nameKey: 'settings.skins.midnight',
    primary: '#274c77',
    secondary: '#162a43',
    background: '#07111e',
    surface: '#0d1c2b',
    border: '#29425d',
    text: '#f2f6fb',
    muted: '#91a4b9',
  },
  slate: {
    id: 'slate',
    nameKey: 'settings.skins.slate',
    primary: '#3d5968',
    secondary: '#263842',
    background: '#10171b',
    surface: '#172127',
    border: '#384b55',
    text: '#f0f4f5',
    muted: '#9aaab1',
  },
};

export function getSkin(id: SkinId): SkinDefinition {
  return skins[id] ?? skins.default;
}
