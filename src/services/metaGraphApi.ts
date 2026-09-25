import type { AdAccount } from '../types/metaAds';
import type { ToneName } from '../lib/objectives';
import { STORAGE_KEYS, readFromAny, removeKey, writeJSON } from '../lib/storage';

/** Versão da Graph API usada nas chamadas. Atualize quando a Meta descontinuar a atual. */
export const META_GRAPH_API_VERSION = 'v23.0';

export interface MetaConnectionConfig {
  accessToken: string;
  /** Sempre no formato act_123456789. */
  adAccountId: string;
}

export interface MetaAccountInfo {
  id: string;
  name: string;
  businessName?: string;
  currency: string;
  timezone: string;
  accountStatus: number;
  /** Total gasto desde a criação da conta, já na unidade da moeda. */
  amountSpent: number | null;
}

export type MetaApiResult =
  | { ok: true; account: MetaAccountInfo }
  | { ok: false; title: string; detail: string; code?: number };

/** Situações de conta devolvidas pelo campo account_status. */
export const ACCOUNT_STATUS: Record<number, { label: string; tone: ToneName }> = {
  1: { label: 'Ativa', tone: 'emerald' },
  2: { label: 'Desativada', tone: 'rose' },
  3: { label: 'Pagamento pendente', tone: 'amber' },
  7: { label: 'Em análise de risco', tone: 'amber' },
  8: { label: 'Acerto de pagamento pendente', tone: 'amber' },
  9: { label: 'Em período de carência', tone: 'amber' },
  100: { label: 'Encerramento pendente', tone: 'slate' },
  101: { label: 'Encerrada', tone: 'slate' },
};

export function accountStatusInfo(status: number) {
  return ACCOUNT_STATUS[status] ?? { label: `Situação ${status}`, tone: 'slate' as ToneName };
}

/** Aceita "act_123", "123" ou "act_ 123". Devolve null se não for um id válido. */
export function normalizeAccountId(raw: string): string | null {
  const digits = raw.trim().replace(/^act_?/i, '').replace(/\s+/g, '');
  return /^\d{5,}$/.test(digits) ? `act_${digits}` : null;
}

/** O amount_spent vem na menor unidade da moeda (centavos no real). */
function fromMinorUnits(value: string | undefined, currency: string): number | null {
  if (value == null) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  let digits = 2;
  try {
    digits = new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    // Moeda desconhecida: assume centavos.
  }
  return parsed / 10 ** digits;
}

interface GraphError {
  message?: string;
  type?: string;
  code?: number;
  error_subcode?: number;
}

function describeGraphError(error: GraphError): { title: string; detail: string } {
  const code = error.code ?? 0;
  if (code === 190) {
    return {
      title: 'Token inválido ou expirado',
      detail:
        'Gere um novo token no Graph API Explorer ou crie um token de usuário do sistema no Business Manager, que não expira.',
    };
  }
  if (code === 100) {
    return {
      title: 'Conta não encontrada',
      detail: 'Confira o ID da conta de anúncios (act_...) e se o token tem acesso a ela.',
    };
  }
  if (code === 10 || (code >= 200 && code < 300)) {
    return {
      title: 'Permissão insuficiente',
      detail: 'O token precisa da permissão ads_read e de acesso a esta conta no Business Manager.',
    };
  }
  if ([4, 17, 32, 613].includes(code)) {
    return { title: 'Limite de consultas atingido', detail: 'A Meta limitou as consultas por alguns minutos. Tente de novo mais tarde.' };
  }
  return {
    title: 'A Meta recusou a consulta',
    detail: error.message ?? 'Erro desconhecido devolvido pela Graph API.',
  };
}

/** Busca os dados básicos da conta. Só lê; nada é alterado na conta do cliente. */
export async function fetchMetaAccount(
  accessToken: string,
  rawAccountId: string,
  signal?: AbortSignal,
): Promise<MetaApiResult> {
  const token = accessToken.trim();
  if (!token) {
    return { ok: false, title: 'Informe o token de acesso', detail: 'Cole o token gerado no Meta for Developers.' };
  }
  const accountId = normalizeAccountId(rawAccountId);
  if (!accountId) {
    return {
      ok: false,
      title: 'ID da conta inválido',
      detail: 'Use o formato act_123456789 ou só os números, como aparece no Gerenciador de Anúncios.',
    };
  }

  const params = new URLSearchParams({
    fields: 'name,business_name,account_status,currency,amount_spent,timezone_name',
    access_token: token,
  });

  let response: Response;
  try {
    response = await fetch(`https://graph.facebook.com/${META_GRAPH_API_VERSION}/${accountId}?${params}`, { signal });
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err;
    return {
      ok: false,
      title: 'Sem resposta da Meta',
      detail: 'Verifique a internet. Bloqueadores de anúncio também costumam barrar o endereço graph.facebook.com.',
    };
  }

  let data: Record<string, unknown> & { error?: GraphError };
  try {
    data = await response.json();
  } catch {
    return { ok: false, title: 'Resposta inesperada da Meta', detail: `A Graph API respondeu com o código HTTP ${response.status}.` };
  }

  if (!response.ok || data.error) {
    const error = data.error ?? {};
    return { ok: false, code: error.code, ...describeGraphError(error) };
  }

  const currency = typeof data.currency === 'string' ? data.currency : 'BRL';
  return {
    ok: true,
    account: {
      id: accountId,
      name: typeof data.name === 'string' && data.name ? data.name : 'Conta de anúncios',
      businessName: typeof data.business_name === 'string' && data.business_name ? data.business_name : undefined,
      currency,
      timezone: typeof data.timezone_name === 'string' ? data.timezone_name : 'America/Sao_Paulo',
      accountStatus: typeof data.account_status === 'number' ? data.account_status : 0,
      amountSpent: fromMinorUnits(data.amount_spent as string | undefined, currency),
    },
  };
}

/**
 * Monta a conta exibida no painel a partir dos dados da API. Campanhas e histórico
 * ainda não são importados (ver wiki: pontos de melhoria), então as telas mostram
 * o resumo da conta e um aviso.
 */
export function buildConnectedAccount(info: MetaAccountInfo): AdAccount {
  return {
    id: info.id,
    name: info.name,
    businessName: info.businessName ?? info.name,
    businessType: 'Conta conectada pela Meta API',
    currency: info.currency,
    timezone: info.timezone,
    isRealApi: true,
    resultLabel: 'Resultados',
    audit: {
      pixelConfigured: false,
      whatsappConnected: false,
      managerNote: '',
    },
    campaigns: [],
    dailyHistory: [],
    apiSnapshot: {
      accountStatus: info.accountStatus,
      amountSpent: info.amountSpent,
      timezone: info.timezone,
      fetchedAt: new Date().toISOString(),
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Credenciais salvas                                                          */
/* -------------------------------------------------------------------------- */

/**
 * O token fica no navegador porque este protótipo não tem servidor. Por padrão vai
 * para o sessionStorage (some ao fechar a aba); só vai para o localStorage se o
 * gestor marcar "lembrar neste navegador".
 */
export function saveMetaConfig(config: MetaConnectionConfig, remember: boolean): void {
  removeKey(STORAGE_KEYS.metaApi);
  writeJSON(STORAGE_KEYS.metaApi, config, remember ? 'local' : 'session');
}

export function getSavedMetaConfig(): MetaConnectionConfig | null {
  const config = readFromAny<MetaConnectionConfig>(STORAGE_KEYS.metaApi);
  return config?.accessToken && config.adAccountId ? config : null;
}

export function removeMetaConfig(): void {
  removeKey(STORAGE_KEYS.metaApi);
}
