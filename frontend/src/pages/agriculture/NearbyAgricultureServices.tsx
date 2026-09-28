import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowUpDown,
  Bookmark,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  Filter,
  Heart,
  Info,
  LocateFixed,
  MapPin,
  Navigation,
  Phone,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Tractor,
  Truck,
  UserRound,
  Wheat,
  X,
} from "lucide-react";

import { AgriculturePageHeader } from "@/components/agriculture/AgriculturePageHeader";
import { EmptyState } from "@/components/agriculture/EmptyState";
import { LoadingState } from "@/components/agriculture/Loadingstate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { agricultureApi } from "@/services/agricultureApi";

const types = [
  "all",
  "mandi",
  "vet",
  "equipment rental",
  "soil lab",
  "seed store",
] as const;

type ServiceType = (typeof types)[number];

type SortMode =
  | "distance"
  | "name"
  | "availability";

type StatusFilter =
  | "all"
  | "open"
  | "closed";

const styles = `
.nearby-page {
  min-height: 100vh;
  padding-bottom: 80px;
  background:
    radial-gradient(
      circle at 0% 0%,
      hsl(var(--primary) / .08),
      transparent 28%
    ),
    radial-gradient(
      circle at 100% 15%,
      hsl(var(--chart-2) / .07),
      transparent 27%
    );
}

.nearby-hero {
  position: relative;
  overflow: hidden;
  margin-top: 24px;
  padding: 32px;
  border: 1px solid hsl(var(--border));
  border-radius: 30px;
  background:
    linear-gradient(
      135deg,
      hsl(var(--primary) / .14),
      transparent 55%
    ),
    hsl(var(--card));
  box-shadow:
    0 25px 75px hsl(var(--foreground) / .07);
}

.nearby-hero::before {
  content: "";
  position: absolute;
  width: 330px;
  height: 330px;
  right: -150px;
  top: -170px;
  border-radius: 50%;
  background: hsl(var(--primary) / .09);
}

.nearby-hero::after {
  content: "";
  position: absolute;
  width: 180px;
  height: 180px;
  left: 48%;
  bottom: -130px;
  border-radius: 50%;
  background: hsl(var(--chart-2) / .08);
}

.nearby-hero-grid {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns:
    minmax(0, 1.35fr)
    minmax(280px, .65fr);
  gap: 28px;
  align-items: center;
}

.nearby-kicker {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 12px;
  border-radius: 999px;
  background: hsl(var(--primary) / .1);
  color: hsl(var(--primary));
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.nearby-title {
  margin-top: 15px;
  font-size: clamp(30px, 5vw, 54px);
  line-height: .98;
  font-weight: 950;
  letter-spacing: -.055em;
}

.nearby-title span {
  color: hsl(var(--primary));
}

.nearby-description {
  max-width: 700px;
  margin-top: 16px;
  color: hsl(var(--muted-foreground));
  font-size: 14px;
  line-height: 1.75;
}

.nearby-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin-top: 22px;
}

.location-card {
  position: relative;
  padding: 21px;
  border: 1px solid hsl(var(--border));
  border-radius: 22px;
  background: hsl(var(--background) / .72);
  backdrop-filter: blur(15px);
}

.location-icon {
  display: grid;
  place-items: center;
  width: 47px;
  height: 47px;
  border-radius: 14px;
  background: hsl(var(--primary) / .11);
  color: hsl(var(--primary));
}

.location-label {
  margin-top: 15px;
  color: hsl(var(--muted-foreground));
  font-size: 9px;
  font-weight: 900;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.location-title {
  margin-top: 5px;
  font-size: 18px;
  font-weight: 950;
}

.location-text {
  margin-top: 5px;
  color: hsl(var(--muted-foreground));
  font-size: 10px;
  line-height: 1.6;
}

.location-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 12px;
  padding: 6px 9px;
  border-radius: 999px;
  background: hsl(var(--primary) / .1);
  color: hsl(var(--primary));
  font-size: 9px;
  font-weight: 900;
}

.service-stats {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-top: 21px;
}

.service-stat {
  position: relative;
  overflow: hidden;
  padding: 17px;
  border: 1px solid hsl(var(--border));
  border-radius: 18px;
  background: hsl(var(--card));
  transition:
    transform .2s ease,
    box-shadow .2s ease;
}

.service-stat:hover {
  transform: translateY(-3px);
  box-shadow:
    0 17px 45px hsl(var(--foreground) / .07);
}

.service-stat-icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 11px;
  background: hsl(var(--primary) / .1);
  color: hsl(var(--primary));
}

.service-stat-value {
  margin-top: 12px;
  font-size: 25px;
  font-weight: 950;
  letter-spacing: -.04em;
}

.service-stat-label {
  margin-top: 3px;
  color: hsl(var(--muted-foreground));
  font-size: 10px;
}

.service-stat-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 8px;
  color: hsl(var(--primary));
  font-size: 9px;
  font-weight: 800;
}

.service-toolbar {
  margin-top: 25px;
  padding: 16px;
  border: 1px solid hsl(var(--border));
  border-radius: 20px;
  background: hsl(var(--card));
  box-shadow:
    0 12px 35px hsl(var(--foreground) / .04);
}

.toolbar-main {
  display: flex;
  align-items: center;
  gap: 9px;
}

.service-search {
  position: relative;
  flex: 1;
}

.service-search svg {
  position: absolute;
  left: 13px;
  top: 50%;
  transform: translateY(-50%);
  color: hsl(var(--muted-foreground));
}

.service-search input {
  width: 100%;
  height: 44px;
  padding: 0 13px 0 40px;
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  outline: none;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-size: 12px;
}

.service-search input:focus {
  border-color: hsl(var(--primary) / .45);
  box-shadow:
    0 0 0 4px hsl(var(--primary) / .06);
}

.service-select {
  height: 44px;
  min-width: 145px;
  padding: 0 10px;
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  outline: none;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-size: 10px;
  font-weight: 700;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 7px;
  overflow-x: auto;
  margin-top: 13px;
  scrollbar-width: none;
}

.filter-row::-webkit-scrollbar {
  display: none;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
  padding: 8px 12px;
  border: 1px solid hsl(var(--border));
  border-radius: 999px;
  background: hsl(var(--background));
  color: hsl(var(--muted-foreground));
  font-size: 9px;
  font-weight: 850;
  cursor: pointer;
  transition: .18s ease;
}

.filter-chip:hover {
  border-color: hsl(var(--primary) / .4);
}

.filter-chip.active {
  border-color: hsl(var(--primary));
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

.results-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-top: 27px;
}

.results-title {
  font-size: 17px;
  font-weight: 950;
  letter-spacing: -.02em;
}

.results-description {
  margin-top: 4px;
  color: hsl(var(--muted-foreground));
  font-size: 10px;
}

.service-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 17px;
  margin-top: 16px;
}

.service-card {
  position: relative;
  overflow: hidden;
  padding: 19px;
  border: 1px solid hsl(var(--border));
  border-radius: 21px;
  background: hsl(var(--card));
  transition:
    transform .22s ease,
    box-shadow .22s ease,
    border-color .22s ease;
}

.service-card:hover {
  transform: translateY(-4px);
  border-color: hsl(var(--primary) / .25);
  box-shadow:
    0 20px 50px hsl(var(--foreground) / .08);
}

.service-card.featured {
  border-color: hsl(var(--primary) / .3);
}

.service-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.service-brand {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}

.service-avatar {
  display: grid;
  place-items: center;
  width: 45px;
  height: 45px;
  flex: 0 0 auto;
  border-radius: 13px;
  background:
    linear-gradient(
      135deg,
      hsl(var(--primary) / .15),
      hsl(var(--primary) / .05)
    );
  color: hsl(var(--primary));
}

.service-name {
  overflow: hidden;
  font-size: 13px;
  font-weight: 950;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.service-type {
  margin-top: 3px;
  color: hsl(var(--muted-foreground));
  font-size: 9px;
  text-transform: capitalize;
}

.favorite-btn {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
  background: hsl(var(--background));
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  transition: .18s ease;
}

.favorite-btn:hover {
  color: hsl(var(--destructive));
  border-color: hsl(var(--destructive) / .25);
}

.favorite-btn.saved {
  color: hsl(var(--destructive));
  background: hsl(var(--destructive) / .08);
  border-color: hsl(var(--destructive) / .2);
}

.service-address {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  margin-top: 16px;
  color: hsl(var(--muted-foreground));
  font-size: 10px;
  line-height: 1.55;
}

.service-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 13px;
}

.meta-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 8px;
  border-radius: 8px;
  background: hsl(var(--accent));
  color: hsl(var(--muted-foreground));
  font-size: 8px;
  font-weight: 800;
}

.meta-pill.primary {
  background: hsl(var(--primary) / .09);
  color: hsl(var(--primary));
}

.meta-pill.success {
  background: hsl(var(--primary) / .1);
  color: hsl(var(--primary));
}

.meta-pill.closed {
  background: hsl(var(--muted));
}

.service-divider {
  height: 1px;
  margin: 16px 0;
  background: hsl(var(--border));
}

.service-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 9px;
}

.phone-number {
  display: flex;
  align-items: center;
  gap: 6px;
  color: hsl(var(--foreground));
  font-size: 10px;
  font-weight: 800;
}

.service-buttons {
  display: flex;
  gap: 6px;
}

.service-buttons button,
.service-buttons a {
  min-height: 34px;
}

.service-rating {
  display: flex;
  align-items: center;
  gap: 3px;
  color: hsl(var(--muted-foreground));
  font-size: 9px;
}

.emergency-panel {
  position: relative;
  overflow: hidden;
  margin-top: 24px;
  padding: 21px;
  border: 1px solid hsl(var(--destructive) / .2);
  border-radius: 21px;
  background:
    linear-gradient(
      135deg,
      hsl(var(--destructive) / .07),
      transparent
    ),
    hsl(var(--card));
}

.emergency-panel::after {
  content: "";
  position: absolute;
  width: 150px;
  height: 150px;
  right: -60px;
  bottom: -90px;
  border-radius: 50%;
  background: hsl(var(--destructive) / .06);
}

.emergency-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 14px;
}

.emergency-icon {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  flex: 0 0 auto;
  border-radius: 13px;
  background: hsl(var(--destructive) / .1);
  color: hsl(var(--destructive));
}

.emergency-title {
  font-size: 13px;
  font-weight: 950;
}

.emergency-text {
  max-width: 700px;
  margin-top: 4px;
  color: hsl(var(--muted-foreground));
  font-size: 9px;
  line-height: 1.6;
}

.details-backdrop {
  position: fixed;
  z-index: 100;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 17px;
  background: hsl(var(--foreground) / .58);
  backdrop-filter: blur(8px);
}

.details-modal {
  width: min(650px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid hsl(var(--border));
  border-radius: 23px;
  background: hsl(var(--card));
  box-shadow:
    0 35px 100px hsl(var(--foreground) / .3);
}

.modal-head {
  position: sticky;
  z-index: 5;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 17px 20px;
  border-bottom: 1px solid hsl(var(--border));
  background: hsl(var(--card) / .95);
  backdrop-filter: blur(15px);
}

.modal-heading {
  font-size: 15px;
  font-weight: 950;
}

.modal-subheading {
  margin-top: 3px;
  color: hsl(var(--muted-foreground));
  font-size: 9px;
}

.modal-close {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 1px solid hsl(var(--border));
  border-radius: 9px;
  background: hsl(var(--background));
  cursor: pointer;
}

.modal-body {
  padding: 20px;
}

.modal-service-hero {
  padding: 18px;
  border-radius: 17px;
  background:
    linear-gradient(
      135deg,
      hsl(var(--primary) / .11),
      transparent
    );
}

.modal-service-name {
  margin-top: 11px;
  font-size: 22px;
  font-weight: 950;
  letter-spacing: -.035em;
}

.modal-service-address {
  margin-top: 5px;
  color: hsl(var(--muted-foreground));
  font-size: 10px;
}

.details-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 15px;
}

.detail-box {
  padding: 13px;
  border: 1px solid hsl(var(--border));
  border-radius: 13px;
}

.detail-label {
  color: hsl(var(--muted-foreground));
  font-size: 8px;
  font-weight: 850;
  text-transform: uppercase;
}

.detail-value {
  margin-top: 5px;
  font-size: 11px;
  font-weight: 900;
}

.modal-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 17px;
  padding-top: 15px;
  border-top: 1px solid hsl(var(--border));
}

.real-world-note {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 24px;
  padding: 15px;
  border: 1px solid hsl(var(--primary) / .15);
  border-radius: 16px;
  background: hsl(var(--primary) / .04);
}

.real-world-note-icon {
  color: hsl(var(--primary));
}

.real-world-note-title {
  font-size: 10px;
  font-weight: 900;
}

.real-world-note-text {
  margin-top: 4px;
  color: hsl(var(--muted-foreground));
  font-size: 9px;
  line-height: 1.6;
}

@media (max-width: 1050px) {
  .service-stats {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .nearby-hero-grid {
    grid-template-columns: 1fr;
  }

  .service-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .toolbar-main {
    flex-wrap: wrap;
  }

  .service-search {
    flex-basis: 100%;
  }

  .service-select {
    flex: 1;
    min-width: 0;
  }
}

@media (max-width: 560px) {
  .nearby-hero {
    padding: 23px;
  }

  .service-stats {
    grid-template-columns: 1fr;
  }

  .nearby-actions {
    flex-direction: column;
  }

  .nearby-actions button {
    width: 100%;
  }

  .results-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .service-bottom {
    align-items: flex-start;
    flex-direction: column;
  }

  .service-buttons {
    width: 100%;
  }

  .service-buttons button,
  .service-buttons a {
    flex: 1;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .emergency-content {
    align-items: flex-start;
  }
}

@media print {
  .nearby-page {
    background: white;
  }

  .nearby-actions,
  .service-toolbar,
  .favorite-btn,
  .service-buttons,
  .details-backdrop,
  .emergency-panel {
    display: none !important;
  }

  .nearby-hero,
  .service-card,
  .service-stat {
    box-shadow: none !important;
    break-inside: avoid;
  }
}
`;

