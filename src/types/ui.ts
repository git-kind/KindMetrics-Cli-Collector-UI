export type SkinId = 'light' | 'dark';

export interface SkinDefinition {
  id: SkinId;
  nameKey: string;
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  border: string;
  text: string;
  muted: string;
}

export interface CompanyBranding {
  id: string;
  name: string;
  logo: string;
}
