import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Info,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
  Wheat,
} from "lucide-react";
import React, { type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Trend } from "@/services/agricultureApi";

/* =========================================================
   TYPES
========================================================= */

export type StatCardVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "premium"
  | "gradient"
  | "minimal";

export type StatCardSize = "sm" | "md" | "lg";

export type StatCardTrend = Trend | "neutral";

export interface StatCardProps {
  /* Existing props */
  label?: string;
  title?: string;
  value: string | number;
  unit?: string;
  status?: string;
  change?: number;
  hint?: string;
  icon?: ReactNode | ElementType;
  trend?: Trend;
  trendLabel?: string;
  className?: string;

  /* Extended props */
  variant?: StatCardVariant;
  size?: StatCardSize;

  description?: string;
  eyebrow?: string;

  iconBg?: string;
  iconClassName?: string;

  valuePrefix?: string;
  valueSuffix?: string;

  previousValue?: string | number;

  target?: number;
  progress?: number;
  progressLabel?: string;

  badge?: string;
  badgeIcon?: LucideIcon;

  footer?: ReactNode;
  action?: ReactNode;

  onClick?: () => void;

  loading?: boolean;
  animated?: boolean;
  hoverable?: boolean;

  showTrend?: boolean;
  showChange?: boolean;

  showTarget?: boolean;
  showProgress?: boolean;

  showSparkline?: boolean;
  sparklineData?: number[];

  tooltip?: string;

  highlight?: boolean;
  compact?: boolean;

  live?: boolean;
  liveLabel?: string;

  children?: ReactNode;
}

/* =========================================================
   CONFIG
========================================================= */

const TREND_ICONS = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  flat: ArrowRight,
} as const;

const VARIANT_CONFIG: Record<
  StatCardVariant,
  {
    wrapper: string;
    iconWrapper: string;
    iconText: string;
    accent: string;
    progress: string;
    badge: string;
  }
> = {
  default: {
    wrapper: "border-border bg-card",
    iconWrapper: "bg-accent",
    iconText: "text-accent-foreground",
    accent: "bg-primary",
    progress: "bg-primary",
    badge: "bg-muted text-muted-foreground",
  },

  success: {
    wrapper: "border-emerald-200 bg-emerald-50/50",
    iconWrapper: "bg-emerald-100",
    iconText: "text-emerald-600",
    accent: "bg-emerald-500",
    progress: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700",
  },

  warning: {
    wrapper: "border-amber-200 bg-amber-50/50",
    iconWrapper: "bg-amber-100",
    iconText: "text-amber-600",
    accent: "bg-amber-500",
    progress: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700",
  },

  danger: {
    wrapper: "border-rose-200 bg-rose-50/50",
    iconWrapper: "bg-rose-100",
    iconText: "text-rose-600",
    accent: "bg-rose-500",
    progress: "bg-rose-500",
    badge: "bg-rose-100 text-rose-700",
  },

  info: {
    wrapper: "border-sky-200 bg-sky-50/50",
    iconWrapper: "bg-sky-100",
    iconText: "text-sky-600",
    accent: "bg-sky-500",
    progress: "bg-sky-500",
    badge: "bg-sky-100 text-sky-700",
  },

  premium: {
    wrapper:
      "border-primary/20 bg-gradient-to-br from-primary/[0.08] via-card to-accent/30",
    iconWrapper: "bg-primary/10",
    iconText: "text-primary",
    accent: "bg-primary",
    progress: "bg-primary",
    badge: "bg-primary/10 text-primary",
  },

  gradient: {
    wrapper:
      "border-border bg-gradient-to-br from-card via-card to-primary/[0.06]",
    iconWrapper: "bg-primary/10",
    iconText: "text-primary",
    accent: "bg-primary",
    progress: "bg-primary",
    badge: "bg-primary/10 text-primary",
  },

  minimal: {
    wrapper: "border-transparent bg-transparent",
    iconWrapper: "bg-muted",
    iconText: "text-muted-foreground",
    accent: "bg-primary",
    progress: "bg-primary",
    badge: "bg-muted text-muted-foreground",
  },
};

/* =========================================================
   SIZE CONFIG
========================================================= */

const SIZE_CONFIG: Record<
  StatCardSize,
  {
    padding: string;
    label: string;
    value: string;
    unit: string;
    icon: string;
    iconSize: string;
    gap: string;
  }
