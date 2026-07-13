import { useState } from 'react';
import type { Settings as SettingsType } from '../types';

interface SettingsProps {
  settings: SettingsType;
  onSave: (settings: SettingsType) => void;
  onReset: () => void;
}

export function Settings({ settings, onSave, onReset }: SettingsProps) {
  const [goalKg, setGoalKg] = useState(String(settings.goalKg));
  const [hour, setHour] = useState(String(settings.notifHour).padStart(2, '0'));
  const [minute, setMinute] = useState(String(settings.notifMinute).padStart(2, '0'));
  const [confirmReset, setConfirmReset] = useState(false);

  const goalKgNum = Number(goalKg.replace(',', '.'));
  const targetKcal = (isNaN(goalKgNum) ? 0 : goalKgNum) * settings.kcalPerKg;
  const dirty =
    goalKg !== String(settings.goalKg) ||
    hour !== String(settings.notifHour).padStart(2, '0') ||
    minute !== String(settings.notifMinute).padStart(2, '0');

  function handleSave() {
    const h = Math.min(23, Math.max(0, Number(hour) || 0));
    const m = Math.min(59, Math.max(0, Number(minute) || 0));
    onSave({
      ...settings,
      goalKg: isNaN(goalKgNum) || goalKgNum <= 0 ? settings.goalKg : goalKgNum,
      notifHour: h,
      notifMinute: m,
    });
  }

  return (
    <div className="screen">
      <div className="card">
        <div className="card-title">Objectif</div>
        <div className="field">
          <span className="field-label">Perte de poids visée (kg)</span>
          <input className="text-input" inputMode="decimal" value={goalKg} onChange={(e) => setGoalKg(e.target.value)} />
        </div>
        <p className="hint" style={{ marginTop: 10 }}>
          Soit un objectif de <b style={{ color: 'var(--text)' }}>{Math.round(targetKcal).toLocaleString('fr-FR')} kcal</b> de déficit cumulé (1 kg ≈ {settings.kcalPerKg} kcal).
        </p>
      </div>

      <div className="card">
        <div className="card-title">Rappel quotidien</div>
        <div className="field">
          <span className="field-label">Heure de la notification</span>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              className="text-input"
              inputMode="numeric"
              style={{ textAlign: 'center' }}
              value={hour}
              maxLength={2}
              onChange={(e) => setHour(e.target.value.replace(/\D/g, ''))}
            />
            <span style={{ fontWeight: 800, fontSize: 20 }}>:</span>
            <input
              className="text-input"
              inputMode="numeric"
              style={{ textAlign: 'center' }}
              value={minute}
              maxLength={2}
              onChange={(e) => setMinute(e.target.value.replace(/\D/g, ''))}
            />
          </div>
        </div>
        <p className="hint" style={{ marginTop: 10 }}>
          Chaque soir à cette heure, une notification te demande si tu as été en déficit.
        </p>
      </div>

      {dirty && (
        <button type="button" className="btn btn-primary btn-block" onClick={handleSave}>
          Enregistrer
        </button>
      )}

      <div className="card">
        <div className="card-title">Zone dangereuse</div>
        {!confirmReset ? (
          <button type="button" className="btn btn-danger-outline btn-block" onClick={() => setConfirmReset(true)}>
            Réinitialiser toutes les données
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p className="hint">Cette action supprime définitivement tout ton historique et tes réglages. Confirmer ?</p>
            <button type="button" className="btn btn-surplus btn-block" onClick={onReset}>
              Oui, tout supprimer
            </button>
            <button type="button" className="btn btn-ghost btn-block" onClick={() => setConfirmReset(false)}>
              Annuler
            </button>
          </div>
        )}
      </div>

      <p className="hint" style={{ textAlign: 'center', paddingBottom: 10 }}>
        Déficit Tracker · toutes tes données restent sur ton téléphone.
      </p>
    </div>
  );
}
