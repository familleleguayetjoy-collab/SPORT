export function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayStr(): string {
  return toDateStr(new Date());
}

export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return toDateStr(dt);
}

export function yesterdayStr(): string {
  return addDays(todayStr(), -1);
}

/** All date strings from `start` to `end` inclusive, ascending. */
export function listDatesBetween(start: string, end: string): string[] {
  if (start > end) return [];
  const dates: string[] = [];
  let cur = start;
  while (cur <= end) {
    dates.push(cur);
    cur = addDays(cur, 1);
  }
  return dates;
}

const DAY_NAMES = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
const MONTH_NAMES = [
  'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
];

export function formatFR(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const dayName = DAY_NAMES[dt.getDay()];
  return `${dayName} ${d} ${MONTH_NAMES[m - 1]}`;
}

export function formatFRShort(dateStr: string): string {
  const [, m, d] = dateStr.split('-').map(Number);
  return `${d}/${m}`;
}

export function isToday(dateStr: string): boolean {
  return dateStr === todayStr();
}
