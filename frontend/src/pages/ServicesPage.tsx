import React, { useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  Apple,
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  Calendar,
  CalendarCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleDollarSign,
  CloudRain,
  CloudSun,
  Clock3,
  Droplets,
  FileCheck2,
  Filter,
  Heart,
  HeartHandshake,
  IndianRupee,
  Leaf,
  LifeBuoy,
  MapPin,
  MessageCircle,
  Mic,
  Newspaper,
  PhoneCall,
  PieChart,
  RefreshCw,
  Search,
  Send,
  Settings2,
  ShieldAlert,
  ShoppingCart,
  Sprout,
  Stethoscope,
  Tractor,
  TrendingUp,
  UserRound,
  Users,
  WalletCards,
  X,
  Zap,
} from "lucide-react";

interface ServicesPageProps {
  onNavigate: (tab: string) => void;
}

type Tone =
  | "emerald"
  | "rose"
  | "amber"
  | "sky"
  | "violet"
  | "teal"
  | "orange"
  | "indigo"
  | "lime"
  | "slate";

type Service = {
  id: string;
  title: string;
  category: string;
  description: string;
  detail: string;
  icon: React.ElementType;
  tone: Tone;
  tab: string;
  badge: string;
  popular: boolean;
};

type ActivityItem = {
  id: number;
  title: string;
  detail: string;
  time: string;
  status: "Completed" | "Pending" | "In progress";
};

const categories = [
  "All",
  "Crop",
  "Weather",
  "Market",
  "Soil",
  "Irrigation",
  "Livestock",
  "Equipment",
  "Government",
  "Experts",
  "Learning",
  "Community",
  "Farm Management",
  "Marketplace",
];

const serviceCatalog: Service[] = [
  {
    id: "crop-ai",
    title: "AI Crop Recommendation",
    category: "Crop",
    description:
      "Choose suitable crops using soil, season, water availability and farm conditions.",
    detail:
      "Get a ranked crop shortlist with reasons, expected duration and planning tips.",
    icon: Sprout,
    tone: "emerald",
    tab: "crop_rec",
    badge: "Smart",
    popular: true,
  },
  {
    id: "disease",
    title: "AI Crop Disease Detection",
    category: "Crop",
    description:
      "Upload a crop or leaf photo and start a guided health assessment.",
    detail:
      "Review likely symptoms, severity indicators and recommended next actions.",
    icon: ShieldAlert,
    tone: "rose",
    tab: "disease",
    badge: "AI",
    popular: true,
  },
  {
    id: "weather",
    title: "Weather Intelligence",
    category: "Weather",
    description:
      "Check current conditions and a practical farm-focused forecast.",
    detail:
      "Use rainfall, temperature, humidity and wind insights for field planning.",
    icon: CloudSun,
    tone: "sky",
    tab: "weather",
    badge: "Live",
    popular: true,
  },
  {
    id: "mandi",
    title: "Mandi Price Monitor",
    category: "Market",
    description:
      "View crop prices and compare nearby selling opportunities.",
    detail:
      "Track price movement, market range and the best time to review your selling plan.",
    icon: TrendingUp,
    tone: "amber",
    tab: "mandi",
    badge: "Today",
    popular: true,
  },
  {
    id: "market-compare",
    title: "Market Comparison",
    category: "Market",
    description:
      "Compare multiple markets before transporting your harvest.",
    detail:
      "Compare price, distance, trend and estimated net return in one view.",
    icon: CircleDollarSign,
    tone: "orange",
    tab: "mandi",
    badge: "Compare",
    popular: true,
  },
  {
    id: "soil",
    title: "Soil Health Advisor",
    category: "Soil",
    description:
      "Enter soil-test values and understand what they mean for your field.",
    detail:
      "Use pH, NPK and organic-carbon values to create a practical soil action plan.",
    icon: Activity,
    tone: "lime",
    tab: "soil",
    badge: "Analysis",
    popular: true,
  },
  {
    id: "fertilizer",
    title: "Fertilizer Planner",
    category: "Soil",
    description:
      "Build a crop-stage fertilizer checklist from your field information.",
    detail:
      "Organize nutrient applications, timing and notes without losing your soil context.",
    icon: Leaf,
    tone: "teal",
    tab: "fertilizer",
    badge: "Planner",
    popular: false,
  },
  {
    id: "irrigation",
    title: "Smart Irrigation Planner",
    category: "Irrigation",
    description:
      "Plan irrigation around crop stage, soil and forecast conditions.",
    detail:
      "Create watering reminders and reduce avoidable irrigation during expected rain.",
    icon: Droplets,
    tone: "sky",
    tab: "irrigation",
    badge: "Smart",
    popular: true,
  },
  {
    id: "water",
    title: "Water Usage Tracker",
    category: "Irrigation",
    description:
      "Record field watering and monitor your farm water routine.",
    detail:
      "Track irrigation events, field notes and weekly usage trends.",
    icon: CloudRain,
    tone: "indigo",
    tab: "water",
    badge: "Tracker",
    popular: false,
  },
  {
    id: "livestock",
    title: "Livestock Care",
    category: "Livestock",
    description:
      "Keep livestock support, care reminders and basic records together.",
    detail:
      "Reach appropriate support and maintain useful animal-care notes.",
    icon: Apple,
    tone: "rose",
    tab: "livestock",
    badge: "Care",
    popular: false,
  },
  {
    id: "equipment",
    title: "Equipment Rental",
    category: "Equipment",
    description:
      "Find machinery options for seasonal work without buying every machine.",
    detail:
      "Browse equipment categories and prepare a rental request.",
    icon: Tractor,
    tone: "orange",
    tab: "equipment",
    badge: "Nearby",
    popular: true,
  },
  {
    id: "schemes",
    title: "Government Schemes",
    category: "Government",
    description:
      "Discover agriculture schemes and support programs relevant to your needs.",
    detail:
      "Review eligibility information, required documents and application guidance.",
    icon: IndianRupee,
    tone: "violet",
    tab: "schemes",
    badge: "Benefits",
    popular: true,
  },
  {
    id: "experts",
    title: "Expert Consultation",
    category: "Experts",
    description:
      "Request practical guidance from agriculture specialists.",
    detail:
      "Select a topic and preferred callback time for a consultation request.",
    icon: Stethoscope,
    tone: "teal",
    tab: "experts",
    badge: "15 min",
    popular: true,
  },
  {
    id: "news",
    title: "Agriculture News",
    category: "Learning",
    description:
      "Read concise updates about farming, markets, policy and technology.",
    detail:
      "Save useful stories and open the full news area from your dashboard.",
    icon: Newspaper,
    tone: "sky",
    tab: "news",
    badge: "Updates",
    popular: false,
  },
  {
    id: "learning",
    title: "Farmer Learning Hub",
    category: "Learning",
    description:
      "Learn through short lessons, checklists and practical field guides.",
    detail:
      "Track learning progress and return to lessons whenever you need them.",
    icon: BookOpen,
    tone: "indigo",
    tab: "learning",
    badge: "Courses",
    popular: false,
  },
  {
    id: "community",
    title: "Farmer Community",
    category: "Community",
    description:
      "Exchange practical experiences, questions and local farming ideas.",
    detail:
      "Create a discussion, follow useful conversations and discover community knowledge.",
    icon: Users,
    tone: "emerald",
    tab: "community",
    badge: "Connect",
    popular: false,
  },
  {
    id: "tasks",
    title: "Farm Task Planner",
    category: "Farm Management",
    description:
      "Organize sowing, spraying, irrigation, harvesting and other field tasks.",
    detail:
      "Create tasks, set priorities and track completion.",
    icon: CalendarCheck,
    tone: "amber",
    tab: "tasks",
    badge: "Planner",
    popular: true,
  },
  {
    id: "analytics",
    title: "Farm Analytics",
    category: "Farm Management",
    description:
      "See simple indicators for crop, task, market and field activity.",
    detail:
      "Use trends and summaries to understand your recent farm decisions.",
    icon: PieChart,
    tone: "violet",
    tab: "analytics",
    badge: "Insights",
    popular: false,
  },
  {
    id: "marketplace",
    title: "Agri Marketplace",
    category: "Marketplace",
    description:
      "Explore seeds, tools, inputs and equipment from the marketplace area.",
    detail:
      "Use categories and search to find products for your farm needs.",
    icon: ShoppingCart,
    tone: "orange",
    tab: "marketplace",
    badge: "Shop",
    popular: true,
  },
  {
    id: "documents",
    title: "Farm Documents",
    category: "Farm Management",
    description:
      "Keep track of useful farm documents and application checklists.",
    detail:
      "Review document categories and mark preparation tasks.",
    icon: FileCheck2,
    tone: "slate",
    tab: "documents",
    badge: "Records",
    popular: false,
  },
  {
    id: "nearby",
    title: "Nearby Agriculture Services",
    category: "Community",
    description:
      "Find useful local agriculture support categories around your area.",
    detail:
      "Open nearby service discovery and choose the support category you need.",
    icon: MapPin,
    tone: "teal",
    tab: "nearby",
    badge: "Nearby",
    popular: false,
  },
  {
    id: "alerts",
    title: "Personalized Alerts",
    category: "Weather",
    description:
      "Review farm alerts for weather, crop, market and task events.",
    detail:
      "Keep important notifications visible and mark them as reviewed.",
    icon: Bell,
    tone: "rose",
    tab: "alerts",
    badge: "Alerts",
    popular: false,
  },
  {
    id: "emergency",
    title: "Emergency Farm Assistance",
    category: "Experts",
    description:
      "Request urgent field support when a farm problem needs quick attention.",
    detail:
      "Submit a concise help request and keep your phone available for a callback.",
    icon: PhoneCall,
    tone: "rose",
    tab: "help",
    badge: "Urgent",
    popular: true,
  },
  {
    id: "assistant",
    title: "AI Agriculture Assistant",
    category: "Experts",
    description:
      "Ask agriculture questions using a conversational farm assistant.",
    detail:
      "Start with a crop, soil, weather, market or livestock question.",
    icon: MessageCircle,
    tone: "emerald",
    tab: "assistant",
    badge: "AI",
    popular: true,
  },
  {
    id: "voice",
    title: "Voice Farm Search",
    category: "Community",
    description:
      "Use voice-oriented search controls for hands-busy farm situations.",
    detail:
      "Speak a short request and continue with the matching service.",
    icon: Mic,
    tone: "indigo",
    tab: "assistant",
    badge: "Voice",
    popular: false,
  },
  {
    id: "finance",
    title: "Farm Finance Overview",
    category: "Farm Management",
    description:
      "Review simple income, expense and budget categories for farm planning.",
    detail:
      "Track high-level financial entries and prepare questions for an advisor.",
    icon: WalletCards,
    tone: "lime",
    tab: "finance",
    badge: "Budget",
    popular: false,
  },
  {
    id: "success",
    title: "Farmer Success Stories",
    category: "Learning",
    description:
      "Learn from practical farmer experiences and field decisions.",
    detail:
      "Browse short stories organized around outcomes and lessons.",
    icon: Award,
    tone: "amber",
    tab: "stories",
    badge: "Stories",
    popular: false,
  },
  {
    id: "support",
    title: "Help Center",
    category: "Community",
    description:
      "Find guidance for using the platform and locating the right service.",
    detail:
      "Open common help topics or send a support request.",
    icon: LifeBuoy,
    tone: "sky",
    tab: "help",
    badge: "Support",
    popular: false,
  },
];

