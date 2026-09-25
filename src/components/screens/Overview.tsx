import { useMemo, useState } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts';
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  Coins,
  Gauge,
  ShieldCheck,
  Table2,
  Target,
  Trophy,
  Users,
} from 'lucide-react';
import type { ActiveTab, AdAccount, ObjectiveFilter, ViewMode } from '../../types/metaAds';
import {
  PERIOD_LABEL,
  accountTotals,
  auditChecks,
  auditScore,
  breakdownByObjective,
  chronological,
  cpa,
  executiveSummary,
  flattenCreatives,
  periodSummary,
  MIN_RESULTS_FOR_CHAMPION,
  pickChampion,
  type Period,
} from '../../lib/metrics';
import { OBJECTIVES, tone } from '../../lib/objectives';
import {
  capitalize,
  formatCompact,
  formatDayLong,
  formatDayShort,
  formatDecimal,
  formatMoney,
  formatNumber,
  formatPercent,
} from '../../lib/format';
import { Card } from '../ui/Card';
import { KpiCard } from '../ui/KpiCard';
import { PageHeader } from '../ui/PageHeader';
import { SegmentedControl } from '../ui/SegmentedControl';
import { CreativePreview } from '../ui/CreativePreview';
import { Badge } from '../ui/Badge';
import { buttonClass } from '../ui/button';
import { ApiAccountNotice } from './ApiAccountNotice';

interface OverviewProps {
  account: AdAccount;
  viewMode: ViewMode;
  onNavigate: (tab: ActiveTab, filter?: ObjectiveFilter) => void;
  onOpenConnect: () => void;
}

interface ChartRow {
  date: string;
  label: string;
  spend: number;
  results: number;
  cpa: number | null;
}

