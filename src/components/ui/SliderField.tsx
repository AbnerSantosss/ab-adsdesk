import { useId } from 'react';

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  /** Como mostrar o valor atual (ex.: "R$ 50" ou "45%"). */
  format: (value: number) => string;
  hint?: string;
}

export function SliderField({ label, value, min, max, step = 1, onChange, format, hint }: SliderFieldProps) {
  const id = useId();
  const hintId = useId();

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-slate-700">
          {label}
        </label>
        <output htmlFor={id} className="text-brand-700 text-sm font-bold tabular-nums">
          {format(value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-describedby={hint ? hintId : undefined}
        aria-valuetext={format(value)}
        className="accent-brand-600 mt-2 h-6 w-full cursor-pointer"
      />
      {hint && (
        <p id={hintId} className="mt-0.5 text-xs text-slate-500">
          {hint}
        </p>
      )}
    </div>
  );
}
