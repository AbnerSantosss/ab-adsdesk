export type CampaignObjective =
  | 'MESSAGES' // Conversas no WhatsApp / Direct
  | 'LEADS' // Cadastro via formulário instantâneo
  | 'REACH' // Reconhecimento local / visitas ao estúdio
  | 'CONVERSIONS' // Vendas / matrículas online
  | 'TRAFFIC'; // Cliques no link (típico de post turbinado)

export type CampaignStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED';

export type CreativeFormat = 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'STORY_REEL';

export interface AdCreative {
  id: string;
  name: string;
  headline: string;
  primaryText: string;
  format: CreativeFormat;
  aspectRatio: '1:1' | '9:16' | '4:5';
  callToAction: string;
  /** Classes Tailwind do gradiente usado na prévia simulada do anúncio. */
  previewGradient: string;
  tagline: string;
  spend: number;
  /** Resultados atribuídos ao criativo (conversas, cadastros...). */
  leads: number;
  clicks: number;
  impressions: number;
  status: 'ACTIVE' | 'PAUSED' | 'FATIGUE';
  notes: string;
}

export interface AdSet {
  id: string;
  name: string;
  targetAudience: string;
  genderAge: string;
  location: string;
  dailyBudget: number;
  spend: number;
  leads: number;
  status: 'ACTIVE' | 'PAUSED';
}

export interface Campaign {
  id: string;
  name: string;
  objective: CampaignObjective;
  status: CampaignStatus;
  /** true = montada no Gerenciador de Anúncios; false = botão "Turbinar" do Instagram. */
  isProfessionalStructure: boolean;
  dailyBudget: number;
  totalSpend: number;
  resultsCount: number;
  /** Nome do resultado desta campanha (ex.: "Conversas no WhatsApp"). */
  resultMetricName: string;
  reach: number;
  impressions: number;
  clicks: number;
  /** Data de início no formato YYYY-MM-DD. */
  startDate: string;
  adSets: AdSet[];
  creatives: AdCreative[];
  conversionDestination?: string;
  userActionOnClick?: string;
}

export interface ObjectiveDayStat {
  spend: number;
  results: number;
}

export interface DailyStat {
  /** Data no formato YYYY-MM-DD. */
  date: string;
  spend: number;
  results: number;
  clicks: number;
  reach: number;
  topCampaignName: string;
  topCreativeName: string;
  /** Detalhamento do dia por tipo de campanha, quando disponível. */
  byObjective?: Partial<Record<CampaignObjective, ObjectiveDayStat>>;
}

/** Dados que a Meta Graph API devolve sobre a conta conectada. */
export interface MetaAccountSnapshot {
  accountStatus: number;
  /** Valor gasto desde a criação da conta, já convertido da menor unidade da moeda. */
  amountSpent: number | null;
  timezone: string;
  fetchedAt: string;
}

export interface AdAccount {
  id: string;
  name: string;
  businessName: string;
  businessType: string;
  slogan?: string;
  /** Ícone próprio do cliente, quando existir (ver AccountAvatar). */
  logoKey?: 'raro-pilates';
  currency: string;
  timezone: string;
  isRealApi: boolean;
  /** Nome genérico dos resultados da conta (ex.: "Contatos gerados"). */
  resultLabel: string;
  /**
   * Alcance único da conta desde o início. Não é a soma do alcance das campanhas,
   * porque a mesma pessoa pode ter visto mais de uma campanha.
   */
  uniqueReach?: number;
  audit: {
    pixelConfigured: boolean;
    whatsappConnected: boolean;
    /** Observação escrita pelo gestor para o cliente. */
    managerNote: string;
  };
  campaigns: Campaign[];
  /** Histórico diário, do dia mais recente para o mais antigo. */
  dailyHistory: DailyStat[];
  apiSnapshot?: MetaAccountSnapshot;
}

export type ViewMode = 'CLIENT' | 'MANAGER';
export type ActiveTab = 'OVERVIEW' | 'CAMPAIGNS' | 'CREATIVES' | 'DAILY_REPORTS' | 'AUDIT';
export type ObjectiveFilter = 'ALL' | CampaignObjective;
