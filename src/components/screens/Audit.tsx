import { useMemo } from 'react';
import { ArrowRight, CircleAlert, CircleCheck, CircleX, Quote, ShieldCheck } from 'lucide-react';
import type { ActiveTab, AdAccount, ObjectiveFilter, ViewMode } from '../../types/metaAds';
import {
  accountTotals,
  auditChecks,
  auditScore,
  campaignTotals,
  cpaHealth,
  structureComparison,
  type StructureSide,
} from '../../lib/metrics';
import { CAMPAIGN_STATUS, OBJECTIVES, tone, type ToneName } from '../../lib/objectives';
import { formatDecimal, formatMoney, formatNumber, pluralize } from '../../lib/format';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { PageHeader } from '../ui/PageHeader';
import { ApiAccountNotice } from './ApiAccountNotice';

interface AuditProps {
  account: AdAccount;
  viewMode: ViewMode;
  onNavigate: (tab: ActiveTab, filter?: ObjectiveFilter) => void;
}

const PROFESSIONAL_PRACTICES = [
  ['Objetivo certo', 'A campanha pede à Meta o resultado que importa (conversa, cadastro), não curtidas ou cliques.'],
  ['Público definido', 'Região, idade e interesses escolhidos para quem pode de fato virar cliente.'],
  ['Vários anúncios em teste', 'A Meta distribui a verba para a arte que traz contato mais barato.'],
  ['Rastreamento', 'Pixel e WhatsApp conectados para medir o que cada real trouxe.'],
];

const BOOSTED_LIMITS = [
  ['Otimiza para interação', 'O botão Turbinar busca curtidas e visitas ao perfil, que não viram contato.'],
  ['Público amplo', 'Pouco controle de região e interesse: a verba se espalha.'],
  ['Um anúncio só', 'Sem teste de arte, não dá para saber o que funcionaria melhor.'],
  ['Sem captura de contato', 'Quem se interessa precisa procurar a empresa por conta própria.'],
];

