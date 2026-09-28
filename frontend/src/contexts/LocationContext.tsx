import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.ts';

export interface LocationState {
  lat: number;
  lng: number;
  displayName: string;
  district: string;
  state: string;
  village?: string;
  isLiveGPS: boolean;
  accuracyMeters?: number;
  updatedAt: number;
}

export interface LocationPreset {
  id: string;
  name: string;
  subtext: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
}

export const AGRICULTURAL_PRESETS: LocationPreset[] = [
  {
    id: 'kolar',
    name: 'Kolar, Karnataka',
    subtext: 'Tomato, Mulberry & Vegetable Belt',
    district: 'Kolar',
    state: 'Karnataka',
    lat: 13.1367,
    lng: 78.1347,
  },
  {
    id: 'ludhiana',
    name: 'Ludhiana, Punjab',
    subtext: 'Wheat & Basmati Rice Granary',
    district: 'Ludhiana',
    state: 'Punjab',
    lat: 30.9010,
    lng: 75.8573,
  },
  {
    id: 'guntur',
    name: 'Guntur, Andhra Pradesh',
    subtext: 'Asia’s Largest Chilli & Spices Market',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    lat: 16.3067,
    lng: 80.4365,
  },
  {
    id: 'nashik',
    name: 'Nashik, Maharashtra',
    subtext: 'Grape Vineyards & Red Onion Capital',
    district: 'Nashik',
    state: 'Maharashtra',
    lat: 19.9975,
    lng: 73.7898,
  },
  {
    id: 'varanasi',
    name: 'Varanasi, Uttar Pradesh',
    subtext: 'Indo-Gangetic Alluvial Veg & Pulse Belt',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    lat: 25.3176,
    lng: 82.9739,
  },
  {
    id: 'mandya',
    name: 'Mandya, Karnataka',
    subtext: 'Cauvery Sugarcane & Paddy Basin',
    district: 'Mandya',
    state: 'Karnataka',
    lat: 12.5234,
    lng: 76.8967,
  },
  {
    id: 'rajkot',
    name: 'Rajkot, Gujarat',
    subtext: 'Saurashtra Groundnut & Bt Cotton Hub',
    district: 'Rajkot',
    state: 'Gujarat',
    lat: 22.3039,
    lng: 70.8022,
  },
];

const DEFAULT_LOCATION: LocationState = {
  lat: 13.1367,
  lng: 78.1347,
  displayName: 'Kolar, Karnataka',
  district: 'Kolar',
  state: 'Karnataka',
  village: 'Vemgal Rural',
  isLiveGPS: false,
  updatedAt: Date.now(),
};

interface LocationContextType {
  currentLocation: LocationState;
  isDetecting: boolean;
  locationError: string | null;
  presets: LocationPreset[];
  detectLiveLocation: () => Promise<{ success: boolean; message?: string }>;
  selectPreset: (presetId: string) => void;
  setCustomCoordinates: (lat: number, lng: number, name?: string) => Promise<void>;
  clearError: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState<LocationState>(() => {
    const saved = localStorage.getItem('agrivision_location');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_LOCATION;
      }
    }
    return DEFAULT_LOCATION;
  });

  const [isDetecting, setIsDetecting] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('agrivision_location', JSON.stringify(currentLocation));
    } catch {
      // benign
    }
  }, [currentLocation]);

  const detectLiveLocation = async (): Promise<{ success: boolean; message?: string }> => {
    setLocationError(null);
    setIsDetecting(true);

    if (!navigator.geolocation) {
      const err = 'Geolocation is not supported by your browser or environment.';
      setLocationError(err);
      setIsDetecting(false);
      return { success: false, message: err };
    }

    return new Promise(resolve => {
      navigator.geolocation.getCurrentPosition(
        async position => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = Math.round(position.coords.accuracy);

          try {
            // Attempt reverse geocoding for human-readable Indian locality
            const geo = await api.reverseGeocode(lat, lng);

            const updated: LocationState = {
              lat,
              lng,
              displayName: geo.displayName || `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`,
              district: geo.district || 'Current District',
              state: geo.state || 'Local State',
              village: geo.village || geo.taluk,
              isLiveGPS: true,
              accuracyMeters: accuracy,
              updatedAt: Date.now(),
            };

            setCurrentLocation(updated);
            setIsDetecting(false);
            resolve({
              success: true,
              message: `Live Location detected: ${updated.displayName} (Accuracy: ±${accuracy}m)`,
            });
          } catch {
            // Reverse geocode fallback
            const latFmt = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}`;
            const lngFmt = `${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? 'E' : 'W'}`;

            const fallbackLoc: LocationState = {
              lat,
              lng,
              displayName: `GPS (${latFmt}, ${lngFmt})`,
              district: 'Local Farmland',
              state: 'GPS Detected',
              isLiveGPS: true,
              accuracyMeters: accuracy,
              updatedAt: Date.now(),
            };

            setCurrentLocation(fallbackLoc);
            setIsDetecting(false);
            resolve({
              success: true,
              message: `Live GPS active: ${fallbackLoc.displayName}`,
            });
          }
        },
        error => {
          setIsDetecting(false);
          let userMessage = 'Unable to retrieve your live GPS location.';
          if (error.code === error.PERMISSION_DENIED) {
            userMessage = 'Location permission was denied. Please allow location access in your browser or select an agro-climatic region from the presets.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            userMessage = 'GPS position is currently unavailable. Using default agricultural zone.';
          } else if (error.code === error.TIMEOUT) {
            userMessage = 'Location request timed out. Please try again or select from the regional presets.';
          }
          setLocationError(userMessage);
          resolve({ success: false, message: userMessage });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        }
      );
    });
  };

  const selectPreset = (presetId: string) => {
    setLocationError(null);
    const preset = AGRICULTURAL_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setCurrentLocation({
        lat: preset.lat,
        lng: preset.lng,
        displayName: preset.name,
        district: preset.district,
        state: preset.state,
        isLiveGPS: false,
        updatedAt: Date.now(),
      });
    }
  };

  const setCustomCoordinates = async (lat: number, lng: number, name?: string) => {
    setLocationError(null);
    setIsDetecting(true);
    try {
      const geo = await api.reverseGeocode(lat, lng);
      setCurrentLocation({
        lat,
        lng,
        displayName: name || geo.displayName,
        district: geo.district,
        state: geo.state,
        village: geo.village,
        isLiveGPS: false,
        updatedAt: Date.now(),
      });
    } catch {
      setCurrentLocation({
        lat,
        lng,
        displayName: name || `Coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        district: 'Custom Location',
        state: 'India',
        isLiveGPS: false,
        updatedAt: Date.now(),
      });
    } finally {
      setIsDetecting(false);
    }
  };

  const clearError = () => setLocationError(null);

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        isDetecting,
        locationError,
        presets: AGRICULTURAL_PRESETS,
        detectLiveLocation,
        selectPreset,
        setCustomCoordinates,
        clearError,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