const toneMap: Record<
  Tone,
  {
    soft: string;
    icon: string;
    button: string;
    border: string;
    glow: string;
    dot: string;
  }
> = {
  emerald: {
    soft: "bg-emerald-50",
    icon: "bg-emerald-100 text-emerald-700",
    button: "bg-emerald-600 hover:bg-emerald-700",
    border: "hover:border-emerald-300",
    glow: "from-emerald-500/20",
    dot: "bg-emerald-500",
  },
  rose: {
    soft: "bg-rose-50",
    icon: "bg-rose-100 text-rose-700",
    button: "bg-rose-600 hover:bg-rose-700",
    border: "hover:border-rose-300",
    glow: "from-rose-500/20",
    dot: "bg-rose-500",
  },
  amber: {
    soft: "bg-amber-50",
    icon: "bg-amber-100 text-amber-700",
    button: "bg-amber-500 hover:bg-amber-600",
    border: "hover:border-amber-300",
    glow: "from-amber-500/20",
    dot: "bg-amber-500",
  },
  sky: {
    soft: "bg-sky-50",
    icon: "bg-sky-100 text-sky-700",
    button: "bg-sky-600 hover:bg-sky-700",
    border: "hover:border-sky-300",
    glow: "from-sky-500/20",
    dot: "bg-sky-500",
  },
  violet: {
    soft: "bg-violet-50",
    icon: "bg-violet-100 text-violet-700",
    button: "bg-violet-600 hover:bg-violet-700",
    border: "hover:border-violet-300",
    glow: "from-violet-500/20",
    dot: "bg-violet-500",
  },
  teal: {
    soft: "bg-teal-50",
    icon: "bg-teal-100 text-teal-700",
    button: "bg-teal-600 hover:bg-teal-700",
    border: "hover:border-teal-300",
    glow: "from-teal-500/20",
    dot: "bg-teal-500",
  },
  orange: {
    soft: "bg-orange-50",
    icon: "bg-orange-100 text-orange-700",
    button: "bg-orange-600 hover:bg-orange-700",
    border: "hover:border-orange-300",
    glow: "from-orange-500/20",
    dot: "bg-orange-500",
  },
  indigo: {
    soft: "bg-indigo-50",
    icon: "bg-indigo-100 text-indigo-700",
    button: "bg-indigo-600 hover:bg-indigo-700",
    border: "hover:border-indigo-300",
    glow: "from-indigo-500/20",
    dot: "bg-indigo-500",
  },
  lime: {
    soft: "bg-lime-50",
    icon: "bg-lime-100 text-lime-700",
    button: "bg-lime-600 hover:bg-lime-700",
    border: "hover:border-lime-300",
    glow: "from-lime-500/20",
    dot: "bg-lime-500",
  },
  slate: {
    soft: "bg-slate-50",
    icon: "bg-slate-100 text-slate-700",
    button: "bg-slate-700 hover:bg-slate-800",
    border: "hover:border-slate-300",
    glow: "from-slate-500/20",
    dot: "bg-slate-500",
  },
};

