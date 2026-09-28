
import React, { useMemo, useState } from "react";
import {
  Award,
  BadgeCheck,
  BookOpen,
  BarChart3,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Droplets,
  Edit3,
  Eye,
  Filter,
  Heart,
  IndianRupee,
  Leaf,
  MapPin,
  Play,
  PlayCircle,
  Plus,
  Search,
  ShieldCheck,
  Sprout,
  Star,
  Trash2,
  TrendingUp,
  Trophy,
  Users,
  Video,
  X,
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

type CourseLevel =
  | "Beginner"
  | "Intermediate"
  | "Advanced";

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

interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  description: string;
}

interface FarmingCourse {
  id: string;
  title: string;
  description: string;
  instructor: string;
  category: string;
  crop: string;
  level: CourseLevel;
  duration: string;
  language: string;
  image: string;
  lessons: Lesson[];
  certificate: boolean;
  students: number;
  published: boolean;
}

/* =========================================================
   FARMER ACHIEVEMENT DATA
========================================================= */

const INITIAL_ACHIEVEMENTS: FarmerAchievement[] = [
  {
    id: 1,
    farmerName: "Ramesh Gowda",
    image:
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1000&q=85",
    village: "Hassan",
    district: "Hassan",
    state: "Karnataka",
    crop: "Tomato",
    achievementTitle:
      "Turning Tomato Farming into a High-Income Business",
    achievementType: "High Productivity",
    description:
      "Ramesh transformed traditional tomato farming by adopting drip irrigation, soil testing and planned crop management.",
    challenge:
      "Rising input costs, irregular rainfall and tomato price fluctuations were reducing his farm income.",
    solution:
      "He adopted drip irrigation, mulching, soil testing and planned harvesting based on market demand.",
    result:
      "Farm productivity and income improved while water consumption and unnecessary input costs reduced.",
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
      "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1000&q=85",
    village: "Mysuru",
    district: "Mysuru",
    state: "Karnataka",
    crop: "Rice",
    achievementTitle:
      "A Woman Farmer Leading Sustainable Rice Farming",
    achievementType: "Women Farmer",
    description:
      "Lakshmi introduced sustainable rice cultivation methods and reduced unnecessary chemical inputs.",
    challenge:
      "High fertilizer costs and declining soil quality affected farm productivity.",
    solution:
      "She introduced organic manure, crop rotation and improved water management.",
    result:
      "The farm became more sustainable while maintaining profitable production.",
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
];

/* =========================================================
   FARMING COURSES
   Replace these with your Django API later.
========================================================= */

const INITIAL_COURSES: FarmingCourse[] = [
  {
    id: "tomato-masterclass",
    title: "Complete Tomato Farming Masterclass",
    description:
      "Learn tomato farming from seed selection to harvesting, disease management and profitable marketing.",
    instructor: "AgriGo Agriculture Expert",
    category: "Crop Production",
    crop: "Tomato",
    level: "Beginner",
    duration: "48 min",
    language: "Kannada + English",
    image:
      "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=1000&q=85",
    certificate: true,
    students: 842,
    published: true,
    lessons: [
      {
        id: "tomato-1",
        title: "Tomato Seed Selection",
        duration: "12 min",
        videoUrl:
          "https://www.youtube.com/watch?v=JeU_EYFH1Jk",
        description:
          "Learn how to select quality tomato seeds and understand important variety characteristics.",
      },
      {
        id: "tomato-2",
        title: "Nursery and Seedling Management",
        duration: "10 min",
        videoUrl:
          "https://www.youtube.com/watch?v=JeU_EYFH1Jk",
        description:
          "Learn practical nursery preparation and healthy seedling management.",
      },
      {
        id: "tomato-3",
        title: "Irrigation and Fertilizer Management",
        duration: "14 min",
        videoUrl:
          "https://www.youtube.com/watch?v=JeU_EYFH1Jk",
        description:
          "Understand irrigation scheduling and nutrient management.",
      },
      {
        id: "tomato-4",
        title: "Harvesting and Market Planning",
        duration: "12 min",
        videoUrl:
          "https://www.youtube.com/watch?v=JeU_EYFH1Jk",
        description:
          "Learn harvesting timing, grading and market preparation.",
      },
    ],
  },

  {
    id: "drip-irrigation",
    title: "Drip Irrigation for Indian Farms",
    description:
      "Understand drip irrigation installation, scheduling, maintenance and water-saving practices.",
    instructor: "AgriGo Water Management Team",
    category: "Water Management",
    crop: "Multiple Crops",
    level: "Beginner",
    duration: "42 min",
    language: "Hindi + English",
    image:
      "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1000&q=85",
    certificate: false,
    students: 1250,
    published: true,
    lessons: [
      {
        id: "drip-1",
        title: "Understanding Drip Irrigation",
        duration: "10 min",
        videoUrl:
          "https://www.youtube.com/watch?v=JeU_EYFH1Jk",
        description:
          "Learn the basic principles of drip irrigation.",
      },
      {
        id: "drip-2",
        title: "Installation and Layout",
        duration: "12 min",
        videoUrl:
          "https://www.youtube.com/watch?v=JeU_EYFH1Jk",
        description:
          "Understand field layout and installation planning.",
      },
      {
        id: "drip-3",
        title: "Water Scheduling",
        duration: "10 min",
        videoUrl:
          "https://www.youtube.com/watch?v=JeU_EYFH1Jk",
        description:
          "Learn crop-stage based irrigation scheduling.",
      },
      {
        id: "drip-4",
        title: "Maintenance",
        duration: "10 min",
        videoUrl:
          "https://www.youtube.com/watch?v=JeU_EYFH1Jk",
        description:
          "Learn how to maintain filters, pipes and emitters.",
      },
    ],
  },

  {
    id: "organic-farming",
    title: "Practical Organic Farming",
    description:
      "Learn soil health, composting, natural inputs and sustainable crop management.",
    instructor: "AgriGo Certified Trainer",
    category: "Organic Farming",
    crop: "Multiple Crops",
    level: "Intermediate",
    duration: "55 min",
    language: "Kannada + English",
    image:
      "https://images.unsplash.com/photo-1472141521881-95d0e87e2e39?auto=format&fit=crop&w=1000&q=85",
    certificate: true,
    students: 630,
    published: true,
    lessons: [
      {
        id: "organic-1",
        title: "Building Healthy Soil",
        duration: "14 min",
        videoUrl:
          "https://www.youtube.com/watch?v=JeU_EYFH1Jk",
        description:
          "Understand soil organic matter and soil health.",
      },
      {
        id: "organic-2",
        title: "Compost Preparation",
        duration: "13 min",
        videoUrl:
          "https://www.youtube.com/watch?v=JeU_EYFH1Jk",
        description:
          "Learn practical compost preparation methods.",
      },
      {
        id: "organic-3",
        title: "Natural Pest Management",
        duration: "15 min",
        videoUrl:
          "https://www.youtube.com/watch?v=JeU_EYFH1Jk",
        description:
          "Learn practical integrated pest management techniques.",
      },
      {
        id: "organic-4",
        title: "Organic Farm Economics",
        duration: "13 min",
        videoUrl:
          "https://www.youtube.com/watch?v=JeU_EYFH1Jk",
        description:
          "Understand input costs and market opportunities.",
      },
    ],
  },

  {
    id: "smart-farming",
    title: "Smart Farming with Modern Technology",
    description:
      "Learn how farmers can use sensors, mobile apps, weather information and AI-based agriculture tools.",
    instructor: "AgriGo Technology Team",
    category: "Smart Agriculture",
    crop: "Multiple Crops",
    level: "Intermediate",
    duration: "60 min",
    language: "English + Hindi",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1000&q=85",
    certificate: true,
    students: 450,
    published: true,
    lessons: [
      {
        id: "smart-1",
        title: "Introduction to Smart Farming",
        duration: "12 min",
        videoUrl:
          "https://www.youtube.com/watch?v=JeU_EYFH1Jk",
        description:
          "Understand how technology can improve farm decisions.",
      },
      {
        id: "smart-2",
        title: "Weather-Based Farm Decisions",
        duration: "15 min",
        videoUrl:
          "https://www.youtube.com/watch?v=JeU_EYFH1Jk",
        description:
          "Use weather information for crop planning.",
      },
      {
        id: "smart-3",
        title: "Using AI for Crop Monitoring",
        duration: "18 min",
        videoUrl:
          "https://www.youtube.com/watch?v=JeU_EYFH1Jk",
        description:
          "Understand AI-based crop monitoring concepts.",
      },
      {
        id: "smart-4",
        title: "Digital Agriculture Marketplace",
        duration: "15 min",
        videoUrl:
          "https://www.youtube.com/watch?v=JeU_EYFH1Jk",
        description:
          "Learn how digital platforms can connect farmers with buyers.",
      },
    ],
  },
];

/* =========================================================
   MAIN PAGE
========================================================= */

export default function FarmerAchievementsPage() {
  const [achievements, setAchievements] = useState(
    INITIAL_ACHIEVEMENTS
  );

  const [courses, setCourses] =
    useState<FarmingCourse[]>(INITIAL_COURSES);

  const [search, setSearch] = useState("");
  const [achievementCategory, setAchievementCategory] =
    useState("All");

  const [courseCategory, setCourseCategory] =
    useState("All");

  const [selectedFarmer, setSelectedFarmer] =
    useState<FarmerAchievement | null>(null);

  const [selectedCourse, setSelectedCourse] =
    useState<FarmingCourse | null>(null);

  const [showAdmin, setShowAdmin] = useState(false);

  const [showCourseForm, setShowCourseForm] =
    useState(false);

  const [editingCourse, setEditingCourse] =
    useState<FarmingCourse | null>(null);

  const [liked, setLiked] = useState<number[]>([]);

  const [completedLessons, setCompletedLessons] =
    useState<string[]>([]);

  const [activeLessonIndex, setActiveLessonIndex] =
    useState(0);

  /* =======================================================
     FILTER ACHIEVEMENTS
  ======================================================= */

  const filteredAchievements = useMemo(() => {
    return achievements
      .filter((item) => item.isPublished)
      .filter((item) => {
        const q = search.toLowerCase().trim();

        if (!q) return true;

        return (
          item.farmerName.toLowerCase().includes(q) ||
          item.crop.toLowerCase().includes(q) ||
          item.district.toLowerCase().includes(q) ||
          item.state.toLowerCase().includes(q) ||
          item.achievementTitle.toLowerCase().includes(q)
        );
      })
      .filter(
        (item) =>
          achievementCategory === "All" ||
          item.achievementType === achievementCategory
      );
  }, [achievements, search, achievementCategory]);

  /* =======================================================
     FILTER COURSES
  ======================================================= */

  const filteredCourses = useMemo(() => {
    return courses
      .filter((course) => course.published)
      .filter((course) => {
        if (courseCategory === "All") return true;
        return course.category === courseCategory;
      })
      .filter((course) => {
        const q = search.toLowerCase().trim();

        if (!q) return true;

        return (
          course.title.toLowerCase().includes(q) ||
          course.category.toLowerCase().includes(q) ||
          course.crop.toLowerCase().includes(q) ||
          course.instructor.toLowerCase().includes(q)
        );
      });
  }, [courses, courseCategory, search]);

  /* =======================================================
     OPEN COURSE
  ======================================================= */

  const openCourse = (course: FarmingCourse) => {
    setSelectedCourse(course);
    setActiveLessonIndex(0);
  };

  /* =======================================================
     COMPLETE LESSON
  ======================================================= */

  const toggleLessonComplete = (lessonId: string) => {
    setCompletedLessons((prev) =>
      prev.includes(lessonId)
        ? prev.filter((id) => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  /* =======================================================
     LIKE
  ======================================================= */

  const toggleLike = (id: number) => {
    setLiked((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  /* =======================================================
     DELETE COURSE
  ======================================================= */

  const deleteCourse = (id: string) => {
    if (!window.confirm("Delete this farming class?")) {
      return;
    }

    setCourses((prev) =>
      prev.filter((course) => course.id !== id)
    );
  };

  /* =======================================================
     ADD / EDIT COURSE
  ======================================================= */

  const saveCourse = (course: FarmingCourse) => {
    if (editingCourse) {
      setCourses((prev) =>
        prev.map((item) =>
          item.id === course.id ? course : item
        )
      );
    } else {
      setCourses((prev) => [course, ...prev]);
    }

    setShowCourseForm(false);
    setEditingCourse(null);
  };

  const featured = achievements.filter(
    (item) => item.isFeatured && item.isPublished
  );

  const totalViews = achievements.reduce(
    (sum, item) => sum + item.views,
    0
  );

  return (
    <div className="min-h-screen bg-[#f4f8f3] text-slate-900">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden bg-gradient-to-br from-[#082817] via-[#0d4326] to-[#18713c]">

        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-lime-300/10 blur-3xl" />

        <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-emerald-300/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">

          <div className="max-w-4xl">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-green-100 backdrop-blur">
              <Sprout className="h-4 w-4" />
              AgriGo Farmer Knowledge Network
            </div>

            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Learn.
              <span className="text-lime-300">
                {" "}Grow.
              </span>
              <br />
              Inspire India.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-emerald-100 sm:text-lg">
              Learn from successful Indian farmers, watch practical
              farming classes and discover techniques that can be
              applied directly to your own field.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">

              <button
                onClick={() =>
                  document
                    .getElementById("learning-hub")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
                className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-emerald-800 shadow-xl transition hover:-translate-y-0.5"
              >
                <PlayCircle className="h-5 w-5" />
                Start Learning
              </button>

              <button
                onClick={() => setShowAdmin(true)}
                className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 font-bold text-white backdrop-blur hover:bg-white/20"
              >
                <ShieldCheck className="h-4 w-4" />
                Admin Panel
              </button>

            </div>

          </div>

          {/* HERO STATS */}

          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">

            <HeroStat
              icon={<Users />}
              value={achievements.length}
              label="Farmer Achievers"
            />

            <HeroStat
              icon={<Video />}
              value={courses.length}
              label="Learning Classes"
            />

            <HeroStat
              icon={<BookOpen />}
              value={courses.reduce(
                (sum, c) => sum + c.lessons.length,
                0
              )}
              label="Video Lessons"
            />

            <HeroStat
              icon={<Eye />}
              value={formatNumber(totalViews)}
              label="Story Views"
            />

          </div>
        </div>
      </section>

      {/* =====================================================
          LEARNING HUB
      ===================================================== */}

      <section
        id="learning-hub"
        className="mx-auto max-w-7xl px-5 py-14 sm:px-8"
      >

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

          <div>

            <div className="mb-2 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-emerald-700">
              <GraduationIcon />
              Farmer Learning Hub
            </div>

            <h2 className="text-3xl font-black">
              Learn Farming from Experts
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Watch practical agriculture classes covering crops,
              irrigation, soil health, technology and farm business.
            </p>

          </div>

          <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
            {courses.length} classes available
          </div>

        </div>

        {/* SEARCH */}

        <div className="mb-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-3 lg:flex-row">

            <div className="relative flex-1">

              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search farming classes, crops or topics..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              />

            </div>

            <select
              value={courseCategory}
              onChange={(e) =>
                setCourseCategory(e.target.value)
              }
              className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none focus:border-emerald-500"
            >
              <option value="All">
                All Categories
              </option>

              <option value="Crop Production">
                Crop Production
              </option>

              <option value="Water Management">
                Water Management
              </option>

              <option value="Organic Farming">
                Organic Farming
              </option>

              <option value="Smart Agriculture">
                Smart Agriculture
              </option>
            </select>

          </div>

        </div>

        {/* COURSE GRID */}

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

          {filteredCourses.map((course) => {

            const completed = course.lessons.filter(
              (lesson) =>
                completedLessons.includes(lesson.id)
            ).length;

            const progress = course.lessons.length
              ? Math.round(
                  (completed / course.lessons.length) * 100
                )
              : 0;

            return (
              <CourseCard
                key={course.id}
                course={course}
                progress={progress}
                onOpen={() => openCourse(course)}
              />
            );
          })}

        </div>

        {filteredCourses.length === 0 && (
          <EmptyLearning />
        )}

      </section>

      {/* =====================================================
          FEATURED FARMERS
      ===================================================== */}

      <section className="border-y border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">

          <div className="mb-8">

            <div className="mb-2 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-emerald-700">
              <Trophy className="h-4 w-4" />
              Farmer Achievers
            </div>

            <h2 className="text-3xl font-black">
              Farmers Who Inspire India
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Learn from farmers who have already tested new
              approaches in real fields.
            </p>

          </div>

          <div className="grid gap-6 lg:grid-cols-2">

            {featured.map((farmer) => (
              <FeaturedFarmer
                key={farmer.id}
                farmer={farmer}
                liked={liked.includes(farmer.id)}
                onLike={() =>
                  toggleLike(farmer.id)
                }
                onOpen={() =>
                  setSelectedFarmer(farmer)
                }
              />
            ))}

          </div>

        </div>

      </section>

      {/* =====================================================
          ALL STORIES
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">

        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

          <div>

            <h2 className="text-2xl font-black">
              Recent Farmer Achievements
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Real experiences from farmers across India.
            </p>

          </div>

          <select
            value={achievementCategory}
            onChange={(e) =>
              setAchievementCategory(e.target.value)
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold"
          >
            <option value="All">All Achievements</option>
            <option value="Innovation">
              Innovation
            </option>
            <option value="Organic Farming">
              Organic Farming
            </option>
            <option value="High Productivity">
              High Productivity
            </option>
            <option value="Technology">
              Technology
            </option>
            <option value="Water Saving">
              Water Saving
            </option>
            <option value="Women Farmer">
              Women Farmer
            </option>
            <option value="Entrepreneurship">
              Entrepreneurship
            </option>
          </select>

        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {filteredAchievements.map((farmer) => (
            <AchievementCard
              key={farmer.id}
              farmer={farmer}
              liked={liked.includes(farmer.id)}
              onLike={() =>
                toggleLike(farmer.id)
              }
              onOpen={() =>
                setSelectedFarmer(farmer)
              }
            />
          ))}

        </div>

      </section>

      {/* =====================================================
          FARMER DETAIL
      ===================================================== */}

      {selectedFarmer && (
        <FarmerDetail
          farmer={selectedFarmer}
          liked={liked.includes(selectedFarmer.id)}
          onLike={() =>
            toggleLike(selectedFarmer.id)
          }
          onClose={() =>
            setSelectedFarmer(null)
          }
        />
      )}

      {/* =====================================================
          COURSE PLAYER
      ===================================================== */}

      {selectedCourse && (
        <CoursePlayer
          course={selectedCourse}
          activeLessonIndex={activeLessonIndex}
          completedLessons={completedLessons}
          onLessonChange={setActiveLessonIndex}
          onComplete={toggleLessonComplete}
          onClose={() => setSelectedCourse(null)}
        />
      )}

      {/* =====================================================
          ADMIN PANEL
      ===================================================== */}

      {showAdmin && (
        <AdminPanel
          courses={courses}
          onClose={() => setShowAdmin(false)}
          onAdd={() => {
            setEditingCourse(null);
            setShowCourseForm(true);
          }}
          onEdit={(course) => {
            setEditingCourse(course);
            setShowCourseForm(true);
          }}
          onDelete={deleteCourse}
          onTogglePublish={(id) =>
            setCourses((prev) =>
              prev.map((course) =>
                course.id === id
                  ? {
                      ...course,
                      published: !course.published,
                    }
                  : course
              )
            )
          }
        />
      )}

      {/* =====================================================
          COURSE FORM
      ===================================================== */}

      {showCourseForm && (
        <CourseForm
          course={editingCourse}
          onClose={() => {
            setShowCourseForm(false);
            setEditingCourse(null);
          }}
          onSave={saveCourse}
        />
      )}

    </div>
  );
}

/* =========================================================
   COURSE CARD
========================================================= */

function CourseCard({
  course,
  progress,
  onOpen,
}: {
  course: FarmingCourse;
  progress: number;
  onOpen: () => void;
}) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">

      <div className="relative h-48 overflow-hidden">

        <img
          src={course.image}
          alt={course.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />

        <div className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-black text-emerald-700">
          {course.level}
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex justify-between text-xs font-bold text-white">

          <span className="flex items-center gap-1">
            <PlayCircle className="h-4 w-4" />
            {course.lessons.length} lessons
          </span>

          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {course.duration}
          </span>

        </div>

      </div>

      <div className="p-5">

        <div className="text-xs font-black uppercase tracking-wide text-emerald-700">
          {course.category}
        </div>

        <h3 className="mt-2 line-clamp-2 min-h-[52px] text-lg font-black">
          {course.title}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
          {course.description}
        </p>

        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <Users className="h-4 w-4" />
          {course.students.toLocaleString()} farmers learning
        </div>

        {progress > 0 && (
          <div className="mt-4">

            <div className="mb-1 flex justify-between text-xs font-bold">
              <span>Your progress</span>
              <span>{progress}%</span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100">

              <div
                className="h-full rounded-full bg-emerald-600 transition-all"
                style={{
                  width: `${progress}%`,
                }}
              />

            </div>

          </div>
        )}

        <button
          onClick={onOpen}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-sm font-black text-white transition hover:bg-emerald-800"
        >
          <Play className="h-4 w-4 fill-current" />
          Watch Class
        </button>

      </div>
    </article>
  );
}

/* =========================================================
   COURSE PLAYER
========================================================= */

function CoursePlayer({
  course,
  activeLessonIndex,
  completedLessons,
  onLessonChange,
  onComplete,
  onClose,
}: {
  course: FarmingCourse;
  activeLessonIndex: number;
  completedLessons: string[];
  onLessonChange: (index: number) => void;
  onComplete: (id: string) => void;
  onClose: () => void;
}) {
  const lesson = course.lessons[activeLessonIndex];

  const completedCount = course.lessons.filter(
    (item) => completedLessons.includes(item.id)
  ).length;

  const progress = Math.round(
    (completedCount / course.lessons.length) * 100
  );

  return (
    <div className="fixed inset-0 z-[150] overflow-y-auto bg-slate-950/80 p-3 backdrop-blur-sm sm:p-6">

      <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-[#f7faf7] shadow-2xl">

        {/* HEADER */}

        <header className="flex items-center justify-between border-b bg-white px-5 py-4">

          <div>

            <div className="text-xs font-black uppercase tracking-wider text-emerald-700">
              AgriGo Learning Class
            </div>

            <h2 className="mt-1 text-lg font-black sm:text-xl">
              {course.title}
            </h2>

          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200"
          >
            <X className="h-5 w-5" />
          </button>

        </header>

        <div className="grid lg:grid-cols-[300px_1fr]">

          {/* LESSON SIDEBAR */}

          <aside className="border-b bg-white lg:border-b-0 lg:border-r">

            <div className="p-5">

              <div className="mb-3 flex justify-between text-sm font-bold">
                <span>Your Progress</span>
                <span className="text-emerald-700">
                  {progress}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                <div
                  className="h-full rounded-full bg-emerald-600"
                  style={{
                    width: `${progress}%`,
                  }}
                />

              </div>

            </div>

            <div className="max-h-[500px] overflow-y-auto">

              {course.lessons.map((item, index) => {

                const done = completedLessons.includes(
                  item.id
                );

                return (
                  <button
                    key={item.id}
                    onClick={() =>
                      onLessonChange(index)
                    }
                    className={`flex w-full gap-3 border-t px-5 py-4 text-left transition ${
                      activeLessonIndex === index
                        ? "bg-emerald-50"
                        : "hover:bg-slate-50"
                    }`}
                  >

                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                        done
                          ? "bg-emerald-600 text-white"
                          : activeLessonIndex === index
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {done ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        index + 1
                      )}
                    </span>

                    <span>

                      <span className="block text-sm font-bold">
                        {item.title}
                      </span>

                      <span className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="h-3 w-3" />
                        {item.duration}
                      </span>

                    </span>

                  </button>
                );
              })}

            </div>

          </aside>

          {/* VIDEO */}

          <main className="p-4 sm:p-6">

            <div className="overflow-hidden rounded-2xl bg-black shadow-xl">

              {getYouTubeEmbedUrl(lesson.videoUrl) ? (

                <div className="aspect-video">

                  <iframe
                    src={getYouTubeEmbedUrl(
                      lesson.videoUrl
                    )}
                    title={lesson.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />

                </div>

              ) : (

                <div className="flex aspect-video items-center justify-center text-center text-white">

                  <div>

                    <Video className="mx-auto h-12 w-12 text-emerald-400" />

                    <p className="mt-3 font-bold">
                      Video is not available
                    </p>

                  </div>

                </div>

              )}

            </div>

            <div className="mt-6">

              <div className="flex flex-wrap items-center gap-2">

                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                  Lesson {activeLessonIndex + 1}
                </span>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  {lesson.duration}
                </span>

              </div>

              <h3 className="mt-3 text-2xl font-black">
                {lesson.title}
              </h3>

              <p className="mt-2 max-w-3xl leading-7 text-slate-600">
                {lesson.description}
              </p>

            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <button
                onClick={() =>
                  onComplete(lesson.id)
                }
                className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-black ${
                  completedLessons.includes(
                    lesson.id
                  )
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-emerald-700 text-white hover:bg-emerald-800"
                }`}
              >
                <CheckCircle2 className="h-5 w-5" />

                {completedLessons.includes(
                  lesson.id
                )
                  ? "Lesson Completed"
                  : "Mark Lesson Complete"}
              </button>

              <div className="flex gap-2">

                <button
                  disabled={activeLessonIndex === 0}
                  onClick={() =>
                    onLessonChange(
                      Math.max(
                        0,
                        activeLessonIndex - 1
                      )
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  disabled={
                    activeLessonIndex ===
                    course.lessons.length - 1
                  }
                  onClick={() =>
                    onLessonChange(
                      Math.min(
                        course.lessons.length - 1,
                        activeLessonIndex + 1
                      )
                    )
                  }
                  className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>

              </div>

            </div>

          </main>

        </div>

      </div>
    </div>
  );
}

/* =========================================================
   ADMIN PANEL
========================================================= */

function AdminPanel({
  courses,
  onClose,
  onAdd,
  onEdit,
  onDelete,
  onTogglePublish,
}: {
  courses: FarmingCourse[];
  onClose: () => void;
  onAdd: () => void;
  onEdit: (course: FarmingCourse) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (id: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-[180] overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm">

      <div className="mx-auto my-5 max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl">

        <header className="flex items-center justify-between bg-slate-950 px-5 py-5 text-white sm:px-7">

          <div>

            <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              AgriGo Administration
            </div>

            <h2 className="mt-1 text-2xl font-black">
              Farming Learning Classes
            </h2>

          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

        </header>

        <div className="p-5 sm:p-7">

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h3 className="text-xl font-black">
                Manage Farmer Classes
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Add YouTube farming classes and make them
                available to farmers.
              </p>

            </div>

            <button
              onClick={onAdd}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-black text-white hover:bg-emerald-800"
            >
              <Plus className="h-4 w-4" />
              Add New Class
            </button>

          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">

            <table className="w-full min-w-[850px]">

              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">

                <tr>
                  <th className="px-5 py-4">Class</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Lessons</th>
                  <th className="px-5 py-4">Students</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {courses.map((course) => (

                  <tr
                    key={course.id}
                    className="hover:bg-slate-50"
                  >

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <img
                          src={course.image}
                          alt=""
                          className="h-12 w-16 rounded-lg object-cover"
                        />

                        <div>

                          <div className="max-w-xs font-bold">
                            {course.title}
                          </div>

                          <div className="text-xs text-slate-400">
                            {course.instructor}
                          </div>

                        </div>

                      </div>

                    </td>

                    <td className="px-5 py-4 text-sm">
                      {course.category}
                    </td>

                    <td className="px-5 py-4 text-sm font-bold">
                      {course.lessons.length}
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {course.students}
                    </td>

                    <td className="px-5 py-4">

                      <button
                        onClick={() =>
                          onTogglePublish(course.id)
                        }
                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                          course.published
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {course.published
                          ? "Published"
                          : "Draft"}
                      </button>

                    </td>

                    <td className="px-5 py-4">

                      <div className="flex gap-2">

                        <button
                          onClick={() =>
                            onEdit(course)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                          title="Edit"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() =>
                            onDelete(course.id)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>

                      </div>

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
   COURSE FORM
========================================================= */

function CourseForm({
  course,
  onClose,
  onSave,
}: {
  course: FarmingCourse | null;
  onClose: () => void;
  onSave: (course: FarmingCourse) => void;
}) {
  const [title, setTitle] = useState(
    course?.title || ""
  );

  const [description, setDescription] = useState(
    course?.description || ""
  );

  const [instructor, setInstructor] = useState(
    course?.instructor || ""
  );

  const [category, setCategory] = useState(
    course?.category || "Crop Production"
  );

  const [crop, setCrop] = useState(
    course?.crop || "Multiple Crops"
  );

  const [level, setLevel] =
    useState<CourseLevel>(
      course?.level || "Beginner"
    );

  const [duration, setDuration] = useState(
    course?.duration || "30 min"
  );

  const [language, setLanguage] = useState(
    course?.language || "Hindi + English"
  );

  const [image, setImage] = useState(
    course?.image ||
      "https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=1000&q=85"
  );

  const [certificate, setCertificate] = useState(
    course?.certificate || false
  );

  const [published, setPublished] = useState(
    course?.published ?? true
  );

  const [lessonsText, setLessonsText] =
    useState(
      course
        ? course.lessons
            .map(
              (lesson) =>
                `${lesson.title} | ${lesson.duration} | ${lesson.description} | ${lesson.videoUrl}`
            )
            .join("\n")
        : ""
    );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter a class title.");
      return;
    }

    const lines = lessonsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const lessons: Lesson[] = lines.map(
      (line, index) => {
        const parts = line.split("|");

        return {
          id:
            course?.lessons[index]?.id ||
            `lesson-${Date.now()}-${index}`,

          title:
            parts[0]?.trim() ||
            `Lesson ${index + 1}`,

          duration:
            parts[1]?.trim() || "10 min",

          description:
            parts[2]?.trim() ||
            "Practical farming lesson for AgriGo farmers.",

          videoUrl:
            parts[3]?.trim() || "",
        };
      }
    );

    const newCourse: FarmingCourse = {
      id:
        course?.id ||
        `course-${Date.now()}`,

      title: title.trim(),

      description:
        description.trim(),

      instructor:
        instructor.trim() ||
        "AgriGo Agriculture Expert",

      category,

      crop,

      level,

      duration,

      language,

      image,

      lessons,

      certificate,

      students: course?.students || 0,

      published,
    };

    onSave(newCourse);
  };

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">

      <div className="mx-auto my-5 max-w-4xl rounded-3xl bg-white shadow-2xl">

        <header className="flex items-center justify-between border-b p-5">

          <div>

            <h2 className="text-2xl font-black">
              {course
                ? "Edit Farming Class"
                : "Add New Farming Class"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add practical farming videos for AgriGo farmers.
            </p>

          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>

        </header>

        <form
          onSubmit={submit}
          className="space-y-6 p-5 sm:p-7"
        >

          <div className="grid gap-5 sm:grid-cols-2">

            <Field
              label="Class Title *"
              value={title}
              onChange={setTitle}
              placeholder="Example: Modern Tomato Farming"
            />

            <Field
              label="Instructor"
              value={instructor}
              onChange={setInstructor}
              placeholder="Agriculture Expert"
            />

            <Field
              label="Crop"
              value={crop}
              onChange={setCrop}
              placeholder="Tomato / Rice / Wheat"
            />

            <Field
              label="Duration"
              value={duration}
              onChange={setDuration}
              placeholder="45 min"
            />

            <div>

              <label className="mb-2 block text-xs font-bold">
                Category
              </label>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm"
              >
                <option>Crop Production</option>
                <option>Water Management</option>
                <option>Organic Farming</option>
                <option>Smart Agriculture</option>
                <option>Farm Business</option>
                <option>Pest Management</option>
                <option>Soil Health</option>
              </select>

            </div>

            <div>

              <label className="mb-2 block text-xs font-bold">
                Level
              </label>

              <select
                value={level}
                onChange={(e) =>
                  setLevel(
                    e.target.value as CourseLevel
                  )
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>

            </div>

          </div>

          <TextField
            label="Class Description"
            value={description}
            onChange={setDescription}
            placeholder="Describe what farmers will learn..."
          />

          <div className="grid gap-5 sm:grid-cols-2">

            <Field
              label="Language"
              value={language}
              onChange={setLanguage}
              placeholder="Kannada + English"
            />

            <Field
              label="Cover Image URL"
              value={image}
              onChange={setImage}
              placeholder="https://..."
            />

          </div>

          {/* LESSONS */}

          <div>

            <label className="mb-2 block text-sm font-black">
              Lessons + YouTube Videos
            </label>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">

              <p className="text-xs leading-6 text-emerald-800">

                Add one lesson per line using this format:

                <br />

                <strong>
                  Lesson Title | Duration | Description | YouTube URL
                </strong>

              </p>

              <textarea
                value={lessonsText}
                onChange={(e) =>
                  setLessonsText(e.target.value)
                }
                rows={8}
                placeholder={`Seed Selection | 10 min | Learn seed selection | https://www.youtube.com/watch?v=VIDEO_ID
Field Preparation | 12 min | Prepare the field | https://www.youtube.com/watch?v=VIDEO_ID`}
                className="mt-4 w-full rounded-xl border border-emerald-200 bg-white p-4 font-mono text-xs outline-none focus:ring-4 focus:ring-emerald-100"
              />

            </div>

          </div>

          <div className="flex flex-wrap gap-5">

            <label className="flex cursor-pointer items-center gap-2 text-sm font-bold">

              <input
                type="checkbox"
                checked={certificate}
                onChange={(e) =>
                  setCertificate(e.target.checked)
                }
                className="h-4 w-4 accent-emerald-600"
              />

              Certificate available

            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-bold">

              <input
                type="checkbox"
                checked={published}
                onChange={(e) =>
                  setPublished(e.target.checked)
                }
                className="h-4 w-4 accent-emerald-600"
              />

              Publish immediately

            </label>

          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-black text-white hover:bg-emerald-800"
            >
              <CheckCircle2 className="h-4 w-4" />
              {course
                ? "Save Changes"
                : "Publish Class"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

/* =========================================================
   FEATURED FARMER
========================================================= */

function FeaturedFarmer({
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
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

      <div className="relative h-72">

        <img
          src={farmer.image}
          alt={farmer.farmerName}
          className="h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

        <button
          onClick={onLike}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-rose-500"
        >
          <Heart
            className={`h-5 w-5 ${
              liked ? "fill-current" : ""
            }`}
          />
        </button>

        <div className="absolute bottom-5 left-5 text-white">

          <div className="flex items-center gap-2 text-xs font-bold text-green-200">
            <MapPin className="h-4 w-4" />
            {farmer.district}, {farmer.state}
          </div>

          <h3 className="mt-1 text-2xl font-black">
            {farmer.farmerName}
          </h3>

        </div>

      </div>

      <div className="p-5">

        <h4 className="text-lg font-black">
          {farmer.achievementTitle}
        </h4>

        <div className="mt-4 grid grid-cols-3 gap-3">

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
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-sm font-black text-white"
        >
          Read Farmer Story
          <ChevronRight className="h-4 w-4" />
        </button>

      </div>

    </article>
  );
}

/* =========================================================
   ACHIEVEMENT CARD
========================================================= */

function AchievementCard({
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
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">

      <div className="relative h-52">

        <img
          src={farmer.image}
          alt={farmer.farmerName}
          className="h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

        <div className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700">
          {farmer.achievementType}
        </div>

        <button
          onClick={onLike}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-rose-500"
        >
          <Heart
            className={`h-4 w-4 ${
              liked ? "fill-current" : ""
            }`}
          />
        </button>

        <div className="absolute bottom-4 left-4 text-white">

          <div className="text-xs text-white/80">
            {farmer.district}, {farmer.state}
          </div>

          <h3 className="mt-1 text-xl font-black">
            {farmer.farmerName}
          </h3>

        </div>

      </div>

      <div className="p-5">

        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
          <Leaf className="h-4 w-4" />
          {farmer.crop}
        </div>

        <h4 className="mt-2 line-clamp-2 min-h-[48px] font-black">
          {farmer.achievementTitle}
        </h4>

        <div className="mt-4 grid grid-cols-2 gap-2">

          <MiniMetric
            value={`+${farmer.incomeGrowth}%`}
            label="Income Growth"
          />

          <MiniMetric
            value={`₹${formatNumber(
              farmer.currentIncome
            )}`}
            label="Current Income"
          />

        </div>

        <button
          onClick={onOpen}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 py-3 text-sm font-bold text-emerald-700 hover:bg-emerald-50"
        >
          View Achievement
          <ChevronRight className="h-4 w-4" />
        </button>

      </div>

    </article>
  );
}

/* =========================================================
   FARMER DETAIL
========================================================= */

function FarmerDetail({
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
    <div className="fixed inset-0 z-[140] overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">

      <div className="mx-auto my-6 max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">

        <div className="relative h-80">

          <img
            src={farmer.image}
            alt={farmer.farmerName}
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            onClick={onLike}
            className="absolute right-16 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-rose-500"
          >
            <Heart
              className={`h-5 w-5 ${
                liked ? "fill-current" : ""
              }`}
            />
          </button>

          <div className="absolute bottom-6 left-5 text-white sm:left-8">

            <div className="flex flex-wrap gap-2">

              <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold">
                {farmer.achievementType}
              </span>

              {farmer.isVerified && (
                <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700">
                  <BadgeCheck className="h-3 w-3" />
                  Verified
                </span>
              )}

            </div>

            <h2 className="mt-2 text-3xl font-black">
              {farmer.farmerName}
            </h2>

            <div className="mt-2 flex flex-wrap gap-4 text-sm text-white/85">

              <span>
                {farmer.village}, {farmer.district}
              </span>

              <span>
                {farmer.crop}
              </span>

              <span>
                {farmer.experienceYears} years experience
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

          <div className="mt-7 grid gap-3 sm:grid-cols-4">

            <Performance
              icon={<TrendingUp />}
              value={`+${farmer.incomeGrowth}%`}
              label="Income growth"
            />

            <Performance
              icon={<BarChart3 />}
              value={`+${farmer.productivityImprovement}%`}
              label="Productivity"
            />

            <Performance
              icon={<Droplets />}
              value={`${farmer.waterSaving}%`}
              label="Water saved"
            />

            <Performance
              icon={<IndianRupee />}
              value={`${farmer.costReduction}%`}
              label="Cost reduced"
            />

          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">

            <Story
              number="01"
              title="Challenge"
              text={farmer.challenge}
            />

            <Story
              number="02"
              title="Solution"
              text={farmer.solution}
            />

            <Story
              number="03"
              title="Result"
              text={farmer.result}
            />

          </div>

          <div className="mt-6 rounded-2xl bg-emerald-50 p-5">

            <div className="flex gap-3">

              <Star className="h-5 w-5 shrink-0 text-emerald-600" />

              <div>

                <h4 className="font-black text-emerald-900">
                  Farmer's Advice
                </h4>

                <p className="mt-2 leading-7 text-emerald-800">
                  “{farmer.advice}”
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function HeroStat({
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

      <div className="mb-3 text-lime-300">
        {React.isValidElement<{ className?: string }>(icon)
          ? React.cloneElement(icon, {
              className: [icon.props.className, "h-5 w-5"].filter(Boolean).join(" "),
            })
          : icon}
      </div>

      <div className="text-2xl font-black text-white">
        {value}
      </div>

      <div className="mt-1 text-xs text-emerald-100">
        {label}
      </div>

    </div>
  );
}

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

      <div className="mt-1 text-[10px] text-slate-500">
        {label}
      </div>

    </div>
  );
}

function Performance({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl bg-emerald-50 p-4">

      <div className="text-emerald-600">
        {React.isValidElement<{ className?: string }>(icon)
          ? React.cloneElement(icon, {
              className: [icon.props.className, "h-5 w-5"].filter(Boolean).join(" "),
            })
          : icon}
      </div>

      <div className="mt-2 text-xl font-black text-emerald-900">
        {value}
      </div>

      <div className="text-xs text-emerald-700">
        {label}
      </div>

    </div>
  );
}

function Story({
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

      <h4 className="mt-2 font-black">
        {title}
      </h4>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {text}
      </p>

    </div>
  );
}

function Field({
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

      <span className="mb-2 block text-xs font-bold">
        {label}
      </span>

      <input
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
      />

    </label>
  );
}

function TextField({
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

      <span className="mb-2 block text-xs font-bold">
        {label}
      </span>

      <textarea
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        rows={4}
        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
      />

    </label>
  );
}

function EmptyLearning() {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-16 text-center">

      <Video className="mx-auto h-12 w-12 text-slate-300" />

      <h3 className="mt-4 text-xl font-black">
        No classes found
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        Try another crop, category or search term.
      </p>

    </div>
  );
}

function GraduationIcon() {
  return (
    <BookOpen className="h-4 w-4" />
  );
}

function formatNumber(value: number) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }

  return value.toString();
}

/* =========================================================
   YOUTUBE URL CONVERTER
========================================================= */

function getYouTubeEmbedUrl(
  url?: string
): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    let videoId = "";

    if (
      parsed.hostname.includes("youtube.com")
    ) {
      videoId =
        parsed.searchParams.get("v") || "";

      if (
        parsed.pathname.startsWith(
          "/embed/"
        )
      ) {
        videoId =
          parsed.pathname.split("/embed/")[1];
      }

      if (
        parsed.pathname.startsWith("/shorts/")
      ) {
        videoId =
          parsed.pathname.split("/shorts/")[1];
      }
    }

    if (
      parsed.hostname === "youtu.be"
    ) {
      videoId =
        parsed.pathname.replace("/", "");
    }

    videoId = videoId.split("&")[0];

    if (!videoId) return null;

    return `https://www.youtube-nocookie.com/embed/${videoId}`;
  } catch {
    return null;
  }
}