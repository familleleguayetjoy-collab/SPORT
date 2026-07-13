import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import type { Settings } from './types';

const DAILY_CHECK_ID = 4242;

export async function ensureNotificationPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return true;
  const current = await LocalNotifications.checkPermissions();
  if (current.display === 'granted') return true;
  const requested = await LocalNotifications.requestPermissions();
  return requested.display === 'granted';
}

/** (Re)schedules the repeating daily reminder at settings.notifHour:notifMinute. */
export async function scheduleDailyReminder(settings: Settings): Promise<void> {
  // Local notification scheduling (channels, exact alarms) only exists on native Android.
  if (!Capacitor.isNativePlatform()) return;

  await LocalNotifications.cancel({ notifications: [{ id: DAILY_CHECK_ID }] });

  await LocalNotifications.createChannel({
    id: 'deficit-daily',
    name: 'Bilan quotidien',
    description: 'Rappel quotidien pour renseigner ton bilan calorique',
    importance: 5,
    visibility: 1,
  });

  await LocalNotifications.schedule({
    notifications: [
      {
        id: DAILY_CHECK_ID,
        channelId: 'deficit-daily',
        title: '🔥 Bilan du jour',
        body: "As-tu été en déficit aujourd'hui ? Note ton résultat.",
        schedule: {
          on: { hour: settings.notifHour, minute: settings.notifMinute },
          allowWhileIdle: true,
        },
        extra: { type: 'daily-check' },
      },
    ],
  });
}

export async function cancelDailyReminder(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  await LocalNotifications.cancel({ notifications: [{ id: DAILY_CHECK_ID }] });
}

/** Registers a listener so tapping the notification opens the entry flow. onOpen is called with today's date. */
export function listenForNotificationTap(onOpen: () => void): void {
  if (!Capacitor.isNativePlatform()) return;
  LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
    if (action.notification.extra?.type === 'daily-check') {
      onOpen();
    }
  });
}
