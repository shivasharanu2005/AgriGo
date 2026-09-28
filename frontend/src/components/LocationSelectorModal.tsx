import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Crosshair,
  Navigation,
  Search,
  Check,
  AlertCircle,
  X,
  Compass,
  Radio,
  Clock,
  Sparkles,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { useLocation, AGRICULTURAL_PRESETS } from '../contexts/LocationContext.tsx';
import { api } from '../services/api.ts';

interface LocationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({ isOpen, onClose }) => {
  const {
    currentLocation,
    isDetecting,
    locationError,
    detectLiveLocation,
    selectPreset,
    setCustomCoordinates,
    clearError,
  } = useLocation();

  const [activeTab, setActiveTab] = useState<'gps' | 'search' | 'presets' | 'manual'>('gps');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Manual Coordinates
  const [manualLat, setManualLat] = useState(currentLocation?.lat?.toString() || '13.1367');
  const [manualLng, setManualLng] = useState(currentLocation?.lng?.toString() || '78.1347');
  const [manualName, setManualName] = useState('');

  useEffect(() => {
    if (isOpen) {
      clearError();
      setSuccessMessage('');
      setManualLat(currentLocation?.lat?.toString() || '13.1367');
      setManualLng(currentLocation?.lng?.toString() || '78.1347');
    }
  }, [isOpen, currentLocation]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setSearchError('');
      try {
        const results = await api.searchLocations(searchQuery);
        setSearchResults(results);
        if (results.length === 0) {
          setSearchError('No matching Indian districts or towns found. Try typing district name.');
        }
      } catch (err) {
        setSearchError('Unable to query location registry.');
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleDetectGPS = async () => {
    setSuccessMessage('');
    const res = await detectLiveLocation();
    if (res.success) {
      setSuccessMessage(res.message || 'GPS location synchronized successfully!');
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  const handleSelectSearchResult = async (result: any) => {
    await setCustomCoordinates(result.lat, result.lng, result.displayName);
    setSuccessMessage(`Location updated to ${result.displayName}`);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleSelectPreset = (presetId: string) => {
    selectPreset(presetId);
    const p = AGRICULTURAL_PRESETS.find(x => x.id === presetId);
    setSuccessMessage(`Active zone switched to ${p?.name}`);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleApplyManual = async (e: React.FormEvent) => {
    e.preventDefault();
    const latNum = parseFloat(manualLat);
    const lngNum = parseFloat(manualLng);

    if (isNaN(latNum) || isNaN(lngNum)) {
      alert('Please enter valid numeric latitude and longitude.');
      return;
    }

    if (latNum < 6 || latNum > 38 || lngNum < 68 || lngNum > 98) {
      if (!window.confirm('Coordinates appear outside the standard Indian subcontinent landmass (Lat 6°-38° N, Lng 68°-98° E). Proceed anyway?')) {
        return;
      }
    }

    await setCustomCoordinates(latNum, lngNum, manualName || undefined);
    setSuccessMessage('Custom coordinates applied to system telemetry.');
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-stone-900 tracking-tight">
                Farm & Field Location Settings
              </h2>
              <p className="text-xs text-stone-500">
                Synchronize micro-climate weather forecasts and disease outbreak zones.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Location Banner */}
        <div className="px-6 py-3 bg-stone-50 border-b border-stone-200/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-stone-500 font-medium">Active Telemetry:</span>
            <span className="font-bold text-stone-900 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              {currentLocation?.displayName || 'Unknown Location'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {currentLocation?.isLiveGPS ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live GPS Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-200 text-stone-700">
                Fixed Agro-Zone
              </span>
            )}
            <span className="text-stone-400 font-mono text-[10px]">
              {currentLocation?.lat?.toFixed(3) || '0.000'}°, {currentLocation?.lng?.toFixed(3) || '0.000'}°
            </span>
          </div>
        </div>

        {/* Feedback alerts */}
        {locationError && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{locationError}</div>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-700 shrink-0" />
            <div className="flex-1 font-semibold">{successMessage}</div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('gps')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'gps'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Detect Live GPS</span>
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'presets'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Agro-Zones</span>
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'search'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search District</span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'manual'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Coordinates</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: Live GPS */}
          {activeTab === 'gps' && (
            <div className="space-y-4 text-center py-4">
              <div className="relative inline-flex items-center justify-center">
                <div className="w-20 h-20 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-inner">
                  <Crosshair className={`w-10 h-10 ${isDetecting ? 'animate-spin' : ''}`} />
                </div>
                {isDetecting && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-600" />
                  </span>
                )}
              </div>

              <div className="max-w-sm mx-auto space-y-1">
                <h3 className="font-extrabold text-base text-stone-900">
                  Acquire Real-Time Field Coordinates
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Uses device satellite GPS and cellular network geolocation to position your exact farm plot and pull live weather from Open-Meteo.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  disabled={isDetecting}
                  className="w-full sm:w-auto min-w-[240px] px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2.5 mx-auto active:scale-98 disabled:opacity-75"
                >
                  {isDetecting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Requesting Device GPS...</span>
                    </>
                  ) : (
                    <>
                      <Crosshair className="w-4 h-4" />
                      <span>Use My Current Location</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-[11px] text-stone-400 max-w-xs mx-auto">
                Ensure browser permission for "Location" is allowed when prompted.
              </div>
            </div>
          )}

          {/* TAB 2: Agro-Zone Presets */}
          {activeTab === 'presets' && (
            <div className="space-y-2">
              <p className="text-xs text-stone-500 mb-3">
                Select from prominent agricultural production belts across India to test local weather, disease risks, and crop suitability:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {AGRICULTURAL_PRESETS.map(preset => {
                  const isSelected =
                    currentLocation?.district?.toLowerCase() === preset.district.toLowerCase() &&
                    !currentLocation?.isLiveGPS;

                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-start justify-between gap-2 group ${
                        isSelected
                          ? 'bg-emerald-50/80 border-emerald-500 shadow-2xs'
                          : 'bg-stone-50 hover:bg-white border-stone-200 hover:border-emerald-300'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs text-stone-900 group-hover:text-emerald-800 transition-colors">
                          {preset.name}
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                          {preset.subtext}
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono mt-1">
                          {preset.lat.toFixed(2)}° N, {preset.lng.toFixed(2)}° E
                        </div>
                      </div>

                      {isSelected ? (
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                          ✓
                        </span>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-600 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Search Location */}
          {activeTab === 'search' && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Enter district, taluk or town (e.g. Belagavi, Nashik, Hassan)..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden bg-stone-50 focus:bg-white"
                />
                {isSearching && (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600 absolute right-3.5 top-1/2 -translate-y-1/2" />
                )}
              </div>

              {searchError && (
                <div className="text-xs text-stone-500 italic p-3 text-center bg-stone-50 rounded-xl">
                  {searchError}
                </div>
              )}

              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSearchResult(item)}
                    className="w-full p-3 rounded-xl hover:bg-emerald-50/70 border border-stone-100 hover:border-emerald-300 text-left transition-all flex items-center justify-between gap-3 text-xs group"
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-stone-400 group-hover:text-emerald-600 shrink-0" />
                      <div>
                        <div className="font-bold text-stone-900 group-hover:text-emerald-900">
                          {item.displayName}
                        </div>
                        <div className="text-[10px] text-stone-500">
                          {item.state} • Lat {item.lat.toFixed(3)}°, Lng {item.lng.toFixed(3)}°
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-emerald-600 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Manual Coordinates */}
          {activeTab === 'manual' && (
            <form onSubmit={handleApplyManual} className="space-y-3">
              <p className="text-xs text-stone-500">
                Enter exact decimal latitude and longitude (WGS84) from a handheld GPS receiver or land survey record:
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Latitude (° N)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={manualLat}
                    onChange={e => setManualLat(e.target.value)}
                    placeholder="e.g. 13.1367"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-mono font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Longitude (° E)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={manualLng}
                    onChange={e => setManualLng(e.target.value)}
                    placeholder="e.g. 78.1347"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-mono font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Farm / Plot Label (Optional)
                </label>
                <input
                  type="text"
                  value={manualName}
                  onChange={e => setManualName(e.target.value)}
                  placeholder="e.g. North Acre Sugarcane Plot"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-xs"
                >
                  Apply Coordinates
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-600" />
            <span>Open-Meteo & Nominatim Geospatial Engine</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-stone-600 hover:bg-stone-200 font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
