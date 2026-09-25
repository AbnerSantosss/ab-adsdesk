import type { AdAccount, AdCreative, Campaign, CampaignObjective, DailyStat } from '../types/metaAds';
import { OBJECTIVES, OBJECTIVE_ORDER, type ToneName } from './objectives';
import { capitalize, formatDayLong, formatDecimal, formatMoney, formatNumber, formatPercent } from './format';

/* -------------------------------------------------------------------------- */
/* Métricas básicas                                                            */
/* -------------------------------------------------------------------------- */

function ratio(numerator: number, denominator: number): number | null {
  return denominator > 0 ? numerator / denominator : null;
}

/** Custo por resultado. */
export const cpa = (spend: number, results: number) => ratio(spend, results);
/** Taxa de cliques (fração). */
export const ctr = (clicks: number, impressions: number) => ratio(clicks, impressions);
/** Custo por clique. */
export const cpc = (spend: number, clicks: number) => ratio(spend, clicks);
/** Custo por mil impressões. */
export const cpm = (spend: number, impressions: number) => {
  const value = ratio(spend, impressions);
  return value == null ? null : value * 1000;
};

/** Variação relativa entre dois valores (0.1 = +10%). */
export function deltaPct(current: number | null, previous: number | null): number | null {
  if (current == null || previous == null || previous === 0) return null;
  return (current - previous) / previous;
}

/* -------------------------------------------------------------------------- */
/* Totais                                                                      */
/* -------------------------------------------------------------------------- */

export interface Totals {
  spend: number;
  results: number;
  clicks: number;
  impressions: number;
  reach: number;
  cpa: number | null;
  ctr: number | null;
  cpc: number | null;
  cpm: number | null;
  frequency: number | null;
}

function buildTotals(spend: number, results: number, clicks: number, impressions: number, reach: number): Totals {
  return {
    spend,
    results,
    clicks,
    impressions,
    reach,
    cpa: cpa(spend, results),
    ctr: ctr(clicks, impressions),
    cpc: cpc(spend, clicks),
    cpm: cpm(spend, impressions),
    frequency: ratio(impressions, reach),
  };
}

export function campaignTotals(campaign: Campaign): Totals {
  return buildTotals(
    campaign.totalSpend,
    campaign.resultsCount,
    campaign.clicks,
    campaign.impressions,
    campaign.reach,
  );
}

export function sumCampaigns(campaigns: Campaign[]): Totals {
  let spend = 0;
  let results = 0;
  let clicks = 0;
  let impressions = 0;
  let reach = 0;
  for (const c of campaigns) {
    spend += c.totalSpend;
    results += c.resultsCount;
    clicks += c.clicks;
    impressions += c.impressions;
    reach += c.reach;
  }
  return buildTotals(spend, results, clicks, impressions, reach);
}

/**
 * Totais da conta desde o início. O alcance usa o alcance único da conta quando existe,
 * porque somar o alcance das campanhas conta a mesma pessoa mais de uma vez.
 */
export function accountTotals(account: AdAccount): Totals {
  const sum = sumCampaigns(account.campaigns);
  if (!account.uniqueReach) return sum;
  return buildTotals(sum.spend, sum.results, sum.clicks, sum.impressions, account.uniqueReach);
}

export function creativeCpa(creative: AdCreative) {
  return cpa(creative.spend, creative.leads);
}

export function creativeCtr(creative: AdCreative) {
  return ctr(creative.clicks, creative.impressions);
}

/* -------------------------------------------------------------------------- */
/* Períodos da visão geral                                                     */
/* -------------------------------------------------------------------------- */

export type Period = 'LAST_DAY' | 'LAST_7' | 'ALL';

export const PERIOD_LABEL: Record<Period, string> = {
  LAST_DAY: 'Último dia',
  LAST_7: '7 dias',
  ALL: 'Desde o início',
};

export interface PeriodSummary {
  period: Period;
  spend: number;
  results: number;
  cpa: number | null;
  clicks: number;
  reach: number;
  reachLabel: string;
  /** Texto curto sobre o recorte (ex.: "Quarta-feira, 23 de setembro"). */
  caption: string;
  /** Variação contra o dia anterior (só no período "Último dia"). */
  delta?: { spend: number | null; results: number | null; cpa: number | null };
}