function normalizePhone(phone: string) {
  return phone.replace(/\\s/g, "");
}

function serviceIcon(type: string) {
  switch (type.toLowerCase()) {
    case "vet":
      return UserRound;

    case "equipment rental":
      return Tractor;

    case "soil lab":
      return Wheat;

    case "seed store":
      return SproutIcon;

    case "mandi":
      return Truck;

    default:
      return MapPin;
  }
}

function SproutIcon(props: any) {
  return <Wheat {...props} />;
}

export default function NearbyAgricultureServices() {
  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["nearby-services"],
    queryFn: agricultureApi.getNearbyServices,
  });

  const [type, setType] =
    useState<ServiceType>("all");

  const [status, setStatus] =
    useState<StatusFilter>("all");

  const [sortMode, setSortMode] =
    useState<SortMode>("distance");

  const [query, setQuery] =
    useState("");

  const [selectedService, setSelectedService] =
    useState<any | null>(null);

  const [favorites, setFavorites] =
    useState<string[]>([]);

  const services = data ?? [];

  const toggleFavorite = (id: string) => {
    setFavorites((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );
  };

  const filteredServices = useMemo(() => {
    const search =
      query.trim().toLowerCase();

    const filtered = services.filter((service) => {
      const searchable = [
        service.name,
        service.address,
        service.type,
        service.phone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !search ||
        searchable.includes(search);

      const matchesType =
        type === "all" ||
        service.type === type;

      const matchesStatus =
        status === "all" ||
        (status === "open"
          ? service.openNow
          : !service.openNow);

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus
      );
    });

    return [...filtered].sort(
      (a, b) => {
        if (sortMode === "name") {
          return a.name.localeCompare(
            b.name,
          );
        }

        if (
          sortMode === "availability"
        ) {
          return (
            Number(b.openNow) -
            Number(a.openNow)
          );
        }

        return (
          Number(a.distanceKm) -
          Number(b.distanceKm)
        );
      },
    );
  }, [
    services,
    query,
    type,
    status,
    sortMode,
  ]);

  const openCount = services.filter(
    (service) => service.openNow,
  ).length;

  const closestDistance =
    services.length > 0
      ? Math.min(
          ...services.map((service) =>
            Number(service.distanceKm),
          ),
        )
      : 0;

  const serviceTypes =
    new Set(
      services.map(
        (service) => service.type,
      ),
    ).size;

  const nearestService =
    [...services].sort(
      (a, b) =>
        Number(a.distanceKm) -
        Number(b.distanceKm),
    )[0];

  if (isError) {
    return (
      <div className="nearby-page">
        <style>{styles}</style>

        <AgriculturePageHeader
          icon={MapPin}
          title="Nearby Agriculture Services"
          description="Find nearby mandis, veterinarians, soil laboratories, seed stores and agricultural equipment services."
        />

        <div className="py-20 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertCircle size={28} />
          </div>

          <h3 className="mt-4 text-lg font-black">
            Services could not be loaded
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            We could not retrieve nearby agriculture service information. Please try again.
          </p>

          <Button
            className="mt-5"
            onClick={() => refetch()}
          >
            <LocateFixed className="mr-2 size-4" />
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="nearby-page">
        <style>{styles}</style>

        <AgriculturePageHeader
          icon={MapPin}
          title="Nearby Agriculture Services"
          description="Find the nearest agriculture services for your farm."
        />

        <LoadingState rows={5} />
      </div>
    );
  }

  if (!services.length) {
    return (
      <div className="nearby-page">
        <style>{styles}</style>

        <AgriculturePageHeader
          icon={MapPin}
          title="Nearby Agriculture Services"
          description="Find mandis, veterinary care, soil labs, seed stores and farm equipment services around you."
        />

        <EmptyState
          icon={MapPin}
          title="No nearby services found"
          description="There are currently no agriculture service records available for your area."
        />
      </div>
    );
  }

  return (
    <div className="nearby-page">
      <style>{styles}</style>

      <AgriculturePageHeader
        icon={MapPin}
        title="Nearby Agriculture Services"
        description="Find the nearest mandi, veterinarian, soil lab, seed store and equipment rental service with distance, availability and contact information."
      />

      {/* HERO */}
      <section className="nearby-hero">
        <div className="nearby-hero-grid">
          <div>
            <div className="nearby-kicker">
              <LocateFixed size={13} />
              Smart Local Agriculture Network
            </div>

            <h1 className="nearby-title">
              Farm services,
              <br />
              <span>closer to you.</span>
            </h1>

            <p className="nearby-description">
              Stop wasting time searching for essential agricultural services. Discover nearby markets, veterinary care, soil testing, seed suppliers and equipment rentals from one farmer-friendly dashboard.
            </p>

            <div className="nearby-actions">
              <Button
                onClick={() => {
                  setStatus("open");
                  setSortMode("distance");
                }}
              >
                <LocateFixed className="mr-2 size-4" />
                Find open services
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setType("mandi");
                  setStatus("all");
                }}
              >
                <Truck className="mr-2 size-4" />
                Find nearest mandi
              </Button>

              <Button
                variant="ghost"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <LocateFixed
                  className={`mr-2 size-4 ${
                    isFetching
                      ? "animate-spin"
                      : ""
                  }`}
                />
                Refresh location data
              </Button>
            </div>
          </div>

          <div className="location-card">
            <div className="location-icon">
              <Navigation size={21} />
            </div>

            <div className="location-label">
              Nearby service coverage
            </div>

            <div className="location-title">
              Local farm network
            </div>

            <div className="location-text">
              Services are ordered by distance so farmers can quickly identify the most convenient option.
            </div>

            <div className="location-status">
              <CheckCircle2 size={12} />
              {services.length} services detected
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="service-stats">
        <div className="service-stat">
          <div className="service-stat-icon">
            <MapPin size={19} />
          </div>

          <div className="service-stat-value">
            {services.length}
          </div>

          <div className="service-stat-label">
            Nearby services
          </div>

          <div className="service-stat-meta">
            <ShieldCheck size={11} />
            Available in network
          </div>
        </div>

        <div className="service-stat">
          <div className="service-stat-icon">
            <Clock size={19} />
          </div>

          <div className="service-stat-value">
            {openCount}
          </div>

          <div className="service-stat-label">
            Open now
          </div>

          <div className="service-stat-meta">
            <CheckCircle2 size={11} />
            Ready to contact
          </div>
        </div>

        <div className="service-stat">
          <div className="service-stat-icon">
            <Navigation size={19} />
          </div>

          <div className="service-stat-value">
            {closestDistance.toFixed(1)} km
          </div>

          <div className="service-stat-label">
            Closest service
          </div>

          <div className="service-stat-meta">
            <LocateFixed size={11} />
            Nearest available record
          </div>
        </div>

        <div className="service-stat">
          <div className="service-stat-icon">
            <Wheat size={19} />
          </div>

          <div className="service-stat-value">
            {serviceTypes}
          </div>

          <div className="service-stat-label">
            Service categories
          </div>

          <div className="service-stat-meta">
            <Filter size={11} />
            Multiple farm needs
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <section className="service-toolbar">
        <div className="toolbar-main">
          <div className="service-search">
            <Search size={16} />

            <input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search service, village, category or phone..."
              aria-label="Search agriculture services"
            />
          </div>

          <select
            className="service-select"
            value={sortMode}
            onChange={(event) =>
              setSortMode(
                event.target.value as SortMode,
              )
            }
            aria-label="Sort services"
          >
            <option value="distance">
              Nearest first
            </option>

            <option value="availability">
              Open first
            </option>

            <option value="name">
              Name A-Z
            </option>
          </select>

          <Button
            size="icon"
            variant="outline"
            onClick={() => {
              setQuery("");
              setType("all");
              setStatus("all");
              setSortMode("distance");
            }}
            title="Reset filters"
          >
            <SlidersHorizontal size={16} />
          </Button>
        </div>

        <div className="filter-row">
          {types.map((item) => (
            <button
              key={item}
              className={`filter-chip ${
                type === item
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setType(item)
              }
            >
              {item === "all" ? (
                <Filter size={12} />
              ) : (
                <MapPin size={12} />
              )}

              {item}
            </button>
          ))}

          <button
            className={`filter-chip ${
              status === "open"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setStatus(
                status === "open"
                  ? "all"
                  : "open",
              )
            }
          >
            <CheckCircle2 size={12} />
            Open now
          </button>

          <button
            className={`filter-chip ${
              status === "closed"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setStatus(
                status === "closed"
                  ? "all"
                  : "closed",
              )
            }
          >
            <Clock size={12} />
            Closed
          </button>
        </div>
      </section>

      {/* RESULTS */}
      <div className="results-header">
        <div>
          <div className="results-title">
            Agriculture services
          </div>

          <div className="results-description">
            Showing {filteredServices.length} of{" "}
            {services.length} nearby services
          </div>
        </div>

        <Badge variant="secondary">
          <ArrowUpDown className="mr-1 size-3" />
          {sortMode === "distance"
            ? "Nearest"
            : sortMode ===
                "availability"
              ? "Open first"
              : "Alphabetical"}
        </Badge>
      </div>

      {filteredServices.length ? (
        <div className="service-grid">
          {filteredServices.map((service) => {
            const Icon =
              serviceIcon(service.type);

            const isFavorite =
              favorites.includes(
                service.id,
              );

            const isNearest =
              nearestService?.id ===
              service.id;

            return (
              <article
                key={service.id}
                className={`service-card ${
                  isNearest
                    ? "featured"
                    : ""
                }`}
              >
                <div className="service-card-top">
                  <div className="service-brand">
                    <div className="service-avatar">
                      <Icon size={20} />
                    </div>

                    <div className="min-w-0">
                      <div className="service-name">
                        {service.name}
                      </div>

                      <div className="service-type">
                        {service.type}
                      </div>
                    </div>
                  </div>

                  <button
                    className={`favorite-btn ${
                      isFavorite
                        ? "saved"
                        : ""
                    }`}
                    onClick={() =>
                      toggleFavorite(
                        service.id,
                      )
                    }
                    aria-label={
                      isFavorite
                        ? "Remove from favorites"
                        : "Save service"
                    }
                  >
                    <Heart
                      size={15}
                      fill={
                        isFavorite
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>
                </div>

                {isNearest && (
                  <Badge className="mt-3">
                    <Navigation className="mr-1 size-3" />
                    Nearest service
                  </Badge>
                )}

                <div className="service-address">
                  <MapPin
                    className="mt-0.5 size-4 shrink-0 text-primary"
                    aria-hidden
                  />

                  <span>
                    {service.address}
                  </span>
                </div>

                <div className="service-meta">
                  <span className="meta-pill primary">
                    <Navigation size={11} />
                    {service.distanceKm} km
                  </span>

                  <span
                    className={`meta-pill ${
                      service.openNow
                        ? "success"
                        : "closed"
                    }`}
                  >
                    {service.openNow ? (
                      <>
                        <CheckCircle2
                          size={11}
                        />
                        Open now
                      </>
                    ) : (
                      <>
                        <Clock size={11} />
                        Closed
                      </>
                    )}
                  </span>

                  <span className="meta-pill">
                    <Star size={11} />
                    Local service
                  </span>
                </div>

                <div className="service-divider" />

                <div className="service-bottom">
                  <div>
                    <div className="phone-number">
                      <Phone
                        size={13}
                        className="text-primary"
                      />

                      {service.phone}
                    </div>

                    <div className="service-rating mt-2">
                      <ShieldCheck size={10} />
                      Agriculture service listing
                    </div>
                  </div>

                  <div className="service-buttons">
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                    >
                      <a
                        href={`tel:${normalizePhone(
                          service.phone,
                        )}`}
                      >
                        <Phone className="mr-1 size-3.5" />
                        Call
                      </a>
                    </Button>

                    <Button
                      size="sm"
                      onClick={() =>
                        setSelectedService(
                          service,
                        )
                      }
                    >
                      Details
                      <ChevronRight className="ml-1 size-3.5" />
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border bg-card py-16 text-center">
          <Search className="mx-auto size-9 text-muted-foreground" />

          <div className="mt-3 text-sm font-black">
            No matching services
          </div>

          <div className="mt-1 text-xs text-muted-foreground">
            Try another category, search term or availability filter.
          </div>

          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setQuery("");
              setType("all");
              setStatus("all");
            }}
          >
            Clear all filters
          </Button>
        </div>
      )}

      {/* EMERGENCY FARM SUPPORT */}
      <section className="emergency-panel">
        <div className="emergency-content">
          <div className="emergency-icon">
            <AlertCircle size={22} />
          </div>

          <div className="flex-1">
            <div className="emergency-title">
              Need urgent agricultural support?
            </div>

            <div className="emergency-text">
              For serious livestock emergencies, urgent crop disease outbreaks, major equipment failures or immediate farm assistance, contact the appropriate local professional before taking action.
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              setType("vet");
              setStatus("open");
            }}
          >
            Find open vet
          </Button>
        </div>
      </section>

      {/* REAL WORLD INFORMATION */}
      <section className="real-world-note">
        <Info
          size={17}
          className="real-world-note-icon"
        />

        <div>
          <div className="real-world-note-title">
            Built for real farm decisions
          </div>

          <div className="real-world-note-text">
            Before travelling, call the service to confirm operating hours, stock availability, consultation availability and current location. Distance and open/closed status should be treated as operational information rather than a guarantee.
          </div>
        </div>
      </section>

      {/* DETAILS MODAL */}
      {selectedService && (
        <div
          className="details-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedService(null);
            }
          }}
        >
          <div className="details-modal">
            <div className="modal-head">
              <div>
                <div className="modal-heading">
                  Service details
                </div>

                <div className="modal-subheading">
                  Nearby agriculture service
                </div>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setSelectedService(
                    null,
                  )
                }
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-service-hero">
                <div className="flex flex-wrap gap-2">
                  <Badge>
                    {selectedService.type}
                  </Badge>

                  {selectedService.openNow ? (
                    <Badge variant="secondary">
                      <CheckCircle2 className="mr-1 size-3" />
                      Open now
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <Clock className="mr-1 size-3" />
                      Currently closed
                    </Badge>
                  )}
                </div>

                <div className="modal-service-name">
                  {selectedService.name}
                </div>

                <div className="modal-service-address">
                  <MapPin className="mr-1 inline size-3" />
                  {selectedService.address}
                </div>
              </div>

              <div className="details-grid">
                <div className="detail-box">
                  <div className="detail-label">
                    Distance
                  </div>

                  <div className="detail-value">
                    <Navigation className="mr-1 inline size-3 text-primary" />
                    {
                      selectedService.distanceKm
                    }{" "}
                    km away
                  </div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">
                    Service category
                  </div>

                  <div className="detail-value capitalize">
                    {selectedService.type}
                  </div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">
                    Contact
                  </div>

                  <div className="detail-value">
                    <Phone className="mr-1 inline size-3 text-primary" />
                    {selectedService.phone}
                  </div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">
                    Availability
                  </div>

                  <div className="detail-value">
                    {selectedService.openNow
                      ? "Open now"
                      : "Closed now"}
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <Button asChild>
                  <a
                    href={`tel:${normalizePhone(
                      selectedService.phone,
                    )}`}
                  >
                    <Phone className="mr-2 size-4" />
                    Call service
                  </a>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    const address =
                      encodeURIComponent(
                        selectedService.address,
                      );

                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${address}`,
                      "_blank",
                    );
                  }}
                >
                  <ExternalLink className="mr-2 size-4" />
                  Open in Maps
                </Button>

                <Button
                  variant="ghost"
                  onClick={() =>
                    toggleFavorite(
                      selectedService.id,
                    )
                  }
                >
                  <Bookmark
                    className="mr-2 size-4"
                  />
                  {favorites.includes(
                    selectedService.id,
                  )
                    ? "Saved"
                    : "Save service"}
                </Button>
              </div>

              <div className="real-world-note">
                <ShieldCheck
                  size={17}
                  className="real-world-note-icon"
                />

                <div>
                  <div className="real-world-note-title">
                    Before you travel
                  </div>

                  <div className="real-world-note-text">
                    Call first to confirm that the service is open and that the required seed, equipment, veterinary support, soil test or market facility is available.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}