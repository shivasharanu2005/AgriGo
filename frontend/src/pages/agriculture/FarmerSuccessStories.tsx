
import React, { useMemo, useState } from "react";
import {
  Award,
  BadgeCheck,
  Calendar,
  ChevronRight,
  Clock,
  Eye,
  Filter,
  IndianRupee,
  Leaf,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  Users,
  X,
  Upload,
  CheckCircle2,
  Sprout,
  BarChart3,
  Droplets,
  Wallet,
  Heart,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type AchievementType =
  | "Innovation"
  | "Organic Farming"
  | "High Productivity"
  | "Technology"
  | "Water Saving"
  | "Women Farmer"
  | "Entrepreneurship"
  | "Sustainable Farming";

interface FarmerAchievement {
  id: number;
  farmerName: string;
  image: string;
  village: string;
  district: string;
  state: string;
  crop: string;
  achievementTitle: string;
  achievementType: AchievementType;
  description: string;
  challenge: string;
  solution: string;
  result: string;
  advice: string;

  landArea: number;
  experienceYears: number;

  previousIncome: number;
  currentIncome: number;
  incomeGrowth: number;

  productivityImprovement: number;
  waterSaving: number;
  costReduction: number;

  awardName?: string;
  awardYear?: number;
  recognitionAuthority?: string;

  isVerified: boolean;
  isFeatured: boolean;
  isPublished: boolean;

  views: number;
  likes: number;

  createdAt: string;
}

/* =========================================================
   DEMO DATA
   Replace this with your Django API response.
========================================================= */

const INITIAL_ACHIEVEMENTS: FarmerAchievement[] = [
  {
    id: 1,
    farmerName: "Ramesh Gowda",
    image:
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=85",
    village: "Hassan",
    district: "Hassan",
    state: "Karnataka",
    crop: "Tomato",
    achievementTitle: "Turning Tomato Farming into a High-Income Business",
    achievementType: "High Productivity",
    description:
      "Ramesh transformed his traditional tomato farm by adopting drip irrigation, protected cultivation and data-driven crop monitoring.",
    challenge:
      "Rising input costs, irregular rainfall and tomato price fluctuations were reducing his farm income.",
    solution:
      "He adopted drip irrigation, mulching, soil testing and planned harvesting based on market demand.",
    result:
      "Production increased significantly while water usage and unnecessary input costs reduced.",
    advice:
      "Start with soil testing and water management before investing in expensive technologies.",
    landArea: 5.5,
    experienceYears: 14,
    previousIncome: 420000,
    currentIncome: 780000,
    incomeGrowth: 85,
    productivityImprovement: 42,
    waterSaving: 38,
    costReduction: 21,
    awardName: "Best Progressive Farmer",
    awardYear: 2025,
    recognitionAuthority: "District Agriculture Department",
    isVerified: true,
    isFeatured: true,
    isPublished: true,
    views: 2840,
    likes: 384,
    createdAt: "2026-08-24",
  },
  {
    id: 2,
    farmerName: "Lakshmi Devi",
    image:
      "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=900&q=85",
    village: "Mysuru",
    district: "Mysuru",
    state: "Karnataka",
    crop: "Rice",
    achievementTitle: "A Woman Farmer Leading Sustainable Rice Farming",
    achievementType: "Women Farmer",
    description:
      "Lakshmi introduced sustainable rice cultivation methods and reduced dependence on chemical inputs.",
    challenge:
      "High fertilizer costs and declining soil quality were affecting farm productivity.",
    solution:
      "She introduced organic manure, crop rotation and improved water management practices.",
    result:
      "Her farm became more sustainable while maintaining profitable production.",
    advice:
      "Farm knowledge and proper planning are as important as investment.",
    landArea: 7,
    experienceYears: 18,
    previousIncome: 360000,
    currentIncome: 690000,
    incomeGrowth: 92,
    productivityImprovement: 31,
    waterSaving: 44,
    costReduction: 29,
    awardName: "Women Agri Entrepreneur Award",
    awardYear: 2025,
    recognitionAuthority: "Karnataka Agriculture Department",
    isVerified: true,
    isFeatured: true,
    isPublished: true,
    views: 3210,
    likes: 512,
    createdAt: "2026-08-29",
  },
  {
    id: 3,
    farmerName: "Suresh Patil",
    image:
      "https://images.unsplash.com/photo-1530507629858-e3759c5e0f9b?auto=format&fit=crop&w=900&q=85",
    village: "Belagavi",
    district: "Belagavi",
    state: "Karnataka",
    crop: "Sugarcane",
    achievementTitle: "Saving Water with Smart Irrigation",
    achievementType: "Water Saving",
    description:
      "Suresh improved sugarcane production by combining drip irrigation with scheduled irrigation.",
    challenge:
      "Water availability was becoming unpredictable during the summer season.",
    solution:
      "He installed drip irrigation and followed crop-stage based irrigation scheduling.",
    result:
      "Water consumption reduced while crop productivity improved.",
    advice:
      "Every drop matters. Measure water use before trying to increase production.",
    landArea: 9,
    experienceYears: 11,
    previousIncome: 510000,
    currentIncome: 850000,
    incomeGrowth: 67,
    productivityImprovement: 35,
    waterSaving: 52,
    costReduction: 18,
    isVerified: true,
    isFeatured: false,
    isPublished: true,
    views: 1980,
    likes: 241,
    createdAt: "2026-09-02",
  },
  {
    id: 4,
    farmerName: "Anil Kumar",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=85",
    village: "Kolar",
    district: "Kolar",
    state: "Karnataka",
    crop: "Mango",
    achievementTitle: "Building a Profitable Mango Orchard",
    achievementType: "Entrepreneurship",
    description:
      "Anil converted a traditional orchard into a commercial farm with grading, direct selling and better crop management.",
    challenge:
      "Middlemen and inconsistent fruit quality were reducing his returns.",
    solution:
      "He introduced orchard management, grading and direct connections with buyers.",
    result:
      "Farm income increased and post-harvest losses decreased.",
    advice:
      "Farmers should think beyond production and learn about marketing too.",
    landArea: 12,
    experienceYears: 16,
    previousIncome: 620000,
    currentIncome: 1120000,
    incomeGrowth: 81,
    productivityImprovement: 28,
    waterSaving: 25,
    costReduction: 17,
    awardName: "Progressive Horticulture Farmer",
    awardYear: 2024,
    recognitionAuthority: "Horticulture Department",
    isVerified: true,
    isFeatured: false,
    isPublished: true,
    views: 1540,
    likes: 183,
    createdAt: "2026-09-05",
  },
];

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function FarmerAchievementsPage() {
  const [achievements, setAchievements] = useState<FarmerAchievement[]>(
    INITIAL_ACHIEVEMENTS
  );

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [state, setState] = useState("All");
  const [sortBy, setSortBy] = useState("Latest");

  const [selectedFarmer, setSelectedFarmer] =
    useState<FarmerAchievement | null>(null);

  const [showAdmin, setShowAdmin] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [liked, setLiked] = useState<number[]>([]);

  /* =========================================================
     FILTERING
  ========================================================= */

  const filteredAchievements = useMemo(() => {
    let data = achievements.filter((item) => item.isPublished);

    if (search.trim()) {
      const q = search.toLowerCase();

      data = data.filter(
        (item) =>
          item.farmerName.toLowerCase().includes(q) ||
          item.crop.toLowerCase().includes(q) ||
          item.state.toLowerCase().includes(q) ||
          item.district.toLowerCase().includes(q) ||
          item.achievementTitle.toLowerCase().includes(q)
      );
    }

    if (category !== "All") {
      data = data.filter((item) => item.achievementType === category);
    }

    if (state !== "All") {
      data = data.filter((item) => item.state === state);
    }

    if (sortBy === "Latest") {
      data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
    }

    if (sortBy === "Most Viewed") {
      data.sort((a, b) => b.views - a.views);
    }

    if (sortBy === "Income Growth") {
      data.sort((a, b) => b.incomeGrowth - a.incomeGrowth);
    }

    return data;
  }, [achievements, search, category, state, sortBy]);

  const featured = achievements.filter(
    (item) => item.isFeatured && item.isPublished
  );

  const totalViews = achievements.reduce(
    (sum, item) => sum + item.views,
    0
  );

  const states = [...new Set(achievements.map((item) => item.state))];

  /* =========================================================
     LIKE
  ========================================================= */

  const toggleLike = (id: number) => {
    setLiked((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  /* =========================================================
     ADD ACHIEVEMENT
  ========================================================= */

  const handleAddAchievement = (
    newAchievement: Omit<FarmerAchievement, "id" | "createdAt">
  ) => {
    const item: FarmerAchievement = {
      ...newAchievement,
      id: Date.now(),
      createdAt: new Date().toISOString().split("T")[0],
    };

    setAchievements((prev) => [item, ...prev]);
    setShowAddForm(false);
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#f5f8f3] text-slate-900">
      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-800">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-green-400/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-lime-300/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-green-100 backdrop-blur">
              <Sparkles className="h-4 w-4" />
              AgriGo Farmer Achievement Network
            </div>

            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Farmers Who
              <span className="block text-lime-300">
                Inspire India
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-emerald-100 sm:text-lg">
              Discover real farmers who are improving productivity,
              adopting technology, saving water and building stronger
              agricultural businesses.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() =>
                  document
                    .getElementById("achievers")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-emerald-800 shadow-lg transition hover:-translate-y-0.5 hover:bg-green-50"
              >
                Explore Achievers
                <ChevronRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => setShowAdmin(true)}
                className="flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 font-bold text-white backdrop-blur transition hover:bg-white/15"
              >
                <ShieldCheck className="h-4 w-4" />
                Admin
              </button>
            </div>
          </div>

          {/* HERO STATS */}

          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              icon={<Users />}
              value={achievements.length}
              label="Farmer Achievers"
            />

            <StatCard
              icon={<BadgeCheck />}
              value={achievements.filter((x) => x.isVerified).length}
              label="Verified Stories"
            />

            <StatCard
              icon={<MapPin />}
              value={states.length}
              label="States Represented"
            />

            <StatCard
              icon={<Eye />}
              value={formatNumber(totalViews)}
              label="Story Views"
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          FEATURED
      ===================================================== */}

      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
          <div className="mb-7 flex items-end justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-emerald-700">
                <Trophy className="h-4 w-4" />
                Featured Achievers
              </div>

              <h2 className="text-2xl font-black sm:text-3xl">
                Stories worth knowing
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Farmers whose achievements are making a difference.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {featured.slice(0, 2).map((farmer) => (
              <FeaturedCard
                key={farmer.id}
                farmer={farmer}
                liked={liked.includes(farmer.id)}
                onLike={() => toggleLike(farmer.id)}
                onOpen={() => setSelectedFarmer(farmer)}
              />
            ))}
          </div>
        </section>
      )}

      {/* =====================================================
          SEARCH & FILTER
      ===================================================== */}

      <section
        id="achievers"
        className="mx-auto max-w-7xl px-5 pb-12 sm:px-8"
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search farmer, crop, district or achievement..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <FilterSelect
                value={category}
                onChange={setCategory}
                options={[
                  "All",
                  "Innovation",
                  "Organic Farming",
                  "High Productivity",
                  "Technology",
                  "Water Saving",
                  "Women Farmer",
                  "Entrepreneurship",
                  "Sustainable Farming",
                ]}
              />

              <FilterSelect
                value={state}
                onChange={setState}
                options={["All", ...states]}
              />

              <FilterSelect
                value={sortBy}
                onChange={setSortBy}
                options={["Latest", "Most Viewed", "Income Growth"]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FARMER GRID
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">
              Recently Recognised Farmers
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {filteredAchievements.length} inspiring farmer stories
            </p>
          </div>

          <div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
            <Filter className="h-4 w-4" />
            Updated regularly
          </div>
        </div>

        {filteredAchievements.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredAchievements.map((farmer) => (
              <FarmerCard
                key={farmer.id}
                farmer={farmer}
                liked={liked.includes(farmer.id)}
                onLike={() => toggleLike(farmer.id)}
                onOpen={() => setSelectedFarmer(farmer)}
              />
            ))}
          </div>
        )}
      </section>

      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      {selectedFarmer && (
        <FarmerDetailModal
          farmer={selectedFarmer}
          liked={liked.includes(selectedFarmer.id)}
          onLike={() => toggleLike(selectedFarmer.id)}
          onClose={() => setSelectedFarmer(null)}
        />
      )}

      {/* =====================================================
          ADMIN PANEL
      ===================================================== */}

      {showAdmin && (
        <AdminPanel
          achievements={achievements}
          onClose={() => setShowAdmin(false)}
          onAdd={() => setShowAddForm(true)}
          onDelete={(id) =>
            setAchievements((prev) =>
              prev.filter((item) => item.id !== id)
            )
          }
          onTogglePublish={(id) =>
            setAchievements((prev) =>
              prev.map((item) =>
                item.id === id
                  ? { ...item, isPublished: !item.isPublished }
                  : item
              )
            )
          }
          onToggleFeatured={(id) =>
            setAchievements((prev) =>
              prev.map((item) =>
                item.id === id
                  ? { ...item, isFeatured: !item.isFeatured }
                  : item
              )
            )
          }
        />
      )}

      {/* =====================================================
          ADD FORM
      ===================================================== */}

      {showAddForm && (
        <AddAchievementModal
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddAchievement}
        />
      )}
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-lime-300">
        {React.isValidElement<{ className?: string }>(icon)
          ? React.cloneElement(icon, {
              className: [icon.props.className, "h-5 w-5"].filter(Boolean).join(" "),
            })
          : icon}
      </div>

      <div className="text-2xl font-black text-white">
        {value}
      </div>

      <div className="mt-1 text-xs font-medium text-emerald-100">
        {label}
      </div>
    </div>
  );
}