export function sumDays(days: DailyStat[]) {
  let spend = 0;
  let results = 0;
  let clicks = 0;
  let reach = 0;
  for (const d of days) {
    spend += d.spend;
    results += d.results;
    clicks += d.clicks;
    reach += d.reach;
  }
  return { spend, results, clicks, reach, cpa: cpa(spend, results), days: days.length };
}

/**
 * Soma dos até 7 dias anteriores a `date`: a base justa para comparar um dia. Nunca inclui o
 * próprio dia nem dias posteriores (abrir um dia antigo não o compara com o futuro).
 */
export function weekBefore(history: DailyStat[], date: string) {
  const previous = history.filter((d) => d.date < date).sort((a, b) => b.date.localeCompare(a.date));
  return sumDays(previous.slice(0, 7));
}

/** "dos 7 dias anteriores" / "do dia anterior", para rótulos de comparação. */
export function previousDaysLabel(days: number): string {
  return days === 1 ? 'do dia anterior' : `dos ${days} dias anteriores`;
}

export function periodSummary(account: AdAccount, period: Period): PeriodSummary | null {
  const history = account.dailyHistory;

  if (period === 'ALL') {
    if (account.campaigns.length === 0) return null;
    const t = accountTotals(account);
    return {
      period,
      spend: t.spend,
      results: t.results,
      cpa: t.cpa,
      clicks: t.clicks,
      reach: t.reach,
      reachLabel: account.uniqueReach ? 'Pessoas alcançadas' : 'Alcance somado das campanhas',
      caption: 'Somando todas as campanhas',
    };
  }

  if (history.length === 0) return null;

  if (period === 'LAST_DAY') {
    const [day, previous] = history;
    return {
      period,
      spend: day.spend,
      results: day.results,
      cpa: cpa(day.spend, day.results),
      clicks: day.clicks,
      reach: day.reach,
      reachLabel: 'Pessoas alcançadas no dia',
      caption: capitalize(formatDayLong(day.date)),
      delta: previous
        ? {
            spend: deltaPct(day.spend, previous.spend),
            results: deltaPct(day.results, previous.results),
            cpa: deltaPct(cpa(day.spend, day.results), cpa(previous.spend, previous.results)),
          }
        : undefined,
    };
  }

  const days = history.slice(0, 7);
  const sum = sumDays(days);
  return {
    period,
    spend: sum.spend,
    results: sum.results,
    cpa: sum.cpa,
    clicks: sum.clicks,
    reach: Math.round(sum.reach / days.length),
    reachLabel: 'Alcance médio por dia',
    caption: days.length < 7 ? `Últimos ${days.length} dias com dados` : 'Últimos 7 dias',
  };
}

/** Histórico em ordem cronológica, pronto para o gráfico. */
export function chronological(history: DailyStat[], limit = 7): DailyStat[] {
  return history.slice(0, limit).reverse();
}

/* -------------------------------------------------------------------------- */
/* Quebra por objetivo                                                         */
/* -------------------------------------------------------------------------- */

export interface ObjectiveBreakdown {
  objective: CampaignObjective;
  spend: number;
  results: number;
  cpa: number | null;
  campaigns: number;
  activeCampaigns: number;
  /** Fração dos resultados totais. */
  share: number;
}

type PartialBreakdown = Omit<ObjectiveBreakdown, 'cpa' | 'share'>;

function emptyBreakdown(objective: CampaignObjective): PartialBreakdown {
  return { objective, spend: 0, results: 0, campaigns: 0, activeCampaigns: 0 };
}

function finishBreakdown(map: Map<CampaignObjective, PartialBreakdown>): ObjectiveBreakdown[] {
  let totalResults = 0;
  for (const item of map.values()) totalResults += item.results;
  return OBJECTIVE_ORDER.filter((o) => map.has(o)).map((o) => {
    const item = map.get(o)!;
    return {
      ...item,
      cpa: cpa(item.spend, item.results),
      share: totalResults > 0 ? item.results / totalResults : 0,
    };
  });
}

export function breakdownByObjective(campaigns: Campaign[]): ObjectiveBreakdown[] {
  const map = new Map<CampaignObjective, PartialBreakdown>();
  for (const c of campaigns) {
    const item = map.get(c.objective) ?? emptyBreakdown(c.objective);
    item.spend += c.totalSpend;
    item.results += c.resultsCount;
    item.campaigns += 1;
    if (c.status === 'ACTIVE') item.activeCampaigns += 1;
    map.set(c.objective, item);
  }
  return finishBreakdown(map);
}