const activitySeed: ActivityItem[] = [
  {
    id: 1,
    title: "Weather alert reviewed",
    detail: "Rainfall planning notification",
    time: "Today, 08:30",
    status: "Completed",
  },
  {
    id: 2,
    title: "Mandi prices checked",
    detail: "Tomato market comparison",
    time: "Yesterday, 17:20",
    status: "Completed",
  },
  {
    id: 3,
    title: "Expert consultation",
    detail: "Crop health request",
    time: "Yesterday, 11:15",
    status: "Pending",
  },
  {
    id: 4,
    title: "Irrigation task",
    detail: "North field watering",
    time: "Tomorrow, 06:30",
    status: "In progress",
  },
];

const quickStats = [
  {
    label: "Services available",
    value: "30+",
    detail: "Across your farm needs",
    icon: Sprout,
  },
  {
    label: "Active requests",
    value: "03",
    detail: "Need your attention",
    icon: Activity,
  },
  {
    label: "Saved services",
    value: "08",
    detail: "Quick access later",
    icon: Heart,
  },
  {
    label: "Farm tasks",
    value: "12",
    detail: "This month",
    icon: Calendar,
  },
];

const alertItems = [
  {
    title: "Weather planning",
    detail: "Review rainfall before irrigation.",
    tone: "sky" as Tone,
  },
  {
    title: "Market watch",
    detail: "Check crop prices before selling.",
    tone: "amber" as Tone,
  },
  {
    title: "Farm task",
    detail: "A field task is scheduled tomorrow.",
    tone: "emerald" as Tone,
  },
];

export const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigate }) => {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showPopularOnly, setShowPopularOnly] = useState(false);
  const [saved, setSaved] = useState<string[]>([
    "weather",
    "mandi",
    "schemes",
  ]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showConsultation, setShowConsultation] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [activity, setActivity] = useState<ActivityItem[]>(activitySeed);
  const [toast, setToast] = useState("");
  const [assistantMessage, setAssistantMessage] = useState("");
  const [assistantMessages, setAssistantMessages] = useState<string[]>([
    "Hello! Ask me about crops, soil, weather, mandi prices, irrigation or farm planning.",
  ]);
  const [farmCrop, setFarmCrop] = useState("Tomato");
  const [farmSeason, setFarmSeason] = useState("Kharif");
  const [farmLocation, setFarmLocation] = useState("My farm");
  const [sortMode, setSortMode] = useState<"recommended" | "name">(
    "recommended"
  );

  const filteredServices = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    const list = serviceCatalog.filter((service) => {
      const categoryMatch =
        activeCategory === "All" || service.category === activeCategory;

      const queryMatch =
        !normalized ||
        service.title.toLowerCase().includes(normalized) ||
        service.description.toLowerCase().includes(normalized) ||
        service.category.toLowerCase().includes(normalized);

      return (
        categoryMatch &&
        queryMatch &&
        (!showPopularOnly || service.popular)
      );
    });

    return sortMode === "name"
      ? [...list].sort((a, b) => a.title.localeCompare(b.title))
      : [...list].sort(
        (a, b) => Number(b.popular) - Number(a.popular)
      );
  }, [query, activeCategory, showPopularOnly, sortMode]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const toggleSaved = (id: string) => {
    setSaved((current) => {
      const exists = current.includes(id);
      showToast(
        exists
          ? "Removed from saved services"
          : "Saved for quick access"
      );
      return exists
        ? current.filter((x) => x !== id)
        : [...current, id];
    });
  };

  const openService = (service: Service) => {
    setSelectedService(service);
    setActivity((current) => [
      {
        id: Date.now(),
        title: service.title,
        detail: "Opened from Services Hub",
        time: "Just now",
        status: "In progress",
      },
      ...current.slice(0, 5),
    ]);
  };

  const launch = (service: Service) => {
    if (service.id === "experts") {
      setShowConsultation(true);
      return;
    }
    if (service.id === "emergency") {
      setShowEmergency(true);
      return;
    }
    if (service.id === "assistant" || service.id === "voice") {
      setShowAssistant(true);
      return;
    }
    onNavigate(service.tab);
  };

  const submitAssistant = () => {
    const text = assistantMessage.trim();
    if (!text) return;

    setAssistantMessages((messages) => [
      ...messages,
      `You: ${text}`,
      "Agri Assistant: I can help you choose the right service. Open the crop, soil, weather, market or planning tool for the next step.",
    ]);
    setAssistantMessage("");
  };

  const requestEmergency = () => {
    setShowEmergency(false);
    showToast("Urgent help request submitted. Keep your phone nearby.");
    setActivity((current) => [
      {
        id: Date.now(),
        title: "Urgent farm assistance",
        detail: "Support request submitted",
        time: "Just now",
        status: "Pending",
      },
      ...current,
    ]);
  };

  return (
    <div className="agri-services min-h-screen bg-[#f6f8f5] pb-16 text-slate-900">
      <ServicesNavigation
        onNavigate={onNavigate}
        onAssistant={() => setShowAssistant(true)}
        onEmergency={() => setShowEmergency(true)}
        onConsultation={() => setShowConsultation(true)}
      />

      <HeroSection
        query={query}
        setQuery={setQuery}
        onConsultation={() => setShowConsultation(true)}
        onEmergency={() => setShowEmergency(true)}
        onAssistant={() => setShowAssistant(true)}
        onNotifications={() => setShowNotifications(true)}
        onProfile={() => setShowProfile(true)}
      />

      <main className="mx-auto max-w-[1500px] space-y-7 px-4 sm:px-6 lg:px-8">
        <FarmContextBar
          crop={farmCrop}
          setCrop={setFarmCrop}
          season={farmSeason}
          setSeason={setFarmSeason}
          location={farmLocation}
          setLocation={setFarmLocation}
          onRefresh={() => showToast("Farm context refreshed")}
        />

        <StatsGrid />

        <AlertsStrip onOpen={() => setShowNotifications(true)} />

        <section className="service-directory rounded-[30px] border border-slate-200/80 bg-white p-4 shadow-[0_12px_40px_rgba(15,23,42,0.05)] sm:p-6 lg:p-7">
          <SectionHeading
            eyebrow="Smart service directory"
            title="Everything your farm needs"
            description="One organized command center for crop, weather, market, soil, equipment, government support and farm management."
            action={
              <button
                onClick={() => setShowMoreFilters((v) => !v)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700"
              >
                <Filter className="h-4 w-4" />
                Filters
                {showMoreFilters ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            }
          />

          <div className="mt-6 grid gap-3 xl:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search disease, mandi, soil, schemes, tractor..."
                className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/80 pl-12 pr-4 text-sm font-semibold outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              />
            </div>

            <button
              onClick={() => setShowPopularOnly((v) => !v)}
              className={`h-14 rounded-2xl px-5 text-sm font-extrabold transition ${showPopularOnly
                ? "bg-emerald-700 text-white shadow-lg shadow-emerald-900/15"
                : "border border-slate-200 bg-white text-slate-700 hover:border-emerald-300"
                }`}
            >
              {showPopularOnly ? "Popular only" : "Show popular"}
            </button>

            <select
              value={sortMode}
              onChange={(e) =>
                setSortMode(
                  e.target.value as "recommended" | "name"
                )
              }
              className="h-14 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-extrabold text-slate-700 outline-none focus:border-emerald-400"
            >
              <option value="recommended">Recommended first</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>

          {showMoreFilters && (
            <div className="mt-4 grid gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 sm:grid-cols-2 lg:grid-cols-4">
              <FilterInfo label="Crop context" value={farmCrop} />
              <FilterInfo label="Season" value={farmSeason} />
              <FilterInfo label="Location" value={farmLocation} />
              <FilterInfo
                label="Saved services"
                value={`${saved.length} saved`}
              />
            </div>
          )}

          <div className="category-scroller mt-6 flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`whitespace-nowrap rounded-full px-4 py-2.5 text-xs font-extrabold transition ${activeCategory === category
                  ? "bg-slate-950 text-white shadow-md"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
                  }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-slate-900">
                {filteredServices.length} services
              </p>
              <p className="text-xs text-slate-400">
                Built around your {farmCrop} · {farmSeason} context
              </p>
            </div>
            <div className="hidden items-center gap-2 text-xs font-bold text-slate-400 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Ready to open
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                saved={saved.includes(service.id)}
                onSave={() => toggleSaved(service.id)}
                onOpen={() => openService(service)}
                onLaunch={() => launch(service)}
              />
            ))}
          </div>

          {filteredServices.length === 0 && (
            <EmptyServices
              query={query}
              onReset={() => {
                setQuery("");
                setActiveCategory("All");
                setShowPopularOnly(false);
              }}
            />
          )}
        </section>

        <TwoColumnWorkspace
          onOpenActivity={() => setShowActivity(true)}
          onOpenSaved={() =>
            showToast(`${saved.length} services are saved for quick access`)
          }
          onConsultation={() => setShowConsultation(true)}
          onAssistant={() => setShowAssistant(true)}
        />

        <FarmPlanningPanel
          crop={farmCrop}
          season={farmSeason}
          onNavigate={onNavigate}
          showToast={showToast}
        />

        <FooterServiceBanner
          onEmergency={() => setShowEmergency(true)}
          onConsultation={() => setShowConsultation(true)}
        />
      </main>

      {selectedService && (
        <ServiceDetailModal
          service={selectedService}
          saved={saved.includes(selectedService.id)}
          onSave={() => toggleSaved(selectedService.id)}
          onClose={() => setSelectedService(null)}
          onLaunch={() => {
            setSelectedService(null);
            launch(selectedService);
          }}
        />
      )}

      {showConsultation && (
        <ConsultationModal
          onClose={() => setShowConsultation(false)}
          onSubmit={() => {
            setShowConsultation(false);
            showToast("Consultation request created successfully");
          }}
        />
      )}

      {showEmergency && (
        <EmergencyModal
          onClose={() => setShowEmergency(false)}
          onSubmit={requestEmergency}
        />
      )}

      {showAssistant && (
        <AssistantModal
          messages={assistantMessages}
          value={assistantMessage}
          setValue={setAssistantMessage}
          onSubmit={submitAssistant}
          onClose={() => setShowAssistant(false)}
        />
      )}

      {showNotifications && (
        <NotificationsModal
          onClose={() => setShowNotifications(false)}
          onNavigate={onNavigate}
        />
      )}

      {showActivity && (
        <ActivityModal
          activity={activity}
          onClose={() => setShowActivity(false)}
        />
      )}

      {showProfile && (
        <ProfileModal
          savedCount={saved.length}
          onClose={() => setShowProfile(false)}
          onSettings={() => {
            setShowProfile(false);
            showToast("Account settings opened");
          }}
        />
      )}

      {toast && <Toast message={toast} />}

      <style>{LOCAL_STYLES}</style>
    </div>
  );
};

