import { useId, useMemo, useState } from 'react';
import { ArrowRight, Clapperboard, Image as ImageIcon, ImageOff, Info, Layers3, Smartphone, Trophy, type LucideIcon } from 'lucide-react';
import type { AdAccount, CreativeFormat, ViewMode } from '../../types/metaAds';
import {
  MIN_RESULTS_FOR_CHAMPION,
  accountTotals,
  cpaHealth,
  creativeBadges,
  flattenCreatives,
  pickChampion,
  resultsWithUnit,
  type CreativeRow,
} from '../../lib/metrics';
import { CREATIVE_FORMAT, OBJECTIVES } from '../../lib/objectives';
import { formatMoney, formatNumber, formatPercent } from '../../lib/format';
import { AccountAvatar } from '../ui/AccountAvatar';
import { Badge } from '../ui/Badge';
import { CreativePreview } from '../ui/CreativePreview';
import { Modal } from '../ui/Modal';
import { PageHeader } from '../ui/PageHeader';
import { EmptyState } from '../ui/EmptyState';
import { buttonClass } from '../ui/button';
import { ApiAccountNotice } from './ApiAccountNotice';

interface CreativesProps {
  account: AdAccount;
  viewMode: ViewMode;
}

type FormatFilter = 'ALL' | CreativeFormat;
type SortKey = 'CPA' | 'RESULTS' | 'SPEND';

const SORT_LABEL: Record<SortKey, string> = {
  CPA: 'Menor custo por resultado',
  RESULTS: 'Mais resultados',
  SPEND: 'Maior investimento',
};

const FORMAT_ICON: Record<CreativeFormat, LucideIcon> = {
  IMAGE: ImageIcon,
  VIDEO: Clapperboard,
  CAROUSEL: Layers3,
  STORY_REEL: Smartphone,
};

function sortRows(rows: CreativeRow[], key: SortKey): CreativeRow[] {
  const sorted = [...rows];
  if (key === 'RESULTS') return sorted.sort((a, b) => b.leads - a.leads);
  if (key === 'SPEND') return sorted.sort((a, b) => b.spend - a.spend);
  return sorted.sort((a, b) => {
    if (a.cpa == null) return b.cpa == null ? 0 : 1;
    if (b.cpa == null) return -1;
    return a.cpa - b.cpa;
  });
}

