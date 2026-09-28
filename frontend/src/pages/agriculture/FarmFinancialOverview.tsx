import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  IndianRupee,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  Search,
  Filter,
  RefreshCw,
  Download,
  Plus,
  CalendarDays,
  CircleDollarSign,
  Landmark,
  Tractor,
  Fuel,
  Users,
  Wheat,
  Droplets,
  Sprout,
  ShoppingCart,
  BadgePercent,
  Target,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  X,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Banknote,
  Coins,
  FileText,
  Calculator,
  ShieldCheck,
  Lightbulb,
  Clock3,
  Eye,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import { AgriculturePageHeader } from "@/components/agriculture/AgriculturePageHeader";
import { StatCard } from "@/components/agriculture/StatCard";
import { ChartCard } from "@/components/agriculture/ChartCard";
import { EmptyState } from "@/components/agriculture/EmptyState";
import { LoadingState } from "@/components/agriculture/Loadingstate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  agricultureApi,
  formatCurrency,
  formatDate,
} from "@/services/agricultureApi";

/* =========================================================
   TYPES
========================================================= */

type LedgerEntry = {
  id: string | number;
  date: string;
  label: string;
  category: string;
  amount: number;
  [key: string]: any;
};

type FilterType = "all" | "income" | "expense";

type MonthData = {
  month: string;
  income: number;
  expense: number;
  profit: number;
};

/* =========================================================
   STYLES
========================================================= */

