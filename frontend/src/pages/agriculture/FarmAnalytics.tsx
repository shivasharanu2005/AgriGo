import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Scale,
  Sprout,
  TrendingUp,
  TrendingDown,
  Droplets,
  IndianRupee,
  Leaf,
  Gauge,
  CalendarDays,
  Download,
  RefreshCw,
  Target,
  Activity,
  Award,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Filter,
  Wheat,
  CloudRain,
  Tractor,
  CircleDollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  BrainCircuit,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Table2,
} from "lucide-react";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  Area,
  AreaChart,
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell,
  ReferenceLine,
} from "recharts";

import { AgriculturePageHeader } from "@/components/agriculture/AgriculturePageHeader";
import { StatCard } from "@/components/agriculture/StatCard";
import { ChartCard } from "@/components/agriculture/ChartCard";
import { LoadingState } from "@/components/agriculture/Loadingstate";
import { EmptyState } from "@/components/agriculture/EmptyState";
import { agricultureApi } from "@/services/agricultureApi";

type SeasonData = {
  season: string;
  wheat: number;
  rice: number;
  cotton: number;
  [key: string]: string | number;
};

type CropName = "wheat" | "rice" | "cotton";

const cropLabels: Record<CropName, string> = {
  wheat: "Wheat",
  rice: "Rice",
  cotton: "Cotton",
};

const cropIcons: Record<CropName, typeof Sprout> = {
  wheat: Wheat,
  rice: Sprout,
  cotton: Leaf,
};

const chartColors = {
  wheat: "var(--chart-1)",
  rice: "var(--chart-3)",
  cotton: "var(--chart-2)",
};

const demoCostPerTon: Record<CropName, number> = {
  wheat: 18500,
  rice: 21500,
  cotton: 54000,
};

const demoPricePerTon: Record<CropName, number> = {
  wheat: 24500,
  rice: 28500,
  cotton: 68000,
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number, decimals = 1) {
  return Number(value || 0).toFixed(decimals);
}

function getPercentChange(current: number, previous: number) {
  if (!previous) return 0;

  return ((current - previous) / previous) * 100;
}

function getTrend(value: number): "up" | "down" | "neutral" {
  if (value > 0.5) return "up";
  if (value < -0.5) return "down";
  return "neutral";
}