const LOCAL_STYLES = `
  .agri-services {
    --agri-shadow: 0 14px 40px rgba(15, 23, 42, .07);
  }

  .agri-services * {
    box-sizing: border-box;
  }

  .agri-services button,
  .agri-services input,
  .agri-services select,
  .agri-services textarea {
    font-family: inherit;
  }

  .agri-services ::selection {
    background: rgba(16, 185, 129, .22);
  }

  .agri-services .category-scroller {
    scrollbar-width: thin;
    scrollbar-color: rgba(100, 116, 139, .35) transparent;
  }

  .agri-services .category-scroller::-webkit-scrollbar {
    height: 5px;
  }

  .agri-services .category-scroller::-webkit-scrollbar-track {
    background: transparent;
  }

  .agri-services .category-scroller::-webkit-scrollbar-thumb {
    background: rgba(100, 116, 139, .28);
    border-radius: 999px;
  }

  .agri-services .service-card {
    animation: agriCardIn .45s ease both;
  }

  .agri-services .service-card:nth-child(2n) {
    animation-delay: .03s;
  }

  .agri-services .service-card:nth-child(3n) {
    animation-delay: .06s;
  }

  .agri-services .glass-nav {
    background: rgba(123, 172, 235, 0.88);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .agri-services .hero-grid {
    background-image:
      linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px);
    background-size: 42px 42px;
  }

  .agri-services .hero-orb {
    animation: agriFloat 8s ease-in-out infinite;
  }

  .agri-services .hero-orb-2 {
    animation: agriFloat 10s ease-in-out infinite reverse;
  }

  .agri-services .service-shine {
    opacity: 0;
    transform: translateX(-110%);
    transition: transform .65s ease, opacity .35s ease;
  }

  .agri-services .service-card:hover .service-shine {
    opacity: 1;
    transform: translateX(110%);
  }

  .agri-services .form-input,
  .agri-services .form-select {
    width: 100%;
    border-radius: 14px;
    border: 1px solid rgb(226 232 240);
    background: white;
    padding: 12px 14px;
    font-size: 14px;
    color: rgb(51 65 85);
    outline: none;
    transition: border-color .2s ease, box-shadow .2s ease;
  }

  .agri-services .form-input:focus,
  .agri-services .form-select:focus {
    border-color: rgb(52 211 153);
    box-shadow: 0 0 0 4px rgb(209 250 229);
  }

  .agri-services .form-input::placeholder {
    color: rgb(148 163 184);
  }

  @keyframes agriCardIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes agriFloat {
    0%, 100% { transform: translate3d(0, 0, 0); }
    50% { transform: translate3d(0, 18px, 0); }
  }

  @media (prefers-reduced-motion: reduce) {
    .agri-services *,
    .agri-services *::before,
    .agri-services *::after {
      animation-duration: .01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: .01ms !important;
    }
  }
`;

