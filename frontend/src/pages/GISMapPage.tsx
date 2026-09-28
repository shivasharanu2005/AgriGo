import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  AlertTriangle,
  AreaChart,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  CloudRain,
  Crosshair,
  Droplets,
  Gauge,
  Layers,
  Map as MapIcon,
  MapPin,
  Maximize2,
  Minus,
  Navigation,
  Plus,
  RefreshCw,
  Ruler,
  Satellite,
  Save,
  ShieldAlert,
  Sprout,
  Sun,
  Thermometer,
  Trash2,
  Trees,
  User,
  Waves,
  Wind,
  X,
  Zap,
} from "lucide-react";

import {
  CircleMarker,
  LayersControl,
  MapContainer,
  Polygon,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
  ZoomControl,
} from "react-leaflet";

import type { LatLngExpression } from "leaflet";
import * as L from "leaflet";

import "leaflet/dist/leaflet.css";

import { Farm, DiseaseHotspot } from "../types/index.ts";
import { useLocation } from "../contexts/LocationContext.tsx";
import { LocationSelectorModal } from "../components/LocationSelectorModal.tsx";
import { api } from "../services/api.ts";


/* =========================================================
   TYPES
========================================================= */

type Coordinate = [number, number];

type MapMode = "street" | "satellite";

type RiskLevel = "Low" | "Moderate" | "High" | "Critical";

interface FieldPoint {
  lat: number;
  lng: number;
}

interface FarmMetric {
  label: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  tone: "green" | "blue" | "amber" | "red" | "purple";
}

interface NormalizedFarm {
  farm: Farm;
  coordinates: Coordinate[];
  center: Coordinate | null;
}


/* =========================================================
   CONSTANTS
========================================================= */

const ACRE_TO_SQM = 4046.8564224;
const HECTARE_TO_SQM = 10000;

const DEFAULT_CENTER: Coordinate = [15.3173, 75.7139];

const DEFAULT_ZOOM = 7;

const INDIA_CENTER: Coordinate = [20.5937, 78.9629];


/* =========================================================
   SAFE HELPERS
========================================================= */

const numberValue = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const validLatLng = (lat: unknown, lng: unknown): Coordinate | null => {
  const latitude = numberValue(lat);
  const longitude = numberValue(lng);

  if (
    latitude === null ||
    longitude === null ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return [latitude, longitude];
};

const normalizePoint = (point: unknown): Coordinate | null => {
  if (Array.isArray(point)) {
    if (point.length >= 2) {
      /*
       * GeoJSON = [lng, lat]
       * Leaflet/common frontend = [lat, lng]
       *
       * We detect the structure conservatively.
       */
      const first = numberValue(point[0]);
      const second = numberValue(point[1]);

      if (first === null || second === null) {
        return null;
      }

      /*
       * For GeoJSON coordinates we generally receive:
       * [longitude, latitude]
       */
      if (
        Math.abs(first) > 90 &&
        Math.abs(second) <= 90
      ) {
        return validLatLng(second, first);
      }

      return validLatLng(first, second);
    }
  }

  if (
    typeof point === "object" &&
    point !== null
  ) {
    const objectPoint = point as Record<string, unknown>;

    return validLatLng(
      objectPoint.lat ??
      objectPoint.latitude ??
      objectPoint.Latitude,
      objectPoint.lng ??
      objectPoint.lon ??
      objectPoint.longitude ??
      objectPoint.Longitude
    );
  }

  return null;
};

const normalizeCoordinates = (value: unknown): Coordinate[] => {
  if (!value) return [];

  /*
   * GeoJSON Polygon:
   * {
   *   type: "Polygon",
   *   coordinates: [[[lng,lat], ...]]
   * }
   */
  if (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  ) {
    const objectValue = value as Record<string, unknown>;

    if (objectValue.type === "Feature") {
      const geometry = objectValue.geometry;

      if (
        geometry &&
        typeof geometry === "object"
      ) {
        return normalizeCoordinates(
          (geometry as Record<string, unknown>).coordinates
        );
      }
    }

    if (objectValue.type === "Polygon") {
      return normalizeCoordinates(objectValue.coordinates);
    }

    const possibleKeys = [
      "coordinates",
      "boundary",
      "polygon",
      "geometry",
      "boundaryCoordinates",
      "gpsCoordinates",
      "gps_points",
      "gpsPoints",
      "points",
      "location",
    ];

    for (const key of possibleKeys) {
      if (objectValue[key]) {
        const result = normalizeCoordinates(objectValue[key]);

        if (result.length >= 2) {
          return result;
        }
      }
    }

    const point = normalizePoint(value);

    return point ? [point] : [];
  }

  if (!Array.isArray(value)) {
    return [];
  }

  /*
   * GeoJSON Polygon nested array:
   * [[[lng,lat], [lng,lat]]]
   */
  if (
    value.length > 0 &&
    Array.isArray(value[0]) &&
    Array.isArray(value[0][0])
  ) {
    return normalizeCoordinates(value[0]);
  }

  return value
    .map((item) => normalizePoint(item))
    .filter(
      (item): item is Coordinate => item !== null
    );
};

const getFarmCoordinates = (farm: Farm): Coordinate[] => {
  const rawFarm = farm as unknown as Record<string, unknown>;

  const possibleSources = [
    rawFarm.coordinates,
    rawFarm.boundary,
    rawFarm.polygon,
    rawFarm.geometry,
    rawFarm.boundaryCoordinates,
    rawFarm.gpsCoordinates,
    rawFarm.gps_points,
    rawFarm.gpsPoints,
    rawFarm.location,
  ];

  for (const source of possibleSources) {
    const coordinates = normalizeCoordinates(source);

    if (coordinates.length >= 2) {
      return coordinates;
    }
  }

  const lat =
    rawFarm.latitude ??
    rawFarm.lat ??
    rawFarm.centerLatitude;

  const lng =
    rawFarm.longitude ??
    rawFarm.lng ??
    rawFarm.lon ??
    rawFarm.centerLongitude;

  const point = validLatLng(lat, lng);

  return point ? [point] : [];
};

const calculateArea = (
  coordinates: Coordinate[]
): number => {
  if (coordinates.length < 3) return 0;

  /*
   * Spherical polygon area approximation.
   * This avoids requiring another Turf package at runtime.
   * It is suitable for farm-level measurements.
   */
  const earthRadius = 6378137;

  let area = 0;

  for (let i = 0; i < coordinates.length; i++) {
    const j =
      (i + 1) % coordinates.length;

    const [lat1, lon1] = coordinates[i];
    const [lat2, lon2] = coordinates[j];

    const lat1Rad = (lat1 * Math.PI) / 180;
    const lat2Rad = (lat2 * Math.PI) / 180;

    const lon1Rad = (lon1 * Math.PI) / 180;
    const lon2Rad = (lon2 * Math.PI) / 180;

    area +=
      (lon2Rad - lon1Rad) *
      (2 +
        Math.sin(lat1Rad) +
        Math.sin(lat2Rad));
  }

  area =
    Math.abs(area) *
    earthRadius *
    earthRadius /
    2;

  return area;
};

const areaToAcres = (sqm: number) =>
  sqm / ACRE_TO_SQM;

const areaToHectares = (sqm: number) =>
  sqm / HECTARE_TO_SQM;

const formatNumber = (
  value: number,
  digits = 2
) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: digits,
  }).format(value);

