import { useMemo, useState } from 'react';
import { ArrowDown, Calculator, Info } from 'lucide-react';
import type { AdAccount } from '../../types/metaAds';
import { accountTotals } from '../../lib/metrics';
import { formatDecimal, formatMoney, formatNumber, pluralize } from '../../lib/format';
import { Modal } from '../ui/Modal';
import { SliderField } from '../ui/SliderField';
import { buttonClass } from '../ui/button';

interface RoiCalculatorModalProps {
  open: boolean;
  onClose: () => void;
  account: AdAccount;
}

const DAYS_IN_MONTH = 30;
const FALLBACK_CPA = 8;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Simulador de retorno para studios: investimento → contatos → aulas experimentais →
 * matrículas → faturamento. É uma estimativa com as taxas que o gestor informar.
 */
export function RoiCalculatorModal({ open, onClose, account }: RoiCalculatorModalProps) {
  const currentCpa = useMemo(() => accountTotals(account).cpa, [account]);
  const initialCpa = clamp(Math.round((currentCpa ?? FALLBACK_CPA) * 2) / 2, 1, 60);

  const [dailyBudget, setDailyBudget] = useState(50);
  const [costPerContact, setCostPerContact] = useState(initialCpa);
  const [trialRate, setTrialRate] = useState(40);
  const [closingRate, setClosingRate] = useState(50);
  const [monthlyFee, setMonthlyFee] = useState(350);
  const [stayMonths, setStayMonths] = useState(6);

  const money = (v: number) => formatMoney(v, account.currency, 0);

  const monthlySpend = dailyBudget * DAYS_IN_MONTH;
  const contacts = Math.floor(monthlySpend / costPerContact);
  const trials = Math.floor(contacts * (trialRate / 100));
  const students = Math.floor(trials * (closingRate / 100));
  const firstMonthRevenue = students * monthlyFee;
  const lifetimeRevenue = firstMonthRevenue * stayMonths;
  const profit = lifetimeRevenue - monthlySpend;
  const roas = monthlySpend > 0 ? lifetimeRevenue / monthlySpend : 0;
  const costPerStudent = students > 0 ? monthlySpend / students : null;

  const funnel = [
    { label: 'Investimento no mês', value: money(monthlySpend) },
    { label: 'Contatos no WhatsApp', value: formatNumber(contacts) },
    { label: 'Aulas experimentais', value: formatNumber(trials) },
    { label: 'Novos alunos', value: formatNumber(students), strong: true },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Simulador de retorno"
      description={`Quanto o investimento em anúncios pode trazer para ${account.businessName}.`}
      icon={Calculator}
      size="xl"
      footer={
        <button type="button" onClick={onClose} className={buttonClass('secondary')}>
          Fechar
        </button>
      }
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
        <section aria-labelledby="roi-premissas" className="space-y-5">
          <h3 id="roi-premissas" className="text-xs font-bold tracking-wide text-slate-500 uppercase">
            Premissas
          </h3>
          <SliderField
            label="Investimento por dia"
            value={dailyBudget}
            min={10}
            max={500}
            step={5}
            onChange={setDailyBudget}
            format={money}
            hint={`${money(monthlySpend)} em ${DAYS_IN_MONTH} dias`}
          />
          <SliderField
            label="Custo por contato"
            value={costPerContact}
            min={1}
            max={60}
            step={0.5}
            onChange={setCostPerContact}
            format={(v) => formatMoney(v, account.currency)}
            hint={
              currentCpa != null
                ? `Média atual da conta: ${formatMoney(currentCpa, account.currency)}`
                : 'A conta ainda não tem histórico; ajuste pela sua experiência.'
            }
          />
          <SliderField
            label="Contatos que agendam aula experimental"
            value={trialRate}
            min={5}
            max={100}
            onChange={setTrialRate}
            format={(v) => `${v}%`}
          />
          <SliderField
            label="Aulas experimentais que viram matrícula"
            value={closingRate}
            min={5}
            max={100}
            onChange={setClosingRate}
            format={(v) => `${v}%`}
          />
          <SliderField
            label="Mensalidade média"
            value={monthlyFee}
            min={100}
            max={1500}
            step={10}
            onChange={setMonthlyFee}
            format={money}
          />
          <SliderField
            label="Tempo médio que o aluno fica"
            value={stayMonths}
            min={1}
            max={24}
            onChange={setStayMonths}
            format={(v) => pluralize(v, 'mês', 'meses')}
          />
        </section>

        <section aria-labelledby="roi-resultado" aria-live="polite" className="space-y-4">
          <h3 id="roi-resultado" className="text-xs font-bold tracking-wide text-slate-500 uppercase">
            Resultado estimado por mês de anúncios
          </h3>

          <ol className="space-y-1.5">
            {funnel.map((step, i) => (
              <li key={step.label}>
                {i > 0 && <ArrowDown className="mx-auto mb-1.5 size-3.5 text-slate-300" aria-hidden="true" />}
                <div
                  className={`flex items-center justify-between gap-3 rounded-xl px-4 py-2.5 ${
                    step.strong ? 'bg-brand-50 ring-brand-200 ring-1' : 'bg-slate-50'
                  }`}
                >
                  <span className={`text-sm ${step.strong ? 'text-brand-900 font-semibold' : 'text-slate-600'}`}>
                    {step.label}
                  </span>
                  <span
                    className={`font-bold tabular-nums ${step.strong ? 'text-brand-800 text-xl' : 'text-base text-slate-900'}`}
                  >
                    {step.value}
                  </span>
                </div>
              </li>
            ))}
          </ol>

          <dl className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 p-3">
              <dt className="text-xs text-slate-500">Custo por aluno</dt>
              <dd className="mt-0.5 text-base font-bold text-slate-900 tabular-nums">
                {costPerStudent != null ? money(costPerStudent) : '—'}
              </dd>
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <dt className="text-xs text-slate-500">Faturamento no 1º mês</dt>
              <dd className="mt-0.5 text-base font-bold text-slate-900 tabular-nums">{money(firstMonthRevenue)}</dd>
            </div>
          </dl>

          <div className="rounded-2xl bg-slate-900 p-4 text-white">
            <p className="text-xs text-slate-400">
              Faturamento com esses alunos em {pluralize(stayMonths, 'mês', 'meses')}
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{money(lifetimeRevenue)}</p>
            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-white/10 pt-3">
              <div>
                <p className="text-xs text-slate-400">{profit >= 0 ? 'Retorno acima do investido' : 'Faltam para empatar'}</p>
                <p className={`text-base font-bold tabular-nums ${profit >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {money(Math.abs(profit))}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Cada {money(1)} investido volta</p>
                <p className="text-base font-bold tabular-nums">{formatMoney(roas, account.currency)}</p>
                <p className="sr-only">ROAS de {formatDecimal(roas, 1)}</p>
              </div>
            </div>
          </div>

          <p className="flex gap-2 text-xs text-slate-500">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            Estimativa para conversa com o cliente, não uma promessa de resultado. As taxas de agendamento e matrícula
            dependem do atendimento no WhatsApp e variam de studio para studio.
          </p>
        </section>
      </div>
    </Modal>
  );
}
