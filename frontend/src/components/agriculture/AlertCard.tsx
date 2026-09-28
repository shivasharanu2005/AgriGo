import React, { ReactNode, useState } from "react";
import {
  AlertCircle,
  AlertOctagon,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  Info,
  Leaf,
  MapPin,
  ShieldAlert,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* =========================================================
   TYPES
========================================================= */

type AlertSeverity =
  | "info"
  | "warning"
  | "critical"
  | "success";

interface AlertCardProps {
  severity?: AlertSeverity;
  title: string;
  detail?: string;
  description?: string;
  meta?: string;
  action?: ReactNode;
  className?: string;

  /* Advanced options */
  icon?: ReactNode;
  badgeText?: string;
  timestamp?: string;
  category?: string;
  location?: string;

  dismissible?: boolean;
  onDismiss?: () => void;

  onClick?: () => void;

  compact?: boolean;
  showArrow?: boolean;
  pulse?: boolean;

  showPriority?: boolean;
  priority?: "low" | "medium" | "high" | "urgent";

  showProgress?: boolean;
  progress?: number;

  showStatus?: boolean;
  statusText?: string;

  showFooter?: boolean;
  footer?: ReactNode;

  showAiBadge?: boolean;
  aiText?: string;

  read?: boolean;
  onRead?: () => void;
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export function AlertCard({
  severity = "info",
  title,
  detail,
  description,
  meta,
  action,
  className,

  icon,
  badgeText,
  timestamp,
  category,
  location,

  dismissible = false,
  onDismiss,

  onClick,

  compact = false,
  showArrow = false,
  pulse = false,

  showPriority = false,
  priority = "medium",

  showProgress = false,
  progress = 0,

  showStatus = false,
  statusText,

  showFooter = false,
  footer,

  showAiBadge = false,
  aiText = "AI Insight",

  read = true,
  onRead,
}: AlertCardProps) {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const displayDetail = detail ?? description ?? "";

  /* =========================================================
     SEVERITY CONFIGURATION
  ========================================================= */

  const severityConfig = {
    info: {
      label: "Information",

      wrapper:
        "border-sky-200/80 bg-sky-50/80 dark:border-sky-900/60 dark:bg-sky-950/20",

      icon:
        "bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400",

      accent: "bg-sky-500",

      badge:
        "border-sky-200 bg-sky-100 text-sky-700 dark:border-sky-900 dark:bg-sky-900/40 dark:text-sky-400",

      button:
        "border-sky-200 bg-sky-100 text-sky-700 hover:bg-sky-200 dark:border-sky-900 dark:bg-sky-900/40 dark:text-sky-400",

      Icon: Info,
    },

    warning: {
      label: "Warning",

      wrapper:
        "border-amber-200/80 bg-amber-50/80 dark:border-amber-900/60 dark:bg-amber-950/20",

      icon:
        "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400",

      accent: "bg-amber-500",

      badge:
        "border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-900 dark:bg-amber-900/40 dark:text-amber-400",

      button:
        "border-amber-200 bg-amber-100 text-amber-700 hover:bg-amber-200 dark:border-amber-900 dark:bg-amber-900/40 dark:text-amber-400",

      Icon: AlertCircle,
    },

    critical: {
      label: "Critical",

      wrapper:
        "border-rose-200/90 bg-rose-50/90 dark:border-rose-900/60 dark:bg-rose-950/20",

      icon:
        "bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400",

      accent: "bg-rose-500",

      badge:
        "border-rose-200 bg-rose-100 text-rose-700 dark:border-rose-900 dark:bg-rose-900/40 dark:text-rose-400",

      button:
        "border-rose-200 bg-rose-100 text-rose-700 hover:bg-rose-200 dark:border-rose-900 dark:bg-rose-900/40 dark:text-rose-400",

      Icon: ShieldAlert,
    },

    success: {
      label: "Resolved",

      wrapper:
        "border-emerald-200/80 bg-emerald-50/80 dark:border-emerald-900/60 dark:bg-emerald-950/20",

      icon:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400",

      accent: "bg-emerald-500",

      badge:
        "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-400",

      button:
        "border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:border-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-400",

      Icon: CheckCircle2,
    },
  }[severity];

  const SeverityIcon = severityConfig.Icon;

  /* =========================================================
     PRIORITY CONFIGURATION
  ========================================================= */

  const priorityConfig = {
    low: {
      label: "Low",
      className:
        "border-slate-200 bg-slate-100 text-slate-600",
    },

    medium: {
      label: "Medium",
      className:
        "border-blue-200 bg-blue-100 text-blue-700",
    },

    high: {
      label: "High",
      className:
        "border-orange-200 bg-orange-100 text-orange-700",
    },

    urgent: {
      label: "Urgent",
      className:
        "border-red-200 bg-red-100 text-red-700",
    },
  }[priority];

  /* =========================================================
     HANDLERS
  ========================================================= */

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const handleRead = () => {
    onRead?.();
  };

  if (dismissed) {
    return null;
  }

  /* =========================================================
     CARD
  ========================================================= */

  return (
    <article
      role={
        severity === "critical"
          ? "alert"
          : "status"
      }
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl border shadow-sm",
        "transition-all duration-300 ease-out",

        "hover:-translate-y-0.5",
        "hover:shadow-lg",

        severityConfig.wrapper,

        onClick &&
          "cursor-pointer",

        !read &&
          "ring-2 ring-primary/10",

        compact
          ? "p-3.5"
          : "p-4 sm:p-5",

        className,
      )}
    >
      {/* =====================================================
          LEFT SEVERITY BAR
      ===================================================== */}

      <span
        aria-hidden="true"
        className={cn(
          "absolute bottom-0 left-0 top-0 w-1",
          severityConfig.accent,
        )}
      />

      {/* =====================================================
          TOP RIGHT DECORATION
      ===================================================== */}

      {pulse &&
      severity === "critical" ? (
        <span className="absolute right-5 top-5 flex size-3">
          <span
            className={cn(
              "absolute inline-flex size-full animate-ping rounded-full opacity-60",
              severityConfig.accent,
            )}
          />

          <span
            className={cn(
              "relative inline-flex size-3 rounded-full",
              severityConfig.accent,
            )}
          />
        </span>
      ) : null}

      {/* =====================================================
          MAIN FLEX
      ===================================================== */}

      <div className="flex items-start gap-3 sm:gap-4">
        {/* ===================================================
            ICON
        =================================================== */}

        <div
          className={cn(
            "relative grid shrink-0 place-items-center rounded-xl",
            compact
              ? "size-9"
              : "size-11 sm:size-12",
            severityConfig.icon,
          )}
        >
          {icon || (
            <SeverityIcon
              className={
                compact
                  ? "size-4"
                  : "size-5 sm:size-6"
              }
              aria-hidden
            />
          )}

          {!read ? (
            <span className="absolute -right-1 -top-1 size-2.5 rounded-full border-2 border-card bg-primary" />
          ) : null}
        </div>

        {/* ===================================================
            CONTENT
        =================================================== */}

        <div className="min-w-0 flex-1">
          {/* =================================================
              HEADER BADGES
          ================================================= */}

          <div className="mb-2 flex flex-wrap items-center gap-2">
            {category ? (
              <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                {category}
              </span>
            ) : null}

            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5",
                "text-[9px] font-bold uppercase tracking-wide",
                severityConfig.badge,
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  severityConfig.accent,
                )}
              />

              {badgeText ||
                severityConfig.label}
            </span>

            {showAiBadge ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-100 px-2 py-0.5 text-[9px] font-bold text-violet-700 dark:border-violet-900 dark:bg-violet-900/30 dark:text-violet-400">
                <Sparkles className="size-2.5" />
                {aiText}
              </span>
            ) : null}

            {showPriority ? (
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[9px] font-bold",
                  priorityConfig.className,
                )}
              >
                {priorityConfig.label}
              </span>
            ) : null}
          </div>

          {/* =================================================
              TITLE + DISMISS
          ================================================= */}

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3
                className={cn(
                  "font-bold leading-5 text-foreground",
                  compact
                    ? "text-sm"
                    : "text-sm sm:text-[15px]",
                )}
              >
                {title}
              </h3>

              <p
                className={cn(
                  "mt-1.5 leading-5 text-muted-foreground",
                  compact
                    ? "text-xs"
                    : "text-sm",
                  !expanded &&
                    "line-clamp-3",
                )}
              >
                {detail}
              </p>

              {/* Read more */}
              {detail.length > 160 ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setExpanded(!expanded);
                  }}
                  className="mt-1 text-[11px] font-semibold text-primary hover:underline"
                >
                  {expanded
                    ? "Show less"
                    : "Read more"}
                </button>
              ) : null}
            </div>

            {dismissible ? (
              <button
                type="button"
                aria-label="Dismiss alert"
                onClick={(event) => {
                  event.stopPropagation();
                  handleDismiss();
                }}
                className="grid size-7 shrink-0 place-items-center rounded-lg text-muted-foreground transition-all hover:bg-background/80 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>

          {/* =================================================
              LOCATION / META / TIME
          ================================================= */}

          {(location ||
            meta ||
            timestamp) && (
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              {location ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                  <MapPin className="size-3 text-primary" />
                  {location}
                </span>
              ) : null}

              {meta ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <CircleAlert className="size-3" />
                  {meta}
                </span>
              ) : null}

              {timestamp ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Clock3 className="size-3" />
                  {timestamp}
                </span>
              ) : null}
            </div>
          )}

          {/* =================================================
              PROGRESS BAR
          ================================================= */}

          {showProgress ? (
            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-muted-foreground">
                  Resolution progress
                </span>

                <span className="text-[10px] font-bold text-foreground">
                  {Math.max(
                    0,
                    Math.min(100, progress),
                  )}
                  %
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-background/70">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    severityConfig.accent,
                  )}
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(100, progress),
                    )}%`,
                  }}
                />
              </div>
            </div>
          ) : null}

          {/* =================================================
              STATUS
          ================================================= */}

          {showStatus ? (
            <div className="mt-3 flex items-center gap-2">
              <span className="relative flex size-2">
                <span
                  className={cn(
                    "absolute inline-flex size-full animate-ping rounded-full opacity-60",
                    severityConfig.accent,
                  )}
                />

                <span
                  className={cn(
                    "relative inline-flex size-2 rounded-full",
                    severityConfig.accent,
                  )}
                />
              </span>

              <span className="text-[11px] font-semibold text-muted-foreground">
                {statusText ||
                  "Monitoring active"}
              </span>
            </div>
          ) : null}

          {/* =================================================
              ACTIONS
          ================================================= */}

          {(action ||
            showArrow ||
            !read) && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {action}

                {!read ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleRead();
                    }}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5",
                      "text-[11px] font-semibold",
                      "transition-all hover:shadow-sm",
                      severityConfig.button,
                    )}
                  >
                    <Check className="size-3.5" />
                    Mark as read
                  </button>
                ) : null}
              </div>

              {showArrow ? (
                <span className="inline-flex size-8 items-center justify-center rounded-lg bg-background/60 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:text-foreground">
                  <ChevronRight className="size-4" />
                </span>
              ) : null}
            </div>
          )}

          {/* =================================================
              FOOTER
          ================================================= */}

          {showFooter && footer ? (
            <div className="mt-4 border-t border-border/50 pt-3">
              {footer}
            </div>
          ) : null}
        </div>
      </div>

      {/* =====================================================
          CRITICAL ALERT STRIP
      ===================================================== */}

      {severity === "critical" ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px overflow-hidden">
          <div className="h-full w-full bg-gradient-to-r from-transparent via-rose-500/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </div>
      ) : null}
    </article>
  );
}

/* =========================================================
   PRE-BUILT AGRICULTURE ALERTS
   Optional helper components — still SAME FILE
========================================================= */

export function WeatherAlertCard(
  props: Omit<
    AlertCardProps,
    "severity" | "category"
  >,
) {
  return (
    <AlertCard
      {...props}
      severity="warning"
      category="Weather Advisory"
      icon={<AlertCircle className="size-5" />}
    />
  );
}

export function CropAlertCard(
  props: Omit<
    AlertCardProps,
    "severity" | "category"
  >,
) {
  return (
    <AlertCard
      {...props}
      severity="critical"
      category="Crop Protection"
      icon={
        <ShieldAlert className="size-5" />
      }
      pulse
    />
  );
}

export function IrrigationAlertCard(
  props: Omit<
    AlertCardProps,
    "severity" | "category"
  >,
) {
  return (
    <AlertCard
      {...props}
      severity="info"
      category="Irrigation"
      icon={
        <Zap className="size-5" />
      }
    />
  );
}

export function SuccessAlertCard(
  props: Omit<
    AlertCardProps,
    "severity" | "category"
  >,
) {
  return (
    <AlertCard
      {...props}
      severity="success"
      category="Farm Performance"
      icon={
        <CheckCircle2 className="size-5" />
      }
    />
  );
}

/* =========================================================
   EXAMPLE DATA / FACTORY
   Useful if you want to build an alert center
========================================================= */

export interface AgricultureAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  detail: string;
  category?: string;
  location?: string;
  meta?: string;
  timestamp?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  read?: boolean;
}

export function AgricultureAlertItem({
  alert,
  onDismiss,
  onRead,
}: {
  alert: AgricultureAlert;
  onDismiss?: (
    id: string,
  ) => void;
  onRead?: (
    id: string,
  ) => void;
}) {
  return (
    <AlertCard
      severity={alert.severity}
      title={alert.title}
      detail={alert.detail}
      category={alert.category}
      location={alert.location}
      meta={alert.meta}
      timestamp={alert.timestamp}
      priority={alert.priority}
      showPriority
      dismissible
      showArrow
      read={alert.read}
      onDismiss={() =>
        onDismiss?.(alert.id)
      }
      onRead={() =>
        onRead?.(alert.id)
      }
    />
  );
}

/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default AlertCard;