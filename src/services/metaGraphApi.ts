import type { AdAccount } from '../types/metaAds';
import type { ToneName } from '../lib/objectives';
import { STORAGE_KEYS, readJSON, removeKey, writeJSON } from '../lib/storage.ts';
import type { MetaReportAction, MetaReportAd, MetaReportCampaign, MetaReportCreative, MetaReportMetrics, MetaReportRange, MetaReportSnapshot } from '../types/metaReport';

/** Versão da Graph API usada nas chamadas. Atualize quando a Meta descontinuar a atual. */
export const META_GRAPH_API_VERSION = 'v26.0';

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
  const parsed = number(value);
  if (parsed == null) return null;
  let digits = 2;
  try {
    digits = new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    // Moeda desconhecida: assume centavos.
  }
  return parsed / 10 ** digits;
}

interface GraphError {
  code?: number;
  error_subcode?: number;
}

export interface MetaApiError {
  ok: false;
  title: string;
  detail: string;
  code?: number;
}

export type MetaDashboardResult =
  | { ok: true; account: AdAccount; report: MetaReportSnapshot }
  | MetaApiError;

/** Pin verified against the official Meta Business SDK, 2026-10-07:
 * https://github.com/facebook/facebook-nodejs-business-sdk/blob/main/src/api.js
 * Read contract: https://www.postman.com/meta/facebook-marketing-api/
 */
const GRAPH_ORIGIN = 'https://graph.facebook.com';
const PAGE_SIZE = 100;
const MAX_PAGES = 100;
const MAX_ROWS = 10_000;
const REQUEST_TIMEOUT_MS = 30_000;
const REPORT_TIMEOUT_MS = 180_000;
const MAX_RANGE_DAYS = 366;
const INSIGHT_FIELDS = 'date_start,date_stop,spend,impressions,clicks,reach,actions';
type GraphObject = Record<string, unknown>;

class MetaRequestError extends Error {
  readonly result: MetaApiError;
  constructor(title: string, detail: string, code?: number) {
    super(title);
    this.name = 'MetaRequestError';
    this.result = { ok: false, title, detail, ...(code == null ? {} : { code }) };
  }
}

function describeGraphError(error: GraphError, httpStatus: number): MetaRequestError {
  const code = error.code;
  if (code === 190 || httpStatus === 401) {
    return new MetaRequestError('Token inválido ou expirado', 'Gere um token válido com ads_read e acesso a esta conta. Tokens podem expirar ou ser revogados.', code);
  }
  if (code === 10 || (code != null && code >= 200 && code < 300) || httpStatus === 403) {
    return new MetaRequestError('Permissão insuficiente', 'O token precisa de ads_read e de acesso a esta conta de anúncios no Business Manager.', code);
  }
  if ([4, 17, 32, 613, 80000, 80004].includes(code ?? 0) || httpStatus === 429) {
    return new MetaRequestError('Limite de consultas atingido', 'A Meta limitou as consultas. Aguarde alguns minutos e tente novamente.', code);
  }
  if (code === 100 || code === 803) {
    return new MetaRequestError('Consulta não aceita pela Meta', 'Confira o ID e o acesso à conta. Se persistir, um campo ou parâmetro da consulta pode não estar disponível.', code);
  }
  if (httpStatus >= 500 || code === 1 || code === 2) {
    return new MetaRequestError('A Meta está temporariamente indisponível', 'Tente novamente em alguns minutos. Nenhum relatório parcial foi aplicado.', code);
  }
  // Do not surface a remote message that may echo request parameters or credentials.
  return new MetaRequestError('A Meta recusou a consulta', 'Não foi possível ler todos os dados. Confira o acesso à conta e tente novamente.', code);
}

function object(value: unknown): GraphObject | null {
  return value != null && typeof value === 'object' && !Array.isArray(value) ? value as GraphObject : null;
}

