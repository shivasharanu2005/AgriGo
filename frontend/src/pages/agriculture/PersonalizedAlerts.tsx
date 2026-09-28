import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Bell,
  BellOff,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CloudRain,
  Droplets,
  Filter,
  Info,
  Leaf,
  MessageSquare,
  PhoneCall,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sprout,
  ThermometerSun,
  Tractor,
  TriangleAlert,
  UserRound,
  X,
  Zap,
} from "lucide-react";

import { AgriculturePageHeader } from "@/components/agriculture/AgriculturePageHeader";
import { EmptyState } from "@/components/agriculture/EmptyState";
import { LoadingState } from "@/components/agriculture/Loadingstate";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { agricultureApi } from "@/services/agricultureApi";

const channels = [
  {
    key: "sms",
    label: "Text message",
    detail: "Works on basic phones and does not require internet.",
    icon: MessageSquare,
  },
  {
    key: "app",
    label: "In-app notification",
    detail: "Shows detailed information, recommendations and photos.",
    icon: Smartphone,
  },
  {
    key: "voice",
    label: "Voice call",
    detail: "Useful for urgent alerts or farmers who prefer spoken alerts.",
    icon: PhoneCall,
  },
] as const;

type ChannelKey = (typeof channels)[number]["key"];

type SeverityFilter =
  | "all"
  | "critical"
  | "warning"
  | "info";

type AlertStatus =
  | "all"
  | "unread"
  | "acknowledged";

