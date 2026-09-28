import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  CloudOff,
  Copy,
  ExternalLink,
  FileQuestion,
  Filter,
  Globe2,
  Headphones,
  LifeBuoy,
  MapPin,
  MessageCircle,
  MessageSquareText,
  Mic,
  PhoneCall,
  Search,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";

import { AgriculturePageHeader } from "@/components/agriculture/AgriculturePageHeader";
import { AlertCard } from "@/components/agriculture/AlertCard";
import { LoadingState } from "@/components/agriculture/Loadingstate";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { agricultureApi } from "@/services/agricultureApi";

/**
 * AgriGo Help Center
 *
 * Improvements over the original:
 * - Smart search with suggestions and recent searches
 * - Search result ranking instead of simple substring filtering
 * - Popular topics and quick actions
 * - Article-level helpful / not-helpful feedback
 * - Support request/ticket form
 * - Phone, WhatsApp-style and share actions without extra packages
 * - Browser voice-search support when available
 * - Service-status panel
 * - Offline-aware UI
 * - Language preference persisted locally
 * - Emergency assistance directory
 * - Print support
 * - Keyboard shortcut: "/" focuses help search
 * - Better empty, error and loading states
 *
 * Backend compatibility:
 * - Keeps agricultureApi.getHelpArticles()
 * - Does not require a new backend endpoint.
 * - Support ticket and feedback are stored locally as a front-end
 *   prototype until corresponding API endpoints are available.
 */

const HELPLINE = "1800 180 1551";
const SUPPORT_HOURS = "6:00 AM – 10:00 PM";
const WHATSAPP_NUMBER = "918001801551";

const STORAGE_KEYS = {
  recentSearches: "agrigo_help_recent_searches",
  language: "agrigo_help_language",
  feedback: "agrigo_help_feedback",
  tickets: "agrigo_help_tickets",
};

const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "hi", label: "Hindi", native: "हिंदी" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "mr", label: "Marathi", native: "मराठी" },
];

const QUICK_TOPICS = [
  {
    title: "Manage my farm",
    description: "Fields, crops, farm profile and crop records.",
    query: "field crop farm",
    icon: "sprout",
  },
  {
    title: "Market & mandi",
    description: "Prices, marketplace, selling and buying help.",
    query: "market mandi price marketplace",
    icon: "market",
  },
  {
    title: "Weather & alerts",
    description: "Weather warnings, crop alerts and notifications.",
    query: "weather alert notification",
    icon: "alert",
  },
  {
    title: "Soil & crop advice",
    description: "Soil reports, fertilizer and crop recommendations.",
    query: "soil fertilizer crop recommendation",
    icon: "soil",
  },
  {
    title: "Disease detection",
    description: "Plant disease scanning and model-related help.",
    query: "disease detection plant image",
    icon: "disease",
  },
  {
    title: "Government schemes",
    description: "Scheme information, eligibility and application.",
    query: "government scheme subsidy",
    icon: "scheme",
  },
  {
    title: "Equipment rental",
    description: "Find, book and manage agricultural equipment.",
    query: "equipment rental booking tractor",
    icon: "equipment",
  },
  {
    title: "Account & security",
    description: "Login, profile, password and account assistance.",
    query: "account login password security",
    icon: "security",
  },
];

const SERVICE_STATUS = [
  {
    name: "Help articles",
    status: "Operational",
    description: "Knowledge base and FAQs",
  },
  {
    name: "Weather alerts",
    status: "Operational",
    description: "Weather and crop notifications",
  },
  {
    name: "Market prices",
    status: "Operational",
    description: "Mandi and market information",
  },
  {
    name: "AI services",
    status: "Monitoring",
    description: "Disease and recommendation services",
  },
];

const EMERGENCY_SERVICES = [
  {
    title: "Agriculture support",
    description: "For crop, farming and agricultural information.",
    action: "Call helpline",
    href: `tel:${HELPLINE.replace(/\s/g, "")}`,
    icon: PhoneCall,
  },
  {
    title: "Local agriculture officer",
    description: "For field-level or district agricultural assistance.",
    action: "Find local office",
    href: "#local-agriculture-office",
    icon: MapPin,
  },
  {
    title: "Veterinary support",
    description: "For livestock situations requiring professional care.",
    action: "Contact local service",
    href: "#veterinary-support",
    icon: LifeBuoy,
  },
];

