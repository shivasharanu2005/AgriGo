import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Droplet,
  IndianRupee,
  Leaf,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
  Waves,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { agricultureApi } from '../../services/agricultureApi';

interface IrrigationMethod {
  id: string;
  name: 'Drip' | 'Sprinkler' | 'Flood' | 'Rain Gun';
  efficiency: number;
  currentArea: number;
  costPerHour: number;
  status: 'Active' | 'Idle' | 'Maintenance';
}

interface WaterSession {
  id: string;
  date: string;
  field: string;
  litres: number;
  source: string;
  method: string;
  cost: number;
}

const defaultMethods: IrrigationMethod[] = [
  { id: 'm-1', name: 'Drip', efficiency: 92, currentArea: 8.4, costPerHour: 420, status: 'Active' },
  { id: 'm-2', name: 'Sprinkler', efficiency: 76, currentArea: 12.1, costPerHour: 510, status: 'Active' },
  { id: 'm-3', name: 'Flood', efficiency: 48, currentArea: 5.8, costPerHour: 320, status: 'Maintenance' },
];

const initialSessions: WaterSession[] = [
  { id: 's-1', date: '2026-09-02', field: 'North field', litres: 4200, source: 'Borewell', method: 'Drip', cost: 680 },
  { id: 's-2', date: '2026-09-04', field: 'South orchard', litres: 5100, source: 'Canal', method: 'Sprinkler', cost: 760 },
  { id: 's-3', date: '2026-09-06', field: 'West plot', litres: 3600, source: 'Farm pond', method: 'Drip', cost: 520 },
];

const defaultForm = {
  field: 'North field',
  litres: 3000,
  source: 'Borewell',
  method: 'Drip',
  cost: 420,
};