export default function FarmAnalytics() {
  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["yield-history"],
    queryFn: agricultureApi.getYieldHistory,
  });

  const [selectedCrop, setSelectedCrop] =
    useState<CropName | "all">("all");

  const [selectedPeriod, setSelectedPeriod] =
    useState<"all" | "recent" | "year">("all");

  const [activeChart, setActiveChart] = useState<
    "yield" | "output" | "profit" | "efficiency"
  >("yield");

  const [showTable, setShowTable] = useState(false);

  const [showInsights, setShowInsights] = useState(true);

  const seasons = useMemo(() => {
    if (!Array.isArray(data)) return [];

    return data as SeasonData[];
  }, [data]);

  const filteredData = useMemo(() => {
    if (selectedPeriod === "all") {
      return seasons;
    }

    if (selectedPeriod === "recent") {
      return seasons.slice(-3);
    }

    return seasons.slice(-1);
  }, [seasons, selectedPeriod]);

  const latest = seasons[seasons.length - 1];

  const previous =
    seasons.length > 1
      ? seasons[seasons.length - 2]
      : undefined;

  const cropStats = useMemo(() => {
    const crops: CropName[] = [
      "wheat",
      "rice",
      "cotton",
    ];

    return crops.map((crop) => {
      const values = seasons.map((item) =>
        Number(item[crop] || 0)
      );

      const latestValue =
        values[values.length - 1] || 0;

      const previousValue =
        values[values.length - 2] || 0;

      const average =
        values.length > 0
          ? values.reduce(
              (sum, value) => sum + value,
              0
            ) / values.length
          : 0;

      const highest =
        values.length > 0
          ? Math.max(...values)
          : 0;

      const change = getPercentChange(
        latestValue,
        previousValue
      );

      const estimatedRevenue =
        latestValue * demoPricePerTon[crop];

      const estimatedCost =
        latestValue * demoCostPerTon[crop];

      const estimatedProfit =
        estimatedRevenue - estimatedCost;

      return {
        crop,
        label: cropLabels[crop],
        latest: latestValue,
        previous: previousValue,
        average,
        highest,
        change,
        revenue: estimatedRevenue,
        cost: estimatedCost,
        profit: estimatedProfit,
        margin:
          estimatedRevenue > 0
            ? (estimatedProfit /
                estimatedRevenue) *
              100
            : 0,
      };
    });
  }, [seasons]);

  const selectedCropStats = useMemo(() => {
    if (selectedCrop === "all") {
      return cropStats;
    }

    return cropStats.filter(
      (item) => item.crop === selectedCrop
    );
  }, [cropStats, selectedCrop]);

  const totalLatestYield = useMemo(() => {
    if (!latest) return 0;

    return (
      Number(latest.wheat || 0) +
      Number(latest.rice || 0) +
      Number(latest.cotton || 0)
    );
  }, [latest]);

  const totalPreviousYield = useMemo(() => {
    if (!previous) return 0;

    return (
      Number(previous.wheat || 0) +
      Number(previous.rice || 0) +
      Number(previous.cotton || 0)
    );
  }, [previous]);

  const totalYieldChange = getPercentChange(
    totalLatestYield,
    totalPreviousYield
  );

  const estimatedRevenue = useMemo(() => {
    return selectedCropStats.reduce(
      (sum, crop) => sum + crop.revenue,
      0
    );
  }, [selectedCropStats]);

  const estimatedCost = useMemo(() => {
    return selectedCropStats.reduce(
      (sum, crop) => sum + crop.cost,
      0
    );
  }, [selectedCropStats]);

  const estimatedProfit =
    estimatedRevenue - estimatedCost;

  const profitMargin =
    estimatedRevenue > 0
      ? (estimatedProfit /
          estimatedRevenue) *
        100
      : 0;

  const averageYield = useMemo(() => {
    if (!filteredData.length) return 0;

    const totals = filteredData.map(
      (item) =>
        Number(item.wheat || 0) +
        Number(item.rice || 0) +
        Number(item.cotton || 0)
    );

    return (
      totals.reduce(
        (sum, value) => sum + value,
        0
      ) / totals.length
    );
  }, [filteredData]);

  const chartData = useMemo(() => {
    return filteredData.map((item) => ({
      season: item.season,
      wheat: Number(item.wheat || 0),
      rice: Number(item.rice || 0),
      cotton: Number(item.cotton || 0),
      total:
        Number(item.wheat || 0) +
        Number(item.rice || 0) +
        Number(item.cotton || 0),
      revenue:
        Number(item.wheat || 0) *
          demoPricePerTon.wheat +
        Number(item.rice || 0) *
          demoPricePerTon.rice +
        Number(item.cotton || 0) *
          demoPricePerTon.cotton,
      profit:
        Number(item.wheat || 0) *
          (demoPricePerTon.wheat -
            demoCostPerTon.wheat) +
        Number(item.rice || 0) *
          (demoPricePerTon.rice -
            demoCostPerTon.rice) +
        Number(item.cotton || 0) *
          (demoPricePerTon.cotton -
            demoCostPerTon.cotton),
    }));
  }, [filteredData]);

  const cropDistribution = useMemo(() => {
    return cropStats.map((item) => ({
      name: item.label,
      value: item.latest,
      crop: item.crop,
    }));
  }, [cropStats]);

  const bestCrop = useMemo(() => {
    if (!cropStats.length) return null;

    return [...cropStats].sort(
      (a, b) => b.profit - a.profit
    )[0];
  }, [cropStats]);

  const highestYieldCrop = useMemo(() => {
    if (!cropStats.length) return null;

    return [...cropStats].sort(
      (a, b) => b.latest - a.latest
    )[0];
  }, [cropStats]);

  const productivityScore = useMemo(() => {
    if (!cropStats.length) return 0;

    const positiveChanges = cropStats.filter(
      (crop) => crop.change >= 0
    ).length;

    const baseScore =
      (positiveChanges / cropStats.length) * 70;

    const consistency =
      averageYield > 0 ? 20 : 0;

    const dataCompleteness =
      seasons.length >= 3 ? 10 : 5;

    return Math.min(
      100,
      Math.round(
        baseScore +
          consistency +
          dataCompleteness
      )
    );
  }, [cropStats, averageYield, seasons.length]);

  const insights = useMemo(() => {
    const result: {
      type: "positive" | "warning" | "info";
      title: string;
      description: string;
      icon: typeof CheckCircle2;
    }[] = [];

    if (bestCrop) {
      result.push({
        type: "positive",
        title: `${bestCrop.label} is your strongest performer`,
        description: `Estimated latest-season profit is ${formatCurrency(
          bestCrop.profit
        )} with an estimated ${formatNumber(
          bestCrop.margin
        )}% margin.`,
        icon: CheckCircle2,
      });
    }

    if (highestYieldCrop) {
      result.push({
        type: "info",
        title: `${highestYieldCrop.label} leads production`,
        description: `Latest recorded yield is ${formatNumber(
          highestYieldCrop.latest
        )} tonnes per hectare.`,
        icon: TrendingUp,
      });
    }

    const decliningCrop = cropStats.find(
      (crop) => crop.change < -5
    );

    if (decliningCrop) {
      result.push({
        type: "warning",
        title: `${decliningCrop.label} needs attention`,
        description: `Yield is down ${Math.abs(
          decliningCrop.change
        ).toFixed(
          1
        )}% compared with the previous season. Review pest, weather, irrigation and input records.`,
        icon: AlertTriangle,
      });
    }

    if (totalYieldChange > 5) {
      result.push({
        type: "positive",
        title: "Farm productivity is improving",
        description: `Combined recorded yield increased ${totalYieldChange.toFixed(
          1
        )}% compared with the previous season.`,
        icon: Award,
      });
    }

    if (totalYieldChange < -5) {
      result.push({
        type: "warning",
        title: "Overall production has declined",
        description: `Combined yield decreased ${Math.abs(
          totalYieldChange
        ).toFixed(
          1
        )}%. Investigate crop-specific causes before the next season.`,
        icon: AlertTriangle,
      });
    }

    return result;
  }, [
    bestCrop,
    highestYieldCrop,
    cropStats,
    totalYieldChange,
  ]);

  const exportCSV = () => {
    if (!seasons.length) return;

    const headers = [
      "Season",
      "Wheat (t/ha)",
      "Rice (t/ha)",
      "Cotton (t/ha)",
      "Total (t/ha)",
    ];

    const rows = seasons.map((item) => [
      item.season,
      item.wheat,
      item.rice,
      item.cotton,
      (
        Number(item.wheat || 0) +
        Number(item.rice || 0) +
        Number(item.cotton || 0)
      ).toFixed(2),
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "farm-analytics.csv";
    anchor.click();

    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="farm-analytics-page">
        <style>{analyticsStyles}</style>

        <div className="analytics-shell">
          <AgriculturePageHeader
            icon={BarChart3}
            title="Farm Analytics"
            description="Understand yield, productivity, profitability and long-term farm performance."
          />

          <LoadingState rows={5} />
        </div>
      </div>
    );
  }

  if (!seasons.length) {
    return (
      <div className="farm-analytics-page">
        <style>{analyticsStyles}</style>

        <div className="analytics-shell">
          <AgriculturePageHeader
            icon={BarChart3}
            title="Farm Analytics"
            description="Turn your harvest records into practical farm intelligence."
          />

          <div className="analytics-empty">
            <EmptyState
              title="No season data yet"
              description="Record your first harvest to start building your farm performance history."
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="farm-analytics-page">
      <style>{analyticsStyles}</style>

      <div className="analytics-shell">

        {/* HEADER */}

        <AgriculturePageHeader
          icon={BarChart3}
          title="Farm Analytics"
          description="Turn your harvest records into actionable intelligence. Compare seasons, identify high-performing crops, understand profitability and detect areas that need attention."
          actions={[
            <Button
              key="refresh"
              size="sm"
              variant="outline"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw
                className={`mr-2 size-3.5 ${
                  isFetching
                    ? "animate-spin"
                    : ""
                }`}
              />
              Refresh
            </Button>,

            <Button
              key="export"
              size="sm"
              variant="outline"
              onClick={exportCSV}
            >
              <Download className="mr-2 size-3.5" />
              Export CSV
            </Button>,
          ]}
        />

        {/* HERO ANALYTICS PANEL */}

        <section className="analytics-hero">

          <div className="hero-background-circle circle-one" />
          <div className="hero-background-circle circle-two" />

          <div className="hero-content">

            <div className="hero-badge">
              <Activity size={13} />
              FARM PERFORMANCE
            </div>

            <h1>
              Your farm is performing{" "}
              <span>
                {productivityScore >= 70
                  ? "strongly"
                  : productivityScore >= 45
                  ? "steadily"
                  : "below target"}
              </span>
            </h1>

            <p>
              Based on your recorded harvest
              history, crop productivity and
              season-over-season changes.
            </p>

            <div className="hero-mini-grid">

              <div>
                <span>Latest output</span>
                <strong>
                  {formatNumber(
                    totalLatestYield
                  )}{" "}
                  t/ha
                </strong>
              </div>

              <div>
                <span>Season change</span>
                <strong
                  className={
                    totalYieldChange >= 0
                      ? "hero-positive"
                      : "hero-negative"
                  }
                >
                  {totalYieldChange >= 0
                    ? "+"
                    : ""}
                  {totalYieldChange.toFixed(1)}%
                </strong>
              </div>

              <div>
                <span>Performance score</span>
                <strong>
                  {productivityScore}/100
                </strong>
              </div>

            </div>

          </div>

          <div className="hero-score">

            <div className="score-ring">
              <div>
                <strong>
                  {productivityScore}
                </strong>
                <span>Score</span>
              </div>
            </div>

            <span>
              Farm Health Index
            </span>

          </div>

        </section>

        {/* FILTERS */}

        <section className="analytics-toolbar">

          <div className="toolbar-left">

            <div className="toolbar-label">
              <Filter size={13} />
              Analyze
            </div>

            <select
              value={selectedCrop}
              onChange={(event) =>
                setSelectedCrop(
                  event.target.value as
                    | CropName
                    | "all"
                )
              }
              className="analytics-select"
            >
              <option value="all">
                All crops
              </option>

              <option value="wheat">
                Wheat
              </option>

              <option value="rice">
                Rice
              </option>

              <option value="cotton">
                Cotton
              </option>
            </select>

            <select
              value={selectedPeriod}
              onChange={(event) =>
                setSelectedPeriod(
                  event.target.value as
                    | "all"
                    | "recent"
                    | "year"
                )
              }
              className="analytics-select"
            >
              <option value="all">
                All seasons
              </option>

              <option value="recent">
                Last 3 seasons
              </option>

              <option value="year">
                Latest season
              </option>
            </select>

          </div>

          <div className="toolbar-right">

            <button
              className={`analytics-view-button ${
                showTable ? "active" : ""
              }`}
              onClick={() =>
                setShowTable(
                  (current) => !current
                )
              }
            >
              <Table2 size={14} />
              Table
            </button>

          </div>

        </section>

        {/* KPI CARDS */}

        <section className="analytics-kpis">

          <div className="analytics-kpi">
            <div className="kpi-icon green">
              <Sprout size={19} />
            </div>

            <div className="kpi-content">
              <span>Total yield</span>

              <strong>
                {formatNumber(
                  totalLatestYield
                )}{" "}
                t/ha
              </strong>

              <small
                className={
                  totalYieldChange >= 0
                    ? "positive"
                    : "negative"
                }
              >
                {totalYieldChange >= 0 ? (
                  <ArrowUpRight size={12} />
                ) : (
                  <ArrowDownRight size={12} />
                )}

                {Math.abs(
                  totalYieldChange
                ).toFixed(1)}
                % vs previous
              </small>
            </div>
          </div>

          <div className="analytics-kpi">
            <div className="kpi-icon blue">
              <CircleDollarSign size={19} />
            </div>

            <div className="kpi-content">
              <span>Estimated revenue</span>

              <strong>
                {formatCurrency(
                  estimatedRevenue
                )}
              </strong>

              <small>
                Based on indicative crop
                prices
              </small>
            </div>
          </div>

          <div className="analytics-kpi">
            <div className="kpi-icon orange">
              <IndianRupee size={19} />
            </div>

            <div className="kpi-content">
              <span>Estimated profit</span>

              <strong>
                {formatCurrency(
                  estimatedProfit
                )}
              </strong>

              <small
                className={
                  profitMargin >= 20
                    ? "positive"
                    : "negative"
                }
              >
                {formatNumber(
                  profitMargin
                )}% margin
              </small>
            </div>
          </div>

          <div className="analytics-kpi">
            <div className="kpi-icon purple">
              <Gauge size={19} />
            </div>

            <div className="kpi-content">
              <span>Average output</span>

              <strong>
                {formatNumber(
                  averageYield
                )}{" "}
                t/ha
              </strong>

              <small>
                Across selected seasons
              </small>
            </div>
          </div>

        </section>

        {/* CROP PERFORMANCE */}

        <section className="crop-performance-grid">

          {cropStats.map((crop) => {
            const Icon =
              cropIcons[crop.crop];

            return (
              <article
                key={crop.crop}
                className={`crop-performance-card ${
                  selectedCrop === crop.crop
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setSelectedCrop(crop.crop)
                }
              >

                <div className="crop-card-header">

                  <div className="crop-icon">
                    <Icon size={18} />
                  </div>

                  <div>
                    <strong>
                      {crop.label}
                    </strong>

                    <span>
                      Latest season
                    </span>
                  </div>

                  <button
                    className="crop-menu"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedCrop(
                        crop.crop
                      );
                    }}
                  >
                    <ChevronDown size={15} />
                  </button>

                </div>

                <div className="crop-main-value">
                  {formatNumber(
                    crop.latest
                  )}
                  <span>t/ha</span>
                </div>

                <div
                  className={`crop-change ${
                    crop.change >= 0
                      ? "positive"
                      : "negative"
                  }`}
                >
                  {crop.change >= 0 ? (
                    <TrendingUp size={13} />
                  ) : (
                    <TrendingDown size={13} />
                  )}

                  {crop.change >= 0
                    ? "+"
                    : ""}
                  {crop.change.toFixed(1)}%
                </div>

                <div className="crop-details">

                  <div>
                    <span>Average</span>
                    <strong>
                      {formatNumber(
                        crop.average
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Best</span>
                    <strong>
                      {formatNumber(
                        crop.highest
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Margin</span>
                    <strong>
                      {formatNumber(
                        crop.margin
                      )}%
                    </strong>
                  </div>

                </div>

                <div className="crop-progress">
                  <div
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          4,
                          (crop.latest /
                            Math.max(
                              crop.highest,
                              1
                            )) *
                            100
                        )
                      )}%`,
                    }}
                  />
                </div>

              </article>
            );
          })}

        </section>

        {/* INSIGHTS */}

        {showInsights && (
          <section className="insights-panel">

            <div className="insights-header">

              <div className="insights-title">

                <div className="insights-ai-icon">
                  <BrainCircuit size={18} />
                </div>

                <div>
                  <h2>
                    Farm Intelligence
                  </h2>

                  <p>
                    Automatic observations
                    from your recorded data
                  </p>
                </div>

              </div>

              <button
                onClick={() =>
                  setShowInsights(false)
                }
                className="insights-close"
              >
                Hide
              </button>

            </div>

            <div className="insights-grid">

              {insights.map(
                (insight, index) => {
                  const Icon = insight.icon;

                  return (
                    <div
                      key={`${insight.title}-${index}`}
                      className={`insight-card ${insight.type}`}
                    >

                      <div className="insight-icon">
                        <Icon size={16} />
                      </div>

                      <div>
                        <strong>
                          {insight.title}
                        </strong>

                        <p>
                          {insight.description}
                        </p>
                      </div>

                    </div>
                  );
                }
              )}

            </div>

          </section>
        )}

        {/* CHART NAVIGATION */}

        <section className="chart-navigation">

          <button
            className={
              activeChart === "yield"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveChart("yield")
            }
          >
            <LineChartIcon size={15} />
            Yield trend
          </button>

          <button
            className={
              activeChart === "output"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveChart("output")
            }
          >
            <AreaChartIcon />
            Total output
          </button>

          <button
            className={
              activeChart === "profit"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveChart("profit")
            }
          >
            <CircleDollarSign size={15} />
            Profit trend
          </button>

          <button
            className={
              activeChart === "efficiency"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveChart("efficiency")
            }
          >
            <Gauge size={15} />
            Efficiency
          </button>

        </section>

        {/* MAIN CHART */}

        <ChartCard
          title={
            activeChart === "yield"
              ? "Yield by season"
              : activeChart === "output"
              ? "Total farm output"
              : activeChart === "profit"
              ? "Estimated profit trend"
              : "Farm efficiency trend"
          }
          description={
            activeChart === "yield"
              ? "Compare crop productivity across recorded seasons."
              : activeChart === "output"
              ? "Combined crop output across your farm history."
              : activeChart === "profit"
              ? "Indicative profit trend using estimated crop prices and production costs."
              : "Relative productivity score derived from your recorded crop performance."
          }
        >

          <div className="analytics-chart">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              {activeChart ===
              "yield" ? (
                <LineChart
                  data={chartData}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="season"
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                  />

                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                  />

                  <Tooltip
                    contentStyle={{
                      background:
                        "var(--popover)",
                      border:
                        "1px solid var(--border)",
                      borderRadius: 12,
                    }}
                  />

                  <Legend />

                  {(selectedCrop ===
                    "all" ||
                    selectedCrop ===
                      "wheat") && (
                    <Line
                      type="monotone"
                      dataKey="wheat"
                      name="Wheat"
                      stroke={
                        chartColors.wheat
                      }
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                    />
                  )}

                  {(selectedCrop ===
                    "all" ||
                    selectedCrop ===
                      "rice") && (
                    <Line
                      type="monotone"
                      dataKey="rice"
                      name="Rice"
                      stroke={
                        chartColors.rice
                      }
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                    />
                  )}

                  {(selectedCrop ===
                    "all" ||
                    selectedCrop ===
                      "cotton") && (
                    <Line
                      type="monotone"
                      dataKey="cotton"
                      name="Cotton"
                      stroke={
                        chartColors.cotton
                      }
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                    />
                  )}

                </LineChart>
              ) : activeChart ===
                "output" ? (
                <AreaChart
                  data={chartData}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="season"
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                  />

                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                  />

                  <Tooltip
                    contentStyle={{
                      background:
                        "var(--popover)",
                      border:
                        "1px solid var(--border)",
                      borderRadius: 12,
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="total"
                    name="Total output"
                    stroke="var(--chart-1)"
                    fill="var(--chart-1)"
                    fillOpacity={0.18}
                    strokeWidth={2.5}
                  />

                </AreaChart>
              ) : activeChart ===
                "profit" ? (
                <BarChart
                  data={chartData}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="season"
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                  />

                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                  />

                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(
                        Number(value)
                      )
                    }
                    contentStyle={{
                      background:
                        "var(--popover)",
                      border:
                        "1px solid var(--border)",
                      borderRadius: 12,
                    }}
                  />

                  <Bar
                    dataKey="profit"
                    name="Estimated profit"
                    fill="var(--chart-1)"
                    radius={[
                      6, 6, 0, 0,
                    ]}
                  />

                </BarChart>
              ) : (
                <LineChart
                  data={chartData.map(
                    (item) => ({
                      ...item,
                      efficiency:
                        averageYield > 0
                          ? (item.total /
                              averageYield) *
                            100
                          : 0,
                    })
                  )}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="season"
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                  />

                  <YAxis
                    domain={[0, "auto"]}
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickFormatter={(value) =>
                      `${value}%`
                    }
                  />

                  <Tooltip
                    formatter={(value) =>
                      `${Number(
                        value
                      ).toFixed(1)}%`
                    }
                    contentStyle={{
                      background:
                        "var(--popover)",
                      border:
                        "1px solid var(--border)",
                      borderRadius: 12,
                    }}
                  />

                  <ReferenceLine
                    y={100}
                    stroke="var(--border)"
                    strokeDasharray="5 5"
                  />

                  <Line
                    type="monotone"
                    dataKey="efficiency"
                    name="Efficiency"
                    stroke="var(--chart-3)"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                  />

                </LineChart>
              )}

            </ResponsiveContainer>

          </div>

        </ChartCard>

        {/* SECONDARY ANALYTICS */}

        <section className="secondary-grid">

          {/* CROP DISTRIBUTION */}

          <ChartCard
            title="Current crop contribution"
            description="Relative contribution of each crop to latest recorded output."
          >

            <div className="pie-container">

              <ResponsiveContainer
                width="55%"
                height="100%"
              >
                <PieChart>

                  <Pie
                    data={cropDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={82}
                    innerRadius={50}
                    paddingAngle={3}
                  >
                    {cropDistribution.map(
                      (entry, index) => (
                        <Cell
                          key={entry.crop}
                          fill={
                            [
                              "var(--chart-1)",
                              "var(--chart-3)",
                              "var(--chart-2)",
                            ][index % 3]
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip />

                </PieChart>
              </ResponsiveContainer>

              <div className="pie-legend">

                {cropStats.map(
                  (crop, index) => (
                    <div
                      key={crop.crop}
                      className="pie-legend-row"
                    >

                      <span>
                        <i
                          style={{
                            background:
                              [
                                "var(--chart-1)",
                                "var(--chart-3)",
                                "var(--chart-2)",
                              ][
                                index % 3
                              ],
                          }}
                        />
                        {crop.label}
                      </span>

                      <strong>
                        {formatNumber(
                          crop.latest
                        )}{" "}
                        t
                      </strong>

                    </div>
                  )
                )}

              </div>

            </div>

          </ChartCard>

          {/* PROFITABILITY */}

          <ChartCard
            title="Crop profitability"
            description="Estimated revenue, cost and profit for the latest season."
          >

            <div className="profitability-list">

              {cropStats.map(
                (crop) => (
                  <div
                    className="profit-row"
                    key={crop.crop}
                  >

                    <div className="profit-row-top">

                      <span>
                        {crop.label}
                      </span>

                      <strong>
                        {formatCurrency(
                          crop.profit
                        )}
                      </strong>

                    </div>

                    <div className="profit-bar">

                      <div
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(
                              3,
                              crop.margin
                            )
                          )}%`,
                        }}
                      />

                    </div>

                    <div className="profit-row-bottom">
                      <span>
                        Revenue{" "}
                        {formatCurrency(
                          crop.revenue
                        )}
                      </span>

                      <span>
                        Margin{" "}
                        {formatNumber(
                          crop.margin
                        )}
                        %
                      </span>
                    </div>

                  </div>
                )
              )}

            </div>

          </ChartCard>

        </section>

        {/* OPERATIONAL HEALTH */}

        <section className="operational-section">

          <div className="operational-header">

            <div>
              <h2>
                Farm Operations Snapshot
              </h2>

              <p>
                Key areas that influence
                yield and profitability.
              </p>
            </div>

            <Activity size={20} />

          </div>

          <div className="operations-grid">

            <div className="operation-card">

              <div className="operation-icon">
                <Droplets size={18} />
              </div>

              <div>
                <span>
                  Water efficiency
                </span>

                <strong>
                  82%
                </strong>

                <small>
                  Good irrigation efficiency
                </small>
              </div>

              <div className="operation-status good">
                Good
              </div>

            </div>

            <div className="operation-card">

              <div className="operation-icon">
                <Leaf size={18} />
              </div>

              <div>
                <span>
                  Soil productivity
                </span>

                <strong>
                  76%
                </strong>

                <small>
                  Nutrient management required
                </small>
              </div>

              <div className="operation-status good">
                Stable
              </div>

            </div>

            <div className="operation-card">

              <div className="operation-icon">
                <CloudRain size={18} />
              </div>

              <div>
                <span>
                  Weather risk
                </span>

                <strong>
                  Medium
                </strong>

                <small>
                  Monitor rainfall windows
                </small>
              </div>

              <div className="operation-status warning">
                Watch
              </div>

            </div>

            <div className="operation-card">

              <div className="operation-icon">
                <Tractor size={18} />
              </div>

              <div>
                <span>
                  Farm activity
                </span>

                <strong>
                  91%
                </strong>

                <small>
                  Planned operations completed
                </small>
              </div>

              <div className="operation-status good">
                Strong
              </div>

            </div>

          </div>

        </section>

        {/* TABLE */}

        {showTable && (
          <section className="analytics-table-section">

            <div className="table-header">

              <div>
                <h2>
                  Season-by-season records
                </h2>

                <p>
                  Detailed yield history from
                  your farm records.
                </p>
              </div>

              <Table2 size={20} />

            </div>

            <div className="table-wrapper">

              <table>

                <thead>
                  <tr>
                    <th>Season</th>
                    <th>Wheat</th>
                    <th>Rice</th>
                    <th>Cotton</th>
                    <th>Total</th>
                  </tr>
                </thead>

                <tbody>

                  {seasons.map(
                    (item) => {
                      const total =
                        Number(
                          item.wheat ||
                            0
                        ) +
                        Number(
                          item.rice ||
                            0
                        ) +
                        Number(
                          item.cotton ||
                            0
                        );

                      return (
                        <tr
                          key={item.season}
                        >
                          <td>
                            <strong>
                              {
                                item.season
                              }
                            </strong>
                          </td>

                          <td>
                            {
                              item.wheat
                            }{" "}
                            t/ha
                          </td>

                          <td>
                            {
                              item.rice
                            }{" "}
                            t/ha
                          </td>

                          <td>
                            {
                              item.cotton
                            }{" "}
                            t/ha
                          </td>

                          <td>
                            <strong>
                              {formatNumber(
                                total
                              )}{" "}
                              t/ha
                            </strong>
                          </td>
                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          </section>
        )}

        {/* RECOMMENDED ACTIONS */}

        <section className="actions-panel">

          <div className="actions-heading">

            <div className="action-heading-icon">
              <Zap size={18} />
            </div>

            <div>
              <h2>
                Recommended next actions
              </h2>

              <p>
                Use your analytics to improve
                the next farm cycle.
              </p>
            </div>

          </div>

          <div className="recommendation-grid">

            <div className="recommendation">
              <div>
                <Target size={17} />
              </div>

              <section>
                <strong>
                  Set crop yield targets
                </strong>

                <p>
                  Create a target for each crop
                  and compare it with your actual
                  harvest.
                </p>
              </section>

              <ArrowUpRight size={15} />
            </div>

            <div className="recommendation">
              <div>
                <Droplets size={17} />
              </div>

              <section>
                <strong>
                  Review irrigation efficiency
                </strong>

                <p>
                  Compare water usage with yield
                  to identify opportunities to
                  reduce water waste.
                </p>
              </section>

              <ArrowUpRight size={15} />
            </div>

            <div className="recommendation">
              <div>
                <IndianRupee size={17} />
              </div>

              <section>
                <strong>
                  Compare crop profitability
                </strong>

                <p>
                  Use actual input costs and
                  selling prices before deciding
                  your next crop mix.
                </p>
              </section>

              <ArrowUpRight size={15} />
            </div>

          </div>

        </section>

        {/* FOOTNOTE */}

        <div className="analytics-disclaimer">
          <Activity size={12} />

          <span>
            Analytics marked as estimated use
            indicative assumptions. Replace
            them with your actual farm costs,
            selling prices, water usage and
            operational records when connected
            to your production database.
          </span>

        </div>

      </div>
    </div>
  );
}

function AreaChartIcon() {
  return <Activity size={15} />;
}

const analyticsStyles = `
  .farm-analytics-page {
    min-height: 100vh;
    padding: 24px;
    background:
      radial-gradient(
        circle at 5% 0%,
        rgba(80, 160, 94, 0.12),
        transparent 25%
      ),
      linear-gradient(
        135deg,
        #f5faf6 0%,
        #eef7f1 48%,
        #fbfcf8 100%
      );
  }

  .analytics-shell {
    width: 100%;
    max-width: 1500px;
    margin: 0 auto;
  }

  .analytics-hero {
    position: relative;
    overflow: hidden;
    display: flex;
    justify-content: space-between;
    gap: 30px;
    min-height: 265px;
    margin-top: 20px;
    padding: 32px;
    border-radius: 26px;
    color: white;
    background:
      linear-gradient(
        120deg,
        #12482f 0%,
        #216844 48%,
        #4d8750 100%
      );
    box-shadow:
      0 22px 55px rgba(22, 72, 43, 0.18);
  }

  .hero-background-circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255,255,255,.07);
  }

  .circle-one {
    width: 300px;
    height: 300px;
    right: 120px;
    top: -170px;
  }

  .circle-two {
    width: 210px;
    height: 210px;
    right: -80px;
    bottom: -100px;
  }

  .hero-content {
    position: relative;
    z-index: 2;
    max-width: 760px;
  }

  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 7px 11px;
    border: 1px solid rgba(255,255,255,.18);
    border-radius: 30px;
    background: rgba(255,255,255,.1);
    font-size: 9px;
    font-weight: 900;
    letter-spacing: 1px;
  }

  .hero-content h1 {
    margin: 17px 0 8px;
    font-size: clamp(28px, 4vw, 43px);
    line-height: 1.08;
    font-weight: 950;
    letter-spacing: -1.4px;
  }

  .hero-content h1 span {
    color: #bfe99e;
  }

  .hero-content p {
    max-width: 620px;
    margin: 0;
    color: rgba(255,255,255,.76);
    font-size: 13px;
    line-height: 1.7;
  }

  .hero-mini-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 25px;
  }

  .hero-mini-grid > div {
    min-width: 130px;
    padding: 10px 13px;
    border: 1px solid rgba(255,255,255,.12);
    border-radius: 12px;
    background: rgba(255,255,255,.08);
  }

  .hero-mini-grid span {
    display: block;
    color: rgba(255,255,255,.63);
    font-size: 9px;
  }

  .hero-mini-grid strong {
    display: block;
    margin-top: 4px;
    font-size: 17px;
    font-weight: 900;
  }

  .hero-positive {
    color: #bff3a8;
  }

  .hero-negative {
    color: #ffb2a8;
  }

  .hero-score {
    position: relative;
    z-index: 2;
    width: 205px;
    flex: none;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .score-ring {
    width: 142px;
    height: 142px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background:
      conic-gradient(
        #b5e68e 0deg,
        #b5e68e 72%,
        rgba(255,255,255,.12) 72%,
        rgba(255,255,255,.12) 100%
      );
    position: relative;
  }

  .score-ring::before {
    content: "";
    position: absolute;
    inset: 9px;
    border-radius: 50%;
    background: #1d5e3e;
  }

  .score-ring > div {
    position: relative;
    z-index: 2;
    text-align: center;
  }

  .score-ring strong {
    display: block;
    font-size: 33px;
    font-weight: 950;
  }

  .score-ring span {
    font-size: 9px;
    color: rgba(255,255,255,.65);
  }

  .hero-score > span {
    margin-top: 11px;
    color: rgba(255,255,255,.7);
    font-size: 10px;
    font-weight: 750;
  }

  .analytics-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 17px;
    padding: 12px;
    background: white;
    border: 1px solid #dce9df;
    border-radius: 17px;
    box-shadow:
      0 7px 22px rgba(27, 70, 44, .045);
  }

  .toolbar-left,
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .toolbar-label {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 0 5px;
    color: #687b70;
    font-size: 10px;
    font-weight: 850;
    text-transform: uppercase;
  }

  .analytics-select {
    height: 38px;
    min-width: 135px;
    padding: 0 11px;
    border: 1px solid #dce9df;
    border-radius: 10px;
    outline: none;
    background: #fbfdfb;
    color: #385648;
    font-size: 11px;
    font-weight: 750;
  }

  .analytics-view-button {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 38px;
    padding: 0 11px;
    border: 1px solid #dce9df;
    border-radius: 10px;
    background: white;
    color: #61736a;
    font-size: 10px;
    font-weight: 800;
    cursor: pointer;
  }

  .analytics-view-button.active {
    background: #edf7ef;
    color: #1f6b45;
    border-color: #bdd8c3;
  }

  .analytics-kpis {
    display: grid;
    grid-template-columns:
      repeat(4, minmax(0, 1fr));
    gap: 13px;
    margin-top: 17px;
  }

  .analytics-kpi {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 105px;
    padding: 17px;
    border: 1px solid #dce9df;
    border-radius: 18px;
    background: rgba(255,255,255,.95);
    box-shadow:
      0 7px 24px rgba(27,70,44,.045);
    transition: transform 180ms ease;
  }

  .analytics-kpi:hover {
    transform: translateY(-3px);
  }

  .kpi-icon {
    width: 42px;
    height: 42px;
    flex: none;
    display: grid;
    place-items: center;
    border-radius: 12px;
  }

  .kpi-icon.green {
    background: #eaf7ed;
    color: #267347;
  }

  .kpi-icon.blue {
    background: #eaf4fb;
    color: #35739a;
  }

  .kpi-icon.orange {
    background: #fff4e8;
    color: #ba7228;
  }

  .kpi-icon.purple {
    background: #f1edfb;
    color: #7055a0;
  }

  .kpi-content span {
    display: block;
    color: #75847b;
    font-size: 9px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .5px;
  }

  .kpi-content strong {
    display: block;
    margin-top: 4px;
    color: #183a2b;
    font-size: 20px;
    font-weight: 950;
  }

  .kpi-content small {
    display: flex;
    align-items: center;
    gap: 3px;
    margin-top: 3px;
    color: #849188;
    font-size: 9px;
  }

  .positive {
    color: #24804b !important;
  }

  .negative {
    color: #c25248 !important;
  }

  .crop-performance-grid {
    display: grid;
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
    gap: 14px;
    margin-top: 17px;
  }

  .crop-performance-card {
    padding: 18px;
    border: 1px solid #dce9df;
    border-radius: 19px;
    background: white;
    cursor: pointer;
    box-shadow:
      0 7px 24px rgba(27,70,44,.045);
    transition:
      transform 180ms ease,
      border-color 180ms ease,
      box-shadow 180ms ease;
  }

  .crop-performance-card:hover,
  .crop-performance-card.selected {
    transform: translateY(-3px);
    border-color: #9fc7a8;
    box-shadow:
      0 14px 32px rgba(27,70,44,.09);
  }

  .crop-card-header {
    display: flex;
    align-items: center;
    gap: 9px;
  }

  .crop-icon {
    width: 36px;
    height: 36px;
    display: grid;
    place-items: center;
    border-radius: 10px;
    background: #edf7ef;
    color: #28734a;
  }

  .crop-card-header strong {
    display: block;
    color: #234636;
    font-size: 12px;
    font-weight: 900;
  }

  .crop-card-header span {
    display: block;
    margin-top: 2px;
    color: #849188;
    font-size: 9px;
  }

  .crop-menu {
    margin-left: auto;
    width: 29px;
    height: 29px;
    display: grid;
    place-items: center;
    border: 1px solid #e2ebe4;
    border-radius: 8px;
    background: white;
    color: #718178;
    cursor: pointer;
  }

  .crop-main-value {
    margin-top: 18px;
    color: #183a2b;
    font-size: 30px;
    font-weight: 950;
  }

  .crop-main-value span {
    margin-left: 4px;
    color: #829087;
    font-size: 10px;
    font-weight: 700;
  }

  .crop-change {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 2px;
    font-size: 10px;
    font-weight: 850;
  }

  .crop-details {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    margin-top: 18px;
  }

  .crop-details div {
    padding: 8px;
    border-radius: 9px;
    background: #f6f9f6;
  }

  .crop-details span {
    display: block;
    color: #859289;
    font-size: 8px;
  }

  .crop-details strong {
    display: block;
    margin-top: 3px;
    color: #375548;
    font-size: 11px;
  }

  .crop-progress {
    height: 5px;
    margin-top: 13px;
    overflow: hidden;
    border-radius: 20px;
    background: #e9efea;
  }

  .crop-progress > div {
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(
      90deg,
      #39845a,
      #91bf66
    );
  }

  .insights-panel {
    margin-top: 17px;
    padding: 18px;
    border: 1px solid #d9e8dc;
    border-radius: 20px;
    background:
      linear-gradient(
        135deg,
        #f4faf5,
        #ffffff
      );
  }

  .insights-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
  }

  .insights-title {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .insights-ai-icon {
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    border-radius: 11px;
    background: #e6f4e9;
    color: #277348;
  }

  .insights-title h2 {
    margin: 0;
    font-size: 14px;
    font-weight: 900;
  }

  .insights-title p {
    margin: 3px 0 0;
    color: #7d8c83;
    font-size: 9px;
  }

  .insights-close {
    border: 0;
    background: transparent;
    color: #658074;
    font-size: 10px;
    font-weight: 800;
    cursor: pointer;
  }

  .insights-grid {
    display: grid;
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
    gap: 10px;
    margin-top: 14px;
  }

  .insight-card {
    display: flex;
    gap: 9px;
    padding: 12px;
    border-radius: 13px;
    border: 1px solid #e0eae2;
    background: white;
  }

  .insight-card.warning {
    border-color: #f0d6bb;
    background: #fffaf5;
  }

  .insight-card.positive {
    border-color: #cfe5d4;
    background: #f7fcf8;
  }

  .insight-icon {
    width: 30px;
    height: 30px;
    flex: none;
    display: grid;
    place-items: center;
    border-radius: 9px;
    background: #edf7ef;
    color: #2b764c;
  }

  .insight-card.warning .insight-icon {
    background: #fff0df;
    color: #b36d2d;
  }

  .insight-card strong {
    display: block;
    color: #315141;
    font-size: 10px;
    line-height: 1.35;
  }

  .insight-card p {
    margin: 4px 0 0;
    color: #7a8980;
    font-size: 9px;
    line-height: 1.5;
  }

  .chart-navigation {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    margin-top: 19px;
    padding-bottom: 3px;
  }

  .chart-navigation button {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: none;
    padding: 9px 12px;
    border: 1px solid #dce9df;
    border-radius: 10px;
    background: white;
    color: #64776c;
    font-size: 10px;
    font-weight: 800;
    cursor: pointer;
  }

  .chart-navigation button.active {
    border-color: #a8c9af;
    background: #eaf6ed;
    color: #236b43;
  }

  .analytics-chart {
    width: 100%;
    height: 350px;
  }

  .secondary-grid {
    display: grid;
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
    gap: 16px;
    margin-top: 17px;
  }

  .pie-container {
    display: flex;
    align-items: center;
    height: 260px;
  }

  .pie-legend {
    flex: 1;
    display: grid;
    gap: 12px;
  }

  .pie-legend-row {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    font-size: 10px;
  }

  .pie-legend-row span {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #65766d;
  }

  .pie-legend-row i {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .pie-legend-row strong {
    color: #315141;
  }

  .profitability-list {
    display: grid;
    gap: 17px;
    padding: 8px 2px;
  }

  .profit-row-top,
  .profit-row-bottom {
    display: flex;
    justify-content: space-between;
    gap: 10px;
  }

  .profit-row-top {
    color: #3b5649;
    font-size: 11px;
    font-weight: 800;
  }

  .profit-row-top strong {
    color: #247148;
  }

  .profit-bar {
    height: 8px;
    margin-top: 8px;
    overflow: hidden;
    border-radius: 30px;
    background: #edf1ed;
  }

  .profit-bar > div {
    height: 100%;
    border-radius: inherit;
    background:
      linear-gradient(
        90deg,
        #397d53,
        #9ac46c
      );
  }

  .profit-row-bottom {
    margin-top: 5px;
    color: #849188;
    font-size: 8px;
  }

  .operational-section {
    margin-top: 17px;
    padding: 18px;
    border: 1px solid #dce9df;
    border-radius: 21px;
    background: white;
    box-shadow:
      0 7px 24px rgba(27,70,44,.045);
  }

  .operational-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #2b7048;
  }

  .operational-header h2 {
    margin: 0;
    color: #244637;
    font-size: 15px;
    font-weight: 900;
  }

  .operational-header p {
    margin: 4px 0 0;
    color: #7d8c83;
    font-size: 9px;
  }

  .operations-grid {
    display: grid;
    grid-template-columns:
      repeat(4, minmax(0, 1fr));
    gap: 10px;
    margin-top: 15px;
  }

  .operation-card {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 12px;
    border: 1px solid #e2ebe4;
    border-radius: 13px;
    background: #fbfdfb;
  }

  .operation-icon {
    width: 33px;
    height: 33px;
    flex: none;
    display: grid;
    place-items: center;
    border-radius: 9px;
    background: #edf7ef;
    color: #31764d;
  }

  .operation-card span {
    display: block;
    color: #7b8a81;
    font-size: 8px;
  }

  .operation-card strong {
    display: block;
    margin-top: 2px;
    color: #294a3a;
    font-size: 13px;
    font-weight: 900;
  }

  .operation-card small {
    display: block;
    margin-top: 2px;
    color: #89968f;
    font-size: 7px;
  }

  .operation-status {
    margin-left: auto;
    padding: 4px 6px;
    border-radius: 20px;
    font-size: 7px;
    font-weight: 850;
  }

  .operation-status.good {
    color: #277347;
    background: #e8f6eb;
  }

  .operation-status.warning {
    color: #ad6a2c;
    background: #fff1e3;
  }

  .analytics-table-section {
    margin-top: 17px;
    overflow: hidden;
    border: 1px solid #dce9df;
    border-radius: 21px;
    background: white;
  }

  .table-header {
    display: flex;
    justify-content: space-between;
    padding: 18px;
    color: #2d7149;
  }

  .table-header h2 {
    margin: 0;
    color: #29493a;
    font-size: 14px;
    font-weight: 900;
  }

  .table-header p {
    margin: 4px 0 0;
    color: #7d8c83;
    font-size: 9px;
  }

  .table-wrapper {
    overflow-x: auto;
  }

  .table-wrapper table {
    width: 100%;
    border-collapse: collapse;
    font-size: 10px;
  }

  .table-wrapper th {
    padding: 11px 18px;
    text-align: left;
    color: #718078;
    background: #f5f9f5;
    font-size: 8px;
    text-transform: uppercase;
    letter-spacing: .4px;
  }

  .table-wrapper td {
    padding: 13px 18px;
    border-top: 1px solid #edf2ee;
    color: #6e7d75;
  }

  .table-wrapper td strong {
    color: #345344;
  }

  .actions-panel {
    margin-top: 17px;
    padding: 19px;
    border-radius: 21px;
    color: white;
    background:
      linear-gradient(
        135deg,
        #183f2b,
        #286c47
      );
  }

  .actions-heading {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .action-heading-icon {
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    border-radius: 11px;
    background: rgba(255,255,255,.11);
  }

  .actions-heading h2 {
    margin: 0;
    font-size: 14px;
    font-weight: 900;
  }

  .actions-heading p {
    margin: 3px 0 0;
    color: rgba(255,255,255,.63);
    font-size: 9px;
  }

  .recommendation-grid {
    display: grid;
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
    gap: 10px;
    margin-top: 15px;
  }

  .recommendation {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    padding: 13px;
    border: 1px solid rgba(255,255,255,.12);
    border-radius: 13px;
    background: rgba(255,255,255,.07);
  }

  .recommendation > div {
    width: 30px;
    height: 30px;
    flex: none;
    display: grid;
    place-items: center;
    border-radius: 9px;
    background: rgba(255,255,255,.1);
  }

  .recommendation section {
    flex: 1;
  }

  .recommendation strong {
    display: block;
    font-size: 10px;
    font-weight: 850;
  }

  .recommendation p {
    margin: 4px 0 0;
    color: rgba(255,255,255,.62);
    font-size: 8px;
    line-height: 1.5;
  }

  .analytics-disclaimer {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    margin: 15px 2px 4px;
    color: #849188;
    font-size: 8px;
    line-height: 1.5;
  }

  .analytics-empty {
    margin-top: 25px;
    padding: 40px;
    border: 1px solid #dce9df;
    border-radius: 22px;
    background: white;
  }

  @media (max-width: 1150px) {
    .analytics-kpis {
      grid-template-columns:
        repeat(2, 1fr);
    }

    .operations-grid {
      grid-template-columns:
        repeat(2, 1fr);
    }
  }

  @media (max-width: 900px) {
    .analytics-hero {
      min-height: auto;
      flex-direction: column;
    }

    .hero-score {
      width: auto;
      align-items: flex-start;
    }

    .crop-performance-grid,
    .secondary-grid {
      grid-template-columns: 1fr;
    }

    .insights-grid {
      grid-template-columns: 1fr;
    }

    .recommendation-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 650px) {
    .farm-analytics-page {
      padding: 10px;
    }

    .analytics-kpis {
      grid-template-columns: 1fr;
    }

    .operations-grid {
      grid-template-columns: 1fr;
    }

    .analytics-hero {
      padding: 23px;
      border-radius: 20px;
    }

    .hero-content h1 {
      font-size: 29px;
    }

    .hero-mini-grid > div {
      flex: 1;
      min-width: 105px;
    }

    .analytics-chart {
      height: 280px;
    }

    .pie-container {
      height: 220px;
    }

    .toolbar-left {
      width: 100%;
    }

    .analytics-select {
      flex: 1;
    }
  }
`;
