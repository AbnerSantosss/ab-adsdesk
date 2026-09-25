import { useId, useMemo, useState, type ReactNode } from 'react';
import {
  ChevronDown,
  FilterX,
  Megaphone,
  MousePointerClick,
  Search,
  Send,
  TriangleAlert,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { AdAccount, Campaign, CampaignObjective, ObjectiveFilter, ViewMode } from '../../types/metaAds';
import { OBJECTIVES, OBJECTIVE_ORDER, CAMPAIGN_STATUS, tone } from '../../lib/objectives';
import { accountTotals, campaignTotals, cpaHealth, creativeCpa, resultsWithUnit, sumCampaigns } from '../../lib/metrics';
import { daysSince, formatDate, formatMoney, formatNumber, formatPercent, parseISODate, pluralize } from '../../lib/format';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { PageHeader } from '../ui/PageHeader';
import { buttonClass } from '../ui/button';
import { ApiAccountNotice } from './ApiAccountNotice';

interface CampaignsProps {
  account: AdAccount;
  viewMode: ViewMode;
  objectiveFilter: ObjectiveFilter;
  onObjectiveFilterChange: (filter: ObjectiveFilter) => void;
}

type StatusFilter = 'ALL' | 'ACTIVE' | 'PAUSED';
type SortKey = 'SPEND' | 'RESULTS' | 'CPA' | 'RECENT';

const SORT_LABEL: Record<SortKey, string> = {
  SPEND: 'Maior investimento',
  RESULTS: 'Mais resultados',
  CPA: 'Menor custo por resultado',
  RECENT: 'Mais recentes',
};

function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

function sortCampaigns(list: Campaign[], key: SortKey): Campaign[] {
  const sorted = [...list];
  switch (key) {
    case 'SPEND':
      return sorted.sort((a, b) => b.totalSpend - a.totalSpend);
    case 'RESULTS':
      return sorted.sort((a, b) => b.resultsCount - a.resultsCount);
    case 'RECENT':
      return sorted.sort((a, b) => b.startDate.localeCompare(a.startDate));
    case 'CPA':
      // Campanhas sem resultado vão para o fim.
      return sorted.sort((a, b) => {
        const ca = campaignTotals(a).cpa;
        const cb = campaignTotals(b).cpa;
        if (ca == null) return cb == null ? 0 : 1;
        if (cb == null) return -1;
        return ca - cb;
      });
  }
}

export function Campaigns({ account, viewMode, objectiveFilter, onObjectiveFilterChange }: CampaignsProps) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [sort, setSort] = useState<SortKey>('SPEND');
  const searchId = useId();
  const statusId = useId();
  const sortId = useId();

  const isManager = viewMode === 'MANAGER';
  const averageCpa = useMemo(() => accountTotals(account).cpa, [account]);

  const objectiveCounts = useMemo(() => {
    const counts = new Map<CampaignObjective, number>();
    for (const c of account.campaigns) counts.set(c.objective, (counts.get(c.objective) ?? 0) + 1);
    return counts;
  }, [account.campaigns]);

  const visible = useMemo(() => {
    const q = normalize(query.trim());
    const filtered = account.campaigns.filter((c) => {
      if (objectiveFilter !== 'ALL' && c.objective !== objectiveFilter) return false;
      if (status !== 'ALL' && c.status !== status) return false;
      if (!q) return true;
      const haystack = normalize(
        [c.name, OBJECTIVES[c.objective].label, c.conversionDestination ?? '', ...c.adSets.map((s) => s.name)].join(' '),
      );
      return haystack.includes(q);
    });
    return sortCampaigns(filtered, sort);
  }, [account.campaigns, objectiveFilter, status, query, sort]);

  const visibleTotals = useMemo(() => sumCampaigns(visible), [visible]);

  if (account.campaigns.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Campanhas" />
        <ApiAccountNotice account={account} missing="as campanhas desta conta" />
      </div>
    );
  }

  const hasFilters = objectiveFilter !== 'ALL' || status !== 'ALL' || query.trim() !== '';
  const clearFilters = () => {
    onObjectiveFilterChange('ALL');
    setStatus('ALL');
    setQuery('');
  };

  const chips: { value: ObjectiveFilter; label: string; count: number }[] = [
    { value: 'ALL', label: 'Todas', count: account.campaigns.length },
    ...OBJECTIVE_ORDER.filter((o) => objectiveCounts.has(o)).map((o) => ({
      value: o as ObjectiveFilter,
      label: OBJECTIVES[o].label,
      count: objectiveCounts.get(o)!,
    })),
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Campanhas"
        description="Cada campanha tem um objetivo: conversa no WhatsApp, cadastro, reconhecimento local ou cliques. O custo por resultado é comparado com a média da conta."
      />

      <div className="space-y-3">
        <div
          role="group"
          aria-label="Filtrar por tipo de campanha"
          className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
        >
          {chips.map((chip) => {
            const selected = chip.value === objectiveFilter;
            const Icon = chip.value === 'ALL' ? Megaphone : OBJECTIVES[chip.value].icon;
            return (
              <button
                key={chip.value}
                type="button"
                aria-pressed={selected}
                onClick={() => onObjectiveFilterChange(chip.value)}
                className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-3.5 text-sm font-semibold whitespace-nowrap transition ${
                  selected
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                <Icon className="size-4" aria-hidden="true" />
                {chip.label}
                <span className={`tabular-nums ${selected ? 'text-white/70' : 'text-slate-400'}`}>{chip.count}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_auto_auto] sm:gap-3">
          <div className="col-span-2 sm:col-span-1">
            <label htmlFor={searchId} className="sr-only">
              Buscar campanha
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id={searchId}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nome, público ou destino"
                className="focus:border-brand-500 focus:ring-brand-100 h-11 w-full rounded-xl border border-slate-200 bg-white pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label htmlFor={statusId} className="sr-only">
              Situação
            </label>
            <select
              id={statusId}
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusFilter)}
              className="focus:border-brand-500 focus:ring-brand-100 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 focus:ring-4 focus:outline-none"
            >
              <option value="ALL">Ativas e pausadas</option>
              <option value="ACTIVE">Só ativas</option>
              <option value="PAUSED">Só pausadas</option>
            </select>
          </div>
          <div>
            <label htmlFor={sortId} className="sr-only">
              Ordenar por
            </label>
            <select
              id={sortId}
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="focus:border-brand-500 focus:ring-brand-100 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 focus:ring-4 focus:outline-none"
            >
              {(Object.keys(SORT_LABEL) as SortKey[]).map((key) => (
                <option key={key} value={key}>
                  {SORT_LABEL[key]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-sm text-slate-500" aria-live="polite">
          {pluralize(visible.length, 'campanha', 'campanhas')}
          {visible.length > 0 && (
            <>
              {' '}
              · {formatMoney(visibleTotals.spend, account.currency)} investidos ·{' '}
              {formatNumber(visibleTotals.results)} resultados
            </>
          )}
        </p>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={FilterX}
          title="Nenhuma campanha com esses filtros"
          description="Tente outro tipo de campanha, outra situação ou uma busca diferente."
          action={
            hasFilters && (
              <button type="button" onClick={clearFilters} className={buttonClass('secondary')}>
                Limpar filtros
              </button>
            )
          }
        />
      ) : (
        <ul className="space-y-3">
          {visible.map((campaign) => (
            <li key={campaign.id}>
              <CampaignCard campaign={campaign} account={account} averageCpa={averageCpa} isManager={isManager} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface CampaignCardProps {
  campaign: Campaign;
  account: AdAccount;
  averageCpa: number | null;
  isManager: boolean;
}

function CampaignCard({ campaign, account, averageCpa, isManager }: CampaignCardProps) {
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();
  const meta = OBJECTIVES[campaign.objective];
  const status = CAMPAIGN_STATUS[campaign.status];
  const totals = campaignTotals(campaign);
  const health = cpaHealth(totals.cpa, averageCpa);
  const money = (v: number | null) => formatMoney(v, account.currency);
  const Icon = meta.icon;
  // Conta até o último dia com dados, não até hoje: sem isso o número crescia enquanto o gasto ficava parado.
  const lastDataDay = account.dailyHistory[0]?.date;
  const running =
    campaign.status === 'ACTIVE' ? daysSince(campaign.startDate, lastDataDay ? parseISODate(lastDataDay) : undefined) : null;

  return (
    <article
      className={`rounded-2xl border bg-white shadow-sm ${
        campaign.status === 'ACTIVE' ? 'border-slate-200' : 'border-slate-200/70 bg-slate-50/50'
      }`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${tone(meta.tone).icon}`}>
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="line-clamp-2 text-sm leading-snug font-bold text-slate-900 sm:text-base" title={campaign.name}>
              {campaign.name}
            </h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <Badge tone={status.tone}>
                <span className={`size-1.5 rounded-full ${status.dot}`} aria-hidden="true" />
                {status.label}
              </Badge>
              <Badge tone={meta.tone}>{meta.shortLabel}</Badge>
              {!campaign.isProfessionalStructure && (
                <Badge tone="amber" title="Criado pelo botão Turbinar do Instagram, sem segmentação completa">
                  <TriangleAlert className="size-3" aria-hidden="true" />
                  Post turbinado
                </Badge>
              )}
              <span className="text-xs text-slate-500">
                Desde {formatDate(campaign.startDate)}
                {running && ` · ${pluralize(running, 'dia', 'dias')} no ar`}
              </span>
            </div>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label="Investido" value={money(campaign.totalSpend)} />
          <Metric label={campaign.resultMetricName} value={formatNumber(campaign.resultsCount)} />
          <div className="min-w-0">
            <dt className="truncate text-xs font-medium text-slate-500">Custo por resultado</dt>
            <dd className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-base font-bold text-slate-900 tabular-nums sm:text-lg">{money(totals.cpa)}</span>
              <Badge tone={health.tone}>{health.label}</Badge>
            </dd>
          </div>
          <Metric
            label="Orçamento diário"
            value={campaign.status === 'ACTIVE' ? money(campaign.dailyBudget) : 'Pausada'}
          />
        </dl>

        <p className="mt-3 text-xs text-slate-500">{health.hint}</p>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls={detailsId}
        className="flex w-full items-center justify-between gap-2 border-t border-slate-100 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 sm:px-5"
      >
        {expanded ? 'Ocultar detalhes' : 'Ver públicos, destino e anúncios'}
        <ChevronDown className={`size-4 transition-transform ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {expanded && (
        <div id={detailsId} className="animate-fade-in space-y-5 border-t border-slate-100 px-4 py-4 sm:px-5">
          {(campaign.conversionDestination || campaign.userActionOnClick) && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {campaign.conversionDestination && (
                <InfoBlock icon={Send} title="Para onde o contato vai">
                  {campaign.conversionDestination}
                </InfoBlock>
              )}
              {campaign.userActionOnClick && (
                <InfoBlock icon={MousePointerClick} title="O que acontece quando a pessoa clica">
                  {campaign.userActionOnClick}
                </InfoBlock>
              )}
            </div>
          )}

          {isManager && (
            <dl className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-4">
              <Metric label="Alcance" value={formatNumber(campaign.reach)} small />
              <Metric label="Impressões" value={formatNumber(campaign.impressions)} small />
              <Metric label="CTR" value={formatPercent(totals.ctr, 2)} small />
              <Metric label="CPC" value={money(totals.cpc)} small />
            </dl>
          )}

          <section>
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Users className="size-4 text-slate-400" aria-hidden="true" />
              Públicos ({campaign.adSets.length})
            </h3>
            {campaign.adSets.length === 0 ? (
              <p className="mt-2 rounded-xl border border-dashed border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                Sem público definido: a Meta entrega para quem quiser, sem filtro de região, idade ou interesse.
              </p>
            ) : (
              <ul className="mt-2 grid grid-cols-1 gap-2 lg:grid-cols-2">
                {campaign.adSets.map((set) => (
                  <li key={set.id} className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="min-w-0 text-sm font-semibold text-slate-900">{set.name}</p>
                      <Badge tone={set.status === 'ACTIVE' ? 'emerald' : 'slate'}>
                        {set.status === 'ACTIVE' ? 'Ativo' : 'Pausado'}
                      </Badge>
                    </div>
                    <dl className="mt-2 space-y-1 text-xs text-slate-600">
                      <div>
                        <dt className="inline font-semibold text-slate-700">Região: </dt>
                        <dd className="inline">{set.location}</dd>
                      </div>
                      <div>
                        <dt className="inline font-semibold text-slate-700">Idade e gênero: </dt>
                        <dd className="inline">{set.genderAge}</dd>
                      </div>
                      <div>
                        <dt className="inline font-semibold text-slate-700">Interesses: </dt>
                        <dd className="inline">{set.targetAudience}</dd>
                      </div>
                    </dl>
                    <p className="mt-2 text-xs text-slate-500 tabular-nums">
                      {money(set.spend)} investidos · {formatNumber(set.leads)} resultados · {money(set.dailyBudget)}/dia
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {campaign.creatives.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Megaphone className="size-4 text-slate-400" aria-hidden="true" />
                Anúncios ({campaign.creatives.length})
              </h3>
              <ul className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-200">
                {campaign.creatives.map((cr) => (
                  <li key={cr.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-3 py-2.5">
                    <span className="min-w-0 flex-1 text-sm font-medium text-slate-800">{cr.name}</span>
                    <span className="flex items-center gap-2 text-xs text-slate-500 tabular-nums">
                      {resultsWithUnit(cr.leads, campaign.objective)} · {money(creativeCpa(cr))} cada
                      {cr.status === 'FATIGUE' && <Badge tone="amber">Em queda</Badge>}
                      {cr.status === 'PAUSED' && <Badge tone="slate">Pausado</Badge>}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </article>
  );
}

function Metric({ label, value, small = false }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="truncate text-xs font-medium text-slate-500" title={label}>
        {label}
      </dt>
      <dd
        className={`mt-0.5 truncate font-bold text-slate-900 tabular-nums ${small ? 'text-sm' : 'text-base sm:text-lg'}`}
      >
        {value}
      </dd>
    </div>
  );
}

function InfoBlock({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Icon className="size-3.5" aria-hidden="true" />
        {title}
      </p>
      <p className="mt-1 text-sm text-slate-800">{children}</p>
    </div>
  );
}
