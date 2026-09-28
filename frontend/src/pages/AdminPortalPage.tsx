import React, { useState, useEffect } from 'react';
import {
  Server,
  Database,
  Cpu,
  Activity,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Layers,
  ShieldCheck,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { MLModelVersion, SystemAuditLog } from '../types/index.ts';
import { api } from '../services/api.ts';

export const AdminPortalPage: React.FC = () => {
  const [models, setModels] = useState<MLModelVersion[]>([]);
  const [logs, setLogs] = useState<SystemAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetMessage, setResetMessage] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [modelsData, logsData] = await Promise.all([
        api.getAdminModels(),
        api.getAdminAuditLogs(),
      ]);
      setModels(modelsData);
      setLogs(logsData);
    } catch (err) {
      console.error('Failed to load admin telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetDemo = async () => {
    if (!window.confirm('Reset all demonstration records, detections, and alerts back to default SIH seed state?')) {
      return;
    }
    setIsResetting(true);
    try {
      const res = await api.resetDemoData();
      setResetMessage(res.message || 'System state reset to benchmark demonstration baseline.');
      await loadAdminData();
      setTimeout(() => setResetMessage(''), 4000);
    } catch (err) {
      console.error('Reset failed:', err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 uppercase tracking-wide">
              System Operations
            </span>
            <span className="text-xs text-stone-500 font-mono">v2.4.0-sih-rc3</span>
          </div>
          <h1 className="text-2xl font-black text-stone-900 mt-1 tracking-tight">
            Central ML & Model Registry Console
          </h1>
          <p className="text-sm text-stone-600 mt-0.5">
            Monitor deployed AI inference pipelines, ICAR benchmark thresholds, and platform audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadAdminData}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>

          <button
            onClick={handleResetDemo}
            disabled={isResetting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Resetting...' : 'Reset SIH Seed Data'}</span>
          </button>
        </div>
      </div>

      {resetMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{resetMessage}</span>
        </div>
      )}

      {/* Model Registry Cards */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-600" />
            <h2 className="text-base font-bold text-stone-900">Deployed Machine Learning Models</h2>
          </div>
          <span className="text-xs font-bold text-stone-500">{models.length} Active Pipelines</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {models.map(m => (
            <div
              key={m.id}
              className="p-4 rounded-xl bg-stone-50 border border-stone-200 hover:border-purple-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-200 text-stone-700 font-bold">
                    {m.version}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      m.status === 'DEPLOYED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {m.status}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-stone-900 line-clamp-1">{m.name}</h3>
                <p className="text-xs text-stone-500 font-mono mt-0.5">{m.modelType}</p>

                <div className="mt-3 pt-3 border-t border-stone-200/80 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Accuracy:</span>
                    <span className="font-bold text-emerald-700">{(m.accuracy * 100).toFixed(1)}%</span>
                  </div>
                  {m.f1Score && (
                    <div className="flex justify-between">
                      <span className="text-stone-500">F1 Score:</span>
                      <span className="font-bold text-stone-800">{m.f1Score.toFixed(3)}</span>
                    </div>
                  )}
                  {m.latencyMs && (
                    <div className="flex justify-between">
                      <span className="text-stone-500">Inference Latency:</span>
                      <span className="font-bold text-purple-700 font-mono">{m.latencyMs} ms</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-stone-200 text-[10px] text-stone-400 flex items-center justify-between">
                <span>Trained: {new Date(m.trainedDate).toLocaleDateString()}</span>
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-stone-900">System Activity & Audit Logs</h2>
          </div>
          <span className="text-xs text-stone-500">Real-time Immutable Ledger</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Operator</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Target</th>
                <th className="py-2.5 px-3">Execution Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {logs.slice(0, 10).map(log => (
                <tr key={log.id} className="hover:bg-stone-50/60">
                  <td className="py-2 px-3 font-mono text-stone-500 text-[11px] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-2 px-3 text-stone-800 whitespace-nowrap">{log.userEmail}</td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-mono text-[10px] font-bold">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-stone-600">{log.entity}</td>
                  <td className="py-2 px-3 text-stone-700 max-w-md truncate">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
