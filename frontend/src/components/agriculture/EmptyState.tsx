import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Cloud,
  Database,
  FileText,
  Filter,
  FolderOpen,
  Info,
  Leaf,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ServerOff,
  Sprout,
  Tractor,
  Upload,
  Wheat,
  X,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/* =========================================================
   TYPES
========================================================= */

export type EmptyStateVariant =
  | "default"
  | "minimal"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "search"
  | "filter"
  | "upload"
  | "offline"
  | "loading"
  | "dashboard"
  | "agriculture"
  | "premium";

export type EmptyStateSize = "sm" | "md" | "lg" | "xl";

export interface EmptyStateStat {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
}

export interface EmptyStateTip {
  title: string;
  description: string;
  icon?: LucideIcon;
}

export interface EmptyStateProps {
  /* Original props */
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;

  /* Visual */
  variant?: EmptyStateVariant;
  size?: EmptyStateSize;
  badge?: string;
  badgeIcon?: LucideIcon;
  eyebrow?: string;

  /* Actions */
  secondaryAction?: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  showRetry?: boolean;
  onDismiss?: () => void;
  dismissible?: boolean;

  /* Content */
  stats?: EmptyStateStat[];
  tips?: EmptyStateTip[];
  footer?: ReactNode;
  children?: ReactNode;

  /* Progress */
  showProgress?: boolean;
  progress?: number;
  progressLabel?: string;

  /* Styling */
  animated?: boolean;
  decorative?: boolean;
  compact?: boolean;
  bordered?: boolean;
  elevated?: boolean;
  fullHeight?: boolean;
  minHeight?: string;

  /* Status */
  showStatus?: boolean;
  statusText?: string;
  statusIcon?: LucideIcon;

  /* Accessibility */
  role?: "status" | "alert" | "region";
  ariaLabel?: string;

  /* Loading */
  loading?: boolean;
  loadingText?: string;

  /* Search */
  searchQuery?: string;
  clearSearch?: () => void;

  /* Custom */
  topContent?: ReactNode;
  bottomContent?: ReactNode;
}

/* =========================================================
   CONFIGURATION
========================================================= */

const VARIANT_CONFIG: Record<
  EmptyStateVariant,
  {
    icon: LucideIcon;
    wrapper: string;
    iconWrapper: string;
    iconText: string;
    badge: string;
    progress: string;
    accent: string;
  }
