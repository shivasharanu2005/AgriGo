import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  Sparkles,
  Layers,
  Droplets,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  Sliders,
  RotateCcw,
  Search,
  BookOpen,
  Filter,
  MapPin,
  ShieldAlert,
  Sprout,
  ArrowUpDown,
  ChevronRight,
  Info,
  Clock,
  Wheat,
  X,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useLanguage } from '../i18n/LanguageContext.tsx';
import { useLocation } from '../contexts/LocationContext.tsx';
import { CropRecommendationItem, CropCategory } from '../types/index.ts';
import { api } from '../services/api.ts';

const CATEGORIES: ('All' | CropCategory)[] = [
  'All',
  'Cereals & Millets',
  'Pulses & Legumes',
  'Oilseeds',
  'Commercial & Fibre',
  'Vegetables & Greens',
  'Fruits & Plantation',
  'Spices & Condiments',
  'Fodder & Flowers',
];

const PRESETS = [
  {
    label: 'Kolar Red Loam (Kharif)',
    desc: 'Moderate NPK, pH 6.5, 700mm rain, Drip',
    data: {
      nitrogen: 95,
      phosphorus: 55,
      potassium: 70,
      ph: 6.5,
      temperature: 28,
      humidity: 72,
      rainfall: 700,
      soilType: 'Red & Yellow',
      season: 'Kharif',
      irrigationAvailability: 'Moderate',
      state: 'Karnataka',
    },
  },
  {
    label: 'Punjab Alluvial (Rabi Granary)',
    desc: 'High N, pH 7.2, 520mm rain, Canal/Flood',
    data: {
      nitrogen: 115,
      phosphorus: 60,
      potassium: 55,
      ph: 7.2,
      temperature: 18,
      humidity: 65,
      rainfall: 520,
      soilType: 'Alluvial',
      season: 'Rabi',
      irrigationAvailability: 'Abundant',
      state: 'Punjab',
    },
  },
  {
    label: 'Guntur Black Regur (Spices & Cash)',
    desc: 'High K, pH 7.4, 780mm rain, Drip/Sprinkler',
    data: {
      nitrogen: 90,
      phosphorus: 50,
      potassium: 65,
      ph: 7.4,
      temperature: 30,
      humidity: 68,
      rainfall: 780,
      soilType: 'Black (Regur)',
      season: 'Kharif',
      irrigationAvailability: 'Moderate',
      state: 'Andhra Pradesh',
    },
  },
  {
    label: 'Bundelkhand Dryland (Pulses/Oilseeds)',
    desc: 'Low N, pH 7.2, 420mm rain, Rainfed Scarse',
    data: {
      nitrogen: 35,
      phosphorus: 45,
      potassium: 35,
      ph: 7.2,
      temperature: 24,
      humidity: 48,
      rainfall: 420,
      soilType: 'Sandy Loam',
      season: 'Rabi',
      irrigationAvailability: 'Scarse',
      state: 'Madhya Pradesh',
    },
  },
  {
    label: 'Assam High Rainfall (Tea/Acidic)',
    desc: 'High rain 2200mm, pH 5.2, Acid Laterite',
    data: {
      nitrogen: 85,
      phosphorus: 45,
      potassium: 75,
      ph: 5.2,
      temperature: 26,
      humidity: 85,
      rainfall: 2100,
      soilType: 'Laterite',
      season: 'Kharif',
      irrigationAvailability: 'Abundant',
      state: 'Assam',
    },
  },
];

