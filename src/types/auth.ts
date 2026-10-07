export type UserRole = 'AGENCY_MANAGER' | 'CLIENT_VIEWER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  agencyName: string;
  clientAccountId?: string;
  avatarInitials: string;
}

export type BrandColor = 'social' | 'emerald' | 'indigo' | 'blue' | 'violet' | 'slate';
export type LogoType = 'ICON_AB' | 'CUSTOM_TEXT' | 'MINIMAL';

export interface BrandConfig {
  appName: string;
  parentBrand: string;
  tagline: string;
  primaryColor: BrandColor;
  logoType: LogoType;
  /** Texto do logotipo; as iniciais do ícone saem dele. */
  customLogoText: string;
  /** Número com DDI e DDD, só dígitos (ex.: 5511999999999). */
  supportWhatsapp: string;
  showPoweredBy: boolean;
  clientCustomDomain: string;
}

export const defaultBrandConfig: BrandConfig = {
  appName: 'AB AdsDesk',
  parentBrand: 'AB Software',
  tagline: 'Resultados de anúncios no Instagram e Facebook',
  primaryColor: 'social',
  logoType: 'ICON_AB',
  customLogoText: 'AB Software',
  supportWhatsapp: '5511999999999',
  showPoweredBy: true,
  clientCustomDomain: 'app.absoftware.io/cliente/raropilates',
};

export const demoUsers: User[] = [
  {
    id: 'user_ab_manager',
    name: 'Abner Senna',
    email: 'abner@absoftware.com.br',
    role: 'AGENCY_MANAGER',
    agencyName: 'AB Software',
    avatarInitials: 'AS',
  },
  {
    id: 'user_client_raro',
    name: 'Camila Rocha',
    email: 'gestao@raropilates.com.br',
    role: 'CLIENT_VIEWER',
    agencyName: 'AB Software',
    clientAccountId: 'act_raro_pilates',
    avatarInitials: 'CR',
  },
];

export const roleLabel: Record<UserRole, string> = {
  AGENCY_MANAGER: 'Gestor da agência',
  CLIENT_VIEWER: 'Cliente',
};
