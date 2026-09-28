import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  MapContainer,
  TileLayer,
  Polygon,
  Polyline,
  CircleMarker,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";

import area from "@turf/area";
import length from "@turf/length";
import { polygon as turfPolygon } from "@turf/helpers";

import "leaflet/dist/leaflet.css";

import {
  api,
} from "../../services/api";
import type { Farm } from "../../types/index";

type FarmBoundaryPoint = {
  lat: number;
  lng: number;
};

type AgriGoFarm = Farm & {
  boundary_coordinates: FarmBoundaryPoint[];
  area_acres: number;
  area_hectares: number;
  perimeter_m: number;
  crop_name: string;
};


/* =========================================================
   TYPES
========================================================= */

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
}


/* =========================================================
   LEAFLET LOCATION ICON
========================================================= */

const locationIcon = L.divIcon({
  className: "agrigo-location-marker",

  html: `
    <div style="
      width:34px;
      height:34px;
      border-radius:50%;
      background:#fff;
      border:3px solid #16a34a;
      display:flex;
      align-items:center;
      justify-content:center;
      box-shadow:0 4px 15px rgba(0,0,0,.25);
      font-size:17px;
    ">
      📍
    </div>
  `,

  iconSize: [34, 34],
  iconAnchor: [17, 17],
});


/* =========================================================
   MAP RECENTER
========================================================= */

interface MapRecenterProps {
  position: FarmBoundaryPoint | null;
}

const MapRecenter: React.FC<MapRecenterProps> = ({
  position,
}) => {
  const map = useMap();

  useEffect(() => {
    if (!position) return;

    map.flyTo(
      [
        position.lat,
        position.lng,
      ],
      17,
      {
        duration: 1.2,
      }
    );
  }, [position, map]);

  return null;
};


/* =========================================================
   MAP DRAWING
========================================================= */

interface MapDrawingProps {
  enabled: boolean;
  onPoint: (
    point: FarmBoundaryPoint
  ) => void;
}

const MapDrawing: React.FC<MapDrawingProps> = ({
  enabled,
  onPoint,
}) => {
  useMapEvents({
    click(event) {
      if (!enabled) return;

      onPoint({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      });
    },
  });

  return null;
};


/* =========================================================
   COMPONENT
========================================================= */

