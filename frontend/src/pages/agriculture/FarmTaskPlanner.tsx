import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Bell,
  Calendar,
  CalendarCheck,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  CloudRain,
  Droplets,
  Edit3,
  Filter,
  Gauge,
  Leaf,
  ListChecks,
  ListTodo,
  MapPin,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sprout,
  Tractor,
  TrendingUp,
  TriangleAlert,
  Users,
  Wheat,
  X,
  Zap,
} from "lucide-react";

import { AgriculturePageHeader } from "@/components/agriculture/AgriculturePageHeader";
import { ChartCard } from "@/components/agriculture/ChartCard";
import { EmptyState } from "@/components/agriculture/EmptyState";
import { LoadingState } from "@/components/agriculture/Loadingstate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/services/api";
import {
  agricultureApi,
  formatDate,
  type FarmTask,
} from "@/services/agricultureApi";

/**
 * AgriGo Farm Task Planner
 *
 * Real-world design goals:
 * 1. A task is linked to a field, crop, operation and due date.
 * 2. Weather-sensitive work can be flagged for review.
 * 3. The farmer can record labour, quantity, estimated cost and notes.
 * 4. Completion is synced to the backend when the endpoint exists.
 * 5. The UI remains usable when the network is temporarily unavailable.
 * 6. Task creation is not a fake "close modal" action anymore.
 *
 * Expected backend endpoints:
 *   GET    /api/tasks/
 *   POST   /api/tasks/
 *   PATCH  /api/tasks/:id/
 *   DELETE /api/tasks/:id/
 *
 * If your agricultureApi already exposes create/update/delete task methods,
 * replace the generic api calls below with those existing methods.
 */

type TaskFilter =
  | "all"
  | "pending"
  | "done"
  | "urgent"
  | "today"
  | "overdue"
  | "weather";

type SortMode =
  | "priority"
  | "date"
  | "alphabetical"
  | "status"
  | "cost";

type ExtendedTask = FarmTask & {
  id: string;
  title: string;
  field: string;
  category: string;
  priority: "high" | "medium" | "low";
  due: string;
  done: boolean;
  crop?: string;
  notes?: string;
  estimatedCost?: number;
  quantity?: string;
  labour?: number;
  weatherSensitive?: boolean;
  reminder?: boolean;
  reminderTime?: string;
  recurring?: "none" | "daily" | "weekly" | "monthly";
  createdAt?: string;
};

type TaskForm = {
  title: string;
  field: string;
  crop: string;
  due: string;
  category: string;
  priority: "high" | "medium" | "low";
  notes: string;
  estimatedCost: string;
  quantity: string;
  labour: string;
  weatherSensitive: boolean;
  reminder: boolean;
  reminderTime: string;
  recurring: "none" | "daily" | "weekly" | "monthly";
};

const priorityTone = {
  high: "bg-destructive/15 text-destructive border-destructive/20",
  medium: "bg-warning/15 text-warning-foreground border-warning/20",
  low: "bg-muted text-muted-foreground border-border",
} as const;

const priorityRank = {
  high: 3,
  medium: 2,
  low: 1,
} as const;

const OPERATION_OPTIONS = [
  "Irrigation",
  "Fertilizer",
  "Spraying",
  "Weeding",
  "Sowing",
  "Harvest",
  "Soil preparation",
  "Pest monitoring",
  "Disease monitoring",
  "Machinery",
  "Livestock",
  "Market preparation",
  "Government scheme",
  "Other",
];

const CROP_OPTIONS = [
  "Rice / Paddy",
  "Wheat",
  "Maize",
  "Cotton",
  "Sugarcane",
  "Tomato",
  "Chilli",
  "Potato",
  "Onion",
  "Groundnut",
  "Soybean",
  "Chickpea",
  "Tur / Pigeon pea",
  "Black gram",
  "Green gram",
  "Ragi",
  "Vegetables",
  "Fruits",
  "Other",
];