const styles = `
.alerts-page {
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
      transparent 28%
    );
}

.alerts-hero {
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
      transparent 57%
    ),
    hsl(var(--card));
  box-shadow:
    0 26px 75px hsl(var(--foreground) / .07);
}

.alerts-hero::before {
  content: "";
  position: absolute;
  width: 340px;
  height: 340px;
  right: -160px;
  top: -180px;
  border-radius: 50%;
  background: hsl(var(--primary) / .08);
}

.alerts-hero::after {
  content: "";
  position: absolute;
  width: 190px;
  height: 190px;
  left: 46%;
  bottom: -135px;
  border-radius: 50%;
  background: hsl(var(--chart-2) / .07);
}

.alerts-hero-grid {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns:
    minmax(0, 1.35fr)
    minmax(280px, .65fr);
  gap: 30px;
  align-items: center;
}

.alerts-kicker {
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

.alerts-title {
  margin-top: 15px;
  font-size: clamp(31px, 5vw, 56px);
  line-height: .98;
  font-weight: 950;
  letter-spacing: -.055em;
}

.alerts-title span {
  color: hsl(var(--primary));
}

.alerts-description {
  max-width: 710px;
  margin-top: 16px;
  color: hsl(var(--muted-foreground));
  font-size: 14px;
  line-height: 1.75;
}

.alerts-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin-top: 22px;
}

.alert-health-card {
  padding: 22px;
  border: 1px solid hsl(var(--border));
  border-radius: 22px;
  background: hsl(var(--background) / .72);
  backdrop-filter: blur(15px);
}

.alert-health-label {
  color: hsl(var(--muted-foreground));
  font-size: 9px;
  font-weight: 900;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.alert-health-number {
  margin-top: 8px;
  font-size: 48px;
  line-height: 1;
  font-weight: 950;
  letter-spacing: -.06em;
}

.alert-health-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 9px;
  padding: 6px 9px;
  border-radius: 999px;
  background: hsl(var(--primary) / .1);
  color: hsl(var(--primary));
  font-size: 9px;
  font-weight: 900;
}

.alert-health-track {
  height: 8px;
  overflow: hidden;
  margin-top: 18px;
  border-radius: 999px;
  background: hsl(var(--muted));
}

.alert-health-fill {
  height: 100%;
  border-radius: inherit;
  background: hsl(var(--primary));
  transition: width .5s ease;
}

.alert-health-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  color: hsl(var(--muted-foreground));
  font-size: 9px;
}

.alert-stats {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-top: 21px;
}

.alert-stat {
  padding: 18px;
  border: 1px solid hsl(var(--border));
  border-radius: 19px;
  background: hsl(var(--card));
  transition:
    transform .2s ease,
    box-shadow .2s ease;
}

.alert-stat:hover {
  transform: translateY(-3px);
  box-shadow:
    0 18px 45px hsl(var(--foreground) / .07);
}

.alert-stat-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: hsl(var(--primary) / .1);
  color: hsl(var(--primary));
}

.alert-stat-value {
  margin-top: 12px;
  font-size: 26px;
  font-weight: 950;
  letter-spacing: -.04em;
}

.alert-stat-label {
  margin-top: 3px;
  color: hsl(var(--muted-foreground));
  font-size: 10px;
}

.alert-stat-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 8px;
  color: hsl(var(--primary));
  font-size: 9px;
  font-weight: 800;
}

.channel-section {
  margin-top: 24px;
}

.channel-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.channel-title {
  font-size: 16px;
  font-weight: 950;
}

.channel-description {
  margin-top: 4px;
  color: hsl(var(--muted-foreground));
  font-size: 10px;
}

.channel-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 13px;
}

.channel-card {
  position: relative;
  overflow: hidden;
  padding: 17px;
  border: 1px solid hsl(var(--border));
  border-radius: 18px;
  background: hsl(var(--card));
  transition:
    transform .2s ease,
    border-color .2s ease,
    box-shadow .2s ease;
}

.channel-card:hover {
  transform: translateY(-3px);
  border-color: hsl(var(--primary) / .3);
  box-shadow:
    0 15px 40px hsl(var(--foreground) / .06);
}

.channel-card.active {
  border-color: hsl(var(--primary) / .35);
  background:
    linear-gradient(
      135deg,
      hsl(var(--primary) / .06),
      transparent
    ),
    hsl(var(--card));
}

.channel-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.channel-icon {
  display: grid;
  place-items: center;
  width: 41px;
  height: 41px;
  border-radius: 11px;
  background: hsl(var(--primary) / .1);
  color: hsl(var(--primary));
}

.channel-name {
  margin-top: 12px;
  font-size: 11px;
  font-weight: 900;
}

.channel-text {
  margin-top: 4px;
  color: hsl(var(--muted-foreground));
  font-size: 9px;
  line-height: 1.6;
}

.channel-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 11px;
  font-size: 8px;
  font-weight: 900;
  color: hsl(var(--muted-foreground));
}

.channel-status.enabled {
  color: hsl(var(--primary));
}

.alert-filter-box {
  margin-top: 25px;
  padding: 15px;
  border: 1px solid hsl(var(--border));
  border-radius: 19px;
  background: hsl(var(--card));
}

.alert-filter-main {
  display: flex;
  align-items: center;
  gap: 9px;
}

.alert-search {
  position: relative;
  flex: 1;
}

.alert-search svg {
  position: absolute;
  left: 13px;
  top: 50%;
  transform: translateY(-50%);
  color: hsl(var(--muted-foreground));
}

.alert-search input {
  width: 100%;
  height: 43px;
  padding: 0 13px 0 39px;
  border: 1px solid hsl(var(--border));
  border-radius: 11px;
  outline: none;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-size: 11px;
}

.alert-search input:focus {
  border-color: hsl(var(--primary) / .45);
  box-shadow:
    0 0 0 4px hsl(var(--primary) / .06);
}

.filter-select {
  height: 43px;
  min-width: 135px;
  padding: 0 10px;
  border: 1px solid hsl(var(--border));
  border-radius: 11px;
  outline: none;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-size: 10px;
  font-weight: 700;
}

.alert-filter-pills {
  display: flex;
  gap: 7px;
  overflow-x: auto;
  margin-top: 12px;
  scrollbar-width: none;
}

.alert-filter-pills::-webkit-scrollbar {
  display: none;
}

.alert-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex: 0 0 auto;
  padding: 7px 11px;
  border: 1px solid hsl(var(--border));
  border-radius: 999px;
  background: hsl(var(--background));
  color: hsl(var(--muted-foreground));
  font-size: 9px;
  font-weight: 850;
  cursor: pointer;
}

.alert-pill.active {
  border-color: hsl(var(--primary));
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

.alerts-section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
  margin-top: 27px;
}

.alerts-section-title {
  font-size: 17px;
  font-weight: 950;
}

.alerts-section-subtitle {
  margin-top: 3px;
  color: hsl(var(--muted-foreground));
  font-size: 9px;
}

.alert-list {
  display: grid;
  gap: 11px;
  margin-top: 15px;
}

.alert-item {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: flex-start;
  gap: 13px;
  padding: 17px;
  border: 1px solid hsl(var(--border));
  border-radius: 17px;
  background: hsl(var(--card));
  cursor: pointer;
  transition:
    transform .18s ease,
    box-shadow .18s ease,
    border-color .18s ease;
}

.alert-item:hover {
  transform: translateY(-2px);
  border-color: hsl(var(--primary) / .25);
  box-shadow:
    0 14px 40px hsl(var(--foreground) / .06);
}

.alert-item.unread {
  border-left: 4px solid hsl(var(--primary));
  background:
    linear-gradient(
      90deg,
      hsl(var(--primary) / .045),
      transparent 35%
    ),
    hsl(var(--card));
}

.alert-item.critical {
  border-left-color: hsl(var(--destructive));
}

.alert-item-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  border-radius: 12px;
  background: hsl(var(--primary) / .1);
  color: hsl(var(--primary));
}

.alert-item-icon.critical {
  background: hsl(var(--destructive) / .1);
  color: hsl(var(--destructive));
}

.alert-item-icon.warning {
  background: hsl(var(--warning) / .12);
  color: hsl(var(--warning-foreground));
}

.alert-item-content {
  min-width: 0;
  flex: 1;
}

.alert-item-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.alert-item-title {
  font-size: 12px;
  font-weight: 950;
}

.alert-item-detail {
  margin-top: 6px;
  color: hsl(var(--muted-foreground));
  font-size: 10px;
  line-height: 1.65;
}

.alert-item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.alert-meta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 7px;
  border-radius: 7px;
  background: hsl(var(--accent));
  color: hsl(var(--muted-foreground));
  font-size: 8px;
  font-weight: 750;
}

.alert-meta.primary {
  background: hsl(var(--primary) / .08);
  color: hsl(var(--primary));
}

.alert-meta.critical {
  background: hsl(var(--destructive) / .09);
  color: hsl(var(--destructive));
}

.alert-item-arrow {
  color: hsl(var(--muted-foreground));
}

.alert-actions {
  display: flex;
  align-items: center;
  gap: 5px;
  flex: 0 0 auto;
}

.alert-ack {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 7px;
  border-radius: 7px;
  background: hsl(var(--primary) / .08);
  color: hsl(var(--primary));
  font-size: 8px;
  font-weight: 850;
}

.insights-grid {
  display: grid;
  grid-template-columns:
    minmax(0, 1.1fr)
    minmax(0, .9fr);
  gap: 16px;
  margin-top: 23px;
}

.insight-card {
  padding: 19px;
  border: 1px solid hsl(var(--border));
  border-radius: 19px;
  background: hsl(var(--card));
}

.insight-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.insight-title {
  font-size: 13px;
  font-weight: 950;
}

.insight-description {
  margin-top: 4px;
  color: hsl(var(--muted-foreground));
  font-size: 9px;
}

.insight-list {
  display: grid;
  gap: 8px;
  margin-top: 15px;
}

.insight-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 11px;
  border-radius: 11px;
  background: hsl(var(--accent) / .55);
}

.insight-left {
  display: flex;
  align-items: center;
  gap: 9px;
}

.insight-icon {
  display: grid;
  place-items: center;
  width: 31px;
  height: 31px;
  border-radius: 8px;
  background: hsl(var(--primary) / .1);
  color: hsl(var(--primary));
}

.insight-name {
  font-size: 9px;
  font-weight: 850;
}

.insight-meta {
  margin-top: 2px;
  color: hsl(var(--muted-foreground));
  font-size: 7px;
}

.insight-value {
  font-size: 10px;
  font-weight: 950;
}

.modal-backdrop {
  position: fixed;
  z-index: 100;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 17px;
  background: hsl(var(--foreground) / .58);
  backdrop-filter: blur(8px);
}

.alert-modal {
  width: min(650px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid hsl(var(--border));
  border-radius: 23px;
  background: hsl(var(--card));
  box-shadow:
    0 35px 100px hsl(var(--foreground) / .3);
}

.modal-header {
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

.modal-title {
  font-size: 15px;
  font-weight: 950;
}

.modal-subtitle {
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

.modal-alert-hero {
  padding: 18px;
  border-radius: 17px;
  background:
    linear-gradient(
      135deg,
      hsl(var(--primary) / .1),
      transparent
    );
}

.modal-alert-title {
  margin-top: 11px;
  font-size: 21px;
  font-weight: 950;
  letter-spacing: -.035em;
}

.modal-alert-detail {
  margin-top: 7px;
  color: hsl(var(--muted-foreground));
  font-size: 10px;
  line-height: 1.7;
}

.modal-info-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 15px;
}

.modal-info-box {
  padding: 13px;
  border: 1px solid hsl(var(--border));
  border-radius: 13px;
}

.modal-info-label {
  color: hsl(var(--muted-foreground));
  font-size: 8px;
  font-weight: 850;
  text-transform: uppercase;
}

.modal-info-value {
  margin-top: 5px;
  font-size: 11px;
  font-weight: 900;
}

.modal-recommendation {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-top: 14px;
  padding: 14px;
  border: 1px solid hsl(var(--primary) / .15);
  border-radius: 13px;
  background: hsl(var(--primary) / .04);
}

.modal-recommendation-title {
  font-size: 10px;
  font-weight: 900;
}

.modal-recommendation-text {
  margin-top: 4px;
  color: hsl(var(--muted-foreground));
  font-size: 9px;
  line-height: 1.65;
}

.modal-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 17px;
  padding-top: 15px;
  border-top: 1px solid hsl(var(--border));
}

@media (max-width: 1050px) {
  .alert-stats {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .channel-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .alerts-hero-grid {
    grid-template-columns: 1fr;
  }

  .insights-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .alert-filter-main {
    flex-wrap: wrap;
  }

  .alert-search {
    flex-basis: 100%;
  }

  .filter-select {
    flex: 1;
    min-width: 0;
  }
}

@media (max-width: 560px) {
  .alerts-hero {
    padding: 23px;
  }

  .alert-stats {
    grid-template-columns: 1fr;
  }

  .alerts-actions {
    flex-direction: column;
  }

  .alerts-actions button {
    width: 100%;
  }

  .alerts-section-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .alert-item {
    padding: 14px;
  }

  .alert-item-top {
    flex-direction: column;
  }

  .alert-actions {
    position: absolute;
    right: 12px;
    top: 12px;
  }

  .modal-info-grid {
    grid-template-columns: 1fr;
  }
}

@media print {
  .alerts-page {
    background: white;
  }

  .alerts-actions,
  .channel-section,
  .alert-filter-box,
  .alert-actions,
  .modal-backdrop,
  button {
    display: none !important;
  }

  .alerts-hero,
  .alert-stat,
  .alert-item,
  .insight-card {
    box-shadow: none !important;
    break-inside: avoid;
  }
}
`;

