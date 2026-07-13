export interface DailyEntry {
  /** ISO date, e.g. 2026-07-13 */
  date: string;
  /** kcal for the day. Negative = deficit (good). Positive = surplus (bad). */
  net: number;
}

export interface Settings {
  onboarded: boolean;
  goalKg: number;
  kcalPerKg: number;
  startDate: string;
  notifHour: number;
  notifMinute: number;
}

export const DEFAULT_SETTINGS: Settings = {
  onboarded: false,
  goalKg: 5.5,
  kcalPerKg: 7700,
  startDate: '',
  notifHour: 21,
  notifMinute: 30,
};
