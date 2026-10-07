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
  CalendarDays,
  Check,
  ChevronRight,
  Coins,
  Gauge,
  MessageSquareText,
  ShieldCheck,
  Table2,
  Target,
  Trophy,
  Users,
} from 'lucide-react';
import type { ActiveTab, AdAccount, ObjectiveFilter, ViewMode } from '../../types/metaAds';
import {
  accountTotals,
  auditChecks,
  auditScore,
  breakdownByObjective,
  cpa,
  deltaPct,
  executiveSummary,
  flattenCreatives,
  sumDays,
  MIN_RESULTS_FOR_CHAMPION,
  pickChampion,
} from '../../lib/metrics';
import { dateRangeDayCount, daysInRange, initialDateRange, shiftDate } from '../../lib/dateRange';
import { OBJECTIVES, tone } from '../../lib/objectives';
import {
  capitalize,
  formatCompact,
  formatDate,
  formatDayLong,
  formatDayShort,
  formatDecimal,
  formatMoney,
  formatNumber,
  formatPercent,
} from '../../lib/format';
import { Card } from '../ui/Card';
import { KpiCard } from '../ui/KpiCard';
import { DateRangeFilter } from '../ui/DateRangeFilter';
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

  const [range, setRange] = useState(() => initialDateRange(account.dailyHistory, account.isRealApi));
  const [chartView, setChartView] = useState<'CHART' | 'TABLE'>('CHART');

  const selectedDays = useMemo(() => daysInRange(account.dailyHistory, range), [account.dailyHistory, range]);
  const summary = useMemo(() => {
    if (selectedDays.length === 0) return null;
    const sum = sumDays(selectedDays);
    const isSingleDay = range.start === range.end;
    const previous = isSingleDay ? account.dailyHistory.find((day) => day.date === shiftDate(range.start, -1)) : undefined;
    return {
      ...sum,
      reach: Math.round(sum.reach / selectedDays.length),
      reachLabel: isSingleDay ? 'Pessoas alcançadas no dia' : 'Média por dia com dados',
      delta: previous ? {
        results: deltaPct(sum.results, previous.results),
        cpa: deltaPct(sum.cpa, cpa(previous.spend, previous.results)),
      } : undefined,
    };
  }, [account.dailyHistory, range, selectedDays]);
  const breakdown = useMemo(() => breakdownByObjective(account.campaigns), [account.campaigns]);
  const champion = useMemo(() => pickChampion(flattenCreatives(account.campaigns)), [account.campaigns]);
  const summaryLines = useMemo(() => executiveSummary(account), [account]);
  const audit = useMemo(() => auditScore(auditChecks(account)), [account]);
  const totals = useMemo(() => accountTotals(account), [account]);
  const chartData = useMemo<ChartRow[]>(
    () =>
      selectedDays.map((d) => ({
        date: d.date,
        label: formatDayShort(d.date),
        spend: d.spend,
        results: d.results,
        cpa: cpa(d.spend, d.results),
      })),
    [selectedDays],
  );

  const money = (value: number | null) => formatMoney(value, account.currency);
  const rangeCaption = range.start === range.end ? formatDate(range.start) : `${formatDate(range.start)} a ${formatDate(range.end)}`;
  const availableDates = account.dailyHistory.map((day) => day.date).sort();
  const availableRange = hasHistory ? { start: availableDates[0], end: availableDates[availableDates.length - 1] } : undefined;
  const missingDays = dateRangeDayCount(range) - selectedDays.length;
  const rangeHint = missingDays > 0 ? `${selectedDays.length} dias com dados` : rangeCaption;

  if (!hasCampaigns && !hasHistory) {
    return (
      <div className="space-y-6">
        <header className="rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:px-5">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{account.businessName}</h1>
          <p className="mt-1 text-xs text-slate-600">Conta conectada pela Meta Graph API.</p>
        </header>
        <ApiAccountNotice
          account={account}
          missing="as campanhas desta conta"
          onOpenConnect={isManager ? onOpenConnect : undefined}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <header className="grid min-w-0 grid-cols-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:px-5 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-[22px]">{account.businessName}</h1>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
            Instagram e Facebook <span aria-hidden="true">·</span> {account.isRealApi ? 'Período' : 'Amostra'}: {rangeCaption}
          </p>
        </div>
        <DateRangeFilter value={range} onChange={setRange} availableRange={availableRange} />
      </header>

      <section aria-label="Indicadores do período selecionado" className="space-y-3">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <KpiCard label="Investimento" value={summary ? money(summary.spend) : '—'} icon={Coins} tone="neutral" hint={summary ? rangeHint : 'Sem dados no período'} />
          <KpiCard
            label={account.resultLabel}
            value={summary ? formatNumber(summary.results) : '—'}
            icon={Target}
            tone="neutral"
            delta={
              summary?.delta && { value: summary.delta.results, goodWhen: 'up', label: 'vs. dia anterior' }
            }
            hint={!summary ? 'Sem dados no período' : !summary.delta ? 'somando todos os objetivos' : undefined}
          />
          <KpiCard
            label="Custo por resultado"
            value={summary ? money(summary.cpa) : '—'}
            icon={Gauge}
            tone="neutral"
            delta={summary?.delta && { value: summary.delta.cpa, goodWhen: 'down', label: 'vs. dia anterior' }}
            hint={!summary ? 'Sem dados no período' : !summary.delta ? 'quanto menor, melhor' : undefined}
          />
          <KpiCard label="Alcance" value={summary ? formatNumber(summary.reach) : '—'} icon={Users} tone="neutral" hint={summary ? summary.reachLabel : 'Sem dados no período'} />
        </div>
        {summary && missingDays > 0 && (
          <p role="status" className="text-xs text-slate-600">
            Há registros em {selectedDays.length} dos {dateRangeDayCount(range)} dias selecionados. Os totais consideram somente esses registros; dias sem dados não equivalem a zero.
          </p>
        )}
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
        {(
          <Card
            className="lg:col-span-2"
            tone="neutral"
            icon={BarChart3}
            title="Investimento e resultados por dia"
            description={rangeCaption}
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
            {chartData.length === 0 ? (
              <div role="status" className="flex min-h-56 flex-col items-center justify-center rounded-xl bg-slate-50 p-5 text-center">
                <CalendarDays className="size-6 text-slate-400" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold text-slate-900">Sem dados neste período</p>
                <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-600">
                  {availableRange
                    ? `O histórico disponível vai de ${formatDate(availableRange.start)} a ${formatDate(availableRange.end)}. Selecione essas datas no calendário para consultar a amostra.`
                    : 'Ainda não há histórico diário. Os blocos identificados como acumulados continuam disponíveis abaixo.'}
                </p>
                {availableRange && (
                  <button type="button" onClick={() => setRange(initialDateRange(account.dailyHistory, false))} className={buttonClass('secondary', 'sm', 'mt-4')}>
                    Ver período disponível
                  </button>
                )}
              </div>
            ) : chartView === 'CHART' ? (
              <DailyChart data={chartData} currency={account.currency} resultLabel={account.resultLabel} />
            ) : (
              <DailyTable data={chartData} currency={account.currency} resultLabel={account.resultLabel} />
            )}
          </Card>
        )}

        {breakdown.length > 0 && (
          <Card
            tone="neutral"
            icon={Target}
            title="Resultados por tipo de campanha"
            description="Acumulado desde o início; não muda com o período acima."
          >
            <ul className="space-y-2">
              {breakdown.map((item) => {
                const meta = OBJECTIVES[item.objective];
                const t = tone('slate');
                const Icon = meta.icon;
                return (
                  <li key={item.objective}>
                    <button
                      type="button"
                      onClick={() => onNavigate('CAMPAIGNS', item.objective)}
                      className="social-inset group flex w-full min-w-0 items-center gap-3 rounded-2xl border border-white/80 p-3 text-left transition hover:border-slate-300 hover:bg-white"
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
                        <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-slate-900/5" aria-hidden="true">
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

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
        {champion && (
          <Card
            title="Criativo de melhor performance"
            tone="neutral"
            icon={Trophy}
            description={
              champion.leads >= MIN_RESULTS_FOR_CHAMPION && champion.status !== 'FATIGUE'
                ? 'Acumulado desde o início · Menor custo com amostra suficiente'
                : 'Acumulado desde o início · Maior resultado, ainda sem amostra suficiente'
            }
          >
            <CreativePreview creative={champion} className="rounded-xl" />
            <p className="mt-3 flex gap-1.5 text-sm font-bold text-slate-900">
              <Trophy className="mt-0.5 size-4 shrink-0 text-slate-600" aria-hidden="true" />
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
            tone="neutral"
            icon={MessageSquareText}
            title="Em poucas palavras"
            description="Dados acumulados e último registro disponível; não muda com o filtro."
          >
            <ul className="space-y-3">
              {summaryLines.map((line) => (
                <li key={line} className="social-inset flex gap-3 rounded-xl p-3 text-sm leading-relaxed text-slate-700">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600">
                    <Check className="size-3" aria-hidden="true" />
                  </span>
                  {line}
                </li>
              ))}
            </ul>

            <div className="social-inset mt-5 flex flex-col gap-3 rounded-2xl border border-white/80 p-4 sm:flex-row sm:items-center">
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
          tone="neutral"
          icon={Gauge}
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
    <div className="social-inset min-w-0 rounded-xl px-2 py-2.5">
      <dt className="text-[11px] font-medium text-slate-500">{label}</dt>
      <dd className="mt-0.5 truncate text-sm font-bold text-slate-900 tabular-nums">{value}</dd>
    </div>
  );
}

function TechStat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="social-inset min-w-0 rounded-xl border border-white/80 p-3">
      <dt className="text-xs font-semibold text-slate-500">{label}</dt>
      <dd className="mt-1 text-lg font-bold text-slate-900 tabular-nums">{value}</dd>
      <dd className="mt-0.5 text-[11px] leading-snug text-slate-500">{hint}</dd>
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
      <div className="social-inset h-64 rounded-2xl p-2 sm:h-72 sm:p-3" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: -8 }}>
            <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 5" />
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
            <Bar yAxisId="spend" dataKey="spend" fill="#758399" radius={[7, 7, 0, 0]} maxBarSize={36} />
            <Line
              yAxisId="results"
              dataKey="results"
              type="monotone"
              stroke="#172033"
              strokeWidth={3}
              dot={{ r: 4, fill: '#172033', stroke: '#fff', strokeWidth: 2 }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-[#758399]" aria-hidden="true" />
          Barras: investimento (eixo à esquerda)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-3 rounded bg-[#172033]" aria-hidden="true" />
          Linha com pontos: {resultLabel} (eixo à direita)
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
