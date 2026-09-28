import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Beaker,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Clock,
  Droplets,
  Filter,
  IndianRupee,
  Leaf,
  MapPin,
  Package,
  Percent,
  RefreshCw,
  Search,
  ShieldCheck,
  Sprout,
  Target,
  TrendingDown,
  TrendingUp,
  Weight,
  X,
  Zap,
} from "lucide-react";

import { AgriculturePageHeader } from "@/components/agriculture/AgriculturePageHeader";
import { StatCard } from "@/components/agriculture/StatCard";
import { ChartCard } from "@/components/agriculture/ChartCard";
import { EmptyState } from "@/components/agriculture/EmptyState";
import { LoadingState } from "@/components/agriculture/Loadingstate";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  agricultureApi,
  formatCurrency,
  formatDate,
} from "@/services/agricultureApi";

/* =========================================================
   CONFIG
========================================================= */

const PRICE_PER_KG = 32;

type FilterMode =
  | "all"
  | "upcoming"
  | "today"
  | "overdue";

type SortMode =
  | "date"
  | "quantity"
  | "crop"
  | "cost";

/* =========================================================
   CSS
========================================================= */

const styles = `
.fertilizer-page {
  min-height: 100vh;
  padding-bottom: 80px;
  background:
    radial-gradient(
      circle at 0% 0%,
      hsl(var(--primary) / .08),
      transparent 30%
    ),
    radial-gradient(
      circle at 100% 20%,
      hsl(var(--chart-2) / .07),
      transparent 28%
    );
}

/* ========================================================
   HERO
======================================================== */

.fertilizer-hero {
  position: relative;
  overflow: hidden;
  margin-top: 24px;
  padding: 32px;
  border: 1px solid hsl(var(--border));
  border-radius: 28px;
  background:
    linear-gradient(
      135deg,
      hsl(var(--primary) / .14),
      transparent 58%
    ),
    hsl(var(--card));
  box-shadow:
    0 25px 70px hsl(var(--foreground) / .07);
}

.fertilizer-hero::before {
  content: "";
  position: absolute;
  width: 360px;
  height: 360px;
  right: -170px;
  top: -200px;
  border-radius: 50%;
  background: hsl(var(--primary) / .08);
}

.fertilizer-hero::after {
  content: "";
  position: absolute;
  width: 190px;
  height: 190px;
  left: 45%;
  bottom: -140px;
  border-radius: 50%;
  background: hsl(var(--chart-2) / .08);
}

.fertilizer-hero-grid {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns:
    minmax(0, 1.45fr)
    minmax(280px, .55fr);
  gap: 30px;
  align-items: center;
}

.fertilizer-kicker {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 12px;
  border-radius: 999px;
  background: hsl(var(--primary) / .1);
  color: hsl(var(--primary));
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .07em;
  text-transform: uppercase;
}

.fertilizer-title {
  margin-top: 15px;
  font-size: clamp(31px, 5vw, 56px);
  line-height: .98;
  font-weight: 950;
  letter-spacing: -.055em;
}

.fertilizer-title span {
  color: hsl(var(--primary));
}

.fertilizer-description {
  max-width: 720px;
  margin-top: 16px;
  color: hsl(var(--muted-foreground));
  font-size: 14px;
  line-height: 1.75;
}

.fertilizer-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin-top: 22px;
}

/* ========================================================
   NUTRIENT SCORE
======================================================== */

.nutrient-score {
  padding: 22px;
  border: 1px solid hsl(var(--border));
  border-radius: 21px;
  background: hsl(var(--background) / .7);
  backdrop-filter: blur(15px);
}

.nutrient-score-label {
  color: hsl(var(--muted-foreground));
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .06em;
  text-transform: uppercase;
}

.nutrient-score-number {
  margin-top: 10px;
  font-size: 48px;
  line-height: 1;
  font-weight: 950;
  letter-spacing: -.06em;
}

.nutrient-score-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 9px;
  padding: 6px 10px;
  border-radius: 999px;
  background: hsl(var(--primary) / .1);
  color: hsl(var(--primary));
  font-size: 10px;
  font-weight: 900;
}

.nutrient-track {
  height: 9px;
  overflow: hidden;
  margin-top: 18px;
  border-radius: 999px;
  background: hsl(var(--muted));
}

.nutrient-fill {
  height: 100%;
  border-radius: inherit;
  background: hsl(var(--primary));
  transition: width .6s ease;
}

.nutrient-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  color: hsl(var(--muted-foreground));
  font-size: 10px;
}

/* ========================================================
   STAT CARDS
======================================================== */

.fertilizer-stats {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 15px;
  margin-top: 22px;
}

.f-stat {
  position: relative;
  overflow: hidden;
  padding: 18px;
  border: 1px solid hsl(var(--border));
  border-radius: 19px;
  background: hsl(var(--card));
  transition:
    transform .2s ease,
    box-shadow .2s ease;
}

.f-stat:hover {
  transform: translateY(-3px);
  box-shadow:
    0 18px 45px hsl(var(--foreground) / .07);
}

.f-stat-icon {
  display: grid;
  place-items: center;
  width: 43px;
  height: 43px;
  border-radius: 12px;
  background: hsl(var(--primary) / .1);
  color: hsl(var(--primary));
}

.f-stat-value {
  margin-top: 13px;
  font-size: 26px;
  font-weight: 950;
  letter-spacing: -.04em;
}

.f-stat-label {
  margin-top: 3px;
  color: hsl(var(--muted-foreground));
  font-size: 11px;
}

.f-stat-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 9px;
  color: hsl(var(--primary));
  font-size: 10px;
  font-weight: 800;
}

/* ========================================================
   ALERT
======================================================== */

.fertilizer-alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 20px;
  padding: 15px 17px;
  border: 1px solid hsl(var(--destructive) / .2);
  border-radius: 16px;
  background: hsl(var(--destructive) / .05);
}

.fertilizer-alert-icon {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  border-radius: 10px;
  background: hsl(var(--destructive) / .1);
  color: hsl(var(--destructive));
}

.fertilizer-alert-title {
  font-size: 12px;
  font-weight: 900;
}

.fertilizer-alert-text {
  margin-top: 3px;
  color: hsl(var(--muted-foreground));
  font-size: 10px;
  line-height: 1.6;
}

/* ========================================================
   ANALYTICS GRID
======================================================== */

.fertilizer-analytics {
  display: grid;
  grid-template-columns:
    minmax(0, 1.3fr)
    minmax(290px, .7fr);
  gap: 18px;
  margin-top: 24px;
}

.analytics-panel {
  min-width: 0;
  padding: 19px;
  border: 1px solid hsl(var(--border));
  border-radius: 20px;
  background: hsl(var(--card));
}

.analytics-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 14px;
  font-weight: 900;
}

.analytics-subheading {
  margin-top: 4px;
  color: hsl(var(--muted-foreground));
  font-size: 10px;
  line-height: 1.5;
}

/* ========================================================
   CROP USAGE
======================================================== */

.crop-list {
  display: grid;
  gap: 12px;
  margin-top: 18px;
}

.crop-row {
  padding: 12px;
  border: 1px solid hsl(var(--border));
  border-radius: 13px;
  background: hsl(var(--background) / .4);
}

.crop-row-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.crop-name {
  font-size: 11px;
  font-weight: 900;
}

.crop-value {
  font-size: 10px;
  font-weight: 800;
}

.crop-track {
  height: 6px;
  overflow: hidden;
  margin-top: 8px;
  border-radius: 999px;
  background: hsl(var(--muted));
}

.crop-fill {
  height: 100%;
  border-radius: inherit;
  background: hsl(var(--primary));
}

/* ========================================================
   HEALTH METRICS
======================================================== */

.health-list {
  display: grid;
  gap: 9px;
  margin-top: 17px;
}

.health-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background: hsl(var(--accent) / .55);
}

.health-left {
  display: flex;
  align-items: center;
  gap: 9px;
}

.health-icon {
  display: grid;
  place-items: center;
  width: 33px;
  height: 33px;
  border-radius: 9px;
  background: hsl(var(--primary) / .1);
  color: hsl(var(--primary));
}

.health-name {
  font-size: 10px;
  font-weight: 900;
}

.health-description {
  margin-top: 2px;
  color: hsl(var(--muted-foreground));
  font-size: 8px;
}

/* ========================================================
   TOOLBAR
======================================================== */

.fertilizer-toolbar {
  margin-top: 25px;
  padding: 15px;
  border: 1px solid hsl(var(--border));
  border-radius: 18px;
  background: hsl(var(--card));
}

.toolbar-row {
  display: flex;
  align-items: center;
  gap: 9px;
}

.fertilizer-search {
  position: relative;
  flex: 1;
}

.fertilizer-search svg {
  position: absolute;
  left: 13px;
  top: 50%;
  transform: translateY(-50%);
  color: hsl(var(--muted-foreground));
}

.fertilizer-search input {
  width: 100%;
  height: 43px;
  padding: 0 12px 0 39px;
  border: 1px solid hsl(var(--border));
  border-radius: 11px;
  outline: none;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-size: 12px;
}

.fertilizer-search input:focus {
  border-color: hsl(var(--primary) / .45);
  box-shadow:
    0 0 0 4px hsl(var(--primary) / .06);
}

.fertilizer-select {
  height: 43px;
  min-width: 140px;
  padding: 0 10px;
  border: 1px solid hsl(var(--border));
  border-radius: 11px;
  outline: none;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-size: 11px;
}

.filter-pills {
  display: flex;
  gap: 7px;
  overflow-x: auto;
  margin-top: 12px;
  scrollbar-width: none;
}

.filter-pills::-webkit-scrollbar {
  display: none;
}

.filter-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex: 0 0 auto;
  padding: 7px 12px;
  border: 1px solid hsl(var(--border));
  border-radius: 999px;
  background: hsl(var(--background));
  color: hsl(var(--muted-foreground));
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
}

.filter-pill.active {
  border-color: hsl(var(--primary));
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

/* ========================================================
   TABLE
======================================================== */

.fertilizer-table {
  overflow: hidden;
  margin-top: 18px;
  border: 1px solid hsl(var(--border));
  border-radius: 20px;
  background: hsl(var(--card));
}

.table-header-area {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 17px;
  border-bottom: 1px solid hsl(var(--border));
}

.table-title {
  font-size: 14px;
  font-weight: 900;
}

.table-subtitle {
  margin-top: 3px;
  color: hsl(var(--muted-foreground));
  font-size: 9px;
}

.table-scroll {
  overflow-x: auto;
}

.application-row {
  cursor: pointer;
  transition: background .15s ease;
}

.application-row:hover {
  background: hsl(var(--accent) / .45);
}

.crop-cell {
  min-width: 180px;
}

.crop-cell-title {
  font-size: 11px;
  font-weight: 900;
}

.crop-cell-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 4px;
  color: hsl(var(--muted-foreground));
  font-size: 9px;
}

.product-cell {
  min-width: 145px;
}

.product-name {
  font-size: 10px;
  font-weight: 800;
}

.product-meta {
  margin-top: 3px;
  color: hsl(var(--muted-foreground));
  font-size: 8px;
}

.quantity-highlight {
  font-weight: 900;
  color: hsl(var(--primary));
}

.date-normal {
  font-size: 10px;
  font-weight: 700;
}

.date-overdue {
  color: hsl(var(--destructive));
  font-weight: 900;
}

.date-today {
  color: hsl(var(--primary));
  font-weight: 900;
}

/* ========================================================
   DETAIL MODAL
======================================================== */

.fertilizer-modal-backdrop {
  position: fixed;
  z-index: 100;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 18px;
  background: hsl(var(--foreground) / .58);
  backdrop-filter: blur(8px);
}

.fertilizer-modal {
  width: min(650px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid hsl(var(--border));
  border-radius: 23px;
  background: hsl(var(--card));
  box-shadow:
    0 35px 100px hsl(var(--foreground) / .28);
}

.modal-head {
  position: sticky;
  top: 0;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 17px 20px;
  border-bottom: 1px solid hsl(var(--border));
  background: hsl(var(--card) / .95);
  backdrop-filter: blur(15px);
}

.modal-title {
  font-size: 15px;
  font-weight: 900;
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

.application-hero {
  padding: 17px;
  border-radius: 16px;
  background:
    linear-gradient(
      135deg,
      hsl(var(--primary) / .1),
      transparent
    );
}

.application-title {
  margin-top: 10px;
  font-size: 20px;
  font-weight: 950;
  letter-spacing: -.03em;
}

.application-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 15px;
}

.application-box {
  padding: 13px;
  border: 1px solid hsl(var(--border));
  border-radius: 13px;
}

.application-label {
  color: hsl(var(--muted-foreground));
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
}

.application-value {
  margin-top: 5px;
  font-size: 11px;
  font-weight: 900;
}

.note-box {
  margin-top: 14px;
  padding: 14px;
  border: 1px solid hsl(var(--primary) / .15);
  border-radius: 13px;
  background: hsl(var(--primary) / .04);
}

.note-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 900;
}

.note-text {
  margin-top: 6px;
  color: hsl(var(--muted-foreground));
  font-size: 10px;
  line-height: 1.65;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 18px;
  padding-top: 15px;
  border-top: 1px solid hsl(var(--border));
}

/* ========================================================
   RESPONSIVE
======================================================== */

@media (max-width: 1100px) {
  .fertilizer-stats {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .fertilizer-analytics {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 850px) {
  .fertilizer-hero-grid {
    grid-template-columns: 1fr;
  }

  .toolbar-row {
    flex-wrap: wrap;
  }

  .fertilizer-search {
    flex-basis: 100%;
  }
}

@media (max-width: 600px) {
  .fertilizer-hero {
    padding: 23px;
  }

  .fertilizer-stats {
    grid-template-columns: 1fr;
  }

  .fertilizer-actions {
    flex-direction: column;
  }

  .fertilizer-actions button {
    width: 100%;
  }

  .fertilizer-select {
    flex: 1;
  }

  .application-grid {
    grid-template-columns: 1fr;
  }
}

/* ========================================================
   PRINT
======================================================== */

@media print {
  .fertilizer-actions,
  .fertilizer-toolbar,
  .fertilizer-modal-backdrop,
  button {
    display: none !important;
  }

  .fertilizer-page {
    background: white;
  }

  .fertilizer-hero,
  .f-stat,
  .analytics-panel,
  .fertilizer-table {
    box-shadow: none !important;
    break-inside: avoid;
  }
}
`;

