import { useId, useState, type FormEvent } from 'react';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { formatDate, formatDayMonth } from '../../lib/format';
import { isValidDateRange, presetDateRange, type DateRange } from '../../lib/dateRange';
import { Modal } from './Modal';
import { buttonClass } from './button';

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (value: DateRange) => void;
  availableRange?: { start: string; end: string };
}

const presets = [
  { value: 'TODAY', label: 'Hoje' },
  { value: 'YESTERDAY', label: 'Ontem' },
  { value: 'LAST_7', label: 'Últimos 7 dias' },
] as const;

export function DateRangeFilter({ value, onChange, availableRange }: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState('');
  const inputId = useId();
  const rangeLabel = `${formatDate(value.start)} a ${formatDate(value.end)}`;

  const openCalendar = () => {
    setDraft(value);
    setError('');
    setOpen(true);
  };

  const applyRange = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValidDateRange(draft.start, draft.end)) {
      setError('Informe as duas datas. A data inicial deve ser anterior ou igual à final.');
      return;
    }
    onChange({ ...draft, preset: 'CUSTOM' });
    setOpen(false);
  };

  return (
    <>
      <div className="flex min-w-0 flex-wrap items-center gap-1.5" role="group" aria-label="Período dos indicadores e gráfico">
        <div className="flex min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 p-1 sm:flex-none">
          {presets.map((preset) => (
            <button
              key={preset.value}
              type="button"
              aria-pressed={value.preset === preset.value}
              onClick={() => onChange(presetDateRange(preset.value))}
              className={`min-h-9 flex-1 whitespace-nowrap rounded-lg px-3 text-xs font-semibold transition sm:flex-none ${
                value.preset === preset.value
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={openCalendar}
          aria-label={`Selecionar período personalizado. Período atual: ${rangeLabel}`}
          aria-haspopup="dialog"
          aria-expanded={open}
          className={`inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold transition ${
            value.preset === 'CUSTOM'
              ? 'border-slate-400 bg-white text-slate-900'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
          }`}
        >
          <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline">{value.preset === 'CUSTOM' ? `${formatDayMonth(value.start)} – ${formatDayMonth(value.end)}` : 'Personalizar'}</span>
          <ChevronDown className="hidden size-3.5 shrink-0 sm:block" aria-hidden="true" />
        </button>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Selecionar período"
        description="Escolha as datas para os indicadores e o gráfico diário."
        icon={CalendarDays}
      >
        <form onSubmit={applyRange} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label htmlFor={`${inputId}-start`} className="min-w-0 text-sm font-semibold text-slate-700">
              De
              <input
                id={`${inputId}-start`}
                data-autofocus
                type="date"
                required
                value={draft.start}
                max={draft.end || undefined}
                onChange={(event) => { setDraft({ ...draft, start: event.target.value }); setError(''); }}
                className="mt-1.5 block min-h-11 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 text-base font-normal text-slate-900"
              />
            </label>
            <label htmlFor={`${inputId}-end`} className="min-w-0 text-sm font-semibold text-slate-700">
              Até
              <input
                id={`${inputId}-end`}
                type="date"
                required
                value={draft.end}
                min={draft.start || undefined}
                onChange={(event) => { setDraft({ ...draft, end: event.target.value }); setError(''); }}
                className="mt-1.5 block min-h-11 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 text-base font-normal text-slate-900"
              />
            </label>
          </div>
          {availableRange && (
            <p className="rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
              Histórico disponível: {formatDate(availableRange.start)} a {formatDate(availableRange.end)}.
              {' '}Datas sem registros aparecem como sem dados.
            </p>
          )}
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
            <button type="button" onClick={() => setOpen(false)} className={buttonClass('secondary', 'md')}>
              Cancelar
            </button>
            <button type="submit" className={buttonClass('primary', 'md')}>
              Aplicar período
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
