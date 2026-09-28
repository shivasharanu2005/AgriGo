import React, { useMemo, useState } from 'react';

import {
  ArrowRight,
  BarChart3,
  BadgeIndianRupee,
  BellRing,
  BrainCircuit,
  Bug,
  CalendarDays,
  CalendarRange,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  CloudRain,
  CloudSun,
  CreditCard,
  Droplets,
  FileCheck,
  FileText,
  Files,
  FlaskConical,
  FolderOpen,
  Gauge,
  GraduationCap,
  HandCoins,
  HeartPulse,
  Languages,
  Leaf,
  LineChart,
  ListTodo,
  Map,
  MapPin,
  Menu,
  Mic,
  Newspaper,
  Package,
  PawPrint,
  PhoneCall,
  Play,
  Search,
  Shield,
  ShieldCheck,
  ShoppingCart,
  Siren,
  Sprout,
  Stethoscope,
  Tractor,
  TrendingUp,
  UserRoundCheck,
  Users,
  Wallet,
  Wheat,
  X,
  Zap,
} from 'lucide-react';

interface HomePageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

type Module = {
  title: string;
  description: string;
  icon: React.ElementType;
  category: string;
};

type WorkflowStep = {
  number: string;
  title: string;
  description: string;
  icon: React.ElementType;
};

