import type { ReactNode } from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight, type LucideIcon } from 'lucide-react';
import { formatDelta } from '../../lib/format';
import type { SocialTone } from '../../lib/socialTheme';

interface KpiCardProps {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  hint?: ReactNode;
  /** Variação contra o período anterior e se subir é bom ou ruim. */
  delta?: { value: number | null; goodWhen: 'up' | 'down'; label?: string };
  tone?: SocialTone;
}

export function KpiCard({ label, value, icon: Icon, hint, delta, tone: surfaceTone = 'neutral' }: KpiCardProps) {
  const showDelta = delta && delta.value != null && Number.isFinite(delta.value);
  // Abaixo de meio ponto percentual o número aparece como 0%: sem seta e sem cor de melhora ou piora.
  const isFlat = showDelta && Math.abs(delta.value!) < 0.005;
  const isUp = showDelta && delta.value! > 0;
  const isGood = showDelta && (delta.goodWhen === 'up' ? delta.value! >= 0 : delta.value! <= 0);
  const tone = isFlat ? 'text-slate-600' : isGood ? 'text-emerald-700' : 'text-rose-700';
  const DeltaIcon = isFlat ? ArrowRight : isUp ? ArrowUpRight : ArrowDownRight;

  return (
    <div
      className="social-surface social-kpi flex min-w-0 flex-col rounded-2xl border p-4 shadow-sm sm:p-5"
      data-tone={surfaceTone}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="line-clamp-2 text-[11px] leading-4 font-semibold text-slate-600 uppercase sm:text-xs sm:tracking-wide">{label}</p>
        <span
          className="social-icon shrink-0"
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
