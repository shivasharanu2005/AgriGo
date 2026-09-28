import React, { useState, useEffect } from 'react';
import {
  CloudRain,
  Sun,
  Droplets,
  Wind,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Compass,
  Thermometer,
  ShieldAlert,
  Info,
  RefreshCw,
  MapPin,
  Crosshair,
  Radio,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useLanguage } from '../i18n/LanguageContext.tsx';
import { useLocation } from '../contexts/LocationContext.tsx';
import { LocationSelectorModal } from '../components/LocationSelectorModal.tsx';
import { WeatherIntelligence } from '../types/index.ts';
import { api } from '../services/api.ts';

export const WeatherIntelligencePage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { currentLocation, isDetecting, detectLiveLocation } = useLocation();

  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<WeatherIntelligence | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);

  useEffect(() => {
    loadWeatherData();
  }, [currentLocation.lat, currentLocation.lng]);

  const loadWeatherData = async () => {
    setLoading(true);
    try {
      const data = await api.getWeather(currentLocation.lat, currentLocation.lng);
      setWeather(data);
    } catch (err) {
      console.error('Failed to load weather:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDetectGPS = async () => {
    await detectLiveLocation();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">
            <CloudRain className="w-4 h-4 text-blue-600" />
            <span>Agromet Meteorological Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Agricultural Weather & Advisory
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Real-time weather from Open-Meteo converted into actionable farm field decisions.
          </p>
        </div>

        {/* Location Picker Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* One-Click GPS Live Location Button */}
          <button
            onClick={handleQuickDetectGPS}
            disabled={isDetecting}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs border ${
              currentLocation.isLiveGPS
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                : 'bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-300'
            }`}
            title="Detect My Live Location via GPS"
          >
            <Crosshair className={`w-3.5 h-3.5 ${isDetecting ? 'animate-spin text-emerald-300' : ''}`} />
            <span>{isDetecting ? 'Locating...' : currentLocation.isLiveGPS ? 'Live GPS Active' : 'Use Current GPS'}</span>
            {currentLocation.isLiveGPS && (
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            )}
          </button>

          {/* Change Location Button */}
          <button
            onClick={() => setShowLocationModal(true)}
            className="px-3 py-2 bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-all"
          >
            <MapPin className="w-3.5 h-3.5 text-stone-500" />
            <span className="max-w-[140px] truncate">{currentLocation.displayName.split(',')[0]}</span>
          </button>

          <button
            onClick={loadWeatherData}
            className="p-2 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl text-stone-600 transition-colors shadow-2xs"
            title="Refresh Weather Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Current Conditions Card */}
      <div className="bg-linear-to-br from-blue-900 via-sky-800 to-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-lg bg-white/20 text-xs font-semibold uppercase tracking-wider backdrop-blur-xs">
                {currentLocation.displayName} • {currentLocation.state}
              </span>
              {currentLocation.isLiveGPS && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/30 text-emerald-200 text-[10px] font-bold border border-emerald-400/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live GPS (±{currentLocation.accuracyMeters || 10}m)
                </span>
              )}
            </div>

            <div className="text-[11px] text-blue-200/90 font-mono mt-2">
              Station Coordinates: {currentLocation.lat.toFixed(4)}° N, {currentLocation.lng.toFixed(4)}° E
            </div>

            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-4xl sm:text-6xl font-black tracking-tight">
                {weather?.temperature || 28}°C
              </span>
              <span className="text-lg text-blue-200 font-medium">{weather?.condition || 'Rain Showers'}</span>
            </div>
            <p className="text-xs text-blue-100/80 mt-1">
              Evapotranspiration Rate: {weather?.evapotranspirationRateMm || 4.1} mm/day • UV Index: {weather?.uvIndex || 6}
            </p>
          </div>

          {/* Environmental Sensor Telemetry Grid */}
          <div className="grid grid-cols-3 gap-3 bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/15">
            <div className="text-center px-2">
              <div className="flex items-center justify-center text-blue-300 mb-1">
                <Droplets className="w-5 h-5" />
              </div>
              <div className="text-xs text-blue-200 uppercase font-medium">Humidity</div>
              <div className="text-lg font-bold">{weather?.humidity || 76}%</div>
            </div>

            <div className="text-center px-2 border-x border-white/15">
              <div className="flex items-center justify-center text-blue-300 mb-1">
                <CloudRain className="w-5 h-5" />
              </div>
              <div className="text-xs text-blue-200 uppercase font-medium">Rain Today</div>
              <div className="text-lg font-bold">{weather?.rainfallMm || 24.2} mm</div>
            </div>

            <div className="text-center px-2">
              <div className="flex items-center justify-center text-blue-300 mb-1">
                <Wind className="w-5 h-5" />
              </div>
              <div className="text-xs text-blue-200 uppercase font-medium">Wind Speed</div>
              <div className="text-lg font-bold">{weather?.windSpeedKmh || 12} km/h</div>
            </div>
          </div>
        </div>
      </div>

      {/* Agronomic Decision Advisories Row */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-stone-900 tracking-tight">
          Field Operational Advisories
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {weather?.agronomicAdvisories?.map((adv, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl border shadow-xs flex flex-col justify-between ${
                adv.severity === 'WARNING'
                  ? 'bg-amber-50/80 border-amber-200'
                  : 'bg-emerald-50/80 border-emerald-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2">
                  <span
                    className={adv.severity === 'WARNING' ? 'text-amber-800' : 'text-emerald-800'}
                  >
                    {adv.category} ADVISORY
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] ${
                      adv.severity === 'WARNING'
                        ? 'bg-amber-200 text-amber-900'
                        : 'bg-emerald-200 text-emerald-900'
                    }`}
                  >
                    {adv.severity}
                  </span>
                </div>
                <h3 className="font-extrabold text-stone-900 text-sm">{adv.title}</h3>
                <p className="text-xs text-stone-700 mt-1.5 leading-relaxed">{adv.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-200/60 text-xs font-semibold text-stone-900 flex items-start gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>Action: {adv.action}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Agricultural Forecast Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-stone-900 text-base">7-Day Agricultural Microclimate Forecast</h3>
            <p className="text-xs text-stone-500">Includes precipitation sum and condition forecasts</p>
          </div>
          <Calendar className="w-5 h-5 text-stone-400" />
        </div>

        <div className="divide-y divide-stone-100">
          {weather?.forecast7Day?.map((day, idx) => (
            <div
              key={idx}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-stone-50 transition-colors"
            >
              <div className="flex items-center gap-3 sm:w-1/4">
                <span className="font-bold text-stone-900 text-sm">{day.dayName}</span>
                <span className="text-stone-500 text-[11px]">{day.date}</span>
              </div>

              <div className="flex items-center gap-2 sm:w-1/4">
                {day.condition.toLowerCase().includes('rain') ? (
                  <CloudRain className="w-4 h-4 text-blue-600" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
                <span className="font-medium text-stone-800">{day.condition}</span>
              </div>

              <div className="flex items-center gap-4 sm:w-1/4">
                <div className="text-stone-600">
                  <span className="font-bold text-stone-900">{day.tempMax}°C</span> /{' '}
                  <span className="text-stone-500">{day.tempMin}°C</span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 sm:w-1/4">
                <div className="text-right">
                  <span className="font-bold text-blue-700">{day.rainfallMm} mm</span>
                  <span className="text-[10px] text-stone-400 ml-1">({day.rainfallChancePercent}%)</span>
                </div>
                <div className="w-16 bg-stone-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full"
                    style={{ width: `${Math.min(100, day.rainfallChancePercent)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Location Selector Modal */}
      <LocationSelectorModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />
    </div>
  );
};
