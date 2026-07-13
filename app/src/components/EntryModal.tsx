import { useState } from 'react';
import { formatFR, isToday } from '../dates';

interface EntryModalProps {
  date: string;
  initialNet?: number | null;
  subtitle?: string;
  onSave: (net: number) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export function EntryModal({ date, initialNet, subtitle, onSave, onDelete, onClose }: EntryModalProps) {
  const [mode, setMode] = useState<'deficit' | 'surplus' | null>(
    initialNet == null ? null : initialNet < 0 ? 'deficit' : 'surplus',
  );
  const [amount, setAmount] = useState<string>(initialNet ? String(Math.abs(initialNet)) : '');

  const canSave = mode !== null && amount.trim() !== '' && Number(amount) >= 0;

  function handleSave() {
    if (!canSave) return;
    const value = Number(amount);
    onSave(mode === 'deficit' ? -value : value);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div>
          <h2>{isToday(date) ? "Bilan d'aujourd'hui" : formatFR(date)}</h2>
          {subtitle && <p className="hint" style={{ marginTop: 4 }}>{subtitle}</p>}
        </div>

        <div className="field">
          <span className="field-label">As-tu été en déficit ?</span>
          <div className="toggle-pair">
            <button
              className={mode === 'deficit' ? 'selected deficit' : ''}
              onClick={() => setMode('deficit')}
              type="button"
            >
              <span className="emoji">🔥</span>
              Déficit
            </button>
            <button
              className={mode === 'surplus' ? 'selected surplus' : ''}
              onClick={() => setMode('surplus')}
              type="button"
            >
              <span className="emoji">😕</span>
              Pas réussi
            </button>
          </div>
        </div>

        <div className="field">
          <span className="field-label">
            {mode === 'surplus' ? 'Surplus (kcal au-dessus de tes besoins)' : 'Montant du déficit (kcal)'}
          </span>
          <div className="kcal-input">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="300"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
            <span className="unit">kcal</span>
          </div>
        </div>

        <button
          type="button"
          className={`btn btn-block ${mode === 'surplus' ? 'btn-surplus' : 'btn-deficit'}`}
          disabled={!canSave}
          style={!canSave ? { opacity: 0.4 } : undefined}
          onClick={handleSave}
        >
          Enregistrer
        </button>

        {onDelete && (
          <button type="button" className="btn btn-danger-outline btn-block" onClick={onDelete}>
            Supprimer ce jour
          </button>
        )}
        <button type="button" className="btn btn-ghost btn-block" onClick={onClose}>
          Annuler
        </button>
      </div>
    </div>
  );
}