/* =========================================================
   FEATURED CARD
========================================================= */

function FeaturedCard({
  farmer,
  liked,
  onLike,
  onOpen,
}: {
  farmer: FarmerAchievement;
  liked: boolean;
  onLike: () => void;
  onOpen: () => void;
}) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-72 overflow-hidden">
        <img
          src={farmer.image}
          alt={farmer.farmerName}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-emerald-800 shadow">
          <Trophy className="h-3.5 w-3.5" />
          Featured
        </div>

        <button
          onClick={onLike}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-rose-500 shadow transition hover:scale-105"
        >
          <Heart
            className={`h-5 w-5 ${
              liked ? "fill-current" : ""
            }`}
          />
        </button>

        <div className="absolute bottom-5 left-5 right-5 text-white">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-green-200">
            <MapPin className="h-3.5 w-3.5" />
            {farmer.district}, {farmer.state}
          </div>

          <h3 className="text-2xl font-black">
            {farmer.farmerName}
          </h3>

          <p className="mt-1 line-clamp-2 text-sm text-white/85">
            {farmer.achievementTitle}
          </p>
        </div>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-3 gap-3">
          <MiniMetric
            value={`+${farmer.incomeGrowth}%`}
            label="Income"
          />

          <MiniMetric
            value={`+${farmer.productivityImprovement}%`}
            label="Productivity"
          />

          <MiniMetric
            value={`${farmer.waterSaving}%`}
            label="Water saved"
          />
        </div>

        <button
          onClick={onOpen}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
        >
          Read Farmer Story
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

