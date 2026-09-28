import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Beaker,
  Bell,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Droplets,
  Gauge,
  Leaf,
  LineChart,
  Microscope,
  RefreshCw,
  Search,
  ShieldCheck,
  Sprout,
  Thermometer,
  TrendingDown,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';

import { agricultureApi, SoilReport } from '../../services/agricultureApi';
import { AgriculturePageHeader } from '../../components/agriculture/AgriculturePageHeader';
import { StatCard } from '../../components/agriculture/StatCard';

type Tab = 'overview' | 'nutrients' | 'diagnostics' | 'recommendations';

const styles = `
  .soil-page {
    min-height: 100vh;
    padding: 24px;
    background:
      radial-gradient(circle at 5% 0%, rgba(16,185,129,.08), transparent 25%),
      radial-gradient(circle at 95% 10%, rgba(59,130,246,.07), transparent 25%),
      #f8fafc;
  }

  .soil-shell {
    max-width: 1500px;
    margin: 0 auto;
  }

  .soil-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 22px;
    padding: 14px;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    background: rgba(255,255,255,.9);
    box-shadow: 0 10px 35px rgba(15,23,42,.05);
    backdrop-filter: blur(12px);
  }

  .soil-toolbar-left,
  .soil-toolbar-right {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .soil-search {
    position: relative;
    min-width: 260px;
  }

  .soil-search svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    width: 16px;
    height: 16px;
  }

  .soil-search input {
    width: 100%;
    height: 40px;
    padding: 0 14px 0 38px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    outline: none;
    font-size: 12px;
    font-weight: 600;
    color: #334155;
    background: #fff;
    transition: .2s ease;
  }

  .soil-search input:focus {
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16,185,129,.1);
  }

  .soil-select {
    height: 40px;
    padding: 0 34px 0 12px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    background: white;
    color: #334155;
    font-size: 12px;
    font-weight: 700;
    outline: none;
    cursor: pointer;
  }

  .soil-button {
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 0 14px;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    background: #fff;
    color: #334155;
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
    transition: .2s ease;
  }

  .soil-button:hover {
    transform: translateY(-1px);
    border-color: #cbd5e1;
    box-shadow: 0 5px 15px rgba(15,23,42,.07);
  }

  .soil-button.primary {
    color: white;
    border-color: #059669;
    background: linear-gradient(135deg,#059669,#10b981);
  }

  .soil-button.primary:hover {
    background: linear-gradient(135deg,#047857,#059669);
  }

  .soil-button:disabled {
    opacity: .55;
    cursor: not-allowed;
    transform: none;
  }

  .soil-hero {
    position: relative;
    overflow: hidden;
    margin-bottom: 22px;
    padding: 26px;
    border-radius: 20px;
    background:
      radial-gradient(circle at 90% 20%, rgba(52,211,153,.25), transparent 24%),
      radial-gradient(circle at 70% 90%, rgba(59,130,246,.18), transparent 30%),
      linear-gradient(135deg,#0f172a,#132d25 60%,#064e3b);
    color: white;
    box-shadow: 0 18px 45px rgba(15,23,42,.18);
  }

  .soil-hero::before {
    content: "";
    position: absolute;
    width: 280px;
    height: 280px;
    right: -100px;
    top: -120px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,.12);
    box-shadow:
      0 0 0 35px rgba(255,255,255,.025),
      0 0 0 70px rgba(255,255,255,.02);
  }

  .soil-hero-grid {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 25px;
    align-items: center;
  }

  .hero-eyebrow {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 9px;
    color: #6ee7b7;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: .14em;
    text-transform: uppercase;
  }

  .hero-title {
    margin: 0;
    font-size: clamp(25px,3vw,38px);
    line-height: 1.05;
    font-weight: 950;
    letter-spacing: -.04em;
  }

  .hero-description {
    max-width: 700px;
    margin: 12px 0 0;
    color: #cbd5e1;
    font-size: 13px;
    line-height: 1.7;
  }

  .hero-status {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 17px;
    color: #d1fae5;
    font-size: 11px;
    font-weight: 800;
  }

  .online-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #34d399;
    box-shadow: 0 0 0 5px rgba(52,211,153,.13);
    animation: pulseDot 1.8s infinite;
  }

  @keyframes pulseDot {
    0%,100% { box-shadow: 0 0 0 4px rgba(52,211,153,.12); }
    50% { box-shadow: 0 0 0 8px rgba(52,211,153,.03); }
  }

  .hero-score {
    width: 160px;
    height: 160px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background:
      radial-gradient(circle,#10251d 55%,transparent 56%),
      conic-gradient(#34d399 0deg,#10b981 260deg,rgba(255,255,255,.1) 260deg);
    box-shadow: inset 0 0 30px rgba(0,0,0,.25);
  }

  .hero-score-inner {
    text-align: center;
  }

  .hero-score-value {
    display: block;
    font-size: 38px;
    line-height: 1;
    font-weight: 950;
  }

  .hero-score-label {
    display: block;
    margin-top: 5px;
    color: #94a3b8;
    font-size: 9px;
    font-weight: 900;
    letter-spacing: .1em;
    text-transform: uppercase;
  }

  .section-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin: 24px 0 12px;
  }

  .section-heading h2 {
    margin: 0;
    color: #0f172a;
    font-size: 15px;
    font-weight: 900;
    letter-spacing: -.02em;
  }

  .section-heading span {
    color: #94a3b8;
    font-size: 10px;
    font-weight: 800;
  }

  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(4,minmax(0,1fr));
    gap: 14px;
  }

  .metric-card {
    position: relative;
    overflow: hidden;
    min-height: 118px;
    padding: 17px;
    border: 1px solid #e2e8f0;
    border-radius: 15px;
    background: white;
    box-shadow: 0 6px 20px rgba(15,23,42,.045);
    transition: .2s ease;
  }

  .metric-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(15,23,42,.08);
  }

  .metric-icon {
    width: 34px;
    height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 9px;
    background: #ecfdf5;
    color: #059669;
  }

  .metric-label {
    margin-top: 12px;
    color: #64748b;
    font-size: 10px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: .08em;
  }

  .metric-value {
    margin-top: 4px;
    color: #0f172a;
    font-size: 22px;
    font-weight: 950;
  }

  .metric-sub {
    margin-top: 2px;
    color: #94a3b8;
    font-size: 10px;
    font-weight: 700;
  }

  .content-grid {
    display: grid;
    grid-template-columns: minmax(0,1.45fr) minmax(320px,.75fr);
    gap: 18px;
    align-items: start;
  }

  .panel {
    overflow: hidden;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    background: white;
    box-shadow: 0 6px 22px rgba(15,23,42,.045);
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 16px 18px;
    border-bottom: 1px solid #f1f5f9;
  }

  .panel-title {
    display: flex;
    align-items: center;
    gap: 9px;
    color: #0f172a;
    font-size: 13px;
    font-weight: 900;
  }

  .panel-title svg {
    color: #059669;
  }

  .panel-body {
    padding: 18px;
  }

  .tab-bar {
    display: flex;
    gap: 5px;
    padding: 7px;
    overflow-x: auto;
    border-bottom: 1px solid #e2e8f0;
    background: #f8fafc;
  }

  .tab-button {
    white-space: nowrap;
    border: 0;
    padding: 9px 13px;
    border-radius: 8px;
    background: transparent;
    color: #64748b;
    font-size: 11px;
    font-weight: 900;
    cursor: pointer;
    transition: .2s ease;
  }

  .tab-button:hover {
    color: #0f172a;
    background: #f1f5f9;
  }

  .tab-button.active {
    color: #047857;
    background: white;
    box-shadow: 0 2px 7px rgba(15,23,42,.08);
  }

  .health-overview {
    display: grid;
    grid-template-columns: 180px 1fr;
    gap: 25px;
    align-items: center;
  }

  .health-ring {
    width: 170px;
    height: 170px;
    margin: auto;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: conic-gradient(#10b981 var(--score), #e2e8f0 0);
    position: relative;
  }

  .health-ring::after {
    content: "";
    position: absolute;
    inset: 13px;
    border-radius: 50%;
    background: white;
  }

  .health-ring-content {
    position: relative;
    z-index: 2;
    text-align: center;
  }

  .health-ring-number {
    color: #0f172a;
    font-size: 32px;
    line-height: 1;
    font-weight: 950;
  }

  .health-ring-text {
    margin-top: 5px;
    color: #64748b;
    font-size: 9px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: .1em;
  }

  .health-status {
    margin-top: 8px;
    font-size: 10px;
    font-weight: 900;
  }

  .health-list {
    display: grid;
    gap: 12px;
  }

  .health-row {
    display: grid;
    grid-template-columns: 105px 1fr 55px;
    align-items: center;
    gap: 10px;
  }

  .health-row-label {
    color: #475569;
    font-size: 10px;
    font-weight: 800;
  }

  .progress-track {
    height: 8px;
    overflow: hidden;
    border-radius: 999px;
    background: #f1f5f9;
  }

  .progress-fill {
    height: 100%;
    border-radius: inherit;
    transition: width .7s ease;
  }

  .progress-value {
    text-align: right;
    color: #0f172a;
    font-size: 10px;
    font-weight: 900;
  }

  .soil-data-grid {
    display: grid;
    grid-template-columns: repeat(2,minmax(0,1fr));
    gap: 10px;
  }

  .soil-data {
    padding: 13px;
    border: 1px solid #eef2f7;
    border-radius: 11px;
    background: #f8fafc;
  }

  .soil-data-label {
    display: flex;
    align-items: center;
    gap: 5px;
    color: #94a3b8;
    font-size: 9px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: .06em;
  }

  .soil-data-value {
    margin-top: 5px;
    color: #334155;
    font-size: 16px;
    font-weight: 950;
  }

  .soil-data-status {
    margin-top: 3px;
    font-size: 9px;
    font-weight: 800;
  }

  .risk-list {
    display: grid;
    gap: 10px;
  }

  .risk-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px;
    border-radius: 11px;
    border: 1px solid;
  }

  .risk-item.high {
    color: #9f1239;
    background: #fff1f2;
    border-color: #fecdd3;
  }

  .risk-item.medium {
    color: #92400e;
    background: #fffbeb;
    border-color: #fde68a;
  }

  .risk-item.low {
    color: #166534;
    background: #f0fdf4;
    border-color: #bbf7d0;
  }

  .risk-icon {
    flex: 0 0 auto;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: rgba(255,255,255,.65);
  }

  .risk-title {
    font-size: 11px;
    font-weight: 900;
  }

  .risk-text {
    margin-top: 3px;
    font-size: 10px;
    line-height: 1.5;
    opacity: .85;
  }

  .nutrient-card {
    padding: 15px;
    border: 1px solid #e2e8f0;
    border-radius: 13px;
    background: linear-gradient(145deg,#fff,#f8fafc);
  }

  .nutrient-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .nutrient-name {
    color: #334155;
    font-size: 11px;
    font-weight: 900;
  }

  .nutrient-value {
    color: #0f172a;
    font-size: 12px;
    font-weight: 950;
  }

  .nutrient-description {
    margin: 5px 0 10px;
    color: #94a3b8;
    font-size: 9px;
    line-height: 1.5;
  }

  .nutrient-grid {
    display: grid;
    grid-template-columns: repeat(3,minmax(0,1fr));
    gap: 12px;
  }

  .micro-grid {
    display: grid;
    grid-template-columns: repeat(5,minmax(0,1fr));
    gap: 9px;
  }

  .micro-card {
    text-align: center;
    padding: 13px 8px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    background: #f8fafc;
  }

  .micro-name {
    color: #94a3b8;
    font-size: 8px;
    font-weight: 900;
    text-transform: uppercase;
  }

  .micro-value {
    margin-top: 4px;
    color: #334155;
    font-size: 15px;
    font-weight: 950;
  }

  .diagnostic-card {
    padding: 18px;
    border-radius: 15px;
    color: white;
    background:
      radial-gradient(circle at 90% 0%,rgba(52,211,153,.2),transparent 30%),
      linear-gradient(135deg,#0f172a,#172b25);
  }

  .diagnostic-label {
    color: #6ee7b7;
    font-size: 9px;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: .13em;
  }

  .diagnostic-title {
    margin-top: 7px;
    font-size: 17px;
    font-weight: 950;
  }

  .diagnostic-text {
    margin-top: 8px;
    color: #cbd5e1;
    font-size: 11px;
    line-height: 1.7;
  }

  .diagnostic-footer {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    margin-top: 15px;
    padding-top: 12px;
    border-top: 1px solid rgba(255,255,255,.1);
    color: #94a3b8;
    font-size: 9px;
    font-weight: 800;
  }

  .recommendation {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    padding: 14px;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    background: white;
    transition: .2s ease;
  }

  .recommendation:hover {
    transform: translateX(2px);
    box-shadow: 0 7px 20px rgba(15,23,42,.06);
  }

  .recommendation.high {
    background: #fff7f8;
    border-color: #fecdd3;
  }

  .recommendation.medium {
    background: #fffcf5;
    border-color: #fde68a;
  }

  .recommendation.low {
    background: #f7fdf9;
    border-color: #bbf7d0;
  }

  .recommendation-left {
    display: flex;
    gap: 10px;
  }

  .recommendation-icon {
    flex: 0 0 auto;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 9px;
  }

  .recommendation.high .recommendation-icon {
    color: #be123c;
    background: #ffe4e6;
  }

  .recommendation.medium .recommendation-icon {
    color: #b45309;
    background: #fef3c7;
  }

  .recommendation.low .recommendation-icon {
    color: #15803d;
    background: #dcfce7;
  }

  .recommendation-priority {
    font-size: 8px;
    font-weight: 950;
    letter-spacing: .1em;
    text-transform: uppercase;
  }

  .recommendation-text {
    margin-top: 3px;
    color: #334155;
    font-size: 11px;
    line-height: 1.55;
    font-weight: 700;
  }

  .comparison-table {
    width: 100%;
    border-collapse: collapse;
  }

  .comparison-table th {
    padding: 11px;
    text-align: left;
    color: #94a3b8;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    font-size: 9px;
    font-weight: 900;
    text-transform: uppercase;
  }

  .comparison-table td {
    padding: 12px 11px;
    color: #475569;
    border-bottom: 1px solid #f1f5f9;
    font-size: 10px;
    font-weight: 700;
  }

  .comparison-table tr:last-child td {
    border-bottom: 0;
  }

  .comparison-good {
    color: #059669 !important;
  }

  .comparison-bad {
    color: #e11d48 !important;
  }

  .comparison-neutral {
    color: #64748b !important;
  }

  .empty-state {
    padding: 65px 25px;
    text-align: center;
  }

  .empty-icon {
    width: 60px;
    height: 60px;
    margin: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 18px;
    background: #ecfdf5;
    color: #059669;
  }

  .empty-title {
    margin-top: 15px;
    color: #334155;
    font-size: 15px;
    font-weight: 900;
  }

  .empty-text {
    max-width: 450px;
    margin: 7px auto 0;
    color: #94a3b8;
    font-size: 11px;
    line-height: 1.6;
  }

  .error-box {
    padding: 16px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    border: 1px solid #fecdd3;
    border-radius: 12px;
    background: #fff1f2;
    color: #9f1239;
  }

  .error-content {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .error-title {
    font-size: 11px;
    font-weight: 900;
  }

  .error-text {
    margin-top: 2px;
    font-size: 10px;
    opacity: .8;
  }

  .loading-screen {
    min-height: 550px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 14px;
  }

  .loading-spinner {
    width: 42px;
    height: 42px;
    border: 4px solid #d1fae5;
    border-top-color: #059669;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .refresh-spin {
    animation: spin 1s linear infinite;
  }

  .modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: rgba(15,23,42,.55);
    backdrop-filter: blur(7px);
  }

  .modal {
    width: min(720px,100%);
    max-height: 90vh;
    overflow: auto;
    border-radius: 18px;
    background: white;
    box-shadow: 0 30px 80px rgba(15,23,42,.3);
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    padding: 18px 20px;
    border-bottom: 1px solid #e2e8f0;
  }

  .modal-title {
    color: #0f172a;
    font-size: 15px;
    font-weight: 950;
  }

  .modal-close {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 8px;
    background: #f1f5f9;
    color: #64748b;
    cursor: pointer;
  }

  .modal-body {
    padding: 20px;
  }

  .modal-grid {
    display: grid;
    grid-template-columns: repeat(2,minmax(0,1fr));
    gap: 11px;
  }

  .modal-stat {
    padding: 13px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    background: #f8fafc;
  }

  .modal-stat span {
    display: block;
    color: #94a3b8;
    font-size: 9px;
    font-weight: 900;
    text-transform: uppercase;
  }

  .modal-stat strong {
    display: block;
    margin-top: 4px;
    color: #334155;
    font-size: 15px;
    font-weight: 950;
  }

  @media (max-width: 1100px) {
    .kpi-grid {
      grid-template-columns: repeat(2,minmax(0,1fr));
    }

    .content-grid {
      grid-template-columns: 1fr;
    }

    .nutrient-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 760px) {
    .soil-page {
      padding: 12px;
    }

    .soil-toolbar {
      align-items: stretch;
      flex-direction: column;
    }

    .soil-toolbar-left,
    .soil-toolbar-right {
      width: 100%;
    }

    .soil-search {
      min-width: 0;
      flex: 1;
    }

    .soil-select {
      flex: 1;
    }

    .soil-hero {
      padding: 20px;
    }

    .soil-hero-grid {
      grid-template-columns: 1fr;
    }

    .hero-score {
      width: 125px;
      height: 125px;
      margin: 5px auto 0;
    }

    .hero-score-value {
      font-size: 29px;
    }

    .kpi-grid {
      grid-template-columns: 1fr 1fr;
    }

    .health-overview {
      grid-template-columns: 1fr;
    }

    .micro-grid {
      grid-template-columns: repeat(3,1fr);
    }

    .soil-data-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 480px) {
    .kpi-grid {
      grid-template-columns: 1fr;
    }

    .micro-grid {
      grid-template-columns: repeat(2,1fr);
    }

    .modal-grid {
      grid-template-columns: 1fr;
    }

    .hero-title {
      font-size: 25px;
    }

    .health-row {
      grid-template-columns: 80px 1fr 42px;
    }
  }

  @media print {
    .soil-toolbar,
    .tab-bar,
    .modal-overlay,
    .soil-button {
      display: none !important;
    }

    .soil-page {
      padding: 0;
      background: white;
    }

    .panel,
    .metric-card {
      box-shadow: none;
      break-inside: avoid;
    }

    .soil-hero {
      box-shadow: none;
    }
  }
`;

