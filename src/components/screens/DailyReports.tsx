import { useMemo, useState } from 'react';
import { Check, Coins, Copy, Gauge, Mail, Megaphone, MessageCircle, Printer, Target, Trophy, Users } from 'lucide-react';
import type { AdAccount, ViewMode } from '../../types/metaAds';
import type { BrandConfig } from '../../types/auth';
import { breakdownDays, cpa, dailyReportMessage, deltaPct, previousDaysLabel, weekBefore } from '../../lib/metrics';
import { OBJECTIVES, tone } from '../../lib/objectives';
import { capitalize, formatDayLong, formatDayMonth, formatMoney, formatNumber, parseISODate } from '../../lib/format';
import { copyText } from '../../lib/clipboard';
import { Card } from '../ui/Card';
import { KpiCard } from '../ui/KpiCard';
import { PageHeader } from '../ui/PageHeader';
import { buttonClass } from '../ui/button';
import { WhatsAppText } from '../ui/WhatsAppText';
import { SendReportEmailModal } from '../modals/SendReportEmailModal';
import { ApiAccountNotice } from './ApiAccountNotice';

interface DailyReportsProps {
  account: AdAccount;
  viewMode: ViewMode;
  brand: BrandConfig;
}

const weekdayFormatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' });

export function DailyReports({ account, viewMode, brand }: DailyReportsProps) {
  const history = account.dailyHistory;
  const [selectedDate, setSelectedDate] = useState(history[0]?.date ?? '');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [emailOpen, setEmailOpen] = useState(false);
  const isManager = viewMode === 'MANAGER';

  const day = history.find((d) => d.date === selectedDate) ?? history[0];
  // Compara com os dias anteriores ao escolhido, não com a semana mais recente.
  const week = useMemo(() => weekBefore(history, day?.date ?? ''), [history, day]);
  const breakdown = useMemo(() => (day ? breakdownDays([day]) : []), [day]);
  const message = useMemo(
    () => (day ? dailyReportMessage(account, day, { senderName: brand.parentBrand }) : ''),
    [account, day, brand.parentBrand],
  );

  if (!day) {
    return (
      <div className="space-y-6">
        <PageHeader title="Relatório diário" />
        <ApiAccountNotice account={account} missing="o histórico diário desta conta" />
      </div>
    );
  }

  const money = (v: number | null) => formatMoney(v, account.currency);
  const dayCpa = cpa(day.spend, day.results);
  const avgSpend = week.days > 0 ? week.spend / week.days : null;
  const avgResults = week.days > 0 ? week.results / week.days : null;

  const handleCopy = async () => {
    const ok = await copyText(message);
    setCopyStatus(ok ? 'copied' : 'failed');
    window.setTimeout(() => setCopyStatus('idle'), 2500);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Relatório diário"
        description={
          isManager
            ? 'O resultado de cada dia, com a mensagem pronta para mandar ao cliente pelo WhatsApp.'
            : 'Quanto foi investido e quantos contatos chegaram em cada dia.'
        }
        actions={
          <button type="button" onClick={() => window.print()} className={buttonClass('secondary', 'md', 'print:hidden')}>
            <Printer className="size-4" aria-hidden="true" />
            Imprimir ou salvar PDF
          </button>
        }
      />

      <div
        role="group"
        aria-label="Escolher o dia"
        className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 print:hidden"
      >
        {history.map((d, index) => {
          const selected = d.date === day.date;
          return (
            <button
              key={d.date}
              type="button"
              aria-pressed={selected}
              onClick={() => setSelectedDate(d.date)}
              aria-label={`${capitalize(formatDayLong(d.date))}: ${money(d.spend)}`}
              className={`flex w-20 shrink-0 flex-col items-center rounded-2xl border px-2 py-2.5 transition ${
                selected
                  ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <span className={`text-[11px] font-semibold uppercase ${selected ? 'text-white/70' : 'text-slate-400'}`}>
                {index === 0 ? 'Último' : weekdayFormatter.format(parseISODate(d.date)).replace('.', '')}
              </span>
              <span className="text-base font-bold tabular-nums">{formatDayMonth(d.date)}</span>
              <span className={`text-[11px] tabular-nums ${selected ? 'text-white/80' : 'text-slate-500'}`}>
                {formatMoney(d.spend, account.currency, 0)}
              </span>
            </button>
          );
        })}
      </div>

      <div className={`grid gap-5 lg:gap-6 ${isManager ? 'lg:grid-cols-[minmax(0,1fr)_24rem]' : ''}`}>
        <div className="min-w-0 space-y-5">
          <h2 className="text-base font-bold text-slate-900 sm:text-lg">{capitalize(formatDayLong(day.date))}</h2>

          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <KpiCard
              label="Investimento"
              value={money(day.spend)}
              icon={Coins}
              hint={avgSpend != null ? `média ${previousDaysLabel(week.days)}: ${money(avgSpend)}` : undefined}
            />
            <KpiCard
              label={account.resultLabel}
              value={formatNumber(day.results)}
              icon={Target}
              delta={{ value: deltaPct(day.results, avgResults), goodWhen: 'up', label: `vs. média ${previousDaysLabel(week.days)}` }}
            />
            <KpiCard
              label="Custo por resultado"
              value={money(dayCpa)}
              icon={Gauge}
              highlight
              delta={{ value: deltaPct(dayCpa, week.cpa), goodWhen: 'down', label: `vs. média ${previousDaysLabel(week.days)}` }}
            />
            <KpiCard label="Alcance" value={formatNumber(day.reach)} icon={Users} hint={`${formatNumber(day.clicks)} cliques`} />
          </div>

          <Card
            title="Por tipo de campanha"
            description="Quanto cada objetivo gastou e trouxe neste dia"
            flush={breakdown.length > 0}
          >
            {breakdown.length === 0 ? (
              <p className="text-sm text-slate-500">
                O detalhamento por tipo de campanha não está disponível para este dia.
              </p>
            ) : (
              <>
                <table className="hidden w-full text-sm md:table">
                  <caption className="sr-only">Resultados do dia por tipo de campanha</caption>
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs font-semibold text-slate-500">
                      <th scope="col" className="px-5 py-2">
                        Tipo
                      </th>
                      <th scope="col" className="px-3 py-2 text-right">
                        Investimento
                      </th>
                      <th scope="col" className="px-3 py-2 text-right">
                        Resultados
                      </th>
                      <th scope="col" className="px-5 py-2 text-right">
                        Custo cada
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {breakdown.map((item) => {
                      const meta = OBJECTIVES[item.objective];
                      const Icon = meta.icon;
                      return (
                        <tr key={item.objective}>
                          <th scope="row" className="px-5 py-3 text-left font-medium text-slate-800">
                            <span className="flex items-center gap-2.5">
                              <span className={`grid size-7 place-items-center rounded-lg ${tone(meta.tone).icon}`}>
                                <Icon className="size-4" aria-hidden="true" />
                              </span>
                              {meta.label}
                            </span>
                          </th>
                          <td className="px-3 py-3 text-right tabular-nums">{money(item.spend)}</td>
                          <td className="px-3 py-3 text-right tabular-nums">{formatNumber(item.results)}</td>
                          <td className="px-5 py-3 text-right font-semibold tabular-nums">{money(item.cpa)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <ul className="divide-y divide-slate-100 md:hidden">
                  {breakdown.map((item) => {
                    const meta = OBJECTIVES[item.objective];
                    const Icon = meta.icon;
                    return (
                      <li key={item.objective} className="flex items-center gap-3 px-4 py-3">
                        <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${tone(meta.tone).icon}`}>
                          <Icon className="size-4" aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-800">{meta.label}</p>
                          <p className="text-xs text-slate-500 tabular-nums">
                            {money(item.spend)} · {money(item.cpa)} cada
                          </p>
                        </div>
                        <p className="text-base font-bold text-slate-900 tabular-nums">{formatNumber(item.results)}</p>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </Card>

          <Card title="Destaques do dia">
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Highlight icon={Megaphone} label="Campanha que mais trouxe resultados" value={day.topCampaignName} />
              <Highlight icon={Trophy} label="Anúncio destaque" value={day.topCreativeName} />
            </dl>
          </Card>
        </div>

        {isManager && (
          <aside className="min-w-0 print:hidden">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-36">
              <header className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
                <MessageCircle className="size-4 text-[#1f9d55]" aria-hidden="true" />
                <h2 className="text-sm font-bold text-slate-900">Mensagem para o cliente</h2>
              </header>
              <div className="bg-[#efeae2] p-3 sm:p-4">
                <div className="relative ml-auto max-w-[95%] rounded-xl rounded-tr-sm bg-[#d9fdd3] px-3 py-2 text-[13px] leading-relaxed text-slate-800 shadow-sm">
                  <WhatsAppText text={message} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(message)}`}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonClass('whatsapp', 'md', 'sm:col-span-2')}
                >
                  <MessageCircle className="size-4" aria-hidden="true" />
                  Abrir no WhatsApp
                </a>
                <button type="button" onClick={handleCopy} className={buttonClass('secondary')}>
                  {copyStatus === 'copied' ? (
                    <Check className="size-4 text-emerald-600" aria-hidden="true" />
                  ) : (
                    <Copy className="size-4" aria-hidden="true" />
                  )}
                  {copyStatus === 'copied' ? 'Copiado' : 'Copiar texto'}
                </button>
                <button type="button" onClick={() => setEmailOpen(true)} className={buttonClass('secondary')}>
                  <Mail className="size-4" aria-hidden="true" />
                  Enviar por e-mail
                </button>
              </div>
              <p className="sr-only" aria-live="polite">
                {copyStatus === 'copied'
                  ? 'Mensagem copiada.'
                  : copyStatus === 'failed'
                    ? 'Não foi possível copiar. Selecione o texto e copie manualmente.'
                    : ''}
              </p>
              {copyStatus === 'failed' && (
                <p className="px-4 pb-3 text-xs text-rose-700">
                  O navegador bloqueou a cópia. Selecione o texto da mensagem e copie manualmente.
                </p>
              )}
            </div>
          </aside>
        )}
      </div>

      {emailOpen && (
        <SendReportEmailModal
          open
          onClose={() => setEmailOpen(false)}
          accountId={account.id}
          defaultSubject={`Relatório de ${formatDayMonth(day.date)} · ${account.businessName}`}
          message={message}
          senderName={brand.parentBrand}
        />
      )}
    </div>
  );
}

function Highlight({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: string }) {
  return (
    <div className="flex min-w-0 gap-3 rounded-xl bg-slate-50 p-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden="true" />
      <div className="min-w-0">
        <dt className="text-xs font-semibold text-slate-500">{label}</dt>
        <dd className="mt-0.5 text-sm font-medium text-slate-900">{value || '—'}</dd>
      </div>
    </div>
  );
}
