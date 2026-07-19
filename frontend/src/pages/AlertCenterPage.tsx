import React, { useEffect, useState } from 'react';
import { AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';
import { apiFetch } from '../shared/api/apiFetch';
import { useAuthStore } from '../auth/useAuthStore';

interface AnomalyAlert {
  districtName: string;
  crimeSubHeadName: string;
  weekStart: string;
  count: number;
  meanTrailing: number;
  stdDevTrailing: number;
  zScore: number;
  reason: string;
}

interface AuditLogRow {
  AuditID: number;
  Timestamp: string;
  Username: string;
  Role: string;
  Method: string;
  Path: string;
  StatusCode: number;
  Outcome: string;
  DurationMs: number;
}

export const AlertCenterPage: React.FC = () => {
  const { user } = useAuthStore();
  const canSeeAudit = user?.role === 'SCRB' || user?.role === 'SP';
  const [tab, setTab] = useState<'anomalies' | 'audit'>('anomalies');

  const [anomalies, setAnomalies] = useState<AnomalyAlert[] | null>(null);
  const [anomaliesError, setAnomaliesError] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogRow[] | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch('/api/analytics/anomalies')
      .then(async (res) => {
        if (!res.ok) { setAnomaliesError((await res.json()).error || 'Failed to load anomalies'); return; }
        setAnomalies(await res.json());
      })
      .catch(() => setAnomaliesError('Failed to reach backend'));
  }, []);

  useEffect(() => {
    if (tab !== 'audit' || !canSeeAudit) return;
    apiFetch('/api/audit/logs?limit=100')
      .then(async (res) => {
        if (!res.ok) { setAuditError((await res.json()).error || 'Failed to load audit log'); return; }
        setAuditLogs(await res.json());
      })
      .catch(() => setAuditError('Failed to reach backend'));
  }, [tab, canSeeAudit]);

  return (
    <div className="flex flex-col h-full w-full bg-tactical-950 text-tactical-100 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-tactical-900 border-b border-tactical-700 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded bg-accent-red/10 border border-accent-red/30 text-accent-red">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h1 className="font-mono text-sm font-bold tracking-wider text-white">ALERT CENTER</h1>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setTab('anomalies')} className={`px-3 py-1 rounded text-xs font-mono ${tab === 'anomalies' ? 'bg-accent-cyan/20 text-accent-cyan' : 'text-tactical-400'}`}>Anomalies</button>
          {canSeeAudit && (
            <button onClick={() => setTab('audit')} className={`px-3 py-1 rounded text-xs font-mono ${tab === 'audit' ? 'bg-accent-cyan/20 text-accent-cyan' : 'text-tactical-400'}`}>Audit Log</button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'anomalies' && (
          <>
            <p className="text-xxs font-mono text-tactical-500 mb-3">
              Weekly case counts per district + crime sub-head, flagged when the latest week is more than 2 standard deviations above the trailing 8-week average. Method and threshold are fixed and disclosed — no black-box prediction.
            </p>
            {anomaliesError && <div className="text-accent-red font-mono text-xs">{anomaliesError}</div>}
            {!anomalies && !anomaliesError && <Loader2 className="w-5 h-5 animate-spin text-accent-cyan" />}
            {anomalies && anomalies.length === 0 && (
              <div className="text-tactical-400 font-mono text-sm">No anomalies detected in the current data.</div>
            )}
            <div className="flex flex-col gap-2">
              {anomalies?.map((a, idx) => (
                <div key={idx} className="p-3 rounded bg-tactical-900 border border-accent-red/30 flex items-center justify-between">
                  <div>
                    <div className="font-mono text-sm text-white font-bold">{a.crimeSubHeadName} — {a.districtName}</div>
                    <div className="font-mono text-xs text-tactical-400 mt-0.5">{a.reason}</div>
                  </div>
                  <span className="font-mono text-xs font-bold text-accent-red">z = {a.zScore}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'audit' && canSeeAudit && (
          <>
            <div className="flex items-center gap-2 mb-3 text-xxs font-mono text-tactical-500">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-cyan" />
              Append-only log of every request — successful, rejected, or errored.
            </div>
            {auditError && <div className="text-accent-red font-mono text-xs">{auditError}</div>}
            {!auditLogs && !auditError && <Loader2 className="w-5 h-5 animate-spin text-accent-cyan" />}
            {auditLogs && (
              <table className="w-full text-xxs font-mono">
                <thead>
                  <tr className="text-tactical-500 border-b border-tactical-800 text-left">
                    <th className="py-1 pr-2">Time</th>
                    <th className="py-1 pr-2">User</th>
                    <th className="py-1 pr-2">Role</th>
                    <th className="py-1 pr-2">Path</th>
                    <th className="py-1 pr-2">Status</th>
                    <th className="py-1 pr-2">Outcome</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((row) => (
                    <tr key={row.AuditID} className="border-b border-tactical-900 text-tactical-200">
                      <td className="py-1 pr-2">{row.Timestamp}</td>
                      <td className="py-1 pr-2">{row.Username || '—'}</td>
                      <td className="py-1 pr-2">{row.Role || '—'}</td>
                      <td className="py-1 pr-2">{row.Method} {row.Path}</td>
                      <td className="py-1 pr-2">{row.StatusCode}</td>
                      <td className={`py-1 pr-2 ${row.Outcome === 'SUCCESS' ? 'text-emerald-400' : row.Outcome === 'REJECTED' ? 'text-accent-amber' : 'text-accent-red'}`}>{row.Outcome}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );
};