const clamp = (value: number, min = 0, max = 100) =>
  Math.max(min, Math.min(max, value));

const getScoreStatus = (score: number) => {
  if (score >= 80) return { label: 'Excellent', className: 'comparison-good' };
  if (score >= 65) return { label: 'Healthy', className: 'comparison-good' };
  if (score >= 45) return { label: 'Needs Attention', className: 'comparison-neutral' };
  return { label: 'Critical', className: 'comparison-bad' };
};

const getPhStatus = (ph: number) => {
  if (ph >= 6 && ph <= 7.2) return 'Optimal';
  if (ph >= 5.5 && ph < 6) return 'Slightly Acidic';
  if (ph > 7.2 && ph <= 8) return 'Slightly Alkaline';
  return 'Needs Correction';
};

const getMoistureStatus = (moisture: number) => {
  if (moisture >= 20) return 'Good';
  if (moisture >= 14) return 'Moderate';
  return 'Low';
};

const getNutrientStatus = (value: number, target: number) => {
  const percentage = (value / target) * 100;

  if (percentage >= 90 && percentage <= 120) return 'Optimal';
  if (percentage < 70) return 'Low';
  if (percentage > 130) return 'High';
  return 'Moderate';
};

export const SoilHealthAdvisor: React.FC = () => {
  const [reports, setReports] = useState<SoilReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<SoilReport | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  const loadData = async (showRefresh = false) => {
    try {
      setError('');

      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      const data = await agricultureApi.getSoilReports('farm-1');

      setReports(data);

      if (data.length > 0) {
        setSelectedReport((previous) => {
          if (!previous) return data[0];
          return data.find((report) => report.id === previous.id) || data[0];
        });
      } else {
        setSelectedReport(null);
      }
    } catch (err) {
      console.error('Soil report loading error:', err);
      setError(
        'Unable to retrieve soil reports. Check the agriculture service and try again.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return reports;

    return reports.filter((report) =>
      report.fieldName.toLowerCase().includes(query)
    );
  }, [reports, search]);

  const analytics = useMemo(() => {
    if (!selectedReport) {
      return {
        nutrientAverage: 0,
        nutrientCoverage: 0,
        moistureScore: 0,
        organicScore: 0,
        salinityScore: 0,
      };
    }

    const n = clamp((selectedReport.nitrogen / 180) * 100);
    const p = clamp((selectedReport.phosphorus / 60) * 100);
    const k = clamp((selectedReport.potassium / 220) * 100);

    return {
      nutrientAverage: Math.round((n + p + k) / 3),
      nutrientCoverage: Math.round((n + p + k) / 3),
      moistureScore: clamp((selectedReport.moistureContent / 25) * 100),
      organicScore: clamp((selectedReport.organicMatter / 5) * 100),
      salinityScore: clamp(100 - selectedReport.ec * 20),
    };
  }, [selectedReport]);

  const risks = useMemo(() => {
    if (!selectedReport) return [];

    const result: {
      level: 'high' | 'medium' | 'low';
      title: string;
      text: string;
      icon: React.ReactNode;
    }[] = [];

    if (selectedReport.phLevel < 5.5 || selectedReport.phLevel > 8) {
      result.push({
        level: 'high',
        title: 'pH imbalance detected',
        text: `Current soil pH is ${selectedReport.phLevel}. Soil chemistry may limit nutrient availability.`,
        icon: <Beaker size={15} />,
      });
    } else if (selectedReport.phLevel < 6 || selectedReport.phLevel > 7.2) {
      result.push({
        level: 'medium',
        title: 'pH requires monitoring',
        text: `pH ${selectedReport.phLevel} is outside the preferred general range used by this dashboard.`,
        icon: <Beaker size={15} />,
      });
    }

    if (selectedReport.moistureContent < 14) {
      result.push({
        level: 'high',
        title: 'Low soil moisture',
        text: `Moisture is ${selectedReport.moistureContent}%. Irrigation planning should be reviewed.`,
        icon: <Droplets size={15} />,
      });
    } else if (selectedReport.moistureContent < 18) {
      result.push({
        level: 'medium',
        title: 'Moisture below preferred level',
        text: `Current moisture is ${selectedReport.moistureContent}%. Monitor the field before the next crop stress period.`,
        icon: <Droplets size={15} />,
      });
    }

    if (selectedReport.nitrogen < 126) {
      result.push({
        level: 'high',
        title: 'Nitrogen deficiency risk',
        text: `Nitrogen is ${selectedReport.nitrogen} kg/ha against the dashboard target of 180 kg/ha.`,
        icon: <Leaf size={15} />,
      });
    }

    if (selectedReport.phosphorus < 42) {
      result.push({
        level: 'medium',
        title: 'Phosphorus below target',
        text: `Phosphorus is ${selectedReport.phosphorus} kg/ha against the target of 60 kg/ha.`,
        icon: <Sprout size={15} />,
      });
    }

    if (selectedReport.potassium < 154) {
      result.push({
        level: 'medium',
        title: 'Potassium below target',
        text: `Potassium is ${selectedReport.potassium} kg/ha against the target of 220 kg/ha.`,
        icon: <Zap size={15} />,
      });
    }

    if (selectedReport.ec > 2) {
      result.push({
        level: 'high',
        title: 'Elevated EC',
        text: `Electrical conductivity is ${selectedReport.ec} dS/m. Salinity should be monitored closely.`,
        icon: <Activity size={15} />,
      });
    }

    if (result.length === 0) {
      result.push({
        level: 'low',
        title: 'No major soil risks detected',
        text: 'The available measurements are within the dashboard monitoring thresholds.',
        icon: <ShieldCheck size={15} />,
      });
    }

    return result;
  }, [selectedReport]);

  const recommendations = useMemo(() => {
    if (!selectedReport) return [];

    const result: {
      level: 'high' | 'medium' | 'low';
      text: string;
    }[] = [];

    if (selectedReport.nitrogen < 126) {
      result.push({
        level: 'high',
        text: 'Review nitrogen management and consider a soil-test-based nitrogen application plan.',
      });
    }

    if (selectedReport.phosphorus < 42) {
      result.push({
        level: 'medium',
        text: 'Review phosphorus availability and fertilizer placement before the next crop cycle.',
      });
    }

    if (selectedReport.potassium < 154) {
      result.push({
        level: 'medium',
        text: 'Review potassium balance to support crop water regulation and overall plant development.',
      });
    }

    if (selectedReport.moistureContent < 18) {
      result.push({
        level: 'high',
        text: 'Review irrigation timing and soil moisture monitoring before applying additional nutrients.',
      });
    }

    if (selectedReport.ec > 2) {
      result.push({
        level: 'high',
        text: 'Monitor salinity and avoid unnecessary fertilizer accumulation until EC is reassessed.',
      });
    }

    if (selectedReport.phLevel < 6 || selectedReport.phLevel > 7.2) {
      result.push({
        level: 'medium',
        text: 'Review soil pH management with local agronomic guidance before applying corrective amendments.',
      });
    }

    if (result.length === 0) {
      result.push({
        level: 'low',
        text: 'Maintain the current soil management strategy and continue periodic soil testing.',
      });
    }

    return result;
  }, [selectedReport]);

  const previousReport = useMemo(() => {
    if (!selectedReport) return null;

    const index = reports.findIndex((report) => report.id === selectedReport.id);

    if (index < 0 || index === reports.length - 1) return null;

    return reports[index + 1];
  }, [reports, selectedReport]);

  const getDifference = (current: number, previous: number) => {
    const diff = current - previous;

    return {
      value: Math.abs(diff).toFixed(1),
      direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'same',
    };
  };

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="loading-screen">
          <div className="loading-spinner" />
          <div>
            <div
              style={{
                textAlign: 'center',
                fontSize: 13,
                fontWeight: 900,
                color: '#334155',
              }}
            >
              Initializing Soil Intelligence
            </div>
            <div
              style={{
                marginTop: 5,
                textAlign: 'center',
                fontSize: 10,
                color: '#94a3b8',
              }}
            >
              Retrieving farm soil reports...
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!selectedReport) {
    return (
      <>
        <style>{styles}</style>

        <div className="soil-page">
          <div className="soil-shell">
            <AgriculturePageHeader
              title="Soil Health Intelligence Center"
              description="Monitor soil chemistry, moisture, nutrients and field health from one agricultural decision-support dashboard."
              badgeText="Soil Monitoring"
            />

            {error && (
              <div className="error-box">
                <div className="error-content">
                  <AlertCircle size={18} />
                  <div>
                    <div className="error-title">Soil data unavailable</div>
                    <div className="error-text">{error}</div>
                  </div>
                </div>

                <button
                  className="soil-button"
                  onClick={() => loadData(true)}
                  disabled={refreshing}
                >
                  <RefreshCw
                    size={14}
                    className={refreshing ? 'refresh-spin' : ''}
                  />
                  Retry
                </button>
              </div>
            )}

            <div className="panel">
              <div className="empty-state">
                <div className="empty-icon">
                  <Microscope size={27} />
                </div>

                <div className="empty-title">
                  No soil reports available
                </div>

                <div className="empty-text">
                  Soil reports for this farm have not been returned by the
                  agriculture service yet.
                </div>

                <div style={{ marginTop: 18 }}>
                  <button
                    className="soil-button primary"
                    onClick={() => loadData(true)}
                    disabled={refreshing}
                  >
                    <RefreshCw
                      size={14}
                      className={refreshing ? 'refresh-spin' : ''}
                    />
                    Check Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const scoreStatus = getScoreStatus(selectedReport.healthScore);

  return (
    <>
      <style>{styles}</style>

      <div className="soil-page">
        <div className="soil-shell">

          <AgriculturePageHeader
            title="Soil Health Intelligence Center"
            description="Turn soil-test measurements into actionable field insights, nutrient monitoring and crop-management decisions."
            badgeText="Soil Intelligence Active"
            lastUpdated={selectedReport.sampleDate}
          />

          {/* TOOLBAR */}
          <div className="soil-toolbar">
            <div className="soil-toolbar-left">
              <div className="soil-search">
                <Search />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search field..."
                  aria-label="Search soil reports"
                />
              </div>

              <select
                className="soil-select"
                value={selectedReport.id}
                onChange={(e) => {
                  const report = reports.find(
                    (item) => item.id === e.target.value
                  );

                  if (report) setSelectedReport(report);
                }}
                aria-label="Select soil report"
              >
                {filteredReports.map((report) => (
                  <option key={report.id} value={report.id}>
                    {report.fieldName} — {report.sampleDate}
                  </option>
                ))}
              </select>
            </div>

            <div className="soil-toolbar-right">
              <button
                className="soil-button"
                onClick={() => window.print()}
              >
                <BarChart3 size={14} />
                Print Report
              </button>

              <button
                className="soil-button primary"
                onClick={() => loadData(true)}
                disabled={refreshing}
              >
                <RefreshCw
                  size={14}
                  className={refreshing ? 'refresh-spin' : ''}
                />
                {refreshing ? 'Syncing...' : 'Refresh Data'}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-box">
              <div className="error-content">
                <AlertCircle size={18} />

                <div>
                  <div className="error-title">
                    Soil service synchronization issue
                  </div>
                  <div className="error-text">{error}</div>
                </div>
              </div>

              <button
                className="soil-button"
                onClick={() => loadData(true)}
              >
                Retry
              </button>
            </div>
          )}

          {/* HERO */}
          <section className="soil-hero">
            <div className="soil-hero-grid">
              <div>
                <div className="hero-eyebrow">
                  <CircleDot size={12} />
                  Field Intelligence / {selectedReport.fieldName}
                </div>

                <h1 className="hero-title">
                  Soil health at a glance.
                </h1>

                <p className="hero-description">
                  Your latest soil report combines physical characteristics,
                  nutrient concentration and environmental measurements into
                  one decision-support view.
                </p>

                <div className="hero-status">
                  <span className="online-dot" />
                  Soil report synchronized · Sampled {selectedReport.sampleDate}
                </div>
              </div>

              <div
                className="hero-score"
                style={
                  {
                    background: `radial-gradient(circle,#10251d 55%,transparent 56%), conic-gradient(#34d399 ${
                      selectedReport.healthScore * 3.6
                    }deg,rgba(255,255,255,.1) 0deg)`,
                  } as React.CSSProperties
                }
              >
                <div className="hero-score-inner">
                  <span className="hero-score-value">
                    {selectedReport.healthScore}
                  </span>
                  <span className="hero-score-label">
                    Health Index
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* KPI */}
          <div className="kpi-grid">
            <div className="metric-card">
              <div className="metric-icon">
                <Gauge size={17} />
              </div>
              <div className="metric-label">Soil Health</div>
              <div className="metric-value">
                {selectedReport.healthScore}
                <span
                  style={{
                    fontSize: 11,
                    color: '#94a3b8',
                    marginLeft: 4,
                  }}
                >
                  /100
                </span>
              </div>
              <div className={`metric-sub ${scoreStatus.className}`}>
                {scoreStatus.label}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">
                <Beaker size={17} />
              </div>
              <div className="metric-label">Soil pH</div>
              <div className="metric-value">
                {selectedReport.phLevel}
              </div>
              <div className="metric-sub">
                {getPhStatus(selectedReport.phLevel)}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">
                <Droplets size={17} />
              </div>
              <div className="metric-label">Moisture</div>
              <div className="metric-value">
                {selectedReport.moistureContent}%
              </div>
              <div className="metric-sub">
                {getMoistureStatus(selectedReport.moistureContent)}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">
                <Thermometer size={17} />
              </div>
              <div className="metric-label">Temperature</div>
              <div className="metric-value">
                {selectedReport.temperature}°
              </div>
              <div className="metric-sub">Soil temperature</div>
            </div>
          </div>

          {/* SECONDARY DATA */}
          <div className="section-heading">
            <h2>Field Condition Snapshot</h2>
            <span>Latest available measurements</span>
          </div>

          <div className="content-grid">

            {/* LEFT */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">
                  <Activity size={16} />
                  Soil Condition Matrix
                </div>

                <button
                  className="soil-button"
                  style={{ height: 32, padding: '0 10px' }}
                  onClick={() => setShowDetails(true)}
                >
                  Details
                  <ChevronRight size={13} />
                </button>
              </div>

              <div className="panel-body">
                <div className="health-overview">

                  <div
                    className="health-ring"
                    style={
                      {
                        '--score': `${selectedReport.healthScore}%`,
                      } as React.CSSProperties
                    }
                  >
                    <div className="health-ring-content">
                      <div className="health-ring-number">
                        {selectedReport.healthScore}
                      </div>

                      <div className="health-ring-text">
                        Soil Index
                      </div>

                      <div
                        className={`health-status ${scoreStatus.className}`}
                      >
                        {scoreStatus.label}
                      </div>
                    </div>
                  </div>

                  <div className="health-list">

                    <div className="health-row">
                      <div className="health-row-label">
                        Nutrients
                      </div>

                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${analytics.nutrientAverage}%`,
                            background:
                              analytics.nutrientAverage >= 75
                                ? '#10b981'
                                : '#f59e0b',
                          }}
                        />
                      </div>

                      <div className="progress-value">
                        {analytics.nutrientAverage}%
                      </div>
                    </div>

                    <div className="health-row">
                      <div className="health-row-label">
                        Moisture
                      </div>

                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${analytics.moistureScore}%`,
                            background: '#3b82f6',
                          }}
                        />
                      </div>

                      <div className="progress-value">
                        {Math.round(analytics.moistureScore)}%
                      </div>
                    </div>

                    <div className="health-row">
                      <div className="health-row-label">
                        Organic Matter
                      </div>

                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${analytics.organicScore}%`,
                            background: '#8b5cf6',
                          }}
                        />
                      </div>

                      <div className="progress-value">
                        {Math.round(analytics.organicScore)}%
                      </div>
                    </div>

                    <div className="health-row">
                      <div className="health-row-label">
                        Salinity Safety
                      </div>

                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${analytics.salinityScore}%`,
                            background:
                              analytics.salinityScore > 70
                                ? '#10b981'
                                : '#f59e0b',
                          }}
                        />
                      </div>

                      <div className="progress-value">
                        {Math.round(analytics.salinityScore)}%
                      </div>
                    </div>

                  </div>
                </div>

                <div style={{ marginTop: 22 }}>
                  <div className="soil-data-grid">

                    <div className="soil-data">
                      <div className="soil-data-label">
                        <Leaf size={11} />
                        Organic Matter
                      </div>

                      <div className="soil-data-value">
                        {selectedReport.organicMatter}%
                      </div>

                      <div className="soil-data-status comparison-good">
                        Soil carbon indicator
                      </div>
                    </div>

                    <div className="soil-data">
                      <div className="soil-data-label">
                        <Activity size={11} />
                        Electrical Conductivity
                      </div>

                      <div className="soil-data-value">
                        {selectedReport.ec} dS/m
                      </div>

                      <div className="soil-data-status">
                        Salinity monitoring
                      </div>
                    </div>

                    <div className="soil-data">
                      <div className="soil-data-label">
                        <Zap size={11} />
                        Salinity
                      </div>

                      <div className="soil-data-value">
                        {selectedReport.salinity} dS/m
                      </div>

                      <div className="soil-data-status">
                        Electrical salt level
                      </div>
                    </div>

                    <div className="soil-data">
                      <div className="soil-data-label">
                        <ShieldCheck size={11} />
                        Monitoring Status
                      </div>

                      <div className="soil-data-value">
                        Active
                      </div>

                      <div className="soil-data-status comparison-good">
                        Report available
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">
                  <AlertTriangle size={16} />
                  Soil Risk Monitor
                </div>

                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 900,
                    color: '#94a3b8',
                  }}
                >
                  {risks.length} signals
                </span>
              </div>

              <div className="panel-body">
                <div className="risk-list">
                  {risks.map((risk, index) => (
                    <div
                      key={`${risk.title}-${index}`}
                      className={`risk-item ${risk.level}`}
                    >
                      <div className="risk-icon">
                        {risk.icon}
                      </div>

                      <div>
                        <div className="risk-title">
                          {risk.title}
                        </div>

                        <div className="risk-text">
                          {risk.text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="panel" style={{ marginTop: 18 }}>
            <div className="tab-bar">
              {[
                {
                  key: 'overview' as Tab,
                  label: 'Overview',
                  icon: <Gauge size={13} />,
                },
                {
                  key: 'nutrients' as Tab,
                  label: 'Nutrient Intelligence',
                  icon: <Beaker size={13} />,
                },
                {
                  key: 'diagnostics' as Tab,
                  label: 'Diagnostics',
                  icon: <Microscope size={13} />,
                },
                {
                  key: 'recommendations' as Tab,
                  label: 'Action Plan',
                  icon: <CheckCircle2 size={13} />,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  className={`tab-button ${
                    activeTab === tab.key ? 'active' : ''
                  }`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      verticalAlign: 'middle',
                      marginRight: 5,
                    }}
                  >
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="panel-body">

              {/* OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="content-grid">

                  <div>
                    <div className="section-heading" style={{ marginTop: 0 }}>
                      <h2>Current Soil Profile</h2>
                      <span>{selectedReport.fieldName}</span>
                    </div>

                    <div className="soil-data-grid">

                      <div className="soil-data">
                        <div className="soil-data-label">
                          <Beaker size={11} />
                          pH Balance
                        </div>

                        <div className="soil-data-value">
                          {selectedReport.phLevel}
                        </div>

                        <div className="soil-data-status">
                          {getPhStatus(selectedReport.phLevel)}
                        </div>
                      </div>

                      <div className="soil-data">
                        <div className="soil-data-label">
                          <Droplets size={11} />
                          Moisture
                        </div>

                        <div className="soil-data-value">
                          {selectedReport.moistureContent}%
                        </div>

                        <div className="soil-data-status">
                          {getMoistureStatus(
                            selectedReport.moistureContent
                          )}
                        </div>
                      </div>

                      <div className="soil-data">
                        <div className="soil-data-label">
                          <Thermometer size={11} />
                          Temperature
                        </div>

                        <div className="soil-data-value">
                          {selectedReport.temperature} °C
                        </div>

                        <div className="soil-data-status">
                          Thermal reading
                        </div>
                      </div>

                      <div className="soil-data">
                        <div className="soil-data-label">
                          <Leaf size={11} />
                          Organic Matter
                        </div>

                        <div className="soil-data-value">
                          {selectedReport.organicMatter}%
                        </div>

                        <div className="soil-data-status">
                          Organic content
                        </div>
                      </div>

                    </div>
                  </div>

                  <div className="diagnostic-card">
                    <div className="diagnostic-label">
                      Field intelligence summary
                    </div>

                    <div className="diagnostic-title">
                      {scoreStatus.label} soil condition
                    </div>

                    <div className="diagnostic-text">
                      The current report gives a health index of{' '}
                      <strong>{selectedReport.healthScore}/100</strong>.
                      The dashboard has identified{' '}
                      <strong>{risks.length}</strong> monitoring signals
                      from the available soil measurements.
                    </div>

                    <div className="diagnostic-footer">
                      <span>
                        Field: {selectedReport.fieldName}
                      </span>

                      <span>
                        Sample: {selectedReport.sampleDate}
                      </span>
                    </div>
                  </div>

                </div>
              )}

              {/* NUTRIENTS */}
              {activeTab === 'nutrients' && (
                <div>

                  <div className="section-heading" style={{ marginTop: 0 }}>
                    <h2>NPK Nutrient Intelligence</h2>
                    <span>kg/ha</span>
                  </div>

                  <div className="nutrient-grid">

                    {[
                      {
                        name: 'Nitrogen (N)',
                        value: selectedReport.nitrogen,
                        target: 180,
                        description:
                          'Supports vegetative growth and crop development.',
                        icon: <Leaf size={15} />,
                      },
                      {
                        name: 'Phosphorus (P)',
                        value: selectedReport.phosphorus,
                        target: 60,
                        description:
                          'Important for root development and energy transfer.',
                        icon: <Sprout size={15} />,
                      },
                      {
                        name: 'Potassium (K)',
                        value: selectedReport.potassium,
                        target: 220,
                        description:
                          'Supports water regulation and crop resilience.',
                        icon: <Zap size={15} />,
                      },
                    ].map((nutrient) => {
                      const percentage = clamp(
                        (nutrient.value / nutrient.target) * 100
                      );

                      const status = getNutrientStatus(
                        nutrient.value,
                        nutrient.target
                      );

                      return (
                        <div
                          className="nutrient-card"
                          key={nutrient.name}
                        >
                          <div className="nutrient-top">
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 7,
                              }}
                            >
                              <div className="metric-icon">
                                {nutrient.icon}
                              </div>

                              <span className="nutrient-name">
                                {nutrient.name}
                              </span>
                            </div>

                            <span className="nutrient-value">
                              {nutrient.value}/{nutrient.target}
                            </span>
                          </div>

                          <p className="nutrient-description">
                            {nutrient.description}
                          </p>

                          <div className="progress-track">
                            <div
                              className="progress-fill"
                              style={{
                                width: `${percentage}%`,
                                background:
                                  status === 'Optimal'
                                    ? '#10b981'
                                    : status === 'Low'
                                    ? '#f43f5e'
                                    : '#f59e0b',
                              }}
                            />
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              marginTop: 7,
                            }}
                          >
                            <span
                              style={{
                                color: '#94a3b8',
                                fontSize: 9,
                                fontWeight: 800,
                              }}
                            >
                              Target coverage
                            </span>

                            <span
                              style={{
                                color:
                                  status === 'Optimal'
                                    ? '#059669'
                                    : status === 'Low'
                                    ? '#e11d48'
                                    : '#d97706',
                                fontSize: 9,
                                fontWeight: 900,
                              }}
                            >
                              {Math.round(percentage)}% · {status}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                  </div>

                  <div className="section-heading">
                    <h2>Micronutrient Trace Matrix</h2>
                    <span>Available report values</span>
                  </div>

                  <div className="micro-grid">
                    {Object.entries(selectedReport.micronutrients).map(
                      ([key, value]) => (
                        <div
                          className="micro-card"
                          key={key}
                        >
                          <div className="micro-name">
                            {key}
                          </div>

                          <div className="micro-value">
                            {value}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* DIAGNOSTICS */}
              {activeTab === 'diagnostics' && (
                <div className="content-grid">

                  <div className="diagnostic-card">
                    <div className="diagnostic-label">
                      Automated soil diagnostic
                    </div>

                    <div className="diagnostic-title">
                      {selectedReport.fieldName}
                    </div>

                    <div className="diagnostic-text">
                      Based on the current report values, the dashboard
                      classifies overall soil condition as{' '}
                      <strong>{scoreStatus.label}</strong>. The nutrient
                      coverage estimate is{' '}
                      <strong>{analytics.nutrientCoverage}%</strong>,
                      while the moisture indicator is{' '}
                      <strong>
                        {Math.round(analytics.moistureScore)}%
                      </strong>
                      .
                    </div>

                    <div className="diagnostic-footer">
                      <span>
                        pH: {selectedReport.phLevel}
                      </span>

                      <span>
                        EC: {selectedReport.ec} dS/m
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="section-heading" style={{ marginTop: 0 }}>
                      <h2>Diagnostic Signals</h2>
                      <span>Calculated from available fields</span>
                    </div>

                    <div className="risk-list">
                      {risks.map((risk, index) => (
                        <div
                          className={`risk-item ${risk.level}`}
                          key={index}
                        >
                          <div className="risk-icon">
                            {risk.icon}
                          </div>

                          <div>
                            <div className="risk-title">
                              {risk.title}
                            </div>

                            <div className="risk-text">
                              {risk.text}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* RECOMMENDATIONS */}
              {activeTab === 'recommendations' && (
                <div>

                  <div
                    className="section-heading"
                    style={{ marginTop: 0 }}
                  >
                    <h2>Recommended Action Plan</h2>
                    <span>
                      Prioritized from current measurements
                    </span>
                  </div>

                  <div style={{ display: 'grid', gap: 10 }}>
                    {recommendations.map((recommendation, index) => (
                      <div
                        className={`recommendation ${recommendation.level}`}
                        key={index}
                      >
                        <div className="recommendation-left">

                          <div className="recommendation-icon">
                            {recommendation.level === 'high' ? (
                              <AlertTriangle size={16} />
                            ) : recommendation.level === 'medium' ? (
                              <Bell size={16} />
                            ) : (
                              <CheckCircle2 size={16} />
                            )}
                          </div>

                          <div>
                            <div className="recommendation-priority">
                              {recommendation.level} priority
                            </div>

                            <div className="recommendation-text">
                              {recommendation.text}
                            </div>
                          </div>

                        </div>

                        <ChevronRight
                          size={15}
                          color="#94a3b8"
                        />
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      marginTop: 16,
                      padding: 13,
                      borderRadius: 11,
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      color: '#64748b',
                      fontSize: 9,
                      lineHeight: 1.6,
                    }}
                  >
                    <strong style={{ color: '#334155' }}>
                      Decision-support note:
                    </strong>{' '}
                    These recommendations are generated from the measurements
                    available in this soil report. Fertilizer and amendment
                    decisions should be confirmed against the crop, soil
                    history and local agronomic guidance.
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* COMPARISON */}
          {previousReport && (
            <div className="panel" style={{ marginTop: 18 }}>
              <div className="panel-header">
                <div className="panel-title">
                  <LineChart size={16} />
                  Soil Report Comparison
                </div>

                <span
                  style={{
                    color: '#94a3b8',
                    fontSize: 9,
                    fontWeight: 800,
                  }}
                >
                  Current vs previous available report
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="comparison-table">
                  <thead>
                    <tr>
                      <th>Measurement</th>
                      <th>Previous</th>
                      <th>Current</th>
                      <th>Movement</th>
                    </tr>
                  </thead>

                  <tbody>

                    {[
                      {
                        name: 'Health Score',
                        current: selectedReport.healthScore,
                        previous: previousReport.healthScore,
                        suffix: '/100',
                      },
                      {
                        name: 'pH',
                        current: selectedReport.phLevel,
                        previous: previousReport.phLevel,
                        suffix: '',
                      },
                      {
                        name: 'Moisture',
                        current: selectedReport.moistureContent,
                        previous: previousReport.moistureContent,
                        suffix: '%',
                      },
                      {
                        name: 'Temperature',
                        current: selectedReport.temperature,
                        previous: previousReport.temperature,
                        suffix: ' °C',
                      },
                      {
                        name: 'Organic Matter',
                        current: selectedReport.organicMatter,
                        previous: previousReport.organicMatter,
                        suffix: '%',
                      },
                      {
                        name: 'EC',
                        current: selectedReport.ec,
                        previous: previousReport.ec,
                        suffix: ' dS/m',
                      },
                    ].map((row) => {
                      const difference = getDifference(
                        row.current,
                        row.previous
                      );

                      return (
                        <tr key={row.name}>
                          <td>{row.name}</td>

                          <td>
                            {row.previous}
                            {row.suffix}
                          </td>

                          <td>
                            <strong style={{ color: '#0f172a' }}>
                              {row.current}
                              {row.suffix}
                            </strong>
                          </td>

                          <td
                            className={
                              difference.direction === 'up'
                                ? 'comparison-good'
                                : difference.direction === 'down'
                                ? 'comparison-bad'
                                : 'comparison-neutral'
                            }
                          >
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              {difference.direction === 'up' ? (
                                <TrendingUp size={12} />
                              ) : difference.direction === 'down' ? (
                                <TrendingDown size={12} />
                              ) : (
                                <Activity size={12} />
                              )}

                              {difference.direction === 'same'
                                ? 'No change'
                                : `${difference.value} change`}
                            </span>
                          </td>
                        </tr>
                      );
                    })}

                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* FOOTER */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 15,
              flexWrap: 'wrap',
              padding: '18px 4px',
              color: '#94a3b8',
              fontSize: 9,
              fontWeight: 700,
            }}
          >
            <span>
              Soil Intelligence Center · {selectedReport.fieldName}
            </span>

            <span>
              Data source: Agriculture Soil Reports API
            </span>
          </div>

        </div>
      </div>

      {/* DETAILS MODAL */}
      {showDetails && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowDetails(false);
            }
          }}
        >
          <div className="modal">

            <div className="modal-header">
              <div>
                <div className="modal-title">
                  Soil Report Details
                </div>

                <div
                  style={{
                    marginTop: 3,
                    color: '#94a3b8',
                    fontSize: 9,
                    fontWeight: 800,
                  }}
                >
                  {selectedReport.fieldName} ·{' '}
                  {selectedReport.sampleDate}
                </div>
              </div>

              <button
                className="modal-close"
                onClick={() => setShowDetails(false)}
                aria-label="Close soil report details"
              >
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">

              <div className="modal-grid">

                <div className="modal-stat">
                  <span>Health Score</span>
                  <strong>
                    {selectedReport.healthScore}/100
                  </strong>
                </div>

                <div className="modal-stat">
                  <span>pH</span>
                  <strong>{selectedReport.phLevel}</strong>
                </div>

                <div className="modal-stat">
                  <span>Moisture</span>
                  <strong>
                    {selectedReport.moistureContent}%
                  </strong>
                </div>

                <div className="modal-stat">
                  <span>Temperature</span>
                  <strong>
                    {selectedReport.temperature} °C
                  </strong>
                </div>

                <div className="modal-stat">
                  <span>Organic Matter</span>
                  <strong>
                    {selectedReport.organicMatter}%
                  </strong>
                </div>

                <div className="modal-stat">
                  <span>EC</span>
                  <strong>
                    {selectedReport.ec} dS/m
                  </strong>
                </div>

                <div className="modal-stat">
                  <span>Nitrogen</span>
                  <strong>
                    {selectedReport.nitrogen} kg/ha
                  </strong>
                </div>

                <div className="modal-stat">
                  <span>Phosphorus</span>
                  <strong>
                    {selectedReport.phosphorus} kg/ha
                  </strong>
                </div>

                <div className="modal-stat">
                  <span>Potassium</span>
                  <strong>
                    {selectedReport.potassium} kg/ha
                  </strong>
                </div>

                <div className="modal-stat">
                  <span>Salinity</span>
                  <strong>
                    {selectedReport.salinity} dS/m
                  </strong>
                </div>

              </div>

              <div
                style={{
                  marginTop: 16,
                  padding: 14,
                  borderRadius: 11,
                  background: '#ecfdf5',
                  border: '1px solid #bbf7d0',
                  color: '#166534',
                  fontSize: 10,
                  lineHeight: 1.6,
                }}
              >
                <strong>Monitoring summary:</strong>{' '}
                {risks.length === 1 &&
                risks[0].level === 'low'
                  ? 'No major monitoring concerns were detected from the available measurements.'
                  : `${risks.length} soil monitoring signal(s) require attention or continued observation.`}
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginTop: 16,
                }}
              >
                <button
                  className="soil-button primary"
                  onClick={() => setShowDetails(false)}
                >
                  Close Report
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SoilHealthAdvisor;