const calculateCenter = (
  coordinates: Coordinate[]
): Coordinate | null => {
  if (!coordinates.length) return null;

  const lat =
    coordinates.reduce(
      (sum, point) => sum + point[0],
      0
    ) / coordinates.length;

  const lng =
    coordinates.reduce(
      (sum, point) => sum + point[1],
      0
    ) / coordinates.length;

  return [lat, lng];
};


/* =========================================================
   RISK
========================================================= */

const riskFromHealth = (
  health: number
): RiskLevel => {
  if (health >= 80) return "Low";
  if (health >= 60) return "Moderate";
  if (health >= 40) return "High";
  return "Critical";
};

const riskClass = (
  risk: RiskLevel
) => {
  switch (risk) {
    case "Low":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";

    case "Moderate":
      return "bg-amber-100 text-amber-700 border-amber-200";

    case "High":
      return "bg-orange-100 text-orange-700 border-orange-200";

    case "Critical":
      return "bg-red-100 text-red-700 border-red-200";
  }
};


/* =========================================================
   MAP RECENTER
========================================================= */

const MapRecenter: React.FC<{
  center: Coordinate | null;
}> = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (!center) return;

    map.flyTo(center as LatLngExpression, 15, {
      duration: 1.2,
    });
  }, [center, map]);

  return null;
};


/* =========================================================
   MAP RESIZE
========================================================= */

const MapResizeHandler: React.FC = () => {
  const map = useMap();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      window.clearTimeout(timer);
    };
  }, [map]);

  return null;
};


/* =========================================================
   KPI CARD
========================================================= */

