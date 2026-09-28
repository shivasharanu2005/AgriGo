import {
  BarChart3,
  CheckCircle2,
  CloudSun,
  Droplets,
  Leaf,
  Loader2,
  Sprout,
  Tractor,
  TrendingUp,
  Wheat,
} from "lucide-react";
import React, { useEffect, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/* =========================================================
   TYPES
========================================================= */

export type LoadingVariant =
  | "default"
  | "cards"
  | "dashboard"
  | "table"
  | "list"
  | "chart"
  | "profile"
  | "farm"
  | "compact"
  | "hero"
  | "analytics"
  | "weather"
  | "irrigation";

export type LoadingSize = "sm" | "md" | "lg";

interface LoadingStateProps {
  /* Existing API */
  rows?: number;
  label?: string;
  className?: string;

  /* Extended API */
  variant?: LoadingVariant;
  size?: LoadingSize;

  title?: string;
  description?: string;

  showSpinner?: boolean;
  showProgress?: boolean;
  progress?: number;

  progressLabel?: string;

  animated?: boolean;
  shimmer?: boolean;

  showHeader?: boolean;
  showFooter?: boolean;

  cardCount?: number;
  columns?: number;

  showIcon?: boolean;
  icon?: React.ElementType;

  compact?: boolean;

  minHeight?: string;
  fullHeight?: boolean;

  statusText?: string;

  children?: React.ReactNode;
}

/* =========================================================
   CONFIG
========================================================= */

const SIZE_CONFIG = {
  sm: {
    gap: "space-y-2",
    cardPadding: "p-3",
    title: "h-3",
    value: "h-5",
    description: "h-2.5",
    icon: "size-8",
  },

  md: {
    gap: "space-y-3",
    cardPadding: "p-5",
    title: "h-4",
    value: "h-7",
    description: "h-3",
    icon: "size-10",
  },

  lg: {
    gap: "space-y-4",
    cardPadding: "p-6",
    title: "h-5",
    value: "h-9",
    description: "h-3.5",
    icon: "size-12",
  },
} as const;

/* =========================================================
   SHIMMER
========================================================= */

function Shimmer({
  className,
  enabled = true,
  style,
}: {
  className?: string;
  enabled?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <Skeleton
      className={cn(
        "relative overflow-hidden",
        enabled &&
          "after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.8s_infinite] after:bg-gradient-to-r after:from-transparent after:via-white/30 after:to-transparent",
        className,
      )}
    />
  );
}

/* =========================================================
   LOADING SPINNER
========================================================= */

function LoadingSpinner({
  size = "md",
}: {
  size?: LoadingSize;
}) {
  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-primary/10 text-primary",
        SIZE_CONFIG[size].icon,
      )}
    >
      <Loader2
        className={cn(
          size === "sm" && "size-4",
          size === "md" && "size-5",
          size === "lg" && "size-6",
          "animate-spin",
        )}
      />
    </div>
  );
}

/* =========================================================
   LOADING HEADER
========================================================= */

function LoadingHeader({
  title,
  description,
  showSpinner,
  size,
}: {
  title: string;
  description?: string;
  showSpinner: boolean;
  size: LoadingSize;
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      {showSpinner ? <LoadingSpinner size={size} /> : null}

      <div className="min-w-0 flex-1">
        <div
          className={cn(
            "mb-2 w-48 rounded-md bg-muted",
            SIZE_CONFIG[size].title,
          )}
        />

        {description ? (
          <div className="h-3 w-72 max-w-full rounded bg-muted/70" />
        ) : null}

        <span className="sr-only">
          {title}
          {description ? `: ${description}` : ""}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   BASIC SKELETON ROW
========================================================= */

function BasicSkeletonRow({
  shimmer,
  size,
}: {
  shimmer: boolean;
  size: LoadingSize;
}) {
  const config = SIZE_CONFIG[size];

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card shadow-sm",
        config.cardPadding,
      )}
    >
      <Shimmer
        enabled={shimmer}
        className={cn("w-1/3", config.title)}
      />

      <Shimmer
        enabled={shimmer}
        className={cn("mt-3 w-1/2", config.value)}
      />

      <Shimmer
        enabled={shimmer}
        className={cn("mt-3 w-2/3", config.description)}
      />

      <div className="mt-4 flex gap-2">
        <Shimmer
          enabled={shimmer}
          className="h-2.5 w-20"
        />
        <Shimmer
          enabled={shimmer}
          className="h-2.5 w-14"
        />
      </div>
    </div>
  );
}