export function Overview({ account, viewMode, onNavigate, onOpenConnect }: OverviewProps) {
  const hasHistory = account.dailyHistory.length > 0;
  const hasCampaigns = account.campaigns.length > 0;
  const isManager = viewMode === 'MANAGER';

  const [period, setPeriod] = useState<Period>(hasHistory ? 'LAST_7' : 'ALL');
  const [chartView, setChartView] = useState<'CHART' | 'TABLE'>('CHART');

  const summary = useMemo(() => periodSummary(account, period), [account, period]);
  const breakdown = useMemo(() => breakdownByObjective(account.campaigns), [account.campaigns]);
  const champion = useMemo(() => pickChampion(flattenCreatives(account.campaigns)), [account.campaigns]);
  const summaryLines = useMemo(() => executiveSummary(account), [account]);
  const audit = useMemo(() => auditScore(auditChecks(account)), [account]);
  const totals = useMemo(() => accountTotals(account), [account]);
  const chartData = useMemo<ChartRow[]>(
    () =>
      chronological(account.dailyHistory).map((d) => ({
        date: d.date,
        label: formatDayShort(d.date),
        spend: d.spend,
        results: d.results,
        cpa: cpa(d.spend, d.results),
      })),
    [account.dailyHistory],
  );

  const money = (value: number | null) => formatMoney(value, account.currency);

  if (!hasCampaigns && !hasHistory) {
    return (
      <div className="space-y-6">
        <PageHeader title={account.businessName} description="Conta conectada pela Meta Graph API." />
        <ApiAccountNotice
          account={account}
          missing="as campanhas desta conta"
          onOpenConnect={isManager ? onOpenConnect : undefined}
        />
      </div>
    );
  }

  const periodOptions = (['LAST_DAY', 'LAST_7', 'ALL'] as Period[])
    .filter((p) => p === 'ALL' || hasHistory)
    .map((p) => ({ value: p, label: PERIOD_LABEL[p] }));

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title={account.businessName}
        description={
          <>
            {account.businessType}
            {summary && (
              <>
                <span className="mx-1.5 text-slate-300" aria-hidden="true">
                  ·
                </span>
                {summary.caption}
              </>
            )}
          </>
        }
        actions={
          <SegmentedControl
            ariaLabel="Período"
            options={periodOptions}
            value={period}
            onChange={setPeriod}
            className="w-full sm:w-auto"
            stretch
          />
        }
      />

      {summary && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <KpiCard label="Investimento" value={money(summary.spend)} icon={Coins} hint={PERIOD_LABEL[period]} />
          <KpiCard
            label={account.resultLabel}
            value={formatNumber(summary.results)}
            icon={Target}
            delta={
              summary.delta && { value: summary.delta.results, goodWhen: 'up', label: 'vs. dia anterior' }
            }
            hint={!summary.delta ? 'somando todos os objetivos' : undefined}
          />
          <KpiCard
            label="Custo por resultado"
            value={money(summary.cpa)}
            icon={Gauge}
            highlight
            delta={summary.delta && { value: summary.delta.cpa, goodWhen: 'down', label: 'vs. dia anterior' }}
            hint={!summary.delta ? 'quanto menor, melhor' : undefined}
          />
          <KpiCard label="Alcance" value={formatNumber(summary.reach)} icon={Users} hint={summary.reachLabel} />
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
        {hasHistory && (
          <Card
            className="lg:col-span-2"
            title="Investimento e resultados por dia"
            description={`Últimos ${chartData.length} dias`}
            action={
              <SegmentedControl
                ariaLabel="Forma de exibição"
                size="sm"
                value={chartView}
                onChange={setChartView}
                options={[
                  { value: 'CHART', label: 'Gráfico', icon: BarChart3 },
                  { value: 'TABLE', label: 'Tabela', icon: Table2 },
                ]}
              />
            }
          >
            {chartView === 'CHART' ? (
              <DailyChart data={chartData} currency={account.currency} resultLabel={account.resultLabel} />
            ) : (
              <DailyTable data={chartData} currency={account.currency} resultLabel={account.resultLabel} />
            )}
          </Card>
        )}

        {breakdown.length > 0 && (
          <Card
            className={hasHistory ? '' : 'lg:col-span-3'}
            title="Resultados por tipo de campanha"
            description="Desde o início. Toque para ver as campanhas."
          >
            <ul className="space-y-2">
              {breakdown.map((item) => {
                const meta = OBJECTIVES[item.objective];
                const t = tone(meta.tone);
                const Icon = meta.icon;
                return (
                  <li key={item.objective}>
                    <button
                      type="button"
                      onClick={() => onNavigate('CAMPAIGNS', item.objective)}
                      className="group flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${t.icon}`}>
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-sm font-semibold text-slate-900">{meta.label}</span>
                          <span className="text-sm font-bold text-slate-900 tabular-nums">
                            {formatNumber(item.results)}
                          </span>
                        </span>
                        <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
                          <span
                            className={`block h-full rounded-full ${t.solid}`}
                            style={{ width: `${Math.max(2, item.share * 100)}%` }}
                          />
                        </span>
                        <span className="mt-1 block text-xs text-slate-500">
                          {money(item.cpa)} por {meta.unit[0]} · {formatPercent(item.share, 0)} dos resultados
                        </span>
                      </span>
                      <ChevronRight
                        className="size-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500"
                        aria-hidden="true"
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
        {champion && (
          <Card
            title="Anúncio destaque"
            description={
              champion.leads >= MIN_RESULTS_FOR_CHAMPION && champion.status !== 'FATIGUE'
                ? 'Menor custo por resultado com amostra suficiente'
                : 'Ainda sem amostra suficiente: este é o de mais resultados'
            }
          >
            <CreativePreview creative={champion} className="rounded-xl" />
            <p className="mt-3 flex gap-1.5 text-sm font-bold text-slate-900">
              <Trophy className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden="true" />
              <span className="line-clamp-2">{champion.name}</span>
            </p>
            <p className="mt-0.5 truncate text-xs text-slate-500">{champion.campaignName}</p>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
              <MiniStat label="Resultados" value={formatNumber(champion.leads)} />
              <MiniStat label="Custo cada" value={money(champion.cpa)} />
              <MiniStat label="CTR" value={formatPercent(champion.ctr, 1)} />
            </dl>
            <button
              type="button"
              onClick={() => onNavigate('CREATIVES')}
              className={buttonClass('secondary', 'md', 'mt-4 w-full')}
            >
              Ver todos os anúncios
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </Card>
        )}

        {summaryLines.length > 0 && (
          <Card
            className={champion ? 'lg:col-span-2' : 'lg:col-span-3'}
            title="Em poucas palavras"
            description="Resumo montado a partir dos números da conta"
          >
            <ul className="space-y-3">
              {summaryLines.map((line) => (
                <li key={line} className="flex gap-3 text-sm leading-relaxed text-slate-700">
                  <span className="bg-brand-100 text-brand-700 mt-0.5 grid size-5 shrink-0 place-items-center rounded-full">
                    <Check className="size-3" aria-hidden="true" />
                  </span>
                  {line}
                </li>
              ))}
            </ul>

            <div className="mt-5 flex flex-col gap-3 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center">
              <span className={`grid size-12 shrink-0 place-items-center rounded-full ${tone(audit.tone).icon}`}>
                <ShieldCheck className="size-6" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900">
                  Saúde da conta: {audit.score}/100 <Badge tone={audit.tone}>{audit.label}</Badge>
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Checagem de pixel, WhatsApp, estrutura das campanhas e desgaste dos anúncios.
                </p>
              </div>
              <button type="button" onClick={() => onNavigate('AUDIT')} className={buttonClass('secondary', 'sm')}>
                Ver auditoria
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            </div>
          </Card>
        )}
      </div>

      {isManager && hasCampaigns && (
        <Card
          title="Métricas técnicas"
          description="Desde o início. Visíveis só para o gestor."
          action={<Badge tone="slate">Gestor</Badge>}
        >
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <TechStat label="Impressões" value={formatCompact(totals.impressions)} hint="Vezes que os anúncios apareceram" />
            <TechStat label="Cliques" value={formatNumber(totals.clicks)} hint="Toques nos anúncios" />
            <TechStat label="CTR" value={formatPercent(totals.ctr, 2)} hint="Cliques ÷ impressões" />
            <TechStat label="CPC" value={money(totals.cpc)} hint="Custo por clique" />
            <TechStat label="CPM" value={money(totals.cpm)} hint="Custo por mil impressões" />
            <TechStat label="Frequência" value={formatDecimal(totals.frequency, 2)} hint="Vezes que cada pessoa viu" />
          </dl>
        </Card>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-2 py-2">
      <dt className="text-[11px] font-medium text-slate-500">{label}</dt>
      <dd className="mt-0.5 truncate text-sm font-bold text-slate-900 tabular-nums">{value}</dd>
    </div>
  );
}

function TechStat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <dt className="text-xs font-semibold text-slate-500">{label}</dt>
      <dd className="mt-1 text-lg font-bold text-slate-900 tabular-nums">{value}</dd>
      <dd className="mt-0.5 text-[11px] leading-snug text-slate-400">{hint}</dd>
    </div>
  );
}

interface DailyViewProps {
  data: ChartRow[];
  currency: string;
  resultLabel: string;
}

function DailyChart({ data, currency, resultLabel }: DailyViewProps) {
  const renderTooltip = ({ active, payload }: TooltipContentProps) => {
    const row = active ? (payload?.[0]?.payload as ChartRow | undefined) : undefined;
    if (!row) return null;
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
        <p className="font-bold text-slate-900">{capitalize(formatDayLong(row.date))}</p>
        <p className="mt-1 text-slate-600">
          Investimento: <strong className="text-slate-900">{formatMoney(row.spend, currency)}</strong>
        </p>
        <p className="text-slate-600">
          {resultLabel}: <strong className="text-slate-900">{formatNumber(row.results)}</strong>
        </p>
        <p className="text-slate-600">
          Custo por resultado: <strong className="text-slate-900">{formatMoney(row.cpa, currency)}</strong>
        </p>
      </div>
    );
  };

  return (
    <figure>
      <div className="h-64 sm:h-72" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: -8 }}>
            <CartesianGrid vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
              interval="preserveStartEnd"
            />
            <YAxis
              yAxisId="spend"
              tickLine={false}
              axisLine={false}
              width={56}
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickFormatter={(v: number) => formatMoney(v, currency, 0)}
            />
            <YAxis
              yAxisId="results"
              orientation="right"
              tickLine={false}
              axisLine={false}
              width={32}
              allowDecimals={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
            />
            <Tooltip content={renderTooltip} cursor={{ fill: '#f1f5f9' }} />
            <Bar yAxisId="spend" dataKey="spend" fill="var(--brand-500)" radius={[6, 6, 0, 0]} maxBarSize={36} />
            <Line
              yAxisId="results"
              dataKey="results"
              type="monotone"
              stroke="#0f172a"
              strokeWidth={2}
              dot={{ r: 3, fill: '#0f172a' }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="bg-brand-500 size-2.5 rounded-sm" aria-hidden="true" />
          Investimento (eixo à esquerda)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-3 rounded bg-slate-900" aria-hidden="true" />
          {resultLabel} (eixo à direita)
        </span>
        <span className="sr-only">Troque para a visão em tabela para ler os valores de cada dia.</span>
      </figcaption>
    </figure>
  );
}

function DailyTable({ data, currency, resultLabel }: DailyViewProps) {
  return (
    <div className="-mx-4 overflow-x-auto sm:-mx-5">
      <table className="w-full min-w-[28rem] text-sm">
        <caption className="sr-only">Investimento e resultados por dia</caption>
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs font-semibold text-slate-500">
            <th scope="col" className="px-4 py-2 sm:px-5">
              Dia
            </th>
            <th scope="col" className="px-3 py-2 text-right">
              Investimento
            </th>
            <th scope="col" className="px-3 py-2 text-right">
              {resultLabel}
            </th>
            <th scope="col" className="px-4 py-2 text-right sm:px-5">
              Custo por resultado
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {[...data].reverse().map((row) => (
            <tr key={row.date}>
              <th scope="row" className="px-4 py-2.5 text-left font-medium text-slate-700 sm:px-5">
                {capitalize(row.label)}
              </th>
              <td className="px-3 py-2.5 text-right text-slate-900 tabular-nums">{formatMoney(row.spend, currency)}</td>
              <td className="px-3 py-2.5 text-right text-slate-900 tabular-nums">{formatNumber(row.results)}</td>
              <td className="px-4 py-2.5 text-right font-semibold text-slate-900 tabular-nums sm:px-5">
                {formatMoney(row.cpa, currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
