import { Preferences } from '@capacitor/preferences';
import { DEFAULT_SETTINGS, type DailyEntry, type Settings } from './types';
import { listDatesBetween, todayStr, yesterdayStr } from './dates';

const SETTINGS_KEY = 'deficit-tracker.settings';
const ENTRIES_KEY = 'deficit-tracker.entries';

export async function getSettings(): Promise<Settings> {
  const { value } = await Preferences.get({ key: SETTINGS_KEY });
  if (!value) return { ...DEFAULT_SETTINGS };
  return { ...DEFAULT_SETTINGS, ...JSON.parse(value) };
}

export async function saveSettings(settings: Settings): Promise<void> {
  await Preferences.set({ key: SETTINGS_KEY, value: JSON.stringify(settings) });
}

async function getEntriesMap(): Promise<Record<string, number>> {
  const { value } = await Preferences.get({ key: ENTRIES_KEY });
  if (!value) return {};
  return JSON.parse(value);
}

async function saveEntriesMap(map: Record<string, number>): Promise<void> {
  await Preferences.set({ key: ENTRIES_KEY, value: JSON.stringify(map) });
}

export async function getAllEntries(): Promise<DailyEntry[]> {
  const map = await getEntriesMap();
  return Object.entries(map)
    .map(([date, net]) => ({ date, net }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

export async function getEntry(date: string): Promise<DailyEntry | null> {
  const map = await getEntriesMap();
  if (!(date in map)) return null;
  return { date, net: map[date] };
}

export async function upsertEntry(date: string, net: number): Promise<void> {
  const map = await getEntriesMap();
  map[date] = net;
  await saveEntriesMap(map);
}

export async function deleteEntry(date: string): Promise<void> {
  const map = await getEntriesMap();
  delete map[date];
  await saveEntriesMap(map);
}

/** Dates between settings.startDate and yesterday (inclusive) that have no entry. */
export async function getMissingDates(settings: Settings): Promise<string[]> {
  if (!settings.startDate) return [];
  const map = await getEntriesMap();
  const end = yesterdayStr();
  if (settings.startDate > end) return [];
  return listDatesBetween(settings.startDate, end).filter((d) => !(d in map));
}

export interface Progress {
  totalNet: number;
  progressKcal: number;
  targetKcal: number;
  kgLost: number;
  percent: number;
  currentStreak: number;
  daysLogged: number;
}

export async function computeProgress(settings: Settings): Promise<Progress> {
  const entries = await getAllEntries();
  const totalNet = entries.reduce((sum, e) => sum + e.net, 0);
  const targetKcal = settings.goalKg * settings.kcalPerKg;
  const progressKcal = Math.max(0, -totalNet);
  const kgLost = progressKcal / settings.kcalPerKg;
  const percent = targetKcal > 0 ? Math.min(100, (progressKcal / targetKcal) * 100) : 0;

  // Current streak: consecutive days (ending yesterday or today) logged with a deficit (net < 0).
  const byDate = new Map(entries.map((e) => [e.date, e.net]));
  let streak = 0;
  let cursor = byDate.has(todayStr()) ? todayStr() : yesterdayStr();
  while (byDate.has(cursor) && (byDate.get(cursor) as number) < 0) {
    streak += 1;
    cursor = shiftBack(cursor);
  }

  return {
    totalNet,
    progressKcal,
    targetKcal,
    kgLost,
    percent,
    currentStreak: streak,
    daysLogged: entries.length,
  };
}

function shiftBack(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

export async function resetAllData(): Promise<void> {
  await Preferences.remove({ key: ENTRIES_KEY });
  await Preferences.remove({ key: SETTINGS_KEY });
}