> = {
  default: {
    icon: Sprout,
    wrapper: "border-border bg-card/70",
    iconWrapper: "bg-accent",
    iconText: "text-accent-foreground",
    badge: "bg-muted text-muted-foreground",
    progress: "bg-primary",
    accent: "bg-primary/10",
  },

  minimal: {
    icon: Sprout,
    wrapper: "border-transparent bg-transparent",
    iconWrapper: "bg-muted",
    iconText: "text-muted-foreground",
    badge: "bg-muted text-muted-foreground",
    progress: "bg-primary",
    accent: "bg-muted",
  },

  success: {
    icon: CheckCircle2,
    wrapper: "border-emerald-200 bg-emerald-50/70",
    iconWrapper: "bg-emerald-100",
    iconText: "text-emerald-600",
    badge: "bg-emerald-100 text-emerald-700",
    progress: "bg-emerald-500",
    accent: "bg-emerald-100",
  },

  info: {
    icon: Info,
    wrapper: "border-sky-200 bg-sky-50/70",
    iconWrapper: "bg-sky-100",
    iconText: "text-sky-600",
    badge: "bg-sky-100 text-sky-700",
    progress: "bg-sky-500",
    accent: "bg-sky-100",
  },

  warning: {
    icon: AlertCircle,
    wrapper: "border-amber-200 bg-amber-50/70",
    iconWrapper: "bg-amber-100",
    iconText: "text-amber-600",
    badge: "bg-amber-100 text-amber-700",
    progress: "bg-amber-500",
    accent: "bg-amber-100",
  },

  error: {
    icon: AlertCircle,
    wrapper: "border-rose-200 bg-rose-50/70",
    iconWrapper: "bg-rose-100",
    iconText: "text-rose-600",
    badge: "bg-rose-100 text-rose-700",
    progress: "bg-rose-500",
    accent: "bg-rose-100",
  },

  search: {
    icon: Search,
    wrapper: "border-border bg-card/80",
    iconWrapper: "bg-primary/10",
    iconText: "text-primary",
    badge: "bg-primary/10 text-primary",
    progress: "bg-primary",
    accent: "bg-primary/10",
  },

  filter: {
    icon: Filter,
    wrapper: "border-border bg-card/80",
    iconWrapper: "bg-violet-100",
    iconText: "text-violet-600",
    badge: "bg-violet-100 text-violet-700",
    progress: "bg-violet-500",
    accent: "bg-violet-100",
  },

  upload: {
    icon: Upload,
    wrapper: "border-dashed border-primary/30 bg-primary/[0.03]",
    iconWrapper: "bg-primary/10",
    iconText: "text-primary",
    badge: "bg-primary/10 text-primary",
    progress: "bg-primary",
    accent: "bg-primary/10",
  },

  offline: {
    icon: ServerOff,
    wrapper: "border-border bg-muted/40",
    iconWrapper: "bg-muted",
    iconText: "text-muted-foreground",
    badge: "bg-muted text-muted-foreground",
    progress: "bg-muted-foreground",
    accent: "bg-muted",
  },

  loading: {
    icon: Loader2,
    wrapper: "border-border bg-card",
    iconWrapper: "bg-primary/10",
    iconText: "text-primary",
    badge: "bg-primary/10 text-primary",
    progress: "bg-primary",
    accent: "bg-primary/10",
  },

  dashboard: {
    icon: Database,
    wrapper: "border-border bg-card",
    iconWrapper: "bg-primary/10",
    iconText: "text-primary",
    badge: "bg-primary/10 text-primary",
    progress: "bg-primary",
    accent: "bg-primary/10",
  },

  agriculture: {
    icon: Wheat,
    wrapper: "border-emerald-200 bg-gradient-to-br from-emerald-50/80 via-card to-lime-50/50",
    iconWrapper: "bg-emerald-100",
    iconText: "text-emerald-600",
    badge: "bg-emerald-100 text-emerald-700",
    progress: "bg-emerald-500",
    accent: "bg-emerald-100",
  },

  premium: {
    icon: Zap,
    wrapper: "border-primary/20 bg-gradient-to-br from-primary/5 via-card to-accent/30",
    iconWrapper: "bg-primary/10",
    iconText: "text-primary",
    badge: "bg-primary/10 text-primary",
    progress: "bg-primary",
    accent: "bg-primary/10",
  },
};

/* =========================================================
   SIZE CONFIG
========================================================= */

const SIZE_CONFIG: Record<
  EmptyStateSize,
  {
    container: string;
    icon: string;
    iconSize: string;
    title: string;
    description: string;
    padding: string;
  }
> = {
  sm: {
    container: "min-h-[180px]",
    icon: "size-10",
    iconSize: "size-5",
    title: "text-sm",
    description: "text-xs",
    padding: "px-4 py-6",
  },

  md: {
    container: "min-h-[260px]",
    icon: "size-12",
    iconSize: "size-6",
    title: "text-base",
    description: "text-sm",
    padding: "px-6 py-10",
  },

  lg: {
    container: "min-h-[360px]",
    icon: "size-16",
    iconSize: "size-8",
    title: "text-xl",
    description: "text-sm",
    padding: "px-6 py-14",
  },

  xl: {
    container: "min-h-[480px]",
    icon: "size-20",
    iconSize: "size-10",
    title: "text-2xl",
    description: "text-base",
    padding: "px-8 py-20",
  },
};

/* =========================================================
   SMALL INTERNAL COMPONENTS
========================================================= */

function DecorativeLeaf({
  className,
  icon: Icon = Leaf,
}: {
  className?: string;
  icon?: LucideIcon;
}) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute grid size-9 place-items-center rounded-2xl bg-primary/[0.06] text-primary/30",
        className,
      )}
      aria-hidden
    >
      <Icon className="size-4" />
    </span>
  );
}