> = {
  sm: {
    padding: "p-3.5",
    label: "text-xs",
    value: "text-xl",
    unit: "text-xs",
    icon: "size-8",
    iconSize: "size-3.5",
    gap: "gap-2",
  },

  md: {
    padding: "p-5",
    label: "text-sm",
    value: "text-2xl",
    unit: "text-sm",
    icon: "size-10",
    iconSize: "size-4",
    gap: "gap-3",
  },

  lg: {
    padding: "p-6",
    label: "text-sm",
    value: "text-3xl",
    unit: "text-base",
    icon: "size-12",
    iconSize: "size-5",
    gap: "gap-4",
  },
};

function renderCardIcon(
  icon: ReactNode | ElementType | undefined,
  className?: string,
) {
  if (!icon) {
    return null;
  }

  if (typeof icon === "function") {
    const IconComponent = icon as ElementType;
    return <IconComponent className={className} aria-hidden />;
  }

  if (React.isValidElement<{ className?: string }>(icon)) {
    const mergedClassName = [icon.props.className, className].filter(Boolean).join(" ");
    return React.cloneElement(icon, {
      className: mergedClassName,
    });
  }

  return icon;
}

/* =========================================================
   SPARKLINE
========================================================= */

function Sparkline({
  data,
  trend,
}: {
  data: number[];
  trend?: Trend;
}) {
  if (!data.length) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x =
        data.length === 1
          ? 50
          : (index / (data.length - 1)) * 100;

      const y =
        34 - ((value - min) / range) * 28;

      return `${x},${y}`;
    })
    .join(" ");

  const Icon =
    trend === "down"
      ? TrendingDown
      : TrendingUp;

  return (
    <div className="flex items-center gap-2">
      <svg
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        className="h-10 w-24 overflow-visible"
        aria-hidden
      >
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            trend === "down"
              ? "text-rose-500"
              : "text-emerald-500",
          )}
        />
      </svg>

      <Icon
        className={cn(
          "size-3.5",
          trend === "down"
            ? "text-rose-500"
            : "text-emerald-500",
        )}
      />
    </div>
  );
}

/* =========================================================
   LOADING SKELETON
========================================================= */

function StatCardSkeleton({
  size,
}: {
  size: StatCardSize;
}) {
  const config = SIZE_CONFIG[size];

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card",
        config.padding,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />

          <div className="mt-4 h-8 w-32 animate-pulse rounded bg-muted" />

          <div className="mt-3 h-2.5 w-40 animate-pulse rounded bg-muted" />
        </div>

        <div
          className={cn(
            config.icon,
            "animate-pulse rounded-xl bg-muted",
          )}
        />
      </div>

      <div className="mt-5 h-2.5 w-24 animate-pulse rounded bg-muted" />
    </div>
  );
}

/* =========================================================
   TREND DISPLAY
========================================================= */

function TrendDisplay({
  trend,
  change,
  label,
  showChange,
}: {
  trend?: Trend;
  change?: number;
  label?: string;
  showChange: boolean;
}) {
  if (!trend && change === undefined && !label) {
    return null;
  }

  const TrendIcon = trend
    ? TREND_ICONS[trend]
    : null;

  const isUp = trend === "up";
  const isDown = trend === "down";

  return (
    <div
      className={cn(
        "mt-3 flex flex-wrap items-center gap-1.5 text-xs",
        isUp && "text-emerald-600",
        isDown && "text-rose-600",
        !isUp &&
          !isDown &&
          "text-muted-foreground",
      )}
    >
      {TrendIcon ? (
        <TrendIcon
          className="size-3.5"
          aria-hidden
        />
      ) : null}

      {showChange &&
      change !== undefined ? (
        <span className="font-semibold">
          {change > 0 ? "+" : ""}
          {change}%
        </span>
      ) : null}

      {label ? (
        <span className="text-muted-foreground">
          {label}
        </span>
      ) : null}
    </div>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
  variant,
}: {
  status: string;
  variant: StatCardVariant;
}) {
  const config = VARIANT_CONFIG[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        config.badge,
      )}
    >
      <span className="relative flex size-1.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-50" />
        <span className="relative size-1.5 rounded-full bg-current" />
      </span>

      {status}
    </span>
  );
}

