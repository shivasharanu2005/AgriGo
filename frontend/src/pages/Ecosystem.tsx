import React, { useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BadgeIndianRupee,
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CloudSun,
  Database,
  FileCheck2,
  Filter,
  GraduationCap,
  Landmark,
  Leaf,
  LayoutGrid,
  MapPin,
  Menu,
  PackageCheck,
  Search,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Snowflake,
  Sparkles,
  Sprout,
  Store,
  Table2,
  Tractor,
  Truck,
  Users,
  WalletCards,
  Wheat,
  X,
  Zap,
} from "lucide-react";

type Id =
  | "farmers"
  | "inputs"
  | "advisory"
  | "centres"
  | "postHarvest"
  | "market"
  | "finance"
  | "government"
  | "logistics";

type Status = "Live" | "Core" | "Planned";
type Role = "Farmer" | "Officer" | "Admin";

type Feature = {
  id: string;
  name: string;
  description: string;
  module: string;
  status: Status;
  roles: Role[];
  route?: string;
  indianUseCase?: string;
};

type EcosystemPageProps = {
  onNavigate?: (tab: string) => void;
};

const FEATURE_ROUTES: Record<string, string> = {
  profile: "profile",
  academy: "learning",
  community: "community",
  alerts: "alerts",
  rental: "equipment",
  soil: "soil",
  water: "water",
  ai: "services",
  weather: "weather",
  disease: "disease",
  expert: "services",
  voice: "services",
  machinery: "equipment",
  marketplace: "marketplace",
  mandi: "mandi",
  schemes: "schemes",
  documents: "documents",
  wholesale: "mandi",
  finance: "finance",
  "crop-calendar": "tasks",
};

type Pillar = {
  id: Id;
  label: string;
  shortLabel: string;
  color: string;
  soft: string;
  icon: React.ElementType;
  summary: string;
  features: Feature[];
};

const f = (
  id: string,
  name: string,
  description: string,
  module: string,
  status: Status = "Core",
  roles: Role[] = ["Farmer", "Officer", "Admin"],
  indianUseCase = ""
): Feature => ({
  id,
  name,
  description,
  module,
  status,
  roles,
  indianUseCase,
});

