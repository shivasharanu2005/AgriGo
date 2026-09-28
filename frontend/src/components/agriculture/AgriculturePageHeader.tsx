import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CloudSun,
  Leaf,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface AgriculturePageHeaderProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  className?: string;
  badgeText?: string;
  lastUpdated?: string;

  /* Optional advanced properties */
  eyebrow?: string;
  breadcrumb?: string;
  showStatus?: boolean;
  statusText?: string;
  showWeather?: boolean;
  temperature?: string;
  location?: string;
  showRefresh?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  showDate?: boolean;
  dateText?: string;
  variant?: "default" | "hero" | "compact";
}

export function AgriculturePageHeader({
  title,
  description,
  icon: Icon,
  actions,
  className,
  badgeText,
  lastUpdated,

  eyebrow = "AGRICULTURE MANAGEMENT",
  breadcrumb,
  showStatus = false,
  statusText = "System Operational",
  showWeather = false,
  temperature = "28°C",
  location = "Your Farm",
  showRefresh = false,
  onRefresh,
  isRefreshing = false,
  showDate = false,
  dateText,
  variant = "default",
}: AgriculturePageHeaderProps) {
  const [isHovering, setIsHovering] = useState(false);

  const today =
    dateText ||
    new Date().toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  if (variant === "compact") {
    return (
      <header
        className={cn(
          "mb-6 flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between",
          className,
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          {Icon ? (
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Icon className="size-5" aria-hidden />
            </span>
          ) : null}

          <div className="min-w-0">
            {breadcrumb ? (
              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {breadcrumb}
              </p>
            ) : null}

            <h1 className="truncate text-xl font-bold tracking-tight text-foreground">
              {title}
            </h1>

            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
              {description}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {badgeText ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {badgeText}
            </span>
          ) : null}

          {actions}
        </div>
      </header>
    );
  }

  return (
    <header
      className={cn(
        "relative mb-8 overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm",
        variant === "hero" &&
          "bg-gradient-to-br from-primary/[0.08] via-card to-emerald-500/[0.06]",
        className,
      )}
    >
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 -top-24 size-64 rounded-full bg-primary/[0.06] blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 size-72 rounded-full bg-emerald-400/[0.05] blur-3xl" />

        <div className="absolute right-8 top-8 hidden opacity-[0.035] lg:block">
          <Leaf className="size-40 rotate-12" />
        </div>
      </div>

      <div className="relative p-5 sm:p-6 lg:p-7">
        {/* Top information bar */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {breadcrumb ? (
              <>
                <span className="text-xs font-medium text-muted-foreground">
                  {breadcrumb}
                </span>
                <span className="text-muted-foreground/50">/</span>
              </>
            ) : null}

            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
              <Sparkles className="size-3" />
              {eyebrow}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {showStatus ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-400">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                {statusText}
              </span>
            ) : null}

            {lastUpdated ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/70 px-3 py-1.5 text-[11px] font-medium text-muted-foreground">
                <Clock3 className="size-3" />
                Updated {lastUpdated}
              </span>
            ) : null}

            {showDate ? (
              <span className="hidden items-center gap-1.5 rounded-full bg-muted/70 px-3 py-1.5 text-[11px] font-medium text-muted-foreground sm:inline-flex">
                <CalendarDays className="size-3" />
                {today}
              </span>
            ) : null}
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex min-w-0 items-start gap-4 sm:gap-5">
            {/* Icon */}
            {Icon ? (
              <div
                className="relative shrink-0"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <div
                  className={cn(
                    "grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 sm:size-16",
                    isHovering && "scale-105 rotate-1 shadow-xl shadow-primary/30",
                  )}
                >
                  <Icon className="size-7 sm:size-8" aria-hidden />
                </div>

                {/* Small live indicator */}
                <span className="absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full border-2 border-card bg-emerald-500 text-white shadow-sm">
                  <CheckCircle2 className="size-3" />
                </span>
              </div>
            ) : null}

            {/* Heading */}
            <div className="min-w-0 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-[34px]">
                  {title}
                </h1>

                {badgeText ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    {badgeText}
                  </span>
                ) : null}
              </div>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
                {description}
              </p>

              {/* Mini metadata */}
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                {showStatus ? (
                  <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                    <Activity className="size-3.5 text-emerald-500" />
                    <span>
                      Monitoring{" "}
                      <strong className="font-semibold text-foreground">
                        live farm data
                      </strong>
                    </span>
                  </div>
                ) : null}

                {showWeather ? (
                  <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                    <CloudSun className="size-4 text-sky-500" />
                    <span>
                      {location}{" "}
                      <strong className="font-semibold text-foreground">
                        {temperature}
                      </strong>
                    </span>
                  </div>
                ) : null}

                {lastUpdated ? (
                  <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock3 className="size-3.5" />
                    <span>
                      Last sync{" "}
                      <strong className="font-semibold text-foreground">
                        {lastUpdated}
                      </strong>
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 flex-wrap items-center gap-2 xl:pt-1">
            {showRefresh ? (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                title="Refresh data"
                className={cn(
                  "inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground shadow-sm transition-all",
                  "hover:border-primary/30 hover:bg-primary/[0.04] hover:text-primary",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                )}
              >
                <RefreshCw
                  className={cn(
                    "size-4",
                    isRefreshing && "animate-spin",
                  )}
                />
                <span className="hidden sm:inline">
                  {isRefreshing ? "Refreshing..." : "Refresh"}
                </span>
              </button>
            ) : null}

            {actions}
          </div>
        </div>

        {/* Bottom information strip */}
        {(showWeather || showDate || lastUpdated) && (
          <div className="mt-6 flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              {showWeather ? (
                <div className="flex items-center gap-2 rounded-xl bg-sky-500/[0.07] px-3 py-2">
                  <div className="grid size-7 place-items-center rounded-lg bg-sky-500/10">
                    <CloudSun className="size-4 text-sky-500" />
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Farm Weather
                    </p>
                    <p className="text-xs font-bold text-foreground">
                      {temperature} · {location}
                    </p>
                  </div>
                </div>
              ) : null}

              {showDate ? (
                <div className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2">
                  <div className="grid size-7 place-items-center rounded-lg bg-background">
                    <CalendarDays className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Today
                    </p>
                    <p className="text-xs font-bold text-foreground">
                      {today}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Data synchronized with agriculture platform
            </div>
          </div>
        )}
      </div>
    </header>
  );
}