function StatItem({ stat }: { stat: EmptyStateStat }) {
  const Icon = stat.icon;

  return (
    <div className="group rounded-xl border border-border/70 bg-background/70 p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm">
      <div className="flex items-center gap-2">
        {Icon ? (
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" aria-hidden />
          </span>
        ) : null}

        <div className="min-w-0">
          <p className="text-lg font-bold tracking-tight text-foreground">
            {stat.value}
          </p>
          <p className="truncate text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {stat.label}
          </p>
        </div>
      </div>

      {stat.description ? (
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {stat.description}
        </p>
      ) : null}
    </div>
  );
}

function TipItem({ tip }: { tip: EmptyStateTip }) {
  const Icon = tip.icon ?? CheckCircle2;

  return (
    <div className="flex gap-3 rounded-xl border border-border/60 bg-background/60 p-3 text-left">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" aria-hidden />
      </span>

      <div>
        <p className="text-sm font-semibold text-foreground">{tip.title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          {tip.description}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN EMPTY STATE
========================================================= */

export function EmptyState({
  title,
  description,
  icon: CustomIcon,
  action,
  className,

  variant = "default",
  size = "md",

  badge,
  badgeIcon: BadgeIcon,
  eyebrow,

  secondaryAction,
  onRetry,
  retryLabel = "Try again",
  showRetry = false,

  onDismiss,
  dismissible = false,

  stats,
  tips,
  footer,
  children,

  showProgress = false,
  progress = 0,
  progressLabel = "Progress",

  animated = true,
  decorative = true,
  compact = false,
  bordered = true,
  elevated = false,
  fullHeight = false,
  minHeight,

  showStatus = false,
  statusText = "Ready",
  statusIcon: StatusIcon = CheckCircle2,

  role = "region",
  ariaLabel,

  loading = false,
  loadingText = "Loading...",

  searchQuery,
  clearSearch,

  topContent,
  bottomContent,
}: EmptyStateProps) {
  const config = VARIANT_CONFIG[variant];
  const sizeConfig = SIZE_CONFIG[size];

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 20);
    return () => window.clearTimeout(timer);
  }, []);

  const DefaultIcon = config.icon;
  const Icon = CustomIcon ?? DefaultIcon;

  const safeProgress = Math.min(100, Math.max(0, progress));

  const isLoading =
    loading || variant === "loading";

  const isSearchEmpty =
    variant === "search" && Boolean(searchQuery);

  return (
    <section
      role={role}
      aria-label={ariaLabel ?? title}
      className={cn(
        "relative isolate overflow-hidden",
        bordered && "border",
        "rounded-2xl",
        config.wrapper,
        sizeConfig.container,
        sizeConfig.padding,

        elevated && "shadow-lg shadow-black/5",

        fullHeight && "flex min-h-[60vh]",

        animated &&
          visible &&
          "animate-in fade-in slide-in-from-bottom-2 duration-500",

        !visible && animated && "opacity-0",

        compact && "min-h-0 py-6",

        className,
      )}
      style={minHeight ? { minHeight } : undefined}
    >
      {/* =====================================================
          DECORATIVE BACKGROUND
      ====================================================== */}

      {decorative ? (
        <>
          <div
            className="pointer-events-none absolute -right-20 -top-20 -z-10 size-64 rounded-full bg-primary/[0.035] blur-3xl"
            aria-hidden
          />

          <div
            className="pointer-events-none absolute -bottom-24 -left-20 -z-10 size-72 rounded-full bg-emerald-400/[0.035] blur-3xl"
            aria-hidden
          />

          <DecorativeLeaf
            className="right-10 top-10 rotate-12"
            icon={Sprout}
          />

          <DecorativeLeaf
            className="bottom-12 left-10 -rotate-12"
            icon={Leaf}
          />

          <span
            className="pointer-events-none absolute right-1/4 top-1/3 -z-10 size-2 rounded-full bg-primary/20"
            aria-hidden
          />

          <span
            className="pointer-events-none absolute bottom-1/3 left-1/4 -z-10 size-1.5 rounded-full bg-primary/20"
            aria-hidden
          />
        </>
      ) : null}

      {/* =====================================================
          DISMISS
      ====================================================== */}

      {dismissible && onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="absolute right-3 top-3 z-20 grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      ) : null}

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div
        className={cn(
          "relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center text-center",
          fullHeight && "my-auto",
        )}
      >
        {topContent ? (
          <div className="mb-5 w-full">{topContent}</div>
        ) : null}

        {/* Eyebrow */}
        {eyebrow ? (
          <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </div>
        ) : null}

        {/* Badge */}
        {badge ? (
          <div
            className={cn(
              "mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
              config.badge,
            )}
          >
            {BadgeIcon ? (
              <BadgeIcon className="size-3.5" aria-hidden />
            ) : null}

            <span>{badge}</span>
          </div>
        ) : null}

        {/* Main Icon */}
        <div
          className={cn(
            "relative grid place-items-center rounded-[28%] transition-all duration-500",
            sizeConfig.icon,
            config.iconWrapper,
            animated && "hover:scale-105",
          )}
        >
          {/* Icon ring */}
          <span
            className="absolute inset-0 rounded-[28%] border border-primary/10"
            aria-hidden
          />

          {/* Pulse ring */}
          {animated && variant !== "minimal" && !isLoading ? (
            <span
              className="absolute inset-0 rounded-[28%] border border-primary/10 animate-ping"
              aria-hidden
            />
          ) : null}

          <Icon
            className={cn(
              "relative",
              sizeConfig.iconSize,
              config.iconText,

              isLoading && "animate-spin",

              animated &&
                !isLoading &&
                "transition-transform duration-300",
            )}
            aria-hidden
          />
        </div>

        {/* Loading status */}
        {isLoading ? (
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
            <Loader2 className="size-3.5 animate-spin" />
            {loadingText}
          </div>
        ) : null}

        {/* Title */}
        <h3
          className={cn(
            "mt-5 font-bold tracking-tight text-foreground",
            sizeConfig.title,
          )}
        >
          {isSearchEmpty
            ? `No results for "${searchQuery}"`
            : title}
        </h3>

        {/* Description */}
        {description ? (
          <p
            className={cn(
              "mt-2 max-w-xl leading-relaxed text-muted-foreground",
              sizeConfig.description,
            )}
          >
            {isSearchEmpty
              ? `We couldn't find anything matching your search. Try a different keyword or clear your filters.`
              : description}
          </p>
        ) : null}

        {/* Search clear */}
        {isSearchEmpty && clearSearch ? (
          <button
            type="button"
            onClick={clearSearch}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <X className="size-3.5" />
            Clear search
          </button>
        ) : null}

        {/* Status */}
        {showStatus && !isLoading ? (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>

            <StatusIcon className="size-3.5 text-emerald-600" />

            {statusText}
          </div>
        ) : null}

        {/* Progress */}
        {showProgress ? (
          <div className="mt-6 w-full max-w-md">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-medium text-muted-foreground">
                {progressLabel}
              </span>

              <span className="font-bold text-foreground">
                {safeProgress}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700",
                  config.progress,
                )}
                style={{ width: `${safeProgress}%` }}
              />
            </div>
          </div>
        ) : null}

        {/* Primary actions */}
        {(action || secondaryAction || showRetry) && !isLoading ? (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {action}

            {secondaryAction ? (
              <span>{secondaryAction}</span>
            ) : null}

            {showRetry && onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted"
              >
                <RefreshCw className="size-4" />
                {retryLabel}
              </button>
            ) : null}
          </div>
        ) : null}

        {/* Stats */}
        {stats && stats.length > 0 ? (
          <div
            className={cn(
              "mt-8 grid w-full gap-3",
              stats.length === 1 && "max-w-xs grid-cols-1",
              stats.length === 2 && "max-w-xl grid-cols-2",
              stats.length >= 3 &&
                "max-w-3xl grid-cols-2 sm:grid-cols-3",
            )}
          >
            {stats.map((stat, index) => (
              <StatItem
                key={`${stat.label}-${index}`}
                stat={stat}
              />
            ))}
          </div>
        ) : null}

        {/* Tips */}
        {tips && tips.length > 0 ? (
          <div className="mt-8 w-full max-w-2xl">
            <div className="mb-3 flex items-center gap-2 text-left">
              <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
                <Info className="size-3.5" />
              </span>

              <span className="text-sm font-semibold text-foreground">
                Helpful tips
              </span>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {tips.map((tip, index) => (
                <TipItem
                  key={`${tip.title}-${index}`}
                  tip={tip}
                />
              ))}
            </div>
          </div>
        ) : null}

        {/* Custom children */}
        {children ? (
          <div className="mt-7 w-full">{children}</div>
        ) : null}

        {/* Bottom content */}
        {bottomContent ? (
          <div className="mt-6 w-full">{bottomContent}</div>
        ) : null}

        {/* Footer */}
        {footer ? (
          <div className="mt-7 w-full border-t border-border/60 pt-5">
            {footer}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/* =========================================================
   AGRICULTURE EMPTY STATE
========================================================= */

export function AgricultureEmptyState({
  title = "No farm data yet",
  description = "Start adding your farm information to unlock personalized agriculture insights.",
  action,
  ...props
}: Omit<EmptyStateProps, "title"> & { title?: string }) {
  return (
    <EmptyState
      {...props}
      title={title}
      description={description}
      variant="agriculture"
      icon={props.icon ?? Tractor}
      badge={props.badge ?? "Farm workspace"}
    >
      {props.children}
    </EmptyState>
  );
}

/* =========================================================
   SEARCH EMPTY STATE
========================================================= */

export function SearchEmptyState({
  title = "No results found",
  description = "Try changing your search keyword or removing some filters.",
  query,
  onClear,
  ...props
}: Omit<EmptyStateProps, "title"> & {
  title?: string;
  query?: string;
  onClear?: () => void;
}) {
  return (
    <EmptyState
      {...props}
      title={title}
      description={description}
      variant="search"
      icon={Search}
      searchQuery={query}
      clearSearch={onClear}
      badge="Search"
    />
  );
}

/* =========================================================
   FILTER EMPTY STATE
========================================================= */

export function FilterEmptyState({
  title = "No matching records",
  description = "Your current filters don't match any records.",
  onClear,
  ...props
}: Omit<EmptyStateProps, "title"> & {
  title?: string;
  onClear?: () => void;
}) {
  return (
    <EmptyState
      {...props}
      title={title}
      description={description}
      variant="filter"
      icon={Filter}
      badge="Filters applied"
      action={
        onClear ? (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            Clear filters
            <X className="size-4" />
          </button>
        ) : (
          props.action
        )
      }
    />
  );
}

/* =========================================================
   UPLOAD EMPTY STATE
========================================================= */

export function UploadEmptyState({
  title = "Upload your data",
  description = "Upload a soil report, crop image, farm document, or other agriculture data to continue.",
  ...props
}: Omit<EmptyStateProps, "title"> & { title?: string }) {
  return (
    <EmptyState
      {...props}
      title={title}
      description={description}
      variant="upload"
      icon={Upload}
      badge="Upload"
      showStatus
      statusText="Secure upload"
    />
  );
}

/* =========================================================
   OFFLINE EMPTY STATE
========================================================= */

export function OfflineEmptyState({
  title = "You're offline",
  description = "We couldn't connect to the agriculture service. Check your internet connection and try again.",
  onRetry,
  ...props
}: Omit<EmptyStateProps, "title"> & {
  title?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      {...props}
      title={title}
      description={description}
      variant="offline"
      icon={Cloud}
      badge="Connection unavailable"
      showRetry={Boolean(onRetry)}
      onRetry={onRetry}
      showStatus
      statusText="Offline"
    />
  );
}

/* =========================================================
   LOADING EMPTY STATE
========================================================= */

export function LoadingEmptyState({
  title = "Preparing your farm data",
  description = "Please wait while we load the latest information.",
  loadingText = "Loading agriculture data...",
  ...props
}: Omit<EmptyStateProps, "title"> & {
  title?: string;
  loadingText?: string;
}) {
  return (
    <EmptyState
      {...props}
      title={title}
      description={description}
      variant="loading"
      icon={Loader2}
      loading
      loadingText={loadingText}
      animated
    />
  );
}

/* =========================================================
   ERROR EMPTY STATE
========================================================= */

export function ErrorEmptyState({
  title = "Something went wrong",
  description = "We couldn't load this information right now. Please try again.",
  onRetry,
  ...props
}: Omit<EmptyStateProps, "title"> & {
  title?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      {...props}
      title={title}
      description={description}
      variant="error"
      icon={AlertCircle}
      badge="Error"
      showRetry={Boolean(onRetry)}
      onRetry={onRetry}
    />
  );
}

/* =========================================================
   SUCCESS EMPTY STATE
========================================================= */

export function SuccessEmptyState({
  title = "All caught up!",
  description = "There are no pending items requiring your attention.",
  ...props
}: Omit<EmptyStateProps, "title"> & { title?: string }) {
  return (
    <EmptyState
      {...props}
      title={title}
      description={description}
      variant="success"
      icon={CheckCircle2}
      badge="Completed"
      showStatus
      statusText="Everything is up to date"
    />
  );
}

/* =========================================================
   DASHBOARD EMPTY STATE
========================================================= */

export function DashboardEmptyState({
  title = "Your dashboard is ready",
  description = "Start adding farm records to see analytics, crop insights, financial information, and recommendations here.",
  action,
  ...props
}: Omit<EmptyStateProps, "title"> & { title?: string }) {
  return (
    <EmptyState
      {...props}
      title={title}
      description={description}
      variant="dashboard"
      icon={Database}
      badge="Dashboard"
      action={
        action ?? (
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <Plus className="size-4" />
            Add farm data
            <ArrowRight className="size-4" />
          </button>
        )
      }
    />
  );
}

/* =========================================================
   DOCUMENT EMPTY STATE
========================================================= */

export function DocumentEmptyState({
  title = "No documents yet",
  description = "Upload and organize your farm documents, soil reports, bills, certificates, and other records.",
  ...props
}: Omit<EmptyStateProps, "title"> & { title?: string }) {
  return (
    <EmptyState
      {...props}
      title={title}
      description={description}
      icon={FileText}
      badge="Documents"
      variant="default"
    />
  );
}

/* =========================================================
   FOLDER EMPTY STATE
========================================================= */

export function FolderEmptyState({
  title = "This folder is empty",
  description = "There are no items in this folder yet.",
  ...props
}: Omit<EmptyStateProps, "title"> & { title?: string }) {
  return (
    <EmptyState
      {...props}
      title={title}
      description={description}
      icon={FolderOpen}
      variant="minimal"
      size="sm"
    />
  );
}

/* =========================================================
   PREMIUM EMPTY STATE
========================================================= */

export function PremiumEmptyState({
  title = "Unlock smarter farming",
  description = "Use advanced agriculture intelligence to improve productivity, reduce resource usage, and make better farm decisions.",
  ...props
}: Omit<EmptyStateProps, "title"> & { title?: string }) {
  return (
    <EmptyState
      {...props}
      title={title}
      description={description}
      variant="premium"
      icon={Zap}
      badge="Smart Agriculture"
      size="lg"
    />
  );
}

/* =========================================================
   COMPACT EMPTY STATE
========================================================= */

export function CompactEmptyState({
  title,
  description,
  action,
  icon,
  ...props
}: EmptyStateProps) {
  return (
    <EmptyState
      {...props}
      title={title}
      description={description}
      action={action}
      icon={icon}
      compact
      size="sm"
      decorative={false}
    />
  );
}

/* =========================================================
   EMPTY STATE CARD
========================================================= */

export function EmptyStateCard({
  title,
  description,
  action,
  icon = Sprout,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group rounded-2xl border border-border bg-card p-1 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
    >
      <EmptyState
        title={title}
        description={description}
        icon={icon}
        action={action}
        variant="minimal"
        bordered={false}
        decorative={false}
        size="sm"
      />
    </div>
  );
}

/* =========================================================
   LIST EMPTY STATE
========================================================= */

export function ListEmptyState({
  title = "No items available",
  description = "There are currently no items to display.",
  itemType = "items",
  action,
  ...props
}: Omit<EmptyStateProps, "title"> & {
  title?: string;
  itemType?: string;
}) {
  return (
    <EmptyState
      {...props}
      title={title}
      description={description}
      icon={FolderOpen}
      badge={`${itemType} list`}
      action={action}
      size="sm"
    />
  );
}

/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default EmptyState;