export function Creatives({ account, viewMode }: CreativesProps) {
  const [format, setFormat] = useState<FormatFilter>('ALL');
  const [sort, setSort] = useState<SortKey>('CPA');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const sortId = useId();

  const isManager = viewMode === 'MANAGER';
  const rows = useMemo(() => flattenCreatives(account.campaigns), [account.campaigns]);
  const champion = useMemo(() => pickChampion(rows), [rows]);
  const averageCpa = useMemo(() => accountTotals(account).cpa, [account]);

  const formatCounts = useMemo(() => {
    const counts = new Map<CreativeFormat, number>();
    for (const r of rows) counts.set(r.format, (counts.get(r.format) ?? 0) + 1);
    return counts;
  }, [rows]);

  const visible = useMemo(
    () => sortRows(format === 'ALL' ? rows : rows.filter((r) => r.format === format), sort),
    [rows, format, sort],
  );

  const selected = rows.find((r) => r.id === selectedId) ?? null;
  const headerImage = rows.find((row) => row.previewImage)?.previewImage;
  const money = (v: number | null) => formatMoney(v, account.currency);

  if (rows.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Anúncios" eyebrow="Instagram & Facebook" tone="neutral" />
        <ApiAccountNotice account={account} missing="os anúncios desta conta" />
      </div>
    );
  }

  const championIsReal = champion != null && champion.leads >= MIN_RESULTS_FOR_CHAMPION && champion.status !== 'FATIGUE';

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Anúncios"
        eyebrow="Instagram & Facebook"
        tone="neutral"
        image={headerImage ? { src: headerImage.src, alt: headerImage.description } : undefined}
        description="Qual arte e qual texto trazem contato mais barato. Anúncios com desempenho em queda precisam de uma arte nova."
      />

      {champion && (
        <section
          aria-labelledby="campeao"
          data-tone="neutral"
          className="social-champion overflow-hidden rounded-2xl border border-slate-200 shadow-sm"
        >
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
            <div className="flex min-w-0 flex-col border-b border-white/70 md:border-r md:border-b-0">
              <AdAccountHeader account={account} format={champion.format} />
              <CreativePreview creative={champion} className="!h-72 min-h-72 md:!h-full md:flex-1" />
            </div>
            <div className="p-4 sm:p-6">
              <p className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                <Trophy className="size-4" aria-hidden="true" />
                {championIsReal ? 'Anúncio campeão' : 'Anúncio com mais resultados'}
              </p>
              <h2 id="campeao" className="mt-1.5 text-lg font-bold text-slate-900 sm:text-xl">
                {champion.name}
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">{champion.campaignName}</p>

              <dl className="mt-4 grid grid-cols-3 gap-2 md:grid-cols-2 xl:grid-cols-3 sm:gap-3">
                <HeroStat label="Resultados" value={formatNumber(champion.leads)} />
                <HeroStat label="Custo cada" value={money(champion.cpa)} />
                <HeroStat label="Investido" value={money(champion.spend)} />
              </dl>

              <p className="mt-4 flex gap-2 text-xs leading-relaxed text-slate-600">
                <Info className="mt-0.5 size-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                {championIsReal
                  ? `Menor custo por resultado entre os anúncios com pelo menos ${MIN_RESULTS_FOR_CHAMPION} resultados e sem sinal de desgaste. ${cpaHealth(champion.cpa, averageCpa).hint}`
                  : `Nenhum anúncio tem ${MIN_RESULTS_FOR_CHAMPION} resultados ou mais sem desgaste; mostrando o que gerou mais contatos.`}
              </p>

              <button
                type="button"
                onClick={() => setSelectedId(champion.id)}
                className={buttonClass('secondary', 'md', 'mt-4 w-full sm:w-auto')}
              >
                Ver texto e detalhes
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>
      )}

      <div className="social-filterbar flex min-w-0 flex-col gap-4 rounded-2xl p-4 xl:flex-row xl:items-center xl:justify-between">
        <div
          role="group"
          aria-label="Filtrar por formato"
          className="scrollbar-none flex min-w-0 gap-2 overflow-x-auto pb-1"
        >
          {(['ALL', ...formatCounts.keys()] as FormatFilter[]).map((value) => {
            const pressed = value === format;
            const FormatIcon = value === 'ALL' ? Layers3 : FORMAT_ICON[value];
            return (
              <button
                key={value}
                type="button"
                aria-pressed={pressed}
                onClick={() => setFormat(value)}
                className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-3.5 text-sm font-semibold whitespace-nowrap transition ${
                  pressed
                    ? 'border-slate-800 bg-slate-800 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                <FormatIcon className="size-4" aria-hidden="true" />
                {value === 'ALL' ? 'Todos' : CREATIVE_FORMAT[value]}
                <span className={`tabular-nums ${pressed ? 'text-white/70' : 'text-slate-400'}`}>
                  {value === 'ALL' ? rows.length : formatCounts.get(value)}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 sm:shrink-0">
          <label htmlFor={sortId} className="shrink-0 text-sm text-slate-500">
            Ordenar por
          </label>
          <select
            id={sortId}
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="focus:border-brand-500 focus:ring-brand-100 h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 focus:ring-4 focus:outline-none sm:flex-none"
          >
            {(Object.keys(SORT_LABEL) as SortKey[]).map((key) => (
              <option key={key} value={key}>
                {SORT_LABEL[key]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={ImageOff} title="Nenhum anúncio nesse formato" />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((row) => {
            const badges = creativeBadges(row, rows);
            return (
              <li key={row.id} className="min-w-0">
                <article
                  data-tone="neutral"
                  className={`social-creative-card social-surface flex h-full flex-col overflow-hidden rounded-2xl border shadow-sm ${
                    row.status === 'FATIGUE' ? 'border-amber-200' : 'border-slate-200'
                  }`}
                >
                  <AdAccountHeader account={account} format={row.format} />
                  <CreativePreview creative={row} className={`!h-72 ${row.status === 'ACTIVE' && row.campaignActive ? '' : 'opacity-70'}`} />
                  <div className="flex flex-1 flex-col p-4">
                    {badges.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-1.5">
                        {badges.map((b) => (
                          <Badge key={b.label} tone={b.tone}>
                            {b.label}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <h3 className="line-clamp-2 text-sm font-bold text-slate-900">{row.name}</h3>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {OBJECTIVES[row.objective].shortLabel} · {row.campaignName}
                    </p>
                    <dl className="mt-3 grid grid-cols-3 gap-2">
                      <SmallStat label="Resultados" value={formatNumber(row.leads)} />
                      <SmallStat label="Custo cada" value={money(row.cpa)} />
                      <SmallStat
                        label={isManager ? 'CTR' : 'Investido'}
                        value={isManager ? formatPercent(row.ctr, 1) : money(row.spend)}
                      />
                    </dl>
                    <div className="mt-auto pt-3">
                      <button
                        type="button"
                        onClick={() => setSelectedId(row.id)}
                        className={buttonClass('secondary', 'sm', 'w-full justify-between')}
                        aria-label={`Ver texto e detalhes de ${row.name}`}
                      >
                        Ver texto e detalhes
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-xs text-slate-400">
        As prévias são ilustrativas: a arte original fica no Gerenciador de Anúncios da Meta.
      </p>

      {selected && (
        <CreativeDetail
          row={selected}
          rows={rows}
          account={account}
          currency={account.currency}
          averageCpa={averageCpa}
          isManager={isManager}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

interface CreativeDetailProps {
  row: CreativeRow;
  rows: CreativeRow[];
  account: AdAccount;
  currency: string;
  averageCpa: number | null;
  isManager: boolean;
  onClose: () => void;
}

function CreativeDetail({ row, rows, account, currency, averageCpa, isManager, onClose }: CreativeDetailProps) {
  const money = (v: number | null) => formatMoney(v, currency);
  const health = cpaHealth(row.cpa, averageCpa);
  const badges = creativeBadges(row, rows);

  return (
    <Modal open onClose={onClose} title={row.name} description={row.campaignName} size="lg">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
        <div className="mx-auto w-full max-w-sm">
          <div data-tone="neutral" className="social-surface overflow-hidden rounded-xl border border-slate-200">
            <AdAccountHeader account={account} format={row.format} />
            <CreativePreview creative={row} fit="ratio" aspectRatio={row.aspectRatio} />
          </div>
          <p className="mt-1.5 text-center text-[11px] text-slate-400">
            Prévia ilustrativa · {CREATIVE_FORMAT[row.format]} {row.aspectRatio}
          </p>
        </div>

        <div className="min-w-0 space-y-4">
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {badges.map((b) => (
                <Badge key={b.label} tone={b.tone}>
                  {b.label}
                </Badge>
              ))}
            </div>
          )}

          <div data-tone="neutral" className="social-surface rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-500">Título</p>
            <p className="mt-0.5 text-sm font-bold text-slate-900">{row.headline}</p>
            <p className="mt-3 text-xs font-semibold text-slate-500">Texto do anúncio</p>
            <p className="mt-0.5 text-sm whitespace-pre-line text-slate-700">{row.primaryText}</p>
            <p className="mt-3 text-xs font-semibold text-slate-500">Botão</p>
            <p className="mt-0.5 text-sm text-slate-700">{row.callToAction}</p>
          </div>

          <dl className="grid grid-cols-2 gap-3">
            <SmallStat label="Investido" value={money(row.spend)} />
            <SmallStat label="Resultados" value={resultsWithUnit(row.leads, row.objective)} />
            <SmallStat label="Custo cada" value={money(row.cpa)} />
            {isManager && (
              <>
                <SmallStat label="Cliques" value={formatNumber(row.clicks)} />
                <SmallStat label="Impressões" value={formatNumber(row.impressions)} />
                <SmallStat label="CTR" value={formatPercent(row.ctr, 2)} />
              </>
            )}
          </dl>

          <p className="text-sm text-slate-600">
            <Badge tone={health.tone}>{health.label}</Badge> <span className="ml-1">{health.hint}</span>
          </p>

          {row.notes && (
            <div data-tone="neutral" className="social-surface rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-slate-500">Observação do gestor</p>
              <p className="mt-0.5 text-sm text-slate-700">{row.notes}</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

function AdAccountHeader({ account, format }: { account: AdAccount; format: CreativeFormat }) {
  const Icon = FORMAT_ICON[format];

  return (
    <div className="social-ad-account flex min-w-0 items-center gap-2.5 px-4 py-3">
      <span className="shrink-0 overflow-hidden rounded-full ring-2 ring-white">
        <AccountAvatar account={account} size={36} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-slate-900" title={account.businessName}>{account.businessName}</p>
        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-600">
          <Icon className="size-3 shrink-0" aria-hidden="true" />
          {CREATIVE_FORMAT[format]}
        </p>
      </div>
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div data-tone="neutral" className="social-surface min-w-0 rounded-xl px-2.5 py-3 sm:px-3">
      <dt className="truncate text-xs font-medium text-slate-600">{label}</dt>
      <dd className="mt-1 text-sm font-bold text-slate-900 tabular-nums sm:text-lg">{value}</dd>
    </div>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div data-tone="neutral" className="social-surface min-w-0 rounded-lg px-2.5 py-2">
      <dt className="truncate text-[11px] font-medium text-slate-600">{label}</dt>
      <dd className="mt-0.5 truncate text-sm font-bold text-slate-900 tabular-nums">{value}</dd>
    </div>
  );
}