const LandMeasurementPage: React.FC = () => {

  const defaultCenter: FarmBoundaryPoint = {
    lat: 15.3173,
    lng: 75.7139,
  };

  const [mapCenter, setMapCenter] =
    useState<FarmBoundaryPoint>(
      defaultCenter
    );

  const [boundary, setBoundary] =
    useState<FarmBoundaryPoint[]>([]);

  const [drawing, setDrawing] =
    useState(false);

  const [mapMode, setMapMode] =
    useState<"satellite" | "street">(
      "satellite"
    );

  const [farmName, setFarmName] =
    useState("My Farm");

  const [village, setVillage] =
    useState("");

  const [district, setDistrict] =
    useState("");

  const [cropName, setCropName] =
    useState("");

  const [savedFarms, setSavedFarms] =
    useState<AgriGoFarm[]>([]);

  const [loadingFarms, setLoadingFarms] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(null);

  const [location, setLocation] =
    useState<LocationState>({
      latitude: null,
      longitude: null,
      accuracy: null,
      loading: false,
      error: null,
    });

  const [
    showSavedFarms,
    setShowSavedFarms,
  ] = useState(false);

  const watchIdRef =
    useRef<number | null>(null);


  /* =======================================================
     LOAD FARMS FROM DJANGO
  ======================================================= */

  const loadFarms = useCallback(
    async () => {
      try {
        setLoadingFarms(true);

        const farms =
          await api.getFarms() as AgriGoFarm[];

        setSavedFarms(farms);

      } catch (error) {
        console.error(
          "Failed to load farms:",
          error
        );

        setMessage(
          "Unable to load saved farms."
        );
      } finally {
        setLoadingFarms(false);
      }
    },
    []
  );


  useEffect(() => {
    loadFarms();
  }, [loadFarms]);


  /* =======================================================
     ADD POINT
  ======================================================= */

  const addPoint = useCallback(
    (
      point: FarmBoundaryPoint
    ) => {
      setBoundary(
        previous => [
          ...previous,
          point,
        ]
      );
    },
    []
  );


  /* =======================================================
     UNDO
  ======================================================= */

  const undoPoint = () => {
    setBoundary(
      previous =>
        previous.slice(0, -1)
    );
  };


  /* =======================================================
     CLEAR
  ======================================================= */

  const clearBoundary = () => {
    setBoundary([]);
    setDrawing(false);
  };


  /* =======================================================
     LOCATION
  ======================================================= */

  const getCurrentLocation = () => {

    if (!navigator.geolocation) {

      setLocation({
        latitude: null,
        longitude: null,
        accuracy: null,
        loading: false,
        error:
          "Geolocation is not supported.",
      });

      return;
    }

    setLocation(
      previous => ({
        ...previous,
        loading: true,
        error: null,
      })
    );

    navigator.geolocation.getCurrentPosition(

      position => {

        const point = {
          lat:
            position.coords.latitude,

          lng:
            position.coords.longitude,
        };

        setLocation({
          latitude:
            position.coords.latitude,

          longitude:
            position.coords.longitude,

          accuracy:
            position.coords.accuracy,

          loading: false,
          error: null,
        });

        setMapCenter(point);

      },

      error => {

        setLocation({
          latitude: null,
          longitude: null,
          accuracy: null,
          loading: false,
          error:
            error.message ||
            "Unable to determine location.",
        });

      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      }
    );
  };


  /* =======================================================
     DISTANCE
  ======================================================= */

  const distanceBetween = (
    a: FarmBoundaryPoint,
    b: FarmBoundaryPoint
  ) => {

    const R = 6371000;

    const lat1 =
      a.lat * Math.PI / 180;

    const lat2 =
      b.lat * Math.PI / 180;

    const dLat =
      (b.lat - a.lat) *
      Math.PI / 180;

    const dLng =
      (b.lng - a.lng) *
      Math.PI / 180;

    const x =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(dLng / 2) ** 2;

    return (
      R *
      2 *
      Math.atan2(
        Math.sqrt(x),
        Math.sqrt(1 - x)
      )
    );
  };


  /* =======================================================
     GPS WALK
  ======================================================= */

  const startGPSWalk = () => {

    if (!navigator.geolocation) {
      alert(
        "GPS is not supported."
      );

      return;
    }

    setBoundary([]);
    setDrawing(false);

    if (
      watchIdRef.current !== null
    ) {
      navigator.geolocation.clearWatch(
        watchIdRef.current
      );
    }

    watchIdRef.current =
      navigator.geolocation.watchPosition(

        position => {

          const point = {
            lat:
              position.coords.latitude,

            lng:
              position.coords.longitude,
          };

          setLocation({
            latitude:
              position.coords.latitude,

            longitude:
              position.coords.longitude,

            accuracy:
              position.coords.accuracy,

            loading: false,
            error: null,
          });

          setMapCenter(point);

          setBoundary(
            previous => {

              if (
                previous.length === 0
              ) {
                return [point];
              }

              const last =
                previous[
                  previous.length - 1
                ];

              const distance =
                distanceBetween(
                  last,
                  point
                );

              if (distance < 3) {
                return previous;
              }

              return [
                ...previous,
                point,
              ];
            }
          );
        },

        error => {

          setLocation(
            previous => ({
              ...previous,
              loading: false,
              error:
                error.message ||
                "GPS tracking failed.",
            })
          );
        },

        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 1000,
        }
      );
  };


  /* =======================================================
     STOP GPS
  ======================================================= */

  const stopGPSWalk = () => {

    if (
      watchIdRef.current !== null
    ) {
      navigator.geolocation.clearWatch(
        watchIdRef.current
      );

      watchIdRef.current = null;
    }
  };


  /* =======================================================
     CLEANUP
  ======================================================= */

  useEffect(() => {

    return () => {

      if (
        watchIdRef.current !== null
      ) {
        navigator.geolocation.clearWatch(
          watchIdRef.current
        );
      }

    };

  }, []);


  /* =======================================================
     MEASUREMENTS
  ======================================================= */

  const measurements =
    useMemo(() => {

      if (boundary.length < 3) {

        return {
          areaSqM: 0,
          acres: 0,
          hectares: 0,
          guntas: 0,
          perimeterM: 0,
        };
      }

      const coordinates =
        boundary.map(
          point => [
            point.lng,
            point.lat,
          ] as [
            number,
            number
          ]
        );

      const closed = [
        ...coordinates,
        coordinates[0],
      ];

      const feature =
        turfPolygon([
          closed,
        ]);

      const areaSqM =
        area(feature);

      const acres =
        areaSqM /
        4046.8564224;

      const hectares =
        areaSqM /
        10000;

      const guntas =
        acres * 40;

      const perimeter =
        length(
          {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: closed,
            },
          } as any,
          {
            units: "kilometers",
          }
        ) * 1000;

      return {
        areaSqM,
        acres,
        hectares,
        guntas,
        perimeterM: perimeter,
      };

    }, [boundary]);


  /* =======================================================
     GEOJSON POLYGON
  ======================================================= */

  const createGeoJSONBoundary = () => {

    const coordinates =
      boundary.map(
        point => [
          point.lng,
          point.lat,
        ]
      );

    const closed = [
      ...coordinates,
      coordinates[0],
    ];

    return {
      type: "Polygon",
      coordinates: [
        closed,
      ],
    };
  };


  /* =======================================================
     SAVE TO DJANGO
  ======================================================= */

  const saveFarm = async () => {

    if (boundary.length < 3) {

      alert(
        "Please mark at least 3 boundary points."
      );

      return;
    }

    try {

      setSaving(true);
      setMessage(null);

      const saved = await api.createFarm({

          name:
            farmName.trim() ||
            "My Farm",

          village:
            village.trim(),

          district:
            district.trim(),

          state:
            "Karnataka",

          crop_name:
            cropName.trim(),

          boundary:
            createGeoJSONBoundary(),

          measurement_method:
            "map",

          gps_accuracy_m:
            location.accuracy,

          notes:
            "Measured using AgriGo GeoFarm.",

        } as Partial<Farm>) as AgriGoFarm;

      setSavedFarms(
        previous => [
          saved,
          ...previous,
        ]
      );

      setMessage(
        `${saved.name} saved successfully.`
      );

    } catch (error) {

      console.error(
        "Farm save error:",
        error
      );

      setMessage(
        "Could not save farm. Please check your login and API connection."
      );

    } finally {

      setSaving(false);
    }
  };


  /* =======================================================
     LOAD FARM
  ======================================================= */

  const loadFarm = (
    farm: AgriGoFarm
  ) => {

    const coordinates =
      farm.boundary_coordinates;

    setBoundary(
      coordinates
    );

    if (coordinates.length > 0) {
      setMapCenter(
        coordinates[0]
      );
    }

    setFarmName(
      farm.name
    );

    setVillage(
      farm.village
    );

    setDistrict(
      farm.district
    );

    setCropName(
      farm.crop_name
    );

    setShowSavedFarms(
      false
    );
  };


  /* =======================================================
     DELETE FARM
  ======================================================= */

  const deleteFarm = async (
    farmId: string
  ) => {

    const confirmed =
      window.confirm(
        "Delete this farm permanently?"
      );

    if (!confirmed) return;

    try {

      await api.deleteFarm(
        farmId
      );

      setSavedFarms(
        previous =>
          previous.filter(
            farm =>
              farm.id !== farmId
          )
      );

      setMessage(
        "Farm deleted."
      );

    } catch (error) {

      console.error(
        error
      );

      setMessage(
        "Unable to delete farm."
      );
    }
  };


  /* =======================================================
     FORMAT
  ======================================================= */

  const formatNumber = (
    value: number,
    decimals = 2
  ) => {

    return value.toLocaleString(
      "en-IN",
      {
        minimumFractionDigits:
          decimals,

        maximumFractionDigits:
          decimals,
      }
    );
  };


  /* =======================================================
     TILE URL
  ======================================================= */

  const satelliteUrl =
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

  const streetUrl =
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";


  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="agrigo-land-page">

      <header className="land-header">

        <div className="brand-area">

          <div className="brand-icon">
            🌾
          </div>

          <div>
            <h1>
              AgriGo GeoFarm
            </h1>

            <p>
              Smart Land Measurement & Farm Mapping
            </p>
          </div>

        </div>

        <button
          className="saved-button"
          onClick={() =>
            setShowSavedFarms(true)
          }
        >
          💾 Saved Farms

          <span>
            {savedFarms.length}
          </span>
        </button>

      </header>


      <main className="land-layout">

        <aside className="control-panel">

          <div className="panel-heading">

            <div>
              <span className="eyebrow">
                AGRIGO GEOSPATIAL
              </span>

              <h2>
                Measure Your Land
              </h2>
            </div>

            <div className="live-dot">
              <span />
              LIVE
            </div>

          </div>


          {message && (
            <div className="success-message">
              ✓ {message}
            </div>
          )}


          {/* FARM INFORMATION */}

          <div className="form-group">

            <label>
              Farm Name
            </label>

            <input
              value={farmName}
              onChange={e =>
                setFarmName(
                  e.target.value
                )
              }
              placeholder="Example: Green Valley Farm"
            />

          </div>


          <div className="two-column">

            <div className="form-group">

              <label>
                Village
              </label>

              <input
                value={village}
                onChange={e =>
                  setVillage(
                    e.target.value
                  )
                }
                placeholder="Village"
              />

            </div>


            <div className="form-group">

              <label>
                District
              </label>

              <input
                value={district}
                onChange={e =>
                  setDistrict(
                    e.target.value
                  )
                }
                placeholder="District"
              />

            </div>

          </div>


          <div className="form-group">

            <label>
              Current Crop
            </label>

            <input
              value={cropName}
              onChange={e =>
                setCropName(
                  e.target.value
                )
              }
              placeholder="Example: Tomato"
            />

          </div>


          {/* MAP MODE */}

          <div className="section-label">
            Map View
          </div>

          <div className="map-switch">

            <button
              className={
                mapMode ===
                "satellite"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setMapMode(
                  "satellite"
                )
              }
            >
              🛰️ Satellite
            </button>

            <button
              className={
                mapMode ===
                "street"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setMapMode(
                  "street"
                )
              }
            >
              🗺️ Map
            </button>

          </div>


          {/* GPS */}

          <button
            className="location-button"
            onClick={
              getCurrentLocation
            }
            disabled={
              location.loading
            }
          >
            📍{" "}

            {location.loading
              ? "Finding Location..."
              : "Use My Location"}
          </button>


          {location.accuracy && (
            <div className="accuracy-box">

              <div className="accuracy-icon">
                GPS
              </div>

              <div>
                <strong>
                  GPS Accuracy
                </strong>

                <span>
                  ±
                  {formatNumber(
                    location.accuracy,
                    0
                  )}
                  m
                </span>
              </div>

            </div>
          )}


          {/* DRAW */}

          <div className="section-label">
            Boundary Measurement
          </div>

          <button
            className={
              drawing
                ? "draw-button active"
                : "draw-button"
            }
            onClick={() =>
              setDrawing(
                previous =>
                  !previous
              )
            }
          >
            ✏️{" "}

            {drawing
              ? "Stop Drawing"
              : "Draw Farm Boundary"}
          </button>


          <p className="helper-text">
            Click around the outside of
            your farmland on the map.
          </p>


          {/* GPS WALK */}

          <button
            className="gps-walk-button"
            onClick={
              startGPSWalk
            }
          >
            🚶 GPS Walk Measurement
          </button>


          {watchIdRef.current !==
            null && (
            <button
              className="stop-gps-button"
              onClick={
                stopGPSWalk
              }
            >
              ⏹ Stop GPS Tracking
            </button>
          )}


          {/* ACTIONS */}

          <div className="small-actions">

            <button
              disabled={
                boundary.length === 0
              }
              onClick={
                undoPoint
              }
            >
              ↩ Undo
            </button>

            <button
              disabled={
                boundary.length === 0
              }
              onClick={
                clearBoundary
              }
            >
              🗑 Clear
            </button>

          </div>


          {/* RESULTS */}

          <div className="section-label">
            Measurement Results
          </div>


          <div className="measurement-grid">

            <div className="measurement-card primary">

              <span>
                🌾
              </span>

              <small>
                LAND AREA
              </small>

              <strong>
                {formatNumber(
                  measurements.acres
                )}
              </strong>

              <em>
                acres
              </em>

            </div>


            <div className="measurement-card">

              <span>
                📐
              </span>

              <small>
                HECTARES
              </small>

              <strong>
                {formatNumber(
                  measurements.hectares
                )}
              </strong>

              <em>
                ha
              </em>

            </div>


            <div className="measurement-card">

              <span>
                🌱
              </span>

              <small>
                GUNTAS
              </small>

              <strong>
                {formatNumber(
                  measurements.guntas
                )}
              </strong>

              <em>
                guntas
              </em>

            </div>


            <div className="measurement-card">

              <span>
                📏
              </span>

              <small>
                PERIMETER
              </small>

              <strong>
                {formatNumber(
                  measurements.perimeterM,
                  0
                )}
              </strong>

              <em>
                metres
              </em>

            </div>

          </div>


          {/* SAVE */}

          <button
            className="save-button"
            disabled={
              boundary.length < 3 ||
              saving
            }
            onClick={
              saveFarm
            }
          >
            {saving
              ? "Saving to AgriGo..."
              : "💾 Save Farm Permanently"}
          </button>


          <div className="points-status">

            <span>
              Boundary Points
            </span>

            <strong>
              {boundary.length}
            </strong>

          </div>

        </aside>


        {/* MAP */}

        <section className="map-area">

          <MapContainer
            center={[
              mapCenter.lat,
              mapCenter.lng,
            ]}
            zoom={6}
            className="agrigo-map"
          >

            {mapMode ===
            "satellite" ? (

              <TileLayer
                attribution="Tiles © Esri"
                url={
                  satelliteUrl
                }
              />

            ) : (

              <TileLayer
                attribution="© OpenStreetMap contributors"
                url={
                  streetUrl
                }
              />

            )}


            <MapRecenter
              position={
                mapCenter
              }
            />


            <MapDrawing
              enabled={
                drawing
              }
              onPoint={
                addPoint
              }
            />


            {/* LOCATION */}

            {location.latitude !==
              null &&
              location.longitude !==
                null && (

              <Marker
                position={[
                  location.latitude,
                  location.longitude,
                ]}
                icon={
                  locationIcon
                }
              />

            )}


            {/* FARM POLYGON */}

            {boundary.length > 0 && (

              <>

                <Polyline
                  positions={
                    boundary.map(
                      point => [
                        point.lat,
                        point.lng,
                      ]
                    )
                  }
                  pathOptions={{
                    color:
                      "#16a34a",
                    weight: 4,
                  }}
                />


                {boundary.length >=
                  3 && (

                  <Polygon
                    positions={
                      boundary.map(
                        point => [
                          point.lat,
                          point.lng,
                        ]
                      )
                    }
                    pathOptions={{
                      color:
                        "#16a34a",
                      fillColor:
                        "#22c55e",
                      fillOpacity:
                        0.25,
                      weight: 3,
                    }}
                  />

                )}


                {boundary.map(
                  (
                    point,
                    index
                  ) => (

                    <CircleMarker
                      key={
                        `${point.lat}-${point.lng}-${index}`
                      }
                      center={[
                        point.lat,
                        point.lng,
                      ]}
                      radius={7}
                      pathOptions={{
                        color:
                          "#ffffff",
                        weight: 3,
                        fillColor:
                          "#16a34a",
                        fillOpacity: 1,
                      }}
                    />

                  )
                )}

              </>

            )}

          </MapContainer>


          {/* MAP INFO */}

          <div className="map-instruction">

            <div className="instruction-icon">
              ✏️
            </div>

            <div>

              <strong>
                {drawing
                  ? "Drawing Mode Active"
                  : "AgriGo GeoFarm"}
              </strong>

              <span>
                {drawing
                  ? "Click around your farm boundary"
                  : "Use satellite imagery to map your farmland"}
              </span>

            </div>

          </div>


          {/* RESULT */}

          {boundary.length >=
            3 && (

            <div className="map-result">

              <div>

                <small>
                  FARM AREA
                </small>

                <strong>
                  {formatNumber(
                    measurements.acres
                  )}

                  <span>
                    acres
                  </span>
                </strong>

              </div>


              <div className="vertical-divider" />


              <div>

                <small>
                  PERIMETER
                </small>

                <strong>
                  {formatNumber(
                    measurements.perimeterM,
                    0
                  )}

                  <span>
                    m
                  </span>
                </strong>

              </div>

            </div>

          )}

        </section>

      </main>


      {/* SAVED FARMS */}

      {showSavedFarms && (

        <div
          className="drawer-backdrop"
          onClick={() =>
            setShowSavedFarms(
              false
            )
          }
        >

          <div
            className="saved-drawer"
            onClick={e =>
              e.stopPropagation()
            }
          >

            <div className="drawer-header">

              <div>

                <span>
                  AGRIGO DATABASE
                </span>

                <h2>
                  My Saved Farms
                </h2>

              </div>

              <button
                onClick={() =>
                  setShowSavedFarms(
                    false
                  )
                }
              >
                ✕
              </button>

            </div>


            {loadingFarms ? (

              <div className="empty-state">
                Loading farms...
              </div>

            ) : savedFarms.length ===
              0 ? (

              <div className="empty-state">

                <div>
                  🌾
                </div>

                <h3>
                  No farms yet
                </h3>

                <p>
                  Measure your farmland
                  and save it to the
                  AgriGo database.
                </p>

              </div>

            ) : (

              <div className="farm-list">

                {savedFarms.map(
                  farm => (

                  <div
                    className="saved-farm-card"
                    key={farm.id}
                  >

                    <div className="farm-card-top">

                      <div className="farm-avatar">
                        🌾
                      </div>

                      <div>

                        <h3>
                          {farm.name}
                        </h3>

                        <span>
                          {farm.village ||
                            "Location not specified"}
                        </span>

                      </div>

                    </div>


                    <div className="saved-stats">

                      <div>

                        <small>
                          AREA
                        </small>

                        <strong>
                          {formatNumber(
                            farm.area_acres
                          )}{" "}
                          acres
                        </strong>

                      </div>


                      <div>

                        <small>
                          HECTARES
                        </small>

                        <strong>
                          {formatNumber(
                            farm.area_hectares
                          )}{" "}
                          ha
                        </strong>

                      </div>


                      <div>

                        <small>
                          PERIMETER
                        </small>

                        <strong>
                          {formatNumber(
                            farm.perimeter_m,
                            0
                          )}{" "}
                          m
                        </strong>

                      </div>

                    </div>


                    <div className="farm-card-actions">

                      <button
                        onClick={() =>
                          loadFarm(
                            farm
                          )
                        }
                      >
                        👁 View
                      </button>

                      <button
                        className="delete"
                        onClick={() =>
                          deleteFarm(
                            farm.id
                          )
                        }
                      >
                        🗑 Delete
                      </button>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

        </div>

      )}


      {/* STYLES */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .agrigo-land-page {
          min-height: 100vh;
          background: #f4fbf5;
          color: #17321f;
          font-family:
            Inter,
            system-ui,
            sans-serif;
        }

        .land-header {
          height: 78px;
          background: rgba(255,255,255,.96);
          border-bottom: 1px solid #dce9df;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          position: relative;
          z-index: 20;
        }

        .brand-area {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .brand-icon {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          background: #dcfce7;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 25px;
        }

        .brand-area h1 {
          margin: 0;
          font-size: 20px;
          font-weight: 800;
        }

        .brand-area p {
          margin: 3px 0 0;
          color: #6b7d71;
          font-size: 12px;
        }

        .saved-button {
          border: 1px solid #d6e6da;
          background: #fff;
          color: #235b35;
          border-radius: 12px;
          padding: 10px 14px;
          font-weight: 700;
          cursor: pointer;
        }

        .saved-button span {
          margin-left: 7px;
          background: #dcfce7;
          color: #15803d;
          padding: 2px 7px;
          border-radius: 20px;
        }

        .land-layout {
          display: grid;
          grid-template-columns:
            minmax(350px, 410px)
            1fr;
          height:
            calc(100vh - 78px);
        }

        .control-panel {
          background: #fff;
          border-right: 1px solid #dce9df;
          padding: 24px;
          overflow-y: auto;
          z-index: 10;
        }

        .panel-heading {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .eyebrow {
          color: #16a34a;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.4px;
        }

        .panel-heading h2 {
          margin: 4px 0;
          font-size: 23px;
        }

        .live-dot {
          height: fit-content;
          display: flex;
          gap: 6px;
          align-items: center;
          background: #f0fdf4;
          color: #15803d;
          padding: 6px 9px;
          border-radius: 20px;
          font-size: 9px;
          font-weight: 800;
        }

        .live-dot span {
          width: 6px;
          height: 6px;
          background: #22c55e;
          border-radius: 50%;
        }

        .success-message {
          background: #ecfdf5;
          border: 1px solid #bbf7d0;
          color: #15803d;
          padding: 10px;
          border-radius: 10px;
          font-size: 11px;
          margin-bottom: 14px;
        }

        .form-group {
          margin-bottom: 14px;
        }

        .form-group label,
        .section-label {
          display: block;
          font-size: 11px;
          font-weight: 800;
          color: #52665a;
          margin-bottom: 7px;
        }

        .form-group input {
          width: 100%;
          height: 42px;
          border: 1px solid #d8e5dc;
          border-radius: 10px;
          padding: 0 12px;
          outline: none;
          background: #fbfefb;
        }

        .form-group input:focus {
          border-color: #22c55e;
          box-shadow:
            0 0 0 3px
            rgba(34,197,94,.1);
        }

        .two-column {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .map-switch {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5px;
          background: #f1f6f2;
          padding: 4px;
          border-radius: 10px;
          margin-bottom: 10px;
        }

        .map-switch button {
          border: 0;
          background: transparent;
          padding: 9px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
        }

        .map-switch button.active {
          background: #fff;
          color: #15803d;
          box-shadow: 0 2px 8px rgba(0,0,0,.08);
        }

        .location-button,
        .draw-button,
        .gps-walk-button,
        .stop-gps-button,
        .save-button {
          width: 100%;
          min-height: 43px;
          border-radius: 10px;
          font-weight: 800;
          cursor: pointer;
          margin-bottom: 8px;
        }

        .location-button {
          background: #ecfdf5;
          color: #15803d;
          border: 1px solid #bbf7d0;
        }

        .draw-button {
          border: 0;
          background: linear-gradient(
            135deg,
            #166534,
            #15803d
          );
          color: white;
        }

        .draw-button.active {
          box-shadow:
            0 0 0 3px
            rgba(34,197,94,.18);
        }

        .gps-walk-button {
          background: #fff7ed;
          color: #c2410c;
          border: 1px solid #fed7aa;
        }

        .stop-gps-button {
          background: #fef2f2;
          color: #b91c1c;
          border: 1px solid #fecaca;
        }

        .helper-text {
          font-size: 10px;
          color: #718076;
          line-height: 1.5;
        }

        .accuracy-box {
          display: flex;
          gap: 10px;
          align-items: center;
          padding: 9px;
          background: #f8faf9;
          border: 1px solid #e3ebe5;
          border-radius: 10px;
          margin-bottom: 14px;
        }

        .accuracy-icon {
          width: 35px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #dcfce7;
          border-radius: 9px;
          color: #15803d;
          font-size: 9px;
          font-weight: 900;
        }

        .accuracy-box strong,
        .accuracy-box span {
          display: block;
        }

        .accuracy-box strong {
          font-size: 10px;
        }

        .accuracy-box span {
          color: #16a34a;
          font-size: 10px;
          margin-top: 2px;
        }

        .small-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin: 4px 0 17px;
        }

        .small-actions button {
          border: 1px solid #dce7df;
          background: #fff;
          padding: 9px;
          border-radius: 9px;
          cursor: pointer;
          font-weight: 700;
        }

        .measurement-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 14px;
        }

        .measurement-card {
          min-height: 105px;
          border: 1px solid #e1ebe3;
          background: #fbfefc;
          border-radius: 13px;
          padding: 11px;
        }

        .measurement-card.primary {
          background: #ecfdf5;
          border-color: #bbf7d0;
        }

        .measurement-card span {
          display: block;
          font-size: 16px;
        }

        .measurement-card small {
          display: block;
          color: #75847a;
          font-size: 8px;
          font-weight: 800;
          margin-top: 5px;
        }

        .measurement-card strong {
          font-size: 19px;
        }

        .measurement-card em {
          color: #75847a;
          font-style: normal;
          font-size: 9px;
          margin-left: 4px;
        }

        .save-button {
          border: 0;
          background: linear-gradient(
            135deg,
            #14532d,
            #16a34a
          );
          color: #fff;
        }

        .save-button:disabled {
          opacity: .45;
          cursor: not-allowed;
        }

        .points-status {
          display: flex;
          justify-content: space-between;
          color: #718076;
          font-size: 10px;
        }

        .points-status strong {
          color: #15803d;
        }

        .map-area {
          position: relative;
          min-width: 0;
        }

        .agrigo-map {
          width: 100%;
          height: 100%;
          min-height: 550px;
        }

        .map-instruction {
          position: absolute;
          top: 17px;
          left: 17px;
          z-index: 500;
          background: rgba(255,255,255,.94);
          backdrop-filter: blur(12px);
          border-radius: 13px;
          padding: 10px 13px;
          display: flex;
          gap: 9px;
          align-items: center;
          box-shadow: 0 8px 25px rgba(0,0,0,.13);
        }

        .instruction-icon {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          background: #dcfce7;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .map-instruction strong,
        .map-instruction span {
          display: block;
        }

        .map-instruction strong {
          font-size: 11px;
        }

        .map-instruction span {
          font-size: 9px;
          color: #718076;
        }

        .map-result {
          position: absolute;
          right: 18px;
          bottom: 20px;
          z-index: 500;
          display: flex;
          gap: 18px;
          background: rgba(255,255,255,.95);
          border-radius: 15px;
          padding: 13px 18px;
          box-shadow: 0 10px 30px rgba(0,0,0,.16);
        }

        .map-result small,
        .map-result strong {
          display: block;
        }

        .map-result small {
          font-size: 8px;
          color: #718076;
        }

        .map-result strong {
          font-size: 19px;
        }

        .map-result strong span {
          color: #718076;
          font-size: 10px;
          margin-left: 3px;
        }

        .vertical-divider {
          width: 1px;
          background: #dce5de;
        }

        .drawer-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(15,31,21,.38);
          display: flex;
          justify-content: flex-end;
        }

        .saved-drawer {
          width: min(440px, 94vw);
          height: 100%;
          background: white;
          padding: 25px;
          overflow-y: auto;
        }

        .drawer-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 25px;
        }

        .drawer-header span {
          color: #16a34a;
          font-size: 9px;
          font-weight: 900;
        }

        .drawer-header h2 {
          margin: 4px 0;
        }

        .drawer-header button {
          width: 35px;
          height: 35px;
          border: 1px solid #e2e9e4;
          background: white;
          border-radius: 9px;
          cursor: pointer;
        }

        .farm-list {
          display: grid;
          gap: 12px;
        }

        .saved-farm-card {
          border: 1px solid #e0e9e2;
          border-radius: 15px;
          padding: 15px;
        }

        .farm-card-top {
          display: flex;
          gap: 11px;
          align-items: center;
        }

        .farm-avatar {
          width: 43px;
          height: 43px;
          border-radius: 12px;
          background: #dcfce7;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .farm-card-top h3 {
          margin: 0;
          font-size: 14px;
        }

        .farm-card-top span {
          display: block;
          color: #87948b;
          font-size: 9px;
          margin-top: 3px;
        }

        .saved-stats {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 6px;
          margin: 14px 0;
          padding-top: 12px;
          border-top: 1px solid #edf1ee;
        }

        .saved-stats small,
        .saved-stats strong {
          display: block;
        }

        .saved-stats small {
          font-size: 7px;
          color: #8a968e;
        }

        .saved-stats strong {
          margin-top: 4px;
          font-size: 10px;
        }

        .farm-card-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 7px;
        }

        .farm-card-actions button {
          border: 1px solid #dce6df;
          background: white;
          border-radius: 8px;
          padding: 8px;
          cursor: pointer;
          font-weight: 800;
          color: #236039;
        }

        .farm-card-actions .delete {
          color: #b91c1c;
          border-color: #fecaca;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #748078;
        }

        @media (max-width: 900px) {

          .land-layout {
            grid-template-columns: 1fr;
            height: auto;
          }

          .control-panel {
            border-right: 0;
            border-bottom: 1px solid #dce9df;
          }

          .map-area {
            height: 650px;
          }

        }

        @media (max-width: 600px) {

          .land-header {
            padding: 0 14px;
          }

          .brand-area p {
            display: none;
          }

          .control-panel {
            padding: 17px;
          }

          .two-column {
            grid-template-columns: 1fr;
          }

          .map-area {
            height: 520px;
          }

        }

      `}</style>

    </div>
  );
};

export default LandMeasurementPage;