/* =========================================================
   FARMER CARD
========================================================= */

function FarmerCard({
  farmer,
  liked,
  onLike,
  onOpen,
}: {
  farmer: FarmerAchievement;
  liked: boolean;
  onLike: () => void;
  onOpen: () => void;
}) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-56 overflow-hidden">
        <img
          src={farmer.image}
          alt={farmer.farmerName}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-emerald-700">
          {farmer.achievementType}
        </div>

        <button
          onClick={onLike}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-rose-500 shadow"
        >
          <Heart
            className={`h-4 w-4 ${
              liked ? "fill-current" : ""
            }`}
          />
        </button>

        <div className="absolute bottom-4 left-4 text-white">
          <div className="flex items-center gap-1.5 text-xs font-medium text-white/80">
            <MapPin className="h-3 w-3" />
            {farmer.district}, {farmer.state}
          </div>

          <h3 className="mt-1 text-xl font-black">
            {farmer.farmerName}
          </h3>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
          <Sprout className="h-4 w-4" />
          {farmer.crop}
        </div>

        <h4 className="mt-2 line-clamp-2 min-h-[48px] text-base font-extrabold leading-6">
          {farmer.achievementTitle}
        </h4>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
          {farmer.description}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <MetricBox
            icon={<TrendingUp />}
            value={`+${farmer.incomeGrowth}%`}
            label="Income"
          />

          <MetricBox
            icon={<IndianRupee />}
            value={`₹${formatNumber(farmer.currentIncome)}`}
            label="Current income"
          />
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Eye className="h-4 w-4" />
            {formatNumber(farmer.views)}
          </div>

          <button
            onClick={onOpen}
            className="flex items-center gap-1 text-sm font-bold text-emerald-700 hover:text-emerald-900"
          >
            View story
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   DETAIL MODAL
========================================================= */

