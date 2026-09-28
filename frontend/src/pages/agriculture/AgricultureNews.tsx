import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Newspaper,
  ExternalLink,
  Search,
  Bookmark,
  BookmarkCheck,
  Bell,
  BellRing,
  TrendingUp,
  TrendingDown,
  CloudRain,
  CloudSun,
  Sprout,
  Store,
  Landmark,
  Cpu,
  MapPin,
  Clock3,
  Eye,
  Share2,
  RefreshCw,
  X,
  ChevronRight,
  ArrowUpRight,
  AlertTriangle,
  CalendarDays,
  Flame,
  Globe2,
  Radio,
  SlidersHorizontal,
  Plus,
  Send,
  Tag,
  Link2,
  Map,
  FileText,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import { AgriculturePageHeader } from "@/components/agriculture/AgriculturePageHeader";
import { EmptyState } from "@/components/agriculture/EmptyState";
import { LoadingState } from "@/components/agriculture/Loadingstate";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { agricultureApi, formatDate } from "@/services/agricultureApi";

const categories = [
  "all",
  "policy",
  "market",
  "weather",
  "technology",
] as const;

type Category = (typeof categories)[number];

type NewsItem = {
  id: string | number;
  title: string;
  summary: string;
  source: string;
  url: string;
  category: Category | string;
  publishedAt: string;
};

type NewsWithMeta = NewsItem & {
  region: string;
  readTime: number;
  views: number;
  featured: boolean;
  urgent: boolean;
  tags: string[];
};

type CreateNewsPayload = {
  title: string;
  summary: string;
  source: string;
  url: string;
  category: string;
  region: string;
  readTime: number;
  featured: boolean;
  urgent: boolean;
  tags: string[];
};

const API_BASE = (
  import.meta.env.VITE_API_URL || "/api"
).replace(/\/$/, "");

const NEWS_ENDPOINT =
  import.meta.env.VITE_AGRI_NEWS_API ||
  `${API_BASE}/agriculture/news/`;

const fallbackNews: NewsWithMeta[] = [
  {
    id: "demo-1",
    title:
      "Weather advisory: rainfall expected across major farming districts",
    summary:
      "Farmers should monitor field drainage, postpone unnecessary spraying during rainfall windows and review irrigation schedules.",
    source: "Agri Advisory Desk",
    url: "#",
    category: "weather",
    publishedAt: new Date().toISOString(),
    region: "Karnataka",
    readTime: 4,
    views: 1240,
    featured: true,
    urgent: true,
    tags: ["rainfall", "irrigation", "advisory"],
  },
  {
    id: "demo-2",
    title:
      "Market watch: crop price movement and selling opportunities",
    summary:
      "Compare recent market movements before deciding where and when to sell your produce.",
    source: "Mandi Intelligence",
    url: "#",
    category: "market",
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    region: "Karnataka",
    readTime: 5,
    views: 980,
    featured: true,
    urgent: false,
    tags: ["mandi", "prices", "selling"],
  },
  {
    id: "demo-3",
    title:
      "New agriculture technology tools are improving farm decisions",
    summary:
      "Digital farm records, sensors and decision-support systems are becoming increasingly useful for precision farming.",
    source: "AgriTech Journal",
    url: "#",
    category: "technology",
    publishedAt: new Date(Date.now() - 172800000).toISOString(),
    region: "India",
    readTime: 6,
    views: 740,
    featured: false,
    urgent: false,
    tags: ["AI", "precision farming", "technology"],
  },
];

function getAuthHeaders(): Record<string, string> {
  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

function getCsrfToken() {
  const match = document.cookie.match(
    /(?:^|;\s*)csrftoken=([^;]*)/
  );

  return match ? decodeURIComponent(match[1]) : "";
}

async function createNews(
  payload: CreateNewsPayload
): Promise<NewsWithMeta> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
  };

  const csrf = getCsrfToken();

  if (csrf) {
    headers["X-CSRFToken"] = csrf;
  }

  const response = await fetch(NEWS_ENDPOINT, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = "Unable to publish agriculture news.";

    try {
      const error = await response.json();

      if (typeof error?.detail === "string") {
        message = error.detail;
      } else if (typeof error?.message === "string") {
        message = error.message;
      } else if (typeof error === "object") {
        message = Object.entries(error)
          .map(([key, value]) => `${key}: ${String(value)}`)
          .join(" | ");
      }
    } catch {
      // Ignore JSON parsing error.
    }

    throw new Error(message);
  }

  const data = await response.json();

  return normalizeNewsItem(data);
}

function normalizeNewsItem(
  item: any,
  index = 0
): NewsWithMeta {
  return {
    id: item.id ?? index + 1,
    title: item.title ?? "Agriculture update",
    summary:
      item.summary ??
      item.description ??
      "Agriculture information update.",
    source:
      item.source ??
      item.publisher ??
      "Agriculture Information Desk",
    url: item.url ?? item.link ?? "#",
    category: item.category ?? "policy",
    publishedAt:
      item.publishedAt ??
      item.published_at ??
      item.created_at ??
      new Date().toISOString(),
    region: item.region ?? "India",
    readTime: Number(item.readTime ?? item.read_time ?? 4),
    views: Number(item.views ?? item.view_count ?? 0),
    featured: Boolean(item.featured),
    urgent: Boolean(item.urgent),
    tags: Array.isArray(item.tags)
      ? item.tags
      : typeof item.tags === "string"
      ? item.tags
          .split(",")
          .map((tag: string) => tag.trim())
          .filter(Boolean)
      : ["agriculture"],
  };
}

function normalizeNews(data: unknown): NewsWithMeta[] {
  if (Array.isArray(data)) {
    return data.map((item, index) =>
      normalizeNewsItem(item, index)
    );
  }

  if (
    data &&
    typeof data === "object" &&
    Array.isArray((data as any).results)
  ) {
    return (data as any).results.map(
      (item: any, index: number) =>
        normalizeNewsItem(item, index)
    );
  }

  if (
    data &&
    typeof data === "object" &&
    Array.isArray((data as any).news)
  ) {
    return (data as any).news.map(
      (item: any, index: number) =>
        normalizeNewsItem(item, index)
    );
  }

  return fallbackNews;
}

function getCategoryIcon(category: string) {
  switch (category) {
    case "market":
      return Store;
    case "weather":
      return CloudRain;
    case "technology":
      return Cpu;
    case "policy":
      return Landmark;
    default:
      return Sprout;
  }
}

function getCategoryLabel(category: string) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

function formatViews(value: number) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }

  return String(value);
}

function getRelativeTime(date: string) {
  const timestamp = new Date(date).getTime();

  if (Number.isNaN(timestamp)) {
    return "Recently";
  }

  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  return formatDate(date);
}

function isUserAdmin() {
  const role =
    localStorage.getItem("role") ||
    localStorage.getItem("user_role") ||
    localStorage.getItem("userRole");

  return [
    "admin",
    "administrator",
    "superadmin",
    "super_admin",
  ].includes(String(role).toLowerCase());
}

