import type { LucideIcon } from 'lucide-react';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
  /** Número exibido ao lado do rótulo (ex.: quantidade de campanhas). */
  count?: number;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  size?: 'sm' | 'md';
  /** Ocupa a largura toda, dividindo igualmente (bom no celular). */
  stretch?: boolean;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  size = 'md',
  stretch = false,
  className = '',
}: SegmentedControlProps<T>) {
  const height = size === 'sm' ? 'h-8 px-2.5 text-xs' : 'h-10 px-3 text-sm';
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={`inline-flex rounded-xl bg-slate-100 p-1 ${stretch ? 'flex w-full' : ''} ${className}`}
    >
      {options.map((option) => {
        const selected = option.value === value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold whitespace-nowrap transition ${height} ${
              stretch ? 'flex-1' : ''
            } ${selected ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            {Icon && <Icon className="size-4" aria-hidden="true" />}
            {option.label}
            {option.count != null && (
              <span className={`tabular-nums ${selected ? 'text-slate-500' : 'text-slate-400'}`}>{option.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
