import React, { useEffect, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.tsx";
import {
  ArrowUp,
  ArrowUpRight,
  Bell,
  Check,
  ChevronDown,
  Cloud,
  CloudRain,
  Facebook,
  Globe2,
  Heart,
  Instagram,
  Leaf,
  Linkedin,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Play,
  Search,
  Send,
  Shield,
  ShieldCheck,
  Sprout,
  Tractor,
  Twitter,
  Users,
  Wheat,
  X,
  Youtube,
  Zap,
  BarChart3,
  Brain,
  Bug,
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock3,
  Droplets,
  Eye,
  FileText,
  Languages,
  Lock,
  Microscope,
  Navigation,
  PhoneCall,
  Settings,
  Sparkles,
  Star,
  Sun,
  Target,
  ThermometerSun,
  TrendingUp,
  UserRound,
  Wifi,
} from "lucide-react";

/* ============================================================
   AGRI AI PLATFORM
   PREMIUM SINGLE-FILE FOOTER
   ============================================================ */

type FooterLink = {
  label: string;
  href: string;
  badge?: string;
};

type SocialLink = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const Footer: React.FC = () => {
  const { language, setLanguage, languages, t } = useLanguage();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeFeature, setActiveFeature] = useState<number | null>(null);
  const [currentYear] = useState(new Date().getFullYear());

  /* ------------------------------------------------------------
     Scroll listener
     ------------------------------------------------------------ */

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 450);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* ------------------------------------------------------------
     Newsletter
     ------------------------------------------------------------ */

  const handleSubscribe = (event: React.FormEvent) => {
    event.preventDefault();

    if (!email.trim()) {
      return;
    }

    setSubscribed(true);
    setEmail("");

    setTimeout(() => {
      setSubscribed(false);
    }, 5000);
  };

  /* ------------------------------------------------------------
     Back to top
     ------------------------------------------------------------ */

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* ------------------------------------------------------------
     Language
     ------------------------------------------------------------ */

  /* ------------------------------------------------------------
     Footer links
     ------------------------------------------------------------ */

  const platformLinks: FooterLink[] = [
    {
      label: "AI Crop Recommendation",
      href: "/crop-recommendation",
    },
    {
      label: "Disease Detection",
      href: "/disease-detection",
      badge: "AI",
    },
    {
      label: "Yield Prediction",
      href: "/yield-prediction",
    },
    {
      label: "Weather Advisory",
      href: "/weather",
    },
    {
      label: "Market Prices",
      href: "/market-prices",
    },
    {
      label: "Soil Analysis",
      href: "/soil-analysis",
    },
    {
      label: "Farmer Dashboard",
      href: "/dashboard",
    },
    {
      label: "AI Assistant",
      href: "/ai-assistant",
      badge: "NEW",
    },
  ];

  const farmerLinks: FooterLink[] = [
    {
      label: "My Farm",
      href: "/my-farm",
    },
    {
      label: "Crop Calendar",
      href: "/crop-calendar",
    },
    {
      label: "Farm Expenses",
      href: "/expenses",
    },
    {
      label: "Farm Reports",
      href: "/reports",
    },
    {
      label: "Irrigation Planner",
      href: "/irrigation",
    },
    {
      label: "Pest Alerts",
      href: "/pest-alerts",
    },
    {
      label: "Government Schemes",
      href: "/schemes",
    },
    {
      label: "Agriculture Resources",
      href: "/resources",
    },
  ];

  const companyLinks: FooterLink[] = [
    {
      label: "About Us",
      href: "/about",
    },
    {
      label: "Our Technology",
      href: "/technology",
    },
    {
      label: "AI Research",
      href: "/research",
    },
    {
      label: "Success Stories",
      href: "/success-stories",
    },
    {
      label: "Careers",
      href: "/careers",
      badge: "HIRING",
    },
    {
      label: "Partners",
      href: "/partners",
    },
    {
      label: "Contact Us",
      href: "/contact",
    },
    {
      label: "Press & Media",
      href: "/press",
    },
  ];

  const supportLinks: FooterLink[] = [
    {
      label: "Help Center",
      href: "/help",
    },
    {
      label: "Farmer Support",
      href: "/farmer-support",
    },
    {
      label: "Report an Issue",
      href: "/report-issue",
    },
    {
      label: "FAQs",
      href: "/faq",
    },
    {
      label: "Community",
      href: "/community",
    },
    {
      label: "Feedback",
      href: "/feedback",
    },
    {
      label: "System Status",
      href: "/status",
    },
    {
      label: "Accessibility",
      href: "/accessibility",
    },
  ];

  /* ------------------------------------------------------------
     Social links
     ------------------------------------------------------------ */

  const socialLinks: SocialLink[] = [
    {
      label: "Facebook",
      href: "#facebook",
      icon: <Facebook size={19} />,
    },
    {
      label: "Instagram",
      href: "#instagram",
      icon: <Instagram size={19} />,
    },
    {
      label: "LinkedIn",
      href: "#linkedin",
      icon: <Linkedin size={19} />,
    },
    {
      label: "Twitter",
      href: "#twitter",
      icon: <Twitter size={19} />,
    },
    {
      label: "YouTube",
      href: "#youtube",
      icon: <Youtube size={19} />,
    },
  ];

  /* ------------------------------------------------------------
     AI features
     ------------------------------------------------------------ */

  const aiFeatures = [
    {
      icon: <Brain size={24} />,
      title: "AI Crop Intelligence",
      description:
        "Get intelligent crop recommendations based on soil, climate, season and regional conditions.",
      href: "/crop-recommendation",
    },
    {
      icon: <Bug size={24} />,
      title: "Plant Disease Detection",
      description:
        "Upload a crop image and use AI-assisted analysis to identify possible plant diseases.",
      href: "/disease-detection",
    },
    {
      icon: <TrendingUp size={24} />,
      title: "Yield Prediction",
      description:
        "Estimate potential crop production using farm, weather and historical information.",
      href: "/yield-prediction",
    },
    {
      icon: <CloudRain size={24} />,
      title: "Weather Advisory",
      description:
        "Receive agriculture-focused weather insights and timely farming recommendations.",
      href: "/weather",
    },
  ];

  /* ------------------------------------------------------------
     Trust statistics
     ------------------------------------------------------------ */

  const statistics = [
    {
      value: "10+",
      label: "Farmers Supported",
      icon: <Users size={20} />,
    },
    {
      value: "120+",
      label: "Crops Covered",
      icon: <Wheat size={20} />,
    },
    {
      value: "6+",
      label: "Indian Languages",
      icon: <Languages size={20} />,
    },
    {
      value: "24/7",
      label: "Agri Assistance",
      icon: <Zap size={20} />,
    },
  ];

  /* ------------------------------------------------------------
     Service cards
     ------------------------------------------------------------ */

  const serviceCards = [
    {
      icon: <Camera size={25} />,
      title: "Scan Your Crop",
      text: "Upload a clear photo of your crop for AI analysis.",
      action: "Start Detection",
      href: "/disease-detection",
    },
    {
      icon: <Sprout size={25} />,
      title: "Find Best Crop",
      text: "Discover suitable crops for your soil and climate.",
      action: "Get Recommendation",
      href: "/crop-recommendation",
    },
    {
      icon: <Cloud size={25} />,
      title: "Check Weather",
      text: "Plan farming activities using weather intelligence.",
      action: "View Weather",
      href: "/weather",
    },
  ];

  return (
    <>
      {/* ========================================================
          GLOBAL FOOTER STYLES
          ======================================================== */}

      <style>{`

        /* ======================================================
           ROOT
           ====================================================== */

        .agri-footer {
          --agri-primary: #16a34a;
          --agri-primary-dark: #15803d;
          --agri-primary-light: #22c55e;
          --agri-secondary: #84cc16;
          --agri-accent: #f59e0b;
          --agri-dark: #052e16;
          --agri-dark-2: #071f13;
          --agri-dark-3: #0b2818;
          --agri-border: rgba(134, 239, 172, 0.13);
          --agri-text: #e2f5e7;
          --agri-muted: #9fbea8;
          --agri-white: #ffffff;
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 15% 5%,
              rgba(34, 197, 94, 0.12),
              transparent 25%
            ),
            radial-gradient(
              circle at 85% 20%,
              rgba(132, 204, 22, 0.08),
              transparent 25%
            ),
            linear-gradient(
              180deg,
              #041d10 0%,
              #052e16 38%,
              #03170c 100%
            );
          color: var(--agri-text);
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        /* ======================================================
           BACKGROUND EFFECTS
           ====================================================== */

        .agri-footer::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(
              rgba(255, 255, 255, 0.018) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.018) 1px,
              transparent 1px
            );
          background-size: 70px 70px;
          mask-image: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.8),
            transparent 70%
          );
        }

        .agri-footer::after {
          content: "";
          position: absolute;
          width: 650px;
          height: 650px;
          top: -350px;
          right: -200px;
          border-radius: 50%;
          background: rgba(34, 197, 94, 0.055);
          filter: blur(10px);
          pointer-events: none;
        }

        .agri-footer-container {
          width: min(1440px, calc(100% - 48px));
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        /* ======================================================
           TOP ANNOUNCEMENT
           ====================================================== */

        .agri-footer-announcement {
          padding: 14px 0;
          border-bottom: 1px solid var(--agri-border);
          background: rgba(2, 20, 10, 0.72);
          backdrop-filter: blur(16px);
        }

        .agri-footer-announcement-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .agri-live-status {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: #bbf7d0;
          font-size: 13px;
          font-weight: 600;
        }

        .agri-live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 0 5px rgba(74, 222, 128, 0.1);
          animation: agri-pulse 2s infinite;
        }

        @keyframes agri-pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.35);
          }

          70% {
            box-shadow: 0 0 0 8px rgba(74, 222, 128, 0);
          }

          100% {
            box-shadow: 0 0 0 0 rgba(74, 222, 128, 0);
          }
        }

        .agri-announcement-message {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #a7c8b1;
          font-size: 13px;
        }

        .agri-announcement-message svg {
          color: #86efac;
        }

        .agri-announcement-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #86efac;
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
          transition: 0.25s ease;
        }

        .agri-announcement-link:hover {
          color: #dcfce7;
          transform: translateX(2px);
        }

        /* ======================================================
           TRUST STATS
           ====================================================== */

        .agri-stat-strip {
          padding: 30px 0;
          border-bottom: 1px solid var(--agri-border);
        }

        .agri-stat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }

        .agri-stat-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 17px 18px;
          border: 1px solid var(--agri-border);
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.025);
          transition:
            transform 0.25s ease,
            border-color 0.25s ease,
            background 0.25s ease;
        }

        .agri-stat-card:hover {
          transform: translateY(-4px);
          border-color: rgba(134, 239, 172, 0.3);
          background: rgba(34, 197, 94, 0.055);
        }

        .agri-stat-icon {
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 13px;
          color: #86efac;
          background:
            linear-gradient(
              145deg,
              rgba(34, 197, 94, 0.17),
              rgba(132, 204, 22, 0.07)
            );
          border: 1px solid rgba(134, 239, 172, 0.12);
        }

        .agri-stat-value {
          color: #f0fdf4;
          font-size: 21px;
          line-height: 1.1;
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        .agri-stat-label {
          margin-top: 4px;
          color: #8eb29a;
          font-size: 12px;
        }

        /* ======================================================
           AI FEATURE SECTION
           ====================================================== */

        .agri-ai-section {
          padding: 72px 0;
          border-bottom: 1px solid var(--agri-border);
        }

        .agri-section-heading {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 30px;
          margin-bottom: 30px;
        }

        .agri-heading-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 11px;
          color: #86efac;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          font-weight: 800;
        }

        .agri-heading-eyebrow svg {
          width: 15px;
          height: 15px;
        }

        .agri-heading-title {
          max-width: 650px;
          margin: 0;
          color: #f0fdf4;
          font-size: clamp(28px, 4vw, 43px);
          line-height: 1.05;
          letter-spacing: -0.045em;
          font-weight: 850;
        }

        .agri-heading-description {
          max-width: 560px;
          margin: 13px 0 0;
          color: #8fb39b;
          font-size: 14px;
          line-height: 1.75;
        }

        .agri-ai-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 13px;
          border: 1px solid rgba(134, 239, 172, 0.14);
          border-radius: 999px;
          color: #bbf7d0;
          background: rgba(34, 197, 94, 0.055);
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }

        .agri-ai-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }

        .agri-ai-card {
          position: relative;
          min-height: 245px;
          padding: 23px;
          border: 1px solid var(--agri-border);
          border-radius: 22px;
          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.045),
              rgba(255, 255, 255, 0.012)
            );
          overflow: hidden;
          transition:
            transform 0.3s ease,
            border-color 0.3s ease,
            box-shadow 0.3s ease;
        }

        .agri-ai-card::before {
          content: "";
          position: absolute;
          width: 120px;
          height: 120px;
          right: -50px;
          top: -50px;
          border-radius: 50%;
          background: rgba(34, 197, 94, 0.09);
          filter: blur(4px);
          transition: 0.35s ease;
        }

        .agri-ai-card:hover {
          transform: translateY(-8px);
          border-color: rgba(134, 239, 172, 0.27);
          box-shadow: 0 24px 50px rgba(0, 0, 0, 0.2);
        }

        .agri-ai-card:hover::before {
          transform: scale(1.5);
        }

        .agri-ai-card.active {
          border-color: rgba(134, 239, 172, 0.34);
        }

        .agri-ai-icon {
          position: relative;
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 15px;
          color: #86efac;
          background: rgba(34, 197, 94, 0.09);
          border: 1px solid rgba(134, 239, 172, 0.12);
          margin-bottom: 20px;
        }

        .agri-ai-card-title {
          position: relative;
          margin: 0;
          color: #ecfdf5;
          font-size: 17px;
          font-weight: 800;
        }

        .agri-ai-card-text {
          position: relative;
          min-height: 66px;
          margin: 10px 0 19px;
          color: #86a891;
          font-size: 13px;
          line-height: 1.65;
        }

        .agri-ai-card-link {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #bbf7d0;
          text-decoration: none;
          font-size: 12px;
          font-weight: 800;
          transition: 0.25s ease;
        }

        .agri-ai-card-link:hover {
          color: white;
          gap: 9px;
        }

        /* ======================================================
           SERVICES CTA
           ====================================================== */

        .agri-service-section {
          padding: 65px 0;
          border-bottom: 1px solid var(--agri-border);
        }

        .agri-service-layout {
          display: grid;
          grid-template-columns: 0.85fr 1.7fr;
          gap: 45px;
          align-items: center;
        }

        .agri-service-copy h3 {
          margin: 0;
          color: #f0fdf4;
          font-size: 28px;
          line-height: 1.15;
          letter-spacing: -0.035em;
        }

        .agri-service-copy p {
          margin: 13px 0 0;
          color: #8cae98;
          font-size: 14px;
          line-height: 1.75;
        }

        .agri-service-list {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 13px;
        }

        .agri-service-card {
          padding: 20px;
          border-radius: 19px;
          border: 1px solid var(--agri-border);
          background: rgba(255, 255, 255, 0.025);
          transition: 0.3s ease;
        }

        .agri-service-card:hover {
          transform: translateY(-5px);
          background: rgba(34, 197, 94, 0.055);
          border-color: rgba(134, 239, 172, 0.22);
        }

        .agri-service-icon {
          width: 43px;
          height: 43px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          color: #bef264;
          background: rgba(132, 204, 22, 0.08);
          margin-bottom: 17px;
        }

        .agri-service-card h4 {
          margin: 0;
          color: #ecfdf5;
          font-size: 15px;
          font-weight: 800;
        }

        .agri-service-card p {
          margin: 8px 0 15px;
          color: #799985;
          font-size: 12px;
          line-height: 1.6;
        }

        .agri-service-action {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #86efac;
          text-decoration: none;
          font-size: 11px;
          font-weight: 800;
        }

        /* ======================================================
           MAIN FOOTER CONTENT
           ====================================================== */

        .agri-main-footer {
          padding: 72px 0 55px;
        }

        .agri-footer-main-grid {
          display: grid;
          grid-template-columns: 1.5fr repeat(4, 1fr);
          gap: 45px;
        }

        .agri-brand-column {
          max-width: 320px;
        }

        /* ======================================================
           BRAND
           ====================================================== */

        .agri-brand {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          color: white;
          text-decoration: none;
        }

        .agri-brand-logo {
          position: relative;
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 15px;
          color: white;
          background:
            linear-gradient(
              145deg,
              #22c55e,
              #15803d
            );
          box-shadow:
            0 12px 25px rgba(34, 197, 94, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.25);
        }

        .agri-brand-logo::after {
          content: "";
          position: absolute;
          width: 9px;
          height: 9px;
          top: 7px;
          right: 7px;
          border-radius: 50%;
          background: #bef264;
          box-shadow: 0 0 14px rgba(190, 242, 100, 0.8);
        }

        .agri-brand-name {
          font-size: 20px;
          font-weight: 900;
          letter-spacing: -0.04em;
        }

        .agri-brand-name span {
          color: #86efac;
        }

        .agri-brand-tagline {
          margin: 18px 0 0;
          color: #8cae98;
          font-size: 13px;
          line-height: 1.8;
        }

        .agri-brand-location {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 17px;
          color: #779583;
          font-size: 11px;
        }

        .agri-brand-location svg {
          color: #86efac;
        }

        /* ======================================================
           SOCIAL
           ====================================================== */

        .agri-social-title {
          margin: 26px 0 12px;
          color: #b9d5c1;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-weight: 800;
        }

        .agri-socials {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .agri-social {
          width: 37px;
          height: 37px;
          display: grid;
          place-items: center;
          border: 1px solid var(--agri-border);
          border-radius: 11px;
          color: #89aa94;
          background: rgba(255, 255, 255, 0.025);
          text-decoration: none;
          transition: 0.25s ease;
        }

        .agri-social:hover {
          color: white;
          border-color: rgba(134, 239, 172, 0.3);
          background: rgba(34, 197, 94, 0.11);
          transform: translateY(-3px);
        }

        /* ======================================================
           FOOTER COLUMNS
           ====================================================== */

        .agri-footer-column h4 {
          margin: 3px 0 20px;
          color: #ecfdf5;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.09em;
          font-weight: 850;
        }

        .agri-footer-links {
          display: flex;
          flex-direction: column;
          gap: 11px;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .agri-footer-links li {
          margin: 0;
          padding: 0;
        }

        .agri-footer-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #82a28d;
          text-decoration: none;
          font-size: 12px;
          line-height: 1.4;
          transition:
            color 0.2s ease,
            transform 0.2s ease;
        }

        .agri-footer-link:hover {
          color: #bbf7d0;
          transform: translateX(3px);
        }

        .agri-footer-link-badge {
          padding: 2px 5px;
          border-radius: 5px;
          color: #052e16;
          background: #86efac;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 0.05em;
        }

        /* ======================================================
           NEWSLETTER
           ====================================================== */

        .agri-newsletter {
          padding: 42px;
          border: 1px solid rgba(134, 239, 172, 0.13);
          border-radius: 27px;
          background:
            radial-gradient(
              circle at 90% 0%,
              rgba(132, 204, 22, 0.12),
              transparent 35%
            ),
            linear-gradient(
              145deg,
              rgba(34, 197, 94, 0.09),
              rgba(255, 255, 255, 0.025)
            );
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.04),
            0 25px 70px rgba(0, 0, 0, 0.14);
        }

        .agri-newsletter-grid {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          align-items: center;
          gap: 50px;
        }

        .agri-newsletter-eyebrow {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 11px;
          color: #bef264;
          font-size: 11px;
          font-weight: 850;
          text-transform: uppercase;
          letter-spacing: 0.13em;
        }

        .agri-newsletter-title {
          margin: 0;
          color: #f0fdf4;
          font-size: 27px;
          line-height: 1.2;
          letter-spacing: -0.035em;
          font-weight: 850;
        }

        .agri-newsletter-description {
          margin: 11px 0 0;
          max-width: 600px;
          color: #87a994;
          font-size: 13px;
          line-height: 1.7;
        }

        .agri-newsletter-form {
          display: flex;
          padding: 5px;
          gap: 5px;
          border: 1px solid rgba(134, 239, 172, 0.16);
          border-radius: 15px;
          background: rgba(0, 0, 0, 0.18);
        }

        .agri-newsletter-input-wrap {
          position: relative;
          flex: 1;
          display: flex;
          align-items: center;
        }

        .agri-newsletter-input-icon {
          position: absolute;
          left: 13px;
          color: #63856f;
          pointer-events: none;
        }

        .agri-newsletter-input {
          width: 100%;
          min-width: 0;
          height: 46px;
          padding: 0 12px 0 41px;
          border: 0;
          outline: 0;
          color: #eaffef;
          background: transparent;
          font: inherit;
          font-size: 12px;
        }

        .agri-newsletter-input::placeholder {
          color: #62816c;
        }

        .agri-newsletter-button {
          height: 46px;
          padding: 0 17px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border: 0;
          border-radius: 11px;
          color: #052e16;
          background:
            linear-gradient(
              135deg,
              #86efac,
              #bef264
            );
          font: inherit;
          font-size: 12px;
          font-weight: 850;
          cursor: pointer;
          transition: 0.25s ease;
        }

        .agri-newsletter-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(134, 239, 172, 0.16);
        }

        .agri-newsletter-button:active {
          transform: translateY(0);
        }

        .agri-newsletter-success {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 11px;
          color: #86efac;
          font-size: 11px;
          font-weight: 700;
        }

        .agri-newsletter-note {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 9px;
          color: #617f6b;
          font-size: 10px;
        }

        /* ======================================================
           CONTACT AREA
           ====================================================== */

        .agri-contact-section {
          padding: 30px 0;
          border-top: 1px solid var(--agri-border);
          border-bottom: 1px solid var(--agri-border);
        }

        .agri-contact-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .agri-contact-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 17px;
          border: 1px solid var(--agri-border);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.018);
          text-decoration: none;
          transition: 0.25s ease;
        }

        .agri-contact-card:hover {
          border-color: rgba(134, 239, 172, 0.22);
          background: rgba(34, 197, 94, 0.045);
        }

        .agri-contact-icon {
          width: 41px;
          height: 41px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 12px;
          color: #86efac;
          background: rgba(34, 197, 94, 0.08);
        }

        .agri-contact-label {
          margin-bottom: 3px;
          color: #658571;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 800;
        }

        .agri-contact-value {
          color: #d8f3df;
          font-size: 12px;
          font-weight: 700;
        }

        .agri-contact-arrow {
          margin-left: auto;
          color: #54735e;
          transition: 0.2s ease;
        }

        .agri-contact-card:hover .agri-contact-arrow {
          color: #86efac;
          transform: translateX(3px);
        }

        /* ======================================================
           FOOTER BOTTOM
           ====================================================== */

        .agri-footer-bottom {
          padding: 22px 0 28px;
        }

        .agri-footer-bottom-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .agri-copyright {
          color: #5f7e69;
          font-size: 10px;
        }

        .agri-copyright strong {
          color: #8db39a;
        }

        .agri-legal-links {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 17px;
        }

        .agri-legal-link {
          color: #668572;
          text-decoration: none;
          font-size: 10px;
          transition: 0.2s ease;
        }

        .agri-legal-link:hover {
          color: #bbf7d0;
        }

        .agri-bottom-divider {
          height: 1px;
          margin: 20px 0;
          background: var(--agri-border);
        }

        .agri-footer-bottom-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .agri-made-with {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #52715d;
          font-size: 10px;
        }

        .agri-made-with svg {
          color: #ef4444;
          fill: #ef4444;
        }

        .agri-security-badges {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 9px;
        }

        .agri-security-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 9px;
          border: 1px solid var(--agri-border);
          border-radius: 7px;
          color: #63816c;
          font-size: 9px;
          background: rgba(255, 255, 255, 0.016);
        }

        .agri-security-badge svg {
          color: #6da97e;
        }

        /* ======================================================
           LANGUAGE SELECTOR
           ====================================================== */

        .agri-language {
          position: relative;
        }

        .agri-language-button {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          height: 32px;
          padding: 0 10px;
          border: 1px solid var(--agri-border);
          border-radius: 8px;
          color: #73927d;
          background: rgba(255, 255, 255, 0.02);
          font: inherit;
          font-size: 10px;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .agri-language-button:hover {
          color: #bbf7d0;
          border-color: rgba(134, 239, 172, 0.22);
        }

        .agri-language-menu {
          position: absolute;
          right: 0;
          bottom: calc(100% + 8px);
          min-width: 150px;
          padding: 7px;
          border: 1px solid rgba(134, 239, 172, 0.15);
          border-radius: 12px;
          background: #082416;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
          z-index: 20;
        }

        .agri-language-option {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 9px 10px;
          border: 0;
          border-radius: 7px;
          color: #82a18b;
          background: transparent;
          text-align: left;
          font: inherit;
          font-size: 11px;
          cursor: pointer;
        }

        .agri-language-option:hover {
          color: #dcfce7;
          background: rgba(34, 197, 94, 0.08);
        }

        .agri-language-option.selected {
          color: #86efac;
        }

        /* ======================================================
           BACK TO TOP
           ====================================================== */

        .agri-back-top {
          position: fixed;
          right: 25px;
          bottom: 25px;
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(134, 239, 172, 0.2);
          border-radius: 13px;
          color: #052e16;
          background:
            linear-gradient(
              135deg,
              #86efac,
              #bef264
            );
          box-shadow:
            0 15px 30px rgba(0, 0, 0, 0.28),
            0 0 25px rgba(34, 197, 94, 0.13);
          cursor: pointer;
          z-index: 100;
          animation: agri-slide-up 0.25s ease;
        }

        .agri-back-top:hover {
          transform: translateY(-4px);
        }

        @keyframes agri-slide-up {
          from {
            opacity: 0;
            transform: translateY(15px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* ======================================================
           FLOATING LEAVES
           ====================================================== */

        .agri-floating-leaf {
          position: absolute;
          color: rgba(134, 239, 172, 0.08);
          pointer-events: none;
          animation: agri-float 8s ease-in-out infinite;
        }

        .agri-floating-leaf.one {
          top: 8%;
          left: 3%;
          transform: rotate(-25deg);
        }

        .agri-floating-leaf.two {
          top: 45%;
          right: 2%;
          transform: rotate(35deg);
          animation-delay: 2s;
        }

        .agri-floating-leaf.three {
          bottom: 9%;
          left: 16%;
          transform: rotate(50deg);
          animation-delay: 4s;
        }

        @keyframes agri-float {
          0%,
          100% {
            transform: translateY(0) rotate(-25deg);
          }

          50% {
            transform: translateY(-18px) rotate(-15deg);
          }
        }

        /* ======================================================
           RESPONSIVE 1200
           ====================================================== */

        @media (max-width: 1200px) {
          .agri-footer-main-grid {
            grid-template-columns: 1.3fr repeat(4, 0.9fr);
            gap: 25px;
          }

          .agri-ai-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .agri-service-layout {
            grid-template-columns: 1fr;
          }
        }

        /* ======================================================
           RESPONSIVE 950
           ====================================================== */

        @media (max-width: 950px) {
          .agri-footer-container {
            width: min(100% - 34px, 760px);
          }

          .agri-footer-main-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 35px 25px;
          }

          .agri-brand-column {
            grid-column: 1 / -1;
            max-width: 650px;
          }

          .agri-stat-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .agri-newsletter-grid {
            grid-template-columns: 1fr;
            gap: 28px;
          }

          .agri-contact-grid {
            grid-template-columns: 1fr;
          }
        }

        /* ======================================================
           RESPONSIVE 700
           ====================================================== */

        @media (max-width: 700px) {
          .agri-footer-container {
            width: min(100% - 28px, 600px);
          }

          .agri-footer-announcement-inner {
            flex-direction: column;
            align-items: flex-start;
            gap: 9px;
          }

          .agri-announcement-message {
            display: none;
          }

          .agri-stat-strip {
            padding: 22px 0;
          }

          .agri-stat-grid {
            grid-template-columns: 1fr 1fr;
          }

          .agri-stat-card {
            padding: 13px;
          }

          .agri-stat-icon {
            width: 38px;
            height: 38px;
          }

          .agri-stat-value {
            font-size: 17px;
          }

          .agri-ai-section {
            padding: 50px 0;
          }

          .agri-section-heading {
            display: block;
          }

          .agri-ai-badge {
            margin-top: 18px;
          }

          .agri-ai-grid {
            grid-template-columns: 1fr;
          }

          .agri-ai-card {
            min-height: auto;
          }

          .agri-service-section {
            padding: 48px 0;
          }

          .agri-service-list {
            grid-template-columns: 1fr;
          }

          .agri-newsletter {
            padding: 25px 20px;
            border-radius: 20px;
          }

          .agri-newsletter-form {
            display: flex;
            flex-direction: column;
            background: transparent;
            border: 0;
            padding: 0;
          }

          .agri-newsletter-input-wrap {
            height: 48px;
            border: 1px solid rgba(134, 239, 172, 0.14);
            border-radius: 11px;
            background: rgba(0, 0, 0, 0.18);
          }

          .agri-newsletter-button {
            width: 100%;
          }

          .agri-main-footer {
            padding: 50px 0 35px;
          }

          .agri-footer-main-grid {
            grid-template-columns: 1fr 1fr;
          }

          .agri-footer-bottom-top {
            flex-direction: column;
            align-items: flex-start;
          }

          .agri-legal-links {
            justify-content: flex-start;
          }

          .agri-footer-bottom-meta {
            flex-direction: column;
            align-items: flex-start;
          }

          .agri-back-top {
            right: 17px;
            bottom: 17px;
          }
        }

        /* ======================================================
           RESPONSIVE 480
           ====================================================== */

        @media (max-width: 480px) {
          .agri-stat-grid {
            grid-template-columns: 1fr;
          }

          .agri-stat-card {
            min-height: 64px;
          }

          .agri-footer-main-grid {
            grid-template-columns: 1fr;
            gap: 31px;
          }

          .agri-brand-column {
            grid-column: auto;
          }

          .agri-footer-column h4 {
            margin-bottom: 14px;
          }

          .agri-footer-links {
            gap: 9px;
          }

          .agri-footer-bottom-meta {
            gap: 14px;
          }

          .agri-security-badges {
            width: 100%;
          }

          .agri-language {
            width: 100%;
          }

          .agri-language-button {
            width: 100%;
            justify-content: space-between;
          }

          .agri-language-menu {
            left: 0;
            right: auto;
            width: 100%;
          }
        }

        /* ======================================================
           ACCESSIBILITY
           ====================================================== */

        .agri-footer a:focus-visible,
        .agri-footer button:focus-visible,
        .agri-footer input:focus-visible {
          outline: 2px solid #86efac;
          outline-offset: 3px;
        }

        /* ======================================================
           REDUCED MOTION
           ====================================================== */

        @media (prefers-reduced-motion: reduce) {
          .agri-footer *,
          .agri-footer *::before,
          .agri-footer *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* ======================================================
           PRINT
           ====================================================== */

        @media print {
          .agri-footer {
            background: white;
            color: black;
          }

          .agri-back-top {
            display: none;
          }
        }

        /* Project-aligned light footer theme */
        .agri-footer {
          --agri-border: #dce9df;
          --agri-text: #17382a;
          --agri-muted: #667a6d;
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(circle at 88% 0%, rgba(245, 158, 11, 0.1), transparent 25rem),
            linear-gradient(180deg, #f7fbf7 0%, #eef6ef 100%);
          color: var(--agri-text);
          font-family: "Trebuchet MS", "Segoe UI", sans-serif;
        }

        .agri-footer::before {
          background-image:
            linear-gradient(rgba(31, 107, 69, 0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(31, 107, 69, 0.035) 1px, transparent 1px);
          background-size: 54px 54px;
          mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.55), transparent 58%);
        }

        .agri-footer::after {
          width: 420px;
          height: 420px;
          top: -250px;
          right: -120px;
          background: rgba(245, 158, 11, 0.08);
          filter: blur(20px);
        }

        .agri-footer-container {
          width: min(1240px, calc(100% - 40px));
        }

        .agri-footer-announcement {
          padding: 10px 0;
          border-bottom-color: var(--agri-border);
          background: rgba(255, 255, 255, 0.78);
          backdrop-filter: blur(12px);
        }

        .agri-live-status { color: #1f6b45; font-size: 12px; }
        .agri-live-dot { background: #16a34a; box-shadow: 0 0 0 5px rgba(22, 163, 74, 0.1); }
        .agri-announcement-message { color: #667a6d; font-size: 12px; }
        .agri-announcement-message svg { color: #1f6b45; }
        .agri-announcement-link { color: #1f6b45; font-size: 12px; }
        .agri-announcement-link:hover { color: #164c33; }

        .agri-stat-strip,
        .agri-ai-section,
        .agri-service-section,
        .agri-contact-section { border-color: var(--agri-border); }

        .agri-stat-strip { padding: 24px 0; }
        .agri-stat-card {
          padding: 15px 16px;
          border-color: var(--agri-border);
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.72);
          box-shadow: 0 8px 22px rgba(23, 56, 42, 0.04);
        }
        .agri-stat-card:hover { border-color: #a9cdb4; background: #fff; }
        .agri-stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 11px;
          color: #1f6b45;
          background: #e6f4e9;
          border-color: #c9e4d0;
        }
        .agri-stat-value { color: #17382a; font-size: 19px; }
        .agri-stat-label { color: #718078; }

        .agri-ai-section { padding: 52px 0; }
        .agri-heading-eyebrow,
        .agri-agri-heading-eyebrow { color: #1f6b45; }
        .agri-heading-title { color: #17382a; font-size: clamp(26px, 3.4vw, 38px); }
        .agri-heading-description { color: #667a6d; }
        .agri-ai-badge {
          border-color: #c9e4d0;
          color: #1f6b45;
          background: #eaf6ee;
        }
        .agri-ai-card {
          min-height: 218px;
          padding: 20px;
          border-color: var(--agri-border);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.78);
          box-shadow: 0 8px 24px rgba(23, 56, 42, 0.04);
        }
        .agri-ai-card:hover {
          border-color: #9fc9aa;
          box-shadow: 0 16px 30px rgba(23, 56, 42, 0.09);
        }
        .agri-ai-card::before { background: rgba(34, 197, 94, 0.08); }
        .agri-ai-icon { color: #1f6b45; background: #eaf6ee; border-color: #c9e4d0; }
        .agri-ai-card-title { color: #17382a; }
        .agri-ai-card-text { color: #667a6d; }
        .agri-ai-card-link { color: #1f6b45; }
        .agri-ai-card-link:hover { color: #164c33; }

        .agri-service-section { padding: 48px 0; }
        .agri-service-copy h3 { color: #17382a; font-size: 26px; }
        .agri-service-copy p { color: #667a6d; }
        .agri-service-card {
          padding: 17px;
          border-color: var(--agri-border);
          border-radius: 15px;
          background: rgba(255, 255, 255, 0.72);
        }
        .agri-service-card:hover { background: #fff; border-color: #a9cdb4; }
        .agri-service-icon { color: #9a6200; background: #fff3d8; }
        .agri-service-card h4 { color: #17382a; }
        .agri-service-card p { color: #667a6d; }
        .agri-service-action { color: #1f6b45; }

        .agri-newsletter {
          padding: 30px;
          border-color: #c9e4d0;
          border-radius: 18px;
          background:
            radial-gradient(circle at 92% 0%, rgba(245, 158, 11, 0.16), transparent 14rem),
            linear-gradient(135deg, #eaf6ee, #f8fcf8);
          box-shadow: 0 16px 38px rgba(23, 56, 42, 0.07);
        }
        .agri-newsletter-eyebrow { color: #1f6b45; }
        .agri-newsletter-title { color: #17382a; font-size: 25px; }
        .agri-newsletter-description { color: #667a6d; }
        .agri-newsletter-form { border-color: #c9e4d0; background: #fff; }
        .agri-newsletter-input-icon { color: #7b9482; }
        .agri-newsletter-input { color: #17382a; }
        .agri-newsletter-input::placeholder { color: #91a398; }
        .agri-newsletter-button {
          color: #fff;
          background: linear-gradient(135deg, #1f6b45, #2f8b5d);
        }
        .agri-newsletter-note { color: #718078; }

        .agri-main-footer { padding: 48px 0 38px; }
        .agri-brand { color: #17382a; }
        .agri-brand-logo { background: linear-gradient(145deg, #2f8b5d, #1f6b45); }
        .agri-brand-name { color: #17382a; }
        .agri-brand-name span { color: #1f6b45; }
        .agri-brand-tagline,
        .agri-brand-location { color: #667a6d; }
        .agri-brand-location svg { color: #1f6b45; }
        .agri-social-title { color: #526b5b; }
        .agri-social { color: #667a6d; border-color: var(--agri-border); background: #fff; }
        .agri-social:hover { color: #1f6b45; border-color: #9fc9aa; background: #eaf6ee; }
        .agri-footer-column h4 { color: #17382a; }
        .agri-footer-link { color: #667a6d; }
        .agri-footer-link:hover { color: #1f6b45; }
        .agri-footer-link-badge { color: #164c33; background: #c9e4d0; }

        .agri-contact-section { padding: 24px 0; background: rgba(255, 255, 255, 0.42); }
        .agri-contact-card { border-color: var(--agri-border); background: rgba(255, 255, 255, 0.75); }
        .agri-contact-card:hover { border-color: #a9cdb4; background: #fff; }
        .agri-contact-icon { color: #1f6b45; background: #eaf6ee; }
        .agri-contact-label { color: #718078; }
        .agri-contact-value { color: #17382a; }
        .agri-contact-arrow { color: #91a398; }
        .agri-contact-card:hover .agri-contact-arrow { color: #1f6b45; }
        .agri-footer-bottom { padding: 20px 0 24px; }
        .agri-copyright,
        .agri-legal-link,
        .agri-made-with { color: #718078; }
        .agri-copyright strong { color: #1f6b45; }
        .agri-legal-link:hover { color: #1f6b45; }
        .agri-security-badge { color: #718078; border-color: var(--agri-border); background: #fff; }
        .agri-security-badge svg { color: #1f6b45; }
        .agri-language-button { color: #526b5b; border-color: var(--agri-border); background: #fff; }
        .agri-language-button:hover { color: #1f6b45; border-color: #9fc9aa; }
        .agri-language-menu { border-color: var(--agri-border); background: #fff; box-shadow: 0 14px 32px rgba(23, 56, 42, 0.14); }
        .agri-language-option { color: #667a6d; }
        .agri-language-option:hover { color: #1f6b45; background: #eaf6ee; }
        .agri-language-option.selected { color: #1f6b45; }
        .agri-back-top { right: 22px; bottom: 22px; color: #fff; background: #1f6b45; border-color: #fff; }
        .agri-floating-leaf { color: rgba(31, 107, 69, 0.07); }

        .agri-footer a:focus-visible,
        .agri-footer button:focus-visible,
        .agri-footer input:focus-visible { outline-color: #1f6b45; }

        @media (max-width: 700px) {
          .agri-footer-container { width: min(100% - 28px, 600px); }
          .agri-newsletter { padding: 22px 18px; }
          .agri-heading-title { font-size: 28px; }
        }

      `}</style>

      {/* ========================================================
          FOOTER ROOT
          ======================================================== */}

      <footer className="agri-footer">

        {/* Decorative elements */}

        <div className="agri-floating-leaf one">
          <Leaf size={90} />
        </div>

        <div className="agri-floating-leaf two">
          <Leaf size={120} />
        </div>

        <div className="agri-floating-leaf three">
          <Leaf size={65} />
        </div>

        {/* ======================================================
            ANNOUNCEMENT BAR
            ====================================================== */}

        <div className="agri-footer-announcement">
          <div className="agri-footer-container">
            <div className="agri-footer-announcement-inner">

              <div className="agri-live-status">
                <span className="agri-live-dot" />

                <span>
                  Agriculture Intelligence is online
                </span>
              </div>

              <div className="agri-announcement-message">
                <Bell size={14} />

                <span>
                  Get personalized farming insights, weather alerts
                  and crop recommendations.
                </span>
              </div>

              <a
                className="agri-announcement-link"
                href="/dashboard"
              >
                Open Farmer Dashboard
                <ArrowUpRight size={13} />
              </a>

            </div>
          </div>
        </div>

        {/* ======================================================
            TRUST STATISTICS
            ====================================================== */}

        <section className="agri-stat-strip">
          <div className="agri-footer-container">

            <div className="agri-stat-grid">

              {statistics.map((stat) => (
                <div
                  className="agri-stat-card"
                  key={stat.label}
                >
                  <div className="agri-stat-icon">
                    {stat.icon}
                  </div>

                  <div>
                    <div className="agri-stat-value">
                      {stat.value}
                    </div>

                    <div className="agri-stat-label">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}

            </div>

          </div>
        </section>

        {/* ======================================================
            AI FEATURES
            ====================================================== */}

        <section className="agri-ai-section">

          <div className="agri-footer-container">

            <div className="agri-section-heading">

              <div>
                <div className="agri-heading-eyebrow">
                  <Sparkles size={15} />
                  Agriculture
                </div>

                <h2 className="agri-heading-title">
                  Better farming decisions,
                  powered by AgriVision.
                </h2>

                <p className="agri-heading-description">
                  Turn farm data, weather information, crop images
                  and agricultural intelligence into practical
                  recommendations for everyday farming.
                </p>
              </div>

              <div className="agri-ai-badge">
                <Brain size={15} />
                Powered AgriVision
              </div>

            </div>

            <div className="agri-ai-grid">

              {aiFeatures.map((feature, index) => (

                <article
                  className={
                    activeFeature === index
                      ? "agri-ai-card active"
                      : "agri-ai-card"
                  }
                  key={feature.title}
                  onMouseEnter={() =>
                    setActiveFeature(index)
                  }
                  onMouseLeave={() =>
                    setActiveFeature(null)
                  }
                >

                  <div className="agri-ai-icon">
                    {feature.icon}
                  </div>

                  <h3 className="agri-ai-card-title">
                    {feature.title}
                  </h3>

                  <p className="agri-ai-card-text">
                    {feature.description}
                  </p>

                  <a
                    className="agri-ai-card-link"
                    href={feature.href}
                  >
                    Explore feature
                    <ArrowUpRight size={13} />
                  </a>

                </article>

              ))}

            </div>

          </div>

        </section>

        {/* ======================================================
            FARMER QUICK SERVICES
            ====================================================== */}

        <section className="agri-service-section">

          <div className="agri-footer-container">

            <div className="agri-service-layout">

              <div className="agri-service-copy">

                <div className="agri-heading-eyebrow">
                  <Tractor size={15} />
                  Farmer Tools
                </div>

                <h3>
                  Start your next
                  farming decision.
                </h3>

                <p>
                  Use intelligent tools designed to help farmers
                  understand their crops, weather, soil and
                  agricultural opportunities.
                </p>

              </div>

              <div className="agri-service-list">

                {serviceCards.map((service) => (

                  <article
                    className="agri-service-card"
                    key={service.title}
                  >

                    <div className="agri-service-icon">
                      {service.icon}
                    </div>

                    <h4>
                      {service.title}
                    </h4>

                    <p>
                      {service.text}
                    </p>

                    <a
                      className="agri-service-action"
                      href={service.href}
                    >
                      {service.action}
                      <ArrowUpRight size={12} />
                    </a>

                  </article>

                ))}

              </div>

            </div>

          </div>

        </section>

        {/* ======================================================
            NEWSLETTER
            ====================================================== */}

        <section className="agri-footer-container">

          <div className="agri-newsletter">

            <div className="agri-newsletter-grid">

              <div>

                <div className="agri-newsletter-eyebrow">
                  <Mail size={14} />
                  Agriculture Intelligence Updates
                </div>

                <h3 className="agri-newsletter-title">
                  Stay informed.
                  Farm smarter.
                </h3>

                <p className="agri-newsletter-description">
                  Receive useful agricultural updates, weather
                  insights, seasonal crop guidance, AI feature
                  announcements and farming resources directly
                  in your inbox.
                </p>

              </div>

              <div>

                <form
                  className="agri-newsletter-form"
                  onSubmit={handleSubscribe}
                >

                  <div className="agri-newsletter-input-wrap">

                    <Mail
                      className="agri-newsletter-input-icon"
                      size={16}
                    />

                    <input
                      className="agri-newsletter-input"
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      placeholder="Enter your email address"
                      aria-label="Email address"
                      required
                    />

                  </div>

                  <button
                    className="agri-newsletter-button"
                    type="submit"
                  >
                    {subscribed ? (
                      <>
                        <Check size={15} />
                        Subscribed
                      </>
                    ) : (
                      <>
                        Subscribe
                        <Send size={14} />
                      </>
                    )}
                  </button>

                </form>

                {subscribed && (
                  <div className="agri-newsletter-success">
                    <CheckCircle2 size={14} />
                    You're subscribed to agriculture updates.
                  </div>
                )}

                <div className="agri-newsletter-note">
                  <ShieldCheck size={12} />
                  No spam. Unsubscribe anytime.
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ======================================================
            MAIN FOOTER
            ====================================================== */}

        <div className="agri-main-footer">

          <div className="agri-footer-container">

            <div className="agri-footer-main-grid">

              {/* =================================================
                  BRAND COLUMN
                  ================================================= */}

              <div className="agri-brand-column">

                <a
                  href="/"
                  className="agri-brand"
                >

                  <div className="agri-brand-logo">
                    <img src="/assets/AgriGo%20logo.png" alt="AgriGo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  </div>

                  <div className="agri-brand-name">
                    Agri<span>Go</span>
                  </div>

                </a>

                <p className="agri-brand-tagline">
                  Intelligent agriculture technology helping
                  farmers make better decisions with AI,
                  data, weather intelligence and localized
                  agricultural insights.
                </p>

                <div className="agri-brand-location">
                  <MapPin size={13} />
                  <span>
                    Built for farmers across India
                  </span>
                </div>

                <div className="agri-social-title">
                  Follow our journey
                </div>

                <div className="agri-socials">

                  {socialLinks.map((social) => (

                    <a
                      key={social.label}
                      href={social.href}
                      className="agri-social"
                      aria-label={social.label}
                      title={social.label}
                    >
                      {social.icon}
                    </a>

                  ))}

                </div>

              </div>

              {/* =================================================
                  PLATFORM
                  ================================================= */}

              <div className="agri-footer-column">

                <h4>
                  AI Platform
                </h4>

                <ul className="agri-footer-links">

                  {platformLinks.map((link) => (

                    <li key={link.label}>

                      <a
                        className="agri-footer-link"
                        href={link.href}
                      >

                        {link.label}

                        {link.badge && (
                          <span className="agri-footer-link-badge">
                            {link.badge}
                          </span>
                        )}

                      </a>

                    </li>

                  ))}

                </ul>

              </div>

              {/* =================================================
                  FARMER
                  ================================================= */}

              <div className="agri-footer-column">

                <h4>
                  For Farmers
                </h4>

                <ul className="agri-footer-links">

                  {farmerLinks.map((link) => (

                    <li key={link.label}>

                      <a
                        className="agri-footer-link"
                        href={link.href}
                      >

                        {link.label}

                        {link.badge && (
                          <span className="agri-footer-link-badge">
                            {link.badge}
                          </span>
                        )}

                      </a>

                    </li>

                  ))}

                </ul>

              </div>

              {/* =================================================
                  COMPANY
                  ================================================= */}

              <div className="agri-footer-column">

                <h4>
                  Company
                </h4>

                <ul className="agri-footer-links">

                  {companyLinks.map((link) => (

                    <li key={link.label}>

                      <a
                        className="agri-footer-link"
                        href={link.href}
                      >

                        {link.label}

                        {link.badge && (
                          <span className="agri-footer-link-badge">
                            {link.badge}
                          </span>
                        )}

                      </a>

                    </li>

                  ))}

                </ul>

              </div>

              {/* =================================================
                  SUPPORT
                  ================================================= */}

              <div className="agri-footer-column">

                <h4>
                  Support
                </h4>

                <ul className="agri-footer-links">

                  {supportLinks.map((link) => (

                    <li key={link.label}>

                      <a
                        className="agri-footer-link"
                        href={link.href}
                      >

                        {link.label}

                        {link.badge && (
                          <span className="agri-footer-link-badge">
                            {link.badge}
                          </span>
                        )}

                      </a>

                    </li>

                  ))}

                </ul>

              </div>

            </div>

          </div>

        </div>

        {/* ======================================================
            CONTACT
            ====================================================== */}

        <section className="agri-contact-section">

          <div className="agri-footer-container">

            <div className="agri-contact-grid">

              <a
                className="agri-contact-card"
                href="mailto:support@agriai.example"
              >

                <div className="agri-contact-icon">
                  <Mail size={18} />
                </div>

                <div>

                  <div className="agri-contact-label">
                    Email Support
                  </div>

                  <div className="agri-contact-value">
                    agriculturalsupport@ac.in
                  </div>

                </div>

                <ArrowUpRight
                  className="agri-contact-arrow"
                  size={15}
                />

              </a>

              <a
                className="agri-contact-card"
                href="tel:+91 866-06-XXX-XX"
              >

                <div className="agri-contact-icon">
                  <PhoneCall size={18} />
                </div>

                <div>

                  <div className="agri-contact-label">
                    Farmer Helpline
                  </div>

                  <div className="agri-contact-value">
                    +91 86606-XXXXX
                  </div>

                </div>

                <ArrowUpRight
                  className="agri-contact-arrow"
                  size={15}
                />

              </a>

              <a
                className="agri-contact-card"
                href="/community"
              >

                <div className="agri-contact-icon">
                  <MessageCircle size={18} />
                </div>

                <div>

                  <div className="agri-contact-label">
                    Farmer Community
                  </div>

                  <div className="agri-contact-value">
                    Connect with farmers
                  </div>

                </div>

                <ArrowUpRight
                  className="agri-contact-arrow"
                  size={15}
                />

              </a>

            </div>

          </div>

        </section>

        {/* ======================================================
            BOTTOM
            ====================================================== */}

        <div className="agri-footer-bottom">

          <div className="agri-footer-container">

            <div className="agri-footer-bottom-top">

              <div className="agri-copyright">
                © {currentYear}{" "}
                <strong>AgriAI</strong>.
                All rights reserved.
              </div>

              <div className="agri-legal-links">

                <a
                  href="/privacy"
                  className="agri-legal-link"
                >
                  Privacy Policy
                </a>

                <a
                  href="/terms"
                  className="agri-legal-link"
                >
                  Terms of Service
                </a>

                <a
                  href="/cookies"
                  className="agri-legal-link"
                >
                  Cookie Policy
                </a>

                <a
                  href="/security"
                  className="agri-legal-link"
                >
                  Security
                </a>

                <a
                  href="/accessibility"
                  className="agri-legal-link"
                >
                  Accessibility
                </a>

              </div>

            </div>

            <div className="agri-bottom-divider" />

            <div className="agri-footer-bottom-meta">

              <div className="agri-made-with">
                Built with
                <Heart size={11} />
                for smarter agriculture.
              </div>

              {/* ===============================================
                  SECURITY BADGES
                  =============================================== */}

              <div className="agri-security-badges">

                <div className="agri-security-badge">
                  <ShieldCheck size={12} />
                  Secure Platform
                </div>

                <div className="agri-security-badge">
                  <Lock size={12} />
                  Data Protected
                </div>

                <div className="agri-security-badge">
                  <Wifi size={12} />
                  Cloud Connected
                </div>

                <div className="agri-security-badge">
                  <Brain size={12} />
                  AI Powered
                </div>

              </div>

              {/* ===============================================
                  LANGUAGE
                  =============================================== */}

              <div className="agri-language">

                <button
                  type="button"
                  className="agri-language-button"
                  onClick={() =>
                    setShowLanguage((value) => !value)
                  }
                  aria-expanded={showLanguage}
                  aria-label="Select language"
                >

                  <Globe2 size={13} />

                  <span>
                    {languages.find((item) => item.code === language)?.nativeName || language}
                  </span>

                  <ChevronDown size={12} />

                </button>

                {showLanguage && (

                  <div className="agri-language-menu">

                    {languages.map((languageOption) => (

                      <button
                        type="button"
                        key={languageOption.code}
                        className={
                          languageOption.code === language
                            ? "agri-language-option selected"
                            : "agri-language-option"
                        }
                        onClick={() => {
                          setLanguage(languageOption.code);
                          setShowLanguage(false);
                        }}
                      >

                        <span>
                          {languageOption.nativeName}
                        </span>

                        {languageOption.code === language && (
                          <Check size={12} />
                        )}

                      </button>

                    ))}

                  </div>

                )}

              </div>

            </div>

          </div>

        </div>

      </footer>

      {/* ========================================================
          BACK TO TOP BUTTON
          ======================================================== */}

      {showBackToTop && (

        <button
          type="button"
          className="agri-back-top"
          onClick={scrollToTop}
          aria-label="Back to top"
          title="Back to top"
        >
          <ArrowUp size={19} />
        </button>

      )}

    </>
  );
};

export default Footer;