/** Quebra de um ou mais dias. Devolve lista vazia se o histórico não tiver o detalhamento. */
export function breakdownDays(days: DailyStat[]): ObjectiveBreakdown[] {
  const map = new Map<CampaignObjective, PartialBreakdown>();
  for (const day of days) {
    if (!day.byObjective) continue;
    for (const [key, stat] of Object.entries(day.byObjective)) {
      if (!stat) continue;
      const objective = key as CampaignObjective;
      const item = map.get(objective) ?? emptyBreakdown(objective);
      item.spend += stat.spend;
      item.results += stat.results;
      map.set(objective, item);
    }
  }
  return finishBreakdown(map);
}

/* -------------------------------------------------------------------------- */
/* Saúde do custo por resultado                                                */
/* -------------------------------------------------------------------------- */

export interface CpaHealth {
  label: string;
  tone: ToneName;
  hint: string;
}

/** Compara o custo de uma campanha ou criativo com a média da conta. */
export function cpaHealth(value: number | null, reference: number | null): CpaHealth {
  if (value == null) return { label: 'Sem resultados', tone: 'slate', hint: 'Ainda não gerou resultados.' };
  if (reference == null) return { label: 'Sem referência', tone: 'slate', hint: 'A conta ainda não tem média.' };
  const r = value / reference;
  const pct = formatPercent(Math.abs(r - 1), 0);
  if (r <= 0.9) return { label: 'Abaixo da média', tone: 'emerald', hint: `${pct} mais barato que a média da conta.` };
  if (r <= 1.15) return { label: 'Na média', tone: 'blue', hint: 'Custo próximo da média da conta.' };
  if (r <= 2) return { label: 'Acima da média', tone: 'amber', hint: `${pct} mais caro que a média da conta.` };
  return { label: 'Muito acima', tone: 'rose', hint: `${formatDecimal(r, 1)}× o custo médio da conta.` };
}

/* -------------------------------------------------------------------------- */
/* Criativos                                                                   */
/* -------------------------------------------------------------------------- */

export interface CreativeRow extends AdCreative {
  campaignId: string;
  campaignName: string;
  objective: CampaignObjective;
  campaignActive: boolean;
  cpa: number | null;
  ctr: number | null;
}

export function flattenCreatives(campaigns: Campaign[]): CreativeRow[] {
  return campaigns.flatMap((c) =>
    c.creatives.map((cr) => ({
      ...cr,
      campaignId: c.id,
      campaignName: c.name,
      objective: c.objective,
      campaignActive: c.status === 'ACTIVE',
      cpa: creativeCpa(cr),
      ctr: creativeCtr(cr),
    })),
  );
}

/** Menos resultados que isso não é amostra suficiente para chamar de campeão. */
export const MIN_RESULTS_FOR_CHAMPION = 10;

/** Criativo com menor custo por resultado entre os que têm amostra suficiente e não estão em fadiga. */
export function pickChampion(rows: CreativeRow[], minResults = MIN_RESULTS_FOR_CHAMPION): CreativeRow | null {
  const eligible = rows.filter((r) => r.leads >= minResults && r.status !== 'FATIGUE' && r.cpa != null);
  if (eligible.length === 0) {
    // Sem amostra suficiente, o destaque vira o de mais resultados, evitando um anúncio em queda.
    const healthy = rows.filter((r) => r.status !== 'FATIGUE');
    return [...(healthy.length > 0 ? healthy : rows)].sort((a, b) => b.leads - a.leads)[0] ?? null;
  }
  return eligible.reduce((best, r) => (r.cpa! < best.cpa! ? r : best));
}

export interface CreativeBadge {
  label: string;
  tone: ToneName;
}

export function creativeBadges(row: CreativeRow, rows: CreativeRow[]): CreativeBadge[] {
  const badges: CreativeBadge[] = [];
  const champion = pickChampion(rows);
  const mostResults = rows.reduce<CreativeRow | null>((best, r) => (!best || r.leads > best.leads ? r : best), null);

  if (champion?.id === row.id && champion.leads >= MIN_RESULTS_FOR_CHAMPION && champion.status !== 'FATIGUE') {
    badges.push({ label: 'Menor custo', tone: 'emerald' });
  }
  if (mostResults?.id === row.id && mostResults.leads > 0) badges.push({ label: 'Mais resultados', tone: 'blue' });
  if (row.status === 'FATIGUE') badges.push({ label: 'Desempenho em queda', tone: 'amber' });
  if (row.status === 'PAUSED' || !row.campaignActive) badges.push({ label: 'Pausado', tone: 'slate' });
  return badges;
}