const modules: Module[] = [
  {
    title: 'AI Disease Detection',
    description:
      'Upload a crop image and receive guided disease and crop-health insights.',
    icon: Camera,
    category: 'AI & Crop Intelligence',
  },
  {
    title: 'Crop Recommendation',
    description:
      'Find suitable crops using soil, season, water, climate and location.',
    icon: Sprout,
    category: 'AI & Crop Intelligence',
  },
  {
    title: 'Crop Variety Advisor',
    description:
      'Explore crop varieties suitable for your region and growing conditions.',
    icon: Wheat,
    category: 'AI & Crop Intelligence',
  },
  {
    title: 'Yield Prediction',
    description:
      'Estimate potential crop yield using farm and historical information.',
    icon: TrendingUp,
    category: 'AI & Crop Intelligence',
  },
  {
    title: 'Pest Detection',
    description:
      'Identify possible pest problems and get practical management guidance.',
    icon: Bug,
    category: 'AI & Crop Intelligence',
  },
  {
    title: 'Fertilizer Planner',
    description:
      'Plan fertilizer applications according to crop and soil requirements.',
    icon: FlaskConical,
    category: 'AI & Crop Intelligence',
  },
  {
    title: 'Soil Health',
    description:
      'Track soil nutrients, pH and field conditions for better planning.',
    icon: Package,
    category: 'AI & Crop Intelligence',
  },
  {
    title: 'Seed Selection',
    description:
      'Compare seed options according to crop, region and season.',
    icon: Sprout,
    category: 'AI & Crop Intelligence',
  },

  {
    title: 'Smart Irrigation',
    description:
      'Plan irrigation using crop, soil moisture, rainfall and weather data.',
    icon: Droplets,
    category: 'Water & Climate',
  },
  {
    title: 'Water Usage Tracker',
    description:
      'Monitor irrigation consumption and identify water-saving opportunities.',
    icon: Gauge,
    category: 'Water & Climate',
  },
  {
    title: 'Weather Advisory',
    description:
      'Get practical alerts for rain, heat, wind and changing conditions.',
    icon: CloudRain,
    category: 'Water & Climate',
  },
  {
    title: 'Rainfall Tracker',
    description:
      'Monitor rainfall patterns and use them to plan farm activities.',
    icon: CloudRain,
    category: 'Water & Climate',
  },
  {
    title: 'Climate Risk Alerts',
    description:
      'Receive alerts for heat, heavy rain, drought and other farm risks.',
    icon: BellRing,
    category: 'Water & Climate',
  },
  {
    title: 'Farm Weather Forecast',
    description:
      'View location-based forecasts for irrigation, spraying and harvesting.',
    icon: CloudSun,
    category: 'Water & Climate',
  },

  {
    title: 'Mandi Prices',
    description:
      'Track crop prices and compare selling opportunities.',
    icon: TrendingUp,
    category: 'Market & Business',
  },
  {
    title: 'Price Trends',
    description:
      'Understand historical price movement for selected crops.',
    icon: LineChart,
    category: 'Market & Business',
  },
  {
    title: 'Marketplace',
    description:
      'Find agriculture products, inputs and services in one place.',
    icon: ShoppingCart,
    category: 'Market & Business',
  },
  {
    title: 'Equipment Rental',
    description:
      'Find machinery and equipment for seasonal farm operations.',
    icon: Tractor,
    category: 'Market & Business',
  },
  {
    title: 'Farm Finance',
    description:
      'Track income, expenses, investments and farm profitability.',
    icon: Wallet,
    category: 'Market & Business',
  },
  {
    title: 'Profit Calculator',
    description:
      'Estimate production costs, revenue and potential profit.',
    icon: CircleDollarSign,
    category: 'Market & Business',
  },
  {
    title: 'Crop Cost Calculator',
    description:
      'Calculate seed, fertilizer, labour, irrigation and other costs.',
    icon: HandCoins,
    category: 'Market & Business',
  },
  {
    title: 'Digital Payments',
    description:
      'Maintain records of farm-related digital payments and transactions.',
    icon: CreditCard,
    category: 'Market & Business',
  },

  {
    title: 'Government Schemes',
    description:
      'Discover relevant farmer schemes, support programmes and benefits.',
    icon: ShieldCheck,
    category: 'Government & Support',
  },
  {
    title: 'Scheme Eligibility',
    description:
      'Review eligibility requirements for agriculture support programmes.',
    icon: ClipboardCheck,
    category: 'Government & Support',
  },
  {
    title: 'Subsidy Finder',
    description:
      'Explore subsidies related to farming, irrigation and equipment.',
    icon: BadgeIndianRupee,
    category: 'Government & Support',
  },
  {
    title: 'Application Tracker',
    description:
      'Keep track of submitted scheme and support applications.',
    icon: FileCheck,
    category: 'Government & Support',
  },
  {
    title: 'Farmer Documents',
    description:
      'Organize important land, farming and personal documents.',
    icon: Files,
    category: 'Government & Support',
  },
  {
    title: 'Insurance Records',
    description:
      'Maintain crop and agricultural insurance information.',
    icon: Shield,
    category: 'Government & Support',
  },

  {
    title: 'Farm Diary',
    description:
      'Maintain daily farming activities, notes and important reminders.',
    icon: CalendarDays,
    category: 'Farm Management',
  },
  {
    title: 'Crop Calendar',
    description:
      'Plan sowing, irrigation, fertilizer, spraying and harvesting.',
    icon: CalendarRange,
    category: 'Farm Management',
  },
  {
    title: 'Task Planner',
    description:
      'Create and track daily, weekly and seasonal farming tasks.',
    icon: ListTodo,
    category: 'Farm Management',
  },
  {
    title: 'Farm Analytics',
    description:
      'View productivity, expenses, water usage and crop performance.',
    icon: BarChart3,
    category: 'Farm Management',
  },
  {
    title: 'Field Management',
    description:
      'Manage multiple fields, acreage, crops and cultivation records.',
    icon: Map,
    category: 'Farm Management',
  },
  {
    title: 'Harvest Management',
    description:
      'Record harvest quantities, dates, quality and storage information.',
    icon: Wheat,
    category: 'Farm Management',
  },
  {
    title: 'Farm Documents',
    description:
      'Keep important agricultural records organized digitally.',
    icon: FolderOpen,
    category: 'Farm Management',
  },

  {
    title: 'Livestock Care',
    description:
      'Maintain animal records, health information and care reminders.',
    icon: PawPrint,
    category: 'Livestock',
  },
  {
    title: 'Animal Health Records',
    description:
      'Track vaccinations, treatments, diseases and veterinary records.',
    icon: HeartPulse,
    category: 'Livestock',
  },
  {
    title: 'Livestock Feeding',
    description:
      'Manage feeding schedules and animal nutrition records.',
    icon: Wheat,
    category: 'Livestock',
  },
  {
    title: 'Veterinary Services',
    description:
      'Find veterinary and animal-care support services.',
    icon: Stethoscope,
    category: 'Livestock',
  },

  {
    title: 'Learning Hub',
    description:
      'Learn modern farming practices through agriculture resources.',
    icon: GraduationCap,
    category: 'Learning & Community',
  },
  {
    title: 'Farmer Academy',
    description:
      'Access structured lessons, demonstrations and educational videos.',
    icon: FileText,
    category: 'Learning & Community',
  },
  {
    title: 'Farmer Community',
    description:
      'Connect with farmers to exchange experiences and solutions.',
    icon: Users,
    category: 'Learning & Community',
  },
  {
    title: 'Expert Consultation',
    description:
      'Connect with agriculture experts for practical guidance.',
    icon: UserRoundCheck,
    category: 'Learning & Community',
  },
  {
    title: 'Agriculture News',
    description:
      'Stay informed about agriculture, markets and government updates.',
    icon: Newspaper,
    category: 'Learning & Community',
  },

  {
    title: 'Nearby Services',
    description:
      'Find nearby agriculture shops, experts, markets and services.',
    icon: MapPin,
    category: 'Local Services & Safety',
  },
  {
    title: 'Emergency Alerts',
    description:
      'Receive important alerts related to weather, crops and farm risks.',
    icon: Siren,
    category: 'Local Services & Safety',
  },
  {
    title: 'Voice Assistant',
    description:
      'Use voice-based assistance to access agriculture information.',
    icon: Mic,
    category: 'Local Services & Safety',
  },
  {
    title: 'Regional Languages',
    description:
      'Access agriculture information in supported Indian languages.',
    icon: Languages,
    category: 'Local Services & Safety',
  },
];