/* =========================================================
   PROGRESS
========================================================= */

function ProgressDisplay({
  progress,
  target,
  label,
  variant,
}: {
  progress?: number;
  target?: number;
  label?: string;
  variant: StatCardVariant;
}) {
  const config = VARIANT_CONFIG[variant];

  const value =
    progress !== undefined
      ? Math.max(0, Math.min(100, progress))
      : target !== undefined
        ? Math.max(0, Math.min(100, target))
        : 0;

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between gap-3 text-[11px]">
        <span className="font-medium text-muted-foreground">
          {label ?? "Progress"}
        </span>

        <span className="font-semibold text-foreground">
          {Math.round(value)}%
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700",
            config.progress,
          )}
          style={{
            width: `${value}%`,
          }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export function StatCard({
  label,
  title,
  value,
  unit,
  status,
  change,
  hint,
  icon: Icon,
  trend,
  trendLabel,
  className,

  variant = "default",
  size = "md",

  description,
  eyebrow,

  iconBg,
  iconClassName,

  valuePrefix,
  valueSuffix,

  previousValue,

  target,
  progress,
  progressLabel,

  badge,
  badgeIcon: BadgeIcon,

  footer,
  action,

  onClick,

  loading = false,
  animated = true,
  hoverable = true,

  showTrend = true,
  showChange = true,

  showTarget = false,
  showProgress = false,

  showSparkline = false,
  sparklineData = [],

  tooltip,

  highlight = false,
  compact = false,

  live = false,
  liveLabel = "Live",

  children,
}: StatCardProps) {
  const config = VARIANT_CONFIG[variant];
  const sizeConfig = SIZE_CONFIG[size];
  const displayLabel = label ?? title ?? "Metric";

  if (loading) {
    return (
      <StatCardSkeleton size={size} />
    );
  }

  const clickable = Boolean(onClick);

  const ariaLabel =
    tooltip ??
    `${displayLabel}: ${value}${unit ? ` ${unit}` : ""}`;

  return (
    <div
      title={tooltip}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (
          clickable &&
          (event.key === "Enter" ||
            event.key === " ")
        ) {
          event.preventDefault();
          onClick?.();
        }
      }}
      aria-label={ariaLabel}
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card transition-all duration-300",
        config.wrapper,

        sizeConfig.padding,

        hoverable &&
          "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5",

        clickable &&
          "cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30",

        animated &&
          "motion-safe:transition-transform",

        highlight &&
          "ring-2 ring-primary/20 ring-offset-2",

        compact && "p-4",

        className,
      )}
    >
      {/* =====================================================
          DECORATIVE ACCENT
      ====================================================== */}

      <span
        className={cn(
          "absolute left-0 top-0 h-full w-0.5 opacity-60",
          config.accent,
        )}
        aria-hidden
      />

      {variant === "premium" ||
      variant === "gradient" ? (
        <span
          className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full bg-primary/[0.06] blur-2xl"
          aria-hidden
        />
      ) : null}

      {/* =====================================================
          TOP ROW
      ====================================================== */}

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {eyebrow ? (
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-primary">
              {eyebrow}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <p
              className={cn(
                "font-medium text-muted-foreground",
                sizeConfig.label,
              )}
            >
              {displayLabel}
            </p>

            {live ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                <span className="relative flex size-1.5">
                  <span className="absolute size-full animate-ping rounded-full bg-emerald-500" />
                  <span className="relative size-1.5 rounded-full bg-emerald-500" />
                </span>

                {liveLabel}
              </span>
            ) : null}

            {badge ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  config.badge,
                )}
              >
                {BadgeIcon ? (
                  <BadgeIcon className="size-3" />
                ) : null}

                {badge}
              </span>
            ) : null}
          </div>
        </div>

        {Icon ? (
          <span
            className={cn(
              "grid shrink-0 place-items-center rounded-xl transition-transform duration-300",
              sizeConfig.icon,
              iconBg ?? config.iconWrapper,
              hoverable &&
                "group-hover:scale-105",
            )}
          >
            {renderCardIcon(
              Icon,
              cn(
                sizeConfig.iconSize,
                iconClassName ?? config.iconText,
              ),
            )}
          </span>
        ) : null}
      </div>

      {/* =====================================================
          VALUE
      ====================================================== */}

      <div className="relative mt-3 flex items-baseline gap-1.5">
        {valuePrefix ? (
          <span
            className={cn(
              "font-medium text-muted-foreground",
              sizeConfig.unit,
            )}
          >
            {valuePrefix}
          </span>
        ) : null}

        <p
          className={cn(
            "font-bold tracking-tight text-card-foreground",
            sizeConfig.value,
          )}
        >
          {value}
        </p>

        {unit ? (
          <span
            className={cn(
              "font-medium text-muted-foreground",
              sizeConfig.unit,
            )}
          >
            {unit}
          </span>
        ) : null}

        {valueSuffix ? (
          <span
            className={cn(
              "font-medium text-muted-foreground",
              sizeConfig.unit,
            )}
          >
            {valueSuffix}
          </span>
        ) : null}
      </div>

      {/* =====================================================
          DESCRIPTION / HINT
      ====================================================== */}

      {description || hint ? (
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          {description ?? hint}
        </p>
      ) : null}

      {/* =====================================================
          STATUS
      ====================================================== */}

      {status ? (
        <div className="mt-3">
          <StatusBadge
            status={status}
            variant={variant}
          />
        </div>
      ) : null}

      {/* =====================================================
          TREND
      ====================================================== */}

      {showTrend ? (
        <TrendDisplay
          trend={trend}
          change={change}
          label={trendLabel ?? hint}
          showChange={showChange}
        />
      ) : null}

      {/* =====================================================
          PREVIOUS VALUE
      ====================================================== */}

      {previousValue !== undefined ? (
        <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
          <Clock3 className="size-3" />

          <span>
            Previous:{" "}
            <strong className="text-foreground">
              {previousValue}
            </strong>
          </span>
        </div>
      ) : null}

      {/* =====================================================
          SPARKLINE
      ====================================================== */}

      {showSparkline &&
      sparklineData.length > 1 ? (
        <div className="mt-3">
          <Sparkline
            data={sparklineData}
            trend={trend}
          />
        </div>
      ) : null}

      {/* =====================================================
          PROGRESS
      ====================================================== */}

      {showProgress ? (
        <ProgressDisplay
          progress={progress}
          target={target}
          label={progressLabel}
          variant={variant}
        />
      ) : null}

      {/* =====================================================
          TARGET
      ====================================================== */}

      {showTarget &&
      target !== undefined ? (
        <div className="mt-3 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Target className="size-3.5" />
            <span>Target</span>
          </div>

          <span className="font-semibold text-foreground">
            {target}%
          </span>
        </div>
      ) : null}

      {/* =====================================================
          CUSTOM CHILDREN
      ====================================================== */}

      {children ? (
        <div className="mt-4">
          {children}
        </div>
      ) : null}

      {/* =====================================================
          FOOTER
      ====================================================== */}

      {footer || action ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
          <div className="min-w-0 flex-1">
            {footer}
          </div>

          {action ? (
            <div
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              {action}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* =====================================================
          INFO TOOLTIP INDICATOR
      ====================================================== */}

      {tooltip ? (
        <span
          className="absolute bottom-3 right-3 text-muted-foreground/50 transition-colors group-hover:text-muted-foreground"
          aria-hidden
        >
          <CircleHelp className="size-3.5" />
        </span>
      ) : null}
    </div>
  );
}