const PILLARS: Pillar[] = [
  {
    id: "farmers",
    label: "Farmers",
    shortLabel: "Farmers",
    color: "#24763a",
    soft: "#eaf6ec",
    icon: Users,
    summary:
      "The farmer is the centre of AgriGo — profile, farm records, learning, crop planning and daily digital services.",
    features: [
      f("registration", "Farmer Registration", "Digital onboarding for farmer profile, land and crop details.", "Farmer Management", "Live", ["Farmer", "Officer", "Admin"], "Mobile-first onboarding at farm or service centre."),
      f("profile", "Farmer Profile", "One profile for personal, farm, crop and service information.", "Farmer Management", "Live", ["Farmer", "Officer", "Admin"], "Useful for repeat services without entering the same details again."),
      f("farm-records", "Digital Farm Records", "Maintain land, soil, crop, season, input and harvest history.", "Farm Records", "Core", ["Farmer", "Officer", "Admin"], "Kharif, Rabi and Zaid seasons can be tracked separately."),
      f("digital-id", "AgriGo Farmer ID", "A unique platform identity for accessing connected AgriGo services.", "Identity", "Core", ["Farmer", "Officer", "Admin"], "Designed for assisted access through an AgriGo centre."),
      f("academy", "Farmer Academy", "Video lessons, courses, progress tracking and certificates.", "Training", "Live", ["Farmer", "Officer", "Admin"], "Local-language learning can be surfaced for practical farm skills."),
      f("crop-calendar", "Crop Calendar", "Plan sowing, irrigation, nutrition, crop protection and harvest activities.", "Planning", "Core", ["Farmer", "Officer", "Admin"], "Season-aware planning for crops commonly grown in Indian farms."),
      f("community", "Farmer Community", "Farmer-to-farmer knowledge sharing, announcements and discussions.", "Community", "Core", ["Farmer", "Officer", "Admin"], "Supports local FPO, village and crop communities."),
      f("alerts", "Farmer Alerts", "Important notifications for crops, weather, market, schemes and bookings.", "Communication", "Live", ["Farmer", "Officer", "Admin"], "A single alert inbox reduces the need to check many services."),
    ],
  },
  {
    id: "inputs",
    label: "Input & Service Network",
    shortLabel: "Inputs",
    color: "#72b83d",
    soft: "#f0f8e8",
    icon: Sprout,
    summary:
      "A practical farm-input layer connecting seed, fertilizer, crop protection, machinery, irrigation and service discovery.",
    features: [
      f("seeds", "Seeds Marketplace", "Browse crop varieties, pack information and approved sellers.", "Inputs", "Live", ["Farmer", "Officer", "Admin"], "Search can be organised by crop, season and growing purpose."),
      f("fertilizers", "Fertilizers", "Discover fertilizer products, nutrient information and sellers.", "Inputs", "Live", ["Farmer", "Officer", "Admin"], "N-P-K and crop-stage information can be shown clearly."),
      f("bio", "Bio Fertilizers", "Explore biological soil and crop nutrition products.", "Crop Nutrition", "Core", ["Farmer", "Officer", "Admin"], "Useful for integrated and sustainable nutrient planning."),
      f("micro", "Micronutrients", "Find micronutrient products and application guidance.", "Crop Nutrition", "Core", ["Farmer", "Officer", "Admin"], "Can connect recommendations with soil-test observations."),
      f("protection", "Crop Protection", "Product discovery and practical crop-protection information.", "Crop Protection", "Live", ["Farmer", "Officer", "Admin"], "Designed around crop-stage problems rather than only product names."),
      f("machinery", "Farm Machinery", "Browse tractors, implements and farm equipment.", "Machinery", "Live", ["Farmer", "Officer", "Admin"], "Useful for farmers comparing equipment before booking or buying."),
      f("rental", "Equipment Rental", "Book agricultural equipment from approved providers.", "Rental", "Live", ["Farmer", "Officer", "Admin"], "Supports smaller farms that prefer pay-per-use machinery."),
      f("soil", "Soil Testing", "Request tests and store soil-health observations.", "Soil Health", "Core", ["Farmer", "Officer", "Admin"], "Results can feed future crop and nutrition recommendations."),
      f("water", "Water Solutions", "Discover irrigation and water-management services.", "Water Management", "Core", ["Farmer", "Officer", "Admin"], "Useful for drip, sprinkler and farm-water planning."),
    ],
  },
  {
    id: "advisory",
    label: "Advisory & Technology",
    shortLabel: "Advisory",
    color: "#1454b8",
    soft: "#eaf2ff",
    icon: Sparkles,
    summary:
      "AI, weather, crop-health and precision-agriculture tools turn farm data into practical decisions.",
    features: [
      f("ai", "AI Crop Advisory", "Ask farming questions and receive contextual crop-management guidance.", "AI Advisory", "Live", ["Farmer", "Officer"], "A farmer can ask in simple language about crop-stage problems."),
      f("weather", "Weather Forecast", "Farm-focused weather conditions, forecasts and alerts.", "Weather", "Live", ["Farmer", "Officer", "Admin"], "Weather can support spray, irrigation and harvest decisions."),
      f("disease", "Disease Detection", "Analyse crop images for possible disease or stress signals.", "Computer Vision", "Core", ["Farmer", "Officer"], "Image analysis should be paired with practical next steps and caution."),
      f("drone", "Drone Advisory", "Use drone-based field monitoring and precision-agriculture services.", "Precision Agriculture", "Core", ["Farmer", "Officer", "Admin"], "Suitable for larger farms, FPOs and service-provider workflows."),
      f("soil-ai", "Soil Insight", "Combine soil observations with crop planning information.", "Farm Intelligence", "Core", ["Farmer", "Officer"], "Turns soil data into easier-to-understand farm actions."),
      f("scheme-match", "Scheme Matching", "Match farmer profile and farm context with relevant government programmes.", "Recommendations", "Core", ["Farmer", "Officer", "Admin"], "The UI can explain why a farmer appears eligible instead of only showing a scheme name."),
      f("expert", "Expert Consultation", "Connect farmers with agriculture experts and officers.", "Advisory", "Core", ["Farmer", "Officer", "Admin"], "Useful when AI guidance needs human review."),
      f("voice", "Voice Farm Assistant", "Voice-first access to common farming information and actions.", "AI Assistant", "Planned", ["Farmer"], "Especially useful for hands-free or low-literacy assisted interactions."),
    ],
  },
  {
    id: "centres",
    label: "AgriGo Centres",
    shortLabel: "Centres",
    color: "#f48600",
    soft: "#fff3e4",
    icon: Store,
    summary:
      "The physical touchpoint for farmers who need local help with inputs, training, registrations, services and support.",
    features: [
      f("franchise", "AgriGo Centre Network", "Manage authorised service and franchise centre locations.", "Centre Management", "Core", ["Officer", "Admin"], "A village or taluk-level touchpoint can assist farmers digitally."),
      f("retail", "Retail Store", "Local catalogue for farm products and essential supplies.", "Retail", "Live", ["Farmer", "Officer", "Admin"], "Supports assisted ordering when farmers prefer in-person help."),
      f("help", "Farmer Help Desk", "Handle farmer questions, tickets and service requests.", "Support", "Live", ["Farmer", "Officer", "Admin"], "Creates a human support layer around digital services."),
      f("training", "Training Centre", "Manage workshops, demonstrations and farmer learning sessions.", "Training", "Core", ["Farmer", "Officer", "Admin"], "Can list crop-specific sessions at local centres."),
      f("distribution", "Input Distribution", "Coordinate approved input availability and local distribution.", "Distribution", "Core", ["Officer", "Admin"], "Helps connect catalogue availability with local demand."),
      f("booking", "Centre Service Booking", "Book centre-based farm services and assistance.", "Bookings", "Core", ["Farmer", "Officer", "Admin"], "A farmer can reserve a service before travelling to the centre."),
    ],
  },
  {
    id: "postHarvest",
    label: "Post-Harvest Infrastructure",
    shortLabel: "Post-Harvest",
    color: "#078dce",
    soft: "#e8f7fd",
    icon: Snowflake,
    summary:
      "Reduce post-harvest loss by connecting storage, grading, sorting, packaging and value-add services.",
    features: [
      f("cold", "Cold Storage", "Discover temperature-controlled storage and request capacity.", "Storage", "Core", ["Farmer", "Officer", "Admin"], "Useful for produce where immediate sale is not ideal."),
      f("warehouse", "Warehouse", "Find warehouse capacity and manage storage requests.", "Storage", "Core", ["Farmer", "Officer", "Admin"], "Can show distance, capacity and availability."),
      f("sorting", "Sorting", "Discover and book produce sorting services.", "Processing", "Core", ["Farmer", "Officer", "Admin"], "Supports cleaner lots before grading or sale."),
      f("grading", "Grading", "Prepare produce for quality-based market channels.", "Quality", "Core", ["Farmer", "Officer", "Admin"], "Useful for buyer requirements and better lot presentation."),
      f("packaging", "Packaging", "Connect produce with packaging and dispatch services.", "Packaging", "Core", ["Farmer", "Officer", "Admin"], "Can support retail, B2B and transport-ready packaging."),
      f("quality", "Quality Check", "Record quality observations before storage or sale.", "Quality", "Core", ["Farmer", "Officer", "Admin"], "Creates a simple quality trail for each produce lot."),
      f("value", "Value Addition", "Connect produce with processing and value-add opportunities.", "Processing", "Planned", ["Farmer", "Officer", "Admin"], "Useful for FPO and small food-processing ecosystems."),
    ],
  },
  {
    id: "market",
    label: "Market Linkage",
    shortLabel: "Market",
    color: "#c81761",
    soft: "#fcecf4",
    icon: ShoppingBag,
    summary:
      "Move from farm production to better market discovery through buyers, marketplaces, price intelligence and direct selling.",
    features: [
      f("b2b", "B2B Buyers", "Connect farmers and producer groups with verified buyer demand.", "Market Linkage", "Core", ["Farmer", "Officer", "Admin"], "Useful for bulk produce and FPO-led selling."),
      f("retail-chains", "Retail Chains", "Create procurement pathways for suitable farm produce.", "Market Linkage", "Core", ["Farmer", "Officer", "Admin"], "Can organise demand by crop, grade, quantity and location."),
      f("exporters", "Exporters", "Create pathways for export-ready agricultural produce.", "Market Linkage", "Core", ["Farmer", "Officer", "Admin"], "Designed around quality, lot and logistics requirements."),
      f("processors", "Food Processors", "Match produce with processing industry requirements.", "Market Linkage", "Core", ["Farmer", "Officer", "Admin"], "Helps route suitable crops to processing demand."),
      f("wholesale", "Wholesale Market", "Explore wholesale selling opportunities and market channels.", "Market", "Live", ["Farmer", "Officer", "Admin"], "Can compare opportunities before arranging transport."),
      f("mandi", "Mandi Price Intelligence", "Show market-price information and trends in a simple dashboard.", "Market Intelligence", "Live", ["Farmer", "Officer", "Admin"], "Designed for quick comparison rather than complicated charts."),
      f("direct", "Direct Sale", "Support direct farmer-to-buyer selling workflows.", "Marketplace", "Core", ["Farmer", "Officer", "Admin"], "Reduces unnecessary hand-offs when a direct buyer is available."),
      f("marketplace", "Agri Marketplace", "List and discover agriculture products, services and equipment.", "Marketplace", "Live", ["Farmer", "Officer", "Admin"], "Supports local and wider AgriGo marketplace discovery."),
    ],
  },
  {
    id: "finance",
    label: "Finance",
    shortLabel: "Finance",
    color: "#008b82",
    soft: "#e8f8f6",
    icon: WalletCards,
    summary:
      "A financial-services layer for payments, credit discovery, insurance, assistance and transaction visibility.",
    features: [
      f("payments", "Digital Payments", "Manage secure payment workflows for AgriGo services.", "Payments", "Core", ["Farmer", "Officer", "Admin"], "Useful for equipment rental, services and marketplace orders."),
      f("loans", "Loan Discovery", "Surface agriculture credit and loan opportunities.", "Finance", "Core", ["Farmer", "Officer", "Admin"], "Can organise options by purpose such as machinery or crop working capital."),
      f("insurance", "Crop Insurance", "Help farmers discover and understand crop-insurance options.", "Insurance", "Core", ["Farmer", "Officer", "Admin"], "The platform should show clear next steps and document needs."),
      f("aid", "Financial Assistance", "Connect eligible farmers with available financial-support pathways.", "Finance", "Core", ["Farmer", "Officer", "Admin"], "Can link assistance discovery with the farmer profile."),
      f("wallet", "AgriGo Wallet", "Track credits, refunds, payments and platform balances.", "Wallet", "Planned", ["Farmer", "Admin"], "Useful when multiple AgriGo services generate transactions."),
      f("transactions", "Transaction History", "View payment, order, booking and refund records.", "Finance", "Core", ["Farmer", "Officer", "Admin"], "Keeps financial activity transparent in one place."),
    ],
  },
  {
    id: "government",
    label: "Government",
    shortLabel: "Government",
    color: "#795548",
    soft: "#f5eeeb",
    icon: Landmark,
    summary:
      "A guided government-services layer for scheme discovery, eligibility, applications, documents and officer verification.",
    features: [
      f("schemes", "Government Schemes", "Browse agriculture schemes and farmer-benefit information.", "Schemes", "Live", ["Farmer", "Officer", "Admin"], "A single catalogue makes scheme discovery easier for farmers."),
      f("eligibility", "Eligibility Checker", "Check likely eligibility using farmer and farm information.", "Schemes", "Core", ["Farmer", "Officer", "Admin"], "Shows a clear checklist instead of forcing farmers to read long notices."),
      f("scheme-alerts", "Scheme Alerts", "Notify farmers when relevant schemes or application windows change.", "Notifications", "Core", ["Farmer", "Officer", "Admin"], "Alerts can be targeted to crop, location or farmer profile."),
      f("applications", "Scheme Applications", "Track application stages, requests and status updates.", "Applications", "Core", ["Farmer", "Officer", "Admin"], "Useful for reducing uncertainty after an application is submitted."),
      f("documents", "Document Support", "Guide farmers through required application documents.", "Support", "Core", ["Farmer", "Officer", "Admin"], "Provides a simple document checklist before submission."),
      f("verification", "Officer Verification", "Review farmer, service and application information.", "Administration", "Core", ["Officer", "Admin"], "Creates a controlled review workflow rather than open editing."),
    ],
  },
  {
    id: "logistics",
    label: "Logistics",
    shortLabel: "Logistics",
    color: "#536b79",
    soft: "#edf2f4",
    icon: Truck,
    summary:
      "Coordinate farm pickup, input delivery, produce transport and movement between farms, centres, storage and markets.",
    features: [
      f("pickup", "Farm Pickup", "Schedule pickup of farm inputs or harvested produce.", "Logistics", "Core", ["Farmer", "Officer", "Admin"], "Useful for produce moving from village farms to collection points."),
      f("transport", "Transport Booking", "Request and manage agricultural transport jobs.", "Transport", "Core", ["Farmer", "Officer", "Admin"], "Can capture load type, pickup, destination and preferred timing."),
      f("delivery", "Input Delivery", "Coordinate delivery of farm products to the farmer.", "Delivery", "Core", ["Farmer", "Officer", "Admin"], "Connects marketplace or centre orders to local delivery."),
      f("produce-transport", "Produce Transport", "Move harvested produce to storage, centre or market.", "Transport", "Core", ["Farmer", "Officer", "Admin"], "Useful after harvest when timing affects quality and price."),
      f("tracking", "Live Tracking", "Track active logistics jobs and delivery progress.", "Tracking", "Planned", ["Farmer", "Officer", "Admin"], "Adds confidence to high-value or time-sensitive movements."),
      f("routes", "Route Management", "Plan efficient pickup and delivery routes.", "Operations", "Planned", ["Officer", "Admin"], "Useful when one vehicle serves multiple farms or centres."),
    ],
  },
];

