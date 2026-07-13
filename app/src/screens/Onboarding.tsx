import { useState } from 'react';

interface OnboardingProps {
  onComplete: (goalKg: number, notifHour: number, notifMinute: number) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [goalKg, setGoalKg] = useState('5.5');
  const [hour, setHour] = useState('21');
  const [minute, setMinute] = useState('30');

  const goalKgNum = Number(goalKg.replace(',', '.'));
  const valid = !isNaN(goalKgNum) && goalKgNum > 0;
  const targetKcal = valid ? Math.round(goalKgNum * 7700) : 0;

  function handleStart() {
    if (!valid) return;
    const h = Math.min(23, Math.max(0, Number(hour) || 21));
    const m = Math.min(59, Math.max(0, Number(minute) || 30));
    onComplete(goalKgNum, h, m);
  }

  return (
    <div className="screen" style={{ paddingTop: 40 }}>
      <div className="center-col">
        <div className="logo-badge">🔥</div>
        <h1 style={{ fontSize: 28 }}>Déficit Tracker</h1>
        <p className="hint">Un seul objectif : ton déficit calorique, jour après jour.</p>
      </div>

      <div className="card">
        <div className="card-title">Combien veux-tu perdre ?</div>
        <div className="kcal-input">
          <input
            type="text"
            inputMode="decimal"
            value={goalKg}
            onChange={(e) => setGoalKg(e.target.value)}
            autoFocus
          />
          <span className="unit">kg</span>
        </div>
        {valid && (
          <p className="hint" style={{ marginTop: 12 }}>
            Ça représente <b style={{ color: 'var(--text)' }}>{targetKcal.toLocaleString('fr-FR')} kcal</b> de déficit cumulé à atteindre (1 kg ≈ 7700 kcal).
          </p>
        )}
      </div>

      <div className="card">
        <div className="card-title">Ton rappel quotidien</div>
        <p className="hint" style={{ marginBottom: 12 }}>
          Chaque soir, une notification te demandera si tu as tenu ton déficit.
        </p>
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

      <button
        type="button"
        className="btn btn-primary btn-block"
        disabled={!valid}
        style={!valid ? { opacity: 0.4 } : undefined}
        onClick={handleStart}
      >
        C'est parti 💪
      </button>
    </div>
  );
}