/* =========================================================
   SPECIALIZED AGRICULTURE STAT CARDS
========================================================= */

export function CropStatCard(
  props: Omit<StatCardProps, "variant">,
) {
  return (
    <StatCard
      {...props}
      variant="success"
      icon={props.icon ?? WheatIcon}
    />
  );
}

function WheatIcon(props: React.ComponentProps<"svg">) {
  return (
    <Wheat
      {...props}
      aria-hidden
    />
  );
}

export function WaterStatCard(
  props: Omit<StatCardProps, "variant">,
) {
  return (
    <StatCard
      {...props}
      variant="info"
      icon={props.icon ?? DropletIcon}
    />
  );
}

function DropletIcon(
  props: React.ComponentProps<"svg">,
) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2.5S5 10 5 15a7 7 0 0 0 14 0c0-5-7-12.5-7-12.5Z" />
      <path d="M9 16a3 3 0 0 0 3 3" />
    </svg>
  );
}

export function RevenueStatCard(
  props: Omit<StatCardProps, "variant">,
) {
  return (
    <StatCard
      {...props}
      variant="success"
      icon={props.icon ?? TrendingUp}
    />
  );
}

export function WarningStatCard(
  props: Omit<StatCardProps, "variant">,
) {
  return (
    <StatCard
      {...props}
      variant="warning"
      icon={props.icon ?? Info}
    />
  );
}