const MetricCard: React.FC<{
  metric: FarmMetric;
}> = ({ metric }) => {
  const toneClasses = {
    green:
      "bg-emerald-50 text-emerald-700 border-emerald-100",
    blue:
      "bg-sky-50 text-sky-700 border-sky-100",
    amber:
      "bg-amber-50 text-amber-700 border-amber-100",
    red:
      "bg-red-50 text-red-700 border-red-100",
    purple:
      "bg-violet-50 text-violet-700 border-violet-100",
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-emerald-50 opacity-60 transition-transform duration-500 group-hover:scale-150" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400">
            {metric.label}
          </p>

          <div className="mt-2 text-xl font-black text-stone-900">
            {metric.value}
          </div>

          <p className="mt-1 text-[11px] font-medium text-stone-500">
            {metric.subtitle}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl border ${toneClasses[metric.tone]}`}
        >
          {metric.icon}
        </div>
      </div>
    </div>
  );
};


/* =========================================================
   MAIN COMPONENT
========================================================= */

export const GISMapPage: React.FC = () => {
  const {
    currentLocation,
    isDetecting,
    detectLiveLocation,
  } = useLocation();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [hotspots, setHotspots] =
    useState<DiseaseHotspot[]>([]);

  const [selectedFarm, setSelectedFarm] =
    useState<Farm | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [mapMode, setMapMode] =
    useState<MapMode>("street");

  const [showLocationModal, setShowLocationModal] =
    useState(false);

  const [showDiseaseLayer, setShowDiseaseLayer] =
    useState(true);

  const [showFarmLayer, setShowFarmLayer] =
    useState(true);

  const [showMeasurement, setShowMeasurement] =
    useState(false);

  const [measurementPoints, setMeasurementPoints] =
    useState<Coordinate[]>([]);

  const [saving, setSaving] =
    useState(false);

  const [saveMessage, setSaveMessage] =
    useState<string | null>(null);

  const [gpsPoint, setGpsPoint] =
    useState<Coordinate | null>(null);

  const [gpsAccuracy, setGpsAccuracy] =
    useState<number | null>(null);

  const [search, setSearch] =
    useState("");

  const [showInsights, setShowInsights] =
    useState(true);


  /* =======================================================
     LOAD GIS DATA
  ======================================================= */

  const loadGISData = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const [farmResponse, hotspotResponse] =
          await Promise.all([
            api.getFarms(),
            api.getHotspots(),
          ]);

        const farmList = Array.isArray(farmResponse)
          ? farmResponse
          : [];

        const hotspotList =
          Array.isArray(hotspotResponse)
            ? hotspotResponse
            : [];

        setFarms(farmList);
        setHotspots(hotspotList);

        setSelectedFarm((previous) => {
          if (!farmList.length) {
            return null;
          }

          if (!previous) {
            return farmList[0];
          }

          const updated =
            farmList.find(
              (farm) =>
                String(farm.id) ===
                String(previous.id)
            );

          return updated || farmList[0];
        });
      } catch (err) {
        console.error(
          "AgriGo GIS loading error:",
          err
        );

        setError(
          "Farm GIS data could not be loaded. Your map is still available, but live farm data needs attention."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );


  useEffect(() => {
    void loadGISData();
  }, [loadGISData]);


  /* =======================================================
     GPS
  ======================================================= */

  const locateUser = async () => {
    try {
      await detectLiveLocation();

      if (
        currentLocation?.lat !== undefined &&
        currentLocation?.lng !== undefined
      ) {
        const point = validLatLng(
          currentLocation.lat,
          currentLocation.lng
        );

        if (point) {
          setGpsPoint(point);
        }
      }
    } catch (err) {
      console.error(
        "GPS location failed:",
        err
      );
    }
  };


  useEffect(() => {
    if (
      currentLocation?.lat !== undefined &&
      currentLocation?.lng !== undefined
    ) {
      const point = validLatLng(
        currentLocation.lat,
        currentLocation.lng
      );

      if (point) {
        setGpsPoint(point);
      }
    }

    const locationRecord =
      currentLocation as unknown as Record<
        string,
        unknown
      > | null;

    const accuracy =
      numberValue(
        locationRecord?.accuracy
      );

    if (accuracy !== null) {
      setGpsAccuracy(accuracy);
    }
  }, [currentLocation]);


  /* =======================================================
     FARM NORMALIZATION
  ======================================================= */

  const normalizedFarms =
    useMemo<NormalizedFarm[]>(() => {
      return farms.map((farm) => {
        const coordinates =
          getFarmCoordinates(farm);

        return {
          farm,
          coordinates,
          center:
            calculateCenter(coordinates),
        };
      });
    }, [farms]);


  const selectedFarmData =
    useMemo(() => {
      if (!selectedFarm) return null;

      return (
        normalizedFarms.find(
          (item) =>
            String(item.farm.id) ===
            String(selectedFarm.id)
        ) || null
      );
    }, [normalizedFarms, selectedFarm]);


  /* =======================================================
     SEARCH
  ======================================================= */

  const filteredFarms =
    useMemo(() => {
      const term =
        search.trim().toLowerCase();

      if (!term) return farms;

      return farms.filter((farm) => {
        const raw =
          farm as unknown as Record<
            string,
            unknown
          >;

        return [
          farm.name,
          farm.village,
          farm.district,
          farm.state,
          farm.farmerName,
          raw.crop,
          raw.variety,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term);
      });
    }, [farms, search]);


  /* =======================================================
     SELECTED FARM DATA
  ======================================================= */

  const selectedHealth =
    Number(
      selectedFarm?.healthScore ?? 0
    );

  const selectedRisk =
    riskFromHealth(selectedHealth);

  const selectedArea =
    Number(
      selectedFarm?.areaAcres ?? 0
    );

  const selectedSoil =
    selectedFarm?.soil;

  const selectedCoordinates =
    selectedFarmData?.coordinates ?? [];

  const calculatedAreaSqm =
    measurementPoints.length >= 3
      ? calculateArea(measurementPoints)
      : 0;

  const calculatedAcres =
    areaToAcres(calculatedAreaSqm);

  const calculatedHectares =
    areaToHectares(calculatedAreaSqm);


  /* =======================================================
     MAP CENTER
  ======================================================= */

  const mapCenter =
    selectedFarmData?.center ||
    gpsPoint ||
    DEFAULT_CENTER;


  /* =======================================================
     MAP CLICK MEASUREMENT
  ======================================================= */

  const MapMeasurementHandler: React.FC = () => {
    const map = useMap();

    useEffect(() => {
      if (!showMeasurement) {
        map.getContainer().style.cursor =
          "default";

        return;
      }

      map.getContainer().style.cursor =
        "crosshair";

      const handleClick = (
        event: L.LeafletMouseEvent
      ) => {
        setMeasurementPoints(
          (previous) => [
            ...previous,
            [
              event.latlng.lat,
              event.latlng.lng,
            ],
          ]
        );
      };

      map.on("click", handleClick);

      return () => {
        map.off("click", handleClick);
        map.getContainer().style.cursor =
          "default";
      };
    }, [map]);

    return null;
  };


  /* =======================================================
     SAVE FIELD
  ======================================================= */

  const saveMeasurement = async () => {
    if (
      !selectedFarm ||
      measurementPoints.length < 3
    ) {
      setSaveMessage(
        "Select a farm and create at least 3 boundary points."
      );

      return;
    }

    setSaving(true);
    setSaveMessage(null);

    try {
      /*
       * We intentionally do not invent an API endpoint.
       * If the existing API exposes a field/boundary
       * persistence method, use it.
       */
      const apiObject =
        api as unknown as Record<
          string,
          unknown
        >;

      const possibleSaveMethods = [
        "createFarmField",
        "createField",
        "saveFarmField",
        "saveField",
        "updateFarmBoundary",
        "saveFarmBoundary",
      ];

      const methodName =
        possibleSaveMethods.find(
          (name) =>
            typeof apiObject[name] ===
            "function"
        );

      if (!methodName) {
        throw new Error(
          "No existing farm-field persistence API is exposed by services/api.ts."
        );
      }

      const method =
        apiObject[methodName] as (
          ...args: unknown[]
        ) => Promise<unknown>;

      await method(
        selectedFarm.id,
        {
          coordinates:
            measurementPoints,
          areaSqm:
            calculatedAreaSqm,
          areaAcres:
            calculatedAcres,
          areaHectares:
            calculatedHectares,
        }
      );

      setSaveMessage(
        "Field boundary saved successfully."
      );

      await loadGISData(true);
    } catch (err) {
      console.error(
        "Field save error:",
        err
      );

      setSaveMessage(
        "Field boundary was measured, but the existing backend does not currently expose a compatible field-save API."
      );
    } finally {
      setSaving(false);
    }
  };


  /* =======================================================
     CLEAR MEASUREMENT
  ======================================================= */

  const clearMeasurement = () => {
    setMeasurementPoints([]);
    setSaveMessage(null);
  };


  /* =======================================================
     METRICS
  ======================================================= */

  const metrics: FarmMetric[] =
    useMemo(() => {
      const totalAcres = farms.reduce(
        (sum, farm) =>
          sum +
          Number(farm.areaAcres || 0),
        0
      );

      const healthAverage =
        farms.length > 0
          ? farms.reduce(
            (sum, farm) =>
              sum +
              Number(
                farm.healthScore || 0
              ),
            0
          ) / farms.length
          : 0;

      const cropCount =
        farms.reduce(
          (sum, farm) =>
            sum +
            (farm.activeCrops?.length || 0),
          0
        );

      return [
        {
          label: "Mapped Area",
          value: `${formatNumber(
            totalAcres
          )} ac`,
          subtitle: `${farms.length} registered farm${farms.length === 1 ? "" : "s"}`,
          icon: (
            <AreaChart className="h-5 w-5" />
          ),
          tone: "green",
        },
        {
          label: "Farm Vigour",
          value: `${formatNumber(
            healthAverage,
            0
          )}%`,
          subtitle: "Current crop health",
          icon: (
            <Activity className="h-5 w-5" />
          ),
          tone: "blue",
        },
        {
          label: "Active Crops",
          value: String(cropCount),
          subtitle: "Crops under cultivation",
          icon: (
            <Sprout className="h-5 w-5" />
          ),
          tone: "green",
        },
        {
          label: "Disease Alerts",
          value: String(
            hotspots.length
          ),
          subtitle: "Detected GIS hotspots",
          icon: (
            <ShieldAlert className="h-5 w-5" />
          ),
          tone:
            hotspots.length > 0
              ? "red"
              : "green",
        },
        {
          label: "GPS",
          value: gpsPoint
            ? "LIVE"
            : "OFF",
          subtitle: gpsAccuracy
            ? `${formatNumber(
              gpsAccuracy,
              0
            )} m accuracy`
            : "Location status",
          icon: (
            <Crosshair className="h-5 w-5" />
          ),
          tone: gpsPoint
            ? "blue"
            : "amber",
        },
      ];
    }, [
      farms,
      hotspots.length,
      gpsPoint,
      gpsAccuracy,
    ]);


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f8f4] via-white to-[#eef8f1] px-3 py-5 sm:px-5 lg:px-7">

      <div className="mx-auto max-w-[1600px] space-y-5">

        {/* =================================================
            HERO HEADER
        ================================================= */}

        <section className="relative overflow-hidden rounded-[28px] border border-emerald-900/10 bg-gradient-to-br from-[#075e49] via-[#08745b] to-[#0c8a68] p-5 text-white shadow-xl sm:p-7">

          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

          <div className="absolute -bottom-24 left-1/3 h-60 w-60 rounded-full bg-lime-300/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div className="max-w-3xl">

              <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-100">
                <MapIcon className="h-4 w-4" />
                AgriGo Geospatial Intelligence
              </div>

              <h1 className="text-2xl font-black tracking-tight sm:text-4xl">
                Farm GIS & Field Intelligence
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50/90">
                Map farm boundaries, inspect crop health,
                measure fields, monitor disease hotspots
                and connect location intelligence with
                real agricultural decisions.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">

                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold backdrop-blur">
                  GPS Enabled
                </span>

                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold backdrop-blur">
                  Field Measurement
                </span>

                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold backdrop-blur">
                  Disease Mapping
                </span>

                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold backdrop-blur">
                  Soil Intelligence
                </span>

              </div>
            </div>


            {/* GPS ACTIONS */}

            <div className="flex flex-wrap gap-2">

              <button
                type="button"
                onClick={locateUser}
                disabled={isDetecting}
                className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-xs font-bold backdrop-blur transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Crosshair
                  className={`h-4 w-4 ${isDetecting
                      ? "animate-spin"
                      : ""
                    }`}
                />

                {isDetecting
                  ? "Locating..."
                  : gpsPoint
                    ? "GPS Active"
                    : "Locate Me"}
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowLocationModal(true)
                }
                className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-bold text-emerald-800 shadow-lg transition hover:-translate-y-0.5"
              >
                <MapPin className="h-4 w-4" />
                {currentLocation?.displayName
                  ?.split(",")[0] ||
                  "Select Location"}
              </button>

            </div>
          </div>
        </section>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 shadow-sm">

            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

            <div className="flex-1">

              <div className="text-sm font-bold">
                GIS data connection warning
              </div>

              <div className="mt-1 text-xs leading-5 text-amber-800">
                {error}
              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                void loadGISData(true)
              }
              className="rounded-lg bg-white px-3 py-2 text-xs font-bold shadow-sm"
            >
              Retry
            </button>

          </div>
        )}


        {/* =================================================
            KPI GRID
        ================================================= */}

        <section className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">

          {metrics.map((metric) => (
            <MetricCard
              key={metric.label}
              metric={metric}
            />
          ))}

        </section>


        {/* =================================================
            MAIN WORKSPACE
        ================================================= */}

        <section className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)_340px]">


          {/* ===============================================
              LEFT FARM EXPLORER
          =============================================== */}

          <aside className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">

            <div className="border-b border-stone-100 p-4">

              <div className="flex items-center justify-between">

                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-600">
                    Farm Registry
                  </div>

                  <h2 className="mt-1 text-sm font-black text-stone-900">
                    Your Farm Parcels
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    void loadGISData(true)
                  }
                  className="rounded-lg p-2 text-stone-500 transition hover:bg-stone-100 hover:text-emerald-700"
                  title="Refresh farms"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${refreshing
                        ? "animate-spin"
                        : ""
                      }`}
                  />
                </button>

              </div>


              <div className="relative mt-3">

                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search farm, village..."
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pl-9 pr-3 text-xs outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />

              </div>

            </div>


            <div className="max-h-[600px] overflow-y-auto p-3">

              {loading ? (
                <div className="space-y-3">

                  {[1, 2, 3].map(
                    (item) => (
                      <div
                        key={item}
                        className="h-24 animate-pulse rounded-xl bg-stone-100"
                      />
                    )
                  )}

                </div>
              ) : filteredFarms.length === 0 ? (

                <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-6 text-center">

                  <Trees className="mx-auto h-9 w-9 text-emerald-500" />

                  <div className="mt-3 text-sm font-bold text-stone-800">
                    No farm registered
                  </div>

                  <p className="mt-1 text-[11px] leading-5 text-stone-500">
                    Register your farm or use GPS to
                    begin field mapping.
                  </p>

                  <button
                    type="button"
                    onClick={locateUser}
                    className="mt-4 w-full rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
                  >
                    Use GPS Location
                  </button>

                </div>

              ) : (

                <div className="space-y-2">

                  {filteredFarms.map(
                    (farm) => {

                      const active =
                        String(
                          selectedFarm?.id
                        ) ===
                        String(farm.id);

                      const health =
                        Number(
                          farm.healthScore ||
                          0
                        );

                      const risk =
                        riskFromHealth(
                          health
                        );

                      return (
                        <button
                          key={String(
                            farm.id
                          )}
                          type="button"
                          onClick={() =>
                            setSelectedFarm(
                              farm
                            )
                          }
                          className={`group w-full rounded-xl border p-3 text-left transition-all ${active
                              ? "border-emerald-400 bg-emerald-50 shadow-sm"
                              : "border-stone-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/40"
                            }`}
                        >

                          <div className="flex items-start justify-between gap-2">

                            <div className="min-w-0">

                              <div className="truncate text-xs font-black text-stone-900">
                                {farm.name ||
                                  "Unnamed Farm"}
                              </div>

                              <div className="mt-1 flex items-center gap-1 text-[10px] text-stone-500">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">
                                  {farm.village ||
                                    "Village"}
                                  ,{" "}
                                  {farm.district ||
                                    "District"}
                                </span>
                              </div>

                            </div>

                            <span
                              className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-bold ${riskClass(
                                risk
                              )}`}
                            >
                              {risk}
                            </span>

                          </div>


                          <div className="mt-3 grid grid-cols-3 gap-1.5">

                            <div className="rounded-lg bg-white/70 p-2">

                              <div className="text-[9px] text-stone-400">
                                AREA
                              </div>

                              <div className="mt-0.5 text-[11px] font-black text-stone-800">
                                {farm.areaAcres ||
                                  0}{" "}
                                ac
                              </div>

                            </div>


                            <div className="rounded-lg bg-white/70 p-2">

                              <div className="text-[9px] text-stone-400">
                                HEALTH
                              </div>

                              <div className="mt-0.5 text-[11px] font-black text-emerald-700">
                                {health}%
                              </div>

                            </div>


                            <div className="rounded-lg bg-white/70 p-2">

                              <div className="text-[9px] text-stone-400">
                                CROPS
                              </div>

                              <div className="mt-0.5 text-[11px] font-black text-stone-800">
                                {farm.activeCrops
                                  ?.length ||
                                  0}
                              </div>

                            </div>

                          </div>

                        </button>
                      );
                    }
                  )}

                </div>
              )}

            </div>

          </aside>


          {/* ===============================================
              MAP
          =============================================== */}

          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">

            {/* MAP TOOLBAR */}

            <div className="flex flex-col gap-3 border-b border-stone-100 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-2">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Layers className="h-4 w-4" />
                </div>

                <div>

                  <div className="text-xs font-black text-stone-900">
                    Live Farm Map
                  </div>

                  <div className="text-[10px] text-stone-500">
                    {selectedFarm?.name ||
                      "Select a farm parcel"}
                  </div>

                </div>

              </div>


              <div className="flex flex-wrap items-center gap-1.5">

                <button
                  type="button"
                  onClick={() =>
                    setShowFarmLayer(
                      (value) => !value
                    )
                  }
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-[10px] font-bold ${showFarmLayer
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-stone-200 bg-white text-stone-500"
                    }`}
                >
                  <Trees className="h-3.5 w-3.5" />
                  Farms
                </button>


                <button
                  type="button"
                  onClick={() =>
                    setShowDiseaseLayer(
                      (value) => !value
                    )
                  }
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-[10px] font-bold ${showDiseaseLayer
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-stone-200 bg-white text-stone-500"
                    }`}
                >
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Disease
                </button>


                <button
                  type="button"
                  onClick={() => {
                    setShowMeasurement(
                      (value) => !value
                    );
                    setSaveMessage(null);
                  }}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-[10px] font-bold ${showMeasurement
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : "border-stone-200 bg-white text-stone-500"
                    }`}
                >
                  <Ruler className="h-3.5 w-3.5" />
                  Measure
                </button>


                <button
                  type="button"
                  onClick={locateUser}
                  className="flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-2 text-[10px] font-bold text-sky-700"
                >
                  <Crosshair className="h-3.5 w-3.5" />
                  GPS
                </button>

              </div>

            </div>


            {/* MAP CONTAINER */}

            <div className="relative h-[560px] w-full">

              <MapContainer
                center={
                  mapCenter as LatLngExpression
                }
                zoom={DEFAULT_ZOOM}
                minZoom={4}
                maxZoom={20}
                scrollWheelZoom
                zoomControl={false}
                className="z-0 h-full w-full"
                style={{
                  minHeight: "560px",
                  width: "100%",
                }}
              >

                <ZoomControl position="bottomright" />

                <MapResizeHandler />

                <MapRecenter
                  center={mapCenter}
                />

                <MapMeasurementHandler />


                <LayersControl
                  position="topright"
                >

                  <LayersControl.BaseLayer
                    checked={
                      mapMode === "street"
                    }
                    name="Street Map"
                  >
                    <TileLayer
                      attribution="&copy; OpenStreetMap contributors"
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                  </LayersControl.BaseLayer>


                  <LayersControl.BaseLayer
                    checked={
                      mapMode === "satellite"
                    }
                    name="Satellite"
                  >
                    <TileLayer
                      attribution="Tiles &copy; Esri"
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    />
                  </LayersControl.BaseLayer>

                </LayersControl>


                {/* FARM POLYGONS */}

                {showFarmLayer &&
                  normalizedFarms.map(
                    ({
                      farm,
                      coordinates,
                      center,
                    }) => {

                      if (
                        coordinates.length <
                        3
                      ) {
                        if (!center) {
                          return null;
                        }

                        return (
                          <CircleMarker
                            key={`point-${String(
                              farm.id
                            )}`}
                            center={
                              center as LatLngExpression
                            }
                            radius={
                              String(
                                farm.id
                              ) ===
                                String(
                                  selectedFarm?.id
                                )
                                ? 10
                                : 7
                            }
                            pathOptions={{
                              color:
                                "#047857",
                              fillColor:
                                "#10b981",
                              fillOpacity:
                                0.8,
                              weight: 2,
                            }}
                            eventHandlers={{
                              click: () =>
                                setSelectedFarm(
                                  farm
                                ),
                            }}
                          >
                            <Tooltip>
                              {farm.name ||
                                "Farm"}{" "}
                              •{" "}
                              {farm.areaAcres ||
                                0}{" "}
                              acres
                            </Tooltip>
                          </CircleMarker>
                        );
                      }

                      const isSelected =
                        String(
                          farm.id
                        ) ===
                        String(
                          selectedFarm?.id
                        );

                      return (
                        <Polygon
                          key={`farm-${String(
                            farm.id
                          )}`}
                          positions={
                            coordinates as LatLngExpression[]
                          }
                          pathOptions={{
                            color: isSelected
                              ? "#047857"
                              : "#10b981",
                            fillColor:
                              isSelected
                                ? "#10b981"
                                : "#34d399",
                            fillOpacity:
                              isSelected
                                ? 0.28
                                : 0.16,
                            weight:
                              isSelected
                                ? 4
                                : 2,
                          }}
                          eventHandlers={{
                            click: () =>
                              setSelectedFarm(
                                farm
                              ),
                          }}
                        >
                          <Tooltip sticky>
                            <strong>
                              {farm.name ||
                                "Farm"}
                            </strong>
                            <br />
                            {farm.areaAcres ||
                              0}{" "}
                            acres
                          </Tooltip>

                          <Popup>
                            <div className="min-w-[180px]">

                              <div className="text-sm font-bold">
                                {farm.name ||
                                  "Farm"}
                              </div>

                              <div className="mt-1 text-xs">
                                {farm.village ||
                                  "Village"}
                                ,{" "}
                                {farm.district ||
                                  "District"}
                              </div>

                              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">

                                <div>
                                  <div className="text-gray-400">
                                    Area
                                  </div>
                                  <strong>
                                    {farm.areaAcres ||
                                      0}{" "}
                                    ac
                                  </strong>
                                </div>

                                <div>
                                  <div className="text-gray-400">
                                    Health
                                  </div>
                                  <strong>
                                    {farm.healthScore ||
                                      0}
                                    %
                                  </strong>
                                </div>

                              </div>

                            </div>
                          </Popup>
                        </Polygon>
                      );
                    }
                  )}


                {/* GPS */}

                {gpsPoint && (
                  <CircleMarker
                    center={
                      gpsPoint as LatLngExpression
                    }
                    radius={9}
                    pathOptions={{
                      color: "#0284c7",
                      fillColor: "#38bdf8",
                      fillOpacity: 0.95,
                      weight: 3,
                    }}
                  >
                    <Tooltip>
                      Your live GPS location
                      {gpsAccuracy
                        ? ` • ±${formatNumber(
                          gpsAccuracy,
                          0
                        )}m`
                        : ""}
                    </Tooltip>
                  </CircleMarker>
                )}


                {/* DISEASE HOTSPOTS */}

                {showDiseaseLayer &&
                  hotspots.map(
                    (hotspot, index) => {

                      const raw =
                        hotspot as unknown as Record<
                          string,
                          unknown
                        >;

                      const point =
                        normalizePoint(
                          hotspot
                        ) ||
                        validLatLng(
                          raw.latitude ??
                          raw.lat ??
                          raw.centerLatitude,
                          raw.longitude ??
                          raw.lng ??
                          raw.lon ??
                          raw.centerLongitude
                        );

                      if (!point) {
                        return null;
                      }

                      const severity =
                        String(
                          raw.severity ??
                          raw.risk ??
                          "Moderate"
                        );

                      const color =
                        severity
                          .toLowerCase()
                          .includes("high") ||
                          severity
                            .toLowerCase()
                            .includes(
                              "critical"
                            )
                          ? "#dc2626"
                          : "#f59e0b";

                      return (
                        <CircleMarker
                          key={`hotspot-${index}`}
                          center={
                            point as LatLngExpression
                          }
                          radius={13}
                          pathOptions={{
                            color,
                            fillColor: color,
                            fillOpacity: 0.24,
                            weight: 2,
                          }}
                        >
                          <Tooltip>
                            Disease hotspot
                          </Tooltip>

                          <Popup>

                            <div className="min-w-[180px]">

                              <div className="flex items-center gap-2">

                                <ShieldAlert className="h-4 w-4 text-red-600" />

                                <strong>
                                  Disease Risk Area
                                </strong>

                              </div>

                              <div className="mt-2 text-xs">
                                Severity:{" "}
                                <strong>
                                  {severity}
                                </strong>
                              </div>

                              {raw.disease && (
                                <div className="mt-1 text-xs">
                                  Disease:{" "}
                                  <strong>
                                    {String(
                                      raw.disease
                                    )}
                                  </strong>
                                </div>
                              )}

                            </div>

                          </Popup>
                        </CircleMarker>
                      );
                    }
                  )}


                {/* MEASUREMENT */}

                {measurementPoints.length >
                  0 && (
                    <>
                      {measurementPoints.map(
                        (point, index) => (
                          <CircleMarker
                            key={`measure-${index}`}
                            center={
                              point as LatLngExpression
                            }
                            radius={6}
                            pathOptions={{
                              color: "#2563eb",
                              fillColor:
                                "#60a5fa",
                              fillOpacity: 1,
                              weight: 2,
                            }}
                          >
                            <Tooltip>
                              Point {index + 1}
                            </Tooltip>
                          </CircleMarker>
                        )
                      )}

                      {measurementPoints.length >=
                        2 && (
                          <Polygon
                            positions={
                              measurementPoints as LatLngExpression[]
                            }
                            pathOptions={{
                              color: "#2563eb",
                              fillColor:
                                "#60a5fa",
                              fillOpacity: 0.18,
                              weight: 3,
                              dashArray:
                                "8 6",
                            }}
                          />
                        )}
                    </>
                  )}

              </MapContainer>


              {/* MAP STATUS */}

              <div className="pointer-events-none absolute left-3 top-3 z-[500]">

                <div className="flex items-center gap-2 rounded-full border border-white/60 bg-white/90 px-3 py-2 text-[10px] font-bold text-stone-700 shadow-lg backdrop-blur">

                  <span
                    className={`h-2 w-2 rounded-full ${gpsPoint
                        ? "animate-pulse bg-sky-500"
                        : "bg-stone-300"
                      }`}
                  />

                  {gpsPoint
                    ? "LIVE GPS"
                    : "GIS READY"}

                </div>

              </div>


              {/* MEASUREMENT PANEL */}

              {showMeasurement && (
                <div className="absolute bottom-4 left-4 right-4 z-[500]">

                  <div className="rounded-2xl border border-blue-200 bg-white/95 p-4 shadow-2xl backdrop-blur">

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                      <div>

                        <div className="flex items-center gap-2">

                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                            <Ruler className="h-4 w-4" />
                          </div>

                          <div>
                            <div className="text-xs font-black text-stone-900">
                              Field Boundary Measurement
                            </div>

                            <div className="text-[10px] text-stone-500">
                              Click the map to create
                              boundary points
                            </div>
                          </div>

                        </div>

                      </div>


                      <div className="grid grid-cols-3 gap-2">

                        <div className="rounded-lg bg-blue-50 px-3 py-2 text-center">
                          <div className="text-[9px] text-blue-500">
                            SQ.M
                          </div>
                          <div className="text-xs font-black text-blue-800">
                            {formatNumber(
                              calculatedAreaSqm
                            )}
                          </div>
                        </div>

                        <div className="rounded-lg bg-emerald-50 px-3 py-2 text-center">
                          <div className="text-[9px] text-emerald-500">
                            ACRES
                          </div>
                          <div className="text-xs font-black text-emerald-800">
                            {formatNumber(
                              calculatedAcres
                            )}
                          </div>
                        </div>

                        <div className="rounded-lg bg-amber-50 px-3 py-2 text-center">
                          <div className="text-[9px] text-amber-500">
                            HECTARES
                          </div>
                          <div className="text-xs font-black text-amber-800">
                            {formatNumber(
                              calculatedHectares
                            )}
                          </div>
                        </div>

                      </div>


                      <div className="flex gap-2">

                        <button
                          type="button"
                          onClick={
                            clearMeasurement
                          }
                          className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-2 text-[10px] font-bold text-stone-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Clear
                        </button>

                        <button
                          type="button"
                          disabled={
                            saving ||
                            measurementPoints.length <
                            3
                          }
                          onClick={
                            saveMeasurement
                          }
                          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-[10px] font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Save className="h-3.5 w-3.5" />
                          {saving
                            ? "Saving..."
                            : "Save Field"}
                        </button>

                      </div>

                    </div>


                    {saveMessage && (
                      <div className="mt-3 rounded-lg bg-stone-50 px-3 py-2 text-[10px] font-medium text-stone-600">
                        {saveMessage}
                      </div>
                    )}

                  </div>

                </div>
              )}

            </div>

          </div>


          {/* ===============================================
              RIGHT INTELLIGENCE PANEL
          =============================================== */}

          <aside className="space-y-4">

            {/* SELECTED FARM */}

            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">

              <div className="bg-gradient-to-br from-emerald-50 to-white p-4">

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-2">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                      <Sprout className="h-4 w-4" />
                    </div>

                    <div>

                      <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-emerald-600">
                        Selected Farm
                      </div>

                      <div className="max-w-[190px] truncate text-sm font-black text-stone-900">
                        {selectedFarm?.name ||
                          "No farm selected"}
                      </div>

                    </div>

                  </div>

                  <ChevronDown className="h-4 w-4 text-stone-400" />

                </div>

              </div>


              {selectedFarm ? (
                <div className="space-y-4 p-4">

                  {/* HEALTH */}

                  <div>

                    <div className="flex items-center justify-between">

                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                        Farm Vigour
                      </span>

                      <span
                        className={`rounded-full border px-2 py-1 text-[9px] font-bold ${riskClass(
                          selectedRisk
                        )}`}
                      >
                        {selectedRisk}
                      </span>

                    </div>

                    <div className="mt-2 flex items-end gap-2">

                      <span className="text-3xl font-black text-emerald-700">
                        {selectedHealth}%
                      </span>

                      <span className="mb-1 text-[10px] text-stone-400">
                        current health
                      </span>

                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100">

                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(
                              0,
                              selectedHealth
                            )
                          )}%`,
                        }}
                      />

                    </div>

                  </div>


                  {/* FARM INFORMATION */}

                  <div className="grid grid-cols-2 gap-2">

                    <div className="rounded-xl border border-stone-100 bg-stone-50 p-3">

                      <div className="text-[9px] font-bold uppercase text-stone-400">
                        Area
                      </div>

                      <div className="mt-1 text-sm font-black text-stone-900">
                        {selectedArea} ac
                      </div>

                    </div>


                    <div className="rounded-xl border border-stone-100 bg-stone-50 p-3">

                      <div className="text-[9px] font-bold uppercase text-stone-400">
                        Irrigation
                      </div>

                      <div className="mt-1 truncate text-sm font-black text-stone-900">
                        {selectedFarm.irrigationType ||
                          "Unknown"}
                      </div>

                    </div>

                  </div>


                  {/* LOCATION */}

                  <div className="rounded-xl border border-sky-100 bg-sky-50 p-3">

                    <div className="flex items-center gap-2">

                      <Navigation className="h-4 w-4 text-sky-600" />

                      <div>

                        <div className="text-[9px] font-bold uppercase tracking-wider text-sky-500">
                          Farm Location
                        </div>

                        <div className="mt-1 text-xs font-bold text-sky-900">
                          {selectedFarm.village ||
                            "Village"}
                          ,{" "}
                          {selectedFarm.district ||
                            "District"}
                        </div>

                        <div className="text-[10px] text-sky-700">
                          {selectedFarm.state ||
                            "India"}
                        </div>

                      </div>

                    </div>

                  </div>


                  {/* SOIL */}

                  <div>

                    <div className="mb-2 flex items-center gap-2">

                      <Waves className="h-4 w-4 text-amber-600" />

                      <div className="text-[10px] font-black uppercase tracking-wider text-stone-700">
                        Soil Intelligence
                      </div>

                    </div>

                    <div className="grid grid-cols-4 gap-1.5">

                      <div className="rounded-lg bg-stone-50 p-2 text-center">

                        <div className="text-[8px] text-stone-400">
                          N
                        </div>

                        <div className="text-[10px] font-black">
                          {selectedSoil?.nitrogen ??
                            0}
                        </div>

                      </div>

                      <div className="rounded-lg bg-stone-50 p-2 text-center">

                        <div className="text-[8px] text-stone-400">
                          P
                        </div>

                        <div className="text-[10px] font-black">
                          {selectedSoil?.phosphorus ??
                            0}
                        </div>

                      </div>

                      <div className="rounded-lg bg-stone-50 p-2 text-center">

                        <div className="text-[8px] text-stone-400">
                          K
                        </div>

                        <div className="text-[10px] font-black">
                          {selectedSoil?.potassium ??
                            0}
                        </div>

                      </div>

                      <div className="rounded-lg bg-stone-50 p-2 text-center">

                        <div className="text-[8px] text-stone-400">
                          pH
                        </div>

                        <div className="text-[10px] font-black">
                          {selectedSoil?.ph ??
                            "N/A"}
                        </div>

                      </div>

                    </div>

                  </div>


                  {/* CROPS */}

                  <div>

                    <div className="mb-2 flex items-center justify-between">

                      <div className="flex items-center gap-2">

                        <Sprout className="h-4 w-4 text-emerald-600" />

                        <span className="text-[10px] font-black uppercase tracking-wider text-stone-700">
                          Active Crops
                        </span>

                      </div>

                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-[9px] font-bold text-emerald-700">
                        {selectedFarm.activeCrops
                          ?.length || 0}
                      </span>

                    </div>


                    <div className="space-y-2">

                      {selectedFarm.activeCrops
                        ?.slice(0, 4)
                        .map((crop) => (

                          <div
                            key={crop.id}
                            className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3"
                          >

                            <div className="flex items-start justify-between gap-2">

                              <div>

                                <div className="text-xs font-black text-stone-900">
                                  {crop.name}
                                </div>

                                <div className="mt-0.5 text-[10px] text-stone-500">
                                  {crop.variety}
                                </div>

                              </div>

                              <span className="rounded-full bg-white px-2 py-1 text-[9px] font-bold text-emerald-700 shadow-sm">
                                {crop.healthScore}%
                              </span>

                            </div>

                            <div className="mt-2 text-[9px] text-stone-500">
                              Stage:{" "}
                              <strong>
                                {crop.growthStage}
                              </strong>
                            </div>

                          </div>

                        ))}

                    </div>

                  </div>

                </div>
              ) : (

                <div className="p-6 text-center">

                  <MapPin className="mx-auto h-8 w-8 text-stone-300" />

                  <div className="mt-2 text-sm font-bold text-stone-700">
                    Select a farm
                  </div>

                  <div className="mt-1 text-[10px] leading-5 text-stone-400">
                    Choose a registered parcel from
                    the farm registry.
                  </div>

                </div>

              )}

            </div>


            {/* =================================================
                GIS LAYERS / DECISION PANEL
            ================================================= */}

            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">

              <button
                type="button"
                onClick={() =>
                  setShowInsights(
                    (value) => !value
                  )
                }
                className="flex w-full items-center justify-between border-b border-stone-100 p-4 text-left"
              >

                <div className="flex items-center gap-2">

                  <Zap className="h-4 w-4 text-amber-500" />

                  <span className="text-xs font-black text-stone-900">
                    GIS Decision Intelligence
                  </span>

                </div>

                <ChevronDown
                  className={`h-4 w-4 text-stone-400 transition-transform ${showInsights
                      ? "rotate-180"
                      : ""
                    }`}
                />

              </button>


              {showInsights && (
                <div className="space-y-2 p-3">

                  <div className="flex items-start gap-3 rounded-xl bg-blue-50 p-3">

                    <CloudRain className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />

                    <div>

                      <div className="text-[10px] font-black text-blue-900">
                        Weather Layer
                      </div>

                      <div className="mt-0.5 text-[10px] leading-4 text-blue-700">
                        Connect rainfall and temperature
                        data to identify field-level
                        weather risks.
                      </div>

                    </div>

                  </div>


                  <div className="flex items-start gap-3 rounded-xl bg-cyan-50 p-3">

                    <Droplets className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600" />

                    <div>

                      <div className="text-[10px] font-black text-cyan-900">
                        Water Intelligence
                      </div>

                      <div className="mt-0.5 text-[10px] leading-4 text-cyan-700">
                        Combine irrigation zones,
                        soil moisture and crop stage
                        to identify water stress.
                      </div>

                    </div>

                  </div>


                  <div className="flex items-start gap-3 rounded-xl bg-red-50 p-3">

                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />

                    <div>

                      <div className="text-[10px] font-black text-red-900">
                        Disease Surveillance
                      </div>

                      <div className="mt-0.5 text-[10px] leading-4 text-red-700">
                        Disease hotspots can be visualized
                        around registered agricultural
                        parcels.
                      </div>

                    </div>

                  </div>


                  <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-3">

                    <AreaChart className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

                    <div>

                      <div className="text-[10px] font-black text-emerald-900">
                        Precision Field Mapping
                      </div>

                      <div className="mt-0.5 text-[10px] leading-4 text-emerald-700">
                        Field boundaries provide the spatial
                        foundation for crop, soil, irrigation
                        and farm analytics.
                      </div>

                    </div>

                  </div>

                </div>
              )}

            </div>

          </aside>

        </section>


        {/* =================================================
            FIELD ANALYTICS
        ================================================= */}

        {selectedFarm && (
          <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-600">

                  <Gauge className="h-4 w-4" />

                  Field Intelligence

                </div>

                <h2 className="mt-1 text-lg font-black text-stone-900">
                  {selectedFarm.name ||
                    "Selected Farm"}{" "}
                  Analytics
                </h2>

              </div>

              <div className="text-[10px] text-stone-400">
                GIS-driven agricultural overview
              </div>

            </div>


            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">

              <div className="rounded-xl border border-stone-100 bg-stone-50 p-4">

                <Sun className="h-4 w-4 text-amber-500" />

                <div className="mt-3 text-[9px] font-bold uppercase text-stone-400">
                  Crop Vigour
                </div>

                <div className="mt-1 text-xl font-black text-stone-900">
                  {selectedHealth}%
                </div>

              </div>


              <div className="rounded-xl border border-stone-100 bg-stone-50 p-4">

                <Droplets className="h-4 w-4 text-cyan-500" />

                <div className="mt-3 text-[9px] font-bold uppercase text-stone-400">
                  Irrigation
                </div>

                <div className="mt-1 truncate text-sm font-black text-stone-900">
                  {selectedFarm.irrigationType ||
                    "Unknown"}
                </div>

              </div>


              <div className="rounded-xl border border-stone-100 bg-stone-50 p-4">

                <Waves className="h-4 w-4 text-blue-500" />

                <div className="mt-3 text-[9px] font-bold uppercase text-stone-400">
                  Soil pH
                </div>

                <div className="mt-1 text-xl font-black text-stone-900">
                  {selectedSoil?.ph ??
                    "N/A"}
                </div>

              </div>


              <div className="rounded-xl border border-stone-100 bg-stone-50 p-4">

                <Thermometer className="h-4 w-4 text-orange-500" />

                <div className="mt-3 text-[9px] font-bold uppercase text-stone-400">
                  Soil Nitrogen
                </div>

                <div className="mt-1 text-xl font-black text-stone-900">
                  {selectedSoil?.nitrogen ??
                    0}
                </div>

                <div className="text-[9px] text-stone-400">
                  kg/ha
                </div>

              </div>


              <div className="rounded-xl border border-stone-100 bg-stone-50 p-4">

                <ShieldAlert className="h-4 w-4 text-red-500" />

                <div className="mt-3 text-[9px] font-bold uppercase text-stone-400">
                  Disease Risk
                </div>

                <div className="mt-1 text-sm font-black text-stone-900">
                  {hotspots.length
                    ? `${hotspots.length} alerts`
                    : "No mapped alerts"}
                </div>

              </div>


              <div className="rounded-xl border border-stone-100 bg-stone-50 p-4">

                <Ruler className="h-4 w-4 text-violet-500" />

                <div className="mt-3 text-[9px] font-bold uppercase text-stone-400">
                  Mapped Area
                </div>

                <div className="mt-1 text-xl font-black text-stone-900">
                  {selectedArea}
                </div>

                <div className="text-[9px] text-stone-400">
                  acres
                </div>

              </div>

            </div>

          </section>
        )}


        {/* =================================================
            FOOTER STATUS
        ================================================= */}

        <div className="flex flex-col gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 text-[10px] text-stone-500 shadow-sm sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-2">

            <CheckCircle2 className="h-4 w-4 text-emerald-600" />

            <span>
              AgriGo GIS engine ready for farm
              geospatial intelligence.
            </span>

          </div>

          <div className="flex items-center gap-3">

            <span>
              {farms.length} farms
            </span>

            <span>•</span>

            <span>
              {hotspots.length} hotspots
            </span>

            <span>•</span>

            <span>
              {gpsPoint
                ? "GPS connected"
                : "GPS not active"}
            </span>

          </div>

        </div>

      </div>


      {/* =================================================
          LOCATION MODAL
      ================================================= */}

      <LocationSelectorModal
        isOpen={showLocationModal}
        onClose={() =>
          setShowLocationModal(false)
        }
      />

    </div>
  );
};

export default GISMapPage;