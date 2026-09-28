import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Activity,
  ArrowRight,
  Baby,
  Bell,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ClipboardCheck,
  Copy,
  Droplets,
  HeartPulse,
  IndianRupee,
  Leaf,
  Milk,
  PawPrint,
  PhoneCall,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Syringe,
  Thermometer,
  TrendingDown,
  TrendingUp,
  UserRound,
  Weight,
  X,
  Zap,
} from "lucide-react";

import { AgriculturePageHeader } from "@/components/agriculture/AgriculturePageHeader";
import { ChartCard } from "@/components/agriculture/ChartCard";
import { AlertCard } from "@/components/agriculture/AlertCard";
import { EmptyState } from "@/components/agriculture/EmptyState";
import { LoadingState } from "@/components/agriculture/Loadingstate";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  agricultureApi,
  formatDate,
} from "@/services/agricultureApi";

/* =========================================================
   TYPES
========================================================= */

type HealthStatus =
  | "healthy"
  | "monitor"
  | "treatment";

type FilterMode =
  | "all"
  | "healthy"
  | "monitor"
  | "treatment"
  | "vaccination";

type SortMode =
  | "name"
  | "health"
  | "vaccination"
  | "age";

/* =========================================================
   CONSTANTS
========================================================= */

const KISAN_HELP =
  "1800 180 1551";

/*
 * These are planning/reference values only.
 * They are not claimed to be live market prices.
 */
const MILK_REFERENCE_PRICE = 40;

/* =========================================================
   STYLES
========================================================= */