const workflow: WorkflowStep[] = [
  {
    number: '01',
    title: 'Create your farm profile',
    description:
      'Add your farm location, land area, crops, soil, irrigation method and essential information.',
    icon: Users,
  },
  {
    number: '02',
    title: 'Map your fields',
    description:
      'Organize individual fields with acreage, crop type, soil information and cultivation history.',
    icon: Map,
  },
  {
    number: '03',
    title: 'Understand your soil',
    description:
      'Record soil health, nutrients and pH so recommendations can be more relevant to your farm.',
    icon: Package,
  },
  {
    number: '04',
    title: 'Choose the right crop',
    description:
      'Use crop and variety recommendations based on season, soil, water, climate and location.',
    icon: Sprout,
  },
  {
    number: '05',
    title: 'Plan cultivation',
    description:
      'Create crop calendars, fertilizer plans, irrigation schedules and farming tasks.',
    icon: CalendarDays,
  },
  {
    number: '06',
    title: 'Monitor weather',
    description:
      'Track forecasts, rainfall, heat, wind and potential climate-related farm risks.',
    icon: CloudRain,
  },
  {
    number: '07',
    title: 'Protect your crops',
    description:
      'Upload crop images to identify possible diseases and pests and review guided information.',
    icon: Camera,
  },
  {
    number: '08',
    title: 'Manage irrigation',
    description:
      'Monitor water usage and coordinate irrigation with crop, soil and weather conditions.',
    icon: Droplets,
  },
  {
    number: '09',
    title: 'Track farm activities',
    description:
      'Record spraying, fertilizer, irrigation, labour and other important field activities.',
    icon: ClipboardCheck,
  },
  {
    number: '10',
    title: 'Track farm finances',
    description:
      'Record income and expenses to understand production costs and profitability.',
    icon: Wallet,
  },
  {
    number: '11',
    title: 'Check markets',
    description:
      'Review mandi prices and market information before making selling decisions.',
    icon: TrendingUp,
  },
  {
    number: '12',
    title: 'Access schemes & support',
    description:
      'Explore government schemes, subsidies, insurance, equipment and nearby services.',
    icon: ShieldCheck,
  },
  {
    number: '13',
    title: 'Learn & connect',
    description:
      'Access learning resources, agriculture news, experts and farmer community support.',
    icon: GraduationCap,
  },
  {
    number: '14',
    title: 'Manage livestock',
    description:
      'Maintain animal health, feeding, vaccination and veterinary records.',
    icon: PawPrint,
  },
  {
    number: '15',
    title: 'Analyze performance',
    description:
      'Review crop performance, water usage, expenses, productivity and farm activity.',
    icon: BarChart3,
  },
  {
    number: '16',
    title: 'Improve the next season',
    description:
      'Use historical farm records and performance insights to plan the next crop cycle.',
    icon: LineChart,
  },
];

const categories = [
  'All',
  'AI & Crop Intelligence',
  'Water & Climate',
  'Market & Business',
  'Government & Support',
  'Farm Management',
  'Livestock',
  'Learning & Community',
  'Local Services & Safety',
];

const problems = [
  {
    icon: CloudRain,
    problem: 'Unpredictable weather',
    solution:
      'Weather forecasts, rainfall tracking and risk alerts help farmers plan field activities.',
  },
  {
    icon: Bug,
    problem: 'Crop disease & pest risk',
    solution:
      'Image-based crop health assistance helps farmers identify possible problems earlier.',
  },
  {
    icon: Droplets,
    problem: 'Water wastage',
    solution:
      'Irrigation planning and water tracking help farmers make more informed water decisions.',
  },
  {
    icon: TrendingUp,
    problem: 'Uncertain market prices',
    solution:
      'Mandi prices and price trends bring market information into the farm workflow.',
  },
  {
    icon: BadgeIndianRupee,
    problem: 'Scattered schemes & subsidies',
    solution:
      'Government support information is organized so farmers can discover relevant programmes.',
  },
  {
    icon: Wallet,
    problem: 'Unclear farm profitability',
    solution:
      'Income, expense and crop-cost tracking gives farmers a clearer financial picture.',
  },
];