export function Audit({ account, viewMode, onNavigate }: AuditProps) {
  const isManager = viewMode === 'MANAGER';
  const checks = useMemo(() => auditChecks(account), [account]);
  const score = useMemo(() => auditScore(checks), [checks]);
  const comparison = useMemo(() => structureComparison(account.campaigns), [account.campaigns]);
  const averageCpa = useMemo(() => accountTotals(account).cpa, [account]);

  if (account.campaigns.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Auditoria" />
        <ApiAccountNotice account={account} missing="os dados necessários para a auditoria" />
      </div>
    );
  }

  const passed = checks.filter((c) => c.ok).length;
  const money = (v: number | null) => formatMoney(v, account.currency);

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Auditoria"
        description="Checagem automática de como a verba está sendo usada: estrutura das campanhas, rastreamento e desgaste dos anúncios."
      />

      <section
        aria-labelledby="nota-auditoria"
        className="grid grid-cols-1 gap-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-8"
      >
        <div className="flex flex-col items-center justify-center text-center">
          <ScoreRing score={score.score} toneName={score.tone} />
          <h2 id="nota-auditoria" className="mt-3 text-base font-bold text-slate-900">
            Saúde da conta
          </h2>
          <Badge tone={score.tone} className="mt-1">
            {score.label}
          </Badge>
          <p className="mt-2 text-sm text-slate-500">
            {passed} de {checks.length} itens em ordem
          </p>
        </div>

        <ul className="divide-y divide-slate-100">
          {checks.map((check) => (
            <li key={check.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
              {check.ok ? (
                <CircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden="true" />
              ) : (
                <CircleAlert className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden="true" />
              )}
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-x-2 text-sm font-semibold text-slate-900">
                  {check.label}
                  <span className="sr-only">{check.ok ? '(em ordem)' : '(precisa de atenção)'}</span>
                  {isManager && <span className="text-xs font-normal text-slate-400">peso {check.weight}</span>}
                </p>
                <p className="mt-0.5 text-sm text-slate-600">{check.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {account.audit.managerNote && (
        <figure className="bg-brand-50 ring-brand-100 rounded-2xl p-4 ring-1 sm:p-5">
          <Quote className="text-brand-300 size-5" aria-hidden="true" />
          <blockquote className="mt-2 text-sm leading-relaxed text-slate-700 sm:text-base">
            {account.audit.managerNote}
          </blockquote>
          <figcaption className="mt-2 text-xs font-semibold text-slate-500">Observação do gestor de tráfego</figcaption>
        </figure>
      )}

      <Card
        title="Estrutura das campanhas"
        description="Onde a verba está: campanhas montadas no Gerenciador ou posts turbinados pelo Instagram"
        flush
      >
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <caption className="sr-only">Estrutura de cada campanha da conta</caption>
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-semibold text-slate-500">
                <th scope="col" className="px-5 py-2">
                  Campanha
                </th>
                <th scope="col" className="px-3 py-2">
                  Como foi criada
                </th>
                <th scope="col" className="px-3 py-2">
                  Público
                </th>
                <th scope="col" className="px-3 py-2 text-right">
                  Investido
                </th>
                <th scope="col" className="px-5 py-2 text-right">
                  Custo por resultado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {account.campaigns.map((c) => {
                const t = campaignTotals(c);
                const health = cpaHealth(t.cpa, averageCpa);
                const status = CAMPAIGN_STATUS[c.status];
                return (
                  <tr key={c.id} className="align-top">
                    <th scope="row" className="max-w-xs px-5 py-3 text-left font-normal">
                      <span className="line-clamp-2 font-semibold text-slate-900">{c.name}</span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                        <span className={`size-1.5 rounded-full ${status.dot}`} aria-hidden="true" />
                        {status.label} · {OBJECTIVES[c.objective].shortLabel}
                      </span>
                    </th>
                    <td className="px-3 py-3">
                      <StructureBadge professional={c.isProfessionalStructure} />
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      {c.adSets.length > 0 ? pluralize(c.adSets.length, 'conjunto', 'conjuntos') : 'Não definido'}
                    </td>
                    <td className="px-3 py-3 text-right text-slate-900 tabular-nums">{money(c.totalSpend)}</td>
                    <td className="px-5 py-3 text-right">
                      <span className="block font-semibold text-slate-900 tabular-nums">{money(t.cpa)}</span>
                      <Badge tone={health.tone} className="mt-1">
                        {health.label}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <ul className="divide-y divide-slate-100 md:hidden">
          {account.campaigns.map((c) => {
            const t = campaignTotals(c);
            const status = CAMPAIGN_STATUS[c.status];
            return (
              <li key={c.id} className="px-4 py-3">
                <p className="line-clamp-2 text-sm font-semibold text-slate-900">{c.name}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <StructureBadge professional={c.isProfessionalStructure} />
                  <Badge tone={status.tone}>{status.label}</Badge>
                </div>
                <p className="mt-1.5 text-xs text-slate-500 tabular-nums">
                  {money(c.totalSpend)} investidos · {money(t.cpa)} por resultado ·{' '}
                  {c.adSets.length > 0 ? pluralize(c.adSets.length, 'público', 'públicos') : 'sem público definido'}
                </p>
              </li>
            );
          })}
        </ul>
      </Card>

      <section aria-labelledby="comparativo" className="space-y-3">
        <div>
          <h2 id="comparativo" className="text-base font-bold text-slate-900 sm:text-lg">
            Gerenciador de Anúncios × post turbinado
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            {comparison.multiplier != null && comparison.multiplier > 1.2
              ? `Nesta conta, ${comparison.boosted.count === 1 ? 'o post turbinado custou' : 'os posts turbinados custaram'} ${formatDecimal(comparison.multiplier, 1)}× mais por resultado que as campanhas estruturadas.`
              : 'Por que a verba desta conta fica nas campanhas montadas no Gerenciador.'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ComparisonCard
            title="Campanhas estruturadas"
            toneName="emerald"
            icon={CircleCheck}
            side={comparison.professional}
            currency={account.currency}
            items={PROFESSIONAL_PRACTICES}
          />
          <ComparisonCard
            title="Posts turbinados"
            toneName="rose"
            icon={CircleX}
            side={comparison.boosted}
            currency={account.currency}
            items={BOOSTED_LIMITS}
          />
        </div>
      </section>

      <div className="flex flex-col items-start gap-3 rounded-2xl bg-slate-900 p-5 text-white sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <ShieldCheck className="text-brand-300 mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <p className="text-sm text-slate-200">
            Todo dia, o investimento e os resultados ficam registrados no relatório diário, com a mensagem pronta para
            o cliente.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('DAILY_REPORTS')}
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
        >
          Ver relatório diário
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function StructureBadge({ professional }: { professional: boolean }) {
  return professional ? <Badge tone="emerald">Gerenciador</Badge> : <Badge tone="amber">Post turbinado</Badge>;
}

function ScoreRing({ score, toneName }: { score: number; toneName: ToneName }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative size-32" role="img" aria-label={`Nota ${score} de 100`}>
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" strokeWidth="9" className="stroke-slate-100" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="9"
          strokeLinecap="round"
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - score / 100)}
          className={`transition-[stroke-dashoffset] duration-700 ${tone(toneName).text}`}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center" aria-hidden="true">
        <span className="text-center">
          <span className="block text-3xl font-extrabold text-slate-900 tabular-nums">{score}</span>
          <span className="block text-[11px] font-semibold text-slate-400">de 100</span>
        </span>
      </span>
    </div>
  );
}

interface ComparisonCardProps {
  title: string;
  toneName: ToneName;
  icon: typeof CircleCheck;
  side: StructureSide;
  currency: string;
  items: string[][];
}

function ComparisonCard({ title, toneName, icon: Icon, side, currency, items }: ComparisonCardProps) {
  const t = tone(toneName);
  return (
    <article className={`rounded-2xl border bg-white p-4 shadow-sm sm:p-5 ${t.border}`}>
      <div className="flex items-center gap-3">
        <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${t.icon}`}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-900 sm:text-base">{title}</h3>
          <p className="text-xs text-slate-500">
            {side.count > 0 ? pluralize(side.count, 'campanha nesta conta', 'campanhas nesta conta') : 'Nenhuma nesta conta'}
          </p>
        </div>
      </div>

      {side.count > 0 && (
        <dl className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-center">
          <div className="min-w-0">
            <dt className="text-[11px] font-medium text-slate-500">Investido</dt>
            <dd className="truncate text-sm font-bold text-slate-900 tabular-nums">{formatMoney(side.spend, currency)}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-[11px] font-medium text-slate-500">Resultados</dt>
            <dd className="truncate text-sm font-bold text-slate-900 tabular-nums">{formatNumber(side.results)}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-[11px] font-medium text-slate-500">Custo cada</dt>
            <dd className={`truncate text-sm font-bold tabular-nums ${t.text}`}>{formatMoney(side.cpa, currency)}</dd>
          </div>
        </dl>
      )}

      <ul className="mt-4 space-y-2.5">
        {items.map(([heading, text]) => (
          <li key={heading} className="text-sm text-slate-600">
            <strong className="font-semibold text-slate-900">{heading}.</strong> {text}
          </li>
        ))}
      </ul>
    </article>
  );
}