export const CropRecommendationPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { currentLocation } = useLocation();

  // Active view tab: 'recommendations' | 'catalog'
  const [activeTab, setActiveTab] = useState<'recommendations' | 'catalog'>('recommendations');

  const [formData, setFormData] = useState(PRESETS[0].data);
  const [loading, setLoading] = useState(false);
  const [syncingLocation, setSyncingLocation] = useState(false);
  const [recommendations, setRecommendations] = useState<CropRecommendationItem[]>([]);
  const [selectedCropDetail, setSelectedCropDetail] = useState<CropRecommendationItem | null>(null);

  // Filters & sorting for recommendations
  const [selectedCategory, setSelectedCategory] = useState<'All' | CropCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'suitability' | 'profit' | 'duration'>('suitability');

  // Full Catalog state
  const [catalogCrops, setCatalogCrops] = useState<any[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogCategory, setCatalogCategory] = useState<'All' | CropCategory>('All');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogSelectedCrop, setCatalogSelectedCrop] = useState<any | null>(null);

  // Initial recommendation run on mount
  useEffect(() => {
    handleRunModel(formData);
  }, []);

  // Fetch catalog when catalog tab is opened
  useEffect(() => {
    if (activeTab === 'catalog' && catalogCrops.length === 0) {
      loadCatalog();
    }
  }, [activeTab]);

  const loadCatalog = async (category = catalogCategory, search = catalogSearch) => {
    setCatalogLoading(true);
    try {
      const res = await api.getCropCatalog(category === 'All' ? undefined : category, search || undefined);
      setCatalogCrops(res.crops || []);
      if (res.crops && res.crops.length > 0 && !catalogSelectedCrop) {
        setCatalogSelectedCrop(res.crops[0]);
      }
    } catch (err) {
      console.error('Failed to load crop catalog:', err);
    } finally {
      setCatalogLoading(false);
    }
  };

  const handleRunModel = async (inputData = formData) => {
    setLoading(true);
    try {
      const res = await api.recommendCrops({ ...inputData, userId: user?.id });
      const recs = res.recommendations || [];
      setRecommendations(recs);
      if (recs.length > 0) {
        setSelectedCropDetail(recs[0]);
      }
    } catch (err) {
      console.error('Recommendation failure:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setFormData(preset.data);
    handleRunModel(preset.data);
  };

  // Sync live location and live weather
  const syncWithLiveLocation = async () => {
    setSyncingLocation(true);
    try {
      const weather = await api.getWeather(currentLocation.lat, currentLocation.lng);
      const updated = {
        ...formData,
        temperature: Math.round(weather.temperature),
        humidity: Math.round(weather.humidity),
        rainfall: weather.rainfallMm > 0 ? Math.round(weather.rainfallMm * 30) : formData.rainfall,
        state: currentLocation.state || formData.state,
      };
      setFormData(updated);
      await handleRunModel(updated);
    } catch (err) {
      console.error('Live sync error:', err);
    } finally {
      setSyncingLocation(false);
    }
  };

  // Filtered and sorted recommendations
  const filteredRecommendations = useMemo(() => {
    return recommendations
      .filter((crop) => {
        const matchesCategory =
          selectedCategory === 'All' || crop.category === selectedCategory;
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          crop.cropName.toLowerCase().includes(q) ||
          (crop.hindiName && crop.hindiName.toLowerCase().includes(q)) ||
          (crop.scientificName && crop.scientificName.toLowerCase().includes(q)) ||
          (crop.popularVarieties && crop.popularVarieties.some((v) => v.toLowerCase().includes(q)));
        return matchesCategory && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'suitability') {
          return b.suitabilityScore - a.suitabilityScore;
        }
        if (sortBy === 'profit') {
          const profitA = a.estimatedNetProfitPerAcre || 0;
          const profitB = b.estimatedNetProfitPerAcre || 0;
          return profitB - profitA;
        }
        if (sortBy === 'duration') {
          const durA = a.durationDays || 120;
          const durB = b.durationDays || 120;
          return durA - durB;
        }
        return 0;
      });
  }, [recommendations, selectedCategory, searchQuery, sortBy]);

  // Filtered catalog crops
  const filteredCatalogCrops = useMemo(() => {
    return catalogCrops.filter((crop) => {
      const matchesCategory =
        catalogCategory === 'All' || crop.category === catalogCategory;
      const q = catalogSearch.toLowerCase().trim();
      const matchesQuery =
        !q ||
        crop.name.toLowerCase().includes(q) ||
        (crop.hindiName && crop.hindiName.toLowerCase().includes(q)) ||
        (crop.scientificName && crop.scientificName.toLowerCase().includes(q)) ||
        (crop.popularVarieties && crop.popularVarieties.some((v: string) => v.toLowerCase().includes(q)));
      return matchesCategory && matchesQuery;
    });
  }, [catalogCrops, catalogCategory, catalogSearch]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 animate-in fade-in duration-200">
      {/* Top Banner: Title & Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>ICAR & Agricultural University Agronomic Model</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-extrabold">
              144+ Crops Database
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            AI Crop Suitability Recommender
          </h1>
          <p className="text-sm text-stone-600 mt-1 max-w-3xl leading-relaxed">
            Real-world agronomic and economic engine. Recommends the highest-yielding, most profitable crops matching your exact soil test NPK, pH, microclimate, and irrigation capacity.
          </p>
        </div>

        {/* Live Location Sync Bar */}
        <div className="flex items-center gap-2 bg-stone-100/90 border border-stone-200 p-2 rounded-2xl shrink-0 self-start md:self-auto">
          <div className="flex items-center gap-2 px-2.5 py-1">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="text-left">
              <div className="text-[10px] text-stone-500 font-semibold uppercase">Active Field Location</div>
              <div className="text-xs font-bold text-stone-900 max-w-[180px] truncate">
                {currentLocation.displayName}
              </div>
            </div>
          </div>
          <button
            onClick={syncWithLiveLocation}
            disabled={syncingLocation}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
            title="Auto-fill live temperature, humidity, and rainfall from your current GPS/weather station"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingLocation ? 'animate-spin' : ''}`} />
            <span>Sync Live</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center justify-between gap-3 border-b border-stone-200 pb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'recommendations'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Smart Recommendations ({recommendations.length} Evaluated)</span>
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'catalog'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>All-India Crop Directory (144 Crops)</span>
          </button>
        </div>

        <span className="text-xs text-stone-500 hidden sm:inline">
          {activeTab === 'recommendations' ? 'Customized for current soil/weather' : 'Encyclopedic database of Indian Agriculture'}
        </span>
      </div>

      {/* TAB 1: SMART RECOMMENDATIONS VIEW */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          {/* Quick-Test Agro-Climatic Zone Presets */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <span>⚡ Test Agro-Climatic Zones:</span>
              </span>
              <span className="text-[11px] text-stone-400">Click to instantly populate field soil & climate</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
              {PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => applyPreset(preset)}
                  className="p-2.5 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-stone-200 rounded-xl text-left transition-all text-xs group shadow-2xs"
                >
                  <div className="font-bold text-stone-900 group-hover:text-emerald-800 line-clamp-1">{preset.label}</div>
                  <div className="text-[10px] text-stone-500 mt-0.5 line-clamp-1">{preset.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Grid: Inputs Form & Results View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Form: Soil, Weather, Irrigation Inputs */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-emerald-600" />
                    <span>Soil Chemistry & Farm Environment</span>
                  </h3>
                  <button
                    onClick={() => applyPreset(PRESETS[0])}
                    className="text-[11px] text-stone-400 hover:text-stone-700 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>

                {/* Soil Type & Season */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                      Soil Type
                    </label>
                    <select
                      value={formData.soilType}
                      onChange={e => setFormData({ ...formData, soilType: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="Red & Yellow">Red & Yellow Soil</option>
                      <option value="Alluvial">Alluvial Loam</option>
                      <option value="Black (Regur)">Black (Regur) Soil</option>
                      <option value="Sandy Loam">Sandy Loam</option>
                      <option value="Laterite">Laterite Soil</option>
                      <option value="Clay">Clay Soil</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                      Season
                    </label>
                    <select
                      value={formData.season}
                      onChange={e => setFormData({ ...formData, season: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="Kharif">Kharif (Monsoon / Summer)</option>
                      <option value="Rabi">Rabi (Winter / Spring)</option>
                      <option value="Zaid">Zaid (Summer Zaid)</option>
                    </select>
                  </div>
                </div>

                {/* Soil N-P-K Sliders */}
                <div className="space-y-3 pt-2 border-t border-stone-100">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-stone-700">Available Nitrogen (N)</span>
                    <span className="text-emerald-700 font-bold">{formData.nitrogen} kg/ha</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="180"
                    value={formData.nitrogen}
                    onChange={e => setFormData({ ...formData, nitrogen: Number(e.target.value) })}
                    className="w-full accent-emerald-600"
                  />

                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-stone-700">Available Phosphorus (P)</span>
                    <span className="text-blue-700 font-bold">{formData.phosphorus} kg/ha</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={formData.phosphorus}
                    onChange={e => setFormData({ ...formData, phosphorus: Number(e.target.value) })}
                    className="w-full accent-blue-600"
                  />

                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-stone-700">Available Potassium (K)</span>
                    <span className="text-amber-700 font-bold">{formData.potassium} kg/ha</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="140"
                    value={formData.potassium}
                    onChange={e => setFormData({ ...formData, potassium: Number(e.target.value) })}
                    className="w-full accent-amber-600"
                  />
                </div>

                {/* Soil pH & Water Availability */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-100">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                      Soil pH: <span className="text-stone-900 font-extrabold">{formData.ph}</span>
                    </label>
                    <input
                      type="range"
                      min="4.5"
                      max="9.0"
                      step="0.1"
                      value={formData.ph}
                      onChange={e => setFormData({ ...formData, ph: Number(e.target.value) })}
                      className="w-full accent-stone-700"
                    />
                    <div className="text-[10px] text-stone-400 mt-0.5">
                      {formData.ph < 6.0 ? 'Acidic' : formData.ph <= 7.5 ? 'Neutral (Ideal)' : 'Alkaline/Sodic'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                      Irrigation Water
                    </label>
                    <select
                      value={formData.irrigationAvailability}
                      onChange={e => setFormData({ ...formData, irrigationAvailability: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="Abundant">Abundant (Canal/River)</option>
                      <option value="Moderate">Moderate (Borewell/Drip)</option>
                      <option value="Scarse">Scarse (Rainfed Dryland)</option>
                    </select>
                  </div>
                </div>

                {/* Rainfall & Temperature */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-100">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                      Rainfall: <span className="text-blue-700 font-extrabold">{formData.rainfall} mm</span>
                    </label>
                    <input
                      type="range"
                      min="200"
                      max="2800"
                      step="50"
                      value={formData.rainfall}
                      onChange={e => setFormData({ ...formData, rainfall: Number(e.target.value) })}
                      className="w-full accent-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                      Avg Temp: <span className="text-amber-700 font-extrabold">{formData.temperature}°C</span>
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="44"
                      value={formData.temperature}
                      onChange={e => setFormData({ ...formData, temperature: Number(e.target.value) })}
                      className="w-full accent-amber-600"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleRunModel(formData)}
                  disabled={loading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Screening 144 Crops Across Agronomic Matrix...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{t('runCropModel', 'Evaluate & Rank All 144 Crops')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Area: Ranked Recommendations & Explainability */}
            <div className="lg:col-span-7 space-y-4">
              {/* Filter and Sort Toolbar */}
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
                {/* Search Bar & Sort */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search crop in English or Hindi (e.g. Gehun, Moong, Chilli)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-bold text-stone-500 uppercase">Sort By:</span>
                    <select
                      value={sortBy}
                      onChange={(e: any) => setSortBy(e.target.value)}
                      className="bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="suitability">Agronomic Suitability</option>
                      <option value="profit">Net Profit / Acre</option>
                      <option value="duration">Shortest Harvest Duration</option>
                    </select>
                  </div>
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recommendations List */}
              {filteredRecommendations.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-xs text-center">
                  <Sprout className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                  <h4 className="font-bold text-stone-800 text-sm">No crops match current filter</h4>
                  <p className="text-xs text-stone-500 mt-1">
                    Try clearing your search query or selecting "All" categories.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      setSearchQuery('');
                    }}
                    className="mt-3 px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100 text-xs">
                    <span className="font-bold text-stone-900">
                      Top Ranked Crops for Your Land ({filteredRecommendations.length} shown)
                    </span>
                    <span className="text-stone-500">Click card for complete ICAR dossier</span>
                  </div>

                  <div className="mt-3 space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
                    {filteredRecommendations.map((crop, idx) => {
                      const isSelected = selectedCropDetail?.cropName === crop.cropName;
                      const isTop = idx === 0 && !searchQuery && selectedCategory === 'All';

                      return (
                        <div
                          key={crop.cropName}
                          onClick={() => setSelectedCropDetail(crop)}
                          className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${
                            isSelected
                              ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-200/50'
                              : 'bg-white hover:bg-stone-50 border-stone-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <span
                                className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 mt-0.5 ${
                                  isTop
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-stone-100 text-stone-700'
                                }`}
                              >
                                #{idx + 1}
                              </span>

                              <div>
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="font-extrabold text-stone-900 text-sm">
                                    {crop.cropName}
                                  </span>
                                  {crop.hindiName && (
                                    <span className="text-xs text-stone-600 font-medium">
                                      • {crop.hindiName}
                                    </span>
                                  )}
                                  {isTop && (
                                    <span className="px-2 py-0.5 text-[9px] font-extrabold bg-emerald-600 text-white rounded-full">
                                      Best Overall Fit
                                    </span>
                                  )}
                                  {crop.category && (
                                    <span className="px-2 py-0.5 text-[9px] font-semibold bg-stone-100 text-stone-600 rounded-md">
                                      {crop.category}
                                    </span>
                                  )}
                                </div>

                                {/* Botanical and Timelines */}
                                <div className="text-[11px] text-stone-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-stone-400" />
                                    <span>{crop.expectedGrowingPeriod}</span>
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Droplets className="w-3 h-3 text-blue-500" />
                                    <span>Water: {crop.waterRequirement}</span>
                                  </span>
                                  {crop.sowingWindow && (
                                    <span className="text-stone-600 hidden sm:inline">
                                      Sow: {crop.sowingWindow}
                                    </span>
                                  )}
                                </div>

                                {/* Biological Infeasibility Alert if any */}
                                {!crop.isBiologicallyFeasible && crop.criticalConstraint && (
                                  <div className="mt-2 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                    <span>{crop.criticalConstraint}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Right Score & Economics */}
                            <div className="text-right shrink-0">
                              <div className="flex items-baseline justify-end gap-0.5">
                                <span className="text-xl font-black text-emerald-700">
                                  {crop.suitabilityScore}%
                                </span>
                              </div>
                              <div className="text-[10px] text-stone-400 font-medium">Suitability</div>

                              {crop.estimatedNetProfitPerAcre && (
                                <div className="mt-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                                  +₹{crop.estimatedNetProfitPerAcre.toLocaleString('en-IN')}/ac
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Selected Crop Agronomic Explainability Dossier */}
              {selectedCropDetail && (
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                        <span>ICAR Agronomic & Financial Dossier</span>
                        {selectedCropDetail.category && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full">
                            {selectedCropDetail.category}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 mt-0.5">
                        {selectedCropDetail.cropName}
                        {selectedCropDetail.hindiName && (
                          <span className="text-stone-500 text-base font-normal ml-2">
                            ({selectedCropDetail.hindiName})
                          </span>
                        )}
                      </h3>
                      {selectedCropDetail.scientificName && (
                        <div className="text-xs text-stone-500 italic">
                          {selectedCropDetail.scientificName}
                        </div>
                      )}
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-2xl sm:text-3xl font-black text-emerald-700">
                        {selectedCropDetail.suitabilityScore}%
                      </span>
                      <div className="text-[10px] text-stone-400 uppercase font-bold">Suitability Index</div>
                    </div>
                  </div>

                  {/* Farmer Financial & Profit Potential */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
                      <div className="text-[10px] uppercase font-bold text-emerald-800">Net Profit / Acre</div>
                      <div className="text-sm sm:text-base font-black text-emerald-900 mt-0.5">
                        {selectedCropDetail.estimatedNetProfitPerAcre
                          ? `₹${selectedCropDetail.estimatedNetProfitPerAcre.toLocaleString('en-IN')}`
                          : 'High Yield Value'}
                      </div>
                    </div>

                    <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                      <div className="text-[10px] uppercase font-bold text-stone-500">Cost / Acre</div>
                      <div className="text-sm sm:text-base font-bold text-stone-900 mt-0.5">
                        {selectedCropDetail.estimatedCostPerAcre
                          ? `₹${selectedCropDetail.estimatedCostPerAcre.toLocaleString('en-IN')}`
                          : '₹18,000 – 25,000'}
                      </div>
                    </div>

                    <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                      <div className="text-[10px] uppercase font-bold text-stone-500">Expected Yield</div>
                      <div className="text-xs sm:text-sm font-bold text-stone-900 mt-0.5 line-clamp-1">
                        {selectedCropDetail.expectedYieldPerAcre || '18 – 25 Q / acre'}
                      </div>
                    </div>

                    <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl">
                      <div className="text-[10px] uppercase font-bold text-amber-800">Govt MSP / Pricing</div>
                      <div className="text-xs sm:text-sm font-bold text-amber-950 mt-0.5 line-clamp-1" title={selectedCropDetail.mspOrBenchmarkPrice}>
                        {selectedCropDetail.mspOrBenchmarkPrice || 'APMC Benchmark'}
                      </div>
                    </div>
                  </div>

                  {/* Sowing, Harvest, Fertilizer & Irrigation Windows */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                    <div>
                      <span className="font-bold text-stone-700">🌱 Sowing Window: </span>
                      <span className="text-stone-900">{selectedCropDetail.sowingWindow || 'Timely season onset'}</span>
                    </div>
                    <div>
                      <span className="font-bold text-stone-700">🌾 Harvest Window: </span>
                      <span className="text-stone-900">{selectedCropDetail.harvestWindow || 'Maturity stage'}</span>
                    </div>
                    {selectedCropDetail.recommendedFertilizerDose && (
                      <div className="sm:col-span-2">
                        <span className="font-bold text-emerald-800">🧪 Recommended Fertilizer Dose: </span>
                        <span className="text-stone-800">{selectedCropDetail.recommendedFertilizerDose}</span>
                      </div>
                    )}
                    {selectedCropDetail.irrigationScheduleHint && (
                      <div className="sm:col-span-2">
                        <span className="font-bold text-blue-800">💧 Irrigation Strategy: </span>
                        <span className="text-stone-800">{selectedCropDetail.irrigationScheduleHint}</span>
                      </div>
                    )}
                  </div>

                  {/* Popular High-Yield Varieties */}
                  {selectedCropDetail.popularVarieties && selectedCropDetail.popularVarieties.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Wheat className="w-3.5 h-3.5 text-amber-600" />
                        <span>Recommended High-Yield Varieties (ICAR / SAU)</span>
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCropDetail.popularVarieties.map((variety, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-amber-50 text-amber-900 font-semibold px-2.5 py-1 rounded-lg border border-amber-200/80"
                          >
                            {variety}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Why this crop was chosen (Explainability) */}
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Agronomic Fit Justifications</span>
                    </h4>
                    <div className="space-y-1.5">
                      {selectedCropDetail.reasons.map((reason, i) => (
                        <div
                          key={i}
                          className="text-xs text-stone-800 bg-emerald-50/60 border border-emerald-200/70 p-2.5 rounded-lg flex items-start gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5"></span>
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Risk Factors / Pests */}
                  {selectedCropDetail.riskFactors && selectedCropDetail.riskFactors.length > 0 && (
                    <div className="bg-red-50/60 border border-red-200 rounded-xl p-3 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-red-900 mb-1">
                        <ShieldAlert className="w-4 h-4 text-red-600" />
                        <span>Critical Pests & Risk Management</span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-stone-700">
                        {selectedCropDetail.riskFactors.map((rf, idx) => (
                          <span key={idx} className="bg-white/80 border border-red-100 px-2 py-0.5 rounded text-[11px]">
                            • {rf}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Market Prospect & Economic Outlook */}
                  <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 text-xs text-stone-800">
                    <div className="flex items-center gap-2 font-bold text-amber-950 mb-1">
                      <DollarSign className="w-4 h-4 text-amber-700" />
                      <span>APMC Mandi Demand & Market Outlook</span>
                    </div>
                    <p className="text-stone-700 leading-relaxed">{selectedCropDetail.marketProspect}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ENCYCLOPEDIC ALL-INDIA CROP DIRECTORY (144+ CROPS) */}
      {activeTab === 'catalog' && (
        <div className="space-y-5">
          {/* Search and Category Filter for Catalog */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-stone-900">
                  All-India Crop Knowledge Catalog
                </h3>
                <p className="text-xs text-stone-500">
                  Browse comprehensive agronomic profiles for 144+ crops grown across all 15 agro-climatic zones of India.
                </p>
              </div>

              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search 144+ crops in English or Hindi..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                {catalogSearch && (
                  <button
                    onClick={() => setCatalogSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {CATEGORIES.map((cat) => {
                const isSelected = catalogCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setCatalogCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Catalog Grid */}
          {catalogLoading ? (
            <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center">
              <Sparkles className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
              <div className="text-xs font-bold text-stone-700">Loading Crop Catalog...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCatalogCrops.map((crop) => (
                <div
                  key={crop.name}
                  onClick={() => setCatalogSelectedCrop(crop)}
                  className={`bg-white p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    catalogSelectedCrop?.name === crop.name
                      ? 'border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50/20'
                      : 'border-stone-200 hover:border-emerald-300 hover:shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md uppercase">
                          {crop.category}
                        </span>
                        <h4 className="text-base font-bold text-stone-900 mt-1">
                          {crop.name}
                        </h4>
                        {crop.hindiName && (
                          <div className="text-xs text-stone-600 font-medium">
                            {crop.hindiName}
                          </div>
                        )}
                        {crop.scientificName && (
                          <div className="text-[11px] text-stone-400 italic">
                            {crop.scientificName}
                          </div>
                        )}
                      </div>

                      {crop.estimatedNetProfitPerAcre && (
                        <div className="text-right">
                          <span className="text-xs font-black text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                            +₹{crop.estimatedNetProfitPerAcre.toLocaleString('en-IN')}/ac
                          </span>
                          <div className="text-[9px] text-stone-400 font-semibold mt-0.5">Est. Net Profit</div>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                      <div>
                        <span className="text-stone-500">Duration: </span>
                        <span className="font-semibold text-stone-800">{crop.growingPeriodDays}</span>
                      </div>
                      <div>
                        <span className="text-stone-500">Water: </span>
                        <span className="font-semibold text-stone-800">{crop.waterRequirement}</span>
                      </div>
                      <div>
                        <span className="text-stone-500">Ideal Temp: </span>
                        <span className="font-semibold text-stone-800">{crop.minTemp}–{crop.maxTemp}°C</span>
                      </div>
                      <div>
                        <span className="text-stone-500">Ideal pH: </span>
                        <span className="font-semibold text-stone-800">{crop.minPh}–{crop.maxPh}</span>
                      </div>
                    </div>

                    {crop.popularVarieties && crop.popularVarieties.length > 0 && (
                      <div className="mt-2.5">
                        <div className="text-[10px] font-bold text-stone-500 uppercase">Top Varieties:</div>
                        <div className="text-[11px] text-stone-700 font-medium line-clamp-1 mt-0.5">
                          {crop.popularVarieties.slice(0, 3).join(', ')}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                    <span className="line-clamp-1">{crop.suitableSoils.join(', ')}</span>
                    <ChevronRight className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal / Overlay for Full Crop Profile when clicked in Catalog */}
          {catalogSelectedCrop && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
              <div className="bg-white rounded-3xl max-w-2xl w-full p-6 max-h-[85vh] overflow-y-auto space-y-4 shadow-xl border border-stone-200">
                <div className="flex items-start justify-between pb-3 border-b border-stone-100">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-700 uppercase bg-emerald-50 px-2.5 py-1 rounded-md">
                      {catalogSelectedCrop.category}
                    </span>
                    <h3 className="text-2xl font-black text-stone-900 mt-1">
                      {catalogSelectedCrop.name}
                      {catalogSelectedCrop.hindiName && (
                        <span className="text-stone-500 text-lg font-normal ml-2">
                          ({catalogSelectedCrop.hindiName})
                        </span>
                      )}
                    </h3>
                    <div className="text-xs text-stone-500 italic">
                      {catalogSelectedCrop.scientificName}
                    </div>
                  </div>

                  <button
                    onClick={() => setCatalogSelectedCrop(null)}
                    className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Economics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200/80">
                    <div className="text-[10px] uppercase font-bold text-emerald-800">Net Profit / Acre</div>
                    <div className="text-sm font-black text-emerald-950 mt-0.5">
                      ₹{catalogSelectedCrop.estimatedNetProfitPerAcre?.toLocaleString('en-IN') || 'N/A'}
                    </div>
                  </div>
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                    <div className="text-[10px] uppercase font-bold text-stone-500">Cultivation Cost</div>
                    <div className="text-sm font-bold text-stone-900 mt-0.5">
                      ₹{catalogSelectedCrop.estimatedCostPerAcre?.toLocaleString('en-IN') || 'N/A'}
                    </div>
                  </div>
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                    <div className="text-[10px] uppercase font-bold text-stone-500">Expected Yield</div>
                    <div className="text-xs font-bold text-stone-900 mt-0.5 line-clamp-1">
                      {catalogSelectedCrop.expectedYieldPerAcre}
                    </div>
                  </div>
                  <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                    <div className="text-[10px] uppercase font-bold text-amber-800">Govt MSP / Price</div>
                    <div className="text-xs font-bold text-amber-950 mt-0.5 line-clamp-1">
                      {catalogSelectedCrop.mspOrBenchmarkPrice}
                    </div>
                  </div>
                </div>

                {/* Agronomic Details */}
                <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-2 text-xs text-stone-800">
                  <div>
                    <span className="font-bold text-stone-900">Optimal NPK: </span>
                    <span>N: {catalogSelectedCrop.optN} kg/ha | P: {catalogSelectedCrop.optP} kg/ha | K: {catalogSelectedCrop.optK} kg/ha</span>
                  </div>
                  <div>
                    <span className="font-bold text-stone-900">Soil pH Envelope: </span>
                    <span>{catalogSelectedCrop.minPh} – {catalogSelectedCrop.maxPh} (Optimal: {catalogSelectedCrop.optPh})</span>
                  </div>
                  <div>
                    <span className="font-bold text-stone-900">Compatible Soils: </span>
                    <span>{catalogSelectedCrop.suitableSoils?.join(', ')}</span>
                  </div>
                  <div>
                    <span className="font-bold text-stone-900">Sowing Window: </span>
                    <span>{catalogSelectedCrop.sowingWindow}</span>
                  </div>
                  <div>
                    <span className="font-bold text-stone-900">Harvest Window: </span>
                    <span>{catalogSelectedCrop.harvestWindow}</span>
                  </div>
                  <div>
                    <span className="font-bold text-emerald-800">Fertilizer Recommendation: </span>
                    <span>{catalogSelectedCrop.recommendedFertilizerDose}</span>
                  </div>
                  <div>
                    <span className="font-bold text-blue-800">Irrigation Scheduling: </span>
                    <span>{catalogSelectedCrop.irrigationScheduleHint}</span>
                  </div>
                </div>

                {/* Varieties */}
                {catalogSelectedCrop.popularVarieties && (
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 uppercase mb-1.5">
                      Recommended Varieties:
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {catalogSelectedCrop.popularVarieties.map((v: string, i: number) => (
                        <span key={i} className="text-xs bg-stone-100 text-stone-800 px-2 py-0.5 rounded-md font-medium">
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Market Outlook */}
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs text-stone-800">
                  <div className="font-bold text-amber-950 mb-0.5">Market & Processing Prospects:</div>
                  <p>{catalogSelectedCrop.marketProspect}</p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      setCatalogSelectedCrop(null);
                      setActiveTab('recommendations');
                      setSearchQuery(catalogSelectedCrop.name);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                  >
                    Test Suitability on My Land
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