function FarmerDetailModal({
  farmer,
  liked,
  onLike,
  onClose,
}: {
  farmer: FarmerAchievement;
  liked: boolean;
  onLike: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
      <div className="mx-auto my-6 max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="relative h-72 sm:h-96">
          <img
            src={farmer.image}
            alt={farmer.farmerName}
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            onClick={onLike}
            className="absolute right-16 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-rose-500 shadow"
          >
            <Heart
              className={`h-5 w-5 ${
                liked ? "fill-current" : ""
              }`}
            />
          </button>

          <div className="absolute bottom-6 left-5 right-5 text-white sm:left-8">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold">
                {farmer.achievementType}
              </span>

              {farmer.isVerified && (
                <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Verified Farmer
                </span>
              )}
            </div>

            <h2 className="text-3xl font-black sm:text-4xl">
              {farmer.farmerName}
            </h2>

            <div className="mt-2 flex flex-wrap gap-4 text-sm text-white/85">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {farmer.village}, {farmer.district}
              </span>

              <span className="flex items-center gap-1">
                <Leaf className="h-4 w-4" />
                {farmer.crop}
              </span>

              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(farmer.createdAt).getFullYear()}
              </span>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8">
          <h3 className="text-2xl font-black">
            {farmer.achievementTitle}
          </h3>

          <p className="mt-3 leading-7 text-slate-600">
            {farmer.description}
          </p>

          {/* PERFORMANCE */}

          <div className="mt-7 grid gap-3 sm:grid-cols-4">
            <PerformanceCard
              icon={<TrendingUp />}
              value={`+${farmer.incomeGrowth}%`}
              label="Income growth"
            />

            <PerformanceCard
              icon={<BarChart3 />}
              value={`+${farmer.productivityImprovement}%`}
              label="Productivity"
            />

            <PerformanceCard
              icon={<Droplets />}
              value={`${farmer.waterSaving}%`}
              label="Water saved"
            />

            <PerformanceCard
              icon={<Wallet />}
              value={`${farmer.costReduction}%`}
              label="Cost reduced"
            />
          </div>

          {/* STORY */}

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <StorySection
              number="01"
              title="The Challenge"
              text={farmer.challenge}
            />

            <StorySection
              number="02"
              title="The Solution"
              text={farmer.solution}
            />

            <StorySection
              number="03"
              title="The Result"
              text={farmer.result}
            />
          </div>

          {/* FARM PROFILE */}

          <div className="mt-8 rounded-2xl bg-slate-50 p-5">
            <h4 className="font-black">Farm Profile</h4>

            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <ProfileStat
                label="Land Area"
                value={`${farmer.landArea} acres`}
              />

              <ProfileStat
                label="Experience"
                value={`${farmer.experienceYears} years`}
              />

              <ProfileStat
                label="Previous Income"
                value={`₹${formatNumber(farmer.previousIncome)}`}
              />

              <ProfileStat
                label="Current Income"
                value={`₹${formatNumber(farmer.currentIncome)}`}
              />
            </div>
          </div>

          {/* AWARD */}

          {farmer.awardName && (
            <div className="mt-6 flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <Award className="h-6 w-6" />
              </div>

              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-700">
                  Recognition
                </div>

                <h4 className="mt-1 font-black text-slate-900">
                  {farmer.awardName}
                </h4>

                <p className="mt-1 text-sm text-slate-600">
                  {farmer.recognitionAuthority} •{" "}
                  {farmer.awardYear}
                </p>
              </div>
            </div>
          )}

          {/* ADVICE */}

          <div className="mt-6 rounded-2xl bg-emerald-50 p-5">
            <div className="flex gap-3">
              <Sparkles className="mt-1 h-5 w-5 shrink-0 text-emerald-600" />

              <div>
                <h4 className="font-black text-emerald-900">
                  Advice for fellow farmers
                </h4>

                <p className="mt-2 leading-7 text-emerald-800">
                  “{farmer.advice}”
                </p>
              </div>
            </div>
          </div>

          <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-5 text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              {formatNumber(farmer.views)} views
            </span>

            <span className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              {farmer.likes + (liked ? 1 : 0)} likes
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ADMIN PANEL
========================================================= */

function AdminPanel({
  achievements,
  onClose,
  onAdd,
  onDelete,
  onTogglePublish,
  onToggleFeatured,
}: {
  achievements: FarmerAchievement[];
  onClose: () => void;
  onAdd: () => void;
  onDelete: (id: number) => void;
  onTogglePublish: (id: number) => void;
  onToggleFeatured: (id: number) => void;
}) {
  return (
    <div className="fixed inset-0 z-[120] overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="mx-auto my-6 max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-slate-950 p-5 text-white sm:p-6">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              AgriGo Administration
            </div>

            <h2 className="mt-1 text-2xl font-black">
              Farmer Achievements
            </h2>
          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 sm:p-7">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-xl font-black">
                Manage Achievers
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Add, publish and feature recently recognised farmers.
              </p>
            </div>

            <button
              onClick={onAdd}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800"
            >
              <Plus className="h-4 w-4" />
              Add New Farmer
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Farmer</th>
                  <th className="px-5 py-4">Crop</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Featured</th>
                  <th className="px-5 py-4">Created</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {achievements.map((farmer) => (
                  <tr key={farmer.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={farmer.image}
                          alt=""
                          className="h-11 w-11 rounded-xl object-cover"
                        />

                        <div>
                          <div className="font-bold">
                            {farmer.farmerName}
                          </div>

                          <div className="text-xs text-slate-400">
                            {farmer.district}, {farmer.state}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {farmer.crop}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => onTogglePublish(farmer.id)}
                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                          farmer.isPublished
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {farmer.isPublished
                          ? "Published"
                          : "Draft"}
                      </button>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => onToggleFeatured(farmer.id)}
                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                          farmer.isFeatured
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {farmer.isFeatured
                          ? "Featured"
                          : "Normal"}
                      </button>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-500">
                      {farmer.createdAt}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              "Delete this farmer achievement?"
                            )
                          ) {
                            onDelete(farmer.id);
                          }
                        }}
                        className="rounded-lg px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ADD ACHIEVEMENT MODAL
========================================================= */

function AddAchievementModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (
    item: Omit<FarmerAchievement, "id" | "createdAt">
  ) => void;
}) {
  const [form, setForm] = useState({
    farmerName: "",
    village: "",
    district: "",
    state: "Karnataka",
    crop: "",
    achievementTitle: "",
    achievementType: "Innovation" as AchievementType,
    description: "",
    challenge: "",
    solution: "",
    result: "",
    advice: "",
    landArea: "1",
    experienceYears: "5",
    previousIncome: "200000",
    currentIncome: "300000",
    incomeGrowth: "50",
    productivityImprovement: "20",
    waterSaving: "15",
    costReduction: "10",
    awardName: "",
    awardYear: String(new Date().getFullYear()),
    recognitionAuthority: "",
    image:
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=85",
  });

  const update = (key: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.farmerName ||
      !form.district ||
      !form.crop ||
      !form.achievementTitle ||
      !form.description
    ) {
      alert("Please fill all required fields.");
      return;
    }

    onSubmit({
      ...form,
      landArea: Number(form.landArea),
      experienceYears: Number(form.experienceYears),
      previousIncome: Number(form.previousIncome),
      currentIncome: Number(form.currentIncome),
      incomeGrowth: Number(form.incomeGrowth),
      productivityImprovement: Number(
        form.productivityImprovement
      ),
      waterSaving: Number(form.waterSaving),
      costReduction: Number(form.costReduction),
      awardYear: form.awardName
        ? Number(form.awardYear)
        : undefined,

      isVerified: true,
      isFeatured: false,
      isPublished: true,

      views: 0,
      likes: 0,
    });
  };

  return (
    <div className="fixed inset-0 z-[150] overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
      <div className="mx-auto my-5 max-w-4xl rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">
          <div>
            <h2 className="text-2xl font-black">
              Add Farmer Achievement
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Publish a recently recognised farmer.
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 sm:p-7">
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Farmer Name *"
              value={form.farmerName}
              onChange={(v) => update("farmerName", v)}
              placeholder="Example: Ramesh Gowda"
            />

            <Input
              label="Village"
              value={form.village}
              onChange={(v) => update("village", v)}
              placeholder="Village name"
            />

            <Input
              label="District *"
              value={form.district}
              onChange={(v) => update("district", v)}
              placeholder="Example: Hassan"
            />

            <Input
              label="State"
              value={form.state}
              onChange={(v) => update("state", v)}
              placeholder="Karnataka"
            />

            <Input
              label="Main Crop *"
              value={form.crop}
              onChange={(v) => update("crop", v)}
              placeholder="Example: Tomato"
            />

            <SelectInput
              label="Achievement Type"
              value={form.achievementType}
              onChange={(v) =>
                update("achievementType", v)
              }
              options={[
                "Innovation",
                "Organic Farming",
                "High Productivity",
                "Technology",
                "Water Saving",
                "Women Farmer",
                "Entrepreneurship",
                "Sustainable Farming",
              ]}
            />

            <div className="sm:col-span-2">
              <Input
                label="Achievement Title *"
                value={form.achievementTitle}
                onChange={(v) =>
                  update("achievementTitle", v)
                }
                placeholder="Example: Building a profitable modern farm"
              />
            </div>

            <div className="sm:col-span-2">
              <TextArea
                label="Short Description *"
                value={form.description}
                onChange={(v) => update("description", v)}
                placeholder="Describe the farmer's achievement..."
              />
            </div>

            <TextArea
              label="Challenge"
              value={form.challenge}
              onChange={(v) => update("challenge", v)}
              placeholder="What challenge did the farmer face?"
            />

            <TextArea
              label="Solution"
              value={form.solution}
              onChange={(v) => update("solution", v)}
              placeholder="What solution was implemented?"
            />

            <TextArea
              label="Result"
              value={form.result}
              onChange={(v) => update("result", v)}
              placeholder="What measurable result was achieved?"
            />

            <TextArea
              label="Advice to Farmers"
              value={form.advice}
              onChange={(v) => update("advice", v)}
              placeholder="Farmer's advice..."
            />
          </div>

          <div className="mt-7">
            <h3 className="mb-4 font-black">
              Farm Performance
            </h3>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Input
                label="Land Area (acres)"
                value={form.landArea}
                onChange={(v) => update("landArea", v)}
                type="number"
              />

              <Input
                label="Experience (years)"
                value={form.experienceYears}
                onChange={(v) =>
                  update("experienceYears", v)
                }
                type="number"
              />

              <Input
                label="Previous Income"
                value={form.previousIncome}
                onChange={(v) =>
                  update("previousIncome", v)
                }
                type="number"
              />

              <Input
                label="Current Income"
                value={form.currentIncome}
                onChange={(v) =>
                  update("currentIncome", v)
                }
                type="number"
              />

              <Input
                label="Income Growth %"
                value={form.incomeGrowth}
                onChange={(v) =>
                  update("incomeGrowth", v)
                }
                type="number"
              />

              <Input
                label="Productivity Improvement %"
                value={form.productivityImprovement}
                onChange={(v) =>
                  update("productivityImprovement", v)
                }
                type="number"
              />

              <Input
                label="Water Saving %"
                value={form.waterSaving}
                onChange={(v) =>
                  update("waterSaving", v)
                }
                type="number"
              />

              <Input
                label="Cost Reduction %"
                value={form.costReduction}
                onChange={(v) =>
                  update("costReduction", v)
                }
                type="number"
              />
            </div>
          </div>

          <div className="mt-7">
            <h3 className="mb-4 font-black">
              Recognition
            </h3>

            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Award Name"
                value={form.awardName}
                onChange={(v) => update("awardName", v)}
                placeholder="Best Farmer Award"
              />

              <Input
                label="Award Year"
                value={form.awardYear}
                onChange={(v) => update("awardYear", v)}
                type="number"
              />

              <Input
                label="Recognised By"
                value={form.recognitionAuthority}
                onChange={(v) =>
                  update("recognitionAuthority", v)
                }
                placeholder="Agriculture Department"
              />
            </div>
          </div>

          <div className="mt-7">
            <Input
              label="Farmer Image URL"
              value={form.image}
              onChange={(v) => update("image", v)}
              placeholder="https://..."
            />
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-800"
            >
              <CheckCircle2 className="h-4 w-4" />
              Publish Achievement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function MiniMetric({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-center">
      <div className="font-black text-emerald-700">
        {value}
      </div>
      <div className="mt-1 text-[11px] text-slate-500">
        {label}
      </div>
    </div>
  );
}

function MetricBox({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3">
      {React.isValidElement<{ className?: string }>(icon)
        ? React.cloneElement(icon, {
            className: [icon.props.className, "h-4 w-4 text-emerald-600"].filter(Boolean).join(" "),
          })
        : icon}

      <div>
        <div className="text-sm font-black">{value}</div>
        <div className="text-[10px] text-slate-400">
          {label}
        </div>
      </div>
    </div>
  );
}

function PerformanceCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
      <div className="mb-2 text-emerald-600">
        {React.isValidElement<{ className?: string }>(icon)
          ? React.cloneElement(icon, {
              className: [icon.props.className, "h-5 w-5"].filter(Boolean).join(" "),
            })
          : icon}
      </div>

      <div className="text-xl font-black text-emerald-900">
        {value}
      </div>

      <div className="mt-1 text-xs text-emerald-700">
        {label}
      </div>
    </div>
  );
}

function StorySection({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <div className="text-xs font-black text-emerald-600">
        {number}
      </div>

      <h4 className="mt-2 font-black">{title}</h4>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {text}
      </p>
    </div>
  );
}

function ProfileStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="text-xs text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-black text-slate-800">
        {value}
      </div>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
    >
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold text-slate-700">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold text-slate-700">
        {label}
      </span>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
      />
    </label>
  );
}

function SelectInput({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold text-slate-700">
        {label}
      </span>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
        <Search className="h-7 w-7" />
      </div>

      <h3 className="mt-5 text-xl font-black">
        No farmer stories found
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Try changing your search or filters to discover more
        farmer achievements.
      </p>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function formatNumber(value: number) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }

  return value.toString();
}