const pageStyles = `
.task-page{
  min-height:100vh;
  padding-bottom:90px;
  background:
    radial-gradient(circle at 0% 0%,hsl(var(--primary)/.08),transparent 27%),
    radial-gradient(circle at 100% 10%,hsl(var(--chart-2)/.07),transparent 24%);
}
.task-hero{
  position:relative;
  overflow:hidden;
  margin-top:24px;
  padding:32px;
  border:1px solid hsl(var(--border));
  border-radius:28px;
  background:
    linear-gradient(135deg,hsl(var(--primary)/.14),transparent 55%),
    hsl(var(--card));
  box-shadow:0 22px 65px hsl(var(--foreground)/.06);
}
.task-hero-grid{
  position:relative;
  z-index:2;
  display:grid;
  grid-template-columns:minmax(0,1.45fr) minmax(300px,.55fr);
  gap:30px;
  align-items:center;
}
.task-kicker{
  display:inline-flex;
  align-items:center;
  gap:7px;
  padding:7px 12px;
  border-radius:999px;
  background:hsl(var(--primary)/.1);
  color:hsl(var(--primary));
  font-size:10px;
  font-weight:900;
  letter-spacing:.07em;
  text-transform:uppercase;
}
.task-hero-title{
  margin-top:15px;
  font-size:clamp(30px,5vw,55px);
  line-height:1;
  font-weight:950;
  letter-spacing:-.045em;
}
.task-hero-title span{color:hsl(var(--primary))}
.task-hero-description{
  max-width:730px;
  margin-top:15px;
  color:hsl(var(--muted-foreground));
  font-size:14px;
  line-height:1.75;
}
.task-hero-actions{
  display:flex;
  flex-wrap:wrap;
  gap:9px;
  margin-top:21px;
}
.productivity-card{
  padding:22px;
  border:1px solid hsl(var(--border));
  border-radius:21px;
  background:hsl(var(--background)/.72);
  backdrop-filter:blur(14px);
}
.productivity-label{
  color:hsl(var(--muted-foreground));
  font-size:10px;
  font-weight:900;
  letter-spacing:.06em;
  text-transform:uppercase;
}
.productivity-number{
  margin-top:9px;
  font-size:43px;
  line-height:1;
  font-weight:950;
  letter-spacing:-.05em;
}
.productivity-status{
  display:inline-flex;
  align-items:center;
  gap:5px;
  margin-top:9px;
  padding:6px 9px;
  border-radius:999px;
  background:hsl(var(--primary)/.1);
  color:hsl(var(--primary));
  font-size:10px;
  font-weight:900;
}
.productivity-track{
  height:9px;
  overflow:hidden;
  margin-top:18px;
  border-radius:999px;
  background:hsl(var(--muted));
}
.productivity-fill{
  height:100%;
  border-radius:inherit;
  background:hsl(var(--primary));
  transition:width .5s ease;
}
.productivity-footer{
  display:flex;
  justify-content:space-between;
  margin-top:8px;
  color:hsl(var(--muted-foreground));
  font-size:10px;
}
.task-stat-grid{
  display:grid;
  grid-template-columns:repeat(5,minmax(0,1fr));
  gap:15px;
  margin-top:22px;
}
.task-stat{
  position:relative;
  overflow:hidden;
  padding:18px;
  border:1px solid hsl(var(--border));
  border-radius:19px;
  background:hsl(var(--card));
  transition:transform .2s ease,box-shadow .2s ease;
}
.task-stat:hover{
  transform:translateY(-3px);
  box-shadow:0 15px 40px hsl(var(--foreground)/.07);
}
.task-stat-icon{
  display:grid;
  place-items:center;
  width:42px;
  height:42px;
  border-radius:12px;
  background:hsl(var(--primary)/.1);
  color:hsl(var(--primary));
}
.task-stat-value{
  margin-top:13px;
  font-size:26px;
  font-weight:950;
  letter-spacing:-.04em;
}
.task-stat-label{
  margin-top:3px;
  color:hsl(var(--muted-foreground));
  font-size:11px;
}
.task-stat-meta{
  display:flex;
  align-items:center;
  gap:5px;
  margin-top:9px;
  color:hsl(var(--primary));
  font-size:10px;
  font-weight:800;
}
.task-alert{
  display:flex;
  align-items:flex-start;
  gap:12px;
  margin-top:20px;
  padding:15px 17px;
  border:1px solid hsl(var(--destructive)/.18);
  border-radius:16px;
  background:hsl(var(--destructive)/.05);
}
.task-alert-icon{
  display:grid;
  place-items:center;
  width:35px;
  height:35px;
  flex:0 0 auto;
  border-radius:10px;
  background:hsl(var(--destructive)/.1);
  color:hsl(var(--destructive));
}
.task-alert-title{font-size:12px;font-weight:900}
.task-alert-text{
  margin-top:3px;
  color:hsl(var(--muted-foreground));
  font-size:10px;
  line-height:1.5;
}
.smart-strip{
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:12px;
  margin-top:20px;
}
.smart-card{
  display:flex;
  gap:11px;
  padding:15px;
  border:1px solid hsl(var(--border));
  border-radius:17px;
  background:hsl(var(--card));
}
.smart-icon{
  display:grid;
  place-items:center;
  width:38px;
  height:38px;
  flex:0 0 auto;
  border-radius:11px;
  background:hsl(var(--primary)/.1);
  color:hsl(var(--primary));
}
.smart-title{font-size:11px;font-weight:900}
.smart-text{
  margin-top:3px;
  color:hsl(var(--muted-foreground));
  font-size:9px;
  line-height:1.5;
}
.task-dashboard-grid{
  display:grid;
  grid-template-columns:minmax(0,1.4fr) minmax(290px,.6fr);
  gap:18px;
  margin-top:24px;
}
.task-panel{
  min-width:0;
  padding:19px;
  border:1px solid hsl(var(--border));
  border-radius:20px;
  background:hsl(var(--card));
}
.task-panel-title{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
  font-size:14px;
  font-weight:900;
}
.task-panel-subtitle{
  margin-top:4px;
  color:hsl(var(--muted-foreground));
  font-size:10px;
  line-height:1.5;
}
.today-list,.field-list{
  display:grid;
  gap:9px;
  margin-top:17px;
}
.today-item{
  display:flex;
  gap:10px;
  padding:12px;
  border:1px solid hsl(var(--border));
  border-radius:13px;
  background:hsl(var(--background)/.55);
}
.today-time{
  min-width:55px;
  color:hsl(var(--primary));
  font-size:10px;
  font-weight:900;
}
.today-content{min-width:0;flex:1}
.today-title{
  overflow:hidden;
  font-size:11px;
  font-weight:800;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.today-meta{
  display:flex;
  flex-wrap:wrap;
  gap:7px;
  margin-top:4px;
  color:hsl(var(--muted-foreground));
  font-size:9px;
}
.field-row{
  padding:11px;
  border-radius:12px;
  background:hsl(var(--accent)/.6);
}
.field-row-head{
  display:flex;
  justify-content:space-between;
  gap:10px;
}
.field-name{font-size:11px;font-weight:900}
.field-count{color:hsl(var(--muted-foreground));font-size:9px}
.field-progress{
  height:5px;
  overflow:hidden;
  margin-top:8px;
  border-radius:999px;
  background:hsl(var(--muted));
}
.field-progress-fill{
  height:100%;
  border-radius:inherit;
  background:hsl(var(--primary));
}
.category-grid{
  display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:10px;
  margin-top:16px;
}
.category-card{
  padding:14px;
  border:1px solid hsl(var(--border));
  border-radius:14px;
  background:hsl(var(--background)/.45);
}
.category-icon{
  display:grid;
  place-items:center;
  width:35px;
  height:35px;
  border-radius:10px;
  background:hsl(var(--primary)/.1);
  color:hsl(var(--primary));
}
.category-card-title{margin-top:9px;font-size:10px;font-weight:900}
.category-card-value{
  margin-top:3px;
  font-size:19px;
  font-weight:950;
}
.task-toolbar{
  margin-top:25px;
  padding:15px;
  border:1px solid hsl(var(--border));
  border-radius:18px;
  background:hsl(var(--card));
}
.toolbar-main{
  display:flex;
  align-items:center;
  gap:9px;
}
.task-search{position:relative;flex:1}
.task-search svg{
  position:absolute;
  left:13px;
  top:50%;
  transform:translateY(-50%);
  color:hsl(var(--muted-foreground));
}
.task-search input{
  width:100%;
  height:43px;
  padding:0 12px 0 39px;
  border:1px solid hsl(var(--border));
  border-radius:11px;
  outline:none;
  background:hsl(var(--background));
  color:hsl(var(--foreground));
  font-size:12px;
}
.task-search input:focus{
  border-color:hsl(var(--primary)/.45);
  box-shadow:0 0 0 4px hsl(var(--primary)/.06);
}
.task-select{
  height:43px;
  min-width:135px;
  padding:0 10px;
  border:1px solid hsl(var(--border));
  border-radius:11px;
  outline:none;
  background:hsl(var(--background));
  color:hsl(var(--foreground));
  font-size:11px;
}
.task-tabs{
  display:flex;
  gap:7px;
  overflow-x:auto;
  margin-top:12px;
  scrollbar-width:none;
}
.task-tabs::-webkit-scrollbar{display:none}
.task-tab{
  display:inline-flex;
  align-items:center;
  gap:5px;
  flex:0 0 auto;
  padding:7px 12px;
  border:1px solid hsl(var(--border));
  border-radius:999px;
  background:hsl(var(--background));
  color:hsl(var(--muted-foreground));
  font-size:10px;
  font-weight:800;
  cursor:pointer;
}
.task-tab.active{
  border-color:hsl(var(--primary));
  background:hsl(var(--primary));
  color:hsl(var(--primary-foreground));
}
.task-board{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:17px;
  margin-top:18px;
}
.task-section{
  overflow:hidden;
  border:1px solid hsl(var(--border));
  border-radius:20px;
  background:hsl(var(--card));
}
.task-section-header{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
  padding:16px 17px;
  border-bottom:1px solid hsl(var(--border));
}
.task-section-title{
  display:flex;
  align-items:center;
  gap:8px;
  font-size:13px;
  font-weight:900;
}
.task-section-body{padding:6px 16px}
.task-item{
  position:relative;
  display:flex;
  align-items:flex-start;
  gap:11px;
  padding:14px 0;
  border-bottom:1px solid hsl(var(--border));
}
.task-item:last-child{border-bottom:0}
.task-item:hover{
  background:linear-gradient(90deg,hsl(var(--primary)/.025),transparent);
}
.task-checkbox{margin-top:2px}
.task-main{min-width:0;flex:1}
.task-title-row{
  display:flex;
  align-items:flex-start;
  gap:8px;
}
.task-title{
  min-width:0;
  flex:1;
  font-size:12px;
  font-weight:800;
  line-height:1.45;
}
.task-title.completed{
  color:hsl(var(--muted-foreground));
  text-decoration:line-through;
}
.task-meta{
  display:flex;
  flex-wrap:wrap;
  gap:7px;
  margin-top:6px;
  color:hsl(var(--muted-foreground));
  font-size:9px;
}
.task-meta-item{
  display:inline-flex;
  align-items:center;
  gap:3px;
}
.task-side{
  display:flex;
  align-items:center;
  gap:7px;
}
.priority-badge{
  padding:4px 7px;
  border:1px solid transparent;
  border-radius:999px;
  font-size:9px;
  font-weight:900;
  text-transform:capitalize;
}
.task-chevron{
  display:grid;
  place-items:center;
  width:28px;
  height:28px;
  border:1px solid hsl(var(--border));
  border-radius:8px;
  background:hsl(var(--background));
  color:hsl(var(--muted-foreground));
  cursor:pointer;
}
.weather-tag{
  display:inline-flex;
  align-items:center;
  gap:3px;
  padding:3px 6px;
  border-radius:999px;
  background:hsl(var(--chart-2)/.1);
  color:hsl(var(--primary));
  font-size:8px;
  font-weight:900;
}
.cost-tag{
  display:inline-flex;
  align-items:center;
  gap:3px;
  padding:3px 6px;
  border-radius:999px;
  background:hsl(var(--accent));
  color:hsl(var(--foreground));
  font-size:8px;
  font-weight:800;
}
.task-modal-backdrop{
  position:fixed;
  z-index:100;
  inset:0;
  display:grid;
  place-items:center;
  padding:18px;
  background:hsl(var(--foreground)/.55);
  backdrop-filter:blur(8px);
}
.task-modal{
  width:min(680px,100%);
  max-height:92vh;
  overflow-y:auto;
  border:1px solid hsl(var(--border));
  border-radius:22px;
  background:hsl(var(--card));
  box-shadow:0 35px 100px hsl(var(--foreground)/.25);
}
.task-modal-header{
  position:sticky;
  top:0;
  z-index:3;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:17px 19px;
  border-bottom:1px solid hsl(var(--border));
  background:hsl(var(--card)/.95);
  backdrop-filter:blur(15px);
}
.task-modal-title{font-size:15px;font-weight:900}
.task-modal-close{
  display:grid;
  place-items:center;
  width:34px;
  height:34px;
  border:1px solid hsl(var(--border));
  border-radius:9px;
  background:hsl(var(--background));
  cursor:pointer;
}
.task-modal-body{padding:20px}
.detail-hero{
  padding:16px;
  border-radius:15px;
  background:linear-gradient(135deg,hsl(var(--primary)/.1),transparent);
}
.detail-title{font-size:18px;font-weight:950}
.detail-grid{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:10px;
  margin-top:15px;
}
.detail-box{
  padding:12px;
  border:1px solid hsl(var(--border));
  border-radius:12px;
}
.detail-label{
  color:hsl(var(--muted-foreground));
  font-size:9px;
  font-weight:800;
  text-transform:uppercase;
}
.detail-value{
  margin-top:4px;
  font-size:11px;
  font-weight:900;
}
.form-grid{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:14px;
}
.form-full{grid-column:1/-1}
.form-label{
  display:block;
  margin-bottom:6px;
  color:hsl(var(--muted-foreground));
  font-size:10px;
  font-weight:900;
  text-transform:uppercase;
}
.form-input,.form-select,.form-textarea{
  width:100%;
  border:1px solid hsl(var(--border));
  border-radius:11px;
  outline:none;
  background:hsl(var(--background));
  color:hsl(var(--foreground));
  font-size:12px;
}
.form-input,.form-select{height:43px;padding:0 11px}
.form-textarea{min-height:90px;padding:10px 11px;resize:vertical}
.form-input:focus,.form-select:focus,.form-textarea:focus{
  border-color:hsl(var(--primary)/.5);
  box-shadow:0 0 0 4px hsl(var(--primary)/.06);
}
.toggle-row{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  padding:12px;
  border:1px solid hsl(var(--border));
  border-radius:12px;
}
.toggle-title{font-size:11px;font-weight:900}
.toggle-description{
  margin-top:2px;
  color:hsl(var(--muted-foreground));
  font-size:9px;
}
.modal-footer{
  display:flex;
  justify-content:flex-end;
  gap:8px;
  margin-top:18px;
  padding-top:15px;
  border-top:1px solid hsl(var(--border));
}
.success-box{
  margin-top:15px;
  padding:12px;
  border:1px solid hsl(var(--primary)/.2);
  border-radius:12px;
  background:hsl(var(--primary)/.05);
  color:hsl(var(--muted-foreground));
  font-size:10px;
}
.offline-box{
  display:flex;
  gap:9px;
  align-items:center;
  margin-top:18px;
  padding:11px 13px;
  border:1px dashed hsl(var(--border));
  border-radius:12px;
  color:hsl(var(--muted-foreground));
  font-size:9px;
}
@media(max-width:1150px){
  .task-stat-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
  .task-dashboard-grid{grid-template-columns:1fr}
}
@media(max-width:900px){
  .task-hero-grid{grid-template-columns:1fr}
  .task-board{grid-template-columns:1fr}
  .smart-strip{grid-template-columns:1fr}
  .category-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .toolbar-main{flex-wrap:wrap}
  .task-search{flex-basis:100%}
}
@media(max-width:650px){
  .task-hero{padding:23px}
  .task-stat-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .category-grid{grid-template-columns:1fr}
  .task-select{flex:1}
  .task-hero-actions{flex-direction:column}
  .task-hero-actions button{width:100%}
  .task-side .priority-badge{display:none}
  .detail-grid,.form-grid{grid-template-columns:1fr}
  .form-full{grid-column:auto}
}
@media print{
  .task-hero-actions,.task-toolbar,.task-modal-backdrop,button{display:none!important}
  .task-page{background:white}
  .task-hero,.task-stat,.task-panel,.task-section{
    box-shadow:none!important;
    break-inside:avoid;
  }
}
`;

function normalizeDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function localDateInput(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isSameDay(dateValue: string) {
  const date = normalizeDate(dateValue);
  if (!date) return false;
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function isOverdue(task: ExtendedTask) {
  if (task.done) return false;
  const date = normalizeDate(task.due);
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date < today;
}

function categoryIcon(category: string) {
  const value = category.toLowerCase();
  if (value.includes("water") || value.includes("irrigation")) return Droplets;
  if (value.includes("spray") || value.includes("pest") || value.includes("disease"))
    return ShieldCheck;
  if (value.includes("harvest") || value.includes("crop")) return Wheat;
  if (value.includes("animal") || value.includes("livestock")) return Users;
  if (value.includes("tractor") || value.includes("machine")) return Tractor;
  if (value.includes("fertil") || value.includes("seed")) return Sprout;
  return ListChecks;
}

function createEmptyForm(): TaskForm {
  return {
    title: "",
    field: "",
    crop: "",
    due: localDateInput(),
    category: "Irrigation",
    priority: "medium",
    notes: "",
    estimatedCost: "",
    quantity: "",
    labour: "",
    weatherSensitive: false,
    reminder: true,
    reminderTime: "06:00",
    recurring: "none",
  };
}

function toExtendedTask(task: FarmTask): ExtendedTask {
  const raw = task as FarmTask & Partial<ExtendedTask>;
  return {
    ...task,
    id: String(task.id),
    title: task.title,
    field: task.field,
    category: task.category,
    priority: task.priority,
    due: task.due,
    done: Boolean(task.done),
    crop: raw.crop ?? "",
    notes: raw.notes ?? "",
    estimatedCost: Number(raw.estimatedCost ?? 0),
    quantity: raw.quantity ?? "",
    labour: Number(raw.labour ?? 0),
    weatherSensitive: Boolean(raw.weatherSensitive),
    reminder: Boolean(raw.reminder),
    reminderTime: raw.reminderTime ?? "06:00",
    recurring: raw.recurring ?? "none",
    createdAt: raw.createdAt,
  };
}

function taskPayload(form: TaskForm) {
  return {
    title: form.title.trim(),
    field: form.field.trim(),
    crop: form.crop,
    due: form.due,
    category: form.category,
    priority: form.priority,
    notes: form.notes.trim(),
    estimatedCost: Number(form.estimatedCost || 0),
    quantity: form.quantity.trim(),
    labour: Number(form.labour || 0),
    weatherSensitive: form.weatherSensitive,
    reminder: form.reminder,
    reminderTime: form.reminderTime,
    recurring: form.recurring,
    done: false,
  };
}

export default function FarmTaskPlanner() {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["farm-tasks"],
    queryFn: agricultureApi.getTasks,
  });

  const [tasks, setTasks] = useState<ExtendedTask[]>([]);
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All priorities");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [sortMode, setSortMode] = useState<SortMode>("priority");
  const [selectedTask, setSelectedTask] = useState<ExtendedTask | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState<ExtendedTask | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  const [form, setForm] = useState<TaskForm>(createEmptyForm);
  const [formError, setFormError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (data) setTasks(data.map(toExtendedTask));
  }, [data]);

  useEffect(() => {
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    };
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (
        event.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          (event.target as HTMLElement)?.tagName,
        )
      ) {
        event.preventDefault();
        document.getElementById("farm-task-search")?.focus();
      }
      if (event.key === "Escape") {
        setSelectedTask(null);
        setShowAddTask(false);
        setEditingTask(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const pending = tasks.filter((task) => !task.done).length;
  const completed = tasks.filter((task) => task.done).length;
  const urgent = tasks.filter(
    (task) => !task.done && task.priority === "high",
  ).length;
  const overdue = tasks.filter(isOverdue).length;
  const todayTasks = tasks.filter(
    (task) => !task.done && isSameDay(task.due),
  ).length;
  const weatherSensitive = tasks.filter(
    (task) => !task.done && task.weatherSensitive,
  ).length;
  const totalPlannedCost = tasks.reduce(
    (sum, task) => sum + Number(task.estimatedCost || 0),
    0,
  );
  const completionRate =
    tasks.length > 0 ? (completed / tasks.length) * 100 : 0;

  const categories = useMemo(
    () => [
      "All categories",
      ...Array.from(
        new Set(tasks.map((task) => task.category).filter(Boolean)),
      ),
    ],
    [tasks],
  );

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = tasks.filter((task) => {
      const searchable = [
        task.title,
        task.field,
        task.category,
        task.priority,
        task.crop,
        task.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchable.includes(query);

      const matchesFilter =
        filter === "all"
          ? true
          : filter === "done"
            ? task.done
            : filter === "pending"
              ? !task.done
              : filter === "urgent"
                ? !task.done && task.priority === "high"
                : filter === "today"
                  ? !task.done && isSameDay(task.due)
                  : filter === "overdue"
                    ? isOverdue(task)
                    : filter === "weather"
                      ? !task.done && Boolean(task.weatherSensitive)
                      : true;

      const matchesPriority =
        priorityFilter === "All priorities" ||
        task.priority === priorityFilter.toLowerCase();

      const matchesCategory =
        categoryFilter === "All categories" ||
        task.category === categoryFilter;

      return (
        matchesSearch &&
        matchesFilter &&
        matchesPriority &&
        matchesCategory
      );
    });

    return [...result].sort((a, b) => {
      if (sortMode === "alphabetical") {
        return a.title.localeCompare(b.title);
      }

      if (sortMode === "date") {
        return (
          (normalizeDate(a.due)?.getTime() ?? 0) -
          (normalizeDate(b.due)?.getTime() ?? 0)
        );
      }

      if (sortMode === "status") {
        return Number(a.done) - Number(b.done);
      }

      if (sortMode === "cost") {
        return Number(b.estimatedCost || 0) - Number(a.estimatedCost || 0);
      }

      return priorityRank[b.priority] - priorityRank[a.priority];
    });
  }, [
    tasks,
    filter,
    search,
    priorityFilter,
    categoryFilter,
    sortMode,
  ]);

  const fieldWorkload = useMemo(() => {
    const map: Record<string, { total: number; completed: number }> = {};

    tasks.forEach((task) => {
      const field = task.field || "Unassigned field";
      if (!map[field]) map[field] = { total: 0, completed: 0 };
      map[field].total += 1;
      if (task.done) map[field].completed += 1;
    });

    return Object.entries(map)
      .map(([field, values]) => ({
        field,
        ...values,
        rate:
          values.total > 0
            ? (values.completed / values.total) * 100
            : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [tasks]);

  const categoryStats = useMemo(() => {
    const map: Record<string, number> = {};
    tasks.forEach((task) => {
      map[task.category] = (map[task.category] ?? 0) + 1;
    });
    return Object.entries(map)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }, [tasks]);

  const todayList = useMemo(
    () =>
      tasks
        .filter((task) => !task.done && isSameDay(task.due))
        .sort(
          (a, b) =>
            priorityRank[b.priority] - priorityRank[a.priority],
        )
        .slice(0, 5),
    [tasks],
  );

  const createMutation = useMutation({
    mutationFn: async (payload: ReturnType<typeof taskPayload>) => {
      const response = await api.post("/tasks/", payload);
      return response.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Record<string, unknown>;
    }) => {
      const response = await api.patch(`/tasks/${id}/`, payload);
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/tasks/${id}/`);
      return id;
    },
  });

  const resetFilters = () => {
    setSearch("");
    setFilter("all");
    setPriorityFilter("All priorities");
    setCategoryFilter("All categories");
    setSortMode("priority");
  };

  const toggle = async (id: string) => {
    const current = tasks.find((task) => task.id === id);
    if (!current) return;

    const nextDone = !current.done;
    setBusyTaskId(id);

    setTasks((previous) =>
      previous.map((task) =>
        task.id === id ? { ...task, done: nextDone } : task,
      ),
    );

    if (!isOnline) {
      setBusyTaskId(null);
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id,
        payload: { done: nextDone },
      });
      queryClient.invalidateQueries({ queryKey: ["farm-tasks"] });
    } catch {
      setTasks((previous) =>
        previous.map((task) =>
          task.id === id ? { ...task, done: current.done } : task,
        ),
      );
    } finally {
      setBusyTaskId(null);
    }
  };

  const openCreate = () => {
    setEditingTask(null);
    setForm(createEmptyForm());
    setFormError("");
    setSaveSuccess(false);
    setShowAddTask(true);
  };

  const openEdit = (task: ExtendedTask) => {
    setSelectedTask(null);
    setEditingTask(task);
    setForm({
      title: task.title,
      field: task.field,
      crop: task.crop ?? "",
      due: task.due.slice(0, 10),
      category: task.category,
      priority: task.priority,
      notes: task.notes ?? "",
      estimatedCost: String(task.estimatedCost ?? ""),
      quantity: task.quantity ?? "",
      labour: String(task.labour ?? ""),
      weatherSensitive: Boolean(task.weatherSensitive),
      reminder: Boolean(task.reminder),
      reminderTime: task.reminderTime ?? "06:00",
      recurring: task.recurring ?? "none",
    });
    setFormError("");
    setSaveSuccess(false);
    setShowAddTask(true);
  };

  const saveTask = async (event: FormEvent) => {
    event.preventDefault();
    setFormError("");
    setSaveSuccess(false);

    if (!form.title.trim()) {
      setFormError("Please enter a task name.");
      return;
    }

    if (!form.field.trim()) {
      setFormError("Please enter the field or farm area.");
      return;
    }

    if (!form.due) {
      setFormError("Please select a due date.");
      return;
    }

    const payload = taskPayload(form);

    try {
      if (editingTask) {
        if (!isOnline) {
          setTasks((previous) =>
            previous.map((task) =>
              task.id === editingTask.id
                ? {
                    ...task,
                    ...payload,
                    id: editingTask.id,
                    estimatedCost: payload.estimatedCost,
                    labour: payload.labour,
                  }
                : task,
            ),
          );
        } else {
          const updated = await updateMutation.mutateAsync({
            id: editingTask.id,
            payload,
          });
          setTasks((previous) =>
            previous.map((task) =>
              task.id === editingTask.id
                ? toExtendedTask(updated)
                : task,
            ),
          );
        }
      } else {
        if (!isOnline) {
          const localTask: ExtendedTask = {
            ...(payload as unknown as FarmTask),
            id: `local-${Date.now()}`,
            title: payload.title,
            field: payload.field,
            category: payload.category,
            priority: payload.priority,
            due: payload.due,
            done: false,
            crop: payload.crop,
            notes: payload.notes,
            estimatedCost: payload.estimatedCost,
            quantity: payload.quantity,
            labour: payload.labour,
            weatherSensitive: payload.weatherSensitive,
            reminder: payload.reminder,
            reminderTime: payload.reminderTime,
            recurring: payload.recurring,
            createdAt: new Date().toISOString(),
          };
          setTasks((previous) => [localTask, ...previous]);
        } else {
          const created = await createMutation.mutateAsync(payload);
          setTasks((previous) => [toExtendedTask(created), ...previous]);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["farm-tasks"] });
      setSaveSuccess(true);

      window.setTimeout(() => {
        setShowAddTask(false);
        setEditingTask(null);
        setSaveSuccess(false);
      }, 700);
    } catch {
      setFormError(
        "The task could not be saved. Check your backend /api/tasks/ endpoint and try again.",
      );
    }
  };

  const removeTask = async (task: ExtendedTask) => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;

    try {
      if (isOnline && !task.id.startsWith("local-")) {
        await deleteMutation.mutateAsync(task.id);
      }

      setTasks((previous) =>
        previous.filter((item) => item.id !== task.id),
      );
      setSelectedTask(null);
      queryClient.invalidateQueries({ queryKey: ["farm-tasks"] });
    } catch {
      window.alert("Unable to delete this task right now.");
    }
  };

  const clearFilters = resetFilters;

  if (isError && !tasks.length) {
    return (
      <div className="task-page">
        <style>{pageStyles}</style>
        <AgriculturePageHeader
          icon={ListTodo}
          title="Farm Task Planner"
          description="Plan, prioritize and complete real farm operations from one field-work dashboard."
        />
        <div className="py-20 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-destructive/10 text-destructive">
            <RefreshCw size={26} />
          </div>
          <h3 className="mt-4 text-lg font-black">
            Unable to load farm tasks
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            The task service could not be reached. Check that your Django API
            is running and try again.
          </p>
          <Button className="mt-5" onClick={() => refetch()}>
            <RefreshCw className="mr-2 size-4" />
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="task-page">
        <style>{pageStyles}</style>
        <AgriculturePageHeader
          icon={ListTodo}
          title="Farm Task Planner"
          description="Plan, prioritize and complete real farm operations from one field-work dashboard."
        />
        <LoadingState rows={6} />
      </div>
    );
  }

  return (
    <div className="task-page">
      <style>{pageStyles}</style>

      <AgriculturePageHeader
        icon={ListTodo}
        title="Farm Task Planner"
        description="Plan, prioritize and complete real farm operations from one field-work dashboard."
      />

      <section className="task-hero">
        <div className="task-hero-grid">
          <div>
            <div className="task-kicker">
              <Activity size={13} />
              Smart Farm Operations
            </div>

            <h1 className="task-hero-title">
              Turn farm work into
              <br />
              <span>actionable field plans.</span>
            </h1>

            <p className="task-hero-description">
              Manage irrigation, sowing, fertilizer application, spraying,
              crop monitoring, harvesting, machinery maintenance and labour
              activities in one operational dashboard. Tasks can carry field,
              crop, cost, labour, reminder and weather-sensitivity information
              so the planner supports actual farm decisions.
            </p>

            <div className="task-hero-actions">
              <Button onClick={openCreate}>
                <Plus className="mr-2 size-4" />
                Create farm task
              </Button>

              <Button variant="outline" onClick={() => window.print()}>
                <Calendar className="mr-2 size-4" />
                Print schedule
              </Button>

              <Button
                variant="ghost"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCw
                  className={`mr-2 size-4 ${
                    isFetching ? "animate-spin" : ""
                  }`}
                />
                Sync tasks
              </Button>
            </div>
          </div>

          <div className="productivity-card">
            <div className="productivity-label">
              Farm execution score
            </div>

            <div className="productivity-number">
              {Math.round(completionRate)}%
            </div>

            <div className="productivity-status">
              <TrendingUp size={13} />
              {completed} completed operations
            </div>

            <div className="productivity-track">
              <div
                className="productivity-fill"
                style={{ width: `${completionRate}%` }}
              />
            </div>

            <div className="productivity-footer">
              <span>{completed} completed</span>
              <span>{pending} remaining</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-[9px]">
              <div className="rounded-xl bg-accent/60 p-3">
                <div className="text-muted-foreground">Planned cost</div>
                <strong className="mt-1 block text-xs">
                  ₹{totalPlannedCost.toLocaleString("en-IN")}
                </strong>
              </div>
              <div className="rounded-xl bg-accent/60 p-3">
                <div className="text-muted-foreground">Field operations</div>
                <strong className="mt-1 block text-xs">{tasks.length}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="task-stat-grid">
        <div className="task-stat">
          <div className="task-stat-icon">
            <ListTodo size={20} />
          </div>
          <div className="task-stat-value">{pending}</div>
          <div className="task-stat-label">Pending operations</div>
          <div className="task-stat-meta">
            <Clock size={12} />
            Work remaining
          </div>
        </div>

        <div className="task-stat">
          <div className="task-stat-icon">
            <TriangleAlert size={20} />
          </div>
          <div className="task-stat-value">{urgent}</div>
          <div className="task-stat-label">High priority</div>
          <div className="task-stat-meta">
            {urgent > 0 ? (
              <>
                <ArrowUp size={12} />
                Do these first
              </>
            ) : (
              <>
                <Check size={12} />
                No critical jobs
              </>
            )}
          </div>
        </div>

        <div className="task-stat">
          <div className="task-stat-icon">
            <CalendarCheck size={20} />
          </div>
          <div className="task-stat-value">{todayTasks}</div>
          <div className="task-stat-label">Due today</div>
          <div className="task-stat-meta">
            <Calendar size={12} />
            Today's operations
          </div>
        </div>

        <div className="task-stat">
          <div className="task-stat-icon">
            <AlertCircle size={20} />
          </div>
          <div className="task-stat-value">{overdue}</div>
          <div className="task-stat-label">Overdue</div>
          <div className="task-stat-meta">
            {overdue > 0 ? (
              <>
                <AlertTriangle size={12} />
                Needs attention
              </>
            ) : (
              <>
                <CheckCircle2 size={12} />
                Schedule on track
              </>
            )}
          </div>
        </div>

        <div className="task-stat">
          <div className="task-stat-icon">
            <CloudRain size={20} />
          </div>
          <div className="task-stat-value">{weatherSensitive}</div>
          <div className="task-stat-label">Weather-sensitive</div>
          <div className="task-stat-meta">
            <CloudRain size={12} />
            Review before work
          </div>
        </div>
      </section>

      {(overdue > 0 || weatherSensitive > 0) && (
        <div className="task-alert">
          <div className="task-alert-icon">
            <AlertTriangle size={17} />
          </div>
          <div>
            <div className="task-alert-title">
              Farm schedule needs a weather and delay review
            </div>
            <div className="task-alert-text">
              {overdue > 0 &&
                `${overdue} operation${overdue > 1 ? "s are" : " is"} overdue. `}
              {weatherSensitive > 0 &&
                `${weatherSensitive} pending task${
                  weatherSensitive > 1 ? "s are" : " is"
                } marked weather-sensitive. `}
              Before spraying, irrigation or fertilizer work, review the
              latest weather conditions and adjust the field schedule when
              necessary.
            </div>
          </div>
        </div>
      )}

      <section className="smart-strip">
        <div className="smart-card">
          <div className="smart-icon">
            <CloudRain size={18} />
          </div>
          <div>
            <div className="smart-title">Weather-aware planning</div>
            <div className="smart-text">
              Flag operations that should be reviewed before rain, high wind
              or unsuitable field conditions.
            </div>
          </div>
        </div>

        <div className="smart-card">
          <div className="smart-icon">
            <Gauge size={18} />
          </div>
          <div>
            <div className="smart-title">Cost visibility</div>
            <div className="smart-text">
              Record estimated operation costs and labour so task planning can
              feed your farm profitability workflow.
            </div>
          </div>
        </div>

        <div className="smart-card">
          <div className="smart-icon">
            <Bell size={18} />
          </div>
          <div>
            <div className="smart-title">Action reminders</div>
            <div className="smart-text">
              Store reminder preferences with the operation instead of keeping
              critical farm work only in memory.
            </div>
          </div>
        </div>
      </section>

      {!isOnline && (
        <div className="offline-box">
          <AlertCircle className="size-4" />
          <span>
            You are offline. New changes are kept in this page session and
            will not reach the Django server until the connection is restored.
          </span>
        </div>
      )}

      <section className="task-dashboard-grid">
        <div className="task-panel">
          <div className="task-panel-title">
            <span>Today's field operations</span>
            <Badge variant="secondary">{todayTasks} scheduled</Badge>
          </div>
          <div className="task-panel-subtitle">
            Prioritized work that should be reviewed and executed today.
          </div>

          {todayList.length ? (
            <div className="today-list">
              {todayList.map((task) => {
                const Icon = categoryIcon(task.category);
                return (
                  <div className="today-item" key={task.id}>
                    <div className="today-time">TODAY</div>

                    <div className="today-content">
                      <div className="today-title">{task.title}</div>
                      <div className="today-meta">
                        <span>
                          <MapPin size={10} className="inline" />{" "}
                          {task.field}
                        </span>
                        <span>
                          <Icon size={10} className="inline" />{" "}
                          {task.category}
                        </span>
                        {task.crop && <span>{task.crop}</span>}
                      </div>
                    </div>

                    <Badge
                      variant="secondary"
                      className={priorityTone[task.priority]}
                    >
                      {task.priority}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-10 text-center text-xs text-muted-foreground">
              <CheckCircle2 className="mx-auto mb-2 size-7 text-primary" />
              No pending tasks are due today.
            </div>
          )}
        </div>

        <div className="task-panel">
          <div className="task-panel-title">
            <span>Field workload</span>
            <Gauge size={17} className="text-primary" />
          </div>
          <div className="task-panel-subtitle">
            Operational progress across your fields.
          </div>

          <div className="field-list">
            {fieldWorkload.length ? (
              fieldWorkload.slice(0, 6).map((field) => (
                <div className="field-row" key={field.field}>
                  <div className="field-row-head">
                    <span className="field-name">{field.field}</span>
                    <span className="field-count">
                      {field.completed}/{field.total} done
                    </span>
                  </div>
                  <div className="field-progress">
                    <div
                      className="field-progress-fill"
                      style={{ width: `${field.rate}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-muted-foreground">
                Add a task with a field to see workload distribution.
              </div>
            )}
          </div>
        </div>
      </section>

      <ChartCard
        title="Farm operation categories"
        description="See which types of work consume the most operational attention."
        action={
          <Badge variant="secondary">
            {categoryStats.length} categories
          </Badge>
        }
      >
        <div className="category-grid">
          {categoryStats.slice(0, 8).map((item) => {
            const Icon = categoryIcon(item.category);
            return (
              <div className="category-card" key={item.category}>
                <div className="category-icon">
                  <Icon size={17} />
                </div>
                <div className="category-card-title">{item.category}</div>
                <div className="category-card-value">{item.count}</div>
                <div className="mt-1 text-[9px] text-muted-foreground">
                  scheduled operations
                </div>
              </div>
            );
          })}
        </div>
      </ChartCard>

      <section className="task-toolbar">
        <div className="toolbar-main">
          <div className="task-search">
            <Search size={16} />
            <input
              id="farm-task-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search task, field, crop, operation or notes..."
            />
          </div>

          <select
            className="task-select"
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
          >
            <option>All priorities</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          <select
            className="task-select"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>

          <select
            className="task-select"
            value={sortMode}
            onChange={(event) =>
              setSortMode(event.target.value as SortMode)
            }
          >
            <option value="priority">Priority first</option>
            <option value="date">Due date</option>
            <option value="alphabetical">A-Z</option>
            <option value="status">Pending first</option>
            <option value="cost">Highest cost</option>
          </select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters((value) => !value)}
            title="Filters"
          >
            <Filter size={16} />
          </Button>
        </div>

        <div className="task-tabs">
          <button
            className={`task-tab ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            <ListChecks size={12} />
            All
          </button>

          <button
            className={`task-tab ${filter === "pending" ? "active" : ""}`}
            onClick={() => setFilter("pending")}
          >
            <Clock size={12} />
            Pending
          </button>

          <button
            className={`task-tab ${filter === "today" ? "active" : ""}`}
            onClick={() => setFilter("today")}
          >
            <Calendar size={12} />
            Today
          </button>

          <button
            className={`task-tab ${filter === "urgent" ? "active" : ""}`}
            onClick={() => setFilter("urgent")}
          >
            <TriangleAlert size={12} />
            Urgent
          </button>

          <button
            className={`task-tab ${filter === "overdue" ? "active" : ""}`}
            onClick={() => setFilter("overdue")}
          >
            <AlertCircle size={12} />
            Overdue
          </button>

          <button
            className={`task-tab ${filter === "weather" ? "active" : ""}`}
            onClick={() => setFilter("weather")}
          >
            <CloudRain size={12} />
            Weather-sensitive
          </button>

          <button
            className={`task-tab ${filter === "done" ? "active" : ""}`}
            onClick={() => setFilter("done")}
          >
            <CheckCircle2 size={12} />
            Completed
          </button>

          {showFilters && (
            <button className="task-tab" onClick={clearFilters}>
              <X size={12} />
              Clear filters
            </button>
          )}
        </div>
      </section>

      <section className="task-board">
        <div className="task-section">
          <div className="task-section-header">
            <div className="task-section-title">
              <Clock size={16} className="text-primary" />
              Active operations
            </div>
            <Badge variant="secondary">
              {visible.filter((task) => !task.done).length}
            </Badge>
          </div>

          <div className="task-section-body">
            {visible.filter((task) => !task.done).length ? (
              visible
                .filter((task) => !task.done)
                .map((task) => {
                  const Icon = categoryIcon(task.category);
                  const busy = busyTaskId === task.id;

                  return (
                    <div className="task-item" key={task.id}>
                      <Checkbox
                        checked={task.done}
                        disabled={busy}
                        onCheckedChange={() => toggle(task.id)}
                        className="task-checkbox"
                        aria-label={`Complete ${task.title}`}
                      />

                      <div className="task-main">
                        <div className="task-title-row">
                          <Icon
                            size={15}
                            className="mt-0.5 shrink-0 text-primary"
                          />
                          <div className="task-title">{task.title}</div>
                        </div>

                        <div className="task-meta">
                          <span className="task-meta-item">
                            <MapPin size={10} />
                            {task.field}
                          </span>

                          <span className="task-meta-item">
                            <Calendar size={10} />
                            {formatDate(task.due)}
                          </span>

                          {task.crop && (
                            <span className="task-meta-item">
                              <Leaf size={10} />
                              {task.crop}
                            </span>
                          )}

                          {task.estimatedCost ? (
                            <span className="cost-tag">
                              ₹
                              {Number(task.estimatedCost).toLocaleString(
                                "en-IN",
                              )}
                            </span>
                          ) : null}

                          {task.weatherSensitive && (
                            <span className="weather-tag">
                              <CloudRain size={9} />
                              Weather-sensitive
                            </span>
                          )}

                          {task.reminder && (
                            <span className="task-meta-item">
                              <Bell size={9} />
                              {task.reminderTime}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="task-side">
                        <span
                          className={`priority-badge ${priorityTone[task.priority]}`}
                        >
                          {task.priority}
                        </span>

                        <button
                          className="task-chevron"
                          onClick={() => setSelectedTask(task)}
                          title="Open task"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="py-12">
                <EmptyState
                  icon={CheckCircle2}
                  title="No active tasks"
                  description="Your current filters do not contain pending operations."
                />
              </div>
            )}
          </div>
        </div>

        <div className="task-section">
          <div className="task-section-header">
            <div className="task-section-title">
              <CheckCircle2 size={16} className="text-primary" />
              Completed operations
            </div>
            <Badge variant="secondary">
              {visible.filter((task) => task.done).length}
            </Badge>
          </div>

          <div className="task-section-body">
            {visible.filter((task) => task.done).length ? (
              visible
                .filter((task) => task.done)
                .map((task) => {
                  const Icon = categoryIcon(task.category);

                  return (
                    <div className="task-item" key={task.id}>
                      <Checkbox
                        checked
                        onCheckedChange={() => toggle(task.id)}
                        className="task-checkbox"
                        aria-label={`Reopen ${task.title}`}
                      />

                      <div className="task-main">
                        <div className="task-title-row">
                          <Icon
                            size={15}
                            className="mt-0.5 shrink-0 text-primary"
                          />
                          <div className="task-title completed">
                            {task.title}
                          </div>
                        </div>

                        <div className="task-meta">
                          <span className="task-meta-item">
                            <MapPin size={10} />
                            {task.field}
                          </span>
                          <span className="task-meta-item">
                            <Calendar size={10} />
                            {formatDate(task.due)}
                          </span>
                          {task.crop && (
                            <span className="task-meta-item">
                              <Leaf size={10} />
                              {task.crop}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="task-side">
                        <Badge variant="secondary">
                          <Check className="mr-1 size-3" />
                          Done
                        </Badge>

                        <button
                          className="task-chevron"
                          onClick={() => setSelectedTask(task)}
                          title="Open task"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="py-12 text-center text-xs text-muted-foreground">
                <ListTodo className="mx-auto mb-2 size-7 opacity-50" />
                Completed operations will appear here.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* TASK DETAILS */}
      {selectedTask && (
        <div
          className="task-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedTask(null);
            }
          }}
        >
          <div className="task-modal">
            <div className="task-modal-header">
              <div>
                <div className="task-modal-title">Task details</div>
                <div className="text-[10px] text-muted-foreground">
                  Farm operation record
                </div>
              </div>

              <button
                className="task-modal-close"
                onClick={() => setSelectedTask(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="task-modal-body">
              <div className="detail-hero">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={priorityTone[selectedTask.priority]}
                  >
                    {selectedTask.priority} priority
                  </Badge>

                  {selectedTask.done ? (
                    <Badge>
                      <Check className="mr-1 size-3" />
                      Completed
                    </Badge>
                  ) : isOverdue(selectedTask) ? (
                    <Badge variant="destructive">
                      <AlertTriangle className="mr-1 size-3" />
                      Overdue
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <Clock className="mr-1 size-3" />
                      Pending
                    </Badge>
                  )}

                  {selectedTask.weatherSensitive && (
                    <Badge variant="outline">
                      <CloudRain className="mr-1 size-3" />
                      Weather-sensitive
                    </Badge>
                  )}
                </div>

                <div className="detail-title mt-3">
                  {selectedTask.title}
                </div>

                {selectedTask.notes && (
                  <p className="mt-2 text-xs leading-6 text-muted-foreground">
                    {selectedTask.notes}
                  </p>
                )}
              </div>

              <div className="detail-grid">
                <div className="detail-box">
                  <div className="detail-label">Field</div>
                  <div className="detail-value">
                    <MapPin className="mr-1 inline size-3" />
                    {selectedTask.field}
                  </div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Crop</div>
                  <div className="detail-value">
                    <Leaf className="mr-1 inline size-3" />
                    {selectedTask.crop || "Not specified"}
                  </div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Operation</div>
                  <div className="detail-value">
                    {selectedTask.category}
                  </div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Due date</div>
                  <div className="detail-value">
                    <Calendar className="mr-1 inline size-3" />
                    {formatDate(selectedTask.due)}
                  </div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Estimated cost</div>
                  <div className="detail-value">
                    ₹
                    {Number(selectedTask.estimatedCost || 0).toLocaleString(
                      "en-IN",
                    )}
                  </div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Labour</div>
                  <div className="detail-value">
                    {selectedTask.labour || 0} worker
                    {(selectedTask.labour || 0) === 1 ? "" : "s"}
                  </div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Quantity</div>
                  <div className="detail-value">
                    {selectedTask.quantity || "Not specified"}
                  </div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Reminder</div>
                  <div className="detail-value">
                    {selectedTask.reminder
                      ? `Enabled at ${selectedTask.reminderTime}`
                      : "Not enabled"}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <Button
                  variant="outline"
                  onClick={() => openEdit(selectedTask)}
                >
                  <Edit3 className="mr-2 size-4" />
                  Edit
                </Button>

                <Button
                  variant="outline"
                  onClick={() => removeTask(selectedTask)}
                >
                  Delete
                </Button>

                <Button onClick={() => toggle(selectedTask.id)}>
                  {selectedTask.done ? (
                    <>
                      <ArrowDown className="mr-2 size-4" />
                      Mark pending
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 size-4" />
                      Mark completed
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT */}
      {showAddTask && (
        <div
          className="task-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowAddTask(false);
              setEditingTask(null);
            }
          }}
        >
          <form className="task-modal" onSubmit={saveTask}>
            <div className="task-modal-header">
              <div>
                <div className="task-modal-title">
                  {editingTask ? "Edit farm task" : "Create farm task"}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Capture enough operational information to make this useful
                  in real field work.
                </div>
              </div>

              <button
                type="button"
                className="task-modal-close"
                onClick={() => {
                  setShowAddTask(false);
                  setEditingTask(null);
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="task-modal-body">
              <div className="form-grid">
                <div className="form-full">
                  <label className="form-label">Task / operation name *</label>
                  <input
                    className="form-input"
                    value={form.title}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        title: event.target.value,
                      }))
                    }
                    placeholder="Example: Apply fertilizer to paddy Field A"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="form-label">Field / farm area *</label>
                  <input
                    className="form-input"
                    value={form.field}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        field: event.target.value,
                      }))
                    }
                    placeholder="North Field / Plot 2"
                  />
                </div>

                <div>
                  <label className="form-label">Crop</label>
                  <select
                    className="form-select"
                    value={form.crop}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        crop: event.target.value,
                      }))
                    }
                  >
                    <option value="">Select crop</option>
                    {CROP_OPTIONS.map((crop) => (
                      <option key={crop}>{crop}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Due date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={form.due}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        due: event.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="form-label">Operation category</label>
                  <select
                    className="form-select"
                    value={form.category}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        category: event.target.value,
                      }))
                    }
                  >
                    {OPERATION_OPTIONS.map((operation) => (
                      <option key={operation}>{operation}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Priority</label>
                  <select
                    className="form-select"
                    value={form.priority}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        priority: event.target.value as TaskForm["priority"],
                      }))
                    }
                  >
                    <option value="high">High — urgent field work</option>
                    <option value="medium">Medium — planned</option>
                    <option value="low">Low — can be scheduled</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Estimated cost (₹)</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={form.estimatedCost}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        estimatedCost: event.target.value,
                      }))
                    }
                    placeholder="500"
                  />
                </div>

                <div>
                  <label className="form-label">Labour requirement</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={form.labour}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        labour: event.target.value,
                      }))
                    }
                    placeholder="2"
                  />
                </div>

                <div className="form-full">
                  <label className="form-label">
                    Quantity / input requirement
                  </label>
                  <input
                    className="form-input"
                    value={form.quantity}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        quantity: event.target.value,
                      }))
                    }
                    placeholder="50 kg urea / 2 hours irrigation / 3 litres spray"
                  />
                </div>

                <div className="form-full">
                  <label className="form-label">Field instructions / notes</label>
                  <textarea
                    className="form-textarea"
                    value={form.notes}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        notes: event.target.value,
                      }))
                    }
                    placeholder="Record instructions, equipment, crop stage, safety notes, worker instructions, etc."
                  />
                </div>

                <div className="form-full">
                  <div className="toggle-row">
                    <div>
                      <div className="toggle-title">
                        Weather-sensitive operation
                      </div>
                      <div className="toggle-description">
                        Use this for spraying, irrigation, fertilizer and
                        other work where weather can affect timing.
                      </div>
                    </div>
                    <Checkbox
                      checked={form.weatherSensitive}
                      onCheckedChange={(checked) =>
                        setForm((previous) => ({
                          ...previous,
                          weatherSensitive: checked === true,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="form-full">
                  <div className="toggle-row">
                    <div>
                      <div className="toggle-title">Task reminder</div>
                      <div className="toggle-description">
                        Save a reminder time with this operation.
                      </div>
                    </div>
                    <Checkbox
                      checked={form.reminder}
                      onCheckedChange={(checked) =>
                        setForm((previous) => ({
                          ...previous,
                          reminder: checked === true,
                        }))
                      }
                    />
                  </div>
                </div>

                {form.reminder && (
                  <div>
                    <label className="form-label">Reminder time</label>
                    <input
                      type="time"
                      className="form-input"
                      value={form.reminderTime}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          reminderTime: event.target.value,
                        }))
                      }
                    />
                  </div>
                )}

                <div>
                  <label className="form-label">Repeat operation</label>
                  <select
                    className="form-select"
                    value={form.recurring}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        recurring: event.target.value as TaskForm["recurring"],
                      }))
                    }
                  >
                    <option value="none">One time</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              {form.weatherSensitive && (
                <div className="success-box">
                  <div className="flex gap-2">
                    <CloudRain className="size-4 shrink-0 text-primary" />
                    <span>
                      This operation is marked as weather-sensitive. In the
                      full AgriGo workflow, the weather service can use this
                      flag to recommend rescheduling before rain, high wind,
                      heat or other unsuitable conditions.
                    </span>
                  </div>
                </div>
              )}

              {formError && (
                <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
                  <div className="flex gap-2">
                    <AlertCircle className="size-4 shrink-0" />
                    {formError}
                  </div>
                </div>
              )}

              {saveSuccess && (
                <div className="success-box">
                  <div className="flex gap-2">
                    <CheckCircle2 className="size-4 shrink-0 text-primary" />
                    <span>
                      {editingTask
                        ? "Farm task updated successfully."
                        : "Farm task created successfully."}
                    </span>
                  </div>
                </div>
              )}

              <div className="modal-footer">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddTask(false);
                    setEditingTask(null);
                  }}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <RefreshCw className="mr-2 size-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingTask ? (
                        <Edit3 className="mr-2 size-4" />
                      ) : (
                        <Plus className="mr-2 size-4" />
                      )}
                      {editingTask ? "Save changes" : "Create task"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
