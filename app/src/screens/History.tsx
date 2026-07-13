import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DailyEntry, Settings } from '../types';
import { formatFR, formatFRShort } from '../dates';

interface HistoryProps {
  entries: DailyEntry[];
  settings: Settings;
  onEdit: (date: string) => void;
}

function kcalLabel(n: number): string {
  const rounded = Math.round(n);
  return `${rounded > 0 ? '+' : ''}${rounded.toLocaleString('fr-FR')}`;
}

function TooltipContent({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--card-border)',
        borderRadius: 10,
        padding: '8px 12px',
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      <div style={{ color: 'var(--text-dim)', marginBottom: 2 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ color: p.value < 0 ? 'var(--deficit)' : 'var(--surplus)' }}>
          {kcalLabel(p.value)} kcal
        </div>
      ))}
    </div>
  );
}

export function History({ entries, settings, onEdit }: HistoryProps) {
  const [tab, setTab] = useState<'daily' | 'progress'>('progress');

  const dailyData = entries.slice(-21).map((e) => ({
    label: formatFRShort(e.date),
    date: e.date,
    net: e.net,
  }));

  let running = 0;
  const progressData = entries.map((e) => {
    running += e.net;
    return { label: formatFRShort(e.date), date: e.date, progress: -running };
  });

  const target = settings.goalKg * settings.kcalPerKg;
  const reversedEntries = [...entries].reverse();

  return (
    <div className="screen">
      <div className="card">
        <div className="chart-tabs" style={{ marginBottom: 16 }}>
          <button type="button" className={tab === 'progress' ? 'active' : ''} onClick={() => setTab('progress')}>
            Progression
          </button>
          <button type="button" className={tab === 'daily' ? 'active' : ''} onClick={() => setTab('daily')}>
            Quotidien
          </button>
        </div>

        {entries.length === 0 ? (
          <div className="empty-state">
            <span className="emoji">📈</span>
            Renseigne quelques jours pour voir ton graphique.
          </div>
        ) : tab === 'progress' ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={progressData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: 'var(--text-faint)', fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={24} />
              <YAxis tick={{ fill: 'var(--text-faint)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TooltipContent />} />
              <ReferenceLine y={target} stroke="var(--accent-2)" strokeDasharray="5 5" label={{ value: 'Objectif', fill: 'var(--accent-2)', fontSize: 11, position: 'insideTopRight' }} />
              <Line type="monotone" dataKey="progress" stroke="var(--accent)" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: 'var(--text-faint)', fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={16} />
              <YAxis tick={{ fill: 'var(--text-faint)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TooltipContent />} />
              <Bar dataKey="net" radius={[6, 6, 6, 6]}>
                {dailyData.map((d) => (
                  <Cell key={d.date} fill={d.net < 0 ? 'var(--deficit)' : 'var(--surplus)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card" style={{ flex: 1 }}>
        <div className="card-title">Historique complet</div>
        {reversedEntries.length === 0 ? (
          <div className="empty-state">
            <span className="emoji">🗂️</span>
            Aucune entrée pour le moment.
          </div>
        ) : (
          reversedEntries.map((e) => (
            <button
              key={e.date}
              type="button"
              className="entry-row"
              style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer' }}
              onClick={() => onEdit(e.date)}
            >
              <span className={`entry-dot ${e.net < 0 ? 'deficit' : 'surplus'}`} />
              <span className="entry-date">{formatFR(e.date)}</span>
              <span className={`entry-amount ${e.net < 0 ? 'deficit' : 'surplus'}`}>{kcalLabel(e.net)} kcal</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