/* -------------------------------------------------------------------------- */
/* Auditoria                                                                   */
/* -------------------------------------------------------------------------- */

export interface AuditCheck {
  id: string;
  label: string;
  detail: string;
  ok: boolean;
  weight: number;
}

export function auditChecks(account: AdAccount): AuditCheck[] {
  const active = account.campaigns.filter((c) => c.status === 'ACTIVE');
  const boostedActive = active.filter((c) => !c.isProfessionalStructure);
  const noAudience = active.filter((c) => c.isProfessionalStructure && c.adSets.length === 0);
  const fatigued = active.flatMap((c) => c.creatives).filter((cr) => cr.status === 'FATIGUE');

  return [
    {
      id: 'pixel',
      label: 'Pixel da Meta instalado',
      detail: account.audit.pixelConfigured
        ? 'O site registra as visitas vindas dos anúncios.'
        : 'Sem o pixel, a Meta não aprende quem tem mais chance de virar cliente.',
      ok: account.audit.pixelConfigured,
      weight: 20,
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp conectado à página',
      detail: account.audit.whatsappConnected
        ? 'As conversas iniciadas pelos anúncios chegam direto na recepção.'
        : 'Conecte o WhatsApp Business para contar as conversas geradas.',
      ok: account.audit.whatsappConnected,
      weight: 15,
    },
    {
      id: 'structure',
      label: 'Verba ativa só em campanhas estruturadas',
      detail:
        boostedActive.length === 0
          ? 'Nenhum post turbinado pelo botão do Instagram está gastando verba.'
          : boostedActive.length === 1
            ? 'Há 1 post turbinado ativo: custa mais e não captura o contato.'
            : `Há ${boostedActive.length} posts turbinados ativos: custam mais e não capturam o contato.`,
      ok: boostedActive.length === 0,
      weight: 30,
    },
    {
      id: 'audience',
      label: 'Público definido em cada campanha',
      detail:
        noAudience.length === 0
          ? 'Toda campanha ativa tem conjunto de anúncios com idade, região e interesses.'
          : `${noAudience.length} campanha(s) ativa(s) sem conjunto de anúncios configurado.`,
      ok: noAudience.length === 0,
      weight: 15,
    },
    {
      id: 'fatigue',
      label: 'Criativos ativos sem desgaste',
      detail:
        fatigued.length === 0
          ? 'Nenhum anúncio ativo mostra queda de desempenho por repetição.'
          : `${fatigued.length} anúncio(s) ativo(s) com desempenho em queda: hora de trocar a arte.`,
      ok: fatigued.length === 0,
      weight: 10,
    },
    {
      id: 'history',
      label: 'Relatório diário disponível',
      detail:
        account.dailyHistory.length > 0
          ? 'O investimento de cada dia fica registrado e pode ser enviado ao cliente.'
          : 'Ainda não há histórico diário para esta conta.',
      ok: account.dailyHistory.length > 0,
      weight: 10,
    },
  ];
}

export function auditScore(checks: AuditCheck[]) {
  const total = checks.reduce((acc, c) => acc + c.weight, 0);
  const earned = checks.reduce((acc, c) => acc + (c.ok ? c.weight : 0), 0);
  const score = total > 0 ? Math.round((earned / total) * 100) : 0;
  const level: { label: string; tone: ToneName } =
    score >= 90
      ? { label: 'Excelente', tone: 'emerald' }
      : score >= 70
        ? { label: 'Bom', tone: 'blue' }
        : score >= 50
          ? { label: 'Precisa de atenção', tone: 'amber' }
          : { label: 'Crítico', tone: 'rose' };
  return { score, ...level };
}

export interface StructureSide {
  count: number;
  spend: number;
  results: number;
  cpa: number | null;
}

/** Campanhas do Gerenciador contra posts turbinados, com os números reais da conta. */
export function structureComparison(campaigns: Campaign[]) {
  const side = (list: Campaign[]): StructureSide => {
    const t = sumCampaigns(list);
    return { count: list.length, spend: t.spend, results: t.results, cpa: t.cpa };
  };
  const professional = side(campaigns.filter((c) => c.isProfessionalStructure));
  const boosted = side(campaigns.filter((c) => !c.isProfessionalStructure));
  const multiplier =
    professional.cpa != null && boosted.cpa != null && professional.cpa > 0 ? boosted.cpa / professional.cpa : null;
  return { professional, boosted, multiplier };
}