const ServicesNavigation: React.FC<any> = ({
  onNavigate,
  onAssistant,
  onEmergency,
  onConsultation,
}) => {
  const [open, setOpen] = useState(false);

  const serviceLinks = [
    {
      title: "Explore Full Ecosystem",
      subtitle: "View every connected AgriVision module",
      icon: Sprout,
      action: () => onNavigate("ecosystem"),
      tone: "emerald" as Tone,
    },
    {
      title: "Farmer Success Stories",
      subtitle: "See practical outcomes and experiences",
      icon: Award,
      action: () => onNavigate("stories"),
      tone: "amber" as Tone,
    },
    {
      title: "Contact Agriculture Support",
      subtitle: "Get help with your farm or account",
      icon: LifeBuoy,
      action: onAssistant,
      tone: "teal" as Tone,
    },
    {
      title: "Government Schemes",
      subtitle: "Explore benefits and application guidance",
      icon: IndianRupee,
      action: () => onNavigate("schemes"),
      tone: "violet" as Tone,
    },
    {
      title: "Privacy & Data Policy",
      subtitle: "Learn how your information is handled",
      icon: ShieldAlert,
      action: () =>
        window.alert(
          "Privacy information can be connected to your project policy page."
        ),
      tone: "indigo" as Tone,
    },
    {
      title: "Emergency Farm Help",
      subtitle: "Get urgent assistance for field issues",
      icon: PhoneCall,
      action: onEmergency,
      tone: "rose" as Tone,
    },
  ];

  return (
    <div className="glass-nav sticky top-0 z-40 border-b border-slate-200/80 shadow-sm">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <button
          onClick={() => onNavigate("dashboard")}
          className="group flex items-center gap-3 text-left"
        >
          <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-green-900 text-white shadow-lg shadow-emerald-900/20">
            <Sprout className="h-6 w-6 transition group-hover:scale-110" />
            <span className="absolute -right-2 -top-2 h-5 w-5 rounded-full bg-amber-300/70 blur-md" />
          </span>
          <span>
            <span className="block text-sm font-black tracking-tight text-slate-950">
              AgriVision
            </span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Smart Agriculture
            </span>
          </span>
        </button>

        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-black transition ${open
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-slate-200 bg-white text-slate-700 hover:border-emerald-200"
              }`}
            aria-expanded={open}
            aria-haspopup="menu"
          >
            <span>Services</span>
            {open ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {open && (
            <div className="absolute right-0 top-[calc(100%+10px)] w-[min(94vw,430px)] overflow-hidden rounded-[28px] border border-slate-200 bg-white p-3 shadow-2xl">
              <div className="flex items-center justify-between px-3 py-3">
                <div>
                  <p className="text-base font-black text-slate-950">
                    Explore AgriVision
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Tools and support for every farmer
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
                  aria-label="Close services menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-1">
                {serviceLinks.map((item) => {
                  const Icon = item.icon;
                  const tone = toneMap[item.tone];

                  return (
                    <button
                      key={item.title}
                      onClick={() => {
                        item.action();
                        setOpen(false);
                      }}
                      className="group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-slate-50"
                    >
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${tone.icon}`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-black text-slate-800">
                          {item.title}
                        </span>
                        <span className="mt-0.5 block text-[11px] leading-4 text-slate-400">
                          {item.subtitle}
                        </span>
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-600" />
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-100 px-3 pt-3">
                <button
                  onClick={() => {
                    onConsultation();
                    setOpen(false);
                  }}
                  className="rounded-xl bg-emerald-50 px-3 py-2.5 text-[11px] font-black text-emerald-700"
                >
                  Book expert
                </button>
                <button
                  onClick={() => {
                    onNavigate("marketplace");
                    setOpen(false);
                  }}
                  className="rounded-xl bg-slate-50 px-3 py-2.5 text-[11px] font-black text-slate-600"
                >
                  Open marketplace
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const HeroSection: React.FC<any> = ({
  query,
  setQuery,
  onConsultation,
  onEmergency,
  onAssistant,
  onNotifications,
  onProfile,
}) => (
  <section className="hero-grid relative overflow-hidden bg-gradient-to-br from-[#052e20] via-[#075c3e] to-[#0f172a] px-4 py-8 text-white shadow-2xl sm:px-8 sm:py-11 lg:px-12">
    <div className="hero-orb absolute -right-24 -top-32 h-80 w-80 rounded-full bg-emerald-400/15 blur-3xl" />
    <div className="hero-orb-2 absolute -bottom-44 left-1/4 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

    <div className="relative mx-auto max-w-[1500px]">
      <div className="flex items-start justify-between gap-5">
        <div className="max-w-4xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200">
            <HeartHandshake className="h-3.5 w-3.5" />
            AgriVision Services Hub
          </div>

          <h1 className="max-w-4xl text-3xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            {" "}
            <span className="text-emerald-300">smarter farm decisions.</span>
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-emerald-50/75 sm:text-base">
            Crop intelligence, weather planning, mandi information, expert
            help, government support and everyday farm tools — organized in
            one modern farmer workspace.
          </p>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <IconButton
            label="Notifications"
            icon={Bell}
            onClick={onNotifications}
          />
          <IconButton
            label="Profile"
            icon={UserRound}
            onClick={onProfile}
          />
        </div>
      </div>

      <div className="mt-7 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setQuery(e.target.value)
            }
            placeholder="Ask anything about farming..."
            className="h-16 w-full rounded-2xl border border-white/10 bg-white pl-12 pr-24 text-sm font-semibold text-slate-900 shadow-2xl outline-none placeholder:text-slate-400"
          />
          <button
            onClick={onAssistant}
            className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1.5 rounded-xl bg-emerald-100 px-3 py-2.5 text-xs font-black text-emerald-800"
          >
            <Mic className="h-4 w-4" />
            Voice
          </button>
        </div>

        <button
          onClick={onConsultation}
          className="flex h-16 items-center justify-center gap-2 rounded-2xl bg-amber-300 px-6 text-sm font-black text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-amber-200"
        >
          <CalendarCheck className="h-4 w-4" />
          Book expert
        </button>

        <button
          onClick={onEmergency}
          className="flex h-16 items-center justify-center gap-2 rounded-2xl border border-rose-200/20 bg-rose-500/15 px-6 text-sm font-black text-white transition hover:bg-rose-500/25"
        >
          <PhoneCall className="h-4 w-4" />
          Emergency help
        </button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 border-t border-white/10 pt-6 sm:grid-cols-4">
        <HeroMetric value="30+" label="Smart services" />
        <HeroMetric value="24/7" label="Help access" />
        <HeroMetric value="12k+" label="Farmers supported" />
        <HeroMetric value="15+" label="Expert topics" />
      </div>
    </div>
  </section>
);

const HeroMetric: React.FC<{ value: string; label: string }> = ({
  value,
  label,
}) => (
  <div className="rounded-2xl border border-white/8 bg-white/5 p-3 backdrop-blur-sm">
    <p className="text-2xl font-black">{value}</p>
    <p className="mt-1 text-xs font-semibold text-emerald-200/75">{label}</p>
  </div>
);

const IconButton: React.FC<any> = ({
  label,
  icon: Icon,
  onClick,
}) => (
  <button
    onClick={onClick}
    title={label}
    className="rounded-2xl border border-white/10 bg-white/8 p-3 text-white transition hover:bg-white/15"
  >
    <Icon className="h-5 w-5" />
  </button>
);

const FarmContextBar: React.FC<any> = ({
  crop,
  setCrop,
  season,
  setSeason,
  location,
  setLocation,
  onRefresh,
}) => (
  <section className="-mt-4 relative z-10 rounded-[28px] border border-slate-200/80 bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,.09)] sm:p-5">
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <Sprout className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">
            Your farm context
          </p>
          <h2 className="mt-1 text-sm font-black text-slate-900 sm:text-base">
            Personalize services around your current crop
          </h2>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <ContextSelect
          label="Crop"
          value={crop}
          onChange={setCrop}
          options={[
            "Tomato",
            "Paddy",
            "Wheat",
            "Maize",
            "Cotton",
            "Grapes",
          ]}
        />
        <ContextSelect
          label="Season"
          value={season}
          onChange={setSeason}
          options={["Kharif", "Rabi", "Zaid"]}
        />
        <ContextSelect
          label="Farm"
          value={location}
          onChange={setLocation}
          options={["My farm", "North field", "South field", "Lease field"]}
        />
      </div>

      <button
        onClick={onRefresh}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-black text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
      >
        <RefreshCw className="h-4 w-4" />
        Refresh context
      </button>
    </div>
  </section>
);

const ContextSelect: React.FC<any> = ({
  label,
  value,
  onChange,
  options,
}) => (
  <label className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
    <span className="block text-[9px] font-black uppercase tracking-wider text-slate-400">
      {label}
    </span>
    <select
      value={value}
      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
        onChange(e.target.value)
      }
      className="mt-1 w-full bg-transparent text-xs font-black text-slate-700 outline-none"
    >
      {options.map((option: string) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  </label>
);

const StatsGrid = () => (
  <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    {quickStats.map((stat, index) => {
      const Icon = stat.icon;

      return (
        <div
          key={stat.label}
          className="group relative overflow-hidden rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
          <div
            className={`absolute -right-12 -top-12 h-28 w-28 rounded-full ${index % 2 === 0 ? "bg-emerald-50" : "bg-sky-50"
              } transition group-hover:scale-125`}
          />

          <div className="relative flex items-center justify-between">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Icon className="h-5 w-5" />
            </span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>

          <p className="relative mt-5 text-3xl font-black tracking-tight text-slate-950">
            {stat.value}
          </p>
          <p className="relative mt-1 text-sm font-black text-slate-800">
            {stat.label}
          </p>
          <p className="relative mt-1 text-xs font-medium text-slate-400">
            {stat.detail}
          </p>
        </div>
      );
    })}
  </section>
);

const AlertsStrip: React.FC<{ onOpen: () => void }> = ({ onOpen }) => (
  <section className="overflow-hidden rounded-[28px] border border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50 p-4 sm:p-5">
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
      <div className="flex items-center gap-3 xl:w-60">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <Bell className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">
            Today
          </p>
          <p className="font-black text-amber-950">Farm alerts</p>
        </div>
      </div>

      <div className="grid flex-1 gap-2 md:grid-cols-3">
        {alertItems.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-white/80 bg-white/75 p-3"
          >
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${toneMap[item.tone].dot
                  }`}
              />
              <p className="text-sm font-black text-slate-900">
                {item.title}
              </p>
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {item.detail}
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={onOpen}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-700 px-4 py-3 text-xs font-black text-white transition hover:bg-amber-800"
      >
        View alerts
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  </section>
);

const SectionHeading: React.FC<any> = ({
  eyebrow,
  title,
  description,
  action,
}) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">
        {eyebrow}
      </p>
      <h2 className="mt-1.5 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
        {title}
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
    {action}
  </div>
);

const FilterInfo: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="rounded-2xl border border-emerald-100 bg-white p-3">
    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
      {label}
    </p>
    <p className="mt-1 text-sm font-black text-slate-900">{value}</p>
  </div>
);

const ServiceCard: React.FC<any> = ({
  service,
  saved,
  onSave,
  onOpen,
  onLaunch,
}) => {
  const Icon = service.icon;
  const tone = toneMap[service.tone];

  return (
    <article
      className={`service-card group relative flex min-h-[310px] flex-col overflow-hidden rounded-[26px] border border-slate-200/90 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_45px_rgba(15,23,42,.10)] ${tone.border}`}
    >
      <div
        className={`service-shine pointer-events-none absolute -inset-y-10 -left-1/2 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/50 to-transparent`}
      />

      <div
        className={`absolute right-0 top-0 h-28 w-28 bg-gradient-to-bl ${tone.glow} to-transparent opacity-60`}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-[20px] ${tone.icon} shadow-sm transition duration-300 group-hover:scale-105`}
        >
          <Icon className="h-6 w-6" />
        </div>

        <div className="flex items-center gap-1.5">
          {service.popular && (
            <span className="rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-amber-700">
              Popular
            </span>
          )}

          <button
            onClick={onSave}
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${saved
              ? "bg-rose-50 text-rose-600"
              : "bg-slate-50 text-slate-300 hover:bg-rose-50 hover:text-rose-500"
              }`}
            aria-label={saved ? "Remove saved service" : "Save service"}
          >
            <Heart className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>

      <div className="relative mt-5 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
            {service.category}
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-black text-slate-500">
            {service.badge}
          </span>
        </div>

        <h3 className="mt-2.5 text-lg font-black tracking-tight text-slate-950">
          {service.title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {service.description}
        </p>
      </div>

      <div className="relative mt-5 flex gap-2">
        <button
          onClick={onOpen}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-black text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          Details
        </button>

        <button
          onClick={onLaunch}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-black text-white shadow-sm transition hover:-translate-y-0.5 ${tone.button}`}
        >
          Open
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </article>
  );
};