function severityIcon(severity: string) {
  if (severity === "critical") {
    return ShieldAlert;
  }

  if (severity === "warning") {
    return TriangleAlert;
  }

  return Info;
}

function categoryIcon(text: string) {
  const value = text.toLowerCase();

  if (
    value.includes("rain") ||
    value.includes("weather") ||
    value.includes("storm")
  ) {
    return CloudRain;
  }

  if (
    value.includes("pest") ||
    value.includes("disease") ||
    value.includes("crop")
  ) {
    return Leaf;
  }

  if (
    value.includes("water") ||
    value.includes("irrigation")
  ) {
    return Droplets;
  }

  if (
    value.includes("animal") ||
    value.includes("vaccin") ||
    value.includes("livestock")
  ) {
    return UserRound;
  }

  if (
    value.includes("equipment") ||
    value.includes("tractor") ||
    value.includes("machine")
  ) {
    return Tractor;
  }

  return Bell;
}

function getSeverityClass(severity: string) {
  if (severity === "critical") {
    return "critical";
  }

  if (severity === "warning") {
    return "warning";
  }

  return "";
}

export default function PersonalizedAlerts() {
  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["alerts"],
    queryFn: agricultureApi.getAlerts,
  });

  const [enabled, setEnabled] =
    useState<Record<ChannelKey, boolean>>({
      sms: true,
      app: true,
      voice: false,
    });

  const [query, setQuery] =
    useState("");

  const [severity, setSeverity] =
    useState<SeverityFilter>("all");

  const [status, setStatus] =
    useState<AlertStatus>("all");

  const [selectedAlert, setSelectedAlert] =
    useState<any | null>(null);

  const [acknowledged, setAcknowledged] =
    useState<string[]>([]);

  const [quietHours, setQuietHours] =
    useState(false);

  const [readAlerts, setReadAlerts] =
    useState<string[]>([]);

  const alerts = data ?? [];

  const criticalCount = alerts.filter(
    (alert) =>
      alert.severity === "critical",
  ).length;

  const warningCount = alerts.filter(
    (alert) =>
      alert.severity === "warning",
  ).length;

  const unreadCount = alerts.filter(
    (alert) =>
      !readAlerts.includes(alert.id),
  ).length;

  const activeChannels =
    Object.values(enabled).filter(
      Boolean,
    ).length;

  const filteredAlerts = useMemo(() => {
    const search =
      query.trim().toLowerCase();

    return alerts.filter((alert) => {
      const searchable = [
        alert.title,
        alert.detail,
        alert.channel,
        alert.raisedAt,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !search ||
        searchable.includes(search);

      const matchesSeverity =
        severity === "all" ||
        alert.severity === severity;

      const matchesStatus =
        status === "all"
          ? true
          : status === "unread"
            ? !readAlerts.includes(
                alert.id,
              )
            : acknowledged.includes(
                alert.id,
              );

      return (
        matchesSearch &&
        matchesSeverity &&
        matchesStatus
      );
    });
  }, [
    alerts,
    query,
    severity,
    status,
    readAlerts,
    acknowledged,
  ]);

  const alertHealth = Math.max(
    0,
    Math.min(
      100,
      100 -
        criticalCount * 18 -
        warningCount * 5 -
        unreadCount * 2,
    ),
  );

  const acknowledgeAlert = (
    id: string,
  ) => {
    setAcknowledged((previous) =>
      previous.includes(id)
        ? previous
        : [...previous, id],
    );

    setReadAlerts((previous) =>
      previous.includes(id)
        ? previous
        : [...previous, id],
    );
  };

  const markRead = (id: string) => {
    setReadAlerts((previous) =>
      previous.includes(id)
        ? previous
        : [...previous, id],
    );
  };

  if (isError) {
    return (
      <div className="alerts-page">
        <style>{styles}</style>

        <AgriculturePageHeader
          icon={Bell}
          title="Personalized Alerts"
          description="Receive farm-specific warnings for weather, pests, irrigation, livestock and important agricultural tasks."
        />

        <div className="py-20 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-destructive/10 text-destructive">
            <BellOff size={27} />
          </div>

          <h3 className="mt-4 text-lg font-black">
            Alerts could not be loaded
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            The notification service did not return your alert information.
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

  if (isLoading) {
    return (
      <div className="alerts-page">
        <style>{styles}</style>

        <AgriculturePageHeader
          icon={Bell}
          title="Personalized Alerts"
          description="Warnings that match your fields, crops, animals and agricultural activities."
        />

        <LoadingState rows={5} />
      </div>
    );
  }

  if (!alerts.length) {
    return (
      <div className="alerts-page">
        <style>{styles}</style>

        <AgriculturePageHeader
          icon={Bell}
          title="Personalized Alerts"
          description="Smart farm warnings delivered through the channels you choose."
        />

        <EmptyState
          icon={Bell}
          title="No alerts right now"
          description="Your farm is currently quiet. You'll be notified when something needs attention."
        />
      </div>
    );
  }

  return (
    <div className="alerts-page">
      <style>{styles}</style>

      <AgriculturePageHeader
        icon={Bell}
        title="Personalized Alerts"
        description="Warnings that match your fields, crops and animals — weather changes, pest risks, irrigation events, vaccination dates and important farm deadlines."
      />

      {/* HERO */}
      <section className="alerts-hero">
        <div className="alerts-hero-grid">
          <div>
            <div className="alerts-kicker">
              <Zap size={13} />
              Smart Farm Notification Center
            </div>

            <h1 className="alerts-title">
              Know what needs
              <br />
              <span>attention first.</span>
            </h1>

            <p className="alerts-description">
              Your farm generates many signals every day. This dashboard helps separate urgent problems from normal updates so you can respond before a small issue becomes a major loss.
            </p>

            <div className="alerts-actions">
              <Button
                onClick={() =>
                  setSeverity("critical")
                }
              >
                <ShieldAlert className="mr-2 size-4" />
                View urgent alerts
              </Button>

              <Button
                variant="outline"
                onClick={() =>
                  setStatus("unread")
                }
              >
                <Bell className="mr-2 size-4" />
                Unread alerts
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
                Refresh
              </Button>
            </div>
          </div>

          <div className="alert-health-card">
            <div className="alert-health-label">
              Alert readiness
            </div>

            <div className="alert-health-number">
              {alertHealth}
            </div>

            <div className="alert-health-status">
              <ShieldCheck size={12} />
              Notification readiness
            </div>

            <div className="alert-health-track">
              <div
                className="alert-health-fill"
                style={{
                  width: `${alertHealth}%`,
                }}
              />
            </div>

            <div className="alert-health-footer">
              <span>
                {activeChannels} channels active
              </span>

              <span>
                {criticalCount} critical
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="alert-stats">
        <div className="alert-stat">
          <div className="alert-stat-icon">
            <Bell size={19} />
          </div>

          <div className="alert-stat-value">
            {alerts.length}
          </div>

          <div className="alert-stat-label">
            Active alerts
          </div>

          <div className="alert-stat-meta">
            <Clock3 size={11} />
            Current notification queue
          </div>
        </div>

        <div className="alert-stat">
          <div className="alert-stat-icon">
            <ShieldAlert size={19} />
          </div>

          <div className="alert-stat-value">
            {criticalCount}
          </div>

          <div className="alert-stat-label">
            Critical alerts
          </div>

          <div className="alert-stat-meta">
            <TriangleAlert size={11} />
            Requires priority action
          </div>
        </div>

        <div className="alert-stat">
          <div className="alert-stat-icon">
            <BellOff size={19} />
          </div>

          <div className="alert-stat-value">
            {unreadCount}
          </div>

          <div className="alert-stat-label">
            Unread notifications
          </div>

          <div className="alert-stat-meta">
            <Info size={11} />
            Needs review
          </div>
        </div>

        <div className="alert-stat">
          <div className="alert-stat-icon">
            <Smartphone size={19} />
          </div>

          <div className="alert-stat-value">
            {activeChannels}/3
          </div>

          <div className="alert-stat-label">
            Delivery channels
          </div>

          <div className="alert-stat-meta">
            <CheckCircle2 size={11} />
            Channels enabled
          </div>
        </div>
      </div>

      {/* DELIVERY CHANNELS */}
      <section className="channel-section">
        <div className="channel-header">
          <div>
            <div className="channel-title">
              How you receive alerts
            </div>

            <div className="channel-description">
              Choose multiple channels so important farm warnings are less likely to be missed.
            </div>
          </div>

          <Badge variant="secondary">
            {activeChannels} active
          </Badge>
        </div>

        <div className="channel-grid">
          {channels.map((channel) => {
            const Icon = channel.icon;
            const active =
              enabled[channel.key];

            return (
              <div
                key={channel.key}
                className={`channel-card ${
                  active ? "active" : ""
                }`}
              >
                <div className="channel-top">
                  <div className="channel-icon">
                    <Icon size={19} />
                  </div>

                  <Switch
                    id={`channel-${channel.key}`}
                    checked={active}
                    onCheckedChange={(value) =>
                      setEnabled((previous) => ({
                        ...previous,
                        [channel.key]:
                          value,
                      }))
                    }
                  />
                </div>

                <div className="channel-name">
                  <Label
                    htmlFor={`channel-${channel.key}`}
                  >
                    {channel.label}
                  </Label>
                </div>

                <div className="channel-text">
                  {channel.detail}
                </div>

                <div
                  className={`channel-status ${
                    active ? "enabled" : ""
                  }`}
                >
                  {active ? (
                    <>
                      <CheckCircle2 size={11} />
                      Enabled
                    </>
                  ) : (
                    <>
                      <BellOff size={11} />
                      Disabled
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* PREFERENCES */}
      <section className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Clock3 size={18} />
              </div>

              <div>
                <h3 className="text-sm font-black">
                  Quiet hours
                </h3>

                <p className="mt-1 text-[10px] leading-5 text-muted-foreground">
                  Reduce non-critical notifications during your preferred rest period.
                </p>
              </div>
            </div>

            <Switch
              checked={quietHours}
              onCheckedChange={setQuietHours}
              aria-label="Quiet hours"
            />
          </div>

          <div className="mt-4 rounded-xl bg-muted/50 p-3 text-[9px] text-muted-foreground">
            <strong className="text-foreground">
              {quietHours
                ? "Quiet hours enabled"
                : "Quiet hours disabled"}
            </strong>

            <div className="mt-1">
              Critical alerts should still be reviewed promptly even when notification preferences are changed.
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-start gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck size={18} />
            </div>

            <div>
              <h3 className="text-sm font-black">
                Smart notification principle
              </h3>

              <p className="mt-1 text-[10px] leading-5 text-muted-foreground">
                Alerts should support decisions rather than create unnecessary notification overload.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="secondary">
              Weather
            </Badge>

            <Badge variant="secondary">
              Crop health
            </Badge>

            <Badge variant="secondary">
              Irrigation
            </Badge>

            <Badge variant="secondary">
              Livestock
            </Badge>

            <Badge variant="secondary">
              Farm tasks
            </Badge>
          </div>
        </div>
      </section>

      {/* SEARCH / FILTER */}
      <section className="alert-filter-box">
        <div className="alert-filter-main">
          <div className="alert-search">
            <Search size={16} />

            <input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search alerts, crops, weather, livestock..."
              aria-label="Search alerts"
            />
          </div>

          <select
            className="filter-select"
            value={severity}
            onChange={(event) =>
              setSeverity(
                event.target.value as SeverityFilter,
              )
            }
            aria-label="Filter severity"
          >
            <option value="all">
              All severity
            </option>

            <option value="critical">
              Critical
            </option>

            <option value="warning">
              Warning
            </option>

            <option value="info">
              Information
            </option>
          </select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setQuery("");
              setSeverity("all");
              setStatus("all");
            }}
          >
            <Filter size={16} />
          </Button>
        </div>

        <div className="alert-filter-pills">
          <button
            className={`alert-pill ${
              status === "all"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setStatus("all")
            }
          >
            <Bell size={11} />
            All alerts
          </button>

          <button
            className={`alert-pill ${
              status === "unread"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setStatus("unread")
            }
          >
            <BellOff size={11} />
            Unread
          </button>

          <button
            className={`alert-pill ${
              status === "acknowledged"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setStatus("acknowledged")
            }
          >
            <Check size={11} />
            Acknowledged
          </button>

          <button
            className={`alert-pill ${
              severity === "critical"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setSeverity("critical")
            }
          >
            <ShieldAlert size={11} />
            Critical
          </button>

          <button
            className={`alert-pill ${
              severity === "warning"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setSeverity("warning")
            }
          >
            <TriangleAlert size={11} />
            Warning
          </button>
        </div>
      </section>

      {/* ALERT LIST */}
      <section>
        <div className="alerts-section-heading">
          <div>
            <div className="alerts-section-title">
              Farm alert inbox
            </div>

            <div className="alerts-section-subtitle">
              {filteredAlerts.length} notifications matching your current filters
            </div>
          </div>

          <Badge variant="secondary">
            Real-time farm signals
          </Badge>
        </div>

        {filteredAlerts.length ? (
          <div className="alert-list">
            {filteredAlerts.map((alert) => {
              const Icon =
                categoryIcon(
                  `${alert.title} ${alert.detail}`,
                );

              const SeverityIcon =
                severityIcon(
                  alert.severity,
                );

              const unread =
                !readAlerts.includes(
                  alert.id,
                );

              const isAcknowledged =
                acknowledged.includes(
                  alert.id,
                );

              const severityClass =
                getSeverityClass(
                  alert.severity,
                );

              return (
                <article
                  key={alert.id}
                  className={`alert-item ${
                    unread ? "unread" : ""
                  } ${
                    alert.severity ===
                    "critical"
                      ? "critical"
                      : ""
                  }`}
                  onClick={() => {
                    markRead(alert.id);
                    setSelectedAlert(
                      alert,
                    );
                  }}
                >
                  <div
                    className={`alert-item-icon ${severityClass}`}
                  >
                    <Icon size={19} />
                  </div>

                  <div className="alert-item-content">
                    <div className="alert-item-top">
                      <div className="min-w-0">
                        <div className="alert-item-title">
                          {alert.title}
                        </div>

                        <div className="alert-item-detail">
                          {alert.detail}
                        </div>
                      </div>

                      <div className="alert-actions">
                        {isAcknowledged ? (
                          <span className="alert-ack">
                            <Check size={10} />
                            Done
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(event) => {
                              event.stopPropagation();
                              acknowledgeAlert(
                                alert.id,
                              );
                            }}
                          >
                            <Check className="mr-1 size-3" />
                            Acknowledge
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="alert-item-meta">
                      <span
                        className={`alert-meta ${
                          alert.severity ===
                          "critical"
                            ? "critical"
                            : ""
                        }`}
                      >
                        <SeverityIcon size={10} />
                        {alert.severity}
                      </span>

                      <span className="alert-meta primary">
                        <Smartphone size={10} />
                        {alert.channel}
                      </span>

                      <span className="alert-meta">
                        <Clock3 size={10} />
                        {alert.raisedAt}
                      </span>

                      {unread && (
                        <span className="alert-meta primary">
                          New
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight
                    className="alert-item-arrow mt-1 size-4"
                    aria-hidden
                  />
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border bg-card py-16 text-center">
            <Search className="mx-auto size-9 text-muted-foreground" />

            <div className="mt-3 text-sm font-black">
              No matching alerts
            </div>

            <div className="mt-1 text-xs text-muted-foreground">
              Try changing your search or notification filters.
            </div>

            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setQuery("");
                setSeverity("all");
                setStatus("all");
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </section>

      {/* INSIGHTS */}
      <section className="insights-grid">
        <div className="insight-card">
          <div className="insight-heading">
            <div>
              <div className="insight-title">
                Alert intelligence
              </div>

              <div className="insight-description">
                A quick operational view of the current notification workload.
              </div>
            </div>

            <Zap className="size-5 text-primary" />
          </div>

          <div className="insight-list">
            <div className="insight-row">
              <div className="insight-left">
                <div className="insight-icon">
                  <CloudRain size={15} />
                </div>

                <div>
                  <div className="insight-name">
                    Weather awareness
                  </div>

                  <div className="insight-meta">
                    Rain, temperature and storm signals
                  </div>
                </div>
              </div>

              <div className="insight-value">
                {alerts.filter((a) =>
                  `${a.title} ${a.detail}`
                    .toLowerCase()
                    .includes("rain"),
                ).length}
              </div>
            </div>

            <div className="insight-row">
              <div className="insight-left">
                <div className="insight-icon">
                  <Leaf size={15} />
                </div>

                <div>
                  <div className="insight-name">
                    Crop protection
                  </div>

                  <div className="insight-meta">
                    Pest and crop-health warnings
                  </div>
                </div>
              </div>

              <div className="insight-value">
                {alerts.filter((a) =>
                  `${a.title} ${a.detail}`
                    .toLowerCase()
                    .includes("pest"),
                ).length}
              </div>
            </div>

            <div className="insight-row">
              <div className="insight-left">
                <div className="insight-icon">
                  <Droplets size={15} />
                </div>

                <div>
                  <div className="insight-name">
                    Water management
                  </div>

                  <div className="insight-meta">
                    Irrigation and moisture events
                  </div>
                </div>
              </div>

              <div className="insight-value">
                {alerts.filter((a) =>
                  `${a.title} ${a.detail}`
                    .toLowerCase()
                    .includes("water"),
                ).length}
              </div>
            </div>
          </div>
        </div>

        <div className="insight-card">
          <div className="insight-heading">
            <div>
              <div className="insight-title">
                Notification health
              </div>

              <div className="insight-description">
                Current configuration of your alert delivery system.
              </div>
            </div>

            <Smartphone className="size-5 text-primary" />
          </div>

          <div className="insight-list">
            {channels.map((channel) => {
              const active =
                enabled[channel.key];

              return (
                <div
                  className="insight-row"
                  key={channel.key}
                >
                  <div className="insight-left">
                    <div className="insight-icon">
                      <channel.icon size={15} />
                    </div>

                    <div>
                      <div className="insight-name">
                        {channel.label}
                      </div>

                      <div className="insight-meta">
                        Delivery channel
                      </div>
                    </div>
                  </div>

                  <div
                    className={`insight-value ${
                      active
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {active
                      ? "ON"
                      : "OFF"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* REAL WORLD DISCLAIMER */}
      <section className="mt-5 flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-5">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />

        <div>
          <div className="text-xs font-black">
            Use alerts as decision support
          </div>

          <div className="mt-1 text-[10px] leading-5 text-muted-foreground">
            Weather, pest and agricultural alerts can change quickly. Verify important conditions in the field and follow local agricultural officer, veterinarian or product-label guidance before taking high-impact action.
          </div>
        </div>
      </section>

      {/* DETAIL MODAL */}
      {selectedAlert && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedAlert(
                null,
              );
            }
          }}
        >
          <div className="alert-modal">
            <div className="modal-header">
              <div>
                <div className="modal-title">
                  Alert details
                </div>

                <div className="modal-subtitle">
                  Personalized farm notification
                </div>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setSelectedAlert(
                    null,
                  )
                }
                aria-label="Close alert details"
              >
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-alert-hero">
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={
                      selectedAlert.severity ===
                      "critical"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {selectedAlert.severity}
                  </Badge>

                  <Badge variant="outline">
                    {selectedAlert.channel}
                  </Badge>

                  {acknowledged.includes(
                    selectedAlert.id,
                  ) && (
                    <Badge>
                      <Check className="mr-1 size-3" />
                      Acknowledged
                    </Badge>
                  )}
                </div>

                <div className="modal-alert-title">
                  {selectedAlert.title}
                </div>

                <div className="modal-alert-detail">
                  {selectedAlert.detail}
                </div>
              </div>

              <div className="modal-info-grid">
                <div className="modal-info-box">
                  <div className="modal-info-label">
                    Severity
                  </div>

                  <div className="modal-info-value capitalize">
                    {selectedAlert.severity}
                  </div>
                </div>

                <div className="modal-info-box">
                  <div className="modal-info-label">
                    Delivery channel
                  </div>

                  <div className="modal-info-value">
                    {selectedAlert.channel}
                  </div>
                </div>

                <div className="modal-info-box">
                  <div className="modal-info-label">
                    Raised at
                  </div>

                  <div className="modal-info-value">
                    {selectedAlert.raisedAt}
                  </div>
                </div>

                <div className="modal-info-box">
                  <div className="modal-info-label">
                    Status
                  </div>

                  <div className="modal-info-value">
                    {acknowledged.includes(
                      selectedAlert.id,
                    )
                      ? "Acknowledged"
                      : "Needs review"}
                  </div>
                </div>
              </div>

              <div className="modal-recommendation">
                <ShieldCheck
                  size={17}
                  className="mt-0.5 shrink-0 text-primary"
                />

                <div>
                  <div className="modal-recommendation-title">
                    Recommended next step
                  </div>

                  <div className="modal-recommendation-text">
                    Review the alert context, check the affected field or animal and confirm the current conditions before taking action. For critical events, contact the appropriate agricultural professional when required.
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                {!acknowledged.includes(
                  selectedAlert.id,
                ) && (
                  <Button
                    onClick={() =>
                      acknowledgeAlert(
                        selectedAlert.id,
                      )
                    }
                  >
                    <Check className="mr-2 size-4" />
                    Acknowledge alert
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => {
                    markRead(
                      selectedAlert.id,
                    );
                    setSelectedAlert(
                      null,
                    );
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}