function text(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function number(value: unknown): number | null {
  if ((typeof value !== 'number' && typeof value !== 'string') || value === '') return null;
  if (typeof value === 'string' && !/^\d+(?:\.\d+)?$/.test(value)) return null;
  const result = Number(value);
  return Number.isFinite(result) && result >= 0 ? result : null;
}

function malformed(detail = 'A Graph API devolveu dados em um formato inesperado. Tente novamente.'): never {
  throw new MetaRequestError('Resposta inesperada da Meta', detail);
}

function validateCredentials(accessToken: string, rawAccountId: string): { token: string; accountId: string } {
  const token = accessToken.trim();
  if (!token) throw new MetaRequestError('Informe o token de acesso', 'Cole o token gerado no Meta for Developers.');
  if (/[\r\n]/.test(token)) throw new MetaRequestError('Token inválido', 'O token não pode conter quebras de linha.');
  const accountId = normalizeAccountId(rawAccountId);
  if (!accountId) throw new MetaRequestError('ID da conta inválido', 'Use act_123456789 ou apenas os números do Gerenciador de Anúncios.');
  return { token, accountId };
}

function abortError(): DOMException {
  return new DOMException('Consulta cancelada.', 'AbortError');
}

/** Builds every request from a fixed origin. The access token never enters a URL. */
async function graphGet(path: string, params: Record<string, string>, token: string, signal?: AbortSignal): Promise<GraphObject> {
  if (signal?.aborted) throw abortError();
  const controller = new AbortController();
  const cancel = () => controller.abort();
  signal?.addEventListener('abort', cancel, { once: true });
  let timedOut = false;
  const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, REQUEST_TIMEOUT_MS);
  try {
    const url = new URL(`${GRAPH_ORIGIN}/${META_GRAPH_API_VERSION}/${path}`);
    url.search = new URLSearchParams(params).toString();
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      signal: controller.signal,
      credentials: 'omit',
      cache: 'no-store',
      redirect: 'error',
      referrerPolicy: 'no-referrer',
    });
    let data: GraphObject | null = null;
    try { data = object(await response.json()); } catch {
      if (controller.signal.aborted) throw abortError();
      if (!response.ok) throw describeGraphError({}, response.status);
      malformed();
    }
    if (!data) malformed();
    const remoteError = object(data.error);
    if (!response.ok || remoteError) throw describeGraphError(remoteError ?? {}, response.status);
    return data;
  } catch (error) {
    if (signal?.aborted) throw abortError();
    if (timedOut) throw new MetaRequestError('A consulta demorou demais', 'A Meta não respondeu em 30 segundos. Tente novamente ou escolha um período menor.');
    if (error instanceof MetaRequestError) throw error;
    throw new MetaRequestError('Sem resposta da Meta', 'Verifique a conexão. Bloqueadores de anúncios também podem impedir acesso a graph.facebook.com.');
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', cancel);
  }
}

/** Follows only opaque cursors, never the remote paging.next URL (which may contain tokens). */
async function graphPages(path: string, params: Record<string, string>, token: string, signal: AbortSignal): Promise<GraphObject[]> {
  const rows: GraphObject[] = [];
  const cursors = new Set<string>();
  let after: string | undefined;
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const data = await graphGet(path, { ...params, limit: String(PAGE_SIZE), ...(after ? { after } : {}) }, token, signal);
    if (!Array.isArray(data.data)) malformed();
    for (const entry of data.data) {
      const row = object(entry);
      if (!row) malformed();
      rows.push(row);
    }
    if (rows.length > MAX_ROWS) throw new MetaRequestError('Relatório grande demais', 'A consulta ultrapassou 10.000 registros. Reduza o período; nenhum dado foi truncado.');
    const paging = object(data.paging);
    if (!text(paging?.next)) return rows;
    const cursor = text(object(paging?.cursors)?.after);
    if (!cursor || cursors.has(cursor)) malformed('A paginação da Meta está incompleta ou repetida. Nenhum relatório parcial foi aplicado.');
    cursors.add(cursor);
    after = cursor;
  }
  throw new MetaRequestError('Relatório grande demais', 'A consulta ultrapassou 100 páginas. Reduza o período; nenhum dado foi truncado.');
}

