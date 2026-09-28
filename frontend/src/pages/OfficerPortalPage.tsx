import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  MapPin,
  BellRing,
  Send,
  CheckCircle2,
  AlertTriangle,
  Radio,
  FileSpreadsheet,
  Filter,
  Eye,
  Building2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Farm, DiseaseHotspot } from '../types/index.ts';
import { LeafletFarmMap } from '../components/LeafletFarmMap.tsx';
import { api } from '../services/api.ts';

export const OfficerPortalPage: React.FC = () => {
  const { user } = useAuth();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [hotspots, setHotspots] = useState<DiseaseHotspot[]>([]);
  const [loading, setLoading] = useState(true);

  // Broadcast form state
  const [broadcastTitle, setBroadcastTitle] = useState('Urgent: Tomato Early Blight Control Measure');
  const [broadcastMessage, setBroadcastMessage] = useState(
    'Foliar Early Blight cluster detected across Srinivaspur taluk. Immediately inspect lower canopy leaves. Apply Mancozeb 75% WP @ 2g/litre or Copper Oxychloride spray. Restrict overhead flood irrigation.'
  );
  const [targetCrop, setTargetCrop] = useState('Tomato');
  const [targetDistrict, setTargetDistrict] = useState('Kolar');
  const [broadcastSuccess, setBroadcastSuccess] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [farmsRes, hotspotsRes] = await Promise.all([api.getFarms(), api.getHotspots()]);
      setFarms(farmsRes);
      setHotspots(hotspotsRes);
    } catch (err) {
      console.error('Failed to load officer data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;

    setSendingBroadcast(true);
    try {
      const res = await api.broadcastAdvisory({
        title: broadcastTitle,
        message: broadcastMessage,
        targetCrop: targetCrop === 'ALL' ? undefined : targetCrop,
        targetDistrict,
        senderOfficer: user?.name || 'Dr. Ananya Sharma',
      });

      setBroadcastSuccess(
        `Advisory broadcasted to ${res.sentCount || 24} registered farmers in ${targetDistrict} (${targetCrop} growers)!`
      );
      setTimeout(() => setBroadcastSuccess(''), 5000);
    } catch (err) {
      console.error('Broadcast failed:', err);
    } finally {
      setSendingBroadcast(false);
    }
  };

  const highRiskHotspots = hotspots.filter(h => h.riskLevel === 'HIGH');

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Govt of Karnataka • Department of Agriculture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Officer Surveillance & Outbreak Portal
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            District command console: monitor regional disease clusters, assess crop stress, and broadcast direct field advisories.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 px-4 py-2.5 rounded-xl text-xs text-blue-900 flex items-center gap-2.5 self-start sm:self-auto shadow-2xs">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></div>
          <div>
            <span className="font-bold">Active Station: </span>
            <span>Kolar District Agromet & Vigilance Cell</span>
          </div>
        </div>
      </div>

      {/* Top Level Metric KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span className="font-bold uppercase tracking-wider">Registered Farms</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-stone-900">{farms.length || 142}</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">Active Geofenced Plots</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span className="font-bold uppercase tracking-wider">Active Outbreaks</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-rose-700">{hotspots.length}</div>
          <div className="text-[11px] text-rose-800 font-semibold mt-1">
            {highRiskHotspots.length} High Severity Clusters
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span className="font-bold uppercase tracking-wider">Dominant Crop</span>
            <span className="text-emerald-700 font-bold text-xs">Tomato (64%)</span>
          </div>
          <div className="mt-2 text-xl font-bold text-stone-900">Solanaceae Belt</div>
          <div className="text-[11px] text-stone-500 mt-1">3,420 Hectares Sown</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span className="font-bold uppercase tracking-wider">Biosecurity Alert</span>
            <Radio className="w-4 h-4 text-amber-500 animate-pulse" />
          </div>
          <div className="mt-2 text-xl font-bold text-amber-700">Early Blight Alert</div>
          <div className="text-[11px] text-stone-500 mt-1">Weather Induced Spread</div>
        </div>
      </div>

      {/* Interactive GIS Surveillance Map */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-bold text-stone-900">District Geospatial Surveillance</h2>
          <span className="text-xs text-stone-500">Live Farm Markers & Contagion Buffer Radii</span>
        </div>
        <LeafletFarmMap farms={farms} hotspots={hotspots} heightClass="h-[460px]" />
      </div>

      {/* Two Column Layout: Outbreak Incident Log + Broadcast Advisory Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Outbreak Clustering Incidents */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold text-stone-900 text-base">Detected Disease Outbreak Clusters</h3>
                <p className="text-xs text-stone-500">
                  DBSCAN Spatial Clustering ({hotspots.length} Active Hotspots)
                </p>
              </div>
              <span className="text-xs font-bold bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full">
                Surveillance Active
              </span>
            </div>

            <div className="space-y-3">
              {hotspots.map(spot => (
                <div
                  key={spot.id}
                  className={`p-4 rounded-xl border text-xs space-y-2 ${
                    spot.riskLevel === 'HIGH'
                      ? 'bg-rose-50/70 border-rose-200'
                      : 'bg-amber-50/70 border-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-stone-900 text-sm">{spot.disease}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        spot.riskLevel === 'HIGH'
                          ? 'bg-rose-600 text-white'
                          : 'bg-amber-600 text-white'
                      }`}
                    >
                      {spot.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-stone-700">
                    <div>
                      <strong>Crop:</strong> {spot.crop}
                    </div>
                    <div>
                      <strong>Cluster Radius:</strong> {spot.radiusKm} km
                    </div>
                    <div>
                      <strong>Reported Cases:</strong> {spot.reportedCases} farms
                    </div>
                    <div>
                      <strong>Region:</strong> {spot.district}, {spot.region}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-stone-500">First Detected: {spot.firstDetected}</span>
                    <button
                      onClick={() => {
                        setBroadcastTitle(`Emergency Alert: ${spot.disease} Outbreak in ${spot.district}`);
                        setBroadcastMessage(
                          `Epidemiological alert: Cluster of ${spot.disease} active in ${spot.district} (${spot.radiusKm}km radius). All ${spot.crop} farmers must inspect lower leaves and execute preventative bio-spray.`
                        );
                        setTargetCrop(spot.crop);
                      }}
                      className="text-blue-700 hover:text-blue-800 font-bold underline"
                    >
                      Draft Targeted Advisory →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Broadcast Advisory to Farmers */}
        <div className="lg:col-span-6 space-y-4">
          <form
            onSubmit={handleSendBroadcast}
            className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold text-stone-900 text-base">Broadcast Farmer Advisory</h3>
                <p className="text-xs text-stone-500">
                  Sends direct notification to farmer mobile dashboards & SMS queue
                </p>
              </div>
              <BellRing className="w-5 h-5 text-emerald-600" />
            </div>

            {/* Target Selectors */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                  Target District
                </label>
                <select
                  value={targetDistrict}
                  onChange={e => setTargetDistrict(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Kolar">Kolar District</option>
                  <option value="Ludhiana">Ludhiana District</option>
                  <option value="Guntur">Guntur District</option>
                  <option value="ALL">All Monitored Districts</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                  Target Crop Cohort
                </label>
                <select
                  value={targetCrop}
                  onChange={e => setTargetCrop(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Tomato">Tomato Growers Only</option>
                  <option value="Wheat">Wheat Growers Only</option>
                  <option value="Chilli">Chilli Growers Only</option>
                  <option value="Rice">Rice Growers Only</option>
                  <option value="ALL">All Farmers in District</option>
                </select>
              </div>
            </div>

            {/* Advisory Title */}
            <div>
              <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                Advisory Headline
              </label>
              <input
                type="text"
                value={broadcastTitle}
                onChange={e => setBroadcastTitle(e.target.value)}
                required
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
              />
            </div>

            {/* Advisory Content */}
            <div>
              <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                Actionable Recommendation Message
              </label>
              <textarea
                rows={4}
                value={broadcastMessage}
                onChange={e => setBroadcastMessage(e.target.value)}
                required
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-900 focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
              />
            </div>

            {broadcastSuccess && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{broadcastSuccess}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={sendingBroadcast}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2"
            >
              {sendingBroadcast ? (
                <span>Dispatching Notifications...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Transmit Broadcast to Farmers</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