const POS: Record<Id, string> = {
  farmers: "top",
  inputs: "tr",
  advisory: "right",
  centres: "br",
  postHarvest: "br2",
  market: "bottom",
  finance: "bl",
  government: "left",
  logistics: "tl",
};

const TOTAL_FEATURES = PILLARS.reduce((sum, pillar) => sum + pillar.features.length, 0);
const LIVE_FEATURES = PILLARS.reduce(
  (sum, pillar) => sum + pillar.features.filter((item) => item.status === "Live").length,
  0
);

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`status-badge status-${status.toLowerCase()}`}>
      <i /> {status}
    </span>
  );
}

function RolePills({ roles }: { roles: Role[] }) {
  return (
    <div className="role-pills">
      {roles.map((role) => (
        <span key={role}>{role}</span>
      ))}
    </div>
  );
}

export default function EcosystemPage({ onNavigate }: EcosystemPageProps) {
  const [selected, setSelected] = useState<Id>("farmers");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"All" | Status>("All");
  const [role, setRole] = useState<"All" | Role>("All");
  const [view, setView] = useState<"table" | "cards">("table");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const active = PILLARS.find((pillar) => pillar.id === selected) ?? PILLARS[0];

  const filteredFeatures = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return active.features.filter((item) => {
      const matchesQuery =
        !normalized ||
        [item.name, item.description, item.module, item.indianUseCase]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      const matchesStatus = status === "All" || item.status === status;
      const matchesRole = role === "All" || item.roles.includes(role);
      return matchesQuery && matchesStatus && matchesRole;
    });
  }, [active, query, role, status]);

  const allFilteredFeatures = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return PILLARS.flatMap((pillar) =>
      pillar.features
        .filter((item) => {
          const matchesQuery =
            !normalized ||
            [item.name, item.description, item.module, item.indianUseCase]
              .join(" ")
              .toLowerCase()
              .includes(normalized);
          const matchesStatus = status === "All" || item.status === status;
          const matchesRole = role === "All" || item.roles.includes(role);
          return matchesQuery && matchesStatus && matchesRole;
        })
        .map((item) => ({ ...item, pillar }))
    );
  }, [query, role, status]);

  const displayRows = showAll ? allFilteredFeatures : filteredFeatures.map((feature) => ({ ...feature, pillar: active }));

  const choosePillar = (id: Id) => {
    setSelected(id);
    setShowAll(false);
    window.setTimeout(() => document.getElementById("ecosystem-details")?.scrollIntoView({ behavior: "smooth", block: "start" }), 20);
  };

  const openFeature = (feature: Feature) => {
    const route = feature.route ?? FEATURE_ROUTES[feature.id];
    if (route && onNavigate) onNavigate(route);
  };

  return (
    <main className="ecosystem-page">
      <style>{STYLES}</style>

      <header className="eco-header">
        <div className="brand-block">
          <div className="brand-mark"><Leaf size={19} /></div>
          <div>
            <div className="brand-name">AgriGo</div>
            <div className="brand-subtitle">India's farmer-first digital ecosystem</div>
          </div>
        </div>
        <div className="header-actions">
          <div className="live-chip"><span /> Ecosystem online</div>
          <button className="mobile-menu" onClick={() => setMobileOpen((open) => !open)} aria-label="Toggle menu">
            {mobileOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
          <nav className={mobileOpen ? "top-nav open" : "top-nav"}>
            <a href="#ecosystem">Ecosystem</a>
            <a href="#modules">Modules</a>
            <a href="#capabilities">Capabilities</a>
          </nav>
        </div>
      </header>

      <section className="hero-copy">
        <div className="eyebrow"><span /> ONE PLATFORM · NINE CONNECTED PILLARS</div>
        <h1>One AgriGo ecosystem.<br /><em>Every step of Indian farming.</em></h1>
        <p>
          From <b>beej to bazaar</b>, AgriGo connects farmers with inputs, advisory, finance,
          government services, local centres, post-harvest infrastructure, markets and logistics.
        </p>
      </section>

      <section className="orbit-section" id="ecosystem">
        <div className="orbit-caption left-caption">
          <span>FARM TO MARKET</span>
          <b>Connected at every stage</b>
        </div>
        <div className="orbit-caption right-caption">
          <span>9 PILLARS</span>
          <b>{TOTAL_FEATURES}+ platform capabilities</b>
        </div>

        <div className="orbit-board">
          <div className="orbit-glow" />
          <div className="orbit orbit-outer" />
          <div className="orbit orbit-middle" />
          <div className="orbit orbit-inner" />
          <div className="orbit-dots" />
          <div className="connector connector-1" />
          <div className="connector connector-2" />
          <div className="connector connector-3" />
          <div className="connector connector-4" />
          <div className="connector connector-5" />
          <div className="connector connector-6" />
          <div className="connector connector-7" />
          <div className="connector connector-8" />
          <div className="connector connector-9" />

          <div className="core-node">
            <div className="core-ring ring-a" />
            <div className="core-ring ring-b" />
            <div className="core-inner">
              <div className="core-leaf"><Leaf size={20} /></div>
              <strong>AgriGo</strong>
              <span>ECOSYSTEM</span>
              <small>9 PILLARS · 1 PLATFORM</small>
            </div>
          </div>

          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            const isActive = selected === pillar.id;
            return (
              <button
                key={pillar.id}
                className={`orbit-node ${POS[pillar.id]} ${isActive ? "active" : ""}`}
                onClick={() => choosePillar(pillar.id)}
                style={{ ["--pillar" as string]: pillar.color, ["--soft" as string]: pillar.soft }}
                aria-label={`Open ${pillar.label}`}
              >
                <span className="orbit-icon"><Icon size={20} /></span>
                <span className="orbit-label">{pillar.label}</span>
                <span className="orbit-count">{pillar.features.length} modules</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="pillar-strip" aria-label="Ecosystem pillars">
        {PILLARS.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <button
              key={pillar.id}
              className={`pillar-mini ${selected === pillar.id ? "selected" : ""}`}
              onClick={() => choosePillar(pillar.id)}
              style={{ ["--pillar" as string]: pillar.color }}
            >
              <span className="mini-icon"><Icon size={16} /></span>
              <span>
                <b>{pillar.shortLabel}</b>
                <small>{pillar.features.length} modules</small>
              </span>
              <ChevronRight size={15} />
            </button>
          );
        })}
      </section>

      <section className="selected-banner" style={{ ["--pillar" as string]: active.color, ["--soft" as string]: active.soft }}>
        <div className="selected-icon"><active.icon size={25} /></div>
        <div className="selected-text">
          <span>SELECTED ECOSYSTEM PILLAR</span>
          <h2>{active.label}</h2>
          <p>{active.summary}</p>
        </div>
        <div className="selected-stat">
          <strong>{active.features.length}</strong>
          <span>connected modules</span>
        </div>
        <button className="primary-btn" onClick={() => document.getElementById("ecosystem-details")?.scrollIntoView({ behavior: "smooth" })}>
          Explore modules <ArrowRight size={16} />
        </button>
      </section>

      <section className="details-section" id="ecosystem-details">
        <div className="section-heading">
          <div>
            <div className="eyebrow green"><span /> MODULE DIRECTORY</div>
            <h2>Every AgriGo feature, clearly mapped.</h2>
            <p>
              Explore the selected pillar like a real product ecosystem — what the module does,
              who uses it, where it fits and whether it is live, core or planned.
            </p>
          </div>
          <div className="view-toggle">
            <button className={view === "table" ? "on" : ""} onClick={() => setView("table")}><Table2 size={15} /> Table</button>
            <button className={view === "cards" ? "on" : ""} onClick={() => setView("cards")}><LayoutGrid size={15} /> Cards</button>
          </div>
        </div>

        <div className="directory-toolbar">
          <div className="search-box">
            <Search size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search modules, services or use cases…" />
            {query && <button onClick={() => setQuery("")} aria-label="Clear search"><X size={15} /></button>}
          </div>
          <label className="filter-control">
            <Filter size={15} />
            <select value={status} onChange={(event) => setStatus(event.target.value as "All" | Status)}>
              <option value="All">All status</option>
              <option value="Live">Live</option>
              <option value="Core">Core</option>
              <option value="Planned">Planned</option>
            </select>
            <ChevronDown size={14} />
          </label>
          <label className="filter-control">
            <Users size={15} />
            <select value={role} onChange={(event) => setRole(event.target.value as "All" | Role)}>
              <option value="All">All users</option>
              <option value="Farmer">Farmer</option>
              <option value="Officer">Officer</option>
              <option value="Admin">Admin</option>
            </select>
            <ChevronDown size={14} />
          </label>
          <button className={`scope-btn ${showAll ? "on" : ""}`} onClick={() => setShowAll((value) => !value)}>
            {showAll ? "All pillars" : active.shortLabel}
            <ChevronDown size={14} />
          </button>
          <div className="result-count"><b>{displayRows.length}</b> results</div>
        </div>

        <div className="active-filter-line">
          <span className="active-dot" style={{ background: active.color }} />
          {showAll ? <><b>All 9 pillars</b> are included in this directory.</> : <><b>{active.label}</b> modules are shown.</>}
          <button onClick={() => { setQuery(""); setStatus("All"); setRole("All"); }}>Reset filters</button>
        </div>

        {view === "table" ? (
          <div className="table-shell">
            <table>
              <thead>
                <tr>
                  <th>ECOSYSTEM PILLAR</th>
                  <th>MODULE / FEATURE</th>
                  <th>WHAT IT DOES</th>
                  <th>INDIAN FARM USE CASE</th>
                  <th>ACCESS</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {displayRows.map((row) => (
                  <tr key={`${row.pillar.id}-${row.id}`}>
                    <td>
                      <button className="table-pillar" onClick={() => choosePillar(row.pillar.id)}>
                        <span style={{ background: row.pillar.color }}><row.pillar.icon size={15} /></span>
                        <b>{row.pillar.shortLabel}</b>
                      </button>
                    </td>
                    <td>
                      <div className="feature-name"><b>{row.name}</b><small>{row.module}</small></div>
                      {FEATURE_ROUTES[row.id] && onNavigate && <button className="module-open" onClick={() => openFeature(row)}>Open service <ArrowRight size={12} /></button>}
                    </td>
                    <td><p className="table-description">{row.description}</p></td>
                    <td><p className="use-case">{row.indianUseCase || "Connected service inside the AgriGo platform."}</p></td>
                    <td><RolePills roles={row.roles} /></td>
                    <td><StatusBadge status={row.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!displayRows.length && <EmptyState />}
          </div>
        ) : (
          <div className="feature-grid">
            {displayRows.map((row) => (
              <article className="feature-card" key={`${row.pillar.id}-${row.id}`}>
                <div className="card-top">
                  <span className="card-icon" style={{ background: row.pillar.soft, color: row.pillar.color }}><row.pillar.icon size={19} /></span>
                  <StatusBadge status={row.status} />
                </div>
                <span className="card-pillar" style={{ color: row.pillar.color }}>{row.pillar.label}</span>
                <h3>{row.name}</h3>
                <p>{row.description}</p>
                <div className="use-case-card"><Wheat size={14} /><span>{row.indianUseCase || "Connected service inside the AgriGo platform."}</span></div>
                <footer><RolePills roles={row.roles} /><span>{row.module}</span></footer>
                {FEATURE_ROUTES[row.id] && onNavigate && <button className="module-open card-open" onClick={() => openFeature(row)}>Open service <ArrowRight size={12} /></button>}
              </article>
            ))}
            {!displayRows.length && <EmptyState />}
          </div>
        )}
      </section>

      <section className="capabilities" id="capabilities">
        <div className="section-heading compact">
          <div>
            <div className="eyebrow green"><span /> PLATFORM FOUNDATION</div>
            <h2>Built like a real agricultural platform.</h2>
            <p>Shared capabilities keep all nine pillars connected instead of creating isolated pages.</p>
          </div>
        </div>
        <div className="capability-grid">
          <Capability icon={SmartphoneIcon} title="Mobile-first farmer UX" text="Large touch targets, quick actions and simple flows for field use." />
          <Capability icon={CloudSun} title="Weather-aware workflows" text="Connect forecasts and alerts to planning, crop and logistics actions." />
          <Capability icon={Database} title="Shared farm data" text="Profile, crop, soil, orders and service records can work together." />
          <Capability icon={ShieldCheck} title="Role-based access" text="Farmer, Officer and Admin workflows stay separated and controlled." />
          <Capability icon={Bell} title="Smart notifications" text="Surface important scheme, market, crop, booking and service alerts." />
          <Capability icon={BarChart3} title="Decision dashboards" text="Turn farm, market, inventory and service data into actionable insights." />
          <Capability icon={MapPin} title="Location-aware services" text="Connect farmers with nearby centres, storage, transport and service providers." />
          <Capability icon={FileCheck2} title="Document workflows" text="Keep registrations, applications, verification and service records organised." />
          <Capability icon={Activity} title="Live operational status" text="Make orders, bookings, logistics and service states visible across modules." />
        </div>
      </section>

      <section className="journey-band">
        <div className="journey-title">
          <span>THE AGRIGO FARM JOURNEY</span>
          <h2>From <em>beej</em> to <em>bazaar</em>.</h2>
          <p>One connected journey instead of nine disconnected applications.</p>
        </div>
        <div className="journey-flow">
          <Journey icon={Sprout} title="Plan & Sow" text="Soil · Seeds · Advisory" color="#72b83d" />
          <ArrowRight className="journey-arrow" size={18} />
          <Journey icon={Tractor} title="Grow" text="Weather · Inputs · AI" color="#1454b8" />
          <ArrowRight className="journey-arrow" size={18} />
          <Journey icon={PackageCheck} title="Harvest" text="Storage · Grading · Quality" color="#078dce" />
          <ArrowRight className="journey-arrow" size={18} />
          <Journey icon={ShoppingBag} title="Sell" text="Mandi · Buyers · Marketplace" color="#c81761" />
          <ArrowRight className="journey-arrow" size={18} />
          <Journey icon={BadgeIndianRupee} title="Settle" text="Payments · Finance · Records" color="#008b82" />
        </div>
      </section>

      <footer className="eco-footer">
        <div className="footer-brand"><span className="footer-mark"><Leaf size={16} /></span><b>AgriGo</b><span>· Farmer-first digital ecosystem</span></div>
        <div className="footer-stats">
          <span><strong>9</strong> pillars</span>
          <span><strong>{TOTAL_FEATURES}</strong> mapped modules</span>
          <span><strong>{LIVE_FEATURES}</strong> live-ready features</span>
        </div>
      </footer>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="empty-state">
      <Search size={26} />
      <h3>No matching modules</h3>
      <p>Try another keyword or reset the filters.</p>
    </div>
  );
}

function Capability({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) {
  return (
    <article className="capability-card">
      <span><Icon size={18} /></span>
      <div><b>{title}</b><p>{text}</p></div>
    </article>
  );
}

function Journey({ icon: Icon, title, text, color }: { icon: React.ElementType; title: string; text: string; color: string }) {
  return (
    <div className="journey-step" style={{ ["--journey" as string]: color }}>
      <span><Icon size={18} /></span>
      <div><b>{title}</b><small>{text}</small></div>
    </div>
  );
}

function SmartphoneIcon(props: React.ComponentProps<typeof Activity>) {
  return <Settings2 {...props} />;
}

const STYLES = `
:root{--ink:#17231b;--muted:#748178;--line:#dfe7df;--paper:#fbfdfb;--green:#24763a}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
.ecosystem-page{min-height:100vh;background:linear-gradient(180deg,#fbfdfb 0%,#f7faf7 48%,#fff 100%);color:var(--ink);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;overflow:hidden}
.ecosystem-page button,.ecosystem-page input,.ecosystem-page select{font:inherit}
.eco-header{height:76px;max-width:1320px;margin:auto;padding:0 32px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(219,228,219,.7)}
.brand-block,.header-actions,.top-nav,.live-chip,.footer-brand,.footer-stats{display:flex;align-items:center}
.brand-block{gap:10px}.brand-mark{width:38px;height:38px;border-radius:11px;background:#24763a;color:#fff;display:grid;place-items:center;box-shadow:0 8px 20px rgba(36,118,58,.18)}
.brand-name{font-size:17px;font-weight:850;letter-spacing:-.03em}.brand-subtitle{font-size:9px;color:#87928a;letter-spacing:.02em;margin-top:1px}
.header-actions{gap:24px}.top-nav{gap:23px}.top-nav a{color:#69766e;text-decoration:none;font-size:11px;font-weight:750}.top-nav a:hover{color:#24763a}
.live-chip{gap:7px;padding:7px 10px;border:1px solid #dce9dd;border-radius:999px;background:#f4faf4;color:#4d7255;font-size:9px;font-weight:800}.live-chip span{width:6px;height:6px;border-radius:50%;background:#35a54b;box-shadow:0 0 0 4px #e1f4e3}
.mobile-menu{display:none;border:1px solid var(--line);background:#fff;border-radius:9px;width:38px;height:38px;color:#38503d}
.hero-copy{max-width:920px;margin:0 auto;padding:54px 22px 24px;text-align:center}.eyebrow{display:inline-flex;align-items:center;gap:8px;color:#728078;font-size:9px;letter-spacing:.18em;font-weight:850}.eyebrow>span{width:6px;height:6px;border-radius:50%;background:#72b83d}.eyebrow.green{color:#55705b}.hero-copy h1{font-size:46px;line-height:1.07;letter-spacing:-.055em;margin:14px 0 13px;font-weight:850}.hero-copy h1 em{font-style:normal;color:#24763a}.hero-copy p{max-width:730px;margin:auto;color:#7a877e;font-size:13px;line-height:1.75}.hero-copy p b{color:#496550}
.orbit-section{position:relative;max-width:1240px;height:610px;margin:auto}.orbit-caption{position:absolute;top:285px;z-index:4;display:flex;flex-direction:column;gap:3px}.orbit-caption span{font-size:8px;color:#98a29b;letter-spacing:.16em;font-weight:850}.orbit-caption b{font-size:11px;color:#5d6c62}.left-caption{left:26px}.right-caption{right:26px;text-align:right}
.orbit-board{position:absolute;left:50%;top:0;width:900px;height:590px;transform:translateX(-50%)}.orbit{position:absolute;border:1px dashed #d8e2d9;border-radius:50%;left:50%;top:50%;transform:translate(-50%,-50%)}.orbit-outer{width:520px;height:520px}.orbit-middle{width:400px;height:400px}.orbit-inner{width:300px;height:300px;border-color:#c8d9ca}.orbit-glow{position:absolute;left:50%;top:50%;width:330px;height:330px;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle,#dcefe0 0%,rgba(220,239,224,.65) 34%,rgba(220,239,224,0) 71%);filter:blur(7px)}.orbit-dots{position:absolute;left:50%;top:50%;width:570px;height:570px;transform:translate(-50%,-50%);border-radius:50%;background-image:radial-gradient(#cbd8ce 1.1px,transparent 1.1px);background-size:19px 19px;opacity:.22;mask-image:radial-gradient(circle,transparent 48%,#000 49%,#000 51%,transparent 52%)}
.core-node{position:absolute;left:50%;top:50%;width:168px;height:168px;transform:translate(-50%,-50%);z-index:5}.core-ring{position:absolute;inset:-14px;border-radius:50%;border:1px solid #9bcaa3;opacity:.55}.ring-b{inset:-26px;border-color:#cfe4d2;opacity:.8}.core-inner{position:absolute;inset:10px;border-radius:50%;background:radial-gradient(circle at 35% 25%,#197b38 0%,#12652f 38%,#1554a6 100%);border:7px solid rgba(255,255,255,.22);box-shadow:0 22px 55px rgba(23,95,48,.27),inset 0 0 25px rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;flex-direction:column;color:#fff;text-align:center}.core-leaf{width:34px;height:34px;border:1px solid rgba(255,255,255,.45);border-radius:50%;display:grid;place-items:center;margin-bottom:7px}.core-inner strong{font-size:20px;letter-spacing:-.04em}.core-inner>span{font-size:8px;letter-spacing:.21em;font-weight:850;margin-top:3px}.core-inner small{font-size:6px;letter-spacing:.14em;color:#cbe0d0;margin-top:8px}
.connector{position:absolute;left:50%;top:50%;height:1px;width:260px;background:linear-gradient(90deg,#d1ded3,transparent);transform-origin:left center;z-index:1}.connector-1{transform:rotate(-90deg)}.connector-2{transform:rotate(-50deg)}.connector-3{transform:rotate(-10deg)}.connector-4{transform:rotate(30deg)}.connector-5{transform:rotate(70deg)}.connector-6{transform:rotate(110deg)}.connector-7{transform:rotate(150deg)}.connector-8{transform:rotate(190deg)}.connector-9{transform:rotate(230deg)}
.orbit-node{position:absolute;z-index:6;border:0;background:transparent;padding:0;cursor:pointer;width:115px;display:flex;flex-direction:column;align-items:center;gap:6px;color:#66746b;transition:transform .22s ease}.orbit-node:hover{transform:translateY(-3px)}.orbit-icon{width:72px;height:72px;border-radius:50%;background:#fff;border:2px solid var(--pillar);color:var(--pillar);display:grid;place-items:center;box-shadow:0 8px 24px rgba(36,60,40,.08);transition:.22s}.orbit-node.active .orbit-icon{background:var(--pillar);color:#fff;box-shadow:0 0 0 8px var(--soft),0 12px 30px rgba(36,60,40,.15);transform:scale(1.05)}.orbit-label{font-size:9px;letter-spacing:.08em;text-transform:uppercase;font-weight:850;color:#5b685f;white-space:nowrap}.orbit-count{font-size:8px;color:#9aa49d}.orbit-node.active .orbit-label{color:var(--pillar)}
.orbit-node.top{left:calc(50% - 57px);top:8px}.orbit-node.tr{right:115px;top:72px}.orbit-node.right{right:22px;top:calc(50% - 37px)}.orbit-node.br{right:114px;bottom:69px}.orbit-node.br2{right:245px;bottom:4px}.orbit-node.bottom{left:calc(50% - 57px);bottom:-3px}.orbit-node.bl{left:245px;bottom:4px}.orbit-node.left{left:22px;top:calc(50% - 37px)}.orbit-node.tl{left:115px;top:72px}
.pillar-strip{max-width:1260px;margin:-2px auto 32px;padding:0 28px;display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.pillar-mini{min-width:0;border:1px solid #e0e8e1;background:#fff;border-radius:15px;padding:12px 13px;display:flex;align-items:center;gap:10px;text-align:left;cursor:pointer;box-shadow:0 3px 13px rgba(31,54,34,.025);transition:.2s}.pillar-mini:hover,.pillar-mini.selected{border-color:#bcd3bf;box-shadow:0 12px 28px rgba(31,54,34,.08);transform:translateY(-2px)}.mini-icon{width:36px;height:36px;border-radius:10px;background:color-mix(in srgb,var(--pillar) 12%,white);color:var(--pillar);display:grid;place-items:center;flex:0 0 36px}.pillar-mini b{display:block;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pillar-mini small{display:block;color:#919b94;font-size:9px;margin-top:3px}.pillar-mini>svg{margin-left:auto;color:#a3ada6}
.selected-banner{max-width:1204px;margin:0 auto 62px;padding:20px 22px;border:1px solid color-mix(in srgb,var(--pillar) 18%,#dfe7df);border-radius:19px;background:linear-gradient(90deg,var(--soft),#fff 68%);display:flex;align-items:center;gap:15px;box-shadow:0 12px 35px rgba(31,54,34,.045)}.selected-icon{width:55px;height:55px;flex:0 0 55px;border-radius:15px;background:var(--pillar);color:#fff;display:grid;place-items:center}.selected-text{flex:1;min-width:0}.selected-text>span{font-size:8px;color:var(--pillar);letter-spacing:.15em;font-weight:850}.selected-text h2{margin:4px 0 4px;font-size:20px;letter-spacing:-.03em}.selected-text p{margin:0;color:#738078;font-size:11px;line-height:1.55}.selected-stat{padding:0 18px;border-left:1px solid #d9e3da;text-align:center}.selected-stat strong{display:block;font-size:24px;line-height:1}.selected-stat span{font-size:8px;color:#8d9890;white-space:nowrap}.primary-btn{border:0;background:#24763a;color:#fff;border-radius:10px;padding:11px 14px;display:flex;align-items:center;gap:7px;font-size:10px;font-weight:850;cursor:pointer;box-shadow:0 8px 18px rgba(36,118,58,.16)}
.details-section,.capabilities{max-width:1204px;margin:auto;scroll-margin-top:18px}.section-heading{display:flex;justify-content:space-between;align-items:end;gap:30px;margin-bottom:22px}.section-heading h2{font-size:28px;letter-spacing:-.045em;margin:8px 0 7px}.section-heading p{max-width:720px;color:#78847c;font-size:12px;line-height:1.7;margin:0}.section-heading.compact{margin-bottom:19px}.view-toggle{display:flex;border:1px solid var(--line);border-radius:10px;padding:3px;background:#fff;flex:0 0 auto}.view-toggle button{border:0;background:transparent;border-radius:7px;color:#7b877f;padding:8px 10px;display:flex;align-items:center;gap:6px;font-size:10px;font-weight:800;cursor:pointer}.view-toggle button.on{background:#edf6ee;color:#267133}
.directory-toolbar{display:flex;align-items:center;gap:8px;margin-bottom:10px}.search-box{height:43px;display:flex;align-items:center;gap:8px;padding:0 12px;border:1px solid var(--line);background:#fff;border-radius:10px;flex:1;color:#8a958d}.search-box input{border:0;outline:0;width:100%;font-size:11px;color:#39483d;background:transparent}.search-box input::placeholder{color:#a3aca5}.search-box button{border:0;background:transparent;color:#89958d;cursor:pointer;display:grid;place-items:center}.filter-control,.scope-btn{height:43px;border:1px solid var(--line);border-radius:10px;background:#fff;color:#6f7d74;display:flex;align-items:center;gap:7px;padding:0 10px;font-size:10px;font-weight:750}.filter-control select{border:0;outline:0;color:#5b695f;background:#fff;font-size:10px;font-weight:750}.scope-btn{cursor:pointer;white-space:nowrap}.scope-btn.on{background:#eef7ee;color:#24763a;border-color:#cfe3d1}.result-count{height:43px;padding:0 10px;border-radius:10px;background:#f2f6f2;color:#859087;display:flex;align-items:center;white-space:nowrap;font-size:10px}.result-count b{color:#34583b;margin-right:4px}.active-filter-line{min-height:36px;margin-bottom:10px;padding:8px 10px;border:1px solid #e5ebe5;border-radius:9px;background:#fbfdfb;color:#748078;font-size:10px;display:flex;align-items:center;gap:6px}.active-dot{width:7px;height:7px;border-radius:50%;flex:0 0 7px}.active-filter-line button{margin-left:auto;border:0;background:transparent;color:#2d7137;font-size:9px;font-weight:850;cursor:pointer}
.table-shell{border:1px solid var(--line);border-radius:15px;background:#fff;overflow:auto;box-shadow:0 12px 34px rgba(31,54,34,.055)}.table-shell table{width:100%;min-width:1190px;border-collapse:collapse}.table-shell th{background:#f7f9f6;border-bottom:1px solid var(--line);padding:12px 13px;text-align:left;font-size:8px;letter-spacing:.12em;color:#7c887f}.table-shell td{padding:12px 13px;border-bottom:1px solid #edf1ed;vertical-align:middle;font-size:10px}.table-shell tr:last-child td{border-bottom:0}.table-shell tbody tr:hover{background:#fbfdfb}.table-pillar{border:0;background:transparent;display:flex;align-items:center;gap:8px;cursor:pointer;text-align:left}.table-pillar>span{width:31px;height:31px;border-radius:9px;color:#fff;display:grid;place-items:center;flex:0 0 31px}.table-pillar b{font-size:10px;color:#526158}.feature-name b{display:block;font-size:11px;color:#26352b}.feature-name small{display:block;color:#9aa49d;font-size:8px;margin-top:3px}.table-description,.use-case{margin:0;max-width:230px;color:#758178;line-height:1.55}.use-case{max-width:235px;color:#66756a}.role-pills{display:flex;flex-wrap:wrap;gap:4px;min-width:95px}.role-pills span{padding:4px 6px;background:#f2f5f2;border-radius:5px;color:#68756d;font-size:7px;font-weight:850}.status-badge{display:inline-flex;align-items:center;gap:5px;border-radius:999px;padding:5px 7px;font-size:8px;font-weight:850;white-space:nowrap}.status-badge i{width:5px;height:5px;border-radius:50%}.status-live{background:#edf8ee;color:#2a7834}.status-live i{background:#3aa74b}.status-core{background:#edf5fa;color:#276590}.status-core i{background:#4c8db8}.status-planned{background:#fff7e8;color:#976d22}.status-planned i{background:#dca53f}
.module-open{border:0;background:transparent;color:#24763a;display:inline-flex;align-items:center;gap:4px;margin-top:6px;padding:0;font-size:9px;font-weight:850;cursor:pointer}.module-open:hover{text-decoration:underline}.card-open{margin-top:12px}.feature-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:13px}.feature-card{border:1px solid var(--line);border-radius:15px;background:#fff;padding:16px;box-shadow:0 5px 20px rgba(31,54,34,.035);transition:.2s}.feature-card:hover{transform:translateY(-3px);box-shadow:0 15px 32px rgba(31,54,34,.08)}.card-top{display:flex;justify-content:space-between;align-items:center}.card-icon{width:41px;height:41px;border-radius:11px;display:grid;place-items:center}.card-pillar{display:block;font-size:8px;font-weight:850;letter-spacing:.1em;text-transform:uppercase;margin-top:14px}.feature-card h3{font-size:14px;margin:5px 0 6px;letter-spacing:-.02em}.feature-card>p{font-size:10px;line-height:1.6;color:#758178;margin:0;min-height:48px}.use-case-card{margin-top:12px;padding:9px;background:#f8faf8;border:1px solid #edf1ed;border-radius:8px;display:flex;gap:7px;color:#66756a;font-size:9px;line-height:1.5}.use-case-card svg{color:#73a13f;flex:0 0 auto;margin-top:1px}.feature-card footer{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:13px;padding-top:11px;border-top:1px solid #edf1ed;color:#8b968f;font-size:8px}.empty-state{grid-column:1/-1;text-align:center;padding:58px 20px;color:#9aa49d}.empty-state h3{color:#425147;margin:10px 0 4px;font-size:15px}.empty-state p{font-size:10px;margin:0}
.capabilities{padding-top:70px}.capability-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.capability-card{min-height:108px;border:1px solid var(--line);background:#fff;border-radius:14px;padding:15px;display:flex;gap:11px;box-shadow:0 4px 17px rgba(31,54,34,.025)}.capability-card>span{width:39px;height:39px;border-radius:11px;background:#edf7ee;color:#2f7d38;display:grid;place-items:center;flex:0 0 39px}.capability-card b{font-size:11px}.capability-card p{font-size:9px;line-height:1.6;color:#77837a;margin:5px 0 0}
.journey-band{margin-top:78px;padding:45px max(28px,calc((100vw - 1204px)/2));background:#153d25;color:#fff;display:flex;align-items:center;gap:50px}.journey-title{width:270px;flex:0 0 270px}.journey-title>span{font-size:8px;letter-spacing:.18em;color:#9fc1a4;font-weight:850}.journey-title h2{font-size:26px;letter-spacing:-.04em;margin:8px 0 6px}.journey-title h2 em{font-style:normal;color:#b5dc72}.journey-title p{color:#b6c8ba;font-size:10px;line-height:1.6;margin:0}.journey-flow{display:flex;align-items:center;justify-content:space-between;gap:12px;flex:1}.journey-step{display:flex;align-items:center;gap:8px;min-width:125px}.journey-step>span{width:39px;height:39px;border-radius:11px;background:rgba(255,255,255,.08);border:1px solid color-mix(in srgb,var(--journey) 55%,transparent);color:var(--journey);display:grid;place-items:center}.journey-step b{display:block;font-size:10px}.journey-step small{display:block;color:#9eb2a2;font-size:7px;margin-top:3px;line-height:1.35}.journey-arrow{color:#607a67;flex:0 0 auto}
.eco-footer{max-width:1204px;margin:auto;padding:22px 0 35px;display:flex;align-items:center;justify-content:space-between;gap:20px;color:#8a958d;font-size:9px}.footer-mark{width:27px;height:27px;border-radius:8px;background:#edf7ee;color:#2f7d38;display:grid;place-items:center}.footer-brand{gap:7px}.footer-brand b{color:#315b38;font-size:12px}.footer-stats{gap:15px}.footer-stats span{padding-left:15px;border-left:1px solid #e2e8e2}.footer-stats strong{color:#315b38}
@media(max-width:1100px){.orbit-section{height:570px}.orbit-board{transform:translateX(-50%) scale(.88);transform-origin:center top}.orbit-caption{display:none}.selected-banner{margin-left:24px;margin-right:24px}.details-section,.capabilities{margin-left:24px;margin-right:24px}.journey-band{padding-left:24px;padding-right:24px}.eco-footer{margin-left:24px;margin-right:24px}}
@media(max-width:820px){.eco-header{padding:0 18px}.live-chip{display:none}.mobile-menu{display:grid;place-items:center}.top-nav{display:none;position:absolute;right:18px;top:64px;z-index:20;padding:10px;background:#fff;border:1px solid var(--line);border-radius:12px;box-shadow:0 12px 30px rgba(20,40,24,.1);flex-direction:column;align-items:flex-start;gap:12px}.top-nav.open{display:flex}.hero-copy{padding-top:36px}.hero-copy h1{font-size:36px}.orbit-section{height:720px;padding:12px 18px}.orbit-board{position:static;width:100%;height:auto;transform:none;display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.orbit,.orbit-glow,.orbit-dots,.connector{display:none}.core-node{position:relative;left:auto;top:auto;transform:none;width:auto;height:105px;grid-column:1/-1;order:-1}.core-inner{inset:0;border-radius:18px}.core-ring{display:none}.orbit-node,.orbit-node.top,.orbit-node.tr,.orbit-node.right,.orbit-node.br,.orbit-node.br2,.orbit-node.bottom,.orbit-node.bl,.orbit-node.left,.orbit-node.tl{position:relative;left:auto;right:auto;top:auto;bottom:auto;width:auto;height:105px;padding:10px;border:1px solid #e0e7e1;border-radius:14px;background:#fff}.orbit-node:hover{transform:none}.orbit-icon{width:46px;height:46px}.orbit-label{font-size:8px;text-align:center;white-space:normal}.orbit-count{font-size:7px}.pillar-strip{padding:0 18px;grid-template-columns:repeat(2,1fr)}.selected-banner{margin:0 18px 46px;flex-wrap:wrap}.selected-text{flex-basis:calc(100% - 72px)}.selected-stat{margin-left:70px;border:0;padding:0}.primary-btn{margin-left:auto}.details-section,.capabilities{margin-left:18px;margin-right:18px}.section-heading{align-items:flex-start;flex-direction:column}.directory-toolbar{flex-wrap:wrap}.search-box{flex-basis:100%}.filter-control,.scope-btn,.result-count{flex:1}.feature-grid{grid-template-columns:repeat(2,1fr)}.capability-grid{grid-template-columns:repeat(2,1fr)}.journey-band{flex-direction:column;align-items:flex-start;gap:28px;padding:36px 18px}.journey-title{width:auto}.journey-flow{width:100%;flex-wrap:wrap}.journey-arrow{display:none}.journey-step{flex:1;min-width:145px}.eco-footer{margin:0 18px;flex-direction:column;align-items:flex-start}.footer-stats{flex-wrap:wrap}}
@media(max-width:560px){.hero-copy h1{font-size:30px}.hero-copy p{font-size:11px}.orbit-section{height:auto;padding-bottom:28px}.orbit-board{grid-template-columns:repeat(2,1fr)}.core-node{grid-column:1/-1}.pillar-strip{grid-template-columns:1fr}.selected-banner{padding:15px}.selected-stat{margin-left:0}.primary-btn{width:100%;justify-content:center;margin-left:0}.feature-grid,.capability-grid{grid-template-columns:1fr}.filter-control,.scope-btn,.result-count{flex-basis:calc(50% - 4px)}.section-heading h2{font-size:23px}.journey-step{min-width:100%;}.footer-stats{display:grid;grid-template-columns:1fr 1fr}.footer-stats span{border-left:0;padding-left:0}}
`;
