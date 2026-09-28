import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  CalendarClock,
  CloudRain,
  Droplet,
  Gauge,
  Leaf,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Sprout,
  TrendingUp,
  Waves,
} from 'lucide-react';

interface IrrigationPlan {
  id: string;
  zone: string;
  crop: string;
  method: 'Drip' | 'Sprinkler' | 'Raingun' | 'Flood';
  source: 'Borewell' | 'Canal' | 'Pond' | 'Rainwater';
  areaAcres: number;
  soilMoisture: number;
  targetMoisture: number;
  flowRateLpm: number;
  schedule: string;
  status: 'Running' | 'Scheduled' | 'Paused';
}

const defaultPlans: IrrigationPlan[] = [
  {
    id: 'p-1',
    zone: 'North Field',
    crop: 'Tomato',
    method: 'Drip',
    source: 'Borewell',
    areaAcres: 4.8,
    soilMoisture: 28,
    targetMoisture: 40,
    flowRateLpm: 56,
    schedule: 'Every 3 days',
    status: 'Running',
  },
  {
    id: 'p-2',
    zone: 'South Orchard',
    crop: 'Grapes',
    method: 'Drip',
    source: 'Rainwater',
    areaAcres: 3.4,
    soilMoisture: 35,
    targetMoisture: 42,
    flowRateLpm: 38,
    schedule: 'Twice weekly',
    status: 'Scheduled',
  },
  {
    id: 'p-3',
    zone: 'West Plot',
    crop: 'Wheat',
    method: 'Sprinkler',
    source: 'Canal',
    areaAcres: 7.2,
    soilMoisture: 22,
    targetMoisture: 32,
    flowRateLpm: 82,
    schedule: 'Night irrigation',
    status: 'Paused',
  },
];

const emptyForm = {
  zone: 'New Block',
  crop: 'Maize',
  method: 'Drip' as IrrigationPlan['method'],
  source: 'Borewell' as IrrigationPlan['source'],
  areaAcres: 3,
  soilMoisture: 30,
  targetMoisture: 40,
  flowRateLpm: 50,
  schedule: 'Every 2 days',
  status: 'Scheduled' as IrrigationPlan['status'],
};

