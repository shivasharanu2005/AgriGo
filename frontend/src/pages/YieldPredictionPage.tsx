import React, { useState } from 'react';
import {
  TrendingUp,
  Sliders,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Droplets,
  Award,
  AlertCircle,
  HelpCircle,
  BarChart3,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useLanguage } from '../i18n/LanguageContext.tsx';
import { YieldPredictionResult } from '../types/index.ts';
import { api } from '../services/api.ts';

const CROP_CATEGORIES = {
  cereals: [
    'Rice (Paddy)',
    'Wheat',
    'Maize (Corn)',
    'Sorghum (Jowar)',
    'Pearl Millet (Bajra)',
    'Finger Millet (Ragi)',
    'Foxtail Millet',
    'Little Millet',
    'Kodo Millet',
    'Barley',
  ],

  pulses: [
    'Chickpea (Chana)',
    'Pigeon Pea (Tur/Arhar)',
    'Green Gram (Moong)',
    'Black Gram (Urad)',
    'Lentil (Masoor)',
    'Field Pea',
    'Cowpea (Lobia)',
    'Horse Gram (Kulthi)',
  ],

  oilseeds: [
    'Groundnut',
    'Soybean',
    'Mustard',
    'Sunflower',
    'Sesame (Til)',
    'Castor',
    'Safflower',
    'Linseed',
    'Niger Seed',
  ],

  vegetables: [
    'Tomato',
    'Potato',
    'Onion',
    'Garlic',
    'Brinjal (Eggplant)',
    'Chilli',
    'Okra (Bhindi)',
    'Cabbage',
    'Cauliflower',
    'Carrot',
    'Radish',
    'Bottle Gourd',
    'Bitter Gourd',
    'Ridge Gourd',
    'Pumpkin',
    'Cucumber',
  ],

  spices: [
    'Chilli',
    'Turmeric',
    'Coriander',
    'Cumin',
    'Black Pepper',
    'Cardamom',
    'Ginger',
    'Garlic',
    'Fenugreek',
  ],

  fruits: [
    'Mango',
    'Banana',
    'Papaya',
    'Guava',
    'Pomegranate',
    'Grapes',
    'Orange',
    'Lemon',
    'Apple',
    'Pineapple',
    'Sapota (Chikoo)',
    'Coconut',
  ],

  commercial: [
    'Cotton',
    'Sugarcane',
    'Jute',
    'Tea',
    'Coffee',
    'Rubber',
    'Tobacco',
    'Coconut',
    'Arecanut',
    'Cashew',
  ],

  medicinal: [
    'Ashwagandha',
    'Aloe Vera',
    'Lemongrass',
    'Isabgol (Psyllium)',
    'Shatavari',
    'Safed Musli',
    'Brahmi',
    'Tulsi',
  ],
};

const CROP_OPTIONS = Array.from(new Set(Object.values(CROP_CATEGORIES).flat()));