/* =========================================================
   STAT CARD SKELETON
========================================================= */

function StatSkeletonCard({
  shimmer,
  size,
  icon: Icon = Sprout,
}: {
  shimmer: boolean;
  size: LoadingSize;
  icon?: React.ElementType;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card shadow-sm",
        SIZE_CONFIG[size].cardPadding,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Shimmer
            enabled={shimmer}
            className="h-3 w-24"
          />

          <Shimmer
            enabled={shimmer}
            className={cn(
              "mt-3 w-28",
              size === "lg" ? "h-9" : "h-7",
            )}
          />

          <Shimmer
            enabled={shimmer}
            className="mt-3 h-2.5 w-32"
          />
        </div>

        <div className="grid size-10 place-items-center rounded-xl bg-primary/10">
          <Icon className="size-5 text-primary/40" />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2">
        <Shimmer
          enabled={shimmer}
          className="h-2.5 w-14"
        />

        <Shimmer
          enabled={shimmer}
          className="h-2.5 w-20"
        />
      </div>
    </div>
  );
}

/* =========================================================
   DASHBOARD SKELETON
========================================================= */

function DashboardSkeleton({
  shimmer,
  size,
  cardCount,
}: {
  shimmer: boolean;
  size: LoadingSize;
  cardCount: number;
}) {
  const icons = [
    Sprout,
    Droplets,
    Wheat,
    TrendingUp,
    Tractor,
    Leaf,
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Shimmer
              enabled={shimmer}
              className="h-5 w-44"
            />

            <Shimmer
              enabled={shimmer}
              className="mt-3 h-3 w-72 max-w-full"
            />
          </div>

          <Shimmer
            enabled={shimmer}
            className="h-9 w-28 rounded-lg"
          />
        </div>
      </div>

      <div
        className={cn(
          "grid gap-4",
          cardCount <= 2 && "grid-cols-1 sm:grid-cols-2",
          cardCount === 3 &&
            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
          cardCount >= 4 &&
            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        )}
      >
        {Array.from({
          length: Math.max(1, Math.min(cardCount, 8)),
        }).map((_, index) => (
          <StatSkeletonCard
            key={index}
            shimmer={shimmer}
            size={size}
            icon={icons[index % icons.length]}
          />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <Shimmer
            enabled={shimmer}
            className="h-4 w-36"
          />

          <Shimmer
            enabled={shimmer}
            className="mt-2 h-3 w-56"
          />

          <ChartSkeleton shimmer={shimmer} />
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <Shimmer
            enabled={shimmer}
            className="h-4 w-32"
          />

          <div className="mt-5 space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3"
              >
                <Shimmer
                  enabled={shimmer}
                  className="size-9 rounded-lg"
                />

                <div className="flex-1">
                  <Shimmer
                    enabled={shimmer}
                    className="h-3 w-24"
                  />

                  <Shimmer
                    enabled={shimmer}
                    className="mt-2 h-2.5 w-32"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   CARD SKELETON
========================================================= */

function CardsSkeleton({
  shimmer,
  size,
  cardCount,
  columns,
}: {
  shimmer: boolean;
  size: LoadingSize;
  cardCount: number;
  columns: number;
}) {
  const grid =
    columns === 1
      ? "grid-cols-1"
      : columns === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : columns === 3
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div className={cn("grid gap-4", grid)}>
      {Array.from({
        length: Math.max(1, Math.min(cardCount, 12)),
      }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-border bg-card p-4 shadow-sm"
        >
          <Shimmer
            enabled={shimmer}
            className="aspect-[16/9] w-full rounded-xl"
          />

          <Shimmer
            enabled={shimmer}
            className="mt-4 h-4 w-3/4"
          />

          <Shimmer
            enabled={shimmer}
            className="mt-2 h-3 w-full"
          />

          <Shimmer
            enabled={shimmer}
            className="mt-2 h-3 w-2/3"
          />

          <div className="mt-4 flex justify-between">
            <Shimmer
              enabled={shimmer}
              className="h-8 w-20 rounded-lg"
            />

            <Shimmer
              enabled={shimmer}
              className="h-8 w-16 rounded-lg"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   TABLE SKELETON
========================================================= */

function TableSkeleton({
  shimmer,
  rows,
}: {
  shimmer: boolean;
  rows: number;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="border-b border-border bg-muted/30 px-5 py-4">
        <div className="grid grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <Shimmer
              key={item}
              enabled={shimmer}
              className="h-3 w-20"
            />
          ))}
        </div>
      </div>

      <div className="divide-y divide-border">
        {Array.from({
          length: Math.max(1, Math.min(rows, 15)),
        }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid grid-cols-5 gap-4 px-5 py-4"
          >
            {[1, 2, 3, 4, 5].map((item) => (
              <Shimmer
                key={item}
                enabled={shimmer}
                className={cn(
                  "h-3",
                  item === 1 ? "w-32" : "w-20",
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   LIST SKELETON
========================================================= */

function ListSkeleton({
  shimmer,
  rows,
}: {
  shimmer: boolean;
  rows: number;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="divide-y divide-border">
        {Array.from({
          length: Math.max(1, Math.min(rows, 15)),
        }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-4"
          >
            <Shimmer
              enabled={shimmer}
              className="size-11 shrink-0 rounded-xl"
            />

            <div className="min-w-0 flex-1">
              <Shimmer
                enabled={shimmer}
                className="h-3.5 w-32"
              />

              <Shimmer
                enabled={shimmer}
                className="mt-2 h-2.5 w-52 max-w-full"
              />
            </div>

            <Shimmer
              enabled={shimmer}
              className="hidden h-8 w-20 rounded-lg sm:block"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   CHART SKELETON
========================================================= */

function ChartSkeleton({
  shimmer,
}: {
  shimmer: boolean;
}) {
  const bars = [45, 65, 35, 78, 55, 85, 60, 72, 48, 92];

  return (
    <div className="mt-6">
      <div className="flex h-56 items-end justify-between gap-2 border-b border-border px-2">
        {bars.map((height, index) => (
          <Shimmer
            key={index}
            enabled={shimmer}
            className="w-full max-w-8 rounded-t-md"
            style={{
              height: `${height}%`,
            }}
          />
        ))}
      </div>

      <div className="mt-3 flex justify-between">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <Shimmer
            key={item}
            enabled={shimmer}
            className="h-2 w-8"
          />
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   PROFILE SKELETON
========================================================= */

function ProfileSkeleton({
  shimmer,
}: {
  shimmer: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <Shimmer
          enabled={shimmer}
          className="size-20 shrink-0 rounded-full"
        />

        <div className="w-full flex-1">
          <Shimmer
            enabled={shimmer}
            className="h-5 w-40"
          />

          <Shimmer
            enabled={shimmer}
            className="mt-3 h-3 w-64 max-w-full"
          />

          <div className="mt-4 flex flex-wrap gap-2">
            <Shimmer
              enabled={shimmer}
              className="h-7 w-20 rounded-full"
            />

            <Shimmer
              enabled={shimmer}
              className="h-7 w-24 rounded-full"
            />

            <Shimmer
              enabled={shimmer}
              className="h-7 w-20 rounded-full"
            />
          </div>
        </div>

        <Shimmer
          enabled={shimmer}
          className="h-9 w-24 rounded-lg"
        />
      </div>

      <div className="mt-7 grid gap-4 border-t border-border pt-6 sm:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item}>
            <Shimmer
              enabled={shimmer}
              className="h-2.5 w-20"
            />

            <Shimmer
              enabled={shimmer}
              className="mt-2 h-4 w-28"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   FARM SKELETON
========================================================= */

function FarmSkeleton({
  shimmer,
}: {
  shimmer: boolean;
}) {
  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6">
        <div className="relative z-10">
          <Shimmer
            enabled={shimmer}
            className="h-6 w-48"
          />

          <Shimmer
            enabled={shimmer}
            className="mt-3 h-3 w-72 max-w-full"
          />

          <div className="mt-6 flex flex-wrap gap-3">
            <Shimmer
              enabled={shimmer}
              className="h-10 w-28 rounded-xl"
            />

            <Shimmer
              enabled={shimmer}
              className="h-10 w-28 rounded-xl"
            />
          </div>
        </div>

        <Sprout className="absolute -bottom-4 -right-4 size-32 text-primary/[0.04]" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatSkeletonCard
          shimmer={shimmer}
          size="md"
          icon={Wheat}
        />

        <StatSkeletonCard
          shimmer={shimmer}
          size="md"
          icon={Droplets}
        />

        <StatSkeletonCard
          shimmer={shimmer}
          size="md"
          icon={Tractor}
        />

        <StatSkeletonCard
          shimmer={shimmer}
          size="md"
          icon={TrendingUp}
        />
      </div>
    </div>
  );
}

/* =========================================================
   WEATHER SKELETON
========================================================= */

function WeatherSkeleton({
  shimmer,
}: {
  shimmer: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Shimmer
            enabled={shimmer}
            className="h-4 w-28"
          />

          <Shimmer
            enabled={shimmer}
            className="mt-2 h-3 w-40"
          />
        </div>

        <div className="grid size-12 place-items-center rounded-xl bg-primary/10">
          <CloudSun className="size-6 text-primary/30" />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-5">
        <Shimmer
          enabled={shimmer}
          className="h-14 w-28"
        />

        <div>
          <Shimmer
            enabled={shimmer}
            className="h-3 w-20"
          />

          <Shimmer
            enabled={shimmer}
            className="mt-2 h-3 w-28"
          />
        </div>
      </div>

      <div className="mt-7 grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="rounded-xl bg-muted/40 p-3"
          >
            <Shimmer
              enabled={shimmer}
              className="mx-auto size-6 rounded-full"
            />

            <Shimmer
              enabled={shimmer}
              className="mx-auto mt-2 h-2.5 w-10"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   IRRIGATION SKELETON
========================================================= */

function IrrigationSkeleton({
  shimmer,
}: {
  shimmer: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-xl bg-sky-100">
            <Droplets className="size-5 text-sky-500/50" />
          </div>

          <div>
            <Shimmer
              enabled={shimmer}
              className="h-4 w-32"
            />

            <Shimmer
              enabled={shimmer}
              className="mt-2 h-2.5 w-48"
            />
          </div>
        </div>

        <div className="mt-6">
          <Shimmer
            enabled={shimmer}
            className="h-3 w-full rounded-full"
          />

          <div className="mt-2 flex justify-between">
            <Shimmer
              enabled={shimmer}
              className="h-2.5 w-16"
            />

            <Shimmer
              enabled={shimmer}
              className="h-2.5 w-16"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="rounded-xl border border-border bg-card p-4"
          >
            <Shimmer
              enabled={shimmer}
              className="h-3 w-20"
            />

            <Shimmer
              enabled={shimmer}
              className="mt-3 h-6 w-24"
            />

            <Shimmer
              enabled={shimmer}
              className="mt-2 h-2.5 w-28"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   ANALYTICS SKELETON
========================================================= */

function AnalyticsSkeleton({
  shimmer,
}: {
  shimmer: boolean;
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <StatSkeletonCard
            key={item}
            shimmer={shimmer}
            size="md"
            icon={BarChart3}
          />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <Shimmer
              enabled={shimmer}
              className="h-4 w-36"
            />

            <Shimmer
              enabled={shimmer}
              className="mt-2 h-3 w-52"
            />

            <ChartSkeleton shimmer={shimmer} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   COMPACT SKELETON
========================================================= */

function CompactSkeleton({
  shimmer,
}: {
  shimmer: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      <Shimmer
        enabled={shimmer}
        className="size-9 shrink-0 rounded-lg"
      />

      <div className="min-w-0 flex-1">
        <Shimmer
          enabled={shimmer}
          className="h-3 w-28"
        />

        <Shimmer
          enabled={shimmer}
          className="mt-2 h-2.5 w-40 max-w-full"
        />
      </div>

      <Shimmer
        enabled={shimmer}
        className="h-7 w-14 rounded-lg"
      />
    </div>
  );
}

/* =========================================================
   HERO SKELETON
========================================================= */

function HeroSkeleton({
  shimmer,
}: {
  shimmer: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-7 sm:p-10">
      <div className="relative z-10 max-w-2xl">
        <Shimmer
          enabled={shimmer}
          className="h-4 w-28 rounded-full"
        />

        <Shimmer
          enabled={shimmer}
          className="mt-5 h-9 w-3/4 max-w-lg"
        />

        <Shimmer
          enabled={shimmer}
          className="mt-4 h-4 w-full max-w-xl"
        />

        <Shimmer
          enabled={shimmer}
          className="mt-2 h-4 w-2/3 max-w-lg"
        />

        <div className="mt-7 flex flex-wrap gap-3">
          <Shimmer
            enabled={shimmer}
            className="h-11 w-32 rounded-xl"
          />

          <Shimmer
            enabled={shimmer}
            className="h-11 w-28 rounded-xl"
          />
        </div>
      </div>

      <Sprout className="absolute -bottom-10 -right-5 size-52 text-primary/[0.045]" />
      <Leaf className="absolute right-24 top-8 size-16 rotate-12 text-primary/[0.05]" />
    </div>
  );
}

/* =========================================================
   PROGRESS
========================================================= */

function LoadingProgress({
  progress,
  label,
}: {
  progress: number;
  label: string;
}) {
  const safeProgress = Math.max(
    0,
    Math.min(100, progress),
  );

  return (
    <div className="mt-5 w-full max-w-md">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>

        <span className="text-xs font-bold text-foreground">
          {safeProgress}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
          style={{
            width: `${safeProgress}%`,
          }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export function LoadingState({
  rows = 3,
  label = "Loading your farm data…",
  className,

  variant = "default",
  size = "md",

  title = label,
  description,

  showSpinner = true,
  showProgress = false,
  progress = 0,

  progressLabel = "Loading progress",

  animated = true,
  shimmer = true,

  showHeader = false,
  showFooter = false,

  cardCount = 4,
  columns = 3,

  icon: CustomIcon,

  compact = false,

  minHeight,
  fullHeight = false,

  statusText,

  children,
}: LoadingStateProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setMounted(true),
      20,
    );

    return () => window.clearTimeout(timer);
  }, []);

  const customIcon =
    CustomIcon ??
    (variant === "farm"
      ? Tractor
      : variant === "weather"
        ? CloudSun
        : variant === "irrigation"
          ? Droplets
          : Sprout);

  const renderVariant = () => {
    switch (variant) {
      case "cards":
        return (
          <CardsSkeleton
            shimmer={shimmer}
            size={size}
            cardCount={cardCount}
            columns={columns}
          />
        );

      case "dashboard":
        return (
          <DashboardSkeleton
            shimmer={shimmer}
            size={size}
            cardCount={cardCount}
          />
        );

      case "table":
        return (
          <TableSkeleton
            shimmer={shimmer}
            rows={rows}
          />
        );

      case "list":
        return (
          <ListSkeleton
            shimmer={shimmer}
            rows={rows}
          />
        );

      case "chart":
        return (
          <div className="rounded-2xl border border-border bg-card p-5">
            <LoadingHeader
              title={title}
              description={description}
              showSpinner={showSpinner}
              size={size}
            />

            <ChartSkeleton shimmer={shimmer} />
          </div>
        );

      case "profile":
        return (
          <ProfileSkeleton
            shimmer={shimmer}
          />
        );

      case "farm":
        return (
          <FarmSkeleton
            shimmer={shimmer}
          />
        );

      case "compact":
        return (
          <div className="space-y-2">
            {Array.from({
              length: Math.max(1, rows),
            }).map((_, index) => (
              <CompactSkeleton
                key={index}
                shimmer={shimmer}
              />
            ))}
          </div>
        );

      case "hero":
        return (
          <HeroSkeleton
            shimmer={shimmer}
          />
        );

      case "analytics":
        return (
          <AnalyticsSkeleton
            shimmer={shimmer}
          />
        );

      case "weather":
        return (
          <WeatherSkeleton
            shimmer={shimmer}
          />
        );

      case "irrigation":
        return (
          <IrrigationSkeleton
            shimmer={shimmer}
          />
        );

      default:
        return (
          <div className={cn(SIZE_CONFIG[size].gap)}>
            {Array.from({
              length: Math.max(1, rows),
            }).map((_, index) => (
              <BasicSkeletonRow
                key={index}
                shimmer={shimmer}
                size={size}
              />
            ))}
          </div>
        );
    }
  };

  return (
    <div
      className={cn(
        "w-full",
        animated &&
          mounted &&
          "animate-in fade-in duration-500",
        !mounted && animated && "opacity-0",
        fullHeight && "flex min-h-[60vh] items-center",
        compact && "max-w-md",
        className,
      )}
      style={
        minHeight
          ? {
              minHeight,
            }
          : undefined
      }
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">
        {label}
      </span>

      {showHeader &&
      variant !== "chart" &&
      variant !== "farm" &&
      variant !== "hero" &&
      variant !== "profile" ? (
        <LoadingHeader
          title={title}
          description={description}
          showSpinner={showSpinner}
          size={size}
        />
      ) : null}

      {statusText ? (
        <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/50" />
            <span className="relative size-2 rounded-full bg-primary" />
          </span>

          {statusText}
        </div>
      ) : null}

      {children ? (
        children
      ) : (
        renderVariant()
      )}

      {showProgress ? (
        <LoadingProgress
          progress={progress}
          label={progressLabel}
        />
      ) : null}

      {showFooter ? (
        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" />
          <span>{label}</span>
        </div>
      ) : null}

      {/* Decorative loading indicator */}
      {variant === "farm" ? (
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          {React.createElement(customIcon, { className: "size-3.5" })}
          Preparing farm intelligence…
        </div>
      ) : null}
    </div>
  );
}

/* =========================================================
   SPECIALIZED COMPONENTS
========================================================= */

export function FarmLoadingState(
  props: Omit<
    LoadingStateProps,
    "variant"
  >,
) {
  return (
    <LoadingState
      {...props}
      variant="farm"
      label={
        props.label ??
        "Loading your farm information…"
      }
    />
  );
}

export function DashboardLoadingState(
  props: Omit<
    LoadingStateProps,
    "variant"
  >,
) {
  return (
    <LoadingState
      {...props}
      variant="dashboard"
      label={
        props.label ??
        "Preparing your agriculture dashboard…"
      }
    />
  );
}

export function TableLoadingState(
  props: Omit<
    LoadingStateProps,
    "variant"
  >,
) {
  return (
    <LoadingState
      {...props}
      variant="table"
      label={
        props.label ??
        "Loading records…"
      }
    />
  );
}

export function ChartLoadingState(
  props: Omit<
    LoadingStateProps,
    "variant"
  >,
) {
  return (
    <LoadingState
      {...props}
      variant="chart"
      label={
        props.label ??
        "Loading analytics…"
      }
    />
  );
}

export function WeatherLoadingState(
  props: Omit<
    LoadingStateProps,
    "variant"
  >,
) {
  return (
    <LoadingState
      {...props}
      variant="weather"
      label={
        props.label ??
        "Loading weather information…"
      }
    />
  );
}

export function IrrigationLoadingState(
  props: Omit<
    LoadingStateProps,
    "variant"
  >,
) {
  return (
    <LoadingState
      {...props}
      variant="irrigation"
      label={
        props.label ??
        "Loading irrigation data…"
      }
    />
  );
}

export function AnalyticsLoadingState(
  props: Omit<
    LoadingStateProps,
    "variant"
  >,
) {
  return (
    <LoadingState
      {...props}
      variant="analytics"
      label={
        props.label ??
        "Loading farm analytics…"
      }
    />
  );
}

export function CardsLoadingState(
  props: Omit<
    LoadingStateProps,
    "variant"
  >,
) {
  return (
    <LoadingState
      {...props}
      variant="cards"
      label={
        props.label ??
        "Loading farm cards…"
      }
    />
  );
}

export function ListLoadingState(
  props: Omit<
    LoadingStateProps,
    "variant"
  >,
) {
  return (
    <LoadingState
      {...props}
      variant="list"
      label={
        props.label ??
        "Loading list…"
      }
    />
  );
}

/* =========================================================
   PRESET LOADING COMPONENTS
========================================================= */

export function FarmOverviewLoading() {
  return (
    <LoadingState
      variant="farm"
      size="md"
      showFooter
      statusText="Syncing farm information"
    />
  );
}

export function FarmAnalyticsLoading() {
  return (
    <LoadingState
      variant="analytics"
      size="md"
      showFooter
      statusText="Calculating farm analytics"
    />
  );
}

export function FarmWeatherLoading() {
  return (
    <LoadingState
      variant="weather"
      size="md"
      showFooter
      statusText="Fetching latest weather"
    />
  );
}

export function FarmIrrigationLoading() {
  return (
    <LoadingState
      variant="irrigation"
      size="md"
      showFooter
      statusText="Analyzing irrigation requirements"
    />
  );
}

/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default LoadingState;