function accountInfo(data: GraphObject, accountId: string): MetaAccountInfo {
  const currency = text(data.currency);
  const timezone = text(data.timezone_name);
  if (!currency || !/^[A-Z]{3}$/.test(currency) || !timezone) malformed('A Meta não informou a moeda ou o fuso horário da conta.');
  try { new Intl.DateTimeFormat('en', { timeZone: timezone }).format(); } catch { malformed('O fuso horário recebido da Meta não é reconhecido.'); }
  return {
    id: accountId,
    name: text(data.name) ?? accountId,
    businessName: text(data.business_name) ?? undefined,
    currency,
    timezone,
    accountStatus: number(data.account_status) ?? 0,
    amountSpent: fromMinorUnits(typeof data.amount_spent === 'string' ? data.amount_spent : undefined, currency),
  };
}

const ACCOUNT_FIELDS = 'id,name,business_name,account_status,currency,amount_spent,timezone_name';

/** Read-only account metadata, kept for callers that do not need insights. */
export async function fetchMetaAccount(accessToken: string, rawAccountId: string, signal?: AbortSignal): Promise<MetaApiResult> {
  try {
    const { token, accountId } = validateCredentials(accessToken, rawAccountId);
    return { ok: true, account: accountInfo(await graphGet(accountId, { fields: ACCOUNT_FIELDS }, token, signal), accountId) };
  } catch (error) {
    if (signal?.aborted) throw abortError();
    if (error instanceof MetaRequestError) return error.result;
    return { ok: false, title: 'Não foi possível consultar a conta', detail: 'Tente novamente em instantes.' };
  }
}

function validDay(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
}

