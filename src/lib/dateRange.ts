import type { DailyStat } from '../types/metaAds';

export type DatePreset = 'TODAY' | 'YESTERDAY' | 'LAST_7' | 'CUSTOM';

export interface DateRange {
  start: string;
  end: string;
  preset: DatePreset;
}

/** Calendar dates stay local: converting through UTC can shift a Brazilian date. */
export function localDateISO(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function shiftDate(iso: string, days: number): string {
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12);
  date.setDate(date.getDate() + days);
  return localDateISO(date);
}

export function presetDateRange(preset: Exclude<DatePreset, 'CUSTOM'>, now = new Date()): DateRange {
  const today = localDateISO(now);
  const end = preset === 'YESTERDAY' ? shiftDate(today, -1) : today;
  return { preset, start: preset === 'LAST_7' ? shiftDate(end, -6) : end, end };
}

/** Historical demos open on their available sample, explicitly as a custom interval. */
export function initialDateRange(history: DailyStat[], isRealApi: boolean, now = new Date()): DateRange {
  const sample = [...history].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
  if (isRealApi || sample.length === 0) return presetDateRange('LAST_7', now);
  return { preset: 'CUSTOM', start: sample[sample.length - 1].date, end: sample[0].date };
}

export function daysInRange(history: DailyStat[], range: DateRange): DailyStat[] {
  return history
    .filter((day) => day.date >= range.start && day.date <= range.end)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Inclusive calendar-day count, independent of daylight-saving offsets. */
export function dateRangeDayCount(range: Pick<DateRange, 'start' | 'end'>): number {
  const utcDay = (iso: string) => {
    const [year, month, day] = iso.split('-').map(Number);
    return Date.UTC(year, month - 1, day);
  };
  return Math.round((utcDay(range.end) - utcDay(range.start)) / 86_400_000) + 1;
}

export function isValidDateRange(start: string, end: string): boolean {
  const valid = (iso: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
    const [year, month, day] = iso.split('-').map(Number);
    const date = new Date(year, month - 1, day, 12);
    return year >= 1000 && localDateISO(date) === iso;
  };
  return valid(start) && valid(end) && start <= end;
}
