import React, { useState, useEffect, useRef } from 'react';
import {
  Sprout,
  ShieldAlert,
  Mic,
  Bell,
  Globe,
  Users,
  ChevronDown,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  MapPin,
  Crosshair,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useLanguage } from '../i18n/LanguageContext.tsx';
import { useLocation } from '../contexts/LocationContext.tsx';
import { LocationSelectorModal } from './LocationSelectorModal.tsx';
import { NotificationItem, UserRole, IndianLanguage } from '../types/index.ts';
import { api } from '../services/api.ts';

interface NavbarProps {
  activeTab: string;
  setActiveTab?: (tab: string) => void;
  onSelectTab?: (tab: string) => void;
  onOpenVoiceAssistant: () => void;
  onGoHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab: propSetActiveTab,
  onSelectTab,
  onOpenVoiceAssistant,
  onGoHome,
}) => {
  const setActiveTab = (tab: string) => {
    if (propSetActiveTab) propSetActiveTab(tab);
    if (onSelectTab) onSelectTab(tab);
  };

  const { user, role } = useAuth();
  const { language, setLanguage, t, languages } = useLanguage();
  const { currentLocation } = useLocation();

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications(user?.id);
      setNotifications(data);
    } catch (err) {
      // benign
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setShowLangMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadgeStyle = (r: UserRole) => {
    switch (r) {
      case 'OFFICER':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={onGoHome}>
            <div className="flex h-10 w-12 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-2 ring-emerald-600/20">
              <img src="/assets/AgriGo%20logo.png" alt="AgriGo" className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-stone-900 tracking-tight">AgriGo</span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold tracking-wider uppercase bg-amber-100 text-amber-900 rounded-md border border-amber-300">
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium hidden md:block">
                {t('appTagline', 'Intelligent Farmer Decision Support Platform')}
              </p>
            </div>
          </div>

          {/* Navigation Links based on role */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'dashboard'
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
            >
              {t('navDashboard', 'Dashboard')}
            </button>

            <button
              onClick={() => setActiveTab('disease')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'disease'
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
            >
              {t('navDisease', 'Disease Check')}
            </button>

            <button
              onClick={() => setActiveTab('crop_rec')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'crop_rec'
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
            >
              {t('navCropRec', 'Crop Advisor')}
            </button>

            <button
              onClick={() => setActiveTab('yield')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'yield'
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
            >
              {t('navYield', 'Yield')}
            </button>

            <button
              onClick={() => setActiveTab('weather')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'weather'
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
            >
              {t('navWeather', 'Weather')}
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'map'
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
            >
              {t('navMap', 'GPS Map')}
            </button>

            <button
              onClick={() => setActiveTab('land_measurement')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'land_measurement'
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
            >
              Land Measurement
            </button>

            <button
              onClick={() => setActiveTab('mandi')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'mandi'
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
            >
              {t('navMandi', 'Mandi Prices')}
            </button>

            <button
              onClick={() => setActiveTab('marketplace')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'marketplace'
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
            >
              {t('navMarketplace', 'Marketplace')}
            </button>

            <button
              onClick={() => setActiveTab('equipment')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'equipment'
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
            >
              {t('navEquipment', 'Equipment')}
            </button>

            <button
              onClick={() => setActiveTab('schemes')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'schemes'
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
            >
              {t('navSchemes', 'Schemes')}
            </button>

            <button
              onClick={() => setActiveTab('insurance')}
              className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'insurance'
                ? 'bg-lime-50 text-lime-700'
                : 'text-lime-700 hover:bg-lime-50'
                }`}
            >
              {t('navInsurance', 'Insurance')}
            </button>

            <button
              onClick={() => setActiveTab('services')}
              className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'services'
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-emerald-700 hover:bg-emerald-50'
                }`}
            >
              {t('navServices', 'Services')}
            </button>

            {role === 'OFFICER' && (
              <button
                onClick={() => setActiveTab('officer')}
                className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors border ${activeTab === 'officer'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'text-blue-600 border-blue-200 hover:bg-blue-50'
                  }`}
              >
                {t('navOfficer', 'Officer Portal')}
              </button>
            )}

            {role === 'ADMIN' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors border ${activeTab === 'admin'
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'text-purple-600 border-purple-200 hover:bg-purple-50'
                  }`}
              >
                {t('navAdmin', 'Admin Console')}
              </button>
            )}

            <button
              onClick={() => setActiveTab('impact')}
              className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'impact'
                ? 'bg-amber-50 text-amber-800'
                : 'text-amber-700 hover:bg-amber-50'
                }`}
            >
              {t('navImpact', 'Outbreak')}
            </button>
          </nav>

          {/* Right Action Icons: Location, Voice Assistant, Language, Notifications, Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Location Selector Trigger */}
            <button
              onClick={() => setShowLocationModal(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${currentLocation.isLiveGPS
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs'
                : 'border-stone-200 hover:border-emerald-300 hover:bg-stone-50 text-stone-700'
                }`}
              title="Click to Choose Current/Live Location"
            >
              <MapPin className={`w-3.5 h-3.5 ${currentLocation.isLiveGPS ? 'text-emerald-600' : 'text-stone-400'}`} />
              <span className="max-w-[110px] truncate hidden sm:inline">
                {currentLocation.displayName.split(',')[0]}
              </span>
              {currentLocation.isLiveGPS ? (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Live GPS Active" />
              ) : (
                <span className="text-[10px] text-stone-400 font-mono hidden md:inline">
                  ({currentLocation.district})
                </span>
              )}
            </button>

            {/* Voice Assistant Trigger */}
            <button
              onClick={onOpenVoiceAssistant}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all ring-2 ring-emerald-600/30 active:scale-95"
              title="Speak with AgriVision Voice Assistant"
            >
              <Mic className="w-4 h-4 animate-pulse" />
              <span className="hidden sm:inline">{t('voiceAssistant', 'Voice Assistant')}</span>
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs sm:text-sm font-medium transition-colors"
                title="Select Indian Language"
              >
                <Globe className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold uppercase text-xs">{language}</span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1 text-xs font-semibold text-stone-400 uppercase tracking-wider">
                    Select Language (ಭಾಷೆ)
                  </div>
                  {languages.map(l => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code as IndianLanguage);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-stone-50 transition-colors ${language === l.code ? 'font-semibold text-emerald-700 bg-emerald-50/60' : 'text-stone-700'
                        }`}
                    >
                      <span>
                        {l.name} <span className="text-stone-400 text-xs">({l.nativeName})</span>
                      </span>
                      {language === l.code && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-stone-100 flex items-center justify-between">
                    <span className="font-semibold text-stone-900 text-sm">Farm Alerts & Advisories</span>
                    <span className="text-xs text-stone-500">{notifications.length} total</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-stone-500">No new notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => handleMarkAsRead(n.id)}
                          className={`p-3 text-xs transition-colors cursor-pointer hover:bg-stone-50 ${!n.read ? 'bg-amber-50/40 font-medium' : 'text-stone-600'
                            }`}
                        >
                          <div className="flex items-start gap-2">
                            {n.severity === 'CRITICAL' ? (
                              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                            ) : n.severity === 'WARNING' ? (
                              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className="font-semibold text-stone-900 text-[13px]">{n.title}</p>
                              <p className="text-stone-600 mt-0.5">{n.message}</p>
                              <p className="text-[10px] text-stone-400 mt-1">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Authenticated role badge */}
            <div className="relative">
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold tracking-wide uppercase transition-colors ${getRoleBadgeStyle(
                  role
                )}`}
                title="Your authenticated platform role"
              >
                <Users className="w-3.5 h-3.5" />
                <span>{role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1 border-t border-stone-100 no-scrollbar">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded-lg ${activeTab === 'dashboard' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-700'
              }`}
          >
            {t('navDashboard', 'Dashboard')}
          </button>
          <button
            onClick={() => setActiveTab('disease')}
            className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded-lg ${activeTab === 'disease' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-700'
              }`}
          >
            {t('navDisease', 'Disease Check')}
          </button>
          <button
            onClick={() => setActiveTab('crop_rec')}
            className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded-lg ${activeTab === 'crop_rec' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-700'
              }`}
          >
            {t('navCropRec', 'Crop Advisor')}
          </button>
          <button
            onClick={() => setActiveTab('yield')}
            className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded-lg ${activeTab === 'yield' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-700'
              }`}
          >
            {t('navYield', 'Yield AI')}
          </button>
          <button
            onClick={() => setActiveTab('weather')}
            className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded-lg ${activeTab === 'weather' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-700'
              }`}
          >
            {t('navWeather', 'Weather')}
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded-lg ${activeTab === 'map' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-700'
              }`}
          >
            {t('navMap', 'GIS Map')}
          </button>
          <button
            onClick={() => setActiveTab('land_measurement')}
            className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded-lg ${activeTab === 'land_measurement' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-700'
              }`}
          >
            Land Measurement
          </button>
          <button
            onClick={() => setActiveTab('mandi')}
            className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded-lg ${activeTab === 'mandi' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-700'
              }`}
          >
            Mandi Prices
          </button>
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded-lg ${activeTab === 'marketplace' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-700'
              }`}
          >
            Marketplace
          </button>
          <button
            onClick={() => setActiveTab('equipment')}
            className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded-lg ${activeTab === 'equipment' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-700'
              }`}
          >
            Equipment
          </button>
          <button
            onClick={() => setActiveTab('schemes')}
            className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded-lg ${activeTab === 'schemes' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-700'
              }`}
          >
            Schemes
          </button>
          <button
            onClick={() => setActiveTab('insurance')}
            className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded-lg ${activeTab === 'insurance' ? 'bg-lime-600 text-white' : 'bg-lime-100 text-lime-800'
              }`}
          >
            Insurance
          </button>
          {role === 'OFFICER' && (
            <button
              onClick={() => setActiveTab('officer')}
              className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded-lg ${activeTab === 'officer' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'
                }`}
            >
              Officer Portal
            </button>
          )}
          {role === 'ADMIN' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded-lg ${activeTab === 'admin' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-800'
                }`}
            >
              Admin
            </button>
          )}
          <button
            onClick={() => setActiveTab('impact')}
            className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded-lg ${activeTab === 'impact' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800'
              }`}
          >
         Outbreak
          </button>
        </div>
      </div>

      {/* Location Selector Modal */}
      <LocationSelectorModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />
    </header>
  );
};