export const SmartIrrigationPlanner: React.FC = () => {
  const [plans, setPlans] = useState<IrrigationPlan[]>(defaultPlans);
  const [form, setForm] = useState(emptyForm);

  const stats = useMemo(() => {
    const active = plans.filter((plan) => plan.status === 'Running').length;
    const avgMoisture = plans.reduce((sum, plan) => sum + plan.soilMoisture, 0) / plans.length;
    const totalArea = plans.reduce((sum, plan) => sum + plan.areaAcres, 0);
    const waterSavings = plans.filter((plan) => plan.method === 'Drip').reduce((sum, plan) => sum + plan.areaAcres * 4.2, 0);
    return { active, avgMoisture, totalArea, waterSavings };
  }, [plans]);

  const recommendations = useMemo(() => {
    return plans.map((plan) => {
      const delta = plan.targetMoisture - plan.soilMoisture;
      const status = delta > 12 ? 'Water urgently' : delta > 5 ? 'Monitor' : 'Healthy';
      return {
        zone: plan.zone,
        crop: plan.crop,
        delta,
        status,
      };
    });
  }, [plans]);

  const handleInput = (field: keyof typeof emptyForm, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault();
    const nextPlan: IrrigationPlan = {
      id: `p-${Date.now()}`,
      zone: form.zone,
      crop: form.crop,
      method: form.method,
      source: form.source,
      areaAcres: Number(form.areaAcres),
      soilMoisture: Number(form.soilMoisture),
      targetMoisture: Number(form.targetMoisture),
      flowRateLpm: Number(form.flowRateLpm),
      schedule: form.schedule,
      status: form.status,
    };

    setPlans((prev) => [nextPlan, ...prev]);
    setForm(emptyForm);
  };

  const toggleStatus = (id: string) => {
    setPlans((prev) =>
      prev.map((plan) => {
        if (plan.id !== id) return plan;
        const nextStatus = plan.status === 'Running' ? 'Paused' : 'Running';
        return { ...plan, status: nextStatus };
      }),
    );
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 p-6 text-white shadow-lg shadow-emerald-900/10">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-50/90">
          <Droplet className="h-4 w-4" />
          Smart irrigation operations
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Water-smart field planning</h1>
            <p className="mt-2 max-w-2xl text-sm text-emerald-50/90">
              Align irrigation scheduling with soil moisture, crop stage, water source, and field-level efficiency to reduce wastage and improve yield stability.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl bg-white/12 px-4 py-2 text-sm font-semibold backdrop-blur-sm transition hover:bg-white/18">
            <RefreshCw className="h-4 w-4" />
            Refresh plan
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Active zones', value: `${stats.active}`, icon: Play, tone: 'emerald' },
          { label: 'Total field area', value: `${stats.totalArea.toFixed(1)} ac`, icon: Gauge, tone: 'sky' },
          { label: 'Avg moisture', value: `${stats.avgMoisture.toFixed(0)}%`, icon: Leaf, tone: 'amber' },
          { label: 'Likely savings', value: `${stats.waterSavings.toFixed(0)} KL`, icon: TrendingUp, tone: 'violet' },
        ].map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">{label}</span>
              <div className={`rounded-xl p-2 ${tone === 'emerald' ? 'bg-emerald-50 text-emerald-700' : tone === 'sky' ? 'bg-sky-50 text-sky-700' : tone === 'amber' ? 'bg-amber-50 text-amber-700' : 'bg-violet-50 text-violet-700'}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4 text-3xl font-black text-stone-900">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Field automation</p>
                <h2 className="mt-1 text-xl font-bold text-stone-900">Irrigation schedule overview</h2>
              </div>
              <button className="inline-flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 text-sm font-medium text-stone-700 hover:border-emerald-300 hover:text-emerald-700">
                <Plus className="h-4 w-4" /> Add field
              </button>
            </div>

            <div className="space-y-3">
              {plans.map((plan) => (
                <div key={plan.id} className="rounded-2xl border border-stone-200 bg-stone-50/80 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-stone-900">{plan.zone}</h3>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${plan.status === 'Running' ? 'bg-emerald-100 text-emerald-700' : plan.status === 'Paused' ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'}`}>
                          {plan.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-stone-600">{plan.crop} • {plan.method} • {plan.source}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleStatus(plan.id)}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        {plan.status === 'Running' ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                        {plan.status === 'Running' ? 'Pause' : 'Run'}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-4">
                    <div className="rounded-xl bg-white p-3">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-stone-500">Soil</p>
                      <p className="mt-2 text-lg font-black text-stone-900">{plan.soilMoisture}%</p>
                    </div>
                    <div className="rounded-xl bg-white p-3">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-stone-500">Target</p>
                      <p className="mt-2 text-lg font-black text-stone-900">{plan.targetMoisture}%</p>
                    </div>
                    <div className="rounded-xl bg-white p-3">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-stone-500">Flow rate</p>
                      <p className="mt-2 text-lg font-black text-stone-900">{plan.flowRateLpm} LPM</p>
                    </div>
                    <div className="rounded-xl bg-white p-3">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-stone-500">Schedule</p>
                      <p className="mt-2 text-sm font-semibold text-stone-900">{plan.schedule}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <form onSubmit={handleAddPlan} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Planner</p>
                <h2 className="mt-1 text-xl font-bold text-stone-900">Add a field plan</h2>
              </div>
              <Sprout className="h-5 w-5 text-emerald-600" />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-sm text-stone-700">
                Zone
                <input value={form.zone} onChange={(e) => handleInput('zone', e.target.value)} className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 outline-none focus:border-emerald-400" />
              </label>
              <label className="text-sm text-stone-700">
                Crop
                <input value={form.crop} onChange={(e) => handleInput('crop', e.target.value)} className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 outline-none focus:border-emerald-400" />
              </label>
              <label className="text-sm text-stone-700">
                Method
                <select value={form.method} onChange={(e) => handleInput('method', e.target.value)} className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 outline-none focus:border-emerald-400">
                  <option>Drip</option>
                  <option>Sprinkler</option>
                  <option>Raingun</option>
                  <option>Flood</option>
                </select>
              </label>
              <label className="text-sm text-stone-700">
                Water source
                <select value={form.source} onChange={(e) => handleInput('source', e.target.value)} className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 outline-none focus:border-emerald-400">
                  <option>Borewell</option>
                  <option>Canal</option>
                  <option>Pond</option>
                  <option>Rainwater</option>
                </select>
              </label>
              <label className="text-sm text-stone-700">
                Area (ac)
                <input type="number" value={form.areaAcres} onChange={(e) => handleInput('areaAcres', Number(e.target.value))} className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 outline-none focus:border-emerald-400" />
              </label>
              <label className="text-sm text-stone-700">
                Status
                <select value={form.status} onChange={(e) => handleInput('status', e.target.value)} className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 outline-none focus:border-emerald-400">
                  <option>Scheduled</option>
                  <option>Running</option>
                  <option>Paused</option>
                </select>
              </label>
              <label className="text-sm text-stone-700">
                Soil moisture (%)
                <input type="number" value={form.soilMoisture} onChange={(e) => handleInput('soilMoisture', Number(e.target.value))} className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 outline-none focus:border-emerald-400" />
              </label>
              <label className="text-sm text-stone-700">
                Target moisture (%)
                <input type="number" value={form.targetMoisture} onChange={(e) => handleInput('targetMoisture', Number(e.target.value))} className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 outline-none focus:border-emerald-400" />
              </label>
              <label className="text-sm text-stone-700">
                Flow rate (LPM)
                <input type="number" value={form.flowRateLpm} onChange={(e) => handleInput('flowRateLpm', Number(e.target.value))} className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 outline-none focus:border-emerald-400" />
              </label>
              <label className="text-sm text-stone-700 md:col-span-2">
                Irrigation schedule
                <input value={form.schedule} onChange={(e) => handleInput('schedule', e.target.value)} className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 outline-none focus:border-emerald-400" />
              </label>
            </div>

            <button type="submit" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700">
              <Plus className="h-4 w-4" /> Save irrigation plan
            </button>
          </form>

          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <CloudRain className="h-5 w-5 text-sky-600" />
              <h3 className="text-lg font-bold text-stone-900">Field advisories</h3>
            </div>
            <div className="space-y-3">
              {recommendations.map((item) => (
                <div key={item.zone} className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-stone-900">{item.zone}</p>
                      <p className="text-xs text-stone-600">{item.crop}</p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${item.status === 'Water urgently' ? 'bg-rose-100 text-rose-700' : item.status === 'Monitor' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-stone-600">Moisture gap: {item.delta > 0 ? '+' : ''}{item.delta}% relative to target.</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
