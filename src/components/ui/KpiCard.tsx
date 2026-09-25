import type { ReactNode } from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight, type LucideIcon } from 'lucide-react';
import { formatDelta } from '../../lib/format';

interface KpiCardProps {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  hint?: ReactNode;
  /** Variação contra o período anterior e se subir é bom ou ruim. */
  delta?: { value: number | null; goodWhen: 'up' | 'down'; label?: string };
  highlight?: boolean;
}

export function KpiCard({ label, value, icon: Icon, hint, delta, highlight = false }: KpiCardProps) {
  const showDelta = delta && delta.value != null && Number.isFinite(delta.value);
  // Abaixo de meio ponto percentual o número aparece como 0%: sem seta e sem cor de melhora ou piora.
  const isFlat = showDelta && Math.abs(delta.value!) < 0.005;
  const isUp = showDelta && delta.value! > 0;
  const isGood = showDelta && (delta.goodWhen === 'up' ? delta.value! >= 0 : delta.value! <= 0);
  const tone = isFlat ? 'text-slate-600' : isGood ? 'text-emerald-700' : 'text-rose-700';
  const DeltaIcon = isFlat ? ArrowRight : isUp ? ArrowUpRight : ArrowDownRight;

  return (
    <div
      className={`flex min-w-0 flex-col rounded-2xl border p-4 shadow-sm sm:p-5 ${
        highlight ? 'border-brand-200 bg-brand-50/60' : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="line-clamp-2 text-[11px] leading-4 font-semibold text-slate-500 uppercase sm:text-xs sm:tracking-wide">{label}</p>
        <span
          className={`grid size-8 shrink-0 place-items-center rounded-lg ${
            highlight ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'
          }`}
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-900 tabular-nums sm:text-[1.7rem]">
        {value}
      </p>
      <div className="mt-1 flex min-h-5 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
        {showDelta && (
          <span
            className={`inline-flex items-center gap-0.5 font-semibold ${tone}`}
          >
            <DeltaIcon className="size-3.5" aria-hidden="true" />
            {formatDelta(delta.value!)}
            <span className="sr-only">{isFlat ? '(estável)' : isGood ? '(melhora)' : '(piora)'}</span>
          </span>
        )}
        {showDelta && delta.label && <span>{delta.label}</span>}
        {hint && <span>{hint}</span>}
      </div>
    </div>
  );
}