/* =========================================================
   DATE HELPERS
========================================================= */

function getDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date;
}

function isToday(value: string) {
  const date = getDate(value);

  if (!date) return false;

  const now = new Date();

  return (
    date.getFullYear() ===
      now.getFullYear() &&
    date.getMonth() ===
      now.getMonth() &&
    date.getDate() ===
      now.getDate()
  );
}

function isOverdue(value: string) {
  const date = getDate(value);

  if (!date) return false;

  const today = new Date();

  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  return date < today;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function FertilizerPlanner() {
  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["fertilizer-plans"],
    queryFn:
      agricultureApi.getFertilizerPlans,
  });

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<FilterMode>("all");

  const [sortMode, setSortMode] =
    useState<SortMode>("date");

  const [selectedPlan, setSelectedPlan] =
    useState<any | null>(null);

  const [productFilter, setProductFilter] =
    useState("All products");

  /* =======================================================
     SAFE DATA
  ======================================================= */

  const plans = data ?? [];

  /* =======================================================
     CALCULATIONS
  ======================================================= */

  const totalKg = plans.reduce(
    (total, plan) =>
      total +
      Number(plan.dosePerHa || 0) *
        Number(plan.area || 0),
    0,
  );

  const estimatedCost =
    totalKg * PRICE_PER_KG;

  const upcoming = plans.filter(
    (plan) =>
      !isOverdue(plan.applyOn) &&
      !isToday(plan.applyOn),
  ).length;

  const todayCount = plans.filter(
    (plan) =>
      isToday(plan.applyOn),
  ).length;

  const overdueCount = plans.filter(
    (plan) =>
      isOverdue(plan.applyOn),
  ).length;

  const averageDose =
    plans.length > 0
      ? totalKg / plans.length
      : 0;

  /* =======================================================
     PRODUCTS
  ======================================================= */

  const products = useMemo(
    () => [
      "All products",
      ...Array.from(
        new Set(
          plans.map(
            (plan) => plan.product,
          ),
        ),
      ),
    ],
    [plans],
  );

  /* =======================================================
     FILTERED PLANS
  ======================================================= */

  const visiblePlans = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    const filtered = plans.filter(
      (plan) => {
        const searchable = [
          plan.crop,
          plan.field,
          plan.stage,
          plan.product,
          plan.category,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          !query ||
          searchable.includes(query);

        const matchesProduct =
          productFilter ===
            "All products" ||
          plan.product ===
            productFilter;

        const matchesFilter =
          filter === "all"
            ? true
            : filter === "today"
              ? isToday(
                  plan.applyOn,
                )
              : filter ===
                  "overdue"
                ? isOverdue(
                    plan.applyOn,
                  )
                : !isOverdue(
                      plan.applyOn,
                    ) &&
                    !isToday(
                      plan.applyOn,
                    );

        return (
          matchesSearch &&
          matchesProduct &&
          matchesFilter
        );
      },
    );

    return [...filtered].sort(
      (a, b) => {
        if (
          sortMode === "quantity"
        ) {
          const aQty =
            Number(
              a.dosePerHa,
            ) *
            Number(a.area);

          const bQty =
            Number(
              b.dosePerHa,
            ) *
            Number(b.area);

          return bQty - aQty;
        }

        if (
          sortMode === "crop"
        ) {
          return a.crop.localeCompare(
            b.crop,
          );
        }

        if (
          sortMode === "cost"
        ) {
          const aCost =
            Number(
              a.dosePerHa,
            ) *
            Number(a.area) *
            PRICE_PER_KG;

          const bCost =
            Number(
              b.dosePerHa,
            ) *
            Number(b.area) *
            PRICE_PER_KG;

          return bCost - aCost;
        }

        return (
          (getDate(
            a.applyOn,
          )?.getTime() ?? 0) -
          (getDate(
            b.applyOn,
          )?.getTime() ?? 0)
        );
      },
    );
  }, [
    plans,
    search,
    filter,
    sortMode,
    productFilter,
  ]);

  /* =======================================================
     CROP ANALYTICS
  ======================================================= */

  const cropStats = useMemo(() => {
    const map: Record<
      string,
      number
    > = {};

    plans.forEach((plan) => {
      const quantity =
        Number(
          plan.dosePerHa || 0,
        ) *
        Number(plan.area || 0);

      map[plan.crop] =
        (map[plan.crop] || 0) +
        quantity;
    });

    const entries = Object.entries(
      map,
    )
      .map(
        ([crop, quantity]) => ({
          crop,
          quantity,
        }),
      )
      .sort(
        (a, b) =>
          b.quantity -
          a.quantity,
      );

    const max =
      entries[0]?.quantity || 1;

    return entries.map(
      (item) => ({
        ...item,
        percentage:
          (item.quantity /
            max) *
          100,
      }),
    );
  }, [plans]);

  /* =======================================================
     PRODUCT ANALYTICS
  ======================================================= */

  const productStats = useMemo(() => {
    const map: Record<
      string,
      number
    > = {};

    plans.forEach((plan) => {
      const quantity =
        Number(
          plan.dosePerHa || 0,
        ) *
        Number(plan.area || 0);

      map[plan.product] =
        (map[plan.product] || 0) +
        quantity;
    });

    return Object.entries(map)
      .map(
        ([product, quantity]) => ({
          product,
          quantity,
        }),
      )
      .sort(
        (a, b) =>
          b.quantity -
          a.quantity,
      );
  }, [plans]);

  /* =======================================================
     NUTRIENT SCORE
  ======================================================= */

  const nutrientScore =
    plans.length === 0
      ? 0
      : Math.min(
          100,
          Math.round(
            70 +
              plans.length * 3 -
              overdueCount * 12,
          ),
        );

  /* =======================================================
     ERROR
  ======================================================= */

  if (isError) {
    return (
      <div className="fertilizer-page">
        <style>{styles}</style>

        <AgriculturePageHeader
          icon={Beaker}
          title="Fertilizer Planner"
          description="Right product, right dose, right day. Manage fertilizer applications, quantities, costs and crop nutrition from one operational dashboard."
        />

        <div className="py-20 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-destructive/10 text-destructive">
            <RefreshCw size={27} />
          </div>

          <h3 className="mt-4 text-lg font-black">
            Fertilizer plans could not be loaded
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            The fertilizer planning service did not
            return the expected data.
          </p>

          <Button
            className="mt-5"
            onClick={() => refetch()}
          >
            <RefreshCw className="mr-2 size-4" />
            Try again
          </Button>
        </div>
      </div>
    );
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (isLoading) {
    return (
      <div>
        <style>{styles}</style>

        <AgriculturePageHeader
          icon={Beaker}
          title="Fertilizer Planner"
          description="Right product, right dose, right day. Doses are matched to your soil test and crop stage so you spend less and avoid burning the crop."
        />

        <LoadingState rows={5} />
      </div>
    );
  }

  /* =======================================================
     EMPTY
  ======================================================= */

  if (!plans.length) {
    return (
      <div className="fertilizer-page">
        <style>{styles}</style>

        <AgriculturePageHeader
          icon={Beaker}
          title="Fertilizer Planner"
          description="Right product, right dose, right day. Manage fertilizer applications, quantities, costs and crop nutrition from one operational dashboard."
        />

        <EmptyState
          icon={Beaker}
          title="No fertilizer plan yet"
          description="Add a crop, field and sowing information to build a season-long fertilizer application schedule."
        />
      </div>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <div className="fertilizer-page">
      <style>{styles}</style>

      <AgriculturePageHeader
        icon={Beaker}
        title="Fertilizer Planner"
        description="Right product, right dose, right day. Doses are matched to your soil test and crop stage so you spend less and avoid burning the crop."
      />

      {/* ===================================================
          HERO
      =================================================== */}

      <section className="fertilizer-hero">
        <div className="fertilizer-hero-grid">
          <div>
            <div className="fertilizer-kicker">
              <Beaker size={13} />
              Smart Nutrient Management
            </div>

            <h1 className="fertilizer-title">
              Feed your crops
              <br />
              <span>with precision.</span>
            </h1>

            <p className="fertilizer-description">
              Track fertilizer applications, estimate
              input costs, monitor field-wise nutrient
              workload and identify delayed applications
              before they affect crop performance.
            </p>

            <div className="fertilizer-actions">
              <Button
                onClick={() =>
                  window.print()
                }
              >
                <CalendarCheck className="mr-2 size-4" />
                Print application schedule
              </Button>

              <Button
                variant="outline"
                onClick={() =>
                  setFilter("upcoming")
                }
              >
                <Clock className="mr-2 size-4" />
                View upcoming
              </Button>

              <Button
                variant="ghost"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCw
                  className={`mr-2 size-4 ${
                    isFetching
                      ? "animate-spin"
                      : ""
                  }`}
                />
                Sync
              </Button>
            </div>
          </div>

          <div className="nutrient-score">
            <div className="nutrient-score-label">
              Nutrient schedule health
            </div>

            <div className="nutrient-score-number">
              {nutrientScore}
            </div>

            <div className="nutrient-score-status">
              <Target size={13} />
              Planning readiness
            </div>

            <div className="nutrient-track">
              <div
                className="nutrient-fill"
                style={{
                  width: `${nutrientScore}%`,
                }}
              />
            </div>

            <div className="nutrient-footer">
              <span>
                {plans.length} applications
              </span>

              <span>
                {overdueCount} overdue
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          STATS
      =================================================== */}

      <div className="fertilizer-stats">
        <div className="f-stat">
          <div className="f-stat-icon">
            <CalendarCheck size={20} />
          </div>

          <div className="f-stat-value">
            {plans.length}
          </div>

          <div className="f-stat-label">
            Scheduled applications
          </div>

          <div className="f-stat-meta">
            <Sprout size={12} />
            This season
          </div>
        </div>

        <div className="f-stat">
          <div className="f-stat-icon">
            <Weight size={20} />
          </div>

          <div className="f-stat-value">
            {totalKg.toFixed(0)} kg
          </div>

          <div className="f-stat-label">
            Total fertilizer quantity
          </div>

          <div className="f-stat-meta">
            <Package size={12} />
            Across all fields
          </div>
        </div>

        <div className="f-stat">
          <div className="f-stat-icon">
            <IndianRupee size={20} />
          </div>

          <div className="f-stat-value">
            {formatCurrency(
              estimatedCost,
            )}
          </div>

          <div className="f-stat-label">
            Estimated input cost
          </div>

          <div className="f-stat-meta">
            <TrendingDown size={12} />
            Planning estimate
          </div>
        </div>

        <div className="f-stat">
          <div className="f-stat-icon">
            <AlertCircle size={20} />
          </div>

          <div className="f-stat-value">
            {overdueCount}
          </div>

          <div className="f-stat-label">
            Delayed applications
          </div>

          <div className="f-stat-meta">
            {overdueCount > 0 ? (
              <>
                <TrendingUp size={12} />
                Needs review
              </>
            ) : (
              <>
                <CheckCircle2 size={12} />
                Schedule on track
              </>
            )}
          </div>
        </div>
      </div>

      {/* ===================================================
          ALERT
      =================================================== */}

      {overdueCount > 0 && (
        <div className="fertilizer-alert">
          <div className="fertilizer-alert-icon">
            <AlertCircle size={18} />
          </div>

          <div>
            <div className="fertilizer-alert-title">
              {overdueCount} fertilizer application
              {overdueCount > 1
                ? "s"
                : ""}{" "}
              require attention
            </div>

            <div className="fertilizer-alert-text">
              Delayed applications can affect crop nutrient
              availability. Review the affected crop stage,
              soil conditions and current weather before
              rescheduling.
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          ANALYTICS
      =================================================== */}

      <section className="fertilizer-analytics">
        <div className="analytics-panel">
          <div className="analytics-heading">
            <span>Crop-wise fertilizer workload</span>

            <Leaf
              size={17}
              className="text-primary"
            />
          </div>

          <div className="analytics-subheading">
            Total fertilizer quantity allocated to each crop.
          </div>

          <div className="crop-list">
            {cropStats
              .slice(0, 7)
              .map((crop) => (
                <div
                  className="crop-row"
                  key={crop.crop}
                >
                  <div className="crop-row-head">
                    <span className="crop-name">
                      {crop.crop}
                    </span>

                    <span className="crop-value">
                      {crop.quantity.toFixed(
                        0,
                      )}{" "}
                      kg
                    </span>
                  </div>

                  <div className="crop-track">
                    <div
                      className="crop-fill"
                      style={{
                        width: `${crop.percentage}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="analytics-panel">
          <div className="analytics-heading">
            <span>Planning indicators</span>

            <Zap
              size={17}
              className="text-primary"
            />
          </div>

          <div className="analytics-subheading">
            Operational indicators derived from the current
            fertilizer schedule.
          </div>

          <div className="health-list">
            <div className="health-item">
              <div className="health-left">
                <div className="health-icon">
                  <Weight size={15} />
                </div>

                <div>
                  <div className="health-name">
                    Average application
                  </div>

                  <div className="health-description">
                    Per scheduled plan
                  </div>
                </div>
              </div>

              <strong className="text-xs">
                {averageDose.toFixed(1)} kg
              </strong>
            </div>

            <div className="health-item">
              <div className="health-left">
                <div className="health-icon">
                  <Calendar size={15} />
                </div>

                <div>
                  <div className="health-name">
                    Due today
                  </div>

                  <div className="health-description">
                    Immediate field work
                  </div>
                </div>
              </div>

              <strong className="text-xs">
                {todayCount}
              </strong>
            </div>

            <div className="health-item">
              <div className="health-left">
                <div className="health-icon">
                  <Clock size={15} />
                </div>

                <div>
                  <div className="health-name">
                    Upcoming
                  </div>

                  <div className="health-description">
                    Future applications
                  </div>
                </div>
              </div>

              <strong className="text-xs">
                {upcoming}
              </strong>
            </div>

            <div className="health-item">
              <div className="health-left">
                <div className="health-icon">
                  <IndianRupee size={15} />
                </div>

                <div>
                  <div className="health-name">
                    Estimated kg cost
                  </div>

                  <div className="health-description">
                    Current planning rate
                  </div>
                </div>
              </div>

              <strong className="text-xs">
                {formatCurrency(
                  PRICE_PER_KG,
                )}
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          PRODUCT SUMMARY
      =================================================== */}

      <ChartCard
        title="Fertilizer product usage"
        description="Products currently included in the season plan."
        action={
          <Badge variant="secondary">
            {productStats.length} products
          </Badge>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {productStats
            .slice(0, 8)
            .map((product) => (
              <div
                key={product.product}
                className="rounded-xl border bg-background/50 p-4 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Beaker size={17} />
                </div>

                <div className="mt-3 text-xs font-black">
                  {product.product}
                </div>

                <div className="mt-1 text-xl font-black">
                  {product.quantity.toFixed(
                    0,
                  )}{" "}
                  kg
                </div>

                <div className="mt-1 text-[9px] text-muted-foreground">
                  Estimated cost{" "}
                  {formatCurrency(
                    product.quantity *
                      PRICE_PER_KG,
                  )}
                </div>
              </div>
            ))}
        </div>
      </ChartCard>

      {/* ===================================================
          TOOLBAR
      =================================================== */}

      <section className="fertilizer-toolbar">
        <div className="toolbar-row">
          <div className="fertilizer-search">
            <Search size={16} />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search crop, field, stage or fertilizer..."
            />
          </div>

          <select
            className="fertilizer-select"
            value={productFilter}
            onChange={(event) =>
              setProductFilter(
                event.target.value,
              )
            }
          >
            {products.map(
              (product) => (
                <option
                  key={product}
                >
                  {product}
                </option>
              ),
            )}
          </select>

          <select
            className="fertilizer-select"
            value={sortMode}
            onChange={(event) =>
              setSortMode(
                event.target
                  .value as SortMode,
              )
            }
          >
            <option value="date">
              Sort by date
            </option>

            <option value="quantity">
              Highest quantity
            </option>

            <option value="cost">
              Highest cost
            </option>

            <option value="crop">
              Crop A-Z
            </option>
          </select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setSearch("");
              setProductFilter(
                "All products",
              );
              setFilter("all");
              setSortMode("date");
            }}
          >
            <Filter size={16} />
          </Button>
        </div>

        <div className="filter-pills">
          <button
            className={`filter-pill ${
              filter === "all"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setFilter("all")
            }
          >
            <Package size={12} />
            All applications
          </button>

          <button
            className={`filter-pill ${
              filter === "today"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setFilter("today")
            }
          >
            <CalendarCheck size={12} />
            Today
          </button>

          <button
            className={`filter-pill ${
              filter === "upcoming"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setFilter("upcoming")
            }
          >
            <Clock size={12} />
            Upcoming
          </button>

          <button
            className={`filter-pill ${
              filter === "overdue"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setFilter("overdue")
            }
          >
            <AlertCircle size={12} />
            Overdue
          </button>
        </div>
      </section>

      {/* ===================================================
          APPLICATION TABLE
      =================================================== */}

      <section className="fertilizer-table">
        <div className="table-header-area">
          <div>
            <div className="table-title">
              Fertilizer application schedule
            </div>

            <div className="table-subtitle">
              Click any application to inspect its field,
              stage, quantity and cost.
            </div>
          </div>

          <Badge variant="secondary">
            {visiblePlans.length} shown
          </Badge>
        </div>

        <div className="table-scroll">
          {visiblePlans.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    Crop & field
                  </TableHead>

                  <TableHead>
                    Crop stage
                  </TableHead>

                  <TableHead>
                    Product
                  </TableHead>

                  <TableHead className="text-right">
                    Dose
                  </TableHead>

                  <TableHead className="text-right">
                    Total
                  </TableHead>

                  <TableHead>
                    Apply on
                  </TableHead>

                  <TableHead className="text-right">
                    Cost
                  </TableHead>

                  <TableHead />
                </TableRow>
              </TableHeader>

              <TableBody>
                {visiblePlans.map(
                  (plan) => {
                    const quantity =
                      Number(
                        plan.dosePerHa ||
                          0,
                      ) *
                      Number(
                        plan.area || 0,
                      );

                    const cost =
                      quantity *
                      PRICE_PER_KG;

                    const overdue =
                      isOverdue(
                        plan.applyOn,
                      );

                    const today =
                      isToday(
                        plan.applyOn,
                      );

                    return (
                      <TableRow
                        key={plan.id}
                        className="application-row"
                        onClick={() =>
                          setSelectedPlan(
                            plan,
                          )
                        }
                      >
                        <TableCell>
                          <div className="crop-cell">
                            <div className="crop-cell-title">
                              {plan.crop}
                            </div>

                            <div className="crop-cell-meta">
                              <MapPin size={10} />

                              {plan.field}

                              <span>
                                ·
                              </span>

                              {plan.area}{" "}
                              ha
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline">
                            {plan.stage}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="product-cell">
                            <div className="product-name">
                              {plan.product}
                            </div>

                            <div className="product-meta">
                              Fertilizer input
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          {plan.dosePerHa}{" "}
                          kg/ha
                        </TableCell>

                        <TableCell className="text-right">
                          <span className="quantity-highlight">
                            {quantity.toFixed(
                              0,
                            )}{" "}
                            kg
                          </span>
                        </TableCell>

                        <TableCell>
                          <div
                            className={
                              overdue
                                ? "date-overdue"
                                : today
                                  ? "date-today"
                                  : "date-normal"
                            }
                          >
                            {today && (
                              <Badge className="mb-1">
                                Today
                              </Badge>
                            )}

                            <div>
                              {formatDate(
                                plan.applyOn,
                              )}
                            </div>

                            {overdue && (
                              <div className="text-[8px]">
                                Overdue
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="text-right font-bold">
                          {formatCurrency(
                            cost,
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <ChevronRight className="ml-auto size-4 text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    );
                  },
                )}
              </TableBody>
            </Table>
          ) : (
            <div className="py-16 text-center">
              <Search className="mx-auto size-9 text-muted-foreground" />

              <div className="mt-3 text-sm font-black">
                No applications found
              </div>

              <div className="mt-1 text-xs text-muted-foreground">
                Try changing your search or filters.
              </div>

              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearch("");
                  setProductFilter(
                    "All products",
                  );
                  setFilter("all");
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ===================================================
          FIELD SAFETY / BEST PRACTICE
      =================================================== */}

      <section className="mt-5 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5">
          <ShieldCheck className="size-6 text-primary" />

          <h3 className="mt-3 text-sm font-black">
            Application safety
          </h3>

          <p className="mt-2 text-[10px] leading-5 text-muted-foreground">
            Confirm crop stage, soil moisture and label
            instructions before every fertilizer application.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <Droplets className="size-6 text-primary" />

          <h3 className="mt-3 text-sm font-black">
            Soil & moisture
          </h3>

          <p className="mt-2 text-[10px] leading-5 text-muted-foreground">
            Avoid applying fertilizer immediately before
            heavy rainfall or when field conditions are
            unsuitable.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <Percent className="size-6 text-primary" />

          <h3 className="mt-3 text-sm font-black">
            Reduce wastage
          </h3>

          <p className="mt-2 text-[10px] leading-5 text-muted-foreground">
            Use soil-test recommendations and crop-stage
            requirements instead of applying more fertilizer
            than the crop needs.
          </p>
        </div>
      </section>

      {/* ===================================================
          DETAIL MODAL
      =================================================== */}

      {selectedPlan && (
        <div
          className="fertilizer-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedPlan(null);
            }
          }}
        >
          <div className="fertilizer-modal">
            <div className="modal-head">
              <div>
                <div className="modal-title">
                  Application details
                </div>

                <div className="text-[9px] text-muted-foreground">
                  Fertilizer planning record
                </div>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setSelectedPlan(null)
                }
              >
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              <div className="application-hero">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {selectedPlan.crop}
                  </Badge>

                  <Badge variant="outline">
                    {selectedPlan.stage}
                  </Badge>

                  {isOverdue(
                    selectedPlan.applyOn,
                  ) ? (
                    <Badge variant="destructive">
                      <AlertCircle className="mr-1 size-3" />
                      Overdue
                    </Badge>
                  ) : isToday(
                      selectedPlan.applyOn,
                    ) ? (
                    <Badge>
                      <CalendarCheck className="mr-1 size-3" />
                      Due today
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <Clock className="mr-1 size-3" />
                      Scheduled
                    </Badge>
                  )}
                </div>

                <div className="application-title">
                  {selectedPlan.product}
                </div>

                <div className="mt-2 text-[10px] text-muted-foreground">
                  {selectedPlan.note ||
                    "Follow the planned application rate and crop-stage recommendation."}
                </div>
              </div>

              <div className="application-grid">
                <div className="application-box">
                  <div className="application-label">
                    Field
                  </div>

                  <div className="application-value">
                    <MapPin className="mr-1 inline size-3" />
                    {selectedPlan.field}
                  </div>
                </div>

                <div className="application-box">
                  <div className="application-label">
                    Area
                  </div>

                  <div className="application-value">
                    {selectedPlan.area} ha
                  </div>
                </div>

                <div className="application-box">
                  <div className="application-label">
                    Dose
                  </div>

                  <div className="application-value">
                    {selectedPlan.dosePerHa}{" "}
                    kg/ha
                  </div>
                </div>

                <div className="application-box">
                  <div className="application-label">
                    Total quantity
                  </div>

                  <div className="application-value">
                    {(
                      Number(
                        selectedPlan
                          .dosePerHa ||
                          0,
                      ) *
                      Number(
                        selectedPlan.area ||
                          0,
                      )
                    ).toFixed(0)}{" "}
                    kg
                  </div>
                </div>

                <div className="application-box">
                  <div className="application-label">
                    Apply on
                  </div>

                  <div className="application-value">
                    {formatDate(
                      selectedPlan.applyOn,
                    )}
                  </div>
                </div>

                <div className="application-box">
                  <div className="application-label">
                    Estimated cost
                  </div>

                  <div className="application-value">
                    {formatCurrency(
                      Number(
                        selectedPlan
                          .dosePerHa ||
                          0,
                      ) *
                        Number(
                          selectedPlan
                            .area || 0,
                        ) *
                        PRICE_PER_KG,
                    )}
                  </div>
                </div>
              </div>

              <div className="note-box">
                <div className="note-title">
                  <ShieldCheck
                    size={14}
                    className="text-primary"
                  />
                  Field application guidance
                </div>

                <div className="note-text">
                  {selectedPlan.note ||
                    "Verify the crop stage, soil moisture, weather conditions and product label before application. Do not exceed the recommended dose."}
                </div>
              </div>

              <div className="modal-footer">
                <Button
                  variant="outline"
                  onClick={() =>
                    setSelectedPlan(
                      null,
                    )
                  }
                >
                  Close
                </Button>

                <Button
                  onClick={() => {
                    setSelectedPlan(
                      null,
                    );

                    setFilter(
                      "today",
                    );
                  }}
                >
                  <CalendarCheck className="mr-2 size-4" />
                  View today's work
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}