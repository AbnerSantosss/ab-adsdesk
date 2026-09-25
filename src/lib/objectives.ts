import { MapPin, MessageCircle, MousePointerClick, ShoppingBag, UserCheck, type LucideIcon } from 'lucide-react';
import type { CampaignObjective, CampaignStatus, CreativeFormat } from '../types/metaAds';

export interface Tone {
  /** Fundo claro + texto (chips, selos). */
  soft: string;
  /** Fundo do ícone. */
  icon: string;
  /** Borda de destaque. */
  border: string;
  /** Barra/indicador sólido. */
  solid: string;
  text: string;
}

const tones = {
  emerald: {
    soft: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    icon: 'bg-emerald-100 text-emerald-700',
    border: 'border-emerald-200',
    solid: 'bg-emerald-500',
    text: 'text-emerald-700',
  },
  blue: {
    soft: 'bg-blue-50 text-blue-700 ring-blue-200',
    icon: 'bg-blue-100 text-blue-700',
    border: 'border-blue-200',
    solid: 'bg-blue-500',
    text: 'text-blue-700',
  },
  violet: {
    soft: 'bg-violet-50 text-violet-700 ring-violet-200',
    icon: 'bg-violet-100 text-violet-700',
    border: 'border-violet-200',
    solid: 'bg-violet-500',
    text: 'text-violet-700',
  },
  amber: {
    soft: 'bg-amber-50 text-amber-800 ring-amber-200',
    icon: 'bg-amber-100 text-amber-700',
    border: 'border-amber-200',
    solid: 'bg-amber-500',
    text: 'text-amber-700',
  },
  rose: {
    soft: 'bg-rose-50 text-rose-700 ring-rose-200',
    icon: 'bg-rose-100 text-rose-700',
    border: 'border-rose-200',
    solid: 'bg-rose-500',
    text: 'text-rose-700',
  },
  slate: {
    soft: 'bg-slate-100 text-slate-700 ring-slate-200',
    icon: 'bg-slate-100 text-slate-600',
    border: 'border-slate-200',
    solid: 'bg-slate-400',
    text: 'text-slate-600',
  },
} satisfies Record<string, Tone>;

export type ToneName = keyof typeof tones;

export function tone(name: ToneName): Tone {
  return tones[name];
}

export interface ObjectiveMeta {
  label: string;
  shortLabel: string;
  /** Nome de cada resultado, no singular e no plural. */
  unit: [singular: string, plural: string];
  description: string;
  icon: LucideIcon;
  tone: ToneName;
  /** Cor usada nos gráficos (recharts não lê classes). */
  chartColor: string;
}

export const OBJECTIVES: Record<CampaignObjective, ObjectiveMeta> = {
  MESSAGES: {
    label: 'Conversas no WhatsApp',
    shortLabel: 'WhatsApp',
    unit: ['conversa', 'conversas'],
    description: 'Anúncios que abrem uma conversa direto com a recepção.',
    icon: MessageCircle,
    tone: 'emerald',
    chartColor: '#10b981',
  },
  LEADS: {
    label: 'Cadastros',
    shortLabel: 'Cadastros',
    unit: ['cadastro', 'cadastros'],
    description: 'Formulário dentro do Instagram com nome e telefone de quem tem interesse.',
    icon: UserCheck,
    tone: 'blue',
    chartColor: '#3b82f6',
  },
  REACH: {
    label: 'Reconhecimento local',
    shortLabel: 'Local',
    unit: ['contato', 'contatos'],
    description: 'Faz a marca ser lembrada por quem mora ou trabalha perto.',
    icon: MapPin,
    tone: 'violet',
    chartColor: '#8b5cf6',
  },
  TRAFFIC: {
    label: 'Cliques no link / post turbinado',
    shortLabel: 'Cliques',
    unit: ['contato', 'contatos'],
    description: 'Leva a pessoa para o perfil ou para um link, sem capturar o contato.',
    icon: MousePointerClick,
    tone: 'amber',
    chartColor: '#f59e0b',
  },
  CONVERSIONS: {
    label: 'Vendas e matrículas online',
    shortLabel: 'Vendas',
    unit: ['venda', 'vendas'],
    description: 'Otimiza para quem conclui uma compra ou matrícula no site.',
    icon: ShoppingBag,
    tone: 'rose',
    chartColor: '#f43f5e',
  },
};

/** Ordem de exibição dos objetivos. */
export const OBJECTIVE_ORDER: CampaignObjective[] = ['MESSAGES', 'LEADS', 'REACH', 'CONVERSIONS', 'TRAFFIC'];

export const CAMPAIGN_STATUS: Record<CampaignStatus, { label: string; tone: ToneName; dot: string }> = {
  ACTIVE: { label: 'Ativa', tone: 'emerald', dot: 'bg-emerald-500' },
  PAUSED: { label: 'Pausada', tone: 'slate', dot: 'bg-slate-400' },
  ARCHIVED: { label: 'Arquivada', tone: 'slate', dot: 'bg-slate-300' },
};

export const CREATIVE_FORMAT: Record<CreativeFormat, string> = {
  IMAGE: 'Imagem',
  VIDEO: 'Vídeo',
  CAROUSEL: 'Carrossel',
  STORY_REEL: 'Reels / Stories',
};