const styles = `
.finance-page {
  min-height: 100vh;
  padding-bottom: 70px;
  background:
    radial-gradient(
      circle at 0% 0%,
      hsl(var(--primary) / .06),
      transparent 28%
    ),
    radial-gradient(
      circle at 100% 15%,
      hsl(var(--chart-2) / .06),
      transparent 25%
    );
}

.finance-hero {
  position: relative;
  overflow: hidden;
  margin-top: 24px;
  padding: 34px;
  border: 1px solid hsl(var(--border));
  border-radius: 28px;
  background:
    linear-gradient(
      135deg,
      hsl(var(--primary) / .12),
      transparent 58%
    ),
    hsl(var(--card));
  box-shadow:
    0 20px 55px hsl(var(--foreground) / .06);
}

.finance-hero::before {
  content: "";
  position: absolute;
  width: 330px;
  height: 330px;
  right: -110px;
  top: -180px;
  border-radius: 50%;
  background: hsl(var(--primary) / .09);
}

.finance-hero::after {
  content: "";
  position: absolute;
  width: 180px;
  height: 180px;
  left: 43%;
  bottom: -125px;
  border-radius: 50%;
  background: hsl(var(--chart-2) / .07);
}

.finance-hero-grid {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(300px, .6fr);
  gap: 28px;
  align-items: center;
}

.finance-kicker {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 12px;
  border-radius: 999px;
  background: hsl(var(--primary) / .1);
  color: hsl(var(--primary));
  font-size: 11px;
  font-weight: 900;
  letter-spacing: .05em;
  text-transform: uppercase;
}

.finance-hero-title {
  margin-top: 14px;
  font-size: clamp(30px, 5vw, 55px);
  line-height: 1.02;
  font-weight: 950;
  letter-spacing: -.045em;
}

.finance-hero-title span {
  color: hsl(var(--primary));
}

.finance-hero-description {
  max-width: 700px;
  margin-top: 16px;
  color: hsl(var(--muted-foreground));
  font-size: 15px;
  line-height: 1.75;
}

.finance-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 22px;
}

.finance-balance-card {
  padding: 23px;
  border: 1px solid hsl(var(--border));
  border-radius: 21px;
  background: hsl(var(--background) / .72);
  backdrop-filter: blur(15px);
}

.balance-label {
  color: hsl(var(--muted-foreground));
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .05em;
}

.balance-value {
  margin-top: 10px;
  font-size: 38px;
  line-height: 1;
  font-weight: 950;
  letter-spacing: -.04em;
}

.balance-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 10px;
  padding: 6px 9px;
  border-radius: 999px;
  background: hsl(var(--primary) / .1);
  color: hsl(var(--primary));
  font-size: 10px;
  font-weight: 900;
}

.balance-breakdown {
  display: grid;
  gap: 10px;
  margin-top: 19px;
}

.balance-line {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid hsl(var(--border));
  font-size: 12px;
}

.balance-line span {
  color: hsl(var(--muted-foreground));
}

.finance-stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 15px;
  margin-top: 22px;
}

.finance-stat {
  position: relative;
  overflow: hidden;
  padding: 19px;
  border: 1px solid hsl(var(--border));
  border-radius: 20px;
  background: hsl(var(--card));
  transition:
    transform .2s ease,
    box-shadow .2s ease,
    border-color .2s ease;
}

.finance-stat:hover {
  transform: translateY(-3px);
  border-color: hsl(var(--primary) / .3);
  box-shadow:
    0 15px 40px hsl(var(--foreground) / .07);
}

.finance-stat::after {
  content: "";
  position: absolute;
  width: 85px;
  height: 85px;
  right: -35px;
  bottom: -35px;
  border-radius: 50%;
  background: hsl(var(--primary) / .05);
}

.finance-stat-icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 13px;
  background: hsl(var(--primary) / .1);
  color: hsl(var(--primary));
}

.finance-stat-value {
  margin-top: 14px;
  font-size: 25px;
  font-weight: 950;
  letter-spacing: -.035em;
}

.finance-stat-label {
  margin-top: 3px;
  color: hsl(var(--muted-foreground));
  font-size: 12px;
}

.finance-stat-trend {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 10px;
  color: hsl(var(--primary));
  font-size: 10px;
  font-weight: 800;
}

.finance-dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(280px, .55fr);
  gap: 18px;
  margin-top: 24px;
}

.finance-panel {
  min-width: 0;
  padding: 19px;
  border: 1px solid hsl(var(--border));
  border-radius: 20px;
  background: hsl(var(--card));
}

.finance-panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 15px;
  font-weight: 900;
}

.finance-panel-subtitle {
  margin-top: 4px;
  color: hsl(var(--muted-foreground));
  font-size: 11px;
  line-height: 1.5;
}

.health-score {
  display: grid;
  place-items: center;
  min-height: 215px;
}

.health-circle {
  width: 145px;
  height: 145px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background:
    radial-gradient(
      circle,
      hsl(var(--card)) 58%,
      transparent 59%
    ),
    conic-gradient(
      hsl(var(--primary)) 0deg 288deg,
      hsl(var(--muted)) 288deg 360deg
    );
}

.health-number {
  font-size: 32px;
  font-weight: 950;
}

.health-caption {
  margin-top: -8px;
  color: hsl(var(--muted-foreground));
  font-size: 11px;
}

.health-list {
  display: grid;
  gap: 9px;
  margin-top: 14px;
}

.health-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 9px 10px;
  border-radius: 11px;
  background: hsl(var(--accent) / .6);
  font-size: 11px;
}

.health-item-left {
  display: flex;
  align-items: center;
  gap: 7px;
}

.health-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: hsl(var(--primary));
}

.finance-insights {
  display: grid;
  gap: 10px;
  margin-top: 17px;
}

.finance-insight {
  display: flex;
  gap: 10px;
  padding: 12px;
  border-radius: 13px;
  background: hsl(var(--accent) / .6);
}

.insight-icon {
  width: 35px;
  height: 35px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 10px;
  background: hsl(var(--primary) / .1);
  color: hsl(var(--primary));
}

.insight-title {
  font-size: 11px;
  font-weight: 900;
}

.insight-text {
  margin-top: 3px;
  color: hsl(var(--muted-foreground));
  font-size: 10px;
  line-height: 1.45;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 16px;
}

.category-card {
  padding: 14px;
  border: 1px solid hsl(var(--border));
  border-radius: 14px;
  transition: transform .2s ease;
}

.category-card:hover {
  transform: translateY(-2px);
}

.category-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.category-name {
  font-size: 11px;
  font-weight: 900;
}

.category-value {
  margin-top: 7px;
  font-size: 16px;
  font-weight: 950;
}

.category-percent {
  margin-top: 3px;
  color: hsl(var(--muted-foreground));
  font-size: 10px;
}

.category-progress {
  height: 5px;
  overflow: hidden;
  margin-top: 10px;
  border-radius: 999px;
  background: hsl(var(--muted));
}

.category-progress-fill {
  height: 100%;
  border-radius: inherit;
  background: hsl(var(--primary));
}

.finance-toolbar {
  margin-top: 25px;
  padding: 15px;
  border: 1px solid hsl(var(--border));
  border-radius: 18px;
  background: hsl(var(--card));
}

.toolbar-row {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: space-between;
}

.finance-search-wrapper {
  position: relative;
  flex: 1;
}

.finance-search-wrapper svg {
  position: absolute;
  top: 50%;
  left: 13px;
  transform: translateY(-50%);
  color: hsl(var(--muted-foreground));
}

.finance-search {
  width: 100%;
  height: 44px;
  padding: 0 14px 0 40px;
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  outline: none;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
}

.finance-search:focus {
  border-color: hsl(var(--primary) / .5);
  box-shadow: 0 0 0 4px hsl(var(--primary) / .07);
}

.finance-select {
  height: 44px;
  min-width: 145px;
  padding: 0 11px;
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  outline: none;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-size: 12px;
}

.transaction-tabs {
  display: flex;
  gap: 7px;
  margin-top: 13px;
  overflow-x: auto;
  scrollbar-width: none;
}

.transaction-tabs::-webkit-scrollbar {
  display: none;
}

.transaction-tab {
  flex: 0 0 auto;
  padding: 7px 13px;
  border: 1px solid hsl(var(--border));
  border-radius: 999px;
  background: hsl(var(--background));
  color: hsl(var(--muted-foreground));
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
}

.transaction-tab.active {
  border-color: hsl(var(--primary));
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

.ledger-card {
  margin-top: 18px;
  overflow: hidden;
  border: 1px solid hsl(var(--border));
  border-radius: 20px;
  background: hsl(var(--card));
}

.ledger-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 18px;
  border-bottom: 1px solid hsl(var(--border));
}

.ledger-title {
  font-size: 15px;
  font-weight: 900;
}

.ledger-subtitle {
  margin-top: 3px;
  color: hsl(var(--muted-foreground));
  font-size: 10px;
}

.amount-positive {
  color: hsl(var(--primary));
  font-weight: 900;
}

.amount-negative {
  color: hsl(var(--destructive));
  font-weight: 900;
}

.transaction-icon {
  width: 33px;
  height: 33px;
  display: grid;
  place-items: center;
  border-radius: 9px;
  background: hsl(var(--accent));
}

.transaction-icon.income {
  color: hsl(var(--primary));
}

.transaction-icon.expense {
  color: hsl(var(--destructive));
}

.empty-finance {
  padding: 60px 20px;
  text-align: center;
}

.empty-finance-icon {
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  margin: 0 auto 12px;
  border-radius: 16px;
  background: hsl(var(--muted));
  color: hsl(var(--muted-foreground));
}

.empty-finance-title {
  font-size: 16px;
  font-weight: 900;
}

.empty-finance-text {
  max-width: 430px;
  margin: 6px auto 0;
  color: hsl(var(--muted-foreground));
  font-size: 12px;
  line-height: 1.6;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 22px;
}

.quick-action {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 13px;
  border: 1px solid hsl(var(--border));
  border-radius: 14px;
  background: hsl(var(--card));
  cursor: pointer;
  transition: all .2s ease;
}

.quick-action:hover {
  border-color: hsl(var(--primary) / .35);
  transform: translateY(-2px);
}

.quick-action-icon {
  width: 35px;
  height: 35px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 10px;
  background: hsl(var(--primary) / .1);
  color: hsl(var(--primary));
}

.quick-action-title {
  font-size: 11px;
  font-weight: 900;
}

.quick-action-text {
  margin-top: 2px;
  color: hsl(var(--muted-foreground));
  font-size: 9px;
}

.financial-goals {
  margin-top: 22px;
  padding: 20px;
  border: 1px solid hsl(var(--border));
  border-radius: 20px;
  background: hsl(var(--card));
}

.goal-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.goal-card {
  padding: 15px;
  border-radius: 14px;
  background: hsl(var(--accent) / .65);
}

.goal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.goal-name {
  font-size: 11px;
  font-weight: 900;
}

.goal-percent {
  color: hsl(var(--primary));
  font-size: 11px;
  font-weight: 900;
}

.goal-value {
  margin-top: 8px;
  color: hsl(var(--muted-foreground));
  font-size: 10px;
}

.goal-track {
  height: 6px;
  overflow: hidden;
  margin-top: 10px;
  border-radius: 999px;
  background: hsl(var(--muted));
}

.goal-fill {
  height: 100%;
  border-radius: inherit;
  background: hsl(var(--primary));
}

.finance-modal-backdrop {
  position: fixed;
  z-index: 100;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 18px;
  background: hsl(var(--foreground) / .55);
  backdrop-filter: blur(8px);
}

.finance-modal {
  width: min(620px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid hsl(var(--border));
  border-radius: 23px;
  background: hsl(var(--card));
  box-shadow: 0 35px 100px hsl(var(--foreground) / .25);
}

.modal-header {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 17px 19px;
  border-bottom: 1px solid hsl(var(--border));
  background: hsl(var(--card) / .95);
  backdrop-filter: blur(14px);
}

.modal-title {
  font-size: 15px;
  font-weight: 900;
}

.modal-body {
  padding: 20px;
}

.modal-close {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
  background: hsl(var(--background));
  cursor: pointer;
}

.form-grid {
  display: grid;
  gap: 14px;
}

.form-label {
  display: block;
  margin-bottom: 6px;
  color: hsl(var(--muted-foreground));
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: .04em;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  min-height: 43px;
  padding: 10px 12px;
  border: 1px solid hsl(var(--border));
  border-radius: 11px;
  outline: none;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
}

.form-textarea {
  min-height: 100px;
  resize: vertical;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid hsl(var(--border));
}

@media (max-width: 1100px) {
  .finance-stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .finance-dashboard-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 800px) {
  .finance-hero {
    padding: 25px;
  }

  .finance-hero-grid {
    grid-template-columns: 1fr;
  }

  .finance-stat-grid {
    grid-template-columns: 1fr;
  }

  .goal-grid {
    grid-template-columns: 1fr;
  }

  .toolbar-row {
    flex-direction: column;
    align-items: stretch;
  }

  .finance-select {
    width: 100%;
  }

  .category-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 550px) {
  .quick-actions {
    grid-template-columns: 1fr;
  }

  .finance-actions {
    flex-direction: column;
  }

  .finance-actions button {
    width: 100%;
  }

  .balance-value {
    font-size: 31px;
  }

  .ledger-heading {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media print {
  .finance-actions,
  .finance-toolbar,
  .quick-actions,
  .finance-sidebar,
  button {
    display: none !important;
  }

  .finance-page {
    background: white;
  }

  .finance-hero,
  .finance-stat,
  .finance-panel,
  .ledger-card {
    box-shadow: none !important;
    break-inside: avoid;
  }
}
`;