export default function WaterUsageTracker() {
  const [methods, setMethods] = useState<IrrigationMethod[]>(defaultMethods);
  const [sessions, setSessions] = useState<WaterSession[]>(initialSessions);
  const [form, setForm] = useState(defaultForm);
  const [search, setSearch] = useState('');

  useEffect(() => {
    agricultureApi.getWaterLogs().then((logs) => {
      if (logs?.length) {
        setSessions(
          logs.map((log, index) => ({
            id: String(log.id ?? `session-${index}`),
            date: log.date,
            field: log.fieldName || log.field || 'Farm field',
            litres: Number(log.litres ?? 0),
            source: log.source,
            method: 'Drip',
            cost: Number((log.litres / 1000) * (log.costPerKilolitre ?? 0)),
          })),
        );
      }
    }).catch(() => undefined);
  }, []);

  const filteredSessions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return sessions.filter((session) =>
      !query || session.field.toLowerCase().includes(query) || session.source.toLowerCase().includes(query) || session.method.toLowerCase().includes(query),
    );
  }, [sessions, search]);

  const summary = useMemo(() => {
    const totalLitres = filteredSessions.reduce((sum, session) => sum + session.litres, 0);
    const totalCost = filteredSessions.reduce((sum, session) => sum + session.cost, 0);
    const avgEfficiency = methods.reduce((sum, method) => sum + method.efficiency, 0) / methods.length;
    const highestUse = filteredSessions.reduce((max, session) => (session.litres > max.litres ? session : max), filteredSessions[0] ?? { litres: 0, field: 'N/A' });
    return { totalLitres, totalCost, avgEfficiency, highestUse };
  }, [filteredSessions, methods]);

  const chartData = useMemo(
    () =>
      filteredSessions.map((session) => ({
        name: session.field.split(' ')[0],
        litres: Math.round(session.litres / 1000),
        cost: Math.round(session.cost / 100),
      })),
    [filteredSessions],
  );

  const handleFormChange = (field: keyof typeof defaultForm, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    const newSession: WaterSession = {
      id: `s-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      field: form.field,
      litres: Number(form.litres),
      source: form.source,
      method: form.method,
      cost: Number(form.cost),
    };
    setSessions((prev) => [newSession, ...prev]);
    setForm(defaultForm);
  };

  const addMethod = (name: IrrigationMethod['name']) => {
    const next: IrrigationMethod = {
      id: `m-${Date.now()}`,
      name,
      efficiency: name === 'Drip' ? 92 : name === 'Sprinkler' ? 76 : name === 'Rain Gun' ? 66 : 48,
      currentArea: 4 + Math.random() * 6,
      costPerHour: name === 'Drip' ? 420 : name === 'Sprinkler' ? 500 : name === 'Rain Gun' ? 610 : 300,
      status: 'Active',
    };
    setMethods((prev) => [...prev, next]);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="rounded-3xl border border-cyan-200 bg-gradient-to-r from-cyan-600 via-sky-600 to-emerald-600 p-6 text-white shadow-lg shadow-cyan-900/10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-50/90">
              <Waves className="h-4 w-4" /> Irrigation analytics
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-tight">Water usage tracker</h1>
            <p className="mt-2 max-w-2xl text-sm text-cyan-50/90">
              Track daily irrigation events, compare efficiency by method, and identify where the farm can save water and energy without hurting crop health.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl bg-white/12 px-4 py-2 text-sm font-semibold backdrop-blur-sm hover:bg-white/18">
            <BarChart3 className="h-4 w-4" />
            Generate report
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Water used', value: `${(summary.totalLitres / 1000).toFixed(1)} KL`, icon: Droplet },
          { label: 'Irrigation cost', value: `₹${summary.totalCost.toLocaleString('en-IN')}`, icon: IndianRupee },
          { label: 'Efficiency', value: `${summary.avgEfficiency.toFixed(0)}%`, icon: Activity },
          { label: 'Peak field', value: summary.highestUse.field || 'N/A', icon: Leaf },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">{label}</span>
              <div className="rounded-xl bg-cyan-50 p-2 text-cyan-700"><Icon className="h-4 w-4" /></div>
            </div>
            <div className="mt-4 text-2xl font-black text-stone-900">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Performance</p>
                <h2 className="mt-1 text-xl font-bold text-stone-900">Water consumption trend</h2>
              </div>
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <Search className="h-4 w-4" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search field or method" className="rounded-lg border border-stone-200 bg-stone-50 px-2 py-1.5 text-sm outline-none focus:border-cyan-400" />
              </div>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis dataKey="name" stroke="#78716c" />
                  <YAxis stroke="#78716c" />
                  <Tooltip />
                  <Bar dataKey="litres" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Sessions</p>
                <h2 className="mt-1 text-xl font-bold text-stone-900">Recent irrigation logs</h2>
              </div>
            </div>

            <div className="space-y-3">
              {filteredSessions.map((session) => (
                <div key={session.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-bold text-stone-900">{session.field}</p>
                      <p className="text-xs text-stone-600">{session.date} • {session.method} • {session.source}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-black text-stone-900">{session.litres.toLocaleString('en-IN')} L</p>
                      <p className="text-xs text-emerald-700">₹{session.cost.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <form onSubmit={handleAddSession} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Log</p>
                <h2 className="mt-1 text-xl font-bold text-stone-900">Add irrigation event</h2>
              </div>
              <Plus className="h-5 w-5 text-cyan-600" />
            </div>

            <div className="space-y-3">
              <label className="block text-sm text-stone-700">
                Field
                <input value={form.field} onChange={(e) => handleFormChange('field', e.target.value)} className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 outline-none focus:border-cyan-400" />
              </label>
              <label className="block text-sm text-stone-700">
                Water volume (L)
                <input type="number" value={form.litres} onChange={(e) => handleFormChange('litres', Number(e.target.value))} className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 outline-none focus:border-cyan-400" />
              </label>
              <label className="block text-sm text-stone-700">
                Source
                <select value={form.source} onChange={(e) => handleFormChange('source', e.target.value)} className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 outline-none focus:border-cyan-400">
                  <option>Borewell</option>
                  <option>Canal</option>
                  <option>Farm pond</option>
                  <option>Rainwater</option>
                </select>
              </label>
              <label className="block text-sm text-stone-700">
                Method
                <select value={form.method} onChange={(e) => handleFormChange('method', e.target.value)} className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 outline-none focus:border-cyan-400">
                  <option>Drip</option>
                  <option>Sprinkler</option>
                  <option>Flood</option>
                  <option>Rain Gun</option>
                </select>
              </label>
              <label className="block text-sm text-stone-700">
                Cost (₹)
                <input type="number" value={form.cost} onChange={(e) => handleFormChange('cost', Number(e.target.value))} className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 outline-none focus:border-cyan-400" />
              </label>
            </div>

            <button type="submit" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700">
              <Plus className="h-4 w-4" /> Save irrigation event
            </button>
          </form>

          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <h3 className="text-lg font-bold text-stone-900">Method efficiency</h3>
            </div>
            <div className="space-y-3">
              {methods.map((method) => (
                <div key={method.id} className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-stone-900">{method.name}</p>
                      <p className="text-xs text-stone-600">{method.currentArea.toFixed(1)} ac in service</p>
                    </div>
                    <span className="text-sm font-black text-emerald-700">{method.efficiency}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-stone-200">
                    <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${method.efficiency}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {['Drip', 'Sprinkler', 'Flood', 'Rain Gun'].map((type) => (
                <button key={type} onClick={() => addMethod(type as IrrigationMethod['name'])} className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:border-cyan-300 hover:text-cyan-700">
                  + {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