const styles = `
.help-page {
  min-height: 100vh;
  padding-bottom: 90px;
  background:
    radial-gradient(circle at 0% 0%, hsl(var(--primary) / .10), transparent 30%),
    radial-gradient(circle at 100% 12%, hsl(var(--chart-2) / .08), transparent 30%),
    hsl(var(--background));
}

.help-shell {
  width: min(1440px, calc(100% - 32px));
  margin: 0 auto;
}

.help-hero {
  position: relative;
  overflow: hidden;
  margin-top: 24px;
  padding: clamp(24px, 4vw, 42px);
  border: 1px solid hsl(var(--border));
  border-radius: 30px;
  background:
    linear-gradient(135deg, hsl(var(--primary) / .15), hsl(var(--card)) 62%),
    hsl(var(--card));
  box-shadow: 0 28px 80px hsl(var(--foreground) / .08);
}

.help-hero::before,
.help-hero::after {
  content: "";
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
}

.help-hero::before {
  width: 460px;
  height: 460px;
  right: -190px;
  top: -290px;
  background: hsl(var(--primary) / .08);
}

.help-hero::after {
  width: 250px;
  height: 250px;
  left: 42%;
  bottom: -205px;
  background: hsl(var(--chart-2) / .08);
}

.help-hero-grid {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(300px, .6fr);
  gap: 32px;
  align-items: center;
}

.help-kicker {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 12px;
  border-radius: 999px;
  background: hsl(var(--primary) / .11);
  color: hsl(var(--primary));
  font-size: 10px;
  font-weight: 950;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.help-title {
  margin-top: 16px;
  font-size: clamp(36px, 5.5vw, 64px);
  line-height: .96;
  font-weight: 950;
  letter-spacing: -.065em;
}

.help-title span {
  color: hsl(var(--primary));
}

.help-description {
  max-width: 720px;
  margin-top: 18px;
  color: hsl(var(--muted-foreground));
  font-size: 14px;
  line-height: 1.8;
}

.help-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin-top: 24px;
}

.support-status {
  padding: 22px;
  border: 1px solid hsl(var(--border));
  border-radius: 22px;
  background: hsl(var(--background) / .72);
  backdrop-filter: blur(18px);
}

.support-status-top,
.card-header-row,
.section-heading,
.feedback-panel,
.status-row,
.emergency-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.support-status-icon,
.help-stat-icon,
.quick-help-icon,
.support-card-icon,
.offline-icon,
.section-icon {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  background: hsl(var(--primary) / .10);
  color: hsl(var(--primary));
}

.support-status-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
}

.live-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: hsl(var(--primary));
  box-shadow: 0 0 0 5px hsl(var(--primary) / .10);
}

.support-status-title {
  margin-top: 17px;
  font-size: 17px;
  font-weight: 950;
}

.support-status-text {
  margin-top: 5px;
  color: hsl(var(--muted-foreground));
  font-size: 10px;
  line-height: 1.65;
}

.support-hours {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 14px;
  padding-top: 13px;
  border-top: 1px solid hsl(var(--border));
  color: hsl(var(--primary));
  font-size: 10px;
  font-weight: 900;
}

.search-panel {
  position: relative;
  margin-top: 22px;
  padding: 18px;
  border: 1px solid hsl(var(--border));
  border-radius: 21px;
  background: hsl(var(--card));
  box-shadow: 0 14px 45px hsl(var(--foreground) / .05);
}

.search-box {
  position: relative;
}

.search-box > svg {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: hsl(var(--muted-foreground));
  pointer-events: none;
}

.search-box input {
  height: 54px;
  padding-left: 46px;
  padding-right: 90px;
  border-radius: 14px;
  font-size: 13px;
}

.search-tools {
  position: absolute;
  right: 8px;
  top: 50%;
  display: flex;
  align-items: center;
  gap: 4px;
  transform: translateY(-50%);
}

.search-tool {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
}

.search-tool:hover {
  background: hsl(var(--muted));
  color: hsl(var(--foreground));
}

.search-hint {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 9px;
  color: hsl(var(--muted-foreground));
  font-size: 9px;
}

.search-shortcut {
  padding: 3px 7px;
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  font-weight: 800;
}

.suggestion-panel {
  position: absolute;
  z-index: 20;
  left: 18px;
  right: 18px;
  top: 91px;
  overflow: hidden;
  border: 1px solid hsl(var(--border));
  border-radius: 14px;
  background: hsl(var(--popover));
  box-shadow: 0 20px 50px hsl(var(--foreground) / .13);
}

.suggestion-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 13px;
  border: 0;
  border-bottom: 1px solid hsl(var(--border));
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.suggestion-item:last-child {
  border-bottom: 0;
}

.suggestion-item:hover {
  background: hsl(var(--muted) / .6);
}

.help-filter-row {
  display: flex;
  gap: 7px;
  overflow-x: auto;
  margin-top: 13px;
  scrollbar-width: none;
}

.help-filter-row::-webkit-scrollbar {
  display: none;
}

.help-filter {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex: 0 0 auto;
  padding: 7px 12px;
  border: 1px solid hsl(var(--border));
  border-radius: 999px;
  background: hsl(var(--background));
  color: hsl(var(--muted-foreground));
  font-size: 9px;
  font-weight: 850;
  cursor: pointer;
  transition: .2s ease;
}

.help-filter:hover {
  border-color: hsl(var(--primary) / .35);
}

.help-filter.active {
  border-color: hsl(var(--primary));
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

.recent-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.recent-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 9px;
  border: 1px solid hsl(var(--border));
  border-radius: 999px;
  background: hsl(var(--background));
  color: hsl(var(--muted-foreground));
  font-size: 8px;
  cursor: pointer;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 13px;
  margin-top: 22px;
}

.stat-card {
  padding: 17px;
  border: 1px solid hsl(var(--border));
  border-radius: 18px;
  background: hsl(var(--card));
  transition: transform .2s ease, box-shadow .2s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 17px 42px hsl(var(--foreground) / .07);
}

.help-stat-icon {
  width: 39px;
  height: 39px;
  border-radius: 11px;
}

.help-stat-value {
  margin-top: 11px;
  font-size: 23px;
  font-weight: 950;
}

.help-stat-label {
  margin-top: 3px;
  color: hsl(var(--muted-foreground));
  font-size: 9px;
}

.help-stat-meta {
  margin-top: 8px;
  color: hsl(var(--primary));
  font-size: 8px;
  font-weight: 800;
}

.section {
  margin-top: 26px;
}

.section-heading {
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 950;
}

.section-description {
  margin-top: 3px;
  color: hsl(var(--muted-foreground));
  font-size: 9px;
}

.section-heading-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-icon {
  width: 37px;
  height: 37px;
  border-radius: 11px;
}

.quick-help-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.quick-help-card {
  position: relative;
  overflow: hidden;
  min-height: 142px;
  padding: 17px;
  border: 1px solid hsl(var(--border));
  border-radius: 18px;
  background: hsl(var(--card));
  text-align: left;
  cursor: pointer;
  transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease;
}

.quick-help-card:hover {
  transform: translateY(-4px);
  border-color: hsl(var(--primary) / .32);
  box-shadow: 0 18px 42px hsl(var(--foreground) / .07);
}

.quick-help-icon {
  width: 40px;
  height: 40px;
  border-radius: 11px;
}

.quick-help-title {
  margin-top: 12px;
  font-size: 11px;
  font-weight: 900;
}

.quick-help-text {
  max-width: 220px;
  margin-top: 5px;
  color: hsl(var(--muted-foreground));
  font-size: 9px;
  line-height: 1.55;
}

.quick-help-arrow {
  position: absolute;
  right: 15px;
  top: 17px;
  color: hsl(var(--muted-foreground));
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(300px, .65fr);
  gap: 20px;
}

.panel {
  overflow: hidden;
  border: 1px solid hsl(var(--border));
  border-radius: 20px;
  background: hsl(var(--card));
}

.panel-header {
  padding: 17px;
  border-bottom: 1px solid hsl(var(--border));
}

.faq-body {
  padding: 5px 17px 17px;
}

.faq-answer {
  color: hsl(var(--muted-foreground));
  font-size: 11px;
  line-height: 1.8;
}

.faq-topic {
  margin-top: 10px;
}

.article-feedback {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 13px;
  padding-top: 10px;
  border-top: 1px solid hsl(var(--border));
}

.article-feedback-label {
  margin-right: 3px;
  color: hsl(var(--muted-foreground));
  font-size: 9px;
}

.support-stack {
  display: grid;
  gap: 13px;
}

.support-card {
  padding: 18px;
  border: 1px solid hsl(var(--border));
  border-radius: 18px;
  background: hsl(var(--card));
}

.support-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.support-card-icon {
  width: 39px;
  height: 39px;
  border-radius: 11px;
}

.support-card-title {
  font-size: 12px;
  font-weight: 900;
}

.support-card-text {
  margin-top: 10px;
  color: hsl(var(--muted-foreground));
  font-size: 9px;
  line-height: 1.7;
}

.support-number {
  margin-top: 12px;
  padding: 12px;
  border: 1px dashed hsl(var(--primary) / .35);
  border-radius: 11px;
  background: hsl(var(--primary) / .04);
  color: hsl(var(--primary));
  font-size: 17px;
  font-weight: 950;
}

.support-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7px;
  margin-top: 11px;
}

.language-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 7px;
  margin-top: 12px;
}

.language-item {
  padding: 9px 6px;
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
  text-align: center;
  font-size: 9px;
  font-weight: 800;
  cursor: pointer;
  transition: .2s ease;
}

.language-item:hover,
.language-item.selected {
  border-color: hsl(var(--primary) / .4);
  background: hsl(var(--primary) / .08);
  color: hsl(var(--primary));
}

.offline-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 13px;
  padding: 18px;
  border: 1px solid hsl(var(--border));
  border-radius: 18px;
  background: linear-gradient(135deg, hsl(var(--muted) / .42), hsl(var(--card)));
}

.offline-icon {
  width: 44px;
  height: 44px;
  border-radius: 13px;
}

.offline-title {
  font-size: 12px;
  font-weight: 900;
}

.offline-text {
  margin-top: 5px;
  color: hsl(var(--muted-foreground));
  font-size: 9px;
  line-height: 1.65;
}

.status-list {
  display: grid;
  gap: 8px;
  margin-top: 12px;
}

.status-row {
  padding: 10px;
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
}

.status-name {
  font-size: 9px;
  font-weight: 850;
}

.status-description {
  margin-top: 2px;
  color: hsl(var(--muted-foreground));
  font-size: 8px;
}

.status-operational {
  color: hsl(var(--primary));
}

.status-monitoring {
  color: hsl(var(--chart-4));
}

.feedback-panel {
  margin-top: 24px;
  padding: 19px;
  border: 1px solid hsl(var(--border));
  border-radius: 18px;
  background: hsl(var(--card));
}

.feedback-title {
  font-size: 11px;
  font-weight: 900;
}

.feedback-text {
  margin-top: 4px;
  color: hsl(var(--muted-foreground));
  font-size: 9px;
}

.feedback-actions {
  display: flex;
  gap: 7px;
}

.emergency-panel {
  position: relative;
  overflow: hidden;
  margin-top: 24px;
  padding: 24px;
  border: 1px solid hsl(var(--destructive) / .20);
  border-radius: 21px;
  background:
    linear-gradient(135deg, hsl(var(--destructive) / .08), transparent),
    hsl(var(--card));
}

.emergency-left {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.emergency-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex: 0 0 auto;
  border-radius: 13px;
  background: hsl(var(--destructive) / .10);
  color: hsl(var(--destructive));
}

.emergency-title {
  font-size: 14px;
  font-weight: 950;
}

.emergency-text {
  max-width: 720px;
  margin-top: 4px;
  color: hsl(var(--muted-foreground));
  font-size: 10px;
  line-height: 1.65;
}

.emergency-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 15px;
}

.emergency-item {
  padding: 13px;
  border: 1px solid hsl(var(--border));
  border-radius: 13px;
  background: hsl(var(--background) / .55);
}

.emergency-item-title {
  margin-top: 8px;
  font-size: 10px;
  font-weight: 900;
}

.emergency-item-text {
  margin-top: 4px;
  color: hsl(var(--muted-foreground));
  font-size: 8px;
  line-height: 1.55;
}

.no-results {
  padding: 48px 20px;
  text-align: center;
}

.no-results-icon {
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  margin: 0 auto;
  border-radius: 15px;
  background: hsl(var(--muted));
  color: hsl(var(--muted-foreground));
}

.no-results-title {
  margin-top: 12px;
  font-size: 14px;
  font-weight: 900;
}

.no-results-text {
  max-width: 460px;
  margin: 5px auto 0;
  color: hsl(var(--muted-foreground));
  font-size: 10px;
  line-height: 1.65;
}

.ticket-panel {
  margin-top: 24px;
  padding: 21px;
  border: 1px solid hsl(var(--primary) / .18);
  border-radius: 20px;
  background: linear-gradient(135deg, hsl(var(--primary) / .07), hsl(var(--card)));
}

.ticket-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 15px;
}

.ticket-full {
  grid-column: 1 / -1;
}

.ticket-label {
  display: block;
  margin-bottom: 6px;
  font-size: 9px;
  font-weight: 850;
}

.ticket-textarea {
  width: 100%;
  min-height: 105px;
  resize: vertical;
  padding: 11px 12px;
  border: 1px solid hsl(var(--input));
  border-radius: 10px;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  outline: none;
  font: inherit;
  font-size: 11px;
}

.ticket-textarea:focus {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 3px hsl(var(--primary) / .10);
}

.ticket-success {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  margin-top: 14px;
  padding: 12px;
  border-radius: 12px;
  background: hsl(var(--primary) / .08);
  color: hsl(var(--primary));
  font-size: 10px;
  line-height: 1.55;
}

.footer-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 20px;
}

.footer-card {
  padding: 18px;
  border: 1px solid hsl(var(--border));
  border-radius: 18px;
  background: hsl(var(--card));
}

.footer-card-title {
  margin-top: 10px;
  font-size: 11px;
  font-weight: 900;
}

.footer-card-text {
  margin-top: 5px;
  color: hsl(var(--muted-foreground));
  font-size: 9px;
  line-height: 1.65;
}

.helpline-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 7px;
  margin-top: 22px;
  color: hsl(var(--muted-foreground));
  font-size: 9px;
}

@media (max-width: 1100px) {
  .stats-grid,
  .quick-help-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .emergency-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 850px) {
  .help-hero-grid {
    grid-template-columns: 1fr;
  }

  .feedback-panel,
  .emergency-content {
    align-items: flex-start;
    flex-direction: column;
  }

  .ticket-grid {
    grid-template-columns: 1fr;
  }

  .ticket-full {
    grid-column: auto;
  }

  .footer-strip {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .help-shell {
    width: min(100% - 20px, 1440px);
  }

  .help-hero {
    padding: 22px;
    border-radius: 22px;
  }

  .stats-grid,
  .quick-help-grid {
    grid-template-columns: 1fr;
  }

  .help-hero-actions {
    flex-direction: column;
  }

  .help-hero-actions button {
    width: 100%;
  }

  .feedback-actions,
  .support-buttons {
    width: 100%;
  }

  .feedback-actions button,
  .support-buttons button {
    flex: 1;
  }

  .search-hint {
    align-items: flex-start;
    flex-direction: column;
  }

  .suggestion-panel {
    left: 18px;
    right: 18px;
  }
}

@media print {
  .help-hero-actions,
  .search-panel,
  .feedback-panel,
  .ticket-panel,
  button {
    display: none !important;
  }

  .help-page {
    background: white;
  }

  .help-hero,
  .stat-card,
  .quick-help-card,
  .panel,
  .support-card,
  .emergency-panel,
  .footer-card {
    box-shadow: none !important;
    break-inside: avoid;
  }
}
`;

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Local storage can be unavailable in private/locked-down browsers.
  }
}