export const YieldPredictionPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    crop: 'Tomato',
    farmAreaAcres: 4.5,
    soilType: 'Red & Yellow',
    nitrogen: 95,
    phosphorus: 55,
    potassium: 70,
    ph: 6.5,
    rainfallMm: 650,
    temperatureC: 28,
    humidityPercent: 72,
    fertilizerUsageKgPerAcre: 130,
    irrigationType: 'Drip',
    sowingDate: '2026-07-05',
    state: 'Karnataka',
  });

  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<YieldPredictionResult | null>(null);

  const handlePredict = async (data = formData) => {
    setLoading(true);
    try {
      const res = await api.predictYield({ ...data, userId: user?.id });
      setPrediction(res);
    } catch (err) {
      console.error('Yield prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <span>Crop Productivity Forecasting</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
          AI Harvest Yield Prediction
        </h1>
        <p className="text-sm text-stone-600 mt-1 max-w-3xl">
          Simulates expected crop harvest volume based on your farm acreage, irrigation technique, fertilizer dosage, and seasonal rainfall patterns, benchmarked against state and national averages.
        </p>
      </div>

      {/* Main Grid: Input Parameters & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Yield Inputs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <h3 className="font-bold text-stone-900 text-sm flex items-center justify-between border-b border-stone-100 pb-2">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>Farm Variables & Management</span>
              </span>
            </h3>

            {/* Crop & Farm Area */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                  Crop
                </label>
                <select
                  value={formData.crop}
                  onChange={e => setFormData({ ...formData, crop: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {CROP_OPTIONS.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                  Farm Area (Acres)
                </label>
                <input
                  type="number"
                  min="0.5"
                  max="100"
                  step="0.5"
                  value={formData.farmAreaAcres}
                  onChange={e => setFormData({ ...formData, farmAreaAcres: Number(e.target.value) })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Irrigation Type - High Impact Factor */}
            <div>
              <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                Irrigation System (Critical Driver)
              </label>
              <select
                value={formData.irrigationType}
                onChange={e => setFormData({ ...formData, irrigationType: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Drip">Micro-Irrigation (Drip) — +18% Yield Boost</option>
                <option value="Sprinkler">Sprinkler System — +10% Yield Boost</option>
                <option value="Canal / Flood">Canal / Surface Flood — Standard</option>
                <option value="Rainfed">Purely Rainfed (No irrigation)</option>
              </select>
            </div>

            {/* Soil Type & Fertilizer dosage */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                  Soil Type
                </label>
                <select
                  value={formData.soilType}
                  onChange={e => setFormData({ ...formData, soilType: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Red & Yellow">Red & Yellow</option>
                  <option value="Alluvial">Alluvial</option>
                  <option value="Black (Regur)">Black (Regur)</option>
                  <option value="Sandy Loam">Sandy Loam</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                  Fertilizer (kg/acre)
                </label>
                <input
                  type="number"
                  min="20"
                  max="300"
                  step="10"
                  value={formData.fertilizerUsageKgPerAcre}
                  onChange={e => setFormData({ ...formData, fertilizerUsageKgPerAcre: Number(e.target.value) })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Rainfall & Soil pH Sliders */}
            <div className="space-y-3 pt-2 border-t border-stone-100">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-stone-700">Seasonal Rainfall</span>
                <span className="text-blue-700 font-bold">{formData.rainfallMm} mm</span>
              </div>
              <input
                type="range"
                min="250"
                max="1800"
                step="50"
                value={formData.rainfallMm}
                onChange={e => setFormData({ ...formData, rainfallMm: Number(e.target.value) })}
                className="w-full accent-blue-600"
              />

              <div className="flex justify-between text-xs font-semibold">
                <span className="text-stone-700">Soil pH</span>
                <span className="text-stone-900 font-bold">{formData.ph}</span>
              </div>
              <input
                type="range"
                min="5.0"
                max="8.5"
                step="0.1"
                value={formData.ph}
                onChange={e => setFormData({ ...formData, ph: Number(e.target.value) })}
                className="w-full accent-stone-700"
              />
            </div>

            <button
              onClick={() => handlePredict(formData)}
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-xs flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Computing Yield Model...</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4" />
                  <span>{t('calculateYield', 'Compute Harvest Yield Estimate')}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Area: Prediction Output & Benchmarks */}
        <div className="lg:col-span-7 space-y-4">
          {prediction ? (
            <div className="space-y-4">
              {/* Primary Output Metric Card */}
              <div className="bg-linear-to-br from-blue-900 via-blue-800 to-stone-900 text-white p-6 rounded-2xl shadow-md relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider bg-white/20 rounded-md">
                      {prediction.crop} Harvest Prediction
                    </span>
                    <span className="text-xs text-blue-200 font-semibold bg-black/20 px-2.5 py-1 rounded-md">
                      Confidence: {Math.round(prediction.confidenceScore * 100)}%
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-blue-200 uppercase tracking-wider font-semibold">
                        Estimated Yield (Tonnes / Ha)
                      </div>
                      <div className="text-3xl sm:text-4xl font-extrabold mt-1 tracking-tight">
                        {prediction.estimatedYieldTonnesPerHectare} <span className="text-lg font-normal text-blue-200">t/ha</span>
                      </div>
                      <div className="text-xs text-blue-200/90 mt-1">
                        Expected Range: {prediction.yieldRangeMin} – {prediction.yieldRangeMax} t/ha
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-blue-200 uppercase tracking-wider font-semibold">
                        Total Farm Output ({formData.farmAreaAcres} Acres)
                      </div>
                      <div className="text-3xl sm:text-4xl font-extrabold mt-1 tracking-tight text-emerald-400">
                        {prediction.estimatedTotalYieldTonnes} <span className="text-lg font-normal text-emerald-200">tonnes</span>
                      </div>
                      <div className="text-xs text-blue-200/90 mt-1">
                        Net Marketable Produce
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* State & National Benchmark Comparison Bars */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <h3 className="font-bold text-stone-900 text-sm mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>Agronomic Yield Benchmarks Comparison</span>
                  </span>
                  <span className="text-xs text-stone-500 font-normal">ICAR / State Directorate</span>
                </h3>

                <div className="space-y-3.5 text-xs">
                  {/* Your Farm */}
                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span className="text-blue-700">Your Estimated Farm Yield</span>
                      <span className="text-blue-700">{prediction.estimatedYieldTonnesPerHectare} t/ha</span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            (prediction.estimatedYieldTonnesPerHectare /
                              prediction.benchmarks.potentialMaximumTonnesPerHa) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* State Average */}
                  <div>
                    <div className="flex justify-between text-stone-700 font-medium mb-1">
                      <span>State Average ({formData.state})</span>
                      <span>{prediction.benchmarks.stateAverageTonnesPerHa} t/ha</span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-2.5">
                      <div
                        className="bg-stone-400 h-2.5 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            (prediction.benchmarks.stateAverageTonnesPerHa /
                              prediction.benchmarks.potentialMaximumTonnesPerHa) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* National Average */}
                  <div>
                    <div className="flex justify-between text-stone-700 font-medium mb-1">
                      <span>National Average (All India)</span>
                      <span>{prediction.benchmarks.nationalAverageTonnesPerHa} t/ha</span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-2.5">
                      <div
                        className="bg-stone-300 h-2.5 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            (prediction.benchmarks.nationalAverageTonnesPerHa /
                              prediction.benchmarks.potentialMaximumTonnesPerHa) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Potential Maximum */}
                  <div>
                    <div className="flex justify-between text-stone-500 font-medium mb-1">
                      <span>Theoretical Potential Maximum (Research Plot)</span>
                      <span>{prediction.benchmarks.potentialMaximumTonnesPerHa} t/ha</span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-2">
                      <div className="bg-emerald-600/40 h-2 rounded-full w-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Influencing Factors Breakdown */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <h3 className="font-bold text-stone-900 text-sm mb-3">
                  Key Influencing Factors & Sensitivity Drivers
                </h3>
                <div className="space-y-2.5">
                  {prediction.influencingFactors.map((f, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                        f.impact === 'POSITIVE'
                          ? 'bg-emerald-50/70 border-emerald-200 text-stone-800'
                          : f.impact === 'NEGATIVE'
                          ? 'bg-rose-50/70 border-rose-200 text-stone-800'
                          : 'bg-stone-50 border-stone-200 text-stone-800'
                      }`}
                    >
                      {f.impact === 'POSITIVE' ? (
                        <ArrowUpRight className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : f.impact === 'NEGATIVE' ? (
                        <ArrowDownRight className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-bold text-stone-900">{f.factor}: </span>
                        <span>{f.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-xs min-h-[440px] flex flex-col items-center justify-center text-center">
              <TrendingUp className="w-12 h-12 text-stone-300 mb-3" />
              <h3 className="font-bold text-stone-800 text-base">Calculate Expected Yield</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm">
                Enter your farm parameters on the left to compute harvest estimates, variance bounds, and benchmark comparisons.
              </p>
              <button
                onClick={() => handlePredict(formData)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Compute Baseline Yield
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
