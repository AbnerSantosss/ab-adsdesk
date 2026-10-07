import { ChartNoAxesCombined, Instagram, House, Megaphone, ShieldCheck, Settings2, type LucideIcon } from 'lucide-react';
import type { ActiveTab } from '../types/metaAds';

export interface TabMeta {
  id: ActiveTab;
  label: string;
  /** Rótulo da barra inferior no celular. */
  shortLabel: string;
  icon: LucideIcon;
  /** Trecho da URL (#campanhas), para o botão voltar e links diretos funcionarem. */
  slug: string;
  managerOnly?: boolean;
}

export const TABS: TabMeta[] = [
  { id: 'OVERVIEW', label: 'Visão geral', shortLabel: 'Início', icon: House, slug: 'visao-geral' },
  { id: 'CAMPAIGNS', label: 'Campanhas', shortLabel: 'Campanhas', icon: Megaphone, slug: 'campanhas' },
  { id: 'CREATIVES', label: 'Anúncios', shortLabel: 'Anúncios', icon: Instagram, slug: 'anuncios' },
  { id: 'DAILY_REPORTS', label: 'Relatório diário', shortLabel: 'Diário', icon: ChartNoAxesCombined, slug: 'diario' },
  { id: 'AUDIT', label: 'Auditoria', shortLabel: 'Auditoria', icon: ShieldCheck, slug: 'auditoria' },
  { id: 'SETTINGS', label: 'Configurações', shortLabel: 'Config.', icon: Settings2, slug: 'configuracoes', managerOnly: true },
];

export function tabFromHash(hash: string): ActiveTab | null {
  const slug = hash.replace(/^#\/?/, '');
  return TABS.find((t) => t.slug === slug)?.id ?? null;
}

export function hashForTab(tab: ActiveTab): string {
  return `#${TABS.find((t) => t.id === tab)?.slug ?? ''}`;
}