function normalize(value: unknown) {
  return String(value ?? "").toLowerCase().trim();
}

function scoreArticle(
  article: { question: string; answer: string; topic?: string | null },
  query: string,
) {
  const q = normalize(query);
  if (!q) return 0;

  const words = q.split(/\s+/).filter(Boolean);
  const question = normalize(article.question);
  const answer = normalize(article.answer);
  const topic = normalize(article.topic);

  let score = 0;

  if (question === q) score += 100;
  if (question.includes(q)) score += 50;
  if (topic.includes(q)) score += 35;
  if (answer.includes(q)) score += 20;

  for (const word of words) {
    if (question.includes(word)) score += 10;
    if (topic.includes(word)) score += 8;
    if (answer.includes(word)) score += 3;
  }

  return score;
}

function QuickIcon({ type }: { type: string }) {
  if (type === "alert") return <AlertCircle size={18} />;
  if (type === "market") return <ArrowRight size={18} />;
  if (type === "soil") return <Sparkles size={18} />;
  if (type === "disease") return <CircleHelp size={18} />;
  if (type === "scheme") return <BookOpen size={18} />;
  if (type === "equipment") return <Smartphone size={18} />;
  if (type === "security") return <ShieldCheck size={18} />;

  return <SproutIcon />;
}

export default function HelpCenter() {
  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["help"],
    queryFn: agricultureApi.getHelpArticles,
  });

  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("All");
  const [feedback, setFeedback] = useState<"positive" | "negative" | null>(null);
  const [articleFeedback, setArticleFeedback] = useState<Record<string, "positive" | "negative">>(
    () => readStorage(STORAGE_KEYS.feedback, {}),
  );
  const [copied, setCopied] = useState(false);
  const [online, setOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  const [language, setLanguage] = useState(
    () => readStorage(STORAGE_KEYS.language, "en"),
  );
  const [recentSearches, setRecentSearches] = useState<string[]>(
    () => readStorage(STORAGE_KEYS.recentSearches, []),
  );
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [ticketSent, setTicketSent] = useState(false);
  const [ticket, setTicket] = useState({
    name: "",
    contact: "",
    category: "Crop / Farming",
    message: "",
  });
  const [isListening, setIsListening] = useState(false);

  const articles = data ?? [];

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          (document.activeElement as HTMLElement | null)?.tagName ?? "",
        )
      ) {
        event.preventDefault();
        document.getElementById("help-search")?.focus();
      }

      if (event.key === "Escape") {
        setShowSuggestions(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const topics = useMemo(() => {
    const unique = Array.from(
      new Set(
        articles
          .map((article) => article.topic)
          .filter(Boolean)
          .map(String),
      ),
    );

    return ["All", ...unique];
  }, [articles]);

  const results = useMemo(() => {
    const normalized = normalize(query);

    return articles
      .map((article) => ({
        article,
        score: normalized ? scoreArticle(article, normalized) : 1,
      }))
      .filter(({ article, score }) => {
        const matchesTopic = topic === "All" || article.topic === topic;
        return matchesTopic && score > 0;
      })
      .sort((a, b) => b.score - a.score)
      .map(({ article }) => article);
  }, [articles, query, topic]);

  const suggestions = useMemo(() => {
    if (!query.trim()) return recentSearches.slice(0, 5);

    return articles
      .map((article) => ({
        article,
        score: scoreArticle(article, query),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((item) => item.article.question);
  }, [articles, query, recentSearches]);

  const languageName =
    LANGUAGES.find((item) => item.code === language)?.native ?? "English";

  const saveSearch = (value: string) => {
    const cleaned = value.trim();
    if (!cleaned) return;

    const next = [
      cleaned,
      ...recentSearches.filter((item) => normalize(item) !== normalize(cleaned)),
    ].slice(0, 6);

    setRecentSearches(next);
    writeStorage(STORAGE_KEYS.recentSearches, next);
  };

  const runSearch = (value: string) => {
    setQuery(value);
    setTopic("All");
    setShowSuggestions(false);
    saveSearch(value);
  };

  const copyHelpline = async () => {
    try {
      await navigator.clipboard.writeText(HELPLINE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const shareSupport = async () => {
    const text = `AgriGo farmer support: ${HELPLINE}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "AgriGo Agriculture Support",
          text,
        });
      } catch {
        // User cancelled.
      }
    } else {
      await copyHelpline();
    }
  };

  const callSupport = () => {
    window.location.href = `tel:${HELPLINE.replace(/\s/g, "")}`;
  };

  const openWhatsApp = () => {
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        "Hello, I need agriculture support.",
      )}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const startVoiceSearch = () => {
    const SpeechRecognition =
      (window as Window & {
        SpeechRecognition?: new () => {
          lang: string;
          interimResults: boolean;
          continuous: boolean;
          start: () => void;
          stop: () => void;
          onresult: ((event: {
            results: ArrayLike<ArrayLike<{ transcript: string }>>;
          }) => void) | null;
          onend: (() => void) | null;
          onerror: (() => void) | null;
        };
        webkitSpeechRecognition?: new () => {
          lang: string;
          interimResults: boolean;
          continuous: boolean;
          start: () => void;
          stop: () => void;
          onresult: ((event: {
            results: ArrayLike<ArrayLike<{ transcript: string }>>;
          }) => void) | null;
          onend: (() => void) | null;
          onerror: (() => void) | null;
        };
      }).SpeechRecognition ||
      (window as Window & {
        webkitSpeechRecognition?: new () => {
          lang: string;
          interimResults: boolean;
          continuous: boolean;
          start: () => void;
          stop: () => void;
          onresult: ((event: {
            results: ArrayLike<ArrayLike<{ transcript: string }>>;
          }) => void) | null;
          onend: (() => void) | null;
          onerror: (() => void) | null;
        };
      }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === "hi" ? "hi-IN" : language === "ta" ? "ta-IN" : "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      runSearch(transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    setIsListening(true);
    recognition.start();
  };

  const setArticleVote = (
    articleId: string | number,
    vote: "positive" | "negative",
  ) => {
    const next = {
      ...articleFeedback,
      [String(articleId)]: vote,
    };

    setArticleFeedback(next);
    writeStorage(STORAGE_KEYS.feedback, next);
  };

  const selectLanguage = (code: string) => {
    setLanguage(code);
    writeStorage(STORAGE_KEYS.language, code);
  };

  const submitTicket = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!ticket.message.trim()) return;

    const ticketId = `AGR-${Date.now().toString().slice(-7)}`;
    const stored = readStorage<
      Array<typeof ticket & { id: string; createdAt: string }>
    >(STORAGE_KEYS.tickets, []);

    stored.unshift({
      ...ticket,
      id: ticketId,
      createdAt: new Date().toISOString(),
    });

    writeStorage(STORAGE_KEYS.tickets, stored);
    setTicketSent(true);
  };

  const resetTicket = () => {
    setTicket({
      name: "",
      contact: "",
      category: "Crop / Farming",
      message: "",
    });
    setTicketSent(false);
  };

  if (isError) {
    return (
      <div className="help-page">
        <style>{styles}</style>
        <div className="help-shell">
          <AgriculturePageHeader
            icon={LifeBuoy}
            title="Help Center"
            description="Get answers, find support resources and connect with agricultural assistance."
          />

          <div className="panel" style={{ marginTop: 24, padding: 60, textAlign: "center" }}>
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-destructive/10 text-destructive">
              <WifiOff size={27} />
            </div>
            <h3 className="mt-4 text-lg font-black">
              Help articles are temporarily unavailable
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              The knowledge service could not be reached. You can retry or contact
              agricultural support directly.
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <Button onClick={() => refetch()} disabled={isFetching}>
                {isFetching ? "Retrying..." : "Retry"}
              </Button>
              <Button variant="outline" onClick={callSupport}>
                <PhoneCall className="mr-2 size-4" />
                Call support
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="help-page">
        <style>{styles}</style>
        <div className="help-shell">
          <AgriculturePageHeader
            icon={LifeBuoy}
            title="Help Center"
            description="Farmer support, knowledge, troubleshooting and agricultural assistance."
          />
          <LoadingState rows={7} />
        </div>
      </div>
    );
  }

  return (
    <div className="help-page">
      <style>{styles}</style>

      <div className="help-shell">
        <AgriculturePageHeader
          icon={LifeBuoy}
          title="Help Center"
          description="Smart farmer support for farm tools, alerts, weather, market services, government schemes and account assistance."
        />

        {!online && (
          <div className="mt-4">
            <AlertCard
              severity="warning"
              title="You are offline"
              detail="Previously loaded help information may still be available. Some live services, calls, submissions and latest information may require a network connection."
              meta="Reconnect to refresh live information."
            />
          </div>
        )}

        <section className="help-hero">
          <div className="help-hero-grid">
            <div>
              <div className="help-kicker">
                <Sparkles size={13} />
                AgriGo Farmer Support
              </div>

              <h1 className="help-title">
                Answers for your
                <br />
                <span>next farming decision.</span>
              </h1>

              <p className="help-description">
                Search the AgriGo knowledge base, understand alerts, troubleshoot
                farming tools and connect with human support when digital help is
                not enough.
              </p>

              <div className="help-hero-actions">
                <Button
                  onClick={() =>
                    document.getElementById("help-search")?.focus()
                  }
                >
                  <Search className="mr-2 size-4" />
                  Ask AgriGo Help
                </Button>

                <Button variant="outline" onClick={callSupport}>
                  <PhoneCall className="mr-2 size-4" />
                  Call support
                </Button>

                <Button variant="outline" onClick={() => setTicketOpen(true)}>
                  <MessageSquareText className="mr-2 size-4" />
                  Raise a request
                </Button>
              </div>
            </div>

            <div className="support-status">
              <div className="support-status-top">
                <div className="support-status-icon">
                  <Headphones size={22} />
                </div>
                <div className="live-dot" title="Digital support available" />
              </div>

              <div className="support-status-title">
                Digital support is ready
              </div>

              <div className="support-status-text">
                Search the knowledge base anytime. Human phone support follows
                the displayed support hours.
              </div>

              <div className="support-hours">
                <Clock3 size={14} />
                Phone support: {SUPPORT_HOURS}
              </div>

              <div className="mt-3 flex items-center gap-2 text-[9px] text-muted-foreground">
                {online ? <Wifi size={13} /> : <WifiOff size={13} />}
                {online ? "Connected to the internet" : "Offline mode active"}
              </div>
            </div>
          </div>
        </section>

        <section className="search-panel">
          <div className="search-box">
            <Search size={18} />

            <Input
              id="help-search"
              value={query}
              onFocus={() => setShowSuggestions(true)}
              onChange={(event) => {
                setQuery(event.target.value);
                setShowSuggestions(true);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  runSearch(query);
                }
              }}
              placeholder="Ask a question — e.g. how do I add my field?"
              aria-label="Search help articles"
              autoComplete="off"
            />

            <div className="search-tools">
              {query && (
                <button
                  className="search-tool"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  type="button"
                >
                  <X size={15} />
                </button>
              )}

              <button
                className="search-tool"
                onClick={startVoiceSearch}
                aria-label="Voice search"
                type="button"
                title="Voice search"
              >
                <Mic
                  size={16}
                  className={isListening ? "animate-pulse text-primary" : ""}
                />
              </button>
            </div>
          </div>

          <div className="search-hint">
            <span>
              Search questions, answers and support topics. Use{" "}
              <strong>/</strong> to jump to search.
            </span>
            <span className="search-shortcut">Press Enter to search</span>
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestion-panel">
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion}-${index}`}
                  className="suggestion-item"
                  type="button"
                  onClick={() => runSearch(suggestion)}
                >
                  <Search size={14} className="text-muted-foreground" />
                  <span className="flex-1 text-xs font-semibold">
                    {suggestion}
                  </span>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </button>
              ))}
            </div>
          )}

          <div className="help-filter-row">
            <Filter size={13} className="mt-1 text-muted-foreground" />
            {topics.map((item) => (
              <button
                key={item}
                className={`help-filter ${topic === item ? "active" : ""}`}
                type="button"
                onClick={() => {
                  setTopic(item);
                  setShowSuggestions(false);
                }}
              >
                {item === "All" && <CircleHelp size={11} />}
                {item}
              </button>
            ))}
          </div>

          {recentSearches.length > 0 && (
            <div className="recent-row">
              <span className="self-center text-[8px] font-bold text-muted-foreground">
                Recent:
              </span>
              {recentSearches.map((item) => (
                <button
                  className="recent-chip"
                  type="button"
                  key={item}
                  onClick={() => runSearch(item)}
                >
                  <Clock3 size={10} />
                  {item}
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="help-stat-icon">
              <BookOpen size={18} />
            </div>
            <div className="help-stat-value">{articles.length}</div>
            <div className="help-stat-label">Help articles</div>
            <div className="help-stat-meta">Knowledge base</div>
          </div>

          <div className="stat-card">
            <div className="help-stat-icon">
              <Filter size={18} />
            </div>
            <div className="help-stat-value">
              {Math.max(0, topics.length - 1)}
            </div>
            <div className="help-stat-label">Support topics</div>
            <div className="help-stat-meta">Organized answers</div>
          </div>

          <div className="stat-card">
            <div className="help-stat-icon">
              <Search size={18} />
            </div>
            <div className="help-stat-value">{results.length}</div>
            <div className="help-stat-label">Matching answers</div>
            <div className="help-stat-meta">
              {query ? "Current search" : "All available"}
            </div>
          </div>

          <div className="stat-card">
            <div className="help-stat-icon">
              <Globe2 size={18} />
            </div>
            <div className="help-stat-value">{LANGUAGES.length}+</div>
            <div className="help-stat-label">Language options</div>
            <div className="help-stat-meta">Current: {languageName}</div>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <div>
              <div className="section-title">What do you need help with?</div>
              <div className="section-description">
                Start with a farming area instead of searching from scratch.
              </div>
            </div>
            <Badge variant="secondary">Smart shortcuts</Badge>
          </div>

          <div className="quick-help-grid">
            {QUICK_TOPICS.map((item) => (
              <button
                className="quick-help-card"
                key={item.title}
                type="button"
                onClick={() => runSearch(item.query)}
              >
                <div className="quick-help-icon">
                  <QuickIcon type={item.icon} />
                </div>

                <div className="quick-help-title">{item.title}</div>
                <div className="quick-help-text">{item.description}</div>

                <ChevronRight className="quick-help-arrow size-4" />
              </button>
            ))}
          </div>
        </section>

        <section className="section content-grid">
          <div className="panel">
            <div className="panel-header">
              <div className="section-heading">
                <div>
                  <div className="section-title">Knowledge base</div>
                  <div className="section-description">
                    {results.length} answer{results.length === 1 ? "" : "s"}{" "}
                    found
                  </div>
                </div>
                <Badge variant="secondary">{topic}</Badge>
              </div>
            </div>

            <div className="faq-body">
              {results.length ? (
                <Accordion type="single" collapsible>
                  {results.map((article) => (
                    <AccordionItem
                      key={article.id}
                      value={String(article.id)}
                    >
                      <AccordionTrigger className="text-left text-sm font-bold">
                        <span className="pr-3">{article.question}</span>
                      </AccordionTrigger>

                      <AccordionContent>
                        <div className="faq-answer">{article.answer}</div>

                        {article.topic && (
                          <Badge variant="secondary" className="faq-topic">
                            {article.topic}
                          </Badge>
                        )}

                        <div className="article-feedback">
                          <span className="article-feedback-label">
                            Was this answer useful?
                          </span>

                          <Button
                            size="sm"
                            variant={
                              articleFeedback[String(article.id)] === "positive"
                                ? "default"
                                : "outline"
                            }
                            onClick={() =>
                              setArticleVote(article.id, "positive")
                            }
                          >
                            <ThumbsUp className="mr-1 size-3" />
                            Yes
                          </Button>

                          <Button
                            size="sm"
                            variant={
                              articleFeedback[String(article.id)] === "negative"
                                ? "default"
                                : "outline"
                            }
                            onClick={() =>
                              setArticleVote(article.id, "negative")
                            }
                          >
                            <ThumbsDown className="mr-1 size-3" />
                            No
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="no-results">
                  <div className="no-results-icon">
                    <FileQuestion size={22} />
                  </div>

                  <div className="no-results-title">No answer found</div>

                  <div className="no-results-text">
                    Try a shorter search, another topic or one of the quick
                    help areas. If the answer is still unavailable, raise a
                    support request.
                  </div>

                  <div className="mt-4 flex justify-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setQuery("");
                        setTopic("All");
                      }}
                    >
                      Clear search
                    </Button>
                    <Button onClick={() => setTicketOpen(true)}>
                      <MessageSquareText className="mr-2 size-4" />
                      Ask support
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="support-stack">
            <div className="support-card">
              <div className="support-card-header">
                <div className="support-card-icon">
                  <PhoneCall size={18} />
                </div>
                <div>
                  <div className="support-card-title">Kisan support</div>
                  <Badge variant="secondary" className="mt-1 text-[8px]">
                    Phone assistance
                  </Badge>
                </div>
              </div>

              <div className="support-card-text">
                Use the agricultural support number when the knowledge base
                cannot solve your problem.
              </div>

              <div className="support-number">{HELPLINE}</div>

              <div className="support-buttons">
                <Button size="sm" onClick={callSupport}>
                  <PhoneCall className="mr-1 size-3" />
                  Call
                </Button>

                <Button size="sm" variant="outline" onClick={copyHelpline}>
                  {copied ? (
                    <Check className="mr-1 size-3" />
                  ) : (
                    <Copy className="mr-1 size-3" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </Button>

                <Button size="sm" variant="outline" onClick={openWhatsApp}>
                  <MessageCircle className="mr-1 size-3" />
                  Message
                </Button>

                <Button size="sm" variant="outline" onClick={shareSupport}>
                  <Send className="mr-1 size-3" />
                  Share
                </Button>
              </div>
            </div>

            <div className="support-card">
              <div className="support-card-header">
                <div className="support-card-icon">
                  <Globe2 size={18} />
                </div>
                <div className="support-card-title">
                  Farmer language support
                </div>
              </div>

              <div className="support-card-text">
                Choose a preferred language for voice search and future
                localized support flows.
              </div>

              <div className="language-grid">
                {LANGUAGES.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    className={`language-item ${
                      language === item.code ? "selected" : ""
                    }`}
                    onClick={() => selectLanguage(item.code)}
                  >
                    {item.native}
                  </button>
                ))}
              </div>
            </div>

            <div className="support-card">
              <div className="support-card-header">
                <div className="support-card-icon">
                  <ShieldCheck size={18} />
                </div>
                <div className="support-card-title">AgriGo service status</div>
              </div>

              <div className="status-list">
                {SERVICE_STATUS.map((service) => (
                  <div className="status-row" key={service.name}>
                    <div>
                      <div className="status-name">{service.name}</div>
                      <div className="status-description">
                        {service.description}
                      </div>
                    </div>
                    <span
                      className={`text-[8px] font-black ${
                        service.status === "Monitoring"
                          ? "status-monitoring"
                          : "status-operational"
                      }`}
                    >
                      {service.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="offline-card">
              <div className="offline-icon">
                {online ? <Wifi size={19} /> : <WifiOff size={19} />}
              </div>
              <div>
                <div className="offline-title">
                  {online ? "Connection looks good" : "Offline support mode"}
                </div>
                <div className="offline-text">
                  {online
                    ? "Live services can be used when their respective systems are available."
                    : "Previously loaded information may remain available. Reconnect before relying on live weather, prices or submissions."}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="feedback-panel">
          <div>
            <div className="feedback-title">
              Did you find this help center useful?
            </div>
            <div className="feedback-text">
              Your feedback helps improve AgriGo farmer support.
            </div>
          </div>

          <div className="feedback-actions">
            <Button
              size="sm"
              variant={feedback === "positive" ? "default" : "outline"}
              onClick={() => setFeedback("positive")}
            >
              <ThumbsUp className="mr-1 size-3" />
              Yes
            </Button>

            <Button
              size="sm"
              variant={feedback === "negative" ? "default" : "outline"}
              onClick={() => setFeedback("negative")}
            >
              <ThumbsDown className="mr-1 size-3" />
              Not really
            </Button>
          </div>
        </section>

        <section className="ticket-panel" id="support-request">
          <div className="section-heading">
            <div className="section-heading-left">
              <div className="section-icon">
                <MessageSquareText size={18} />
              </div>
              <div>
                <div className="section-title">Could not find your answer?</div>
                <div className="section-description">
                  Create a support request with the details a support person
                  needs to understand the issue.
                </div>
              </div>
            </div>

            <Button
              variant={ticketOpen ? "outline" : "default"}
              onClick={() => {
                setTicketOpen((value) => !value);
                setTicketSent(false);
              }}
            >
              {ticketOpen ? "Close form" : "Raise request"}
            </Button>
          </div>

          {ticketOpen && (
            <>
              {ticketSent ? (
                <div className="ticket-success">
                  <Check size={19} />
                  <div>
                    <strong>Support request saved.</strong>
                    <br />
                    Your request is stored locally in this prototype. Connect
                    the submit handler to your backend support/ticket API to
                    create a real server-side ticket and notification workflow.
                  </div>
                </div>
              ) : (
                <form className="ticket-grid" onSubmit={submitTicket}>
                  <div>
                    <label className="ticket-label" htmlFor="ticket-name">
                      Name
                    </label>
                    <Input
                      id="ticket-name"
                      value={ticket.name}
                      onChange={(event) =>
                        setTicket((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      placeholder="Farmer name"
                    />
                  </div>

                  <div>
                    <label className="ticket-label" htmlFor="ticket-contact">
                      Phone or email
                    </label>
                    <Input
                      id="ticket-contact"
                      value={ticket.contact}
                      onChange={(event) =>
                        setTicket((current) => ({
                          ...current,
                          contact: event.target.value,
                        }))
                      }
                      placeholder="Preferred contact"
                    />
                  </div>

                  <div>
                    <label className="ticket-label" htmlFor="ticket-category">
                      Problem category
                    </label>
                    <select
                      id="ticket-category"
                      value={ticket.category}
                      onChange={(event) =>
                        setTicket((current) => ({
                          ...current,
                          category: event.target.value,
                        }))
                      }
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    >
                      <option>Crop / Farming</option>
                      <option>Disease detection</option>
                      <option>Weather / alerts</option>
                      <option>Market / mandi</option>
                      <option>Government scheme</option>
                      <option>Equipment / marketplace</option>
                      <option>Account / login</option>
                      <option>Technical issue</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="ticket-label" htmlFor="ticket-topic">
                      Current search
                    </label>
                    <Input
                      id="ticket-topic"
                      value={query}
                      readOnly
                      placeholder="No active search"
                    />
                  </div>

                  <div className="ticket-full">
                    <label className="ticket-label" htmlFor="ticket-message">
                      Describe the problem
                    </label>
                    <textarea
                      id="ticket-message"
                      className="ticket-textarea"
                      required
                      value={ticket.message}
                      onChange={(event) =>
                        setTicket((current) => ({
                          ...current,
                          message: event.target.value,
                        }))
                      }
                      placeholder="Example: My crop alert is not appearing after I added my field. Mention crop, field, approximate location and what you already tried."
                    />
                  </div>

                  <div className="ticket-full flex flex-wrap justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetTicket}
                    >
                      Clear
                    </Button>
                    <Button type="submit">
                      <Send className="mr-2 size-4" />
                      Submit request
                    </Button>
                  </div>
                </form>
              )}
            </>
          )}
        </section>

        <div className="mt-6">
          <AlertCard
            severity="info"
            title="Still stuck? Talk to a person"
            detail={`Agricultural support: ${HELPLINE}. Keep your crop, field and problem details ready so the support team can understand the situation quickly.`}
            meta={`Phone support hours shown in AgriGo: ${SUPPORT_HOURS}.`}
          />
        </div>

        <section className="emergency-panel">
          <div className="emergency-content">
            <div className="emergency-left">
              <div className="emergency-icon">
                <AlertCircle size={21} />
              </div>

              <div>
                <div className="emergency-title">
                  Need urgent agricultural assistance?
                </div>

                <div className="emergency-text">
                  For serious crop problems, livestock emergencies or situations
                  requiring immediate professional assistance, use the
                  appropriate local agricultural, veterinary or emergency
                  service.
                </div>
              </div>
            </div>

            <Button variant="outline" onClick={callSupport}>
              <PhoneCall className="mr-2 size-4" />
              Call support
            </Button>
          </div>

          <div className="emergency-grid">
            {EMERGENCY_SERVICES.map((service) => {
              const Icon = service.icon;

              return (
                <div className="emergency-item" key={service.title}>
                  <Icon className="size-5 text-primary" />
                  <div className="emergency-item-title">{service.title}</div>
                  <div className="emergency-item-text">
                    {service.description}
                  </div>

                  {service.href.startsWith("tel:") ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="mt-2 px-0 text-[9px]"
                      onClick={() => {
                        window.location.href = service.href;
                      }}
                    >
                      {service.action}
                      <ArrowRight className="ml-1 size-3" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="mt-2 px-0 text-[9px]"
                      onClick={() =>
                        alert(
                          "Connect this action to your district agriculture/veterinary directory API.",
                        )
                      }
                    >
                      {service.action}
                      <ArrowRight className="ml-1 size-3" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="footer-strip">
          <div className="footer-card">
            <MessageCircle className="size-6 text-primary" />
            <div className="footer-card-title">Community assistance</div>
            <div className="footer-card-text">
              Create a future community workflow where farmers can share
              practical experiences, crop problems and solutions.
            </div>
            <Button
              variant="ghost"
              className="mt-3 px-0 text-xs"
              onClick={() =>
                alert("Connect this button to the AgriGo community route.")
              }
            >
              Open community
              <ArrowRight className="ml-2 size-3" />
            </Button>
          </div>

          <div className="footer-card">
            <Smartphone className="size-6 text-primary" />
            <div className="footer-card-title">App support</div>
            <div className="footer-card-text">
              Keep the AgriGo application updated so farmers can receive the
              latest fixes, improvements and feature updates.
            </div>
            <Button
              variant="ghost"
              className="mt-3 px-0 text-xs"
              onClick={() => window.location.reload()}
            >
              Refresh app
              <ArrowRight className="ml-2 size-3" />
            </Button>
          </div>

          <div className="footer-card">
            <BookOpen className="size-6 text-primary" />
            <div className="footer-card-title">Print help guide</div>
            <div className="footer-card-text">
              Print the current knowledge base for offline reference at a farm
              office or support desk.
            </div>
            <Button
              variant="ghost"
              className="mt-3 px-0 text-xs"
              onClick={() => window.print()}
            >
              Print guide
              <ExternalLink className="ml-2 size-3" />
            </Button>
          </div>
        </section>

        <div className="helpline-footer">
          <PhoneCall className="size-4" />
          <span>
            Support:{" "}
            <strong className="text-foreground">{HELPLINE}</strong>
          </span>
          <span>•</span>
          <span>Phone hours: {SUPPORT_HOURS}</span>
          <span>•</span>
          <span>Language: {languageName}</span>
        </div>
      </div>
    </div>
  );
}

function SproutIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 20h10" />
      <path d="M12 20V10" />
      <path d="M12 10C8 10 5 7 5 3c4 0 7 3 7 7" />
      <path d="M12 14c0-4 3-7 7-7 0 4-3 7-7 7" />
    </svg>
  );
}
