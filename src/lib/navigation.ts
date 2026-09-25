import { CalendarDays, Clapperboard, LayoutDashboard, ListChecks, ShieldCheck, type LucideIcon } from 'lucide-react';
import type { ActiveTab } from '../types/metaAds';

export interface TabMeta {
  id: ActiveTab;
  label: string;
  /** Rótulo da barra inferior no celular. */
  shortLabel: string;
  icon: LucideIcon;
  /** Trecho da URL (#campanhas), para o botão voltar e links diretos funcionarem. */
  slug: string;
}

export const TABS: TabMeta[] = [
  { id: 'OVERVIEW', label: 'Visão geral', shortLabel: 'Início', icon: LayoutDashboard, slug: 'visao-geral' },
  { id: 'CAMPAIGNS', label: 'Campanhas', shortLabel: 'Campanhas', icon: ListChecks, slug: 'campanhas' },
  { id: 'CREATIVES', label: 'Anúncios', shortLabel: 'Anúncios', icon: Clapperboard, slug: 'anuncios' },
  { id: 'DAILY_REPORTS', label: 'Relatório diário', shortLabel: 'Diário', icon: CalendarDays, slug: 'diario' },
  { id: 'AUDIT', label: 'Auditoria', shortLabel: 'Auditoria', icon: ShieldCheck, slug: 'auditoria' },
];

export function tabFromHash(hash: string): ActiveTab | null {
  const slug = hash.replace(/^#\/?/, '');
  return TABS.find((t) => t.slug === slug)?.id ?? null;
}

export function hashForTab(tab: ActiveTab): string {
  return `#${TABS.find((t) => t.id === tab)?.slug ?? ''}`;
}
