import { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { DEFAULT_SETTINGS, type DailyEntry, type Settings as SettingsType } from './types';
import {
  computeProgress,
  deleteEntry,
  getAllEntries,
  getMissingDates,
  getSettings,
  resetAllData,
  saveSettings,
  upsertEntry,
  type Progress,
} from './storage';
import { ensureNotificationPermission, listenForNotificationTap, scheduleDailyReminder } from './notifications';
import { todayStr } from './dates';
import { Onboarding } from './screens/Onboarding';
import { Dashboard } from './screens/Dashboard';
import { History } from './screens/History';
import { Settings } from './screens/Settings';
import { EntryModal } from './components/EntryModal';

type Tab = 'dashboard' | 'history' | 'settings';

interface ModalState {
  date: string;
  queue: string[];
  editing: boolean;
}

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [settings, setSettings] = useState<SettingsType>(DEFAULT_SETTINGS);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [missingDates, setMissingDates] = useState<string[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [tab, setTab] = useState<Tab>('dashboard');
  const [modal, setModal] = useState<ModalState | null>(null);

  const refresh = useCallback(async (current: SettingsType) => {
    const [allEntries, missing, prog] = await Promise.all([
      getAllEntries(),
      getMissingDates(current),
      computeProgress(current),
    ]);
    setEntries(allEntries);
    setMissingDates(missing);
    setProgress(prog);
  }, []);

  useEffect(() => {
    (async () => {
      const s = await getSettings();
      setSettings(s);
      if (s.onboarded) {
        await refresh(s);
      }
      setLoaded(true);
    })();
  }, [refresh]);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ style: Style.Dark });
      StatusBar.setBackgroundColor({ color: '#0a0d12' });
    }
  }, []);

  useEffect(() => {
    listenForNotificationTap(() => {
      setTab('dashboard');
      setModal({ date: todayStr(), queue: [], editing: false });
    });
  }, []);

  async function handleOnboardingComplete(goalKg: number, notifHour: number, notifMinute: number) {
    const next: SettingsType = {
      ...settings,
      onboarded: true,
      goalKg,
      notifHour,
      notifMinute,
      startDate: todayStr(),
    };
    await saveSettings(next);
    setSettings(next);
    await ensureNotificationPermission();
    await scheduleDailyReminder(next);
    await refresh(next);
  }

  async function handleSaveSettings(next: SettingsType) {
    await saveSettings(next);
    setSettings(next);
    await scheduleDailyReminder(next);
    await refresh(next);
  }

  async function handleResetData() {
    await resetAllData();
    const fresh = { ...DEFAULT_SETTINGS };
    setSettings(fresh);
    setEntries([]);
    setMissingDates([]);
    setProgress(null);
    setModal(null);
  }

  function openLogToday() {
    const existing = entries.find((e) => e.date === todayStr());
    setModal({ date: todayStr(), queue: [], editing: !!existing });
  }

  function openFillMissing() {
    if (missingDates.length === 0) return;
    const [first, ...rest] = missingDates;
    setModal({ date: first, queue: rest, editing: false });
  }

  function openEdit(date: string) {
    setModal({ date, queue: [], editing: true });
  }

  async function handleSaveModal(net: number) {
    if (!modal) return;
    await upsertEntry(modal.date, net);
    await refresh(settings);
    if (modal.queue.length > 0) {
      const [next, ...rest] = modal.queue;
      setModal({ date: next, queue: rest, editing: false });
    } else {
      setModal(null);
    }
  }

  async function handleDeleteModal() {
    if (!modal) return;
    await deleteEntry(modal.date);
    await refresh(settings);
    setModal(null);
  }

  if (!loaded) return null;

  if (!settings.onboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const currentEntry = modal ? entries.find((e) => e.date === modal.date) : undefined;

  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="brand">
          Déficit<span>Tracker</span>
        </div>
      </div>

      {tab === 'dashboard' && progress && (
        <Dashboard
          settings={settings}
          progress={progress}
          entries={entries}
          missingDates={missingDates}
          onLogToday={openLogToday}
          onFillMissing={openFillMissing}
        />
      )}
      {tab === 'history' && <History entries={entries} settings={settings} onEdit={openEdit} />}
      {tab === 'settings' && <Settings settings={settings} onSave={handleSaveSettings} onReset={handleResetData} />}

      <nav className="tabbar">
        <button type="button" className={tab === 'dashboard' ? 'active' : ''} onClick={() => setTab('dashboard')}>
          <span className="icon">🏠</span>
          Accueil
        </button>
        <button type="button" className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}>
          <span className="icon">📈</span>
          Historique
        </button>
        <button type="button" className={tab === 'settings' ? 'active' : ''} onClick={() => setTab('settings')}>
          <span className="icon">⚙️</span>
          Réglages
        </button>
      </nav>

      {modal && (
        <EntryModal
          key={modal.date}
          date={modal.date}
          initialNet={currentEntry ? currentEntry.net : null}
          subtitle={modal.queue.length > 0 ? `Encore ${modal.queue.length} jour${modal.queue.length > 1 ? 's' : ''} après celui-ci` : undefined}
          onSave={handleSaveModal}
          onDelete={modal.editing ? handleDeleteModal : undefined}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