const EmptyServices: React.FC<any> = ({ query, onReset }) => (
  <div className="mt-6 rounded-[26px] border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-sm">
      <Search className="h-7 w-7" />
    </div>
    <h3 className="mt-4 text-lg font-black text-slate-900">
      No service found
    </h3>
    <p className="mt-1 text-sm text-slate-500">
      Nothing matched {query ? `"${query}"` : "your filters"}.
    </p>
    <button
      onClick={onReset}
      className="mt-5 rounded-xl bg-emerald-700 px-5 py-3 text-xs font-black text-white transition hover:bg-emerald-800"
    >
      Reset filters
    </button>
  </div>
);

const TwoColumnWorkspace: React.FC<any> = ({
  onOpenActivity,
  onOpenSaved,
  onConsultation,
  onAssistant,
}) => (
  <section className="grid gap-6 lg:grid-cols-2">
    <div className="rounded-[30px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <SectionHeading
        eyebrow="Personal workspace"
        title="Your next actions"
        description="Keep common farm decisions within reach."
      />

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <WorkspaceAction
          icon={Clock3}
          title="Recent activity"
          detail="Review services you recently opened."
          onClick={onOpenActivity}
        />
        <WorkspaceAction
          icon={Heart}
          title="Saved services"
          detail="Return to your favorite tools."
          onClick={onOpenSaved}
        />
        <WorkspaceAction
          icon={Stethoscope}
          title="Talk to an expert"
          detail="Request specialist guidance."
          onClick={onConsultation}
        />
        <WorkspaceAction
          icon={MessageCircle}
          title="Ask AI assistant"
          detail="Start a farming question."
          onClick={onAssistant}
        />
      </div>
    </div>

    <div className="relative overflow-hidden rounded-[30px] border border-emerald-900 bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 p-5 text-white shadow-xl sm:p-6">
      <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-emerald-400/10 blur-2xl" />

      <div className="relative flex items-start gap-3">
        <div className="rounded-2xl bg-white/10 p-3">
          <Zap className="h-6 w-6 text-amber-300" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">
            Smart shortcut
          </p>
          <h3 className="mt-1 text-xl font-black">
            Start with your most important farm question.
          </h3>
          <p className="mt-2 text-sm leading-6 text-emerald-100/75">
            Move from a question to the right service without navigating
            through multiple screens.
          </p>
        </div>
      </div>

      <div className="relative mt-5 grid gap-2 sm:grid-cols-3">
        <Shortcut label="Crop health" icon={ShieldAlert} />
        <Shortcut label="Market price" icon={TrendingUp} />
        <Shortcut label="Weather" icon={CloudSun} />
      </div>
    </div>
  </section>
);