export default function AgricultureNews() {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["agri-news"],
    queryFn: agricultureApi.getNews,
  });

  const [category, setCategory] =
    useState<Category>("all");

  const [search, setSearch] = useState("");

  const [region, setRegion] = useState("all");

  const [sort, setSort] = useState<
    "latest" | "popular" | "important"
  >("latest");

  const [bookmarks, setBookmarks] = useState<string[]>([]);

  const [readArticles, setReadArticles] = useState<string[]>(
    []
  );

  const [selectedArticle, setSelectedArticle] =
    useState<NewsWithMeta | null>(null);

  const [showFilters, setShowFilters] = useState(false);

  const [notificationsEnabled, setNotificationsEnabled] =
    useState(true);

  const [showBookmarkedOnly, setShowBookmarkedOnly] =
    useState(false);

  const [visibleCount, setVisibleCount] = useState(8);

  const [showAddNews, setShowAddNews] = useState(false);

  const [adminError, setAdminError] = useState("");

  const [newNews, setNewNews] =
    useState<CreateNewsPayload>({
      title: "",
      summary: "",
      source: "",
      url: "",
      category: "policy",
      region: "Karnataka",
      readTime: 4,
      featured: false,
      urgent: false,
      tags: [],
    });

  const [tagInput, setTagInput] = useState("");

  const admin = isUserAdmin();

  const news = useMemo(
    () => normalizeNews(data),
    [data]
  );

  const createNewsMutation = useMutation({
    mutationFn: createNews,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["agri-news"],
      });

      setShowAddNews(false);

      setNewNews({
        title: "",
        summary: "",
        source: "",
        url: "",
        category: "policy",
        region: "Karnataka",
        readTime: 4,
        featured: false,
        urgent: false,
        tags: [],
      });

      setTagInput("");
      setAdminError("");
    },

    onError: (error: Error) => {
      setAdminError(
        error.message ||
          "Unable to publish the news."
      );
    },
  });

  const regions = useMemo(() => {
    return [
      "all",
      ...Array.from(
        new Set(news.map((item) => item.region))
      ),
    ];
  }, [news]);

  const filteredNews = useMemo(() => {
    const query = search.trim().toLowerCase();

    let result = news.filter((item) => {
      const matchesCategory =
        category === "all" ||
        item.category.toLowerCase() === category;

      const matchesRegion =
        region === "all" ||
        item.region.toLowerCase() ===
          region.toLowerCase();

      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query) ||
        item.source.toLowerCase().includes(query) ||
        item.tags.some((tag) =>
          tag.toLowerCase().includes(query)
        );

      const matchesBookmark =
        !showBookmarkedOnly ||
        bookmarks.includes(String(item.id));

      return (
        matchesCategory &&
        matchesRegion &&
        matchesSearch &&
        matchesBookmark
      );
    });

    result = [...result].sort((a, b) => {
      if (sort === "popular") {
        return b.views - a.views;
      }

      if (sort === "important") {
        return (
          Number(b.urgent) -
          Number(a.urgent)
        );
      }

      return (
        new Date(b.publishedAt).getTime() -
        new Date(a.publishedAt).getTime()
      );
    });

    return result;
  }, [
    news,
    category,
    region,
    search,
    sort,
    bookmarks,
    showBookmarkedOnly,
  ]);

  const visibleNews = filteredNews.slice(
    0,
    visibleCount
  );

  const featuredNews = news.filter(
    (item) => item.featured
  );

  const urgentNews = news.filter(
    (item) => item.urgent
  );

  const marketNews = news.filter(
    (item) => item.category === "market"
  );

  const weatherNews = news.filter(
    (item) => item.category === "weather"
  );

  const toggleBookmark = (
    id: string | number
  ) => {
    const key = String(id);

    setBookmarks((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key]
    );
  };

  const markAsRead = (
    id: string | number
  ) => {
    const key = String(id);

    setReadArticles((current) =>
      current.includes(key)
        ? current
        : [...current, key]
    );
  };

  const openArticle = (
    article: NewsWithMeta
  ) => {
    markAsRead(article.id);
    setSelectedArticle(article);
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setRegion("all");
    setSort("latest");
    setShowBookmarkedOnly(false);
    setVisibleCount(8);
  };

  const shareArticle = async (
    article: NewsWithMeta
  ) => {
    const shareData = {
      title: article.title,
      text: article.summary,
      url: article.url,
    };

    try {
      if (
        navigator.share &&
        article.url !== "#"
      ) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(
          `${article.title}\n${article.url}`
        );
      }
    } catch {
      // User cancelled sharing.
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();

    if (!tag) return;

    if (
      !newNews.tags.some(
        (existing) =>
          existing.toLowerCase() ===
          tag.toLowerCase()
      )
    ) {
      setNewNews((current) => ({
        ...current,
        tags: [...current.tags, tag],
      }));
    }

    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setNewNews((current) => ({
      ...current,
      tags: current.tags.filter(
        (item) => item !== tag
      ),
    }));
  };

  const handlePublish = () => {
    setAdminError("");

    if (!newNews.title.trim()) {
      setAdminError("Please enter a news title.");
      return;
    }

    if (!newNews.summary.trim()) {
      setAdminError(
        "Please enter a news summary."
      );
      return;
    }

    if (!newNews.source.trim()) {
      setAdminError(
        "Please enter the news source."
      );
      return;
    }

    if (!newNews.region.trim()) {
      setAdminError(
        "Please enter the target region."
      );
      return;
    }

    if (
      newNews.url &&
      !/^https?:\/\/.+/i.test(newNews.url)
    ) {
      setAdminError(
        "News URL must start with http:// or https://"
      );
      return;
    }

    if (newNews.tags.length === 0) {
      setAdminError(
        "Add at least one news tag."
      );
      return;
    }

    createNewsMutation.mutate({
      ...newNews,
      title: newNews.title.trim(),
      summary: newNews.summary.trim(),
      source: newNews.source.trim(),
      region: newNews.region.trim(),
      url: newNews.url.trim(),
    });
  };

  return (
    <div className="agri-news-page">
      <style>{`
        .agri-news-page {
          --ag-green: #1f6b45;
          --ag-green-dark: #164c33;
          --ag-green-soft: #eaf6ee;
          --ag-border: #dce9df;
          --ag-text: #17382a;
          --ag-muted: #718078;
          --ag-orange: #d8872c;
          --ag-red: #c44c43;

          min-height: 100vh;
          padding: 24px;
          background:
            radial-gradient(
              circle at 10% 0%,
              rgba(93, 160, 93, 0.12),
              transparent 28%
            ),
            linear-gradient(
              135deg,
              #f5faf5 0%,
              #eef7f1 45%,
              #fbfcf8 100%
            );
          color: var(--ag-text);
        }

        .agri-news-shell {
          max-width: 1500px;
          margin: 0 auto;
        }

        .news-dashboard {
          margin-top: 18px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }

        .news-stat {
          position: relative;
          overflow: hidden;
          background: rgba(255,255,255,.94);
          border: 1px solid var(--ag-border);
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 8px 28px rgba(24,69,43,.055);
          transition: .18s ease;
        }

        .news-stat:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(24,69,43,.1);
        }

        .news-stat::after {
          content: "";
          position: absolute;
          width: 90px;
          height: 90px;
          border-radius: 50%;
          right: -30px;
          bottom: -40px;
          background: rgba(63,135,81,.08);
        }

        .news-stat-top {
          display:flex;
          justify-content:space-between;
          align-items:center;
          color:var(--ag-muted);
          font-size:11px;
          font-weight:800;
          text-transform:uppercase;
          letter-spacing:.7px;
        }

        .news-stat-icon {
          width:36px;
          height:36px;
          display:grid;
          place-items:center;
          border-radius:11px;
          background:var(--ag-green-soft);
          color:var(--ag-green);
        }

        .news-stat-value {
          margin-top:11px;
          font-size:30px;
          font-weight:900;
        }

        .news-stat-sub {
          margin-top:4px;
          color:var(--ag-muted);
          font-size:11px;
        }

        .admin-banner {
          margin-top:18px;
          padding:16px 18px;
          border-radius:20px;
          background:
            linear-gradient(
              135deg,
              #173f2b,
              #2f7950
            );
          color:white;
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:16px;
          box-shadow:0 15px 35px rgba(23,73,47,.15);
        }

        .admin-banner-left {
          display:flex;
          align-items:center;
          gap:12px;
        }

        .admin-banner-icon {
          width:42px;
          height:42px;
          display:grid;
          place-items:center;
          border-radius:13px;
          background:rgba(255,255,255,.13);
        }

        .admin-banner strong {
          display:block;
          font-size:13px;
        }

        .admin-banner span {
          display:block;
          margin-top:3px;
          font-size:10px;
          color:rgba(255,255,255,.75);
        }

        .news-toolbar {
          margin-top:18px;
          padding:14px;
          display:flex;
          align-items:center;
          gap:10px;
          flex-wrap:wrap;
          background:white;
          border:1px solid var(--ag-border);
          border-radius:20px;
          box-shadow:0 8px 25px rgba(24,69,43,.045);
        }

        .news-search {
          flex:1;
          min-width:250px;
          height:44px;
          display:flex;
          align-items:center;
          gap:9px;
          padding:0 13px;
          border:1px solid var(--ag-border);
          border-radius:12px;
          background:#fbfdfb;
          color:#7a8b81;
        }

        .news-search:focus-within {
          border-color:#79ad89;
          box-shadow:0 0 0 3px rgba(62,132,81,.1);
        }

        .news-search input {
          width:100%;
          border:0;
          outline:0;
          background:transparent;
          font-size:13px;
          color:var(--ag-text);
        }

        .news-filter-button {
          height:44px;
          display:flex;
          align-items:center;
          gap:8px;
          padding:0 13px;
          border:1px solid var(--ag-border);
          border-radius:12px;
          background:white;
          color:#416252;
          font-size:12px;
          font-weight:800;
          cursor:pointer;
        }

        .news-filter-button:hover {
          background:#f1f8f3;
        }

        .news-filter-panel {
          width:100%;
          display:grid;
          grid-template-columns:repeat(3,minmax(180px,1fr));
          gap:12px;
          padding:12px 2px 2px;
        }

        .news-select {
          height:42px;
          width:100%;
          padding:0 11px;
          border:1px solid var(--ag-border);
          border-radius:11px;
          background:white;
          color:#456256;
          outline:0;
          font-size:12px;
          font-weight:700;
        }

        .category-strip {
          margin-top:15px;
          display:flex;
          gap:8px;
          overflow-x:auto;
          padding-bottom:3px;
        }

        .category-chip {
          flex:0 0 auto;
          padding:9px 14px;
          border-radius:30px;
          border:1px solid var(--ag-border);
          background:white;
          color:#597066;
          font-size:11px;
          font-weight:800;
          cursor:pointer;
          transition:.15s ease;
        }

        .category-chip:hover,
        .category-chip.active {
          color:white;
          border-color:var(--ag-green);
          background:var(--ag-green);
          transform:translateY(-1px);
        }

        .news-content-grid {
          margin-top:18px;
          display:grid;
          grid-template-columns:minmax(0,1fr) 330px;
          gap:18px;
          align-items:start;
        }

        .section-card {
          background:white;
          border:1px solid var(--ag-border);
          border-radius:22px;
          box-shadow:0 8px 28px rgba(24,69,43,.05);
        }

        .section-heading {
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:15px;
          padding:18px 18px 8px;
        }

        .section-heading h2 {
          margin:0;
          font-size:18px;
          font-weight:900;
        }

        .section-heading p {
          margin:4px 0 0;
          color:var(--ag-muted);
          font-size:11px;
        }

        .featured-grid {
          display:grid;
          grid-template-columns:repeat(2,minmax(0,1fr));
          gap:14px;
          padding:12px 18px 18px;
        }

        .featured-card {
          position:relative;
          overflow:hidden;
          min-height:235px;
          border-radius:18px;
          padding:20px;
          color:white;
          background:
            linear-gradient(
              135deg,
              #17482f,
              #2f7d4e 60%,
              #75a956
            );
          box-shadow:0 12px 28px rgba(23,72,47,.15);
        }

        .featured-card:nth-child(2) {
          background:
            linear-gradient(
              135deg,
              #344e35,
              #5e7d45 60%,
              #8e9c58
            );
        }

        .featured-card::after {
          content:"";
          position:absolute;
          width:190px;
          height:190px;
          border-radius:50%;
          right:-75px;
          top:-90px;
          background:rgba(255,255,255,.11);
        }

        .featured-content {
          position:relative;
          z-index:2;
        }

        .featured-meta {
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:8px;
        }

        .featured-category {
          display:inline-flex;
          align-items:center;
          gap:6px;
          border-radius:30px;
          padding:6px 9px;
          background:rgba(255,255,255,.16);
          font-size:9px;
          font-weight:850;
          text-transform:uppercase;
          letter-spacing:.6px;
        }

        .featured-card h3 {
          margin:18px 0 8px;
          font-size:21px;
          line-height:1.2;
          font-weight:900;
        }

        .featured-card p {
          margin:0;
          color:rgba(255,255,255,.82);
          font-size:12px;
          line-height:1.65;
        }

        .featured-bottom {
          position:absolute;
          left:20px;
          right:20px;
          bottom:17px;
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:10px;
        }

        .featured-bottom span {
          font-size:10px;
          color:rgba(255,255,255,.76);
        }

        .news-list {
          display:grid;
          grid-template-columns:repeat(2,minmax(0,1fr));
          gap:14px;
          padding:12px 18px 20px;
        }

        .news-card {
          position:relative;
          padding:17px;
          border:1px solid #e2ebe4;
          border-radius:18px;
          background:#fff;
          transition:.18s ease;
        }

        .news-card:hover {
          transform:translateY(-3px);
          border-color:#b9d6c0;
          box-shadow:0 14px 32px rgba(29,77,48,.09);
        }

        .news-card.unread {
          border-left:4px solid var(--ag-green);
        }

        .news-card.urgent {
          border-color:#f0c8a7;
          background:linear-gradient(180deg,#fffaf5,#fff);
        }

        .news-card-top {
          display:flex;
          justify-content:space-between;
          align-items:flex-start;
          gap:10px;
        }

        .news-source {
          display:flex;
          align-items:center;
          gap:8px;
          color:var(--ag-muted);
          font-size:10px;
          font-weight:750;
        }

        .source-icon {
          width:34px;
          height:34px;
          display:grid;
          place-items:center;
          border-radius:10px;
          background:var(--ag-green-soft);
          color:var(--ag-green);
        }

        .news-card h3 {
          margin:14px 0 7px;
          font-size:15px;
          line-height:1.35;
          font-weight:850;
        }

        .news-summary {
          margin:0;
          color:#728078;
          font-size:11px;
          line-height:1.65;
        }

        .news-tags {
          display:flex;
          flex-wrap:wrap;
          gap:5px;
          margin-top:12px;
        }

        .news-tag {
          padding:4px 7px;
          border-radius:20px;
          background:#edf6ef;
          color:#567263;
          font-size:9px;
          font-weight:750;
        }

        .news-card-footer {
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:10px;
          margin-top:15px;
          padding-top:12px;
          border-top:1px solid #edf2ee;
        }

        .news-meta {
          display:flex;
          align-items:center;
          gap:9px;
          color:#849188;
          font-size:9px;
        }

        .news-actions {
          display:flex;
          gap:5px;
        }

        .news-icon-btn {
          width:31px;
          height:31px;
          display:grid;
          place-items:center;
          border:1px solid #dce9df;
          border-radius:9px;
          background:white;
          color:#61756a;
          cursor:pointer;
        }

        .news-icon-btn:hover {
          color:var(--ag-green);
          background:#f0f8f2;
        }

        .sidebar {
          display:grid;
          gap:15px;
          position:sticky;
          top:18px;
        }

        .side-panel {
          padding:17px;
        }

        .side-title {
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin-bottom:13px;
        }

        .side-title strong {
          font-size:13px;
          font-weight:900;
        }

        .side-title span {
          color:#829188;
          font-size:9px;
        }

        .urgent-item {
          display:flex;
          gap:10px;
          padding:11px 0;
          border-bottom:1px solid #edf2ee;
          cursor:pointer;
        }

        .urgent-item:last-child {
          border-bottom:0;
        }

        .urgent-icon {
          flex:none;
          width:32px;
          height:32px;
          display:grid;
          place-items:center;
          border-radius:10px;
          background:#fff0e3;
          color:#b96c28;
        }

        .urgent-item strong {
          display:block;
          font-size:11px;
          line-height:1.4;
        }

        .urgent-item span {
          display:block;
          margin-top:3px;
          color:#829087;
          font-size:9px;
        }

        .market-mini {
          display:grid;
          gap:9px;
        }

        .market-row {
          display:flex;
          align-items:center;
          justify-content:space-between;
          padding:11px;
          border-radius:12px;
          background:#f3f8f4;
        }

        .market-name {
          font-size:11px;
          font-weight:850;
        }

        .market-price {
          font-size:11px;
          font-weight:900;
          color:var(--ag-green);
        }

        .market-change {
          display:flex;
          align-items:center;
          gap:3px;
          font-size:9px;
          font-weight:850;
        }

        .positive {
          color:#23844e;
        }

        .negative {
          color:#c14e43;
        }

        .notification-box {
          padding:14px;
          border-radius:15px;
          background:linear-gradient(135deg,#edf7ef,#dcefd8);
          border:1px solid #cfe4d2;
        }

        .load-more {
          display:flex;
          justify-content:center;
          padding:0 18px 20px;
        }

        .results-line {
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:10px;
          padding:0 18px 5px;
          color:#7a8981;
          font-size:10px;
        }

        .results-line strong {
          color:#3b5849;
        }

        .modal-overlay {
          position:fixed;
          inset:0;
          z-index:100;
          display:grid;
          place-items:center;
          padding:20px;
          background:rgba(8,27,17,.54);
          backdrop-filter:blur(5px);
        }

        .article-modal {
          width:min(760px,100%);
          max-height:90vh;
          overflow:auto;
          border-radius:24px;
          background:white;
          box-shadow:0 30px 90px rgba(0,0,0,.28);
        }

        .modal-cover {
          padding:28px;
          color:white;
          background:linear-gradient(135deg,#164a30,#2e7d4d);
        }

        .modal-cover h2 {
          margin:15px 0 9px;
          font-size:27px;
          line-height:1.2;
        }

        .modal-cover p {
          margin:0;
          color:rgba(255,255,255,.82);
          line-height:1.7;
          font-size:13px;
        }

        .modal-body {
          padding:23px 28px 28px;
        }

        .modal-meta {
          display:flex;
          flex-wrap:wrap;
          gap:12px;
          color:#738279;
          font-size:10px;
          margin-bottom:18px;
        }

        .close-modal {
          border:1px solid rgba(255,255,255,.25);
          color:white;
          background:rgba(255,255,255,.12);
          width:35px;
          height:35px;
          display:grid;
          place-items:center;
          border-radius:10px;
          cursor:pointer;
        }

        .add-news-modal {
          width:min(760px,100%);
          max-height:92vh;
          overflow:auto;
          border-radius:25px;
          background:white;
          box-shadow:0 30px 100px rgba(0,0,0,.3);
        }

        .add-news-header {
          padding:23px 25px;
          color:white;
          background:
            radial-gradient(
              circle at 90% 0%,
              rgba(255,255,255,.18),
              transparent 28%
            ),
            linear-gradient(135deg,#15492f,#2f7b4e);
        }

        .add-news-header-top {
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:15px;
        }

        .add-news-header-icon {
          width:45px;
          height:45px;
          display:grid;
          place-items:center;
          border-radius:14px;
          background:rgba(255,255,255,.13);
        }

        .add-news-header h2 {
          margin:14px 0 5px;
          font-size:22px;
          font-weight:900;
        }

        .add-news-header p {
          margin:0;
          color:rgba(255,255,255,.76);
          font-size:11px;
        }

        .add-news-body {
          padding:24px;
        }

        .form-grid {
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:15px;
        }

        .form-field {
          display:flex;
          flex-direction:column;
          gap:7px;
        }

        .form-field.full {
          grid-column:1/-1;
        }

        .form-field label {
          font-size:11px;
          font-weight:850;
          color:#365746;
        }

        .form-field input,
        .form-field textarea,
        .form-field select {
          width:100%;
          box-sizing:border-box;
          border:1px solid #dce9df;
          border-radius:12px;
          background:#fbfdfb;
          color:#17382a;
          outline:none;
          padding:11px 12px;
          font-size:12px;
          transition:.15s ease;
        }

        .form-field input,
        .form-field select {
          height:43px;
        }

        .form-field textarea {
          min-height:110px;
          resize:vertical;
          line-height:1.6;
        }

        .form-field input:focus,
        .form-field textarea:focus,
        .form-field select:focus {
          border-color:#75a987;
          box-shadow:0 0 0 3px rgba(64,132,82,.1);
        }

        .tag-editor {
          display:flex;
          gap:8px;
        }

        .tag-editor input {
          flex:1;
        }

        .tag-list {
          display:flex;
          flex-wrap:wrap;
          gap:6px;
          margin-top:7px;
        }

        .editor-tag {
          display:flex;
          align-items:center;
          gap:5px;
          padding:5px 8px;
          border-radius:20px;
          background:#eaf6ee;
          color:#2c6544;
          font-size:10px;
          font-weight:800;
        }

        .editor-tag button {
          border:0;
          background:transparent;
          color:#568067;
          cursor:pointer;
          padding:0;
        }

        .check-row {
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:10px;
        }

        .check-option {
          display:flex;
          align-items:center;
          gap:9px;
          padding:12px;
          border:1px solid #dce9df;
          border-radius:12px;
          background:#fbfdfb;
          cursor:pointer;
        }

        .check-option input {
          width:16px;
          height:16px;
        }

        .check-option strong {
          display:block;
          font-size:11px;
        }

        .check-option span {
          display:block;
          margin-top:2px;
          color:#7c8c83;
          font-size:9px;
        }

        .admin-error {
          margin-bottom:15px;
          padding:11px 13px;
          border:1px solid #f0c5c1;
          border-radius:12px;
          background:#fff5f4;
          color:#a9423a;
          font-size:11px;
          line-height:1.5;
        }

        .add-news-footer {
          display:flex;
          justify-content:flex-end;
          gap:9px;
          padding-top:20px;
          margin-top:20px;
          border-top:1px solid #edf2ee;
        }

        @media (max-width:1150px) {
          .news-content-grid {
            grid-template-columns:1fr;
          }

          .sidebar {
            position:static;
            grid-template-columns:repeat(3,minmax(0,1fr));
          }
        }

        @media (max-width:900px) {
          .news-dashboard {
            grid-template-columns:repeat(2,1fr);
          }

          .news-list,
          .featured-grid {
            grid-template-columns:1fr;
          }

          .news-filter-panel {
            grid-template-columns:1fr;
          }

          .sidebar {
            grid-template-columns:1fr 1fr;
          }

          .form-grid {
            grid-template-columns:1fr;
          }

          .form-field.full {
            grid-column:auto;
          }
        }

        @media (max-width:620px) {
          .agri-news-page {
            padding:10px;
          }

          .news-dashboard {
            grid-template-columns:1fr 1fr;
          }

          .news-search {
            min-width:100%;
          }

          .sidebar {
            grid-template-columns:1fr;
          }

          .news-stat {
            padding:14px;
          }

          .news-stat-value {
            font-size:24px;
          }

          .featured-card h3 {
            font-size:18px;
          }

          .admin-banner {
            align-items:flex-start;
            flex-direction:column;
          }

          .check-row {
            grid-template-columns:1fr;
          }

          .add-news-body {
            padding:18px;
          }
        }
      `}</style>

      <div className="agri-news-shell">

        <AgriculturePageHeader
          icon={Newspaper}
          title="Agriculture News"
          description="Get agriculture updates that can affect your farm decisions — government policies, market movements, weather warnings, technology and farming advisories."
          actions={[
            <Button
              key="refresh"
              size="sm"
              variant="outline"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw
                className={`mr-1 size-3.5 ${
                  isFetching
                    ? "animate-spin"
                    : ""
                }`}
              />
              Refresh
            </Button>,

            admin ? (
              <Button
                key="add-news"
                size="sm"
                onClick={() => {
                  setAdminError("");
                  setShowAddNews(true);
                }}
              >
                <Plus className="mr-1 size-3.5" />
                Add News
              </Button>
            ) : null,

            <Button
              key="alerts"
              size="sm"
              variant={
                notificationsEnabled
                  ? "default"
                  : "outline"
              }
              onClick={() =>
                setNotificationsEnabled(
                  (current) => !current
                )
              }
            >
              {notificationsEnabled ? (
                <BellRing className="mr-1 size-3.5" />
              ) : (
                <Bell className="mr-1 size-3.5" />
              )}
              Alerts
            </Button>,
          ].filter(Boolean)}
        />

        {admin && (
          <section className="admin-banner">
            <div className="admin-banner-left">
              <div className="admin-banner-icon">
                <Radio size={20} />
              </div>

              <div>
                <strong>
                  Agriculture News Administration
                </strong>

                <span>
                  You are signed in as an administrator.
                  Publish verified agriculture information
                  for farmers.
                </span>
              </div>
            </div>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setAdminError("");
                setShowAddNews(true);
              }}
            >
              <Plus className="mr-2 size-4" />
              Publish update
            </Button>
          </section>
        )}

        <section className="news-dashboard">

          <div className="news-stat">
            <div className="news-stat-top">
              <span>Total Updates</span>

              <div className="news-stat-icon">
                <Newspaper size={17} />
              </div>
            </div>

            <div className="news-stat-value">
              {news.length}
            </div>

            <div className="news-stat-sub">
              Agriculture updates available
            </div>
          </div>

          <div className="news-stat">
            <div className="news-stat-top">
              <span>Important Alerts</span>

              <div className="news-stat-icon">
                <AlertTriangle size={17} />
              </div>
            </div>

            <div className="news-stat-value">
              {urgentNews.length}
            </div>

            <div className="news-stat-sub">
              Require farmer attention
            </div>
          </div>

          <div className="news-stat">
            <div className="news-stat-top">
              <span>Market Updates</span>

              <div className="news-stat-icon">
                <TrendingUp size={17} />
              </div>
            </div>

            <div className="news-stat-value">
              {marketNews.length}
            </div>

            <div className="news-stat-sub">
              Price and mandi intelligence
            </div>
          </div>

          <div className="news-stat">
            <div className="news-stat-top">
              <span>Weather Alerts</span>

              <div className="news-stat-icon">
                <CloudRain size={17} />
              </div>
            </div>

            <div className="news-stat-value">
              {weatherNews.length}
            </div>

            <div className="news-stat-sub">
              Weather-related updates
            </div>
          </div>

        </section>

        <section className="news-toolbar">

          <div className="news-search">
            <Search size={17} />

            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setVisibleCount(8);
              }}
              placeholder="Search news, schemes, crops, weather, mandi..."
              aria-label="Search agriculture news"
            />

            {search && (
              <button
                className="news-icon-btn"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            className="news-filter-button"
            onClick={() =>
              setShowFilters(
                (current) => !current
              )
            }
          >
            <SlidersHorizontal size={15} />
            Advanced Filters
          </button>

          <button
            className="news-filter-button"
            onClick={() =>
              setShowBookmarkedOnly(
                (current) => !current
              )
            }
          >
            {showBookmarkedOnly ? (
              <BookmarkCheck size={15} />
            ) : (
              <Bookmark size={15} />
            )}
            Saved
          </button>

          {showFilters && (
            <div className="news-filter-panel">

              <select
                className="news-select"
                value={region}
                onChange={(event) => {
                  setRegion(event.target.value);
                  setVisibleCount(8);
                }}
                aria-label="Filter by region"
              >
                {regions.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item === "all"
                      ? "All regions"
                      : item}
                  </option>
                ))}
              </select>

              <select
                className="news-select"
                value={sort}
                onChange={(event) =>
                  setSort(
                    event.target.value as
                      | "latest"
                      | "popular"
                      | "important"
                  )
                }
                aria-label="Sort news"
              >
                <option value="latest">
                  Latest first
                </option>

                <option value="popular">
                  Most viewed
                </option>

                <option value="important">
                  Most important
                </option>
              </select>

              <Button
                variant="outline"
                className="h-[42px]"
                onClick={clearFilters}
              >
                <RefreshCw className="mr-2 size-3.5" />
                Reset Filters
              </Button>

            </div>
          )}

        </section>

        <div className="category-strip">

          {categories.map((item) => (
            <button
              key={item}
              className={`category-chip ${
                category === item
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                setCategory(item);
                setVisibleCount(8);
              }}
            >
              {item === "all"
                ? "All Updates"
                : getCategoryLabel(item)}
            </button>
          ))}

        </div>

        <div className="news-content-grid">

          <main>

            {featuredNews.length > 0 && (
              <section className="section-card">

                <div className="section-heading">
                  <div>
                    <h2>
                      Featured Agriculture Updates
                    </h2>

                    <p>
                      High-value information for
                      current farm decisions.
                    </p>
                  </div>

                  <Flame
                    size={19}
                    className="text-orange-500"
                  />
                </div>

                <div className="featured-grid">

                  {featuredNews
                    .slice(0, 2)
                    .map((article) => {
                      const Icon =
                        getCategoryIcon(
                          article.category
                        );

                      return (
                        <article
                          key={article.id}
                          className="featured-card"
                        >
                          <div className="featured-content">

                            <div className="featured-meta">

                              <span className="featured-category">
                                <Icon size={12} />
                                {getCategoryLabel(
                                  article.category
                                )}
                              </span>

                              {article.urgent && (
                                <Badge
                                  variant="secondary"
                                  className="bg-white/15 text-white border-0"
                                >
                                  Important
                                </Badge>
                              )}

                            </div>

                            <h3>
                              {article.title}
                            </h3>

                            <p>
                              {article.summary}
                            </p>

                          </div>

                          <div className="featured-bottom">

                            <span>
                              {article.source} ·{" "}
                              {getRelativeTime(
                                article.publishedAt
                              )}
                            </span>

                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() =>
                                openArticle(
                                  article
                                )
                              }
                            >
                              View
                              <ArrowUpRight className="ml-1 size-3.5" />
                            </Button>

                          </div>
                        </article>
                      );
                    })}

                </div>

              </section>
            )}

            <section
              className="section-card"
              style={{ marginTop: 18 }}
            >

              <div className="section-heading">

                <div>
                  <h2>
                    {showBookmarkedOnly
                      ? "Saved News"
                      : "Latest Agriculture Updates"}
                  </h2>

                  <p>
                    Search and filter updates
                    relevant to your farm.
                  </p>
                </div>

                <Radio
                  size={19}
                  className="text-green-700"
                />

              </div>

              <div className="results-line">
                <span>
                  Showing{" "}
                  <strong>
                    {Math.min(
                      visibleCount,
                      filteredNews.length
                    )}
                  </strong>{" "}
                  of{" "}
                  <strong>
                    {filteredNews.length}
                  </strong>{" "}
                  updates
                </span>

                {search && (
                  <span>
                    Search:{" "}
                    <strong>{search}</strong>
                  </span>
                )}
              </div>

              {isLoading ? (
                <div className="p-5">
                  <LoadingState rows={6} />
                </div>
              ) : !visibleNews.length ? (
                <div className="p-5">

                  <EmptyState
                    icon={Newspaper}
                    title="No agriculture updates found"
                    description="Try another category, search term, region or clear your filters."
                  />

                  <div className="mt-4 flex justify-center">
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                    >
                      Clear all filters
                    </Button>
                  </div>

                </div>
              ) : (
                <>
                  <div className="news-list">

                    {visibleNews.map((article) => {

                      const Icon =
                        getCategoryIcon(
                          article.category
                        );

                      const isBookmarked =
                        bookmarks.includes(
                          String(article.id)
                        );

                      const isRead =
                        readArticles.includes(
                          String(article.id)
                        );

                      return (
                        <article
                          key={article.id}
                          className={`news-card ${
                            !isRead
                              ? "unread"
                              : ""
                          } ${
                            article.urgent
                              ? "urgent"
                              : ""
                          }`}
                        >

                          <div className="news-card-top">

                            <div className="news-source">

                              <div className="source-icon">
                                <Icon size={17} />
                              </div>

                              <div>
                                <div>
                                  {article.source}
                                </div>

                                <div className="flex items-center gap-1">
                                  <MapPin size={9} />
                                  {article.region}
                                </div>
                              </div>

                            </div>

                            {article.urgent && (
                              <Badge
                                variant="destructive"
                                className="text-[9px]"
                              >
                                Important
                              </Badge>
                            )}

                          </div>

                          <h3>
                            {article.title}
                          </h3>

                          <p className="news-summary">
                            {article.summary}
                          </p>

                          <div className="news-tags">

                            {article.tags
                              .slice(0, 4)
                              .map((tag) => (
                                <span
                                  className="news-tag"
                                  key={tag}
                                >
                                  #{tag}
                                </span>
                              ))}

                          </div>

                          <div className="news-card-footer">

                            <div className="news-meta">

                              <span className="flex items-center gap-1">
                                <Clock3 size={10} />
                                {article.readTime} min
                              </span>

                              <span className="flex items-center gap-1">
                                <Eye size={10} />
                                {formatViews(
                                  article.views
                                )}
                              </span>

                              <span className="flex items-center gap-1">
                                <CalendarDays
                                  size={10}
                                />
                                {getRelativeTime(
                                  article.publishedAt
                                )}
                              </span>

                            </div>

                            <div className="news-actions">

                              <button
                                className="news-icon-btn"
                                title={
                                  isBookmarked
                                    ? "Remove bookmark"
                                    : "Save article"
                                }
                                onClick={() =>
                                  toggleBookmark(
                                    article.id
                                  )
                                }
                              >
                                {isBookmarked ? (
                                  <BookmarkCheck
                                    size={14}
                                  />
                                ) : (
                                  <Bookmark
                                    size={14}
                                  />
                                )}
                              </button>

                              <button
                                className="news-icon-btn"
                                title="Share article"
                                onClick={() =>
                                  shareArticle(
                                    article
                                  )
                                }
                              >
                                <Share2 size={14} />
                              </button>

                              <button
                                className="news-icon-btn"
                                title="Open article"
                                onClick={() =>
                                  openArticle(
                                    article
                                  )
                                }
                              >
                                <ChevronRight
                                  size={14}
                                />
                              </button>

                            </div>

                          </div>

                        </article>
                      );
                    })}

                  </div>

                  {visibleCount <
                    filteredNews.length && (
                    <div className="load-more">

                      <Button
                        variant="outline"
                        onClick={() =>
                          setVisibleCount(
                            (current) =>
                              current + 8
                          )
                        }
                      >
                        Load more updates
                        <ChevronRight className="ml-1 size-4" />
                      </Button>

                    </div>
                  )}

                </>
              )}

            </section>

          </main>

          <aside className="sidebar">

            <section className="section-card side-panel">

              <div className="side-title">
                <strong>
                  Priority Alerts
                </strong>

                <span>
                  {urgentNews.length} active
                </span>
              </div>

              {urgentNews.length === 0 ? (
                <div className="py-5 text-center text-xs text-muted-foreground">
                  No urgent updates.
                </div>
              ) : (
                urgentNews
                  .slice(0, 4)
                  .map((article) => (
                    <div
                      key={article.id}
                      className="urgent-item"
                      onClick={() =>
                        openArticle(article)
                      }
                    >
                      <div className="urgent-icon">
                        <AlertTriangle size={15} />
                      </div>

                      <div>
                        <strong>
                          {article.title}
                        </strong>

                        <span>
                          {getRelativeTime(
                            article.publishedAt
                          )}
                        </span>
                      </div>
                    </div>
                  ))
              )}

            </section>

            <section className="section-card side-panel">

              <div className="side-title">
                <strong>
                  Market Intelligence
                </strong>

                <TrendingUp
                  size={16}
                  className="text-green-700"
                />
              </div>

              <div className="market-mini">

                {[
                  {
                    crop: "Tomato",
                    price: "₹2,850/q",
                    change: 8.4,
                  },
                  {
                    crop: "Paddy",
                    price: "₹2,210/q",
                    change: 3.2,
                  },
                  {
                    crop: "Maize",
                    price: "₹2,080/q",
                    change: -1.8,
                  },
                  {
                    crop: "Tur",
                    price: "₹7,400/q",
                    change: 5.7,
                  },
                ].map((item) => (
                  <div
                    className="market-row"
                    key={item.crop}
                  >

                    <div>
                      <div className="market-name">
                        {item.crop}
                      </div>

                      <div className="text-[9px] text-muted-foreground">
                        Indicative market trend
                      </div>
                    </div>

                    <div className="text-right">

                      <div className="market-price">
                        {item.price}
                      </div>

                      <div
                        className={`market-change ${
                          item.change >= 0
                            ? "positive"
                            : "negative"
                        }`}
                      >
                        {item.change >= 0 ? (
                          <TrendingUp size={10} />
                        ) : (
                          <TrendingDown size={10} />
                        )}

                        {item.change >= 0
                          ? "+"
                          : ""}
                        {item.change}%
                      </div>

                    </div>

                  </div>
                ))}

              </div>

            </section>

            <section className="section-card side-panel">

              <div className="side-title">
                <strong>
                  Farm Weather Snapshot
                </strong>

                <CloudSun
                  size={17}
                  className="text-green-700"
                />
              </div>

              <div
                className="rounded-2xl p-4"
                style={{
                  background:
                    "linear-gradient(135deg,#edf7ef,#f8fbf6)",
                  border:
                    "1px solid #dce9df",
                }}
              >

                <div className="flex items-center justify-between">

                  <div>
                    <div className="text-2xl font-black">
                      27°C
                    </div>

                    <div className="text-[10px] text-muted-foreground">
                      Partly cloudy
                    </div>
                  </div>

                  <CloudSun
                    size={34}
                    className="text-green-700"
                  />

                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">

                  <div>
                    <div className="text-[9px] text-muted-foreground">
                      Rain
                    </div>

                    <strong className="text-xs">
                      35%
                    </strong>
                  </div>

                  <div>
                    <div className="text-[9px] text-muted-foreground">
                      Humidity
                    </div>

                    <strong className="text-xs">
                      72%
                    </strong>
                  </div>

                  <div>
                    <div className="text-[9px] text-muted-foreground">
                      Wind
                    </div>

                    <strong className="text-xs">
                      12 km/h
                    </strong>
                  </div>

                </div>

              </div>

            </section>

            <section className="notification-box">

              <div className="flex items-start gap-3">

                <div className="news-stat-icon">
                  <BellRing size={17} />
                </div>

                <div className="flex-1">

                  <h3 className="text-xs font-black">
                    Personalized News Alerts
                  </h3>

                  <p className="mt-1 text-[10px] leading-5 text-muted-foreground">
                    Receive important updates for
                    crops, region, weather and
                    markets.
                  </p>

                  <Button
                    size="sm"
                    variant={
                      notificationsEnabled
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      setNotificationsEnabled(
                        (current) => !current
                      )
                    }
                  >
                    {notificationsEnabled
                      ? "Alerts enabled"
                      : "Enable alerts"}
                  </Button>

                </div>

              </div>

            </section>

          </aside>

        </div>

      </div>

      {/* ARTICLE MODAL */}

      {selectedArticle && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedArticle(null);
            }
          }}
        >

          <div className="article-modal">

            <div className="modal-cover">

              <div className="flex justify-between gap-4">

                <Badge
                  variant="secondary"
                  className="bg-white/15 text-white border-0"
                >
                  {getCategoryLabel(
                    selectedArticle.category
                  )}
                </Badge>

                <button
                  className="close-modal"
                  onClick={() =>
                    setSelectedArticle(null)
                  }
                >
                  <X size={17} />
                </button>

              </div>

              <h2>
                {selectedArticle.title}
              </h2>

              <p>
                {selectedArticle.summary}
              </p>

            </div>

            <div className="modal-body">

              <div className="modal-meta">

                <span className="flex items-center gap-1">
                  <Globe2 size={12} />
                  {selectedArticle.source}
                </span>

                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {selectedArticle.region}
                </span>

                <span className="flex items-center gap-1">
                  <Clock3 size={12} />
                  {selectedArticle.readTime} min read
                </span>

                <span className="flex items-center gap-1">
                  <Eye size={12} />
                  {formatViews(
                    selectedArticle.views
                  )}{" "}
                  views
                </span>

                <span>
                  Published{" "}
                  {formatDate(
                    selectedArticle.publishedAt
                  )}
                </span>

              </div>

              <div className="rounded-2xl border bg-muted/30 p-5">

                <h3 className="mb-2 text-sm font-bold">
                  Why this matters to farmers
                </h3>

                <p className="text-sm leading-7 text-muted-foreground">
                  Agriculture information should
                  support an actual farm decision.
                  Review the timing, location,
                  crop relevance and source before
                  changing your farm operation.
                </p>

              </div>

              <div className="mt-5 flex flex-wrap gap-2">

                <Button
                  onClick={() =>
                    toggleBookmark(
                      selectedArticle.id
                    )
                  }
                  variant={
                    bookmarks.includes(
                      String(
                        selectedArticle.id
                      )
                    )
                      ? "default"
                      : "outline"
                  }
                >
                  {bookmarks.includes(
                    String(
                      selectedArticle.id
                    )
                  ) ? (
                    <BookmarkCheck className="mr-2 size-4" />
                  ) : (
                    <Bookmark className="mr-2 size-4" />
                  )}

                  {bookmarks.includes(
                    String(
                      selectedArticle.id
                    )
                  )
                    ? "Saved"
                    : "Save"}
                </Button>

                <Button
                  variant="outline"
                  onClick={() =>
                    shareArticle(
                      selectedArticle
                    )
                  }
                >
                  <Share2 className="mr-2 size-4" />
                  Share
                </Button>

                {selectedArticle.url !== "#" && (
                  <Button asChild>
                    <a
                      href={
                        selectedArticle.url
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      Read full update
                      <ExternalLink className="ml-2 size-4" />
                    </a>
                  </Button>
                )}

              </div>

            </div>

          </div>

        </div>
      )}

      {/* ADMIN ADD NEWS MODAL */}

      {showAddNews && admin && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget &&
              !createNewsMutation.isPending
            ) {
              setShowAddNews(false);
            }
          }}
        >

          <div className="add-news-modal">

            <div className="add-news-header">

              <div className="add-news-header-top">

                <div className="flex items-center gap-3">

                  <div className="add-news-header-icon">
                    <Newspaper size={22} />
                  </div>

                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                      Admin publishing
                    </div>

                    <div className="text-sm font-black">
                      Agriculture Information Desk
                    </div>
                  </div>

                </div>

                <button
                  className="close-modal"
                  onClick={() =>
                    !createNewsMutation.isPending &&
                    setShowAddNews(false)
                  }
                >
                  <X size={17} />
                </button>

              </div>

              <h2>
                Publish Agriculture News
              </h2>

              <p>
                Share verified agriculture information,
                advisories, market updates and government
                announcements with farmers.
              </p>

            </div>

            <div className="add-news-body">

              {adminError && (
                <div className="admin-error">
                  <div className="flex items-start gap-2">
                    <AlertTriangle
                      size={15}
                      className="mt-0.5 shrink-0"
                    />
                    <span>
                      {adminError}
                    </span>
                  </div>
                </div>
              )}

              <div className="form-grid">

                <div className="form-field full">

                  <label>
                    News headline *
                  </label>

                  <input
                    value={newNews.title}
                    onChange={(event) =>
                      setNewNews(
                        (current) => ({
                          ...current,
                          title:
                            event.target.value,
                        })
                      )
                    }
                    placeholder="Example: New crop insurance advisory for Karnataka farmers"
                  />

                </div>

                <div className="form-field">

                  <label>
                    News category *
                  </label>

                  <select
                    value={newNews.category}
                    onChange={(event) =>
                      setNewNews(
                        (current) => ({
                          ...current,
                          category:
                            event.target.value,
                        })
                      )
                    }
                  >
                    <option value="policy">
                      Government / Policy
                    </option>

                    <option value="market">
                      Market / Mandi
                    </option>

                    <option value="weather">
                      Weather Advisory
                    </option>

                    <option value="technology">
                      Agriculture Technology
                    </option>
                  </select>

                </div>

                <div className="form-field">

                  <label>
                    Region *
                  </label>

                  <input
                    value={newNews.region}
                    onChange={(event) =>
                      setNewNews(
                        (current) => ({
                          ...current,
                          region:
                            event.target.value,
                        })
                      )
                    }
                    placeholder="Karnataka / India / District"
                  />

                </div>

                <div className="form-field">

                  <label>
                    Source / Publisher *
                  </label>

                  <input
                    value={newNews.source}
                    onChange={(event) =>
                      setNewNews(
                        (current) => ({
                          ...current,
                          source:
                            event.target.value,
                        })
                      )
                    }
                    placeholder="Agriculture Department / ICAR / IMD"
                  />

                </div>

                <div className="form-field">

                  <label>
                    Reading time
                  </label>

                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={newNews.readTime}
                    onChange={(event) =>
                      setNewNews(
                        (current) => ({
                          ...current,
                          readTime: Math.max(
                            1,
                            Number(
                              event.target.value
                            ) || 1
                          ),
                        })
                      )
                    }
                  />

                </div>

                <div className="form-field full">

                  <label>
                    News summary *
                  </label>

                  <textarea
                    value={newNews.summary}
                    onChange={(event) =>
                      setNewNews(
                        (current) => ({
                          ...current,
                          summary:
                            event.target.value,
                        })
                      )
                    }
                    placeholder="Explain the update clearly for farmers. Include important dates, locations and practical implications where relevant."
                  />

                </div>

                <div className="form-field full">

                  <label>
                    Official source URL
                  </label>

                  <div className="relative">

                    <Link2
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />

                    <input
                      className="pl-9"
                      value={newNews.url}
                      onChange={(event) =>
                        setNewNews(
                          (current) => ({
                            ...current,
                            url:
                              event.target.value,
                          })
                        )
                      }
                      placeholder="https://official-government-source.gov.in/..."
                    />

                  </div>

                </div>

                <div className="form-field full">

                  <label>
                    Search tags *
                  </label>

                  <div className="tag-editor">

                    <input
                      value={tagInput}
                      onChange={(event) =>
                        setTagInput(
                          event.target.value
                        )
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key ===
                          "Enter"
                        ) {
                          event.preventDefault();
                          addTag();
                        }
                      }}
                      placeholder="Type a tag and press Enter"
                    />

                    <Button
                      type="button"
                      variant="outline"
                      onClick={addTag}
                    >
                      <Tag className="mr-2 size-4" />
                      Add
                    </Button>

                  </div>

                  {newNews.tags.length > 0 && (
                    <div className="tag-list">

                      {newNews.tags.map(
                        (tag) => (
                          <span
                            className="editor-tag"
                            key={tag}
                          >
                            #{tag}

                            <button
                              type="button"
                              onClick={() =>
                                removeTag(
                                  tag
                                )
                              }
                            >
                              <X size={11} />
                            </button>
                          </span>
                        )
                      )}

                    </div>
                  )}

                </div>

                <div className="form-field full">

                  <label>
                    Publishing options
                  </label>

                  <div className="check-row">

                    <label className="check-option">

                      <input
                        type="checkbox"
                        checked={
                          newNews.featured
                        }
                        onChange={(event) =>
                          setNewNews(
                            (current) => ({
                              ...current,
                              featured:
                                event.target
                                  .checked,
                            })
                          )
                        }
                      />

                      <div>
                        <strong>
                          Feature this update
                        </strong>

                        <span>
                          Show it prominently
                          in the featured section.
                        </span>
                      </div>

                    </label>

                    <label className="check-option">

                      <input
                        type="checkbox"
                        checked={
                          newNews.urgent
                        }
                        onChange={(event) =>
                          setNewNews(
                            (current) => ({
                              ...current,
                              urgent:
                                event.target
                                  .checked,
                            })
                          )
                        }
                      />

                      <div>
                        <strong>
                          Mark as important
                        </strong>

                        <span>
                          Show it in farmer
                          priority alerts.
                        </span>
                      </div>

                    </label>

                  </div>

                </div>

              </div>

              <div className="add-news-footer">

                <Button
                  variant="outline"
                  onClick={() =>
                    setShowAddNews(false)
                  }
                  disabled={
                    createNewsMutation.isPending
                  }
                >
                  Cancel
                </Button>

                <Button
                  onClick={handlePublish}
                  disabled={
                    createNewsMutation.isPending
                  }
                >
                  {createNewsMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 size-4" />
                      Publish News
                    </>
                  )}
                </Button>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}