export default function HomePage({
  onGetStarted,
  onSignIn,
}: HomePageProps) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showAllWorkflow, setShowAllWorkflow] = useState(false);

  const filteredModules = useMemo(() => {
    const query = search.trim().toLowerCase();

    return modules.filter((module) => {
      const matchesCategory =
        activeCategory === 'All' || module.category === activeCategory;

      const matchesSearch =
        !query ||
        `${module.title} ${module.description} ${module.category}`
          .toLowerCase()
          .includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  const visibleWorkflow = showAllWorkflow
    ? workflow
    : workflow.slice(0, 8);

  const scrollTo = (id: string) => {
    setMobileMenu(false);

    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f5faf6] text-slate-800">
      <style>{`
        html {
          scroll-behavior: smooth;
        }

        .agrigo-grid {
          background-image:
            linear-gradient(rgba(21, 128, 61, .045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(21, 128, 61, .045) 1px, transparent 1px);
          background-size: 42px 42px;
        }

        .agrigo-glass {
          background: rgba(255, 255, 255, .82);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
          box-shadow: 0 30px 90px rgba(15, 23, 42, .10);
        }

        .agrigo-card {
          transition:
            transform .28s ease,
            box-shadow .28s ease,
            border-color .28s ease;
        }

        .agrigo-card:hover {
          transform: translateY(-6px);
          border-color: rgba(34, 197, 94, .35);
          box-shadow: 0 20px 55px rgba(15, 23, 42, .09);
        }

        .agrigo-photo {
          transition: transform .7s ease;
        }

        .agrigo-photo-wrap:hover .agrigo-photo {
          transform: scale(1.045);
        }

        .agrigo-no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .agrigo-no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .agrigo-shine {
          position: relative;
          overflow: hidden;
        }

        .agrigo-shine::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 70%;
          height: 100%;
          transform: skewX(-18deg);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,.20),
            transparent
          );
          transition: left .7s ease;
        }

        .agrigo-shine:hover::after {
          left: 140%;
        }
      `}</style>

      {/* NAVBAR */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => scrollTo('home')}
            className="flex items-center gap-3 text-left"
          >
            <img
              src="/assets/AgriGo logo.png"
              alt="AgriGo"
              className="h-11 w-12 rounded-2xl object-contain"
            />

            <span>
              <strong className="block text-xl font-black tracking-tight text-green-900">
                AgriGo
              </strong>

              <small className="block text-[9px] font-bold uppercase tracking-[.20em] text-slate-500">
                Smart Digital Agriculture
              </small>
            </span>
          </button>

          <nav className="hidden items-center gap-7 lg:flex">
            <button
              onClick={() => scrollTo('home')}
              className="text-sm font-bold text-green-700"
            >
              Home
            </button>

            <button
              onClick={() => scrollTo('problems')}
              className="text-sm font-semibold text-slate-600 hover:text-green-700"
            >
              Problems
            </button>

            <button
              onClick={() => scrollTo('solutions')}
              className="text-sm font-semibold text-slate-600 hover:text-green-700"
            >
              Solutions
            </button>

            <button
              onClick={() => scrollTo('how-it-works')}
              className="text-sm font-semibold text-slate-600 hover:text-green-700"
            >
              How It Works
            </button>

            <button
              onClick={() => scrollTo('features')}
              className="text-sm font-semibold text-slate-600 hover:text-green-700"
            >
              Features
            </button>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              onClick={onSignIn}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-green-300 hover:text-green-700"
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={onGetStarted}
              className="rounded-xl bg-green-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-green-900/10 transition hover:bg-green-800"
            >
              Get Started
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenu((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileMenu && (
          <div className="mx-4 mb-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl md:hidden">
            <div className="flex flex-col gap-2">
              {[
                ['home', 'Home'],
                ['problems', 'Problems'],
                ['solutions', 'Solutions'],
                ['how-it-works', 'How It Works'],
                ['features', 'Features'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => scrollTo(id)}
                  className="rounded-xl px-4 py-3 text-left font-semibold hover:bg-green-50"
                >
                  {label}
                </button>
              ))}

              <button
                type="button"
                onClick={() => {
                  setMobileMenu(false);
                  onGetStarted();
                }}
                className="mt-2 rounded-xl bg-green-700 px-5 py-3 font-bold text-white"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* HERO */}
        <section
          id="home"
          className="agrigo-grid relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 pb-20 pt-36 lg:pb-28 lg:pt-44"
        >
          <div className="pointer-events-none absolute -right-32 top-20 h-96 w-96 rounded-full bg-green-200/30 blur-3xl" />
          <div className="pointer-events-none absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-emerald-100/40 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_.95fr] lg:gap-16 lg:px-8">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-200 bg-white/90 px-4 py-2 text-xs font-bold text-green-800 shadow-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-green-600 shadow-[0_0_0_5px_rgba(22,163,74,.10)]" />
                AI-assisted digital agriculture platform
              </div>

              <h1 className="max-w-4xl text-5xl font-black leading-[.97] tracking-[-.045em] text-slate-950 sm:text-6xl lg:text-[76px]">
                One platform.
                <br />
                <span className="text-green-700">Every farm.</span>
                <br />
                Better decisions.
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">
                AgriGo connects crop intelligence, soil, weather, irrigation,
                markets, government support, finance and farm management into
                one practical digital agriculture experience.
              </p>

              <div className="mt-8 flex max-w-2xl items-center rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/5">
                <Search
                  className="ml-3 shrink-0 text-slate-400"
                  size={20}
                />

                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    if (event.target.value) {
                      setActiveCategory('All');
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      scrollTo('features');
                    }
                  }}
                  placeholder="Search crop, irrigation, schemes, mandi..."
                  className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none"
                />

                <button
                  type="button"
                  onClick={() => scrollTo('features')}
                  className="hidden items-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-800 sm:flex"
                >
                  Explore
                  <ArrowRight size={16} />
                </button>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onGetStarted}
                  className="agrigo-shine inline-flex items-center gap-2 rounded-xl bg-green-700 px-6 py-3.5 font-bold text-white shadow-xl shadow-green-900/10 transition hover:bg-green-800"
                >
                  Start your farm journey
                  <ArrowRight size={18} />
                </button>

                <button
                  type="button"
                  onClick={onSignIn}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 font-bold text-slate-700 transition hover:border-green-300 hover:text-green-700"
                >
                  <Mic size={18} />
                  Ask AgriGo
                </button>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-slate-500">
                <span>
                  <CheckCircle2
                    className="mr-2 inline text-green-600"
                    size={16}
                  />
                  Farmer-focused
                </span>

                <span>
                  <CheckCircle2
                    className="mr-2 inline text-green-600"
                    size={16}
                  />
                  Regional-language ready
                </span>

                <span>
                  <CheckCircle2
                    className="mr-2 inline text-green-600"
                    size={16}
                  />
                  Connected farm records
                </span>
              </div>
            </div>

            {/* REAL PHOTO + DASHBOARD */}
            <div className="relative">
              <div className="agrigo-photo-wrap relative overflow-hidden rounded-[34px] border border-white bg-white p-3 shadow-2xl shadow-green-950/10">
                <img
                  src="/assets/agri/home/farmer-field.jpg"
                  alt="Farmer working in an agricultural field"
                  className="agrigo-photo h-[440px] w-full rounded-[26px] object-cover"
                />

                <div className="absolute inset-x-7 bottom-7 rounded-3xl border border-white/50 bg-slate-950/90 p-5 text-white backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[.2em] text-green-300">
                        Today's farm intelligence
                      </div>

                      <div className="mt-1 text-xl font-black">
                        Farm overview
                      </div>
                    </div>

                    <div className="rounded-xl bg-green-500/15 p-3">
                      <BrainCircuit
                        className="text-green-300"
                        size={25}
                      />
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <div className="rounded-2xl bg-white/10 p-3">
                      <Leaf size={18} className="text-green-300" />
                      <p className="mt-2 text-[10px] text-slate-400">
                        Crop health
                      </p>
                      <strong className="text-lg">87%</strong>
                    </div>

                    <div className="rounded-2xl bg-white/10 p-3">
                      <Droplets size={18} className="text-sky-300" />
                      <p className="mt-2 text-[10px] text-slate-400">
                        Soil moisture
                      </p>
                      <strong className="text-lg">62%</strong>
                    </div>

                    <div className="rounded-2xl bg-white/10 p-3">
                      <TrendingUp size={18} className="text-amber-300" />
                      <p className="mt-2 text-[10px] text-slate-400">
                        Farm score
                      </p>
                      <strong className="text-lg">8.7</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -left-7 top-10 hidden rounded-2xl border border-green-100 bg-white p-4 shadow-xl sm:block">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-green-50 p-3">
                    <CloudRain className="text-green-700" size={21} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Weather
                    </p>
                    <strong className="text-sm">Rain advisory</strong>
                  </div>
                </div>
              </div>

              <div className="absolute -right-6 bottom-20 hidden rounded-2xl border border-sky-100 bg-white p-4 shadow-xl sm:block">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-sky-50 p-3">
                    <Droplets className="text-sky-700" size={21} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Irrigation
                    </p>
                    <strong className="text-sm">Water plan ready</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST STRIP */}
        <section className="border-b border-slate-100 bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-slate-100 px-4 sm:grid-cols-4 sm:px-6 lg:px-8">
            {[
              ['40+', 'Agriculture modules'],
              ['8', 'Connected categories'],
              ['16', 'Farm workflow stages'],
              ['1', 'Unified platform'],
            ].map(([number, label]) => (
              <div
                key={label}
                className="px-4 py-7 text-center sm:px-6"
              >
                <strong className="text-2xl font-black text-green-800 sm:text-3xl">
                  {number}
                </strong>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* REAL PROBLEMS */}
        <section
          id="problems"
          className="bg-white py-20 lg:py-24"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-end gap-8 lg:grid-cols-[.9fr_1.1fr]">
              <div>
                <div className="text-xs font-black uppercase tracking-[.18em] text-green-700">
                  Real farming challenges
                </div>

                <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                  Agriculture problems
                  <span className="text-green-700"> need connected solutions.</span>
                </h2>
              </div>

              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Farmers often need information from multiple places before
                making one decision. AgriGo brings the relevant farm,
                weather, market and support information into a connected
                workflow.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {problems.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.problem}
                    className="agrigo-card rounded-3xl border border-slate-200 bg-[#fbfdfb] p-6"
                  >
                    <div className="flex items-start justify-between gap-5">
                      <div className="rounded-2xl bg-green-50 p-3">
                        <Icon
                          size={25}
                          className="text-green-700"
                        />
                      </div>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-slate-500">
                        Challenge
                      </span>
                    </div>

                    <h3 className="mt-6 text-lg font-black text-slate-900">
                      {item.problem}
                    </h3>

                    <div className="my-4 h-px bg-slate-100" />

                    <div className="flex gap-3">
                      <Check
                        size={17}
                        className="mt-1 shrink-0 text-green-600"
                      />
                      <p className="text-sm leading-6 text-slate-500">
                        {item.solution}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SOLUTION */}
        <section
          id="solutions"
          className="overflow-hidden bg-[#f3f8f3] py-20 lg:py-24"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-[.95fr_1.05fr]">
              <div className="agrigo-photo-wrap relative overflow-hidden rounded-[34px] bg-slate-900 p-2 shadow-2xl">
                <img
                  src="/assets/agri/home/farm-crop.jpg"
                  alt="Agricultural crop field"
                  className="agrigo-photo h-[500px] w-full rounded-[28px] object-cover opacity-95"
                />

                <div className="absolute left-7 top-7 rounded-2xl bg-white/95 p-4 shadow-xl backdrop-blur">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-green-50 p-3">
                      <Leaf
                        className="text-green-700"
                        size={21}
                      />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Crop intelligence
                      </p>
                      <strong className="text-sm text-slate-900">
                        Connected field data
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-7 left-7 right-7 rounded-3xl bg-slate-950/90 p-5 text-white backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <BrainCircuit
                      className="text-green-400"
                      size={23}
                    />
                    <div>
                      <strong className="text-sm">
                        Decision support
                      </strong>
                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        Farm information → insights → action → records
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs font-black uppercase tracking-[.18em] text-green-700">
                  The AgriGo approach
                </div>

                <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                  From scattered information to
                  <span className="text-green-700">
                    {' '}
                    one farm intelligence system.
                  </span>
                </h2>

                <p className="mt-6 text-lg leading-8 text-slate-600">
                  Instead of treating disease, irrigation, weather, market,
                  finance and government services as separate problems, AgriGo
                  connects them around the farmer's actual farm.
                </p>

                <div className="mt-8 space-y-4">
                  {[
                    [
                      '01',
                      'Collect',
                      'Farm, field, crop, soil and activity information.',
                    ],
                    [
                      '02',
                      'Understand',
                      'Combine relevant agriculture data and user records.',
                    ],
                    [
                      '03',
                      'Recommend',
                      'Provide practical, AI-assisted decision support.',
                    ],
                    [
                      '04',
                      'Act',
                      'Turn recommendations into irrigation, tasks, finance and market actions.',
                    ],
                    [
                      '05',
                      'Learn',
                      'Use farm history to improve future planning.',
                    ],
                  ].map(([number, title, description]) => (
                    <div
                      key={number}
                      className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-700 text-xs font-black text-white">
                        {number}
                      </div>

                      <div>
                        <strong className="text-sm font-black text-slate-900">
                          {title}
                        </strong>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI SECTION */}
        <section className="bg-slate-950 py-20 text-white lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-[1fr_1fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-green-400/20 bg-green-400/10 px-4 py-2 text-xs font-bold text-green-300">
                  <BrainCircuit size={15} />
                  AI-assisted agriculture
                </div>

                <h2 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
                  Help farmers move from
                  <span className="text-green-400">
                    {' '}
                    observation to action.
                  </span>
                </h2>

                <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">
                  AgriGo can connect crop images, farm information, soil
                  conditions and environmental data to provide decision-support
                  features inside the farmer's workflow.
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {[
                    'Crop health assistance',
                    'Crop recommendation',
                    'Yield estimation',
                    'Pest identification',
                    'Weather-aware planning',
                    'Smart irrigation support',
                  ].map((text) => (
                    <div
                      key={text}
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
                    >
                      <CheckCircle2
                        size={17}
                        className="text-green-400"
                      />
                      <span className="text-sm font-semibold text-slate-300">
                        {text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[32px] border border-white/10 bg-white/5 p-4">
                <div className="overflow-hidden rounded-[25px] bg-white">
                  <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        AI crop health
                      </p>
                      <strong className="text-slate-900">
                        Field inspection
                      </strong>
                    </div>

                    <div className="rounded-xl bg-green-50 p-2">
                      <Camera
                        className="text-green-700"
                        size={19}
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <img
                      src="/assets/agri/home/crop-leaf.jpg"
                      alt="Crop leaf inspection"
                      className="h-[260px] w-full object-cover"
                    />

                    <div className="absolute bottom-4 left-4 rounded-2xl border border-white/30 bg-slate-950/85 px-4 py-3 text-white backdrop-blur">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                        Example result
                      </p>
                      <strong className="mt-1 block text-sm">
                        Crop health assessment
                      </strong>
                      <p className="mt-1 text-xs text-slate-400">
                        Confidence and guidance should be reviewed before
                        treatment decisions.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 p-4">
                    <div className="rounded-2xl bg-green-50 p-4">
                      <p className="text-[10px] font-bold text-green-700">
                        Crop
                      </p>
                      <strong className="mt-1 block text-sm text-green-950">
                        Tomato
                      </strong>
                    </div>

                    <div className="rounded-2xl bg-amber-50 p-4">
                      <p className="text-[10px] font-bold text-amber-700">
                        Status
                      </p>
                      <strong className="mt-1 block text-sm text-amber-950">
                        Review
                      </strong>
                    </div>

                    <div className="rounded-2xl bg-sky-50 p-4">
                      <p className="text-[10px] font-bold text-sky-700">
                        Action
                      </p>
                      <strong className="mt-1 block text-sm text-sky-950">
                        Inspect
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* IRRIGATION */}
        <section className="bg-white py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-[.9fr_1.1fr]">
              <div className="agrigo-photo-wrap overflow-hidden rounded-[34px] shadow-xl">
                <img
                  src="/assets/agri/home/irrigation.jpg"
                  alt="Agricultural irrigation system"
                  className="agrigo-photo h-[460px] w-full object-cover"
                />
              </div>

              <div>
                <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[.18em] text-sky-700">
                  <Droplets size={17} />
                  Water management
                </div>

                <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                  Make irrigation a
                  <span className="text-sky-700">
                    {' '}
                    planned farm activity.
                  </span>
                </h2>

                <p className="mt-6 text-lg leading-8 text-slate-600">
                  AgriGo's irrigation workflow can combine crop stage, field
                  information, rainfall, weather and water usage records to
                  help farmers plan irrigation more deliberately.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {[
                    ['Water usage', 'Track irrigation consumption'],
                    ['Weather', 'Consider rainfall conditions'],
                    ['Crop stage', 'Plan around crop requirements'],
                    ['Field records', 'Maintain irrigation history'],
                  ].map(([title, text]) => (
                    <div
                      key={title}
                      className="rounded-2xl border border-slate-200 bg-[#fbfdfb] p-5"
                    >
                      <strong className="text-sm font-black">
                        {title}
                      </strong>
                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        {text}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={onGetStarted}
                  className="mt-8 inline-flex items-center gap-2 rounded-xl bg-green-700 px-5 py-3 font-bold text-white transition hover:bg-green-800"
                >
                  Build your farm plan
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* MARKET + FINANCE */}
        <section className="bg-[#f3f8f3] py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="text-xs font-black uppercase tracking-[.18em] text-green-700">
                Farm economics
              </div>

              <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                Understand the farm
                <span className="text-green-700">
                  {' '}
                  beyond the field.
                </span>
              </h2>

              <p className="mt-5 text-lg leading-8 text-slate-600">
                Farming decisions are also business decisions. AgriGo connects
                production costs, income, market information and support
                services.
              </p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              <div className="agrigo-card overflow-hidden rounded-3xl border border-slate-200 bg-white">
                <div className="h-48 overflow-hidden">
                  <img
                    src="/assets/agri/home/market.jpg"
                    alt="Agricultural produce market"
                    className="agrigo-photo h-full w-full object-cover"
                  />
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="text-green-700" size={22} />
                    <h3 className="font-black">Market intelligence</h3>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    Mandi prices and price trends can help farmers understand
                    available market information before selling.
                  </p>
                </div>
              </div>

              <div className="agrigo-card rounded-3xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <div className="rounded-2xl bg-green-50 p-3">
                    <Wallet
                      className="text-green-700"
                      size={25}
                    />
                  </div>

                  <span className="rounded-full bg-green-50 px-3 py-1 text-[10px] font-black text-green-700">
                    FARM FINANCE
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-black">
                  Farm profitability
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Record expenses, income, crop costs and revenue to maintain a
                  clearer financial picture.
                </p>

                <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Production cost</span>
                    <span>Current cycle</span>
                  </div>

                  <strong className="mt-2 block text-3xl">
                    ₹42,800
                  </strong>

                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[68%] rounded-full bg-green-500" />
                  </div>

                  <p className="mt-2 text-[10px] text-slate-500">
                    Example dashboard value
                  </p>
                </div>
              </div>

              <div className="agrigo-card rounded-3xl border border-slate-200 bg-white p-6">
                <div className="rounded-2xl bg-amber-50 p-3 w-fit">
                  <ShieldCheck
                    className="text-amber-700"
                    size={25}
                  />
                </div>

                <h3 className="mt-6 text-xl font-black">
                  Government support
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Organize scheme information, eligibility, applications,
                  documents and insurance records.
                </p>

                <div className="mt-6 space-y-3">
                  {[
                    'Scheme discovery',
                    'Eligibility information',
                    'Application tracking',
                    'Insurance records',
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-600"
                    >
                      <CheckCircle2
                        size={16}
                        className="text-green-600"
                      />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WORKFLOW */}
        <section
          id="how-it-works"
          className="border-y border-slate-100 bg-white py-20 lg:py-24"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr]">
              <div className="lg:sticky lg:top-28 lg:self-start">
                <div className="text-xs font-black uppercase tracking-[.18em] text-green-700">
                  Complete farmer journey
                </div>

                <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                  From farm profile to
                  <span className="text-green-700">
                    {' '}
                    next-season planning.
                  </span>
                </h2>

                <p className="mt-5 text-lg leading-8 text-slate-600">
                  AgriGo is designed as a continuous workflow instead of a
                  collection of disconnected tools.
                </p>

                <button
                  type="button"
                  onClick={onGetStarted}
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-green-700 px-5 py-3 font-bold text-white transition hover:bg-green-800"
                >
                  Create farm profile
                  <ArrowRight size={16} />
                </button>

                <div className="mt-8 hidden overflow-hidden rounded-3xl border border-slate-200 lg:block">
                  <img
                    src="/assets/agri/home/farmer-mobile.jpg"
                    alt="Farmer using a mobile phone in a field"
                    className="h-60 w-full object-cover"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {visibleWorkflow.map((step) => {
                  const Icon = step.icon;

                  return (
                    <div
                      key={step.number}
                      className="agrigo-card flex gap-5 rounded-3xl border border-slate-200 bg-[#fbfdfb] p-6"
                    >
                      <div className="shrink-0">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-700 text-white shadow-lg shadow-green-900/10">
                          <Icon size={24} />
                        </div>

                        <div className="mt-2 text-center text-[10px] font-black tracking-widest text-green-700">
                          {step.number}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-black text-slate-900">
                          {step.title}
                        </h3>

                        <p className="mt-2 text-sm leading-7 text-slate-500">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setShowAllWorkflow((value) => !value)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-green-200 bg-green-50 py-4 text-sm font-black text-green-800 transition hover:bg-green-100"
                >
                  {showAllWorkflow
                    ? 'Show fewer steps'
                    : 'View complete 16-step workflow'}

                  <ChevronDown
                    size={17}
                    className={showAllWorkflow ? 'rotate-180' : ''}
                  />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section
          id="features"
          className="bg-[#f5faf6] py-20 lg:py-24"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
              <div className="max-w-3xl">
                <div className="text-xs font-black uppercase tracking-[.18em] text-green-700">
                  Complete agriculture ecosystem
                </div>

                <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                  Everything connected around
                  <span className="text-green-700">
                    {' '}
                    the farm.
                  </span>
                </h2>

                <p className="mt-5 text-lg leading-8 text-slate-600">
                  Explore the AgriGo services that support crop intelligence,
                  water management, business, government support and everyday
                  farm operations.
                </p>
              </div>

              <div className="rounded-2xl border border-green-100 bg-white px-5 py-4 shadow-sm">
                <strong className="block text-2xl font-black text-green-800">
                  {filteredModules.length}
                </strong>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  services shown
                </span>
              </div>
            </div>

            {/* SEARCH */}
            <div className="mt-9 flex items-center rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
              <Search
                className="ml-3 shrink-0 text-slate-400"
                size={20}
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search all AgriGo features..."
                className="min-w-0 flex-1 px-3 py-3 text-sm outline-none"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="mr-2 rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                  aria-label="Clear search"
                >
                  <X size={17} />
                </button>
              )}
            </div>

            {/* CATEGORY FILTER */}
            <div className="agrigo-no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => {
                const active = category === activeCategory;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`whitespace-nowrap rounded-full px-4 py-2.5 text-xs font-bold transition ${
                      active
                        ? 'bg-green-700 text-white shadow-lg shadow-green-900/10'
                        : 'border border-slate-200 bg-white text-slate-600 hover:border-green-200 hover:text-green-700'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            {/* FEATURE CARDS */}
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {filteredModules.map((module) => {
                const Icon = module.icon;

                return (
                  <div
                    key={`${module.category}-${module.title}`}
                    className="agrigo-card rounded-2xl border border-slate-200 bg-white p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="rounded-xl bg-green-50 p-3">
                        <Icon
                          className="text-green-700"
                          size={23}
                        />
                      </div>

                      <ChevronRight
                        size={17}
                        className="text-slate-300"
                      />
                    </div>

                    <span className="mt-4 inline-block text-[9px] font-black uppercase tracking-wider text-green-700">
                      {module.category}
                    </span>

                    <h3 className="mt-2 font-black text-slate-900">
                      {module.title}
                    </h3>

                    <p className="mt-2 text-xs leading-6 text-slate-500">
                      {module.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {filteredModules.length === 0 && (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-16 text-center">
                <Search
                  className="mx-auto text-slate-300"
                  size={36}
                />
                <h3 className="mt-4 font-black text-slate-900">
                  No agriculture service found
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Try searching for crop, water, finance, market or schemes.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setActiveCategory('All');
                  }}
                  className="mt-5 rounded-xl bg-green-700 px-5 py-3 text-sm font-bold text-white"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ACCESSIBILITY */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-[36px] bg-green-950 text-white">
              <div className="grid lg:grid-cols-[1.05fr_.95fr]">
                <div className="p-8 sm:p-12 lg:p-14">
                  <div className="flex items-center gap-3 text-green-300">
                    <Languages size={20} />
                    <span className="text-xs font-black uppercase tracking-[.18em]">
                      Designed for accessibility
                    </span>
                  </div>

                  <h2 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
                    Agriculture technology should work for
                    <span className="text-green-300">
                      {' '}
                      real farmers.
                    </span>
                  </h2>

                  <p className="mt-6 max-w-xl text-lg leading-8 text-green-100/70">
                    AgriGo can be designed around simpler navigation, regional
                    language support, voice interaction and mobile-first
                    experiences for farmers with different levels of digital
                    familiarity.
                  </p>

                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    {[
                      [Mic, 'Voice interaction'],
                      [Languages, 'Regional languages'],
                      [PhoneCall, 'Simple support access'],
                      [SmartphoneIcon, 'Mobile-first design'],
                    ].map(([Icon, label]) => {
                      const Component = Icon as React.ElementType;

                      return (
                        <div
                          key={label as string}
                          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
                        >
                          <Component
                            size={20}
                            className="text-green-300"
                          />
                          <span className="text-sm font-semibold text-green-50">
                            {label as string}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="relative min-h-[350px]">
                  <img
                    src="/assets/agri/home/farmer-mobile.jpg"
                    alt="Farmer using a mobile phone"
                    className="absolute inset-0 h-full w-full object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-r from-green-950 via-green-950/30 to-transparent" />

                  <div className="absolute bottom-7 left-7 right-7 rounded-3xl border border-white/20 bg-slate-950/70 p-5 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                      <Mic className="text-green-300" size={24} />
                      <div>
                        <strong className="text-sm">
                          “Ask AgriGo”
                        </strong>
                        <p className="mt-1 text-xs text-slate-400">
                          Designed for simpler access to agriculture services.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#f3f8f3] py-20">
          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-700 text-white shadow-xl shadow-green-900/10">
              <Sprout size={30} />
            </div>

            <h2 className="mt-7 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Build a smarter digital farm journey.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Create your AgriGo farm profile and bring your crop,
              field, weather, irrigation, market, finance and support
              information together.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onGetStarted}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-7 py-4 font-black text-white shadow-xl shadow-green-900/10 transition hover:bg-green-800"
              >
                Create your farm profile
                <ArrowRight size={18} />
              </button>

              <button
                type="button"
                onClick={onSignIn}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-4 font-black text-slate-700 transition hover:border-green-300 hover:text-green-700"
              >
                Sign in to AgriGo
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_.7fr_.7fr_.8fr]">
            <div>
              <div className="flex items-center gap-3">
                <img
                  src="/assets/AgriGo logo.png"
                  alt="AgriGo"
                  className="h-12 w-14 rounded-xl object-contain"
                />

                <div>
                  <strong className="text-xl font-black">
                    AgriGo
                  </strong>

                  <p className="text-xs text-slate-500">
                    Smart Digital Agriculture
                  </p>
                </div>
              </div>

              <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
                A connected agriculture ecosystem for crop intelligence,
                farm management, market information, government support,
                finance and farmer services.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  'AI-assisted',
                  'Farmer-focused',
                  'Mobile-first',
                  'Connected',
                ].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold text-slate-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black">Platform</h3>

              <div className="mt-5 space-y-3 text-sm text-slate-400">
                <button
                  onClick={() => scrollTo('solutions')}
                  className="block hover:text-green-300"
                >
                  Solutions
                </button>

                <button
                  onClick={() => scrollTo('features')}
                  className="block hover:text-green-300"
                >
                  Features
                </button>

                <button
                  onClick={() => scrollTo('how-it-works')}
                  className="block hover:text-green-300"
                >
                  How It Works
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black">Services</h3>

              <div className="mt-5 space-y-3 text-sm text-slate-400">
                <p>Crop Intelligence</p>
                <p>Smart Irrigation</p>
                <p>Mandi Prices</p>
                <p>Government Schemes</p>
                <p>Farm Finance</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black">Get started</h3>

              <p className="mt-5 text-sm leading-6 text-slate-400">
                Create a farm profile to start using the AgriGo ecosystem.
              </p>

              <button
                type="button"
                onClick={onGetStarted}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-black text-white transition hover:bg-green-500"
              >
                Get Started
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div className="mt-12 flex flex-col justify-between gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row">
            <p>© {new Date().getFullYear()} AgriGo. All rights reserved.</p>

            <p>
              Built for a connected and farmer-focused digital agriculture
              experience.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/*
  Small local icon used only for the accessibility card.
  Keeping it here avoids adding another dependency.
*/
function SmartphoneIcon({
  size = 20,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="9" y1="18" x2="15" y2="18" />
    </svg>
  );
}