const styles = `
.livestock-page {
  min-height: 100vh;
  padding-bottom: 80px;
  background:
    radial-gradient(
      circle at 0% 0%,
      hsl(var(--primary) / .08),
      transparent 31%
    ),
    radial-gradient(
      circle at 100% 15%,
      hsl(var(--chart-2) / .07),
      transparent 28%
    );
}

/* =========================================================
   HERO
========================================================= */

.livestock-hero {
  position: relative;
  overflow: hidden;
  margin-top: 24px;
  padding: 34px;
  border: 1px solid hsl(var(--border));
  border-radius: 29px;
  background:
    linear-gradient(
      135deg,
      hsl(var(--primary) / .14),
      transparent 57%
    ),
    hsl(var(--card));
  box-shadow:
    0 25px 70px hsl(var(--foreground) / .07);
}

.livestock-hero::before {
  content: "";
  position: absolute;
  width: 430px;
  height: 430px;
  right: -190px;
  top: -270px;
  border-radius: 50%;
  background:
    hsl(var(--primary) / .08);
}

.livestock-hero::after {
  content: "";
  position: absolute;
  width: 230px;
  height: 230px;
  left: 43%;
  bottom: -185px;
  border-radius: 50%;
  background:
    hsl(var(--chart-2) / .07);
}

.livestock-hero-grid {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns:
    minmax(0, 1.35fr)
    minmax(290px, .65fr);
  gap: 34px;
  align-items: center;
}

.livestock-kicker {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 12px;
  border-radius: 999px;
  background:
    hsl(var(--primary) / .1);
  color:
    hsl(var(--primary));
  font-size: 10px;
  font-weight: 950;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.livestock-title {
  margin-top: 16px;
  font-size: clamp(34px, 5vw, 58px);
  line-height: .97;
  font-weight: 950;
  letter-spacing: -.06em;
}

.livestock-title span {
  color:
    hsl(var(--primary));
}

.livestock-description {
  max-width: 700px;
  margin-top: 17px;
  color:
    hsl(var(--muted-foreground));
  font-size: 14px;
  line-height: 1.75;
}

.livestock-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin-top: 23px;
}

/* =========================================================
   HERD HEALTH SCORE
========================================================= */

.herd-score {
  padding: 23px;
  border: 1px solid hsl(var(--border));
  border-radius: 22px;
  background:
    hsl(var(--background) / .68);
  backdrop-filter: blur(18px);
}

.herd-score-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.herd-score-icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background:
    hsl(var(--primary) / .11);
  color:
    hsl(var(--primary));
}

.herd-score-live {
  display: flex;
  align-items: center;
  gap: 7px;
  color:
    hsl(var(--primary));
  font-size: 9px;
  font-weight: 900;
}

.herd-score-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background:
    hsl(var(--primary));
  box-shadow:
    0 0 0 5px hsl(var(--primary) / .1);
}

.herd-score-label {
  margin-top: 17px;
  color:
    hsl(var(--muted-foreground));
  font-size: 10px;
  font-weight: 850;
  text-transform: uppercase;
  letter-spacing: .05em;
}

.herd-score-number {
  margin-top: 7px;
  font-size: 48px;
  line-height: 1;
  font-weight: 950;
  letter-spacing: -.06em;
}

.herd-score-status {
  margin-top: 8px;
  color:
    hsl(var(--primary));
  font-size: 10px;
  font-weight: 900;
}

.herd-score-track {
  height: 9px;
  overflow: hidden;
  margin-top: 18px;
  border-radius: 999px;
  background:
    hsl(var(--muted));
}

.herd-score-fill {
  height: 100%;
  border-radius: inherit;
  background:
    hsl(var(--primary));
  transition:
    width .7s ease;
}

.herd-score-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  color:
    hsl(var(--muted-foreground));
  font-size: 9px;
}

/* =========================================================
   STATS
========================================================= */

.livestock-stats {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-top: 22px;
}

.livestock-stat {
  padding: 18px;
  border: 1px solid hsl(var(--border));
  border-radius: 18px;
  background:
    hsl(var(--card));
  transition:
    transform .2s ease,
    box-shadow .2s ease;
}

.livestock-stat:hover {
  transform:
    translateY(-3px);
  box-shadow:
    0 17px 42px hsl(var(--foreground) / .06);
}

.livestock-stat-icon {
  display: grid;
  place-items: center;
  width: 41px;
  height: 41px;
  border-radius: 12px;
  background:
    hsl(var(--primary) / .1);
  color:
    hsl(var(--primary));
}

.livestock-stat-value {
  margin-top: 12px;
  font-size: 25px;
  font-weight: 950;
  letter-spacing: -.04em;
}

.livestock-stat-label {
  margin-top: 3px;
  color:
    hsl(var(--muted-foreground));
  font-size: 10px;
}

.livestock-stat-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 8px;
  color:
    hsl(var(--primary));
  font-size: 9px;
  font-weight: 850;
}

/* =========================================================
   ALERT
========================================================= */

.livestock-alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 20px;
  padding: 16px;
  border: 1px solid
    hsl(var(--destructive) / .2);
  border-radius: 17px;
  background:
    hsl(var(--destructive) / .05);
}

.livestock-alert-icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  border-radius: 11px;
  background:
    hsl(var(--destructive) / .1);
  color:
    hsl(var(--destructive));
}

.livestock-alert-title {
  font-size: 12px;
  font-weight: 950;
}

.livestock-alert-text {
  margin-top: 3px;
  color:
    hsl(var(--muted-foreground));
  font-size: 10px;
  line-height: 1.65;
}

/* =========================================================
   ANALYTICS
========================================================= */

.livestock-analytics {
  display: grid;
  grid-template-columns:
    minmax(0, 1.2fr)
    minmax(290px, .8fr);
  gap: 17px;
  margin-top: 24px;
}

.analytics-card {
  min-width: 0;
  padding: 19px;
  border: 1px solid hsl(var(--border));
  border-radius: 20px;
  background:
    hsl(var(--card));
}

.analytics-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 14px;
  font-weight: 950;
}

.analytics-description {
  margin-top: 4px;
  color:
    hsl(var(--muted-foreground));
  font-size: 9px;
  line-height: 1.5;
}

/* =========================================================
   MILK SUMMARY
========================================================= */

.milk-summary {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    minmax(120px, .4fr);
  gap: 14px;
  margin-top: 18px;
}

.milk-main {
  padding: 16px;
  border-radius: 15px;
  background:
    linear-gradient(
      135deg,
      hsl(var(--primary) / .11),
      transparent
    );
}

.milk-label {
  color:
    hsl(var(--muted-foreground));
  font-size: 9px;
  font-weight: 850;
}

.milk-number {
  margin-top: 6px;
  font-size: 31px;
  font-weight: 950;
  letter-spacing: -.05em;
}

.milk-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 5px;
  color:
    hsl(var(--primary));
  font-size: 9px;
  font-weight: 800;
}

.milk-side {
  display: grid;
  place-items: center;
  padding: 14px;
  border: 1px solid hsl(var(--border));
  border-radius: 15px;
  text-align: center;
}

.milk-side-value {
  font-size: 18px;
  font-weight: 950;
}

.milk-side-label {
  margin-top: 3px;
  color:
    hsl(var(--muted-foreground));
  font-size: 8px;
}

/* =========================================================
   HEALTH BREAKDOWN
========================================================= */

.health-breakdown {
  display: grid;
  gap: 10px;
  margin-top: 18px;
}

.health-line {
  display: grid;
  grid-template-columns:
    90px minmax(0, 1fr) 35px;
  align-items: center;
  gap: 9px;
}

.health-line-name {
  font-size: 9px;
  font-weight: 850;
}

.health-line-track {
  height: 7px;
  overflow: hidden;
  border-radius: 999px;
  background:
    hsl(var(--muted));
}

.health-line-fill {
  height: 100%;
  border-radius: inherit;
  background:
    hsl(var(--primary));
}

.health-line-number {
  text-align: right;
  font-size: 9px;
  font-weight: 900;
}

/* =========================================================
   CARE CHECKLIST
========================================================= */

.care-list {
  display: grid;
  gap: 9px;
  margin-top: 17px;
}

.care-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px;
  border-radius: 12px;
  background:
    hsl(var(--accent) / .5);
}

.care-item-icon {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  border-radius: 9px;
  background:
    hsl(var(--primary) / .1);
  color:
    hsl(var(--primary));
}

.care-item-title {
  font-size: 9px;
  font-weight: 900;
}

.care-item-text {
  margin-top: 2px;
  color:
    hsl(var(--muted-foreground));
  font-size: 8px;
}

.care-status {
  margin-left: auto;
  white-space: nowrap;
}

/* =========================================================
   TOOLBAR
========================================================= */

.livestock-toolbar {
  margin-top: 25px;
  padding: 15px;
  border: 1px solid hsl(var(--border));
  border-radius: 19px;
  background:
    hsl(var(--card));
}

.toolbar-top {
  display: flex;
  align-items: center;
  gap: 9px;
}

.livestock-search {
  position: relative;
  flex: 1;
}

.livestock-search svg {
  position: absolute;
  left: 13px;
  top: 50%;
  transform:
    translateY(-50%);
  color:
    hsl(var(--muted-foreground));
}

.livestock-search input {
  height: 43px;
  padding-left: 39px;
  padding-right: 12px;
  border-radius: 11px;
}

.livestock-select {
  height: 43px;
  min-width: 140px;
  padding: 0 10px;
  border: 1px solid hsl(var(--border));
  border-radius: 11px;
  outline: none;
  background:
    hsl(var(--background));
  color:
    hsl(var(--foreground));
  font-size: 10px;
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
  background:
    hsl(var(--background));
  color:
    hsl(var(--muted-foreground));
  font-size: 9px;
  font-weight: 850;
  cursor: pointer;
  transition: .2s ease;
}

.filter-pill:hover {
  border-color:
    hsl(var(--primary) / .35);
}

.filter-pill.active {
  border-color:
    hsl(var(--primary));
  background:
    hsl(var(--primary));
  color:
    hsl(var(--primary-foreground));
}

/* =========================================================
   ANIMAL GRID
========================================================= */

.animal-section {
  margin-top: 18px;
}

.animal-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 13px;
}

.animal-section-title {
  font-size: 15px;
  font-weight: 950;
}

.animal-section-subtitle {
  margin-top: 3px;
  color:
    hsl(var(--muted-foreground));
  font-size: 9px;
}

.animal-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 15px;
}

/* =========================================================
   ANIMAL CARD
========================================================= */

.animal-card {
  position: relative;
  overflow: hidden;
  padding: 18px;
  border: 1px solid hsl(var(--border));
  border-radius: 20px;
  background:
    hsl(var(--card));
  transition:
    transform .2s ease,
    box-shadow .2s ease,
    border-color .2s ease;
}

.animal-card:hover {
  transform:
    translateY(-4px);
  border-color:
    hsl(var(--primary) / .3);
  box-shadow:
    0 18px 45px hsl(var(--foreground) / .07);
}

.animal-card::after {
  content: "";
  position: absolute;
  width: 120px;
  height: 120px;
  right: -60px;
  bottom: -65px;
  border-radius: 50%;
  background:
    hsl(var(--primary) / .045);
}

.animal-card-head {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.animal-identity {
  display: flex;
  align-items: center;
  gap: 10px;
}

.animal-avatar {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 13px;
  background:
    hsl(var(--primary) / .1);
  color:
    hsl(var(--primary));
}

.animal-tag {
  font-size: 13px;
  font-weight: 950;
}

.animal-species {
  margin-top: 3px;
  color:
    hsl(var(--muted-foreground));
  font-size: 9px;
}

.animal-health-badge {
  white-space: nowrap;
}

.health-healthy {
  background:
    hsl(var(--primary) / .1);
  color:
    hsl(var(--primary));
}

.health-monitor {
  background:
    hsl(var(--chart-2) / .14);
  color:
    hsl(var(--foreground));
}

.health-treatment {
  background:
    hsl(var(--destructive) / .12);
  color:
    hsl(var(--destructive));
}

/* =========================================================
   ANIMAL DETAILS
========================================================= */

.animal-details {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 9px;
  margin-top: 17px;
}

.animal-detail {
  padding: 11px;
  border-radius: 12px;
  background:
    hsl(var(--background) / .55);
}

.animal-detail-label {
  color:
    hsl(var(--muted-foreground));
  font-size: 8px;
  font-weight: 800;
  text-transform: uppercase;
}

.animal-detail-value {
  margin-top: 4px;
  font-size: 10px;
  font-weight: 900;
}

.animal-note {
  position: relative;
  z-index: 2;
  margin-top: 12px;
  padding: 11px;
  border-left: 3px solid
    hsl(var(--primary));
  border-radius: 8px;
  background:
    hsl(var(--primary) / .04);
  color:
    hsl(var(--muted-foreground));
  font-size: 9px;
  line-height: 1.6;
}

.animal-footer {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 13px;
}

.vaccine-status {
  display: flex;
  align-items: center;
  gap: 5px;
  color:
    hsl(var(--muted-foreground));
  font-size: 8px;
  font-weight: 800;
}

/* =========================================================
   MODAL
========================================================= */

.livestock-modal-backdrop {
  position: fixed;
  z-index: 100;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 18px;
  background:
    hsl(var(--foreground) / .58);
  backdrop-filter:
    blur(8px);
}

.livestock-modal {
  width: min(680px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid hsl(var(--border));
  border-radius: 23px;
  background:
    hsl(var(--card));
  box-shadow:
    0 35px 100px hsl(var(--foreground) / .28);
}

.modal-header {
  position: sticky;
  z-index: 3;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 17px 20px;
  border-bottom: 1px solid hsl(var(--border));
  background:
    hsl(var(--card) / .95);
  backdrop-filter:
    blur(15px);
}

.modal-heading {
  font-size: 15px;
  font-weight: 950;
}

.modal-subheading {
  margin-top: 3px;
  color:
    hsl(var(--muted-foreground));
  font-size: 8px;
}

.modal-close {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 1px solid hsl(var(--border));
  border-radius: 9px;
  background:
    hsl(var(--background));
  cursor: pointer;
}

.modal-body {
  padding: 20px;
}

.modal-animal-hero {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 17px;
  border-radius: 16px;
  background:
    linear-gradient(
      135deg,
      hsl(var(--primary) / .1),
      transparent
    );
}

.modal-animal-avatar {
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  border-radius: 16px;
  background:
    hsl(var(--primary) / .13);
  color:
    hsl(var(--primary));
}

.modal-animal-name {
  font-size: 20px;
  font-weight: 950;
}

.modal-animal-meta {
  margin-top: 4px;
  color:
    hsl(var(--muted-foreground));
  font-size: 9px;
}

.modal-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 15px;
}

.modal-box {
  padding: 13px;
  border: 1px solid hsl(var(--border));
  border-radius: 13px;
}

.modal-label {
  color:
    hsl(var(--muted-foreground));
  font-size: 8px;
  font-weight: 800;
  text-transform: uppercase;
}

.modal-value {
  margin-top: 5px;
  font-size: 11px;
  font-weight: 900;
}

.modal-note {
  margin-top: 14px;
  padding: 14px;
  border-radius: 13px;
  background:
    hsl(var(--accent) / .55);
}

.modal-note-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 900;
}

.modal-note-text {
  margin-top: 6px;
  color:
    hsl(var(--muted-foreground));
  font-size: 9px;
  line-height: 1.7;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 18px;
  padding-top: 15px;
  border-top: 1px solid hsl(var(--border));
}

/* =========================================================
   BOTTOM SUPPORT
========================================================= */

.livestock-support {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 24px;
}

.support-box {
  padding: 19px;
  border: 1px solid hsl(var(--border));
  border-radius: 18px;
  background:
    hsl(var(--card));
}

.support-icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 11px;
  background:
    hsl(var(--primary) / .1);
  color:
    hsl(var(--primary));
}

.support-title {
  margin-top: 12px;
  font-size: 11px;
  font-weight: 900;
}

.support-text {
  margin-top: 5px;
  color:
    hsl(var(--muted-foreground));
  font-size: 9px;
  line-height: 1.65;
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 1100px) {
  .livestock-stats {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .animal-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .livestock-analytics {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 850px) {
  .livestock-hero-grid {
    grid-template-columns: 1fr;
  }

  .livestock-support {
    grid-template-columns: 1fr;
  }

  .toolbar-top {
    flex-wrap: wrap;
  }

  .livestock-search {
    flex-basis: 100%;
  }
}

@media (max-width: 620px) {
  .livestock-hero {
    padding: 23px;
  }

  .livestock-stats {
    grid-template-columns: 1fr;
  }

  .animal-grid {
    grid-template-columns: 1fr;
  }

  .livestock-actions {
    flex-direction: column;
  }

  .livestock-actions button {
    width: 100%;
  }

  .livestock-select {
    flex: 1;
  }

  .milk-summary {
    grid-template-columns: 1fr;
  }

  .modal-grid {
    grid-template-columns: 1fr;
  }
}

/* =========================================================
   PRINT
========================================================= */

@media print {
  .livestock-actions,
  .livestock-toolbar,
  .livestock-modal-backdrop,
  button {
    display: none !important;
  }

  .livestock-page {
    background: white;
  }

  .livestock-hero,
  .livestock-stat,
  .analytics-card,
  .animal-card,
  .support-box {
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

function daysUntil(value: string) {
  const date = getDate(value);

  if (!date) return null;

  const today = new Date();

  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  return Math.ceil(
    (date.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24),
  );
}

function vaccinationStatus(
  value: string,
) {
  const days = daysUntil(value);

  if (days === null) {
    return "Unknown";
  }

  if (days < 0) {
    return "Overdue";
  }

  if (days === 0) {
    return "Due today";
  }

  if (days <= 7) {
    return `Due in ${days}d`;
  }

  return `Due in ${days}d`;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function LivestockCare() {
  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["livestock"],
    queryFn:
      agricultureApi.getLivestock,
  });

  const animals = data ?? [];

  const [query, setQuery] =
    useState("");

  const [filter, setFilter] =
    useState<FilterMode>("all");

  const [sortMode, setSortMode] =
    useState<SortMode>("name");

  const [selectedAnimal, setSelectedAnimal] =
    useState<any | null>(null);

  const [copied, setCopied] =
    useState(false);

  /* =======================================================
     HEALTH COUNTS
  ======================================================= */

  const healthyCount =
    animals.filter(
      (animal) =>
        animal.health === "healthy",
    ).length;

  const monitorCount =
    animals.filter(
      (animal) =>
        animal.health === "monitor",
    ).length;

  const treatmentCount =
    animals.filter(
      (animal) =>
        animal.health === "treatment",
    ).length;

  const needCare =
    animals.filter(
      (animal) =>
        animal.health !== "healthy",
    );

  /* =======================================================
     VACCINATION
  ======================================================= */

  const overdueVaccinations =
    animals.filter((animal) => {
      const days = daysUntil(
        animal.nextVaccination,
      );

      return (
        days !== null &&
        days < 0
      );
    }).length;

  const upcomingVaccinations =
    animals.filter((animal) => {
      const days = daysUntil(
        animal.nextVaccination,
      );

      return (
        days !== null &&
        days >= 0 &&
        days <= 30
      );
    }).length;

  const vaccinationDueSoon =
    animals.filter((animal) => {
      const days = daysUntil(
        animal.nextVaccination,
      );

      return (
        days !== null &&
        days >= 0 &&
        days <= 7
      );
    }).length;

  /* =======================================================
     MILK DATA
  ======================================================= */

  const milkProducingAnimals =
    animals.filter(
      (animal) =>
        Boolean(animal.yield),
    );

  const totalMilk = useMemo(() => {
    return milkProducingAnimals.reduce(
      (total, animal) => {
        const match =
          String(
            animal.yield ?? "",
          ).match(
            /([0-9]+(?:\\.[0-9]+)?)/,
          );

        return (
          total +
          Number(
            match?.[1] ?? 0,
          )
        );
      },
      0,
    );
  }, [milkProducingAnimals]);

  const estimatedMilkValue =
    totalMilk *
    MILK_REFERENCE_PRICE;

  /* =======================================================
     HERD HEALTH SCORE
  ======================================================= */

  const healthScore =
    animals.length === 0
      ? 0
      : Math.max(
          0,
          Math.min(
            100,
            Math.round(
              (healthyCount /
                animals.length) *
                100 -
                treatmentCount *
                  4 -
                overdueVaccinations *
                  3,
            ),
          ),
        );

  /* =======================================================
     TOPICS / SPECIES
  ======================================================= */

  const speciesList =
    useMemo(() => {
      return Array.from(
        new Set(
          animals
            .map(
              (animal) =>
                animal.species,
            )
            .filter(Boolean),
        ),
      );
    }, [animals]);

  /* =======================================================
     FILTERED ANIMALS
  ======================================================= */

  const visibleAnimals =
    useMemo(() => {
      const normalized =
        query.trim().toLowerCase();

      const filtered =
        animals.filter(
          (animal) => {
            const searchable = [
              animal.tag,
              animal.species,
              animal.age,
              animal.health,
              animal.note,
              animal.yield,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

            const matchesSearch =
              !normalized ||
              searchable.includes(
                normalized,
              );

            let matchesFilter =
              true;

            if (
              filter ===
              "healthy"
            ) {
              matchesFilter =
                animal.health ===
                "healthy";
            }

            if (
              filter ===
              "monitor"
            ) {
              matchesFilter =
                animal.health ===
                "monitor";
            }

            if (
              filter ===
              "treatment"
            ) {
              matchesFilter =
                animal.health ===
                "treatment";
            }

            if (
              filter ===
              "vaccination"
            ) {
              const days =
                daysUntil(
                  animal.nextVaccination,
                );

              matchesFilter =
                days !== null &&
                days <= 30;
            }

            return (
              matchesSearch &&
              matchesFilter
            );
          },
        );

      return [...filtered].sort(
        (a, b) => {
          if (
            sortMode ===
            "health"
          ) {
            const rank: Record<
              HealthStatus,
              number
            > = {
              treatment: 1,
              monitor: 2,
              healthy: 3,
            };

            return (
              rank[
                a.health as HealthStatus
              ] -
              rank[
                b.health as HealthStatus
              ]
            );
          }

          if (
            sortMode ===
            "vaccination"
          ) {
            return (
              (daysUntil(
                a.nextVaccination,
              ) ?? 9999) -
              (daysUntil(
                b.nextVaccination,
              ) ?? 9999)
            );
          }

          if (
            sortMode ===
            "age"
          ) {
            return String(
              a.age ?? "",
            ).localeCompare(
              String(
                b.age ?? "",
              ),
            );
          }

          return String(
            a.tag ?? "",
          ).localeCompare(
            String(
              b.tag ?? "",
            ),
          );
        },
      );
    }, [
      animals,
      query,
      filter,
      sortMode,
    ]);

  /* =======================================================
     COPY HELPLINE
  ======================================================= */

  const copyHelpline =
    async () => {
      try {
        await navigator.clipboard.writeText(
          KISAN_HELP,
        );

        setCopied(true);

        window.setTimeout(
          () =>
            setCopied(false),
          1800,
        );
      } catch {
        setCopied(false);
      }
    };

  /* =======================================================
     HEALTH LABEL
  ======================================================= */

  const healthClass = (
    health: string,
  ) => {
    if (health === "healthy") {
      return "health-healthy";
    }

    if (health === "monitor") {
      return "health-monitor";
    }

    return "health-treatment";
  };

  /* =======================================================
     ERROR
  ======================================================= */

  if (isError) {
    return (
      <div className="livestock-page">
        <style>{styles}</style>

        <AgriculturePageHeader
          icon={HeartPulse}
          title="Livestock Care"
          description="Monitor animal health, vaccination schedules and livestock productivity from one farm dashboard."
        />

        <div className="py-20 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-destructive/10 text-destructive">
            <RefreshCw size={27} />
          </div>

          <h3 className="mt-4 text-lg font-black">
            Livestock data could not be loaded
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            The livestock service did not return
            the expected information.
          </p>

          <div className="mt-5 flex justify-center gap-2">
            <Button
              onClick={() =>
                refetch()
              }
              disabled={isFetching}
            >
              <RefreshCw
                className={`mr-2 size-4 ${
                  isFetching
                    ? "animate-spin"
                    : ""
                }`}
              />
              Retry
            </Button>

            <Button
              variant="outline"
              onClick={
                copyHelpline
              }
            >
              <PhoneCall className="mr-2 size-4" />
              Call support
            </Button>
          </div>
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
          icon={HeartPulse}
          title="Livestock Care"
          description="Track animal health, vaccination dates and daily yield so illness is caught early and important care is not missed."
        />

        <LoadingState rows={5} />
      </div>
    );
  }

  /* =======================================================
     EMPTY
  ======================================================= */

  if (!animals.length) {
    return (
      <div className="livestock-page">
        <style>{styles}</style>

        <AgriculturePageHeader
          icon={HeartPulse}
          title="Livestock Care"
          description="Track animal health, vaccination dates and daily yield so illness is caught early."
        />

        <EmptyState
          icon={PawPrint}
          title="No animals added"
          description="Add your cattle, goats or poultry to start a livestock health and vaccination calendar."
        />
      </div>
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <div className="livestock-page">
      <style>{styles}</style>

      <AgriculturePageHeader
        icon={HeartPulse}
        title="Livestock Care"
        description="Track every animal's health, vaccination dates and daily yield, so illness is caught early and no booster shot is missed."
      />

      {/* ===================================================
          HERO
      =================================================== */}

      <section className="livestock-hero">
        <div className="livestock-hero-grid">
          <div>
            <div className="livestock-kicker">
              <HeartPulse size={13} />
              Smart Livestock Management
            </div>

            <h1 className="livestock-title">
              Healthier animals.
              <br />
              <span>Stronger farm.</span>
            </h1>

            <p className="livestock-description">
              Monitor herd health, identify animals
              requiring attention, track vaccination
              deadlines and understand milk productivity
              from one operational dashboard.
            </p>

            <div className="livestock-actions">
              <Button
                onClick={() =>
                  setFilter(
                    "treatment",
                  )
                }
              >
                <Stethoscope className="mr-2 size-4" />
                View animals needing care
              </Button>

              <Button
                variant="outline"
                onClick={() =>
                  setFilter(
                    "vaccination",
                  )
                }
              >
                <Syringe className="mr-2 size-4" />
                Vaccination calendar
              </Button>

              <Button
                variant="ghost"
                onClick={() =>
                  refetch()
                }
                disabled={
                  isFetching
                }
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

              <Button
                variant="ghost"
                onClick={() =>
                  window.print()
                }
              >
                <ClipboardCheck className="mr-2 size-4" />
                Print report
              </Button>
            </div>
          </div>

          <div className="herd-score">
            <div className="herd-score-top">
              <div className="herd-score-icon">
                <Activity size={23} />
              </div>

              <div className="herd-score-live">
                <span className="herd-score-dot" />
                Live farm data
              </div>
            </div>

            <div className="herd-score-label">
              Herd health score
            </div>

            <div className="herd-score-number">
              {healthScore}
            </div>

            <div className="herd-score-status">
              {healthScore >= 85
                ? "Healthy herd condition"
                : healthScore >= 65
                  ? "Some animals need monitoring"
                  : "Immediate attention required"}
            </div>

            <div className="herd-score-track">
              <div
                className="herd-score-fill"
                style={{
                  width: `${healthScore}%`,
                }}
              />
            </div>

            <div className="herd-score-footer">
              <span>
                {healthyCount} healthy
              </span>

              <span>
                {needCare.length} need care
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          STATS
      =================================================== */}

      <section className="livestock-stats">
        <div className="livestock-stat">
          <div className="livestock-stat-icon">
            <PawPrint size={19} />
          </div>

          <div className="livestock-stat-value">
            {animals.length}
          </div>

          <div className="livestock-stat-label">
            Animals tracked
          </div>

          <div className="livestock-stat-meta">
            <Leaf size={11} />
            {speciesList.length} species
          </div>
        </div>

        <div className="livestock-stat">
          <div className="livestock-stat-icon">
            <HeartPulse size={19} />
          </div>

          <div className="livestock-stat-value">
            {healthyCount}
          </div>

          <div className="livestock-stat-label">
            Healthy animals
          </div>

          <div className="livestock-stat-meta">
            <TrendingUp size={11} />
            Stable records
          </div>
        </div>

        <div className="livestock-stat">
          <div className="livestock-stat-icon">
            <Syringe size={19} />
          </div>

          <div className="livestock-stat-value">
            {vaccinationDueSoon}
          </div>

          <div className="livestock-stat-label">
            Vaccinations due soon
          </div>

          <div className="livestock-stat-meta">
            <CalendarCheck size={11} />
            Within 7 days
          </div>
        </div>

        <div className="livestock-stat">
          <div className="livestock-stat-icon">
            <Milk size={19} />
          </div>

          <div className="livestock-stat-value">
            {totalMilk.toFixed(1)} L
          </div>

          <div className="livestock-stat-label">
            Recorded milk today
          </div>

          <div className="livestock-stat-meta">
            <Droplets size={11} />
            From available yield records
          </div>
        </div>
      </section>

      {/* ===================================================
          CARE ALERT
      =================================================== */}

      {needCare.length > 0 && (
        <div className="livestock-alert">
          <div className="livestock-alert-icon">
            <AlertCircle size={19} />
          </div>

          <div>
            <div className="livestock-alert-title">
              {needCare.length} animal
              {needCare.length > 1
                ? "s"
                : ""}{" "}
              require attention
            </div>

            <div className="livestock-alert-text">
              Review their latest check-up,
              notes and vaccination schedule.
              Animals marked for treatment should
              be evaluated by a qualified veterinary
              professional.
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          ANALYTICS
      =================================================== */}

      <section className="livestock-analytics">
        <div className="analytics-card">
          <div className="analytics-heading">
            <span>Milk production overview</span>
            <Milk className="size-5 text-primary" />
          </div>

          <div className="analytics-description">
            Calculated from livestock records that contain
            a daily yield value.
          </div>

          <div className="milk-summary">
            <div className="milk-main">
              <div className="milk-label">
                Recorded daily milk
              </div>

              <div className="milk-number">
                {totalMilk.toFixed(1)} L
              </div>

              <div className="milk-meta">
                <TrendingUp size={12} />
                {milkProducingAnimals.length} producing
                animal
                {milkProducingAnimals.length !==
                1
                  ? "s"
                  : ""}
              </div>
            </div>

            <div className="milk-side">
              <div className="milk-side-value">
                {milkProducingAnimals.length
                  ? (
                      totalMilk /
                      milkProducingAnimals.length
                    ).toFixed(1)
                  : "0.0"}{" "}
                L
              </div>

              <div className="milk-side-label">
                Average per producing animal
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border p-3">
              <div className="text-[8px] uppercase text-muted-foreground">
                Reference value
              </div>

              <div className="mt-1 text-sm font-black">
                ₹{estimatedMilkValue.toFixed(0)}
              </div>

              <div className="mt-1 text-[8px] text-muted-foreground">
                Using ₹{MILK_REFERENCE_PRICE}/L planning
                reference
              </div>
            </div>

            <div className="rounded-xl border p-3">
              <div className="text-[8px] uppercase text-muted-foreground">
                Records
              </div>

              <div className="mt-1 text-sm font-black">
                {milkProducingAnimals.length}
              </div>

              <div className="mt-1 text-[8px] text-muted-foreground">
                Animals with yield data
              </div>
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <div className="analytics-heading">
            <span>Herd health breakdown</span>
            <HeartPulse className="size-5 text-primary" />
          </div>

          <div className="analytics-description">
            Current health status distribution from your
            livestock records.
          </div>

          <div className="health-breakdown">
            <HealthBar
              label="Healthy"
              count={healthyCount}
              total={animals.length}
            />

            <HealthBar
              label="Monitor"
              count={monitorCount}
              total={animals.length}
            />

            <HealthBar
              label="Treatment"
              count={treatmentCount}
              total={animals.length}
            />
          </div>

          <div className="care-list">
            <CareItem
              icon={
                <Syringe size={15} />
              }
              title="Vaccination due soon"
              text="Within the next 7 days"
              value={String(
                vaccinationDueSoon,
              )}
            />

            <CareItem
              icon={
                <AlertCircle size={15} />
              }
              title="Vaccination overdue"
              text="Review schedule immediately"
              value={String(
                overdueVaccinations,
              )}
            />

            <CareItem
              icon={
                <Stethoscope size={15} />
              }
              title="Health monitoring"
              text="Animals marked for observation"
              value={String(
                monitorCount,
              )}
            />
          </div>
        </div>
      </section>

      {/* ===================================================
          SEARCH & FILTER
      =================================================== */}

      <section className="livestock-toolbar">
        <div className="toolbar-top">
          <div className="livestock-search">
            <Search size={16} />

            <Input
              value={query}
              onChange={(event) =>
                setQuery(
                  event.target.value,
                )
              }
              placeholder="Search animal tag, species, health or note..."
              aria-label="Search livestock"
            />
          </div>

          <select
            className="livestock-select"
            value={sortMode}
            onChange={(event) =>
              setSortMode(
                event.target.value as SortMode,
              )
            }
          >
            <option value="name">
              Sort by animal
            </option>

            <option value="health">
              Priority by health
            </option>

            <option value="vaccination">
              Vaccination date
            </option>

            <option value="age">
              Age
            </option>
          </select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setQuery("");
              setFilter("all");
              setSortMode("name");
            }}
          >
            <RefreshCw size={15} />
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
            <PawPrint size={12} />
            All
          </button>

          <button
            className={`filter-pill ${
              filter === "healthy"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setFilter("healthy")
            }
          >
            <CheckCircle2 size={12} />
            Healthy
          </button>

          <button
            className={`filter-pill ${
              filter === "monitor"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setFilter("monitor")
            }
          >
            <Activity size={12} />
            Monitor
          </button>

          <button
            className={`filter-pill ${
              filter === "treatment"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setFilter(
                "treatment",
              )
            }
          >
            <AlertCircle size={12} />
            Treatment
          </button>

          <button
            className={`filter-pill ${
              filter === "vaccination"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setFilter(
                "vaccination",
              )
            }
          >
            <Syringe size={12} />
            Vaccination
          </button>
        </div>
      </section>

      {/* ===================================================
          ANIMAL LIST
      =================================================== */}

      <section className="animal-section">
        <div className="animal-section-header">
          <div>
            <div className="animal-section-title">
              Livestock health registry
            </div>

            <div className="animal-section-subtitle">
              {visibleAnimals.length} of{" "}
              {animals.length} animals shown
            </div>
          </div>

          <Badge variant="secondary">
            {speciesList.length} species
          </Badge>
        </div>

        {visibleAnimals.length ? (
          <div className="animal-grid">
            {visibleAnimals.map(
              (animal) => {
                const vaccineDays =
                  daysUntil(
                    animal.nextVaccination,
                  );

                return (
                  <article
                    key={animal.id}
                    className="animal-card"
                  >
                    <div className="animal-card-head">
                      <div className="animal-identity">
                        <div className="animal-avatar">
                          <PawPrint size={21} />
                        </div>

                        <div>
                          <div className="animal-tag">
                            {animal.tag}
                          </div>

                          <div className="animal-species">
                            {animal.species} ·{" "}
                            {animal.age}
                          </div>
                        </div>
                      </div>

                      <Badge
                        variant="secondary"
                        className={`animal-health-badge ${healthClass(
                          animal.health,
                        )}`}
                      >
                        {animal.health}
                      </Badge>
                    </div>

                    <div className="animal-details">
                      <AnimalDetail
                        label="Last check-up"
                        value={formatDate(
                          animal.lastCheck,
                        )}
                      />

                      <AnimalDetail
                        label="Next vaccination"
                        value={formatDate(
                          animal.nextVaccination,
                        )}
                      />

                      {animal.yield ? (
                        <AnimalDetail
                          label="Daily yield"
                          value={
                            animal.yield
                          }
                        />
                      ) : (
                        <AnimalDetail
                          label="Production"
                          value="No yield record"
                        />
                      )}

                      <AnimalDetail
                        label="Vaccination status"
                        value={vaccinationStatus(
                          animal.nextVaccination,
                        )}
                      />
                    </div>

                    <div className="animal-note">
                      {animal.note}
                    </div>

                    <div className="animal-footer">
                      <div className="vaccine-status">
                        {vaccineDays !==
                          null &&
                        vaccineDays <
                          0 ? (
                          <>
                            <AlertCircle
                              size={11}
                              className="text-destructive"
                            />
                            Vaccination overdue
                          </>
                        ) : vaccineDays ===
                          0 ? (
                          <>
                            <Bell
                              size={11}
                              className="text-primary"
                            />
                            Due today
                          </>
                        ) : (
                          <>
                            <Calendar
                              size={11}
                            />
                            {vaccinationStatus(
                              animal.nextVaccination,
                            )}
                          </>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setSelectedAnimal(
                            animal,
                          )
                        }
                      >
                        Details
                        <ChevronRight className="ml-1 size-3" />
                      </Button>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        ) : (
          <div className="rounded-2xl border bg-card py-16 text-center">
            <Search className="mx-auto size-9 text-muted-foreground" />

            <div className="mt-3 text-sm font-black">
              No animals found
            </div>

            <div className="mt-1 text-xs text-muted-foreground">
              Try another search term or change the
              health filter.
            </div>

            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setQuery("");
                setFilter("all");
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </section>

      {/* ===================================================
          SUPPORT CARDS
      =================================================== */}

      <section className="livestock-support">
        <div className="support-box">
          <div className="support-icon">
            <Thermometer size={19} />
          </div>

          <div className="support-title">
            Early health monitoring
          </div>

          <div className="support-text">
            Changes in feeding, movement, production or
            behaviour can be useful warning signs. Record
            observations and seek veterinary advice when
            an animal appears unwell.
          </div>
        </div>

        <div className="support-box">
          <div className="support-icon">
            <Syringe size={19} />
          </div>

          <div className="support-title">
            Vaccination discipline
          </div>

          <div className="support-text">
            Keep vaccination records up to date and
            follow the schedule recommended by your
            veterinarian and applicable livestock health
            program.
          </div>
        </div>

        <div className="support-box">
          <div className="support-icon">
            <ShieldCheck size={19} />
          </div>

          <div className="support-title">
            Veterinary assistance
          </div>

          <div className="support-text">
            For serious symptoms, injuries or suspected
            disease, contact a qualified veterinarian or
            local animal-health service rather than relying
            only on app recommendations.
          </div>
        </div>
      </section>

      {/* ===================================================
          HELPLINE
      =================================================== */}

      <div className="mt-6">
        <AlertCard
          severity="info"
          title="Need help with an animal?"
          detail={`For agricultural support, Kisan Call Centre: ${KISAN_HELP}. For medical or veterinary emergencies, contact the appropriate local veterinary service.`}
          meta="Keep the animal tag, species, symptoms, recent check-up and vaccination history available when asking for help."
        />
      </div>

      {/* ===================================================
          FOOTER
      =================================================== */}

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
        <PhoneCall className="size-4" />

        <span>
          Support:
          <strong className="ml-1 text-foreground">
            {KISAN_HELP}
          </strong>
        </span>

        <span>•</span>

        <span>
          Keep livestock records updated
        </span>

        <span>•</span>

        <span>
          Consult a qualified veterinarian for
          animal-health decisions
        </span>
      </div>

      {/* ===================================================
          ANIMAL DETAILS MODAL
      =================================================== */}

      {selectedAnimal && (
        <div
          className="livestock-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedAnimal(
                null,
              );
            }
          }}
        >
          <div className="livestock-modal">
            <div className="modal-header">
              <div>
                <div className="modal-heading">
                  Animal health profile
                </div>

                <div className="modal-subheading">
                  Livestock management record
                </div>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setSelectedAnimal(
                    null,
                  )
                }
                aria-label="Close animal details"
              >
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-animal-hero">
                <div className="modal-animal-avatar">
                  <PawPrint size={25} />
                </div>

                <div>
                  <div className="modal-animal-name">
                    {selectedAnimal.tag}
                  </div>

                  <div className="modal-animal-meta">
                    {selectedAnimal.species} ·{" "}
                    {selectedAnimal.age}
                  </div>
                </div>

                <Badge
                  className="ml-auto"
                  variant="secondary"
                >
                  {selectedAnimal.health}
                </Badge>
              </div>

              <div className="modal-grid">
                <ModalBox
                  label="Last check-up"
                  value={formatDate(
                    selectedAnimal.lastCheck,
                  )}
                  icon={
                    <Stethoscope size={13} />
                  }
                />

                <ModalBox
                  label="Next vaccination"
                  value={formatDate(
                    selectedAnimal.nextVaccination,
                  )}
                  icon={
                    <Syringe size={13} />
                  }
                />

                <ModalBox
                  label="Vaccination status"
                  value={vaccinationStatus(
                    selectedAnimal.nextVaccination,
                  )}
                  icon={
                    <CalendarCheck size={13} />
                  }
                />

                <ModalBox
                  label="Daily yield"
                  value={
                    selectedAnimal.yield ||
                    "No yield recorded"
                  }
                  icon={
                    <Milk size={13} />
                  }
                />
              </div>

              <div className="modal-note">
                <div className="modal-note-title">
                  <ClipboardCheck
                    size={14}
                    className="text-primary"
                  />

                  Current observation
                </div>

                <div className="modal-note-text">
                  {selectedAnimal.note ||
                    "No observation has been recorded for this animal."}
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border p-4">
                  <div className="flex items-center gap-2">
                    <Activity className="size-4 text-primary" />

                    <span className="text-[10px] font-black">
                      Health monitoring
                    </span>
                  </div>

                  <p className="mt-2 text-[9px] leading-5 text-muted-foreground">
                    Continue observing feeding,
                    movement, behaviour and production
                    changes.
                  </p>
                </div>

                <div className="rounded-xl border p-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-primary" />

                    <span className="text-[10px] font-black">
                      Care reminder
                    </span>
                  </div>

                  <p className="mt-2 text-[9px] leading-5 text-muted-foreground">
                    Follow veterinarian guidance and
                    product or vaccination instructions.
                  </p>
                </div>
              </div>

              <div className="modal-footer">
                <Button
                  variant="outline"
                  onClick={() =>
                    setSelectedAnimal(
                      null,
                    )
                  }
                >
                  Close
                </Button>

                <Button
                  onClick={
                    copyHelpline
                  }
                >
                  {copied ? (
                    <CheckCircle2 className="mr-2 size-4" />
                  ) : (
                    <PhoneCall className="mr-2 size-4" />
                  )}

                  {copied
                    ? "Number copied"
                    : "Get support"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   HEALTH BAR
========================================================= */

function HealthBar({
  label,
  count,
  total,
}: {
  label: string;
  count: number;
  total: number;
}) {
  const percentage =
    total > 0
      ? Math.round(
          (count / total) * 100,
        )
      : 0;

  return (
    <div className="health-line">
      <div className="health-line-name">
        {label}
      </div>

      <div className="health-line-track">
        <div
          className="health-line-fill"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <div className="health-line-number">
        {count}
      </div>
    </div>
  );
}

/* =========================================================
   CARE ITEM
========================================================= */

function CareItem({
  icon,
  title,
  text,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  value: string;
}) {
  return (
    <div className="care-item">
      <div className="care-item-icon">
        {icon}
      </div>

      <div>
        <div className="care-item-title">
          {title}
        </div>

        <div className="care-item-text">
          {text}
        </div>
      </div>

      <Badge
        variant="secondary"
        className="care-status"
      >
        {value}
      </Badge>
    </div>
  );
}

/* =========================================================
   ANIMAL DETAIL
========================================================= */

function AnimalDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="animal-detail">
      <div className="animal-detail-label">
        {label}
      </div>

      <div className="animal-detail-value">
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   MODAL BOX
========================================================= */

function ModalBox({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="modal-box">
      <div className="flex items-center gap-1 text-muted-foreground">
        {icon}

        <span className="modal-label">
          {label}
        </span>
      </div>

      <div className="modal-value">
        {value}
      </div>
    </div>
  );
}