/* -------------------------------------------------------------------------- */
/* Textos gerados                                                              */
/* -------------------------------------------------------------------------- */

export function resultsWithUnit(count: number, objective: CampaignObjective): string {
  const [singular, plural] = OBJECTIVES[objective].unit;
  return `${formatNumber(count)} ${count === 1 ? singular : plural}`;
}

/** Frases curtas que resumem a conta para o cliente, montadas a partir dos números. */
export function executiveSummary(account: AdAccount): string[] {
  const lines: string[] = [];
  const totals = accountTotals(account);
  const money = (v: number | null) => formatMoney(v, account.currency);

  if (totals.results > 0) {
    lines.push(
      `Desde o início, ${money(totals.spend)} investidos trouxeram ${formatNumber(totals.results)} ${totals.results === 1 ? 'resultado' : 'resultados'}, a ${money(totals.cpa)} cada.`,
    );
  }

  const top = [...breakdownByObjective(account.campaigns)].sort((a, b) => b.results - a.results)[0];
  if (top && top.results > 0) {
    const meta = OBJECTIVES[top.objective];
    lines.push(
      `${meta.label} trouxe ${formatPercent(top.share, 0)} dos resultados, com custo de ${money(top.cpa)} por ${meta.unit[0]}.`,
    );
  }

  const champion = pickChampion(flattenCreatives(account.campaigns));
  if (champion && champion.leads > 0) {
    const criterion =
      champion.leads >= MIN_RESULTS_FOR_CHAMPION ? 'O anúncio de menor custo foi' : 'O anúncio com mais resultados foi';
    lines.push(
      `${criterion} “${champion.name}”: ${formatNumber(champion.leads)} ${champion.leads === 1 ? 'resultado' : 'resultados'} a ${money(champion.cpa)} cada.`,
    );
  }

  const { boosted, multiplier } = structureComparison(account.campaigns);
  if (boosted.count > 0 && multiplier && multiplier > 1.2) {
    lines.push(
      `${boosted.count === 1 ? 'O post turbinado custou' : 'Os posts turbinados custaram'} ${formatDecimal(multiplier, 1)}× mais por resultado que as campanhas estruturadas.`,
    );
  }

  const [lastDay] = account.dailyHistory;
  if (lastDay) {
    const week = weekBefore(account.dailyHistory, lastDay.date);
    const diff = deltaPct(cpa(lastDay.spend, lastDay.results), week.cpa);
    if (diff != null) {
      const position =
        Math.abs(diff) < 0.05
          ? 'em linha com a'
          : diff < 0
            ? `${formatPercent(-diff, 0)} abaixo da`
            : `${formatPercent(diff, 0)} acima da`;
      lines.push(`No último dia, o custo por resultado ficou ${position} média ${previousDaysLabel(week.days)}.`);
    }
  }

  return lines;
}

/** Mensagem pronta para mandar ao cliente pelo WhatsApp. */
export function dailyReportMessage(account: AdAccount, day: DailyStat, options: { senderName?: string } = {}): string {
  const money = (v: number | null) => formatMoney(v, account.currency);
  const week = weekBefore(account.dailyHistory, day.date);
  const dayCpa = cpa(day.spend, day.results);
  const breakdown = breakdownDays([day]);

  const lines = [
    `*Relatório diário · ${account.businessName}*`,
    capitalize(formatDayLong(day.date)),
    '',
    `Investimento: ${money(day.spend)}`,
    `${account.resultLabel}: ${formatNumber(day.results)}`,
    `Custo por resultado: ${money(dayCpa)}${week.cpa != null ? ` (média ${previousDaysLabel(week.days)}: ${money(week.cpa)})` : ''}`,
  ];

  if (breakdown.length > 0) {
    lines.push('', '*Por tipo de campanha*');
    for (const item of breakdown) {
      lines.push(`• ${OBJECTIVES[item.objective].label}: ${formatNumber(item.results)} (${money(item.cpa)} cada)`);
    }
  }

  if (day.topCreativeName) lines.push('', `Destaque do dia: ${day.topCreativeName}`);
  lines.push('', 'Qualquer dúvida, é só responder esta mensagem.');
  if (options.senderName) lines.push(options.senderName);

  return lines.join('\n');
}