export function DangerStatCard(
  props: Omit<StatCardProps, "variant">,
) {
  return (
    <StatCard
      {...props}
      variant="danger"
      icon={props.icon ?? Activity}
    />
  );
}

export function PremiumStatCard(
  props: Omit<StatCardProps, "variant">,
) {
  return (
    <StatCard
      {...props}
      variant="premium"
      icon={props.icon ?? Sparkles}
      badge={props.badge ?? "Smart AI"}
    />
  );
}

/* =========================================================
   LIVE STAT CARD
========================================================= */

export function LiveStatCard(
  props: Omit<StatCardProps, "live">,
) {
  return (
    <StatCard
      {...props}
      live
      liveLabel="Live"
    />
  );
}

/* =========================================================
   PROGRESS STAT CARD
========================================================= */

export function ProgressStatCard(
  props: Omit<
    StatCardProps,
    "showProgress"
  >,
) {
  return (
    <StatCard
      {...props}
      showProgress
    />
  );
}

/* =========================================================
   ANALYTICS STAT CARD
========================================================= */

export function AnalyticsStatCard(
  props: Omit<StatCardProps, "showSparkline">,
) {
  return (
    <StatCard
      {...props}
      showSparkline
      sparklineData={
        props.sparklineData ?? [
          20,
          28,
          25,
          38,
          35,
          48,
          45,
          60,
        ]
      }
    />
  );
}

/* =========================================================
   SMART FARM STAT CARD
========================================================= */

export function SmartFarmStatCard(
  props: Omit<
    StatCardProps,
    "variant"
  >,
) {
  return (
    <StatCard
      {...props}
      variant="premium"
      badge={props.badge ?? "AI Insight"}
      badgeIcon={props.badgeIcon ?? Sparkles}
      showSparkline={
        props.showSparkline ?? true
      }
      sparklineData={
        props.sparklineData ?? [
          35,
          42,
          39,
          50,
          46,
          58,
          62,
          70,
        ]
      }
    />
  );
}

/* =========================================================
   MINI STAT CARD
========================================================= */

export function MiniStatCard({
  label,
  value,
  unit,
  icon: Icon,
  trend,
  className,
}: Pick<
  StatCardProps,
  | "label"
  | "value"
  | "unit"
  | "icon"
  | "trend"
  | "className"
>) {
  const TrendIcon = trend
    ? TREND_ICONS[trend]
    : null;

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-3.5",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {Icon ? (
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            {renderCardIcon(Icon, "size-4")}
          </span>
        ) : null}

        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-medium text-muted-foreground">
            {label}
          </p>

          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-lg font-bold text-foreground">
              {value}
            </span>

            {unit ? (
              <span className="text-[10px] text-muted-foreground">
                {unit}
              </span>
            ) : null}
          </div>
        </div>

        {TrendIcon ? (
          <TrendIcon
            className={cn(
              "size-4",
              trend === "up" &&
                "text-emerald-500",
              trend === "down" &&
                "text-rose-500",
              trend === "flat" &&
                "text-muted-foreground",
            )}
          />
        ) : null}
      </div>
    </div>
  );
}

/* =========================================================
   STAT CARD GRID
========================================================= */

export function StatCardGrid({
  children,
  columns = 4,
  className,
}: {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-4",
        columns === 1 && "grid-cols-1",
        columns === 2 &&
          "grid-cols-1 sm:grid-cols-2",
        columns === 3 &&
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        columns === 4 &&
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* =========================================================
   STAT CARD GROUP
========================================================= */

export function StatCardGroup({
  title,
  description,
  children,
  action,
  className,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-4", className)}>
      {title || description || action ? (
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            {title ? (
              <h2 className="text-base font-semibold text-foreground">
                {title}
              </h2>
            ) : null}

            {description ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>

          {action}
        </header>
      ) : null}

      {children}
    </section>
  );
}

/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default StatCard;