export function defaultMetaReportRange(timezone: string, now = new Date()): MetaReportRange {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const part = (kind: string) => parts.find((entry) => entry.type === kind)?.value ?? '';
  const until = `${part('year')}-${part('month')}-${part('day')}`;
  const date = new Date(`${until}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 29);
  return { since: date.toISOString().slice(0, 10), until };
}

function validateRange(range: MetaReportRange): MetaReportRange {
  if (!validDay(range.since) || !validDay(range.until) || range.since > range.until) {
    throw new MetaRequestError('Período inválido', 'Informe datas válidas e uma data final igual ou posterior à inicial.');
  }
  const days = (Date.parse(`${range.until}T00:00:00Z`) - Date.parse(`${range.since}T00:00:00Z`)) / 86_400_000 + 1;
  if (days > MAX_RANGE_DAYS) throw new MetaRequestError('Período muito longo', 'Escolha até 366 dias por consulta. Nenhum dado será truncado.');
  return { since: range.since, until: range.until };
}

function metrics(row?: GraphObject): MetaReportMetrics {
  const raw = row?.actions;
  const actions: MetaReportAction[] | null = Array.isArray(raw) ? raw.map((entry) => {
    const action = object(entry);
    const type = text(action?.action_type);
    if (!type) malformed('A Meta devolveu uma ação sem identificação.');
    return { type, value: number(action?.value) };
  }) : null;
  const distinct = actions ? [...new Map(actions.map((entry) => [entry.type, entry])).values()] : null;
  // Aggregate aliases overlap their individual conversion sources. Select one; never add them.
  const select = (priority: string[]): number | null => {
    for (const type of priority) {
      const action = distinct?.find((entry) => entry.type === type);
      if (action) return action.value;
    }
    return null;
  };
  return {
    spend: number(row?.spend), impressions: number(row?.impressions), clicks: number(row?.clicks), reach: number(row?.reach), actions: distinct,
    messagingConversations: select(['onsite_conversion.messaging_conversation_started_7d', 'onsite_conversion.messaging_conversation_started', 'messaging_conversation_started_7d']),
    leads: select(['lead', 'onsite_conversion.lead_grouped', 'offsite_conversion.fb_pixel_lead', 'onsite_conversion.lead']),
    purchases: select(['omni_purchase', 'purchase', 'offsite_conversion.fb_pixel_purchase', 'app_custom_event.fb_mobile_purchase']),
  };
}

function indexed(rows: GraphObject[], key: string): Map<string, GraphObject> {
  const result = new Map<string, GraphObject>();
  for (const row of rows) {
    const id = text(row[key]);
    if (!id || !/^\d+$/.test(id)) malformed('A Meta devolveu um registro sem ID válido.');
    if (result.has(id)) malformed('A Meta devolveu registros duplicados. Nenhum valor foi somado duas vezes.');
    result.set(id, row);
  }
  return result;
}

function mediaUrl(value: unknown): string | null {
  const source = text(value);
  if (!source) return null;
  try {
    const url = new URL(source);
    return url.protocol === 'https:' && !url.username && !url.password && !url.searchParams.has('access_token') ? source : null;
  } catch { return null; }
}

function creative(value: unknown): MetaReportCreative | null {
  const row = object(value);
  return row ? { id: text(row.id), name: text(row.name), title: text(row.title), body: text(row.body), imageUrl: mediaUrl(row.image_url), thumbnailUrl: mediaUrl(row.thumbnail_url), videoId: text(row.video_id) } : null;
}

/** Read-only report. Mock campaigns/audit are intentionally not inferred from Meta insights. */
export async function fetchMetaDashboard(
  accessToken: string,
  rawAccountId: string,
  range?: MetaReportRange,
  signal?: AbortSignal,
  onProgress?: (stage: string) => void,
): Promise<MetaDashboardResult> {
  const controller = new AbortController();
  const cancel = () => controller.abort();
  signal?.addEventListener('abort', cancel, { once: true });
  let timedOut = false;
  const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, REPORT_TIMEOUT_MS);
  try {
    if (signal?.aborted) throw abortError();
    const { token, accountId } = validateCredentials(accessToken, rawAccountId);
    onProgress?.('Lendo a conta e o fuso horário');
    const info = accountInfo(await graphGet(accountId, { fields: ACCOUNT_FIELDS }, token, controller.signal), accountId);
    const requestedRange = validateRange(range ?? defaultMetaReportRange(info.timezone));
    const insightParams = { time_range: JSON.stringify(requestedRange), fields: INSIGHT_FIELDS, action_breakdowns: 'action_type', action_report_time: 'impression' };
    const insightsPath = `${accountId}/insights`;
    onProgress?.('Lendo o total do período');
    const totalRows = await graphPages(insightsPath, { ...insightParams, level: 'account', time_increment: 'all_days' }, token, controller.signal);
    if (totalRows.length > 1) malformed('A consulta de total retornou mais de uma linha. O alcance único não pode ser somado.');
    onProgress?.('Lendo os resultados de cada dia');
    const dailyRows = await graphPages(insightsPath, { ...insightParams, level: 'account', time_increment: '1' }, token, controller.signal);
    const seenDays = new Set<string>();
    const daily = dailyRows.map((row) => {
      const date = text(row.date_start);
      if (!date || !validDay(date) || date < requestedRange.since || date > requestedRange.until || seenDays.has(date)) malformed('A Meta devolveu datas inválidas ou repetidas no relatório diário.');
      seenDays.add(date);
      return { date, ...metrics(row) };
    }).sort((a, b) => b.date.localeCompare(a.date));
    onProgress?.('Lendo métricas de campanhas');
    const campaignInsights = indexed(await graphPages(insightsPath, { ...insightParams, fields: `${INSIGHT_FIELDS},campaign_id,campaign_name,objective`, level: 'campaign', time_increment: 'all_days' }, token, controller.signal), 'campaign_id');
    onProgress?.('Lendo métricas de anúncios');
    const adInsights = indexed(await graphPages(insightsPath, { ...insightParams, fields: `${INSIGHT_FIELDS},ad_id,ad_name,campaign_id,campaign_name`, level: 'ad', time_increment: 'all_days' }, token, controller.signal), 'ad_id');
    onProgress?.('Lendo nomes e objetivos das campanhas');
    const campaignMetadata = indexed(await graphPages(`${accountId}/campaigns`, { fields: 'id,name,objective,effective_status' }, token, controller.signal), 'id');
    onProgress?.('Lendo anúncios e imagens originais');
    const adMetadata = indexed(await graphPages(`${accountId}/ads`, { fields: 'id,name,campaign_id,effective_status,creative{id,name,title,body,image_url,thumbnail_url,video_id}' }, token, controller.signal), 'id');
    const campaigns: MetaReportCampaign[] = [...new Set([...campaignInsights.keys(), ...campaignMetadata.keys()])].map((id) => {
      const stats = campaignInsights.get(id);
      const metadata = campaignMetadata.get(id);
      return { id, name: text(metadata?.name) ?? text(stats?.campaign_name) ?? id, status: text(metadata?.effective_status), objective: text(metadata?.objective) ?? text(stats?.objective), ...metrics(stats) };
    });
    const ads: MetaReportAd[] = [...new Set([...adInsights.keys(), ...adMetadata.keys()])].map((id) => {
      const stats = adInsights.get(id);
      const metadata = adMetadata.get(id);
      const campaignId = text(metadata?.campaign_id) ?? text(stats?.campaign_id);
      return { id, name: text(metadata?.name) ?? text(stats?.ad_name) ?? id, campaignId, campaignName: text(stats?.campaign_name) ?? (campaignId ? text(campaignMetadata.get(campaignId)?.name) : null), status: text(metadata?.effective_status), creative: creative(metadata?.creative), ...metrics(stats) };
    });
    if (controller.signal.aborted) throw abortError();
    return {
      ok: true,
      account: buildConnectedAccount(info),
      report: { apiVersion: META_GRAPH_API_VERSION, fetchedAt: new Date().toISOString(), range: requestedRange, timezone: info.timezone, currency: info.currency, isEmpty: totalRows.length === 0, totals: metrics(totalRows[0]), daily, campaigns, ads },
    };
  } catch (error) {
    if (signal?.aborted) throw abortError();
    if (timedOut) return { ok: false, title: 'O relatório demorou demais', detail: 'A consulta ultrapassou três minutos. Reduza o período e tente novamente; nenhum dado parcial foi aplicado.' };
    if (error instanceof MetaRequestError) return error.result;
    return { ok: false, title: 'Não foi possível carregar o relatório', detail: 'Tente novamente em instantes. Nenhum relatório parcial foi aplicado.' };
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', cancel);
  }
}

/**
 * Monta a conta exibida no painel a partir dos dados da API. Campanhas e histórico
 * são mantidos fora do modelo de demonstração; o relatório real usa MetaReportSnapshot.
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

/** Session-only storage; remember is kept for backward-compatible call sites. */
let sessionConfig: MetaConnectionConfig | null = null;

export function saveMetaConfig(config: MetaConnectionConfig, _remember = false): void {
  const accountId = normalizeAccountId(config.adAccountId);
  removeKey(STORAGE_KEYS.metaApi);
  sessionConfig = config.accessToken.trim() && accountId ? { accessToken: config.accessToken.trim(), adAccountId: accountId } : null;
  if (sessionConfig) writeJSON(STORAGE_KEYS.metaApi, sessionConfig, 'session');
}

export function getSavedMetaConfig(): MetaConnectionConfig | null {
  // Remove legacy persistent credentials without reading or migrating their contents.
  removeKey(STORAGE_KEYS.metaApi, 'local');
  if (sessionConfig) return { ...sessionConfig };
  const config = readJSON<MetaConnectionConfig>(STORAGE_KEYS.metaApi, 'session');
  if (typeof config?.accessToken !== 'string' || typeof config?.adAccountId !== 'string') return null;
  const accountId = normalizeAccountId(config.adAccountId);
  if (!config.accessToken.trim() || !accountId) return null;
  sessionConfig = { accessToken: config.accessToken.trim(), adAccountId: accountId };
  return { ...sessionConfig };
}

export function removeMetaConfig(): void {
  sessionConfig = null;
  removeKey(STORAGE_KEYS.metaApi);
}