/* =========================================================
   HELPERS
========================================================= */

function getMonthKey(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Unknown";
  }

  return parsed.toLocaleString("en-IN", {
    month: "short",
  });
}

function getCategoryIcon(category: string) {
  const value = category.toLowerCase();

  if (value.includes("seed")) return Sprout;
  if (value.includes("fertil")) return Sprout;
  if (value.includes("labour")) return Users;
  if (value.includes("diesel")) return Fuel;
  if (value.includes("fuel")) return Fuel;
  if (value.includes("tractor")) return Tractor;
  if (value.includes("water")) return Droplets;
  if (value.includes("sale")) return ShoppingCart;
  if (value.includes("crop")) return Wheat;
  if (value.includes("subsid")) return Landmark;

  return Receipt;
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function FarmFinancialOverview() {
  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["ledger"],
    queryFn: agricultureApi.getLedger,
  });

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] =
    useState<FilterType>("all");

  const [categoryFilter, setCategoryFilter] =
    useState("All categories");

  const [sortOrder, setSortOrder] =
    useState("Newest first");

  const [showAddEntry, setShowAddEntry] =
    useState(false);

  const [showFilters, setShowFilters] =
    useState(false);

  const entries = useMemo(
    () => (data ?? []) as LedgerEntry[],
    [data],
  );

  /* =======================================================
     FINANCIAL CALCULATIONS
  ======================================================= */

  const income = useMemo(
    () =>
      entries
        .filter((entry) => entry.amount > 0)
        .reduce((sum, entry) => sum + entry.amount, 0),
    [entries],
  );

  const expense = useMemo(
    () =>
      entries
        .filter((entry) => entry.amount < 0)
        .reduce((sum, entry) => sum + Math.abs(entry.amount), 0),
    [entries],
  );

  const profit = income - expense;

  const profitMargin =
    income > 0 ? (profit / income) * 100 : 0;

  const averageTransaction =
    entries.length > 0
      ? entries.reduce(
          (sum, entry) => sum + Math.abs(entry.amount),
          0,
        ) / entries.length
      : 0;

  const incomeEntries = entries.filter(
    (entry) => entry.amount > 0,
  );

  const expenseEntries = entries.filter(
    (entry) => entry.amount < 0,
  );

  /* =======================================================
     CATEGORIES
  ======================================================= */

  const categories = useMemo(() => {
    return [
      "All categories",
      ...Array.from(
        new Set(
          entries
            .map((entry) => entry.category)
            .filter(Boolean),
        ),
      ),
    ];
  }, [entries]);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};

    expenseEntries.forEach((entry) => {
      map[entry.category] =
        (map[entry.category] ?? 0) +
        Math.abs(entry.amount);
    });

    return Object.entries(map)
      .map(([category, amount]) => ({
        category,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenseEntries]);

  const totalCategoryExpense = categoryData.reduce(
    (sum, item) => sum + item.amount,
    0,
  );

  /* =======================================================
     MONTHLY DATA
  ======================================================= */

  const monthlyData = useMemo(() => {
    const map: Record<
      string,
      { income: number; expense: number }
    > = {};

    entries.forEach((entry) => {
      const month = getMonthKey(entry.date);

      if (!map[month]) {
        map[month] = {
          income: 0,
          expense: 0,
        };
      }

      if (entry.amount > 0) {
        map[month].income += entry.amount;
      } else {
        map[month].expense += Math.abs(entry.amount);
      }
    });

    return Object.entries(map).map(
      ([month, values]): MonthData => ({
        month,
        income: values.income,
        expense: values.expense,
        profit:
          values.income - values.expense,
      }),
    );
  }, [entries]);

  /* =======================================================
     FILTERED LEDGER
  ======================================================= */

  const filteredEntries = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = entries.filter((entry) => {
      const searchable = [
        entry.label,
        entry.category,
        entry.date,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchable.includes(query);

      const matchesType =
        filterType === "all" ||
        (filterType === "income" &&
          entry.amount > 0) ||
        (filterType === "expense" &&
          entry.amount < 0);

      const matchesCategory =
        categoryFilter === "All categories" ||
        entry.category === categoryFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesCategory
      );
    });

    return [...result].sort((a, b) => {
      if (sortOrder === "Highest amount") {
        return (
          Math.abs(b.amount) -
          Math.abs(a.amount)
        );
      }

      if (sortOrder === "Lowest amount") {
        return (
          Math.abs(a.amount) -
          Math.abs(b.amount)
        );
      }

      if (sortOrder === "Oldest first") {
        return (
          new Date(a.date).getTime() -
          new Date(b.date).getTime()
        );
      }

      return (
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
      );
    });
  }, [
    entries,
    search,
    filterType,
    categoryFilter,
    sortOrder,
  ]);

  /* =======================================================
     FINANCIAL HEALTH
  ======================================================= */

  const healthScore = Math.max(
    0,
    Math.min(
      100,
      60 +
        profitMargin * 0.8 -
        (expense > income ? 25 : 0),
    ),
  );

  const healthLabel =
    healthScore >= 80
      ? "Excellent"
      : healthScore >= 65
        ? "Healthy"
        : healthScore >= 45
          ? "Needs attention"
          : "At risk";

  /* =======================================================
     CATEGORY INSIGHTS
  ======================================================= */

  const largestExpense =
    categoryData[0];

  const expensePercentage =
    income > 0
      ? (expense / income) * 100
      : 0;

  /* =======================================================
     LOADING
  ======================================================= */

  if (isLoading) {
    return (
      <div>
        <style>{styles}</style>

        <AgriculturePageHeader
          icon={IndianRupee}
          title="Farm Financial Overview"
          description="Every rupee in and out of the farm — seed, fertilizer, labour, diesel, sales and subsidy — so you know your real profit before the season ends."
        />

        <LoadingState rows={5} />
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (isError) {
    return (
      <div className="finance-page">
        <style>{styles}</style>

        <AgriculturePageHeader
          icon={IndianRupee}
          title="Farm Financial Overview"
          description="Every rupee in and out of the farm — seed, fertilizer, labour, diesel, sales and subsidy — so you know your real profit before the season ends."
        />

        <div className="empty-finance">
          <div className="empty-finance-icon">
            <RefreshCw size={25} />
          </div>

          <div className="empty-finance-title">
            Unable to load farm finances
          </div>

          <p className="empty-finance-text">
            Your financial records could not be loaded.
            Please try again.
          </p>

          <Button
            className="mt-5"
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
            Try again
          </Button>
        </div>
      </div>
    );
  }

  /* =======================================================
     EMPTY STATE
  ======================================================= */

  if (!entries.length) {
    return (
      <div className="finance-page">
        <style>{styles}</style>

        <AgriculturePageHeader
          icon={IndianRupee}
          title="Farm Financial Overview"
          description="Every rupee in and out of the farm — seed, fertilizer, labour, diesel, sales and subsidy — so you know your real profit before the season ends."
        />

        <EmptyState
          title="No entries yet"
          description="Record your first purchase or sale to start the farm ledger."
        />
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="finance-page">
      <style>{styles}</style>

      <AgriculturePageHeader
        icon={IndianRupee}
        title="Farm Financial Overview"
        description="Every rupee in and out of the farm — seed, fertilizer, labour, diesel, sales and subsidy — so you know your real profit before the season ends."
      />

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="finance-hero">
        <div className="finance-hero-grid">
          <div>
            <div className="finance-kicker">
              <CircleDollarSign size={14} />
              Smart Farm Finance
            </div>

            <h1 className="finance-hero-title">
              Know your farm's
              <br />
              <span>real money story.</span>
            </h1>

            <p className="finance-hero-description">
              Track income, expenses, crop investments,
              labour, fuel and sales in one place. Understand
              whether your farm is generating profit before
              the season ends.
            </p>

            <div className="finance-actions">
              <Button
                onClick={() =>
                  setShowAddEntry(true)
                }
              >
                <Plus className="mr-2 size-4" />
                Add transaction
              </Button>

              <Button
                variant="outline"
                onClick={() =>
                  window.print()
                }
              >
                <Download className="mr-2 size-4" />
                Export / Print
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

          <div className="finance-balance-card">
            <div className="balance-label">
              Current net position
            </div>

            <div className="balance-value">
              {formatCurrency(profit)}
            </div>

            <div className="balance-status">
              {profit >= 0 ? (
                <TrendingUp size={13} />
              ) : (
                <TrendingDown size={13} />
              )}

              {profit >= 0
                ? "Positive cash position"
                : "Needs financial attention"}
            </div>

            <div className="balance-breakdown">
              <div className="balance-line">
                <span>Total income</span>
                <strong>
                  {formatCurrency(income)}
                </strong>
              </div>

              <div className="balance-line">
                <span>Total expenses</span>
                <strong>
                  {formatCurrency(expense)}
                </strong>
              </div>

              <div className="balance-line">
                <span>Profit margin</span>
                <strong>
                  {profitMargin.toFixed(1)}%
                </strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          STAT CARDS
      ===================================================== */}

      <section className="finance-stat-grid">
        <div className="finance-stat">
          <div className="finance-stat-icon">
            <ArrowUpCircle size={20} />
          </div>

          <div className="finance-stat-value">
            {formatCurrency(income)}
          </div>

          <div className="finance-stat-label">
            Total income
          </div>

          <div className="finance-stat-trend">
            <ArrowUpRight size={13} />
            {incomeEntries.length} income entries
          </div>
        </div>

        <div className="finance-stat">
          <div className="finance-stat-icon">
            <ArrowDownCircle size={20} />
          </div>

          <div className="finance-stat-value">
            {formatCurrency(expense)}
          </div>

          <div className="finance-stat-label">
            Total expenses
          </div>

          <div className="finance-stat-trend">
            <ArrowDownRight size={13} />
            {expenseEntries.length} expense entries
          </div>
        </div>

        <div className="finance-stat">
          <div className="finance-stat-icon">
            <PiggyBank size={20} />
          </div>

          <div className="finance-stat-value">
            {formatCurrency(profit)}
          </div>

          <div className="finance-stat-label">
            Net profit / loss
          </div>

          <div className="finance-stat-trend">
            {profit >= 0 ? (
              <TrendingUp size={13} />
            ) : (
              <TrendingDown size={13} />
            )}

            {profitMargin.toFixed(1)}% margin
          </div>
        </div>

        <div className="finance-stat">
          <div className="finance-stat-icon">
            <Receipt size={20} />
          </div>

          <div className="finance-stat-value">
            {entries.length}
          </div>

          <div className="finance-stat-label">
            Transactions recorded
          </div>

          <div className="finance-stat-trend">
            <Activity size={13} />
            Avg.{" "}
            {formatCurrency(
              averageTransaction,
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          QUICK ACTIONS
      ===================================================== */}

      <section className="quick-actions">
        <div
          className="quick-action"
          onClick={() => setShowAddEntry(true)}
        >
          <div className="quick-action-icon">
            <Plus size={17} />
          </div>

          <div>
            <div className="quick-action-title">
              Add income
            </div>

            <div className="quick-action-text">
              Record crop or milk sales
            </div>
          </div>
        </div>

        <div
          className="quick-action"
          onClick={() => setShowAddEntry(true)}
        >
          <div className="quick-action-icon">
            <ShoppingCart size={17} />
          </div>

          <div>
            <div className="quick-action-title">
              Add expense
            </div>

            <div className="quick-action-text">
              Seeds, labour, fuel & inputs
            </div>
          </div>
        </div>

        <div className="quick-action">
          <div className="quick-action-icon">
            <Calculator size={17} />
          </div>

          <div>
            <div className="quick-action-title">
              Profit calculator
            </div>

            <div className="quick-action-text">
              Estimate crop profitability
            </div>
          </div>
        </div>

        <div className="quick-action">
          <div className="quick-action-icon">
            <FileText size={17} />
          </div>

          <div>
            <div className="quick-action-title">
              Financial report
            </div>

            <div className="quick-action-text">
              View season summary
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          ANALYTICS
      ===================================================== */}

      <section className="finance-dashboard-grid">
        <ChartCard
          title="Income vs expenses"
          description="Compare your money coming in and going out across recorded months."
          action={
            <Badge variant="secondary">
              <BarChart3 className="mr-1 size-3" />
              Cash flow
            </Badge>
          }
        >
          <div className="h-80">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={monthlyData}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                />

                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                />

                <Tooltip
                  formatter={(value: number) =>
                    formatCurrency(value)
                  }
                  contentStyle={{
                    background:
                      "var(--popover)",
                    border:
                      "1px solid var(--border)",
                    borderRadius: 12,
                  }}
                />

                <Legend />

                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="var(--chart-1)"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                  name="Income"
                />

                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="var(--chart-2)"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                  name="Expenses"
                />

                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="var(--chart-3)"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Profit"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <div className="finance-panel">
          <div className="finance-panel-title">
            <span>Financial health</span>
            <ShieldCheck
              className="text-primary"
              size={18}
            />
          </div>

          <div className="finance-panel-subtitle">
            Based on your income, expenses and current
            profit position.
          </div>

          <div className="health-score">
            <div className="health-circle">
              <div>
                <div className="health-number">
                  {Math.round(healthScore)}
                </div>

                <div className="health-caption">
                  / 100
                </div>
              </div>
            </div>
          </div>

          <div className="text-center text-sm font-bold">
            {healthLabel}
          </div>

          <div className="health-list">
            <div className="health-item">
              <div className="health-item-left">
                <span className="health-dot" />
                Profit margin
              </div>

              <strong>
                {profitMargin.toFixed(1)}%
              </strong>
            </div>

            <div className="health-item">
              <div className="health-item-left">
                <span className="health-dot" />
                Expense / income
              </div>

              <strong>
                {expensePercentage.toFixed(1)}%
              </strong>
            </div>

            <div className="health-item">
              <div className="health-item-left">
                <span className="health-dot" />
                Transactions
              </div>

              <strong>
                {entries.length}
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          EXPENSE CATEGORY + PIE
      ===================================================== */}

      <section className="finance-dashboard-grid">
        <ChartCard
          title="Where your money goes"
          description="Understand which farming activities consume the largest share of your expenses."
          action={
            <Badge variant="secondary">
              <PieChartIcon className="mr-1 size-3" />
              Expense mix
            </Badge>
          }
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="h-72">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={100}
                    paddingAngle={3}
                  >
                    {categoryData.map(
                      (_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={`var(--chart-${
                            (index % 5) + 1
                          })`}
                        />
                      ),
                    )}
                  </Pie>

                  <Tooltip
                    formatter={(value: number) =>
                      formatCurrency(value)
                    }
                  />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="category-grid">
              {categoryData
                .slice(0, 6)
                .map((item) => {
                  const percentage =
                    totalCategoryExpense >
                    0
                      ? (item.amount /
                          totalCategoryExpense) *
                        100
                      : 0;

                  const Icon =
                    getCategoryIcon(
                      item.category,
                    );

                  return (
                    <div
                      className="category-card"
                      key={item.category}
                    >
                      <div className="category-top">
                        <div className="flex items-center gap-2">
                          <Icon
                            size={15}
                            className="text-primary"
                          />

                          <span className="category-name">
                            {item.category}
                          </span>
                        </div>

                        <Badge
                          variant="secondary"
                          className="text-[9px]"
                        >
                          {percentage.toFixed(0)}%
                        </Badge>
                      </div>

                      <div className="category-value">
                        {formatCurrency(
                          item.amount,
                        )}
                      </div>

                      <div className="category-percent">
                        of total expenses
                      </div>

                      <div className="category-progress">
                        <div
                          className="category-progress-fill"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </ChartCard>

        <div className="finance-panel">
          <div className="finance-panel-title">
            <span>Finance insights</span>
            <Lightbulb
              className="text-primary"
              size={18}
            />
          </div>

          <div className="finance-panel-subtitle">
            Useful signals from your current ledger.
          </div>

          <div className="finance-insights">
            <div className="finance-insight">
              <div className="insight-icon">
                <TrendingUp size={16} />
              </div>

              <div>
                <div className="insight-title">
                  Current position
                </div>

                <div className="insight-text">
                  {profit >= 0
                    ? "Your recorded income is currently higher than your expenses."
                    : "Your expenses are currently higher than your recorded income."}
                </div>
              </div>
            </div>

            <div className="finance-insight">
              <div className="insight-icon">
                <Receipt size={16} />
              </div>

              <div>
                <div className="insight-title">
                  Average transaction
                </div>

                <div className="insight-text">
                  Your average recorded transaction is{" "}
                  {formatCurrency(
                    averageTransaction,
                  )}
                  .
                </div>
              </div>
            </div>

            <div className="finance-insight">
              <div className="insight-icon">
                <Target size={16} />
              </div>

              <div>
                <div className="insight-title">
                  Largest expense
                </div>

                <div className="insight-text">
                  {largestExpense
                    ? `${largestExpense.category} represents your largest expense category.`
                    : "No expense category available yet."}
                </div>
              </div>
            </div>

            <div className="finance-insight">
              <div className="insight-icon">
                <BadgePercent size={16} />
              </div>

              <div>
                <div className="insight-title">
                  Profit margin
                </div>

                <div className="insight-text">
                  Current recorded profit margin is{" "}
                  {profitMargin.toFixed(1)}%.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FINANCIAL GOALS
      ===================================================== */}

      <section className="financial-goals">
        <div className="finance-panel-title">
          <span>Season financial goals</span>
          <Target
            className="text-primary"
            size={18}
          />
        </div>

        <div className="finance-panel-subtitle">
          Use these indicators to monitor whether your
          current farm finances are moving in the right
          direction.
        </div>

        <div className="goal-grid">
          <div className="goal-card">
            <div className="goal-head">
              <span className="goal-name">
                Profitability
              </span>

              <span className="goal-percent">
                {Math.max(
                  0,
                  Math.min(
                    100,
                    Math.round(
                      profitMargin,
                    ),
                  ),
                )}
                %
              </span>
            </div>

            <div className="goal-value">
              Current margin
            </div>

            <div className="goal-track">
              <div
                className="goal-fill"
                style={{
                  width: `${Math.max(
                    0,
                    Math.min(
                      100,
                      profitMargin,
                    ),
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="goal-card">
            <div className="goal-head">
              <span className="goal-name">
                Expense control
              </span>

              <span className="goal-percent">
                {Math.max(
                  0,
                  Math.round(
                    100 -
                      Math.min(
                        100,
                        expensePercentage,
                      ),
                  ),
                )}
                %
              </span>
            </div>

            <div className="goal-value">
              Lower expense ratio is better
            </div>

            <div className="goal-track">
              <div
                className="goal-fill"
                style={{
                  width: `${Math.max(
                    0,
                    100 -
                      Math.min(
                        100,
                        expensePercentage,
                      ),
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="goal-card">
            <div className="goal-head">
              <span className="goal-name">
                Record keeping
              </span>

              <span className="goal-percent">
                100%
              </span>
            </div>

            <div className="goal-value">
              Ledger is actively being maintained
            </div>

            <div className="goal-track">
              <div
                className="goal-fill"
                style={{ width: "100%" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          TRANSACTION FILTER
      ===================================================== */}

      <section className="finance-toolbar">
        <div className="toolbar-row">
          <div className="finance-search-wrapper">
            <Search size={17} />

            <input
              className="finance-search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search transaction, category or date..."
            />
          </div>

          <select
            className="finance-select"
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(
                event.target.value,
              )
            }
          >
            {categories.map((category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            ))}
          </select>

          <select
            className="finance-select"
            value={sortOrder}
            onChange={(event) =>
              setSortOrder(event.target.value)
            }
          >
            <option>Newest first</option>
            <option>Oldest first</option>
            <option>Highest amount</option>
            <option>Lowest amount</option>
          </select>

          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setShowFilters(
                (value) => !value,
              )
            }
          >
            <Filter size={16} />
          </Button>
        </div>

        <div className="transaction-tabs">
          <button
            className={`transaction-tab ${
              filterType === "all"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setFilterType("all")
            }
          >
            All transactions
          </button>

          <button
            className={`transaction-tab ${
              filterType === "income"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setFilterType("income")
            }
          >
            Income
          </button>

          <button
            className={`transaction-tab ${
              filterType === "expense"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setFilterType("expense")
            }
          >
            Expenses
          </button>

          {showFilters && (
            <button
              className="transaction-tab"
              onClick={() => {
                setSearch("");
                setFilterType("all");
                setCategoryFilter(
                  "All categories",
                );
                setSortOrder(
                  "Newest first",
                );
              }}
            >
              <X className="mr-1 inline size-3" />
              Clear
            </button>
          )}
        </div>
      </section>

      {/* =====================================================
          LEDGER
      ===================================================== */}

      <section className="ledger-card">
        <div className="ledger-heading">
          <div>
            <div className="ledger-title">
              Farm transaction ledger
            </div>

            <div className="ledger-subtitle">
              Showing{" "}
              {filteredEntries.length} of{" "}
              {entries.length} recorded transactions
            </div>
          </div>

          <Badge variant="secondary">
            <Clock3 className="mr-1 size-3" />
            Live ledger
          </Badge>
        </div>

        {!filteredEntries.length ? (
          <div className="empty-finance">
            <div className="empty-finance-icon">
              <Search size={24} />
            </div>

            <div className="empty-finance-title">
              No matching transactions
            </div>

            <p className="empty-finance-text">
              Try another search term, category or
              transaction type.
            </p>

            <Button
              className="mt-4"
              variant="outline"
              onClick={() => {
                setSearch("");
                setFilterType("all");
                setCategoryFilter(
                  "All categories",
                );
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    Date
                  </TableHead>

                  <TableHead>
                    Transaction
                  </TableHead>

                  <TableHead>
                    Category
                  </TableHead>

                  <TableHead>
                    Type
                  </TableHead>

                  <TableHead className="text-right">
                    Amount
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredEntries.map(
                  (entry) => {
                    const isIncome =
                      entry.amount > 0;

                    const Icon =
                      getCategoryIcon(
                        entry.category,
                      );

                    return (
                      <TableRow
                        key={entry.id}
                      >
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <CalendarDays
                              size={13}
                              className="text-muted-foreground"
                            />

                            {formatDate(
                              entry.date,
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className={`transaction-icon ${
                                isIncome
                                  ? "income"
                                  : "expense"
                              }`}
                            >
                              <Icon
                                size={15}
                              />
                            </div>

                            <div>
                              <div className="font-semibold">
                                {entry.label}
                              </div>

                              <div className="text-[10px] text-muted-foreground">
                                Farm ledger
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge variant="secondary">
                            {entry.category}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          {isIncome ? (
                            <Badge>
                              <ArrowUpCircle className="mr-1 size-3" />
                              Income
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              <ArrowDownCircle className="mr-1 size-3" />
                              Expense
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell
                          className={`text-right ${
                            isIncome
                              ? "amount-positive"
                              : "amount-negative"
                          }`}
                        >
                          {isIncome
                            ? "+"
                            : "-"}
                          {formatCurrency(
                            Math.abs(
                              entry.amount,
                            ),
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  },
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      {/* =====================================================
          FINAL FARM FINANCE SUMMARY
      ===================================================== */}

      <section className="finance-panel mt-5">
        <div className="finance-panel-title">
          <span>Season summary</span>
          <Wallet
            className="text-primary"
            size={18}
          />
        </div>

        <div className="finance-panel-subtitle">
          A quick summary of your recorded farm finances.
        </div>

        <div className="grid gap-3 md:grid-cols-3 mt-5">
          <div className="rounded-xl border p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Banknote size={14} />
              Income
            </div>

            <div className="mt-2 text-lg font-black">
              {formatCurrency(income)}
            </div>
          </div>

          <div className="rounded-xl border p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CreditCard size={14} />
              Expenses
            </div>

            <div className="mt-2 text-lg font-black">
              {formatCurrency(expense)}
            </div>
          </div>

          <div className="rounded-xl border p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Coins size={14} />
              Net result
            </div>

            <div
              className={`mt-2 text-lg font-black ${
                profit >= 0
                  ? "text-primary"
                  : "text-destructive"
              }`}
            >
              {formatCurrency(profit)}
            </div>
          </div>
        </div>

        {profit < 0 && (
          <div className="mt-4 flex gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
            <AlertTriangle
              className="mt-0.5 shrink-0 text-destructive"
              size={18}
            />

            <div>
              <div className="text-sm font-bold">
                Your recorded farm expenses are currently
                higher than income.
              </div>

              <div className="mt-1 text-xs text-muted-foreground">
                Review high-cost categories and compare
                input prices, labour costs and crop selling
                prices before making the next major
                investment.
              </div>
            </div>
          </div>
        )}

        {profit >= 0 && (
          <div className="mt-4 flex gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <CheckCircle2
              className="mt-0.5 shrink-0 text-primary"
              size={18}
            />

            <div>
              <div className="text-sm font-bold">
                Your recorded farm finances are currently
                positive.
              </div>

              <div className="mt-1 text-xs text-muted-foreground">
                Continue recording every purchase, labour
                payment and sale so your profit estimate
                stays accurate throughout the season.
              </div>
            </div>
          </div>
        )}
      </section>

      {/* =====================================================
          ADD TRANSACTION MODAL
      ===================================================== */}

      {showAddEntry && (
        <div
          className="finance-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setShowAddEntry(false);
            }
          }}
        >
          <div className="finance-modal">
            <div className="modal-header">
              <div>
                <div className="modal-title">
                  Add farm transaction
                </div>

                <div className="text-[10px] text-muted-foreground">
                  Record income or expense for your farm
                </div>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowAddEntry(false)
                }
              >
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-grid">
                <div>
                  <label className="form-label">
                    Transaction type
                  </label>

                  <select className="form-select">
                    <option value="income">
                      Income / Sale
                    </option>

                    <option value="expense">
                      Expense / Purchase
                    </option>
                  </select>
                </div>

                <div>
                  <label className="form-label">
                    Description
                  </label>

                  <input
                    className="form-input"
                    placeholder="Example: Tomato sale"
                  />
                </div>

                <div>
                  <label className="form-label">
                    Category
                  </label>

                  <select className="form-select">
                    <option>
                      Crop sales
                    </option>

                    <option>
                      Seeds
                    </option>

                    <option>
                      Fertilizer
                    </option>

                    <option>
                      Labour
                    </option>

                    <option>
                      Diesel / Fuel
                    </option>

                    <option>
                      Machinery
                    </option>

                    <option>
                      Irrigation
                    </option>

                    <option>
                      Transport
                    </option>

                    <option>
                      Subsidy
                    </option>

                    <option>
                      Other
                    </option>
                  </select>
                </div>

                <div>
                  <label className="form-label">
                    Amount
                  </label>

                  <div className="relative">
                    <IndianRupee
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />

                    <input
                      type="number"
                      className="form-input pl-9"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">
                    Date
                  </label>

                  <input
                    type="date"
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">
                    Notes
                  </label>

                  <textarea
                    className="form-textarea"
                    placeholder="Add additional details..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <Button
                  variant="outline"
                  onClick={() =>
                    setShowAddEntry(false)
                  }
                >
                  Cancel
                </Button>

                <Button
                  onClick={() => {
                    setShowAddEntry(false);

                    window.alert(
                      "Transaction form is ready. Connect it to your Django ledger API to save transactions.",
                    );
                  }}
                >
                  <Plus className="mr-2 size-4" />
                  Save transaction
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}