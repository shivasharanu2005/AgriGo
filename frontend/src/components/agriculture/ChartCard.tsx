import React, {
  ReactNode,
  useState,
} from "react";

import {
  BarChart3,
  Check,
  ChevronDown,
  Download,
  Expand,
  Eye,
  EyeOff,
  Maximize2,
  MoreHorizontal,
  RefreshCw,
  Settings2,
  Sparkles,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

/* ============================================================
   TYPES
============================================================ */

type ChartTrend =
  | "up"
  | "down"
  | "neutral";

type ChartBadgeType =
  | "live"
  | "info"
  | "success"
  | "warning";

export interface ChartCardProps {
  title: string;

  description?: string;

  action?: ReactNode;

  children: ReactNode;

  className?: string;

  icon?: ReactNode;

  badgeText?: string;

  badgeType?: ChartBadgeType;

  value?: string;

  subtitle?: string;

  trend?: ChartTrend;

  trendValue?: string;

  trendLabel?: string;

  loading?: boolean;

  refreshing?: boolean;

  onRefresh?: () => void;

  onDownload?: () => void;

  showRefresh?: boolean;

  showDownload?: boolean;

  showExpand?: boolean;

  showSettings?: boolean;

  expandable?: boolean;

  footer?: ReactNode;

  headerExtra?: ReactNode;

  minHeight?: string;

  showMenu?: boolean;

  defaultHidden?: boolean;

  onVisibilityChange?: (
    visible: boolean,
  ) => void;
}

/* ============================================================
   MAIN CHART CARD
============================================================ */

export function ChartCard({
  title,
  description,
  action,
  children,
  className,

  icon,

  badgeText,

  badgeType = "info",

  value,

  subtitle,

  trend = "neutral",

  trendValue,

  trendLabel,

  loading = false,

  refreshing = false,

  onRefresh,

  onDownload,

  showRefresh = false,

  showDownload = false,

  showExpand = false,

  showSettings = false,

  expandable = false,

  footer,

  headerExtra,

  minHeight,

  showMenu = true,

  defaultHidden = false,

  onVisibilityChange,
}: ChartCardProps) {
  const [expanded, setExpanded] =
    useState(false);

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [hidden, setHidden] =
    useState(defaultHidden);

  /* ==========================================================
     BADGE CONFIGURATION
  ========================================================== */

  const badgeConfig = {
    live: {
      wrapper:
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400",

      dot: "bg-emerald-500",
    },

    info: {
      wrapper:
        "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-400",

      dot: "bg-sky-500",
    },

    success: {
      wrapper:
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400",

      dot: "bg-emerald-500",
    },

    warning: {
      wrapper:
        "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400",

      dot: "bg-amber-500",
    },
  }[badgeType];

  /* ==========================================================
     TREND CONFIGURATION
  ========================================================== */

  const trendConfig = {
    up: {
      icon: TrendingUp,

      className:
        "text-emerald-600 dark:text-emerald-400",
    },

    down: {
      icon: TrendingDown,

      className:
        "text-rose-600 dark:text-rose-400",
    },

    neutral: {
      icon: BarChart3,

      className:
        "text-muted-foreground",
    },
  }[trend];

  const TrendIcon =
    trendConfig.icon;

  /* ==========================================================
     VISIBILITY HANDLER
  ========================================================== */

  const toggleVisibility = () => {
    const next =
      !hidden;

    setHidden(next);

    onVisibilityChange?.(
      !next,
    );
  };

  /* ==========================================================
     EXPANDED VIEW
  ========================================================== */

  if (expanded) {
    return (
      <>
        <div
          className="
            fixed
            inset-0
            z-[90]
            bg-black/50
            backdrop-blur-sm
          "
          onClick={() =>
            setExpanded(false)
          }
        />

        <section
          className="
            fixed
            inset-3
            z-[100]
            flex
            flex-col
            overflow-hidden
            rounded-3xl
            border
            border-border
            bg-card
            shadow-2xl

            sm:inset-6
            lg:inset-10
          "
        >
          {/* ==================================================
             EXPANDED HEADER
          ================================================== */}

          <header
            className="
              flex
              shrink-0
              items-start
              justify-between
              gap-4
              border-b
              border-border/60
              p-4

              sm:p-6
            "
          >
            <div
              className="
                flex
                min-w-0
                items-start
                gap-3
              "
            >
              {icon ? (
                <div
                  className="
                    grid
                    size-11
                    shrink-0
                    place-items-center
                    rounded-xl
                    bg-primary/10
                    text-primary
                  "
                >
                  {icon}
                </div>
              ) : null}

              <div className="min-w-0">
                <div
                  className="
                    flex
                    flex-wrap
                    items-center
                    gap-2
                  "
                >
                  <h2
                    className="
                      text-lg
                      font-bold
                      text-foreground

                      sm:text-xl
                    "
                  >
                    {title}
                  </h2>

                  {badgeText ? (
                    <ChartBadge
                      text={badgeText}
                      type={badgeType}
                    />
                  ) : null}
                </div>

                {description ? (
                  <p
                    className="
                      mt-1
                      text-sm
                      text-muted-foreground
                    "
                  >
                    {description}
                  </p>
                ) : null}
              </div>
            </div>

            <div
              className="
                flex
                shrink-0
                items-center
                gap-1
              "
            >
              {showRefresh ? (
                <IconButton
                  label="Refresh"
                  onClick={onRefresh}
                  disabled={refreshing}
                >
                  <RefreshCw
                    className={cn(
                      "size-4",
                      refreshing &&
                        "animate-spin",
                    )}
                  />
                </IconButton>
              ) : null}

              {showDownload ? (
                <IconButton
                  label="Download"
                  onClick={onDownload}
                >
                  <Download className="size-4" />
                </IconButton>
              ) : null}

              <IconButton
                label="Close"
                onClick={() =>
                  setExpanded(false)
                }
              >
                <X className="size-5" />
              </IconButton>
            </div>
          </header>

          {/* ==================================================
             EXPANDED CONTENT
          ================================================== */}

          <div
            className="
              min-h-0
              flex-1
              overflow-auto
              p-4

              sm:p-6
            "
          >
            {hidden ? (
              <HiddenChart
                onShow={
                  toggleVisibility
                }
              />
            ) : loading ? (
              <ChartLoadingState />
            ) : (
              children
            )}
          </div>

          {footer ? (
            <footer
              className="
                shrink-0
                border-t
                border-border/60
                p-4
              "
            >
              {footer}
            </footer>
          ) : null}
        </section>
      </>
    );
  }

  /* ==========================================================
     NORMAL CARD
  ========================================================== */

  return (
    <section
      className={cn(
        `
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        border-border/70
        bg-card
        shadow-sm

        transition-all
        duration-300

        hover:-translate-y-0.5
        hover:shadow-md
        `,
        className,
      )}
      style={{
        minHeight,
      }}
    >
      {/* ======================================================
         TOP DECORATION
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-primary/40
          to-transparent
          opacity-0
          transition-opacity
          duration-300

          group-hover:opacity-100
        "
      />

      {/* ======================================================
         HEADER
      ====================================================== */}

      <header
        className="
          relative
          border-b
          border-border/50
          p-4

          sm:p-5
        "
      >
        <div
          className="
            flex
            items-start
            justify-between
            gap-3
          "
        >
          {/* ==================================================
             HEADER LEFT
          ================================================== */}

          <div
            className="
              flex
              min-w-0
              items-start
              gap-3
            "
          >
            {icon ? (
              <div
                className="
                  grid
                  size-10
                  shrink-0
                  place-items-center
                  rounded-xl
                  bg-primary/10
                  text-primary

                  transition-transform
                  duration-300

                  group-hover:scale-105
                "
              >
                {icon}
              </div>
            ) : null}

            <div className="min-w-0">
              {/* TITLE */}

              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  gap-2
                "
              >
                <h2
                  className="
                    text-base
                    font-bold
                    tracking-tight
                    text-card-foreground
                  "
                >
                  {title}
                </h2>

                {badgeText ? (
                  <ChartBadge
                    text={badgeText}
                    type={badgeType}
                  />
                ) : null}
              </div>

              {/* DESCRIPTION */}

              {description ? (
                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-muted-foreground

                    sm:text-sm
                  "
                >
                  {description}
                </p>
              ) : null}

              {/* VALUE */}

              {value ? (
                <div
                  className="
                    mt-3
                    flex
                    flex-wrap
                    items-end
                    gap-2
                  "
                >
                  <span
                    className="
                      text-xl
                      font-bold
                      tracking-tight
                      text-foreground

                      sm:text-2xl
                    "
                  >
                    {value}
                  </span>

                  {subtitle ? (
                    <span
                      className="
                        pb-0.5
                        text-[11px]
                        text-muted-foreground
                      "
                    >
                      {subtitle}
                    </span>
                  ) : null}
                </div>
              ) : null}

              {/* TREND */}

              {trendValue ? (
                <div
                  className="
                    mt-2
                    flex
                    flex-wrap
                    items-center
                    gap-2
                  "
                >
                  <span
                    className={cn(
                      `
                      inline-flex
                      items-center
                      gap-1
                      text-[11px]
                      font-bold
                      `,
                      trendConfig.className,
                    )}
                  >
                    <TrendIcon className="size-3.5" />

                    {trendValue}
                  </span>

                  {trendLabel ? (
                    <span
                      className="
                        text-[10px]
                        text-muted-foreground
                      "
                    >
                      {trendLabel}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          {/* ==================================================
             ACTIONS
          ================================================== */}

          <div
            className="
              flex
              shrink-0
              items-center
              gap-1
            "
          >
            {headerExtra}

            {showRefresh ? (
              <IconButton
                label="Refresh"
                disabled={refreshing}
                onClick={onRefresh}
              >
                <RefreshCw
                  className={cn(
                    "size-3.5",
                    refreshing &&
                      "animate-spin",
                  )}
                />
              </IconButton>
            ) : null}

            {showDownload ? (
              <IconButton
                label="Download"
                onClick={onDownload}
                className="hidden sm:grid"
              >
                <Download className="size-3.5" />
              </IconButton>
            ) : null}

            {showExpand ||
            expandable ? (
              <IconButton
                label="Expand"
                onClick={() =>
                  setExpanded(true)
                }
                className="hidden sm:grid"
              >
                <Maximize2 className="size-3.5" />
              </IconButton>
            ) : null}

            {showSettings ? (
              <IconButton
                label="Settings"
                onClick={() =>
                  setMenuOpen(
                    !menuOpen,
                  )
                }
              >
                <Settings2 className="size-3.5" />
              </IconButton>
            ) : null}

            {action}

            {!action &&
            showMenu &&
            !showSettings ? (
              <IconButton
                label="Options"
                onClick={() =>
                  setMenuOpen(
                    !menuOpen,
                  )
                }
              >
                <MoreHorizontal className="size-4" />
              </IconButton>
            ) : null}
          </div>
        </div>

        {/* ==================================================
           MENU
        ================================================== */}

        {menuOpen ? (
          <>
            <button
              type="button"
              aria-label="Close menu"
              className="
                fixed
                inset-0
                z-10
                cursor-default
              "
              onClick={() =>
                setMenuOpen(false)
              }
            />

            <div
              className="
                absolute
                right-4
                top-14
                z-20
                w-48
                overflow-hidden
                rounded-xl
                border
                border-border
                bg-popover
                p-1.5
                shadow-xl
              "
            >
              {expandable ||
              showExpand ? (
                <MenuButton
                  onClick={() => {
                    setExpanded(true);
                    setMenuOpen(false);
                  }}
                  icon={
                    <Expand className="size-3.5" />
                  }
                >
                  Expand chart
                </MenuButton>
              ) : null}

              <MenuButton
                onClick={() => {
                  toggleVisibility();
                  setMenuOpen(false);
                }}
                icon={
                  hidden ? (
                    <Eye className="size-3.5" />
                  ) : (
                    <EyeOff className="size-3.5" />
                  )
                }
              >
                {hidden
                  ? "Show chart"
                  : "Hide chart"}
              </MenuButton>

              {showDownload ? (
                <MenuButton
                  onClick={() => {
                    onDownload?.();
                    setMenuOpen(false);
                  }}
                  icon={
                    <Download className="size-3.5" />
                  }
                >
                  Download data
                </MenuButton>
              ) : null}

              {showRefresh ? (
                <MenuButton
                  onClick={() => {
                    onRefresh?.();
                    setMenuOpen(false);
                  }}
                  icon={
                    <RefreshCw className="size-3.5" />
                  }
                >
                  Refresh data
                </MenuButton>
              ) : null}
            </div>
          </>
        ) : null}
      </header>

      {/* ======================================================
         BODY
      ====================================================== */}

      <div
        className={cn(
          "relative p-4 sm:p-5",
          hidden &&
            "min-h-[190px]",
        )}
      >
        {loading ? (
          <ChartLoadingState />
        ) : hidden ? (
          <HiddenChart
            onShow={
              toggleVisibility
            }
          />
        ) : (
          <div className="relative">
            {refreshing ? (
              <div
                className="
                  pointer-events-none
                  absolute
                  right-0
                  top-0
                  z-10
                  flex
                  items-center
                  gap-1.5
                  rounded-full
                  bg-background/90
                  px-2
                  py-1
                  text-[9px]
                  font-medium
                  text-muted-foreground
                  shadow-sm
                  backdrop-blur
                "
              >
                <RefreshCw className="size-3 animate-spin" />

                Updating
              </div>
            ) : null}

            {children}
          </div>
        )}
      </div>

      {/* ======================================================
         FOOTER
      ====================================================== */}

      {footer ? (
        <footer
          className="
            border-t
            border-border/50
            px-4
            py-3

            sm:px-5
          "
        >
          {footer}
        </footer>
      ) : null}
    </section>
  );
}

/* ============================================================
   BADGE
============================================================ */

function ChartBadge({
  text,
  type = "info",
}: {
  text: string;
  type?: ChartBadgeType;
}) {
  const config = {
    live: {
      wrapper:
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400",
      dot: "bg-emerald-500",
    },

    info: {
      wrapper:
        "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-400",
      dot: "bg-sky-500",
    },

    success: {
      wrapper:
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400",
      dot: "bg-emerald-500",
    },

    warning: {
      wrapper:
        "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400",
      dot: "bg-amber-500",
    },
  }[type];

  return (
    <span
      className={cn(
        `
        inline-flex
        items-center
        gap-1.5
        rounded-full
        border
        px-2
        py-0.5
        text-[9px]
        font-bold
        uppercase
        tracking-wide
        `,
        config.wrapper,
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          config.dot,
        )}
      />

      {text}
    </span>
  );
}

/* ============================================================
   ICON BUTTON
============================================================ */

function IconButton({
  children,
  label,
  onClick,
  disabled,
  className,
}: {
  children: ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
      className={cn(
        `
        grid
        size-8
        place-items-center
        rounded-lg
        text-muted-foreground

        transition-all

        hover:bg-muted
        hover:text-foreground

        focus:outline-none
        focus:ring-2
        focus:ring-primary/20

        disabled:cursor-not-allowed
        disabled:opacity-50
        `,
        className,
      )}
    >
      {children}
    </button>
  );
}

/* ============================================================
   MENU BUTTON
============================================================ */

function MenuButton({
  children,
  icon,
  onClick,
}: {
  children: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        flex
        w-full
        items-center
        gap-2
        rounded-lg
        px-3
        py-2
        text-xs
        font-medium
        text-foreground

        transition-colors

        hover:bg-muted
      "
    >
      {icon}

      {children}
    </button>
  );
}

/* ============================================================
   HIDDEN CHART
============================================================ */

function HiddenChart({
  onShow,
}: {
  onShow: () => void;
}) {
  return (
    <div
      className="
        flex
        min-h-[180px]
        flex-col
        items-center
        justify-center
        text-center
      "
    >
      <div
        className="
          grid
          size-12
          place-items-center
          rounded-xl
          bg-muted
        "
      >
        <EyeOff className="size-5 text-muted-foreground" />
      </div>

      <p
        className="
          mt-3
          text-sm
          font-semibold
          text-foreground
        "
      >
        Chart hidden
      </p>

      <p
        className="
          mt-1
          text-xs
          text-muted-foreground
        "
      >
        Your analytics are still being
        updated.
      </p>

      <button
        type="button"
        onClick={onShow}
        className="
          mt-3
          inline-flex
          items-center
          gap-1.5
          rounded-lg
          bg-primary
          px-3
          py-1.5
          text-xs
          font-semibold
          text-primary-foreground

          transition-all

          hover:opacity-90
        "
      >
        <Eye className="size-3.5" />

        Show chart
      </button>
    </div>
  );
}

/* ============================================================
   LOADING STATE
============================================================ */

function ChartLoadingState() {
  return (
    <div
      className="
        min-h-[230px]
        animate-pulse
      "
    >
      <div
        className="
          flex
          min-h-[210px]
          flex-col
          justify-end
          gap-3
        "
      >
        <div
          className="
            flex
            h-[175px]
            items-end
            gap-2
            px-2
          "
        >
          <div className="h-[30%] flex-1 rounded-t-lg bg-muted" />

          <div className="h-[55%] flex-1 rounded-t-lg bg-muted" />

          <div className="h-[42%] flex-1 rounded-t-lg bg-muted" />

          <div className="h-[70%] flex-1 rounded-t-lg bg-muted" />

          <div className="h-[48%] flex-1 rounded-t-lg bg-muted" />

          <div className="h-[80%] flex-1 rounded-t-lg bg-muted" />

          <div className="h-[62%] flex-1 rounded-t-lg bg-muted" />
        </div>

        <div
          className="
            h-px
            w-full
            bg-muted
          "
        />

        <div
          className="
            flex
            gap-3
          "
        >
          <div className="h-3 w-12 rounded bg-muted" />

          <div className="h-3 w-14 rounded bg-muted" />

          <div className="h-3 w-12 rounded bg-muted" />

          <div className="h-3 w-14 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   CHART INSIGHT
============================================================ */

export function ChartInsight({
  children,
  type = "info",
}: {
  children: ReactNode;

  type?:
    | "info"
    | "positive"
    | "warning";
}) {
  const config = {
    info: `
      border-sky-200
      bg-sky-50
      text-sky-700
      dark:border-sky-900
      dark:bg-sky-950/20
      dark:text-sky-400
    `,

    positive: `
      border-emerald-200
      bg-emerald-50
      text-emerald-700
      dark:border-emerald-900
      dark:bg-emerald-950/20
      dark:text-emerald-400
    `,

    warning: `
      border-amber-200
      bg-amber-50
      text-amber-700
      dark:border-amber-900
      dark:bg-amber-950/20
      dark:text-amber-400
    `,
  }[type];

  return (
    <div
      className={cn(
        `
        mt-4
        flex
        items-start
        gap-2
        rounded-xl
        border
        px-3
        py-2.5
        text-xs
        leading-5
        `,
        config,
      )}
    >
      <Sparkles className="mt-0.5 size-3.5 shrink-0" />

      <span>
        {children}
      </span>
    </div>
  );
}

/* ============================================================
   CHART LEGEND
============================================================ */

export function ChartLegend({
  items,
}: {
  items: {
    label: string;

    value?: string;

    className?: string;
  }[];
}) {
  return (
    <div
      className="
        flex
        flex-wrap
        items-center
        gap-x-5
        gap-y-2
      "
    >
      {items.map(
        (item, index) => (
          <div
            key={`${item.label}-${index}`}
            className="
              flex
              items-center
              gap-2
            "
          >
            <span
              className={cn(
                "size-2.5 rounded-full",
                item.className ||
                  "bg-primary",
              )}
            />

            <span
              className="
                text-[11px]
                text-muted-foreground
              "
            >
              {item.label}
            </span>

            {item.value ? (
              <span
                className="
                  text-[11px]
                  font-bold
                  text-foreground
                "
              >
                {item.value}
              </span>
            ) : null}
          </div>
        ),
      )}
    </div>
  );
}

/* ============================================================
   CHART DATA FOOTER
============================================================ */

export function ChartDataFooter({
  left,
  center,
  right,
}: {
  left?: ReactNode;

  center?: ReactNode;

  right?: ReactNode;
}) {
  return (
    <div
      className="
        flex
        flex-col
        gap-2

        sm:flex-row
        sm:items-center
        sm:justify-between
      "
    >
      <div
        className="
          flex
          items-center
          gap-2
          text-xs
          text-muted-foreground
        "
      >
        {left}
      </div>

      <div
        className="
          flex
          items-center
          gap-2
          text-xs
          text-muted-foreground
        "
      >
        {center}
      </div>

      <div
        className="
          flex
          items-center
          gap-2
          text-xs
          font-semibold
          text-foreground
        "
      >
        {right}
      </div>
    </div>
  );
}

/* ============================================================
   LIVE CHART CARD
============================================================ */

export function LiveChartCard(
  props: ChartCardProps,
) {
  return (
    <ChartCard
      {...props}
      badgeText={
        props.badgeText ||
        "Live"
      }
      badgeType="live"
      showRefresh={
        props.showRefresh ?? true
      }
      expandable
    />
  );
}

/* ============================================================
   FARM ANALYTICS CARD
============================================================ */

export function FarmAnalyticsCard(
  props: ChartCardProps,
) {
  return (
    <ChartCard
      {...props}
      icon={
        props.icon || (
          <BarChart3 className="size-5" />
        )
      }
      badgeText={
        props.badgeText ||
        "Analytics"
      }
      badgeType={
        props.badgeType ||
        "info"
      }
      showRefresh={
        props.showRefresh ?? true
      }
      showDownload={
        props.showDownload ?? true
      }
      expandable
    />
  );
}

/* ============================================================
   PERFORMANCE CARD
============================================================ */

export function PerformanceChartCard(
  props: ChartCardProps,
) {
  return (
    <ChartCard
      {...props}
      badgeText={
        props.badgeText ||
        "Performance"
      }
      badgeType="success"
      expandable
    />
  );
}

/* ============================================================
   DEFAULT EXPORT
============================================================ */

export default ChartCard;