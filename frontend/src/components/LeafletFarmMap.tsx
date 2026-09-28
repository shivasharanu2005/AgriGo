import React, { useEffect, useRef, useState } from 'react';
import { Farm, DiseaseHotspot } from '../types/index.ts';
import { MapPin, AlertTriangle, Layers, Navigation, Info, Crosshair, Loader2 } from 'lucide-react';
import { useLocation } from '../contexts/LocationContext.tsx';

interface LeafletFarmMapProps {
  farms: Farm[];
  hotspots?: DiseaseHotspot[];
  selectedFarmId?: string;
  onSelectFarm?: (farm: Farm) => void;
  heightClass?: string;
}

export const LeafletFarmMap: React.FC<LeafletFarmMapProps> = ({
  farms,
  hotspots = [],
  selectedFarmId,
  onSelectFarm,
  heightClass = 'h-[520px]',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLeafletReady, setIsLeafletReady] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'HEALTHY' | 'AT_RISK' | 'OUTBREAKS'>('ALL');
  const { currentLocation, isDetecting, detectLiveLocation } = useLocation();

  // Dynamically load Leaflet script if not present on window
  useEffect(() => {
    if ((window as any).L) {
      setIsLeafletReady(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => setIsLeafletReady(true);
    document.body.appendChild(script);

    return () => {
      // keep script
    };
  }, []);

  // Initialize and update map
  useEffect(() => {
    if (!isLeafletReady || !mapContainerRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // Center on Kolar/South India by default, or selected farm
    const defaultCenter = [13.1367, 78.1347];

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 7,
        zoomControl: true,
      });

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing layer groups
    if ((map as any)._customLayersGroup) {
      map.removeLayer((map as any)._customLayersGroup);
    }
    const layerGroup = L.layerGroup().addTo(map);
    (map as any)._customLayersGroup = layerGroup;

    // Filter farms according to selection
    const filteredFarms = farms.filter(farm => {
      if (activeFilter === 'HEALTHY') return farm.healthScore >= 85 && farm.riskLevel !== 'HIGH';
      if (activeFilter === 'AT_RISK') return farm.riskLevel === 'HIGH' || farm.healthScore < 80;
      return true;
    });

    // 1. Draw Disease Hotspot outbreak radii
    if (activeFilter === 'ALL' || activeFilter === 'OUTBREAKS') {
      hotspots.forEach(spot => {
        const isHigh = spot.riskLevel === 'HIGH';
        const circle = L.circle([spot.lat, spot.lng], {
          color: isHigh ? '#e11d48' : '#ea580c',
          fillColor: isHigh ? '#f43f5e' : '#f97316',
          fillOpacity: 0.22,
          radius: spot.radiusKm * 1000,
          weight: 2,
          dashArray: '5, 8',
        }).addTo(layerGroup);

        circle.bindPopup(`
          <div style="font-family: sans-serif; min-width: 220px;">
            <div style="background: ${isHigh ? '#ffe4e6' : '#ffedd5'}; padding: 6px 10px; border-radius: 6px; margin-bottom: 6px;">
              <strong style="color: ${isHigh ? '#be123c' : '#c2410c'}; font-size: 13px;">🚨 ${spot.status.replace('_', ' ')}</strong>
            </div>
            <p style="margin: 3px 0; font-weight: bold; font-size: 13px; color: #1c1917;">${spot.disease}</p>
            <p style="margin: 2px 0; font-size: 12px; color: #57534e;"><strong>Affected Crop:</strong> ${spot.crop}</p>
            <p style="margin: 2px 0; font-size: 12px; color: #57534e;"><strong>Cluster Radius:</strong> ${spot.radiusKm} km</p>
            <p style="margin: 2px 0; font-size: 12px; color: #57534e;"><strong>Reported Cases:</strong> ${spot.reportedCases} farms</p>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #78716c;">Region: ${spot.region}, ${spot.district}</p>
          </div>
        `);
      });
    }

    // 2. Add farm markers
    filteredFarms.forEach(farm => {
      const isSelected = farm.id === selectedFarmId;
      const isHighRisk = farm.riskLevel === 'HIGH' || farm.healthScore < 75;
      const isHealthy = farm.healthScore >= 85;

      const markerColor = isHighRisk ? '#e11d48' : isHealthy ? '#059669' : '#d97706';

      // Custom SVG Marker Icon
      const customIcon = L.divIcon({
        className: 'custom-farm-marker',
        html: `
          <div style="
            background-color: ${markerColor};
            width: ${isSelected ? '32px' : '26px'};
            height: ${isSelected ? '32px' : '26px'};
            border-radius: 50%;
            border: 3px solid #ffffff;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: ${isSelected ? '13px' : '11px'};
            font-weight: bold;
            transition: transform 0.2s ease;
          ">
            ${farm.activeCrops?.[0]?.name?.charAt(0) || 'F'}
          </div>
        `,
        iconSize: [isSelected ? 32 : 26, isSelected ? 32 : 26],
        iconAnchor: [isSelected ? 16 : 13, isSelected ? 16 : 13],
      });

      const marker = L.marker([farm.lat, farm.lng], { icon: customIcon }).addTo(layerGroup);

      const activeCropNames = farm.activeCrops?.map(c => `${c.name} (${c.variety})`).join(', ');

      marker.bindPopup(`
        <div style="font-family: sans-serif; min-width: 230px;">
          <div style="font-size: 14px; font-weight: bold; color: #1c1917; margin-bottom: 2px;">
            ${farm.name}
          </div>
          <div style="font-size: 12px; color: #78716c; margin-bottom: 6px;">
            ${farm.village}, ${farm.taluk}, ${farm.district} (${farm.state})
          </div>
          <div style="display: flex; gap: 8px; margin-bottom: 6px;">
            <span style="background: #ecfdf5; color: #047857; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 600;">
              Health: ${farm.healthScore}%
            </span>
            <span style="background: #f5f5f4; color: #44403c; padding: 2px 6px; border-radius: 4px; font-size: 11px;">
              ${farm.areaAcres} Acres
            </span>
          </div>
          <p style="margin: 2px 0; font-size: 12px; color: #44403c;"><strong>Farmer:</strong> ${farm.farmerName}</p>
          <p style="margin: 2px 0; font-size: 12px; color: #44403c;"><strong>Active Crops:</strong> ${activeCropNames || 'None'}</p>
          <p style="margin: 2px 0; font-size: 12px; color: #44403c;"><strong>Soil:</strong> ${farm.soil?.soilType || 'Unknown'} (pH ${farm.soil?.ph || 'N/A'})</p>
          <p style="margin: 2px 0; font-size: 12px; color: #44403c;"><strong>Irrigation:</strong> ${farm.irrigationType}</p>
        </div>
      `);

      marker.on('click', () => {
        if (onSelectFarm) {
          onSelectFarm(farm);
        }
      });
    });

    // 3. Draw User's Current Location Pin & Accuracy Buffer
    if (currentLocation?.lat && currentLocation?.lng) {
      const isLive = currentLocation.isLiveGPS;
      const userIcon = L.divIcon({
        className: 'custom-user-pin',
        html: `
          <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background-color: rgba(2, 132, 199, 0.35); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 16px; height: 16px; border-radius: 50%; background-color: #0284c7; border: 3px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.35);"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const userMarker = L.marker([currentLocation.lat, currentLocation.lng], { icon: userIcon }).addTo(layerGroup);

      if (currentLocation.accuracyMeters) {
        L.circle([currentLocation.lat, currentLocation.lng], {
          radius: Math.max(60, currentLocation.accuracyMeters),
          color: '#0284c7',
          fillColor: '#38bdf8',
          fillOpacity: 0.12,
          weight: 1.5,
          dashArray: '3, 4',
        }).addTo(layerGroup);
      }

      userMarker.bindPopup(`
        <div style="font-family: sans-serif; min-width: 210px;">
          <div style="background: #e0f2fe; padding: 4px 8px; border-radius: 4px; margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
            <span style="color: #0284c7; font-weight: bold; font-size: 11px;">
              ${isLive ? '📡 REAL-TIME LIVE GPS' : '📍 ACTIVE TELEMETRY ZONE'}
            </span>
          </div>
          <div style="font-size: 13px; font-weight: bold; color: #0f172a;">${currentLocation.displayName}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 3px;">
            Coordinates: ${currentLocation.lat.toFixed(4)}° N, ${currentLocation.lng.toFixed(4)}° E
          </div>
          ${currentLocation.accuracyMeters
          ? `<div style="font-size: 11px; color: #059669; font-weight: 600; margin-top: 2px;">Device Accuracy: ±${currentLocation.accuracyMeters}m</div>`
          : ''
        }
        </div>
      `);
    }

    // If a specific farm was selected, pan to it
    if (selectedFarmId) {
      const selected = farms.find(f => f.id === selectedFarmId);
      if (selected) {
        map.setView([selected.lat, selected.lng], 12, { animate: true });
      }
    }
  }, [isLeafletReady, farms, hotspots, selectedFarmId, activeFilter, currentLocation]);

  const resetView = (centerLat: number, centerLng: number, zoomLevel: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([centerLat, centerLng], zoomLevel, { animate: true });
    }
  };

  const handleLocateUser = async () => {
    const res = await detectLiveLocation();
    if (mapInstanceRef.current && res.success) {
      // Small timeout to ensure state update has propagated
      setTimeout(() => {
        if (mapInstanceRef.current && currentLocation?.lat) {
          mapInstanceRef.current.setView([currentLocation.lat, currentLocation.lng], 13, { animate: true });
        }
      }, 100);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
      {/* Map Control Bar */}
      <div className="p-3 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 font-medium">
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-stone-900">Farm Map</span>
            <span className="text-stone-400">({farms.length} Monitored Farms)</span>
          </div>

          {/* Dedicated Locate Me Button */}
          <button
            onClick={handleLocateUser}
            disabled={isDetecting}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 shadow-2xs text-[11px] ${currentLocation.isLiveGPS
              ? 'bg-sky-600 hover:bg-sky-700 text-white'
              : 'bg-white hover:bg-sky-50 text-sky-800 border border-sky-300'
              }`}
            title="Detect My Live Location & Focus Map"
          >
            <Crosshair className={`w-3.5 h-3.5 ${isDetecting ? 'animate-spin' : ''}`} />
            <span>{isDetecting ? 'Locating...' : 'Locate Me (GPS)'}</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-stone-200">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${activeFilter === 'ALL' ? 'bg-emerald-600 text-white font-semibold' : 'text-stone-600 hover:text-stone-900'
              }`}
          >
            All Farms
          </button>
          <button
            onClick={() => setActiveFilter('HEALTHY')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${activeFilter === 'HEALTHY' ? 'bg-emerald-600 text-white font-semibold' : 'text-stone-600 hover:text-stone-900'
              }`}
          >
            Healthy
          </button>
          <button
            onClick={() => setActiveFilter('AT_RISK')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${activeFilter === 'AT_RISK' ? 'bg-rose-600 text-white font-semibold' : 'text-stone-600 hover:text-stone-900'
              }`}
          >
            At Risk
          </button>
          <button
            onClick={() => setActiveFilter('OUTBREAKS')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${activeFilter === 'OUTBREAKS' ? 'bg-amber-600 text-white font-semibold' : 'text-stone-600 hover:text-stone-900'
              }`}
          >
            Outbreak Clusters
          </button>
        </div>

        {/* Quick Region Zooms */}
        <div className="flex items-center gap-1">
          <span className="text-stone-400 text-[11px] hidden sm:inline">Zoom:</span>
          <button
            onClick={() => resetView(13.1367, 78.1347, 9)}
            className="px-2 py-1 bg-white hover:bg-stone-100 text-stone-700 rounded border border-stone-200 text-[11px] font-medium"
          >
            Kolar (KA)
          </button>
          <button
            onClick={() => resetView(30.9010, 75.8573, 9)}
            className="px-2 py-1 bg-white hover:bg-stone-100 text-stone-700 rounded border border-stone-200 text-[11px] font-medium"
          >
            Ludhiana (PB)
          </button>
          <button
            onClick={() => resetView(16.3067, 80.4365, 9)}
            className="px-2 py-1 bg-white hover:bg-stone-100 text-stone-700 rounded border border-stone-200 text-[11px] font-medium"
          >
            Guntur (AP)
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative">
        <div ref={mapContainerRef} className={`w-full ${heightClass} bg-stone-100`} />

        {/* Floating Legend */}
        <div className="absolute bottom-4 right-4 z-20 bg-white/95 backdrop-blur-xs p-2.5 rounded-xl shadow-md border border-stone-200 text-[11px] text-stone-700 space-y-1.5">
          <div className="font-semibold text-stone-900 border-b border-stone-200 pb-1">Map</div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sky-500 ring-2 ring-sky-300 inline-block"></span>
            <span>Your Location (Live GPS)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"></span>
            <span>Optimal Health (&gt;85%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
            <span>Moderate Health (70-84%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-600 inline-block"></span>
            <span>Critical / Disease Detected</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-400/50 border border-rose-600 border-dashed inline-block"></span>
            <span>Outbreak Buffer Zone</span>
          </div>
        </div>
      </div>
    </div>
  );
};