const WorkspaceAction: React.FC<any> = ({
  icon: Icon,
  title,
  detail,
  onClick,
}) => (
  <button
    onClick={onClick}
    className="group rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-left transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-white hover:shadow-md"
  >
    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
      <Icon className="h-5 w-5" />
    </span>
    <p className="mt-3 text-sm font-black text-slate-900">{title}</p>
    <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>
    <ArrowRight className="mt-3 h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-600" />
  </button>
);

const Shortcut: React.FC<any> = ({ label, icon: Icon }) => (
  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
    <Icon className="h-4 w-4 text-emerald-300" />
    <span className="text-xs font-bold">{label}</span>
  </div>
);

const FarmPlanningPanel: React.FC<any> = ({
  crop,
  season,
  onNavigate,
  showToast,
}) => {
  const plan = [
    {
      title: "Check weather",
      detail: "Review rain and temperature before field work.",
      icon: CloudSun,
      tab: "weather",
    },
    {
      title: "Review soil",
      detail: `Keep ${crop} nutrient planning aligned with your soil test.`,
      icon: Activity,
      tab: "soil",
    },
    {
      title: "Compare market",
      detail: "Check current market options before selling.",
      icon: TrendingUp,
      tab: "mandi",
    },
    {
      title: "Plan tasks",
      detail: `Create your ${season} field checklist.`,
      icon: CalendarCheck,
      tab: "tasks",
    },
  ];

  return (
    <section className="rounded-[30px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <SectionHeading
        eyebrow="Farm planning"
        title={`Suggested workflow for ${crop}`}
        description={`A simple ${season} checklist to connect the right services.`}
      />

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {plan.map((item, index) => {
          const Icon = item.icon;

          return (
            <button
              key={item.title}
              onClick={() => {
                onNavigate(item.tab);
                showToast(`${item.title} opened`);
              }}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-left transition hover:-translate-y-1 hover:border-emerald-300 hover:bg-white hover:shadow-md"
            >
              <span className="absolute right-4 top-3 text-[10px] font-black text-slate-200">
                0{index + 1}
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-sm font-black text-slate-900">
                {item.title}
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {item.detail}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-black text-emerald-700">
                Open
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

const FooterServiceBanner: React.FC<any> = ({
  onEmergency,
  onConsultation,
}) => (
  <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-2xl sm:p-8">
    <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-emerald-400/10 blur-3xl" />

    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="max-w-2xl">
        <div className="flex items-center gap-2 text-emerald-300">
          <HeartHandshake className="h-5 w-5" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">
            Farmer-first support
          </span>
        </div>

        <h2 className="mt-3 text-2xl font-black sm:text-3xl">
          Need help making your next farm decision?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-300">
          Use everyday smart tools or request human support when the decision
          needs specialist attention.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          onClick={onConsultation}
          className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black transition hover:bg-emerald-500"
        >
          Talk to an expert
        </button>
        <button
          onClick={onEmergency}
          className="rounded-xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-black transition hover:bg-white/15"
        >
          Urgent help
        </button>
      </div>
    </div>
  </section>
);

const ModalShell: React.FC<any> = ({
  title,
  subtitle,
  onClose,
  children,
  wide,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
    <div
      className={`max-h-[90vh] w-full overflow-y-auto rounded-[28px] bg-white shadow-2xl ${wide ? "max-w-2xl" : "max-w-lg"
        }`}
    >
      <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white p-5">
        <div>
          <h2 className="text-xl font-black text-slate-950">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          )}
        </div>

        <button
          onClick={onClose}
          className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-5">{children}</div>
    </div>
  </div>
);

const ServiceDetailModal: React.FC<any> = ({
  service,
  saved,
  onSave,
  onClose,
  onLaunch,
}) => {
  const Icon = service.icon;
  const tone = toneMap[service.tone];

  return (
    <ModalShell
      title={service.title}
      subtitle={`${service.category} service · ${service.badge}`}
      onClose={onClose}
    >
      <div className={`rounded-2xl border p-5 ${tone.soft}`}>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone.icon}`}
        >
          <Icon className="h-6 w-6" />
        </div>

        <p className="mt-4 text-sm font-bold leading-6 text-slate-800">
          {service.description}
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {service.detail}
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <DetailMini
          icon={CheckCircle2}
          title="Guided"
          text="Step-by-step flow"
        />
        <DetailMini
          icon={ShieldAlert}
          title="Contextual"
          text="Farm-focused inputs"
        />
        <DetailMini
          icon={Activity}
          title="Trackable"
          text="Activity visibility"
        />
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
          What you can do
        </p>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          <li className="flex gap-2">
            <Check className="h-4 w-4 shrink-0 text-emerald-600" />
            Open the dedicated {service.category.toLowerCase()} workflow.
          </li>
          <li className="flex gap-2">
            <Check className="h-4 w-4 shrink-0 text-emerald-600" />
            Keep the service visible in activity history.
          </li>
          <li className="flex gap-2">
            <Check className="h-4 w-4 shrink-0 text-emerald-600" />
            Save it for faster access later.
          </li>
        </ul>
      </div>

      <div className="mt-5 flex gap-2">
        <button
          onClick={onSave}
          className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700"
        >
          {saved ? "Remove from saved" : "Save service"}
        </button>

        <button
          onClick={onLaunch}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black text-white ${tone.button}`}
        >
          Open service
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </ModalShell>
  );
};

const DetailMini: React.FC<any> = ({
  icon: Icon,
  title,
  text,
}) => (
  <div className="rounded-xl border border-slate-200 bg-white p-3">
    <Icon className="h-4 w-4 text-emerald-700" />
    <p className="mt-2 text-xs font-black text-slate-900">{title}</p>
    <p className="mt-1 text-[11px] text-slate-500">{text}</p>
  </div>
);

const ConsultationModal: React.FC<any> = ({
  onClose,
  onSubmit,
}) => {
  const [topic, setTopic] = useState("Crop health and disease");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <ModalShell
      title="Book an expert consultation"
      subtitle="Choose a topic and preferred callback time."
      onClose={onClose}
    >
      <div className="space-y-4">
        <FieldLabel label="What do you need help with?">
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="form-select"
          >
            <option>Crop health and disease</option>
            <option>Soil and nutrients</option>
            <option>Market and selling</option>
            <option>Government benefits</option>
            <option>Livestock care</option>
            <option>Farm finance</option>
          </select>
        </FieldLabel>

        <FieldLabel label="Preferred callback time">
          <input
            value={time}
            onChange={(e) => setTime(e.target.value)}
            type="datetime-local"
            className="form-input"
          />
        </FieldLabel>

        <FieldLabel label="Additional context">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Tell the specialist what you are observing..."
            className="form-input resize-none"
          />
        </FieldLabel>

        <div className="rounded-2xl bg-emerald-50 p-4 text-xs leading-5 text-emerald-800">
          <b>Consultation request</b>
          <p>
            Share enough context so the specialist can prepare a useful
            response.
          </p>
        </div>

        <button
          onClick={onSubmit}
          className="w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-800"
        >
          Request consultation
        </button>
      </div>
    </ModalShell>
  );
};

const EmergencyModal: React.FC<any> = ({
  onClose,
  onSubmit,
}) => {
  const [type, setType] = useState("Crop emergency");
  const [description, setDescription] = useState("");

  return (
    <ModalShell
      title="Emergency farm assistance"
      subtitle="For immediate danger, contact local emergency services first."
      onClose={onClose}
    >
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-rose-600" />
          <div>
            <p className="text-sm font-black text-rose-900">
              Urgent support request
            </p>
            <p className="mt-1 text-xs leading-5 text-rose-700">
              Use this for urgent crop, livestock or field-support situations.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <FieldLabel label="Problem category">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="form-select"
          >
            <option>Crop emergency</option>
            <option>Livestock emergency</option>
            <option>Severe weather damage</option>
            <option>Irrigation failure</option>
            <option>Other field issue</option>
          </select>
        </FieldLabel>

        <FieldLabel label="Brief description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe what happened and where..."
            className="form-input resize-none"
          />
        </FieldLabel>

        <div className="grid gap-2 sm:grid-cols-2">
          <a
            href="tel:18001801551"
            className="flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-3 text-xs font-black text-rose-700"
          >
            <PhoneCall className="h-4 w-4" />
            Kisan Call Centre
          </a>

          <button
            onClick={onSubmit}
            className="rounded-xl bg-rose-600 px-4 py-3 text-xs font-black text-white"
          >
            Request callback
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

const AssistantModal: React.FC<any> = ({
  messages,
  value,
  setValue,
  onSubmit,
  onClose,
}) => (
  <ModalShell
    title="AI Agriculture Assistant"
    subtitle="Ask a farming question or choose a suggested topic."
    onClose={onClose}
  >
    <div className="rounded-2xl bg-gradient-to-br from-emerald-950 to-slate-950 p-4 text-white">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-white/10 p-2">
          <MessageCircle className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-black">Farm assistant</p>
          <p className="text-xs text-emerald-200/70">
            Crop · Soil · Weather · Market · Planning
          </p>
        </div>
      </div>
    </div>

    <div className="mt-4 max-h-64 space-y-2 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-3">
      {messages.map((message: string, index: number) => (
        <div
          key={index}
          className={`rounded-xl p-3 text-xs leading-5 ${message.startsWith("You:")
            ? "ml-8 bg-emerald-100 text-emerald-950"
            : "mr-4 bg-white text-slate-600"
            }`}
        >
          {message}
        </div>
      ))}
    </div>

    <div className="mt-4 flex gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit();
        }}
        placeholder="Example: How should I plan irrigation?"
        className="form-input flex-1"
      />
      <button
        onClick={onSubmit}
        className="rounded-xl bg-emerald-700 px-4 text-white"
        aria-label="Send message"
      >
        <Send className="h-4 w-4" />
      </button>
    </div>

    <div className="mt-3 flex flex-wrap gap-2">
      {["Crop disease", "Mandi prices", "Soil health", "Irrigation"].map(
        (topic) => (
          <button
            key={topic}
            onClick={() => setValue(topic)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600"
          >
            {topic}
          </button>
        )
      )}
    </div>
  </ModalShell>
);

const NotificationsModal: React.FC<any> = ({
  onClose,
  onNavigate,
}) => (
  <ModalShell
    title="Farm notifications"
    subtitle="Important updates from your service hub."
    onClose={onClose}
  >
    <div className="space-y-3">
      <NotificationRow
        icon={CloudSun}
        title="Weather update"
        detail="Review your weather planning before the next irrigation."
        onClick={() => onNavigate("weather")}
      />
      <NotificationRow
        icon={TrendingUp}
        title="Market reminder"
        detail="Check current mandi prices before selling your harvest."
        onClick={() => onNavigate("mandi")}
      />
      <NotificationRow
        icon={CalendarCheck}
        title="Task reminder"
        detail="A field task is scheduled for tomorrow morning."
        onClick={() => onNavigate("tasks")}
      />
      <NotificationRow
        icon={IndianRupee}
        title="Scheme discovery"
        detail="Review agriculture support options."
        onClick={() => onNavigate("schemes")}
      />
    </div>
  </ModalShell>
);

const NotificationRow: React.FC<any> = ({
  icon: Icon,
  title,
  detail,
  onClick,
}) => (
  <button
    onClick={onClick}
    className="flex w-full items-start gap-3 rounded-2xl border border-slate-200 p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50/40"
  >
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
      <Icon className="h-5 w-5" />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-sm font-black text-slate-900">
        {title}
      </span>
      <span className="mt-1 block text-xs leading-5 text-slate-500">
        {detail}
      </span>
    </span>
    <ChevronRight className="mt-1 h-4 w-4 text-slate-300" />
  </button>
);

const ActivityModal: React.FC<any> = ({
  activity,
  onClose,
}) => (
  <ModalShell
    title="Recent service activity"
    subtitle="Your latest interactions with the service hub."
    onClose={onClose}
    wide
  >
    <div className="space-y-3">
      {activity.map((item: ActivityItem) => (
        <div
          key={item.id}
          className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap justify-between gap-2">
              <p className="text-sm font-black text-slate-900">
                {item.title}
              </p>
              <span className="text-[11px] text-slate-400">
                {item.time}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
          </div>

          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-600">
            {item.status}
          </span>
        </div>
      ))}
    </div>
  </ModalShell>
);

const ProfileModal: React.FC<any> = ({
  savedCount,
  onClose,
  onSettings,
}) => (
  <ModalShell
    title="Farmer profile"
    subtitle="Your service hub preferences."
    onClose={onClose}
  >
    <div className="flex items-center gap-4 rounded-2xl bg-emerald-50 p-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-700 text-lg font-black text-white">
        SK
      </div>
      <div>
        <p className="text-lg font-black text-slate-950">
          Farmer account
        </p>
        <p className="text-xs text-slate-500">
          Personalized agriculture dashboard
        </p>
      </div>
    </div>

    <div className="mt-4 grid grid-cols-2 gap-3">
      <ProfileStat label="Saved services" value={String(savedCount)} />
      <ProfileStat label="Active requests" value="03" />
      <ProfileStat label="Farm tasks" value="12" />
      <ProfileStat label="Alerts" value="04" />
    </div>

    <button
      onClick={onSettings}
      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700"
    >
      <Settings2 className="h-4 w-4" />
      Account settings
    </button>
  </ModalShell>
);

const ProfileStat: React.FC<any> = ({
  label,
  value,
}) => (
  <div className="rounded-xl border border-slate-200 p-3 text-center">
    <p className="text-xl font-black text-slate-950">{value}</p>
    <p className="mt-1 text-[11px] text-slate-500">{label}</p>
  </div>
);

const FieldLabel: React.FC<any> = ({
  label,
  children,
}) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-black text-slate-600">
      {label}
    </span>
    {children}
  </label>
);

const Toast: React.FC<{ message: string }> = ({
  message,
}) => (
  <div className="fixed bottom-5 left-1/2 z-[70] flex max-w-[90vw] -translate-x-1/2 items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-xs font-bold text-white shadow-2xl">
    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
    {message}
  </div>
);

export default ServicesPage;
