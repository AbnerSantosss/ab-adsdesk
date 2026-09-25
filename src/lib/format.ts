const LOCALE = 'pt-BR';

const moneyFormatters = new Map<string, Intl.NumberFormat>();
const numberFormatter = new Intl.NumberFormat(LOCALE);
const compactFormatter = new Intl.NumberFormat(LOCALE, { notation: 'compact', maximumFractionDigits: 1 });

function moneyFormatter(currency: string, decimals: number): Intl.NumberFormat {
  const key = `${currency}:${decimals}`;
  let formatter = moneyFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(LOCALE, {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    moneyFormatters.set(key, formatter);
  }
  return formatter;
}

/** Valor em dinheiro. `null` (ex.: custo sem resultados) vira travessão. */
export function formatMoney(value: number | null | undefined, currency = 'BRL', decimals = 2): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return moneyFormatter(currency, decimals).format(value);
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return numberFormatter.format(Math.round(value));
}

export function formatCompact(value: number): string {
  return compactFormatter.format(value);
}

/** Percentual a partir de uma fração (0.0245 → "2,45%"). */
export function formatPercent(fraction: number | null | undefined, decimals = 1): string {
  if (fraction == null || !Number.isFinite(fraction)) return '—';
  return `${(fraction * 100).toLocaleString(LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`;
}

/** Variação com sinal (0.12 → "+12%"). */
export function formatDelta(fraction: number, decimals = 0): string {
  // O sinal segue o valor arredondado: 0,3% com zero casas vira "0%", não "+0%".
  const rounded = Number((fraction * 100).toFixed(decimals));
  const sign = rounded > 0 ? '+' : rounded < 0 ? '−' : '';
  return `${sign}${formatPercent(Math.abs(fraction), decimals)}`;
}

export function formatDecimal(value: number | null | undefined, decimals = 2): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return value.toLocaleString(LOCALE, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/**
 * Converte "YYYY-MM-DD" em data local. `new Date('2026-09-01')` seria meia-noite UTC,
 * que no Brasil vira o dia anterior.
 */
export function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

const dateFormatter = new Intl.DateTimeFormat(LOCALE, { day: '2-digit', month: '2-digit', year: 'numeric' });
const dayShortFormatter = new Intl.DateTimeFormat(LOCALE, { weekday: 'short', day: '2-digit', month: '2-digit' });
const dayLongFormatter = new Intl.DateTimeFormat(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' });
const dayMonthFormatter = new Intl.DateTimeFormat(LOCALE, { day: '2-digit', month: '2-digit' });
const timeFormatter = new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit' });

/** "01/09/2026" */
export function formatDate(iso: string): string {
  return dateFormatter.format(parseISODate(iso));
}

/** "qua 23/09" */
export function formatDayShort(iso: string): string {
  return dayShortFormatter.format(parseISODate(iso)).replace('.,', '');
}

/** "quarta-feira, 23 de setembro" */
export function formatDayLong(iso: string): string {
  return dayLongFormatter.format(parseISODate(iso));
}

/** "23/09" */
export function formatDayMonth(iso: string): string {
  return dayMonthFormatter.format(parseISODate(iso));
}

/** "14:32" */
export function formatTime(date: Date | string): string {
  return timeFormatter.format(typeof date === 'string' ? new Date(date) : date);
}

/** Dias corridos desde uma data "YYYY-MM-DD" até hoje (mínimo 1). */
export function daysSince(iso: string, today = new Date()): number {
  const start = parseISODate(iso);
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.max(1, Math.round((base.getTime() - start.getTime()) / 86_400_000) + 1);
}

/** Primeira letra maiúscula (o Intl devolve dias da semana em minúsculas). */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function pluralize(count: number, singular: string, plural: string): string {
  return `${formatNumber(count)} ${count === 1 ? singular : plural}`;
}
