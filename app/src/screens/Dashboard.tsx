import type { DailyEntry, Settings } from '../types';
import type { Progress } from '../storage';
import { ProgressRing } from '../components/ProgressRing';
import { formatFR, todayStr } from '../dates';

interface DashboardProps {
  settings: Settings;
  progress: Progress;
  entries: DailyEntry[];
  missingDates: string[];
  onLogToday: () => void;
  onFillMissing: () => void;
}

function kcalLabel(n: number): string {
  const rounded = Math.round(n);
  return `${rounded > 0 ? '+' : ''}${rounded.toLocaleString('fr-FR')}`;
}

export function Dashboard({ settings, progress, entries, missingDates, onLogToday, onFillMissing }: DashboardProps) {
  const todayEntry = entries.find((e) => e.date === todayStr());
  const recent = [...entries].reverse().slice(0, 6);
  const remainingKcal = Math.max(0, progress.targetKcal - progress.progressKcal);
  const remainingKg = remainingKcal / settings.kcalPerKg;

  return (
    <div className="screen">
      {missingDates.length > 0 && (
        <button type="button" className="banner" onClick={onFillMissing} style={{ border: 'none', width: '100%', textAlign: 'left' }}>
          <span style={{ fontSize: 22 }}>⏰</span>
          <span className="banner-text">
            <b>{missingDates.length}</b> jour{missingDates.length > 1 ? 's' : ''} à renseigner
          </span>
          <span style={{ color: 'var(--accent-2)', fontWeight: 700 }}>→</span>
        </button>
      )}

      <div className="card center-col" style={{ paddingTop: 28, paddingBottom: 28 }}>
        <ProgressRing percent={progress.percent} size={200} strokeWidth={16}>
          <span className="value">{progress.percent.toFixed(0)}%</span>
          <span className="label">de l'objectif</span>
        </ProgressRing>
        <div>
          <h2 style={{ fontSize: 26 }}>{progress.kgLost.toFixed(2)} kg perdus</h2>
          <p className="hint">
            sur {settings.goalKg} kg · encore <b style={{ color: 'var(--text)' }}>{remainingKg.toFixed(2)} kg</b> ({Math.round(remainingKcal).toLocaleString('fr-FR')} kcal)
          </p>
        </div>
        {progress.currentStreak > 0 && (
          <span className="streak-badge">🔥 {progress.currentStreak} jour{progress.currentStreak > 1 ? 's' : ''} de suite en déficit</span>
        )}
      </div>

      <div className="stat-grid">
        <div className="stat">
          <div className="stat-value">{progress.daysLogged}</div>
          <div className="stat-label">Jours suivis</div>
        </div>
        <div className="stat">
          <div className="stat-value">{Math.round(progress.progressKcal).toLocaleString('fr-FR')}</div>
          <div className="stat-label">kcal cumulés</div>
        </div>
      </div>

      {!todayEntry ? (
        <button type="button" className="btn btn-primary btn-block" onClick={onLogToday}>
          🔥 Renseigner aujourd'hui
        </button>
      ) : (
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>{todayEntry.net < 0 ? '✅' : '⚠️'}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Bilan du jour enregistré</div>
            <div className={`entry-amount ${todayEntry.net < 0 ? 'deficit' : 'surplus'}`}>
              {kcalLabel(todayEntry.net)} kcal
            </div>
          </div>
          <button type="button" className="btn btn-ghost" onClick={onLogToday}>
            Modifier
          </button>
        </div>
      )}

      <div className="card">
        <div className="card-title">Derniers jours</div>
        {recent.length === 0 ? (
          <div className="empty-state">
            <span className="emoji">📋</span>
            Aucun bilan enregistré pour l'instant.
          </div>
        ) : (
          recent.map((e) => (
            <div className="entry-row" key={e.date}>
              <span className={`entry-dot ${e.net < 0 ? 'deficit' : 'surplus'}`} />
              <span className="entry-date">{formatFR(e.date)}</span>
              <span className={`entry-amount ${e.net < 0 ? 'deficit' : 'surplus'}`}>{kcalLabel(e.net)} kcal</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
