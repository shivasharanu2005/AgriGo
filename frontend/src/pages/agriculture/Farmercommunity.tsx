import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  Bell,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Filter,
  Flame,
  Heart,
  Leaf,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Search,
  Send,
  ShieldCheck,
  Sprout,
  Star,
  TrendingUp,
  UserRound,
  Users,
  X,
  Zap,
  Share2,
  Image as ImageIcon,
  BadgeCheck,
  Tractor,
  CloudRain,
  IndianRupee,
  CircleHelp,
  RefreshCw,
} from "lucide-react";

import { AgriculturePageHeader } from "@/components/agriculture/AgriculturePageHeader";
import { EmptyState } from "@/components/agriculture/EmptyState";
import { LoadingState } from "@/components/agriculture/Loadingstate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import {
  agricultureApi,
  type CommunityPost,
} from "@/services/agricultureApi";

type CommunityFilter =
  | "all"
  | "questions"
  | "advice"
  | "market"
  | "weather"
  | "success";

type SortMode = "latest" | "popular" | "discussed";

type ExtendedPost = CommunityPost & {
  image?: string;
  crop?: string;
  location?: string;
  verified?: boolean;
  urgent?: boolean;
  expert?: boolean;
  views?: number;
};

const filters: {
  id: CommunityFilter;
  label: string;
  icon: typeof Users;
}[] = [
  {
    id: "all",
    label: "All discussions",
    icon: Users,
  },
  {
    id: "questions",
    label: "Questions",
    icon: CircleHelp,
  },
  {
    id: "advice",
    label: "Farmer advice",
    icon: Sprout,
  },
  {
    id: "market",
    label: "Market",
    icon: IndianRupee,
  },
  {
    id: "weather",
    label: "Weather",
    icon: CloudRain,
  },
  {
    id: "success",
    label: "Success stories",
    icon: Award,
  },
];

const cropOptions = [
  "All crops",
  "Wheat",
  "Rice",
  "Cotton",
  "Maize",
  "Tomato",
  "Sugarcane",
  "Groundnut",
  "Chilli",
  "Potato",
  "Onion",
  "Turmeric",
  "Soybean",
  "Other",
];

const postTypes = [
  "Question",
  "Advice",
  "Market Update",
  "Weather Alert",
  "Success Story",
];

function getFilterForPost(
  post: ExtendedPost
): CommunityFilter {
  const tag = String(post.tag || "").toLowerCase();

  if (tag.includes("question")) return "questions";

  if (
    tag.includes("market") ||
    tag.includes("price")
  ) {
    return "market";
  }

  if (
    tag.includes("weather") ||
    tag.includes("rain")
  ) {
    return "weather";
  }

  if (
    tag.includes("success") ||
    tag.includes("achievement")
  ) {
    return "success";
  }

  return "advice";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getAvatarClass(name: string) {
  const classes = [
    "fc-avatar-one",
    "fc-avatar-two",
    "fc-avatar-three",
    "fc-avatar-four",
    "fc-avatar-five",
  ];

  let hash = 0;

  for (let i = 0; i < name.length; i++) {
    hash += name.charCodeAt(i);
  }

  return classes[hash % classes.length];
}

function formatNumber(value: number) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }

  return String(value);
}

export default function FarmerCommunity() {
  const {
    data,
    isLoading,
    refetch,
    isFetching,
    isError,
  } = useQuery({
    queryKey: ["community"],
    queryFn: agricultureApi.getCommunityPosts,
  });

  const [posts, setPosts] = useState<ExtendedPost[]>([]);

  const [draft, setDraft] = useState("");

  const [selectedFilter, setSelectedFilter] =
    useState<CommunityFilter>("all");

  const [selectedCrop, setSelectedCrop] =
    useState("All crops");

  const [sortMode, setSortMode] =
    useState<SortMode>("latest");

  const [search, setSearch] = useState("");

  const [showFilters, setShowFilters] =
    useState(false);

  const [showComposer, setShowComposer] =
    useState(false);

  const [postTag, setPostTag] =
    useState("Question");

  const [postCrop, setPostCrop] =
    useState("Wheat");

  const [urgent, setUrgent] =
    useState(false);

  const [bookmarked, setBookmarked] =
    useState<string[]>([]);

  const [liked, setLiked] =
    useState<string[]>([]);

  const [following, setFollowing] =
    useState<string[]>([]);

  const [expandedReplies, setExpandedReplies] =
    useState<string[]>([]);

  const [replyDrafts, setReplyDrafts] =
    useState<Record<string, string>>({});

  const [sharedPosts, setSharedPosts] =
    useState<string[]>([]);

  useEffect(() => {
    if (data) {
      setPosts(data as ExtendedPost[]);
    }
  }, [data]);

  const publish = () => {
    const cleanDraft = draft.trim();

    if (!cleanDraft) {
      toast.error(
        "Please describe your farming problem."
      );
      return;
    }

    if (cleanDraft.length < 10) {
      toast.error(
        "Please provide more details so farmers can help."
      );
      return;
    }

    const newPost: ExtendedPost = {
      id: crypto.randomUUID(),
      author: "You",
      village: "My village",
      postedAt: "just now",
      body: cleanDraft,
      tag: postTag,
      replies: 0,
      likes: 0,
      crop: postCrop,
      location: "My area",
      urgent,
      verified: false,
      expert: false,
      views: 0,
    };

    setPosts((previous) => [
      newPost,
      ...previous,
    ]);

    setDraft("");
    setUrgent(false);
    setPostTag("Question");
    setPostCrop("Wheat");
    setShowComposer(false);

    toast.success(
      "Your discussion has been published."
    );
  };

  const like = (id: string) => {
    setPosts((previous) =>
      previous.map((post) => {
        if (post.id !== id) return post;

        const alreadyLiked =
          liked.includes(id);

        return {
          ...post,
          likes: Math.max(
            0,
            Number(post.likes || 0) +
              (alreadyLiked ? -1 : 1)
          ),
        };
      })
    );

    setLiked((previous) =>
      previous.includes(id)
        ? previous.filter(
            (item) => item !== id
          )
        : [...previous, id]
    );
  };

  const toggleBookmark = (id: string) => {
    const isSaved = bookmarked.includes(id);

    setBookmarked((previous) =>
      isSaved
        ? previous.filter(
            (item) => item !== id
          )
        : [...previous, id]
    );

    toast.success(
      isSaved
        ? "Removed from saved discussions"
        : "Discussion saved successfully"
    );
  };

  const toggleFollow = (author: string) => {
    const isFollowing =
      following.includes(author);

    setFollowing((previous) =>
      isFollowing
        ? previous.filter(
            (item) => item !== author
          )
        : [...previous, author]
    );

    toast.success(
      isFollowing
        ? `You unfollowed ${author}`
        : `You are now following ${author}`
    );
  };

  const addReply = (postId: string) => {
    const reply =
      replyDrafts[postId]?.trim();

    if (!reply) {
      toast.error("Write a reply first.");
      return;
    }

    setPosts((previous) =>
      previous.map((post) =>
        post.id === postId
          ? {
              ...post,
              replies:
                Number(post.replies || 0) + 1,
            }
          : post
      )
    );

    setReplyDrafts((previous) => ({
      ...previous,
      [postId]: "",
    }));

    toast.success(
      "Your reply was added."
    );
  };

  const sharePost = async (
    post: ExtendedPost
  ) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `AgriGo Community - ${post.tag}`,
          text: post.body,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(
          post.body
        );

        toast.success(
          "Discussion copied to clipboard."
        );
      }

      setSharedPosts((previous) =>
        previous.includes(post.id)
          ? previous
          : [...previous, post.id]
      );
    } catch {
      // User cancelled native sharing.
    }
  };

  const filteredPosts = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    const result = posts.filter((post) => {
      const filterMatches =
        selectedFilter === "all" ||
        getFilterForPost(post) ===
          selectedFilter;

      const cropMatches =
        selectedCrop === "All crops" ||
        String(post.crop || "")
          .toLowerCase()
          .includes(
            selectedCrop.toLowerCase()
          ) ||
        String(post.body || "")
          .toLowerCase()
          .includes(
            selectedCrop.toLowerCase()
          );

      const searchMatches =
        !query ||
        String(post.author || "")
          .toLowerCase()
          .includes(query) ||
        String(post.body || "")
          .toLowerCase()
          .includes(query) ||
        String(post.village || "")
          .toLowerCase()
          .includes(query) ||
        String(post.crop || "")
          .toLowerCase()
          .includes(query) ||
        String(post.tag || "")
          .toLowerCase()
          .includes(query) ||
        String(post.location || "")
          .toLowerCase()
          .includes(query);

      return (
        filterMatches &&
        cropMatches &&
        searchMatches
      );
    });

    return [...result].sort((a, b) => {
      if (sortMode === "popular") {
        return (
          Number(b.likes || 0) -
          Number(a.likes || 0)
        );
      }

      if (sortMode === "discussed") {
        return (
          Number(b.replies || 0) -
          Number(a.replies || 0)
        );
      }

      return 0;
    });
  }, [
    posts,
    search,
    selectedFilter,
    selectedCrop,
    sortMode,
  ]);

  const totalLikes = posts.reduce(
    (sum, post) =>
      sum + Number(post.likes || 0),
    0
  );

  const totalReplies = posts.reduce(
    (sum, post) =>
      sum + Number(post.replies || 0),
    0
  );

  const activeFarmers = new Set(
    posts.map((post) => post.author)
  ).size;

  const urgentPosts = posts.filter(
    (post) => post.urgent
  ).length;

  const expertPosts = posts.filter(
    (post) => post.expert
  ).length;

  const clearFilters = () => {
    setSearch("");
    setSelectedFilter("all");
    setSelectedCrop("All crops");
    setSortMode("latest");
  };

  return (
    <div className="farmer-community-page">
      <style>{`
        .farmer-community-page {
          --fc-primary: hsl(var(--primary));
          --fc-primary-soft: hsl(var(--primary) / .08);
          --fc-border: hsl(var(--border));
          --fc-card: hsl(var(--card));
          --fc-bg: hsl(var(--background));
          --fc-muted: hsl(var(--muted));
          --fc-muted-text: hsl(var(--muted-foreground));
          --fc-foreground: hsl(var(--foreground));

          min-height: 100vh;
          padding-bottom: 70px;
          background:
            radial-gradient(
              circle at 10% 0%,
              hsl(var(--primary) / .045),
              transparent 30%
            ),
            radial-gradient(
              circle at 100% 25%,
              hsl(var(--chart-2) / .035),
              transparent 30%
            );
        }

        .fc-container {
          width: 100%;
          max-width: 1500px;
          margin: auto;
          padding: 0 20px;
        }

        .fc-hero {
          position: relative;
          overflow: hidden;
          margin: 10px 0 24px;
          border: 1px solid hsl(var(--primary) / .12);
          border-radius: 30px;
          padding: 38px;
          background:
            radial-gradient(
              circle at 88% 12%,
              hsl(var(--primary) / .17),
              transparent 28%
            ),
            radial-gradient(
              circle at 8% 100%,
              hsl(var(--chart-2) / .12),
              transparent 32%
            ),
            linear-gradient(
              135deg,
              hsl(var(--card)),
              hsl(var(--card) / .78)
            );
          box-shadow:
            0 25px 70px
              hsl(var(--foreground) / .075);
        }

        .fc-hero::before {
          content: "";
          position: absolute;
          width: 360px;
          height: 360px;
          right: -150px;
          top: -180px;
          border-radius: 50%;
          border: 1px solid
            hsl(var(--primary) / .12);
          box-shadow:
            0 0 0 35px
              hsl(var(--primary) / .025),
            0 0 0 75px
              hsl(var(--primary) / .018);
        }

        .fc-hero-content {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 35px;
        }

        .fc-hero-left {
          max-width: 820px;
        }

        .fc-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 12px;
          border: 1px solid
            hsl(var(--primary) / .14);
          border-radius: 999px;
          background:
            hsl(var(--primary) / .075);
          color: var(--fc-primary);
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .fc-title {
          margin-top: 14px;
          font-size: clamp(30px, 4.2vw, 52px);
          font-weight: 950;
          line-height: 1;
          letter-spacing: -.055em;
        }

        .fc-title-highlight {
          color: var(--fc-primary);
        }

        .fc-description {
          max-width: 760px;
          margin-top: 16px;
          color: var(--fc-muted-text);
          line-height: 1.8;
          font-size: 14px;
        }

        .fc-hero-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 9px;
        }

        .fc-online {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 20px;
          padding: 8px 12px;
          border: 1px solid
            hsl(var(--border) / .8);
          border-radius: 999px;
          background:
            hsl(var(--background) / .6);
          font-size: 11px;
          color: var(--fc-muted-text);
          backdrop-filter: blur(8px);
        }

        .fc-online-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background:
            hsl(var(--chart-2));
          box-shadow:
            0 0 0 4px
              hsl(var(--chart-2) / .13);
          animation: fcPulse 2s infinite;
        }

        @keyframes fcPulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .45;
          }
        }

        .fc-stat-grid {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 24px;
        }

        .fc-stat {
          position: relative;
          overflow: hidden;
          border: 1px solid var(--fc-border);
          border-radius: 20px;
          background: var(--fc-card);
          padding: 19px;
          transition:
            transform .25s ease,
            box-shadow .25s ease,
            border-color .25s ease;
        }

        .fc-stat::after {
          content: "";
          position: absolute;
          right: -30px;
          bottom: -45px;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background:
            hsl(var(--primary) / .035);
        }

        .fc-stat:hover {
          transform: translateY(-4px);
          border-color:
            hsl(var(--primary) / .3);
          box-shadow:
            0 18px 45px
              hsl(var(--foreground) / .07);
        }

        .fc-stat-icon {
          display: grid;
          width: 42px;
          height: 42px;
          place-items: center;
          border-radius: 13px;
          background:
            hsl(var(--primary) / .09);
          color: var(--fc-primary);
        }

        .fc-stat-label {
          margin-top: 14px;
          color: var(--fc-muted-text);
          font-size: 10px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: .05em;
        }

        .fc-stat-value {
          margin-top: 3px;
          font-size: 27px;
          font-weight: 950;
          letter-spacing: -.045em;
        }

        .fc-stat-note {
          margin-top: 3px;
          color: var(--fc-muted-text);
          font-size: 10px;
        }

        .fc-layout {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr) 320px;
          gap: 22px;
          align-items: start;
        }

        .fc-main {
          min-width: 0;
        }

        .fc-sidebar {
          position: sticky;
          top: 18px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .fc-side-card {
          border: 1px solid var(--fc-border);
          border-radius: 21px;
          background: var(--fc-card);
          padding: 18px;
          box-shadow:
            0 8px 30px
              hsl(var(--foreground) / .035);
        }

        .fc-side-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 900;
        }

        .fc-side-description {
          margin-top: 6px;
          color: var(--fc-muted-text);
          font-size: 10px;
          line-height: 1.6;
        }

        .fc-search-box {
          position: relative;
          margin-bottom: 12px;
        }

        .fc-search-box > svg {
          position: absolute;
          left: 14px;
          top: 50%;
          width: 17px;
          height: 17px;
          transform: translateY(-50%);
          color: var(--fc-muted-text);
          pointer-events: none;
        }

        .fc-search-input {
          width: 100%;
          height: 48px;
          border: 1px solid var(--fc-border);
          border-radius: 14px;
          background: var(--fc-card);
          padding: 0 45px;
          outline: none;
          color: var(--fc-foreground);
          font-size: 12px;
          transition: all .2s ease;
        }

        .fc-search-input:focus {
          border-color: var(--fc-primary);
          box-shadow:
            0 0 0 4px
              hsl(var(--primary) / .09);
        }

        .fc-filter-bar {
          display: flex;
          align-items: center;
          gap: 7px;
          overflow-x: auto;
          padding: 3px 1px 7px;
          scrollbar-width: thin;
        }

        .fc-filter-chip {
          display: inline-flex;
          flex-shrink: 0;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border: 1px solid var(--fc-border);
          border-radius: 999px;
          background: var(--fc-card);
          color: var(--fc-muted-text);
          font-size: 10px;
          font-weight: 800;
          cursor: pointer;
          transition: all .2s ease;
        }

        .fc-filter-chip:hover {
          transform: translateY(-1px);
          border-color:
            hsl(var(--primary) / .3);
          color: var(--fc-foreground);
        }

        .fc-filter-chip.active {
          border-color: var(--fc-primary);
          background:
            hsl(var(--primary) / .09);
          color: var(--fc-primary);
          box-shadow:
            0 5px 15px
              hsl(var(--primary) / .08);
        }

        .fc-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin: 19px 0 15px;
        }

        .fc-toolbar-title {
          font-size: 15px;
          font-weight: 950;
          letter-spacing: -.02em;
        }

        .fc-toolbar-sub {
          margin-top: 3px;
          color: var(--fc-muted-text);
          font-size: 10px;
        }

        .fc-sort {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .fc-post-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .fc-post {
          position: relative;
          overflow: hidden;
          border: 1px solid var(--fc-border);
          border-radius: 22px;
          background: var(--fc-card);
          padding: 20px;
          transition:
            transform .25s ease,
            box-shadow .25s ease,
            border-color .25s ease;
          animation: fcPostIn .35s ease both;
        }

        @keyframes fcPostIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .fc-post:hover {
          transform: translateY(-2px);
          border-color:
            hsl(var(--primary) / .23);
          box-shadow:
            0 18px 48px
              hsl(var(--foreground) / .065);
        }

        .fc-post.urgent {
          border-color:
            hsl(var(--destructive) / .22);
        }

        .fc-urgent-line {
          position: absolute;
          inset: 0 auto 0 0;
          width: 4px;
          background:
            hsl(var(--destructive));
        }

        .fc-post-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
        }

        .fc-user {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 0;
        }

        .fc-avatar {
          display: grid;
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 14px;
          font-size: 12px;
          font-weight: 950;
          border: 1px solid
            hsl(var(--primary) / .12);
        }

        .fc-avatar-one {
          background:
            hsl(var(--primary) / .11);
          color: var(--fc-primary);
        }

        .fc-avatar-two {
          background:
            hsl(var(--chart-2) / .12);
          color: hsl(var(--chart-2));
        }

        .fc-avatar-three {
          background:
            hsl(var(--chart-3) / .12);
          color: hsl(var(--chart-3));
        }

        .fc-avatar-four {
          background:
            hsl(var(--chart-4) / .12);
          color: hsl(var(--chart-4));
        }

        .fc-avatar-five {
          background:
            hsl(var(--chart-5) / .12);
          color: hsl(var(--chart-5));
        }

        .fc-author {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 13px;
          font-weight: 900;
        }

        .fc-author-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-top: 3px;
          color: var(--fc-muted-text);
          font-size: 9px;
        }

        .fc-verified {
          color: hsl(var(--chart-2));
        }

        .fc-expert {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-left: 3px;
          padding: 3px 6px;
          border-radius: 999px;
          background:
            hsl(var(--primary) / .08);
          color: var(--fc-primary);
          font-size: 8px;
          font-weight: 900;
        }

        .fc-post-body {
          margin-top: 16px;
          color: var(--fc-foreground);
          font-size: 13px;
          line-height: 1.8;
        }

        .fc-post-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 14px;
        }

        .fc-crop-tag {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 9px;
          border-radius: 999px;
          background:
            hsl(var(--primary) / .07);
          color: var(--fc-primary);
          font-size: 9px;
          font-weight: 850;
        }

        .fc-location-tag {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 9px;
          border-radius: 999px;
          background:
            hsl(var(--muted));
          color: var(--fc-muted-text);
          font-size: 9px;
          font-weight: 750;
        }

        .fc-urgent-tag {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 9px;
          border-radius: 999px;
          background:
            hsl(var(--destructive) / .08);
          color:
            hsl(var(--destructive));
          font-size: 9px;
          font-weight: 900;
        }

        .fc-post-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 17px;
          padding-top: 13px;
          border-top: 1px solid
            hsl(var(--border) / .7);
        }

        .fc-action {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 9px;
          border: 0;
          border-radius: 9px;
          background: transparent;
          color: var(--fc-muted-text);
          font-size: 10px;
          font-weight: 750;
          cursor: pointer;
          transition: all .2s ease;
        }

        .fc-action:hover {
          background:
            hsl(var(--muted));
          color: var(--fc-foreground);
        }

        .fc-action.active {
          color: var(--fc-primary);
          background:
            hsl(var(--primary) / .08);
        }

        .fc-action.liked {
          color:
            hsl(var(--destructive));
        }

        .fc-follow {
          margin-left: auto;
        }

        .fc-reply-area {
          margin-top: 13px;
          padding: 14px;
          border: 1px solid
            hsl(var(--border) / .7);
          border-radius: 15px;
          background:
            hsl(var(--muted) / .35);
        }

        .fc-reply-input {
          width: 100%;
          min-height: 72px;
          resize: vertical;
          border: 1px solid var(--fc-border);
          border-radius: 11px;
          background: var(--fc-card);
          padding: 10px;
          color: var(--fc-foreground);
          font-size: 11px;
          outline: none;
        }

        .fc-reply-input:focus {
          border-color: var(--fc-primary);
          box-shadow:
            0 0 0 3px
              hsl(var(--primary) / .08);
        }

        .fc-composer {
          margin: 16px 0 18px;
          overflow: hidden;
          border: 1px solid
            hsl(var(--primary) / .18);
          border-radius: 22px;
          background: var(--fc-card);
          box-shadow:
            0 15px 40px
              hsl(var(--foreground) / .05);
        }

        .fc-composer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 17px 19px;
          border-bottom: 1px solid var(--fc-border);
          background:
            linear-gradient(
              90deg,
              hsl(var(--primary) / .06),
              transparent
            );
        }

        .fc-composer-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 900;
        }

        .fc-composer-body {
          padding: 18px;
        }

        .fc-composer-options {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
        }

        .fc-select {
          height: 36px;
          border: 1px solid var(--fc-border);
          border-radius: 9px;
          background: var(--fc-card);
          padding: 0 10px;
          color: var(--fc-foreground);
          font-size: 10px;
          outline: none;
        }

        .fc-select:focus {
          border-color: var(--fc-primary);
        }

        .fc-urgent-toggle {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          height: 36px;
          padding: 0 11px;
          border: 1px solid var(--fc-border);
          border-radius: 9px;
          background: var(--fc-card);
          color: var(--fc-muted-text);
          font-size: 10px;
          font-weight: 750;
          cursor: pointer;
        }

        .fc-urgent-toggle.active {
          color:
            hsl(var(--destructive));
          border-color:
            hsl(var(--destructive) / .3);
          background:
            hsl(var(--destructive) / .07);
        }

        .fc-trending-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 5px;
          border: 0;
          border-bottom: 1px solid
            hsl(var(--border) / .65);
          background: transparent;
          text-align: left;
          cursor: pointer;
          transition: all .2s ease;
        }

        .fc-trending-item:hover {
          padding-left: 9px;
          background:
            hsl(var(--muted) / .4);
        }

        .fc-trending-item:last-child {
          border-bottom: 0;
        }

        .fc-trending-number {
          display: grid;
          width: 28px;
          height: 28px;
          place-items: center;
          flex-shrink: 0;
          border-radius: 9px;
          background:
            hsl(var(--primary) / .08);
          color: var(--fc-primary);
          font-size: 10px;
          font-weight: 950;
        }

        .fc-trending-name {
          font-size: 10px;
          font-weight: 850;
        }

        .fc-trending-count {
          margin-top: 2px;
          color: var(--fc-muted-text);
          font-size: 8px;
        }

        .fc-community-rule {
          display: flex;
          gap: 10px;
          padding: 9px 0;
          color: var(--fc-muted-text);
          font-size: 10px;
          line-height: 1.6;
        }

        .fc-rule-number {
          display: grid;
          width: 21px;
          height: 21px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 7px;
          background:
            hsl(var(--primary) / .08);
          color: var(--fc-primary);
          font-size: 9px;
          font-weight: 950;
        }

        .fc-activity-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .fc-activity-box {
          border: 1px solid
            hsl(var(--border) / .8);
          border-radius: 13px;
          padding: 11px;
          background:
            hsl(var(--background) / .35);
        }

        .fc-activity-label {
          color: var(--fc-muted-text);
          font-size: 8px;
          text-transform: uppercase;
          letter-spacing: .04em;
        }

        .fc-activity-value {
          margin-top: 3px;
          font-size: 20px;
          font-weight: 950;
        }

        .fc-empty {
          display: grid;
          min-height: 330px;
          place-items: center;
          padding: 30px;
          text-align: center;
          border: 1px dashed var(--fc-border);
          border-radius: 22px;
          background:
            hsl(var(--card) / .55);
        }

        .fc-help-banner {
          position: relative;
          overflow: hidden;
          margin-top: 24px;
          border: 1px solid
            hsl(var(--primary) / .15);
          border-radius: 21px;
          padding: 19px;
          background:
            linear-gradient(
              120deg,
              hsl(var(--primary) / .07),
              hsl(var(--card))
            );
        }

        .fc-help-banner::after {
          content: "";
          position: absolute;
          right: -40px;
          top: -60px;
          width: 160px;
          height: 160px;
          border-radius: 50%;
          border: 1px solid
            hsl(var(--primary) / .12);
        }

        .fc-bottom-status {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-top: 25px;
          border: 1px solid var(--fc-border);
          border-radius: 20px;
          background: var(--fc-card);
          padding: 16px;
        }

        @media (max-width: 1100px) {
          .fc-layout {
            grid-template-columns: 1fr;
          }

          .fc-sidebar {
            position: static;
            display: grid;
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .fc-stat-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .fc-container {
            padding: 0 12px;
          }

          .fc-hero {
            padding: 24px 20px;
            border-radius: 23px;
          }

          .fc-hero-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .fc-hero-actions {
            justify-content: flex-start;
          }

          .fc-sidebar {
            grid-template-columns: 1fr;
          }

          .fc-toolbar {
            align-items: flex-start;
            flex-direction: column;
          }

          .fc-sort {
            width: 100%;
          }

          .fc-post {
            padding: 16px;
            border-radius: 19px;
          }

          .fc-post-head {
            gap: 8px;
          }

          .fc-bottom-status {
            align-items: flex-start;
            flex-direction: column;
          }
        }

        @media (max-width: 520px) {
          .fc-stat-grid {
            grid-template-columns: 1fr 1fr;
          }

          .fc-stat {
            padding: 14px;
          }

          .fc-stat-value {
            font-size: 23px;
          }

          .fc-composer-options {
            align-items: stretch;
            flex-direction: column;
          }

          .fc-select,
          .fc-urgent-toggle {
            width: 100%;
          }

          .fc-composer-options button {
            margin-left: 0 !important;
            width: 100%;
          }

          .fc-post-actions {
            flex-wrap: wrap;
          }

          .fc-follow {
            margin-left: 0;
          }
        }
      `}</style>

      <div className="fc-container">
        {/* HERO */}
        <section className="fc-hero">
          <div className="fc-hero-content">
            <div className="fc-hero-left">
              <div className="fc-eyebrow">
                <Users className="size-3.5" />
                AgriGo Farmer Network
              </div>

              <h1 className="fc-title">
                Farmers helping{" "}
                <span className="fc-title-highlight">
                  farmers.
                </span>
              </h1>

              <p className="fc-description">
                A practical community for Indian
                farmers to ask questions, share
                field experience, discuss crop
                problems, compare mandi conditions,
                exchange weather alerts and learn
                from experienced farmers.
              </p>

              <div className="fc-online">
                <span className="fc-online-dot" />

                Community active

                <span>•</span>

                {activeFarmers} contributors
              </div>
            </div>

            <div className="fc-hero-actions">
              <Button
                variant="outline"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCw
                  className={`mr-2 size-4 ${
                    isFetching
                      ? "animate-spin"
                      : ""
                  }`}
                />

                Refresh
              </Button>

              <Button
                onClick={() =>
                  setShowComposer(true)
                }
              >
                <Send className="mr-2 size-4" />
                Ask Community
              </Button>
            </div>
          </div>
        </section>

        {/* STATISTICS */}
        <section className="fc-stat-grid">
          <div className="fc-stat">
            <div className="fc-stat-icon">
              <Users className="size-5" />
            </div>

            <div className="fc-stat-label">
              Active contributors
            </div>

            <div className="fc-stat-value">
              {formatNumber(activeFarmers)}
            </div>

            <div className="fc-stat-note">
              Farmers participating
            </div>
          </div>

          <div className="fc-stat">
            <div className="fc-stat-icon">
              <MessageCircle className="size-5" />
            </div>

            <div className="fc-stat-label">
              Discussions
            </div>

            <div className="fc-stat-value">
              {formatNumber(posts.length)}
            </div>

            <div className="fc-stat-note">
              Questions & experiences
            </div>
          </div>

          <div className="fc-stat">
            <div className="fc-stat-icon">
              <Heart className="size-5" />
            </div>

            <div className="fc-stat-label">
              Helpful reactions
            </div>

            <div className="fc-stat-value">
              {formatNumber(totalLikes)}
            </div>

            <div className="fc-stat-note">
              Community support
            </div>
          </div>

          <div className="fc-stat">
            <div className="fc-stat-icon">
              <Zap className="size-5" />
            </div>

            <div className="fc-stat-label">
              Urgent problems
            </div>

            <div className="fc-stat-value">
              {urgentPosts}
            </div>

            <div className="fc-stat-note">
              Need farmer attention
            </div>
          </div>
        </section>

        <div className="fc-layout">
          {/* MAIN */}
          <main className="fc-main">
            {/* SEARCH */}
            <div className="fc-search-box">
              <Search />

              <input
                className="fc-search-input"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search crop problems, diseases, mandi prices, weather..."
              />

              {search && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <X className="size-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* FILTERS */}
            <div className="fc-filter-bar">
              {filters.map((filter) => {
                const Icon = filter.icon;

                return (
                  <button
                    key={filter.id}
                    className={`fc-filter-chip ${
                      selectedFilter ===
                      filter.id
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedFilter(
                        filter.id
                      )
                    }
                  >
                    <Icon className="size-3.5" />
                    {filter.label}
                  </button>
                );
              })}

              <button
                className={`fc-filter-chip ${
                  showFilters ? "active" : ""
                }`}
                onClick={() =>
                  setShowFilters(
                    (current) => !current
                  )
                }
              >
                <Filter className="size-3.5" />
                More filters
              </button>
            </div>

            {/* ADVANCED FILTERS */}
            {showFilters && (
              <div className="mt-3 rounded-2xl border bg-card p-4 shadow-sm">
                <div className="flex flex-wrap items-end gap-4">
                  <div>
                    <p className="mb-1 text-[9px] font-black tracking-wider text-muted-foreground">
                      CROP
                    </p>

                    <select
                      className="fc-select"
                      value={selectedCrop}
                      onChange={(event) =>
                        setSelectedCrop(
                          event.target.value
                        )
                      }
                    >
                      {cropOptions.map(
                        (crop) => (
                          <option
                            key={crop}
                          >
                            {crop}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <p className="mb-1 text-[9px] font-black tracking-wider text-muted-foreground">
                      SORT
                    </p>

                    <select
                      className="fc-select"
                      value={sortMode}
                      onChange={(event) =>
                        setSortMode(
                          event.target
                            .value as SortMode
                        )
                      }
                    >
                      <option value="latest">
                        Latest
                      </option>

                      <option value="popular">
                        Most liked
                      </option>

                      <option value="discussed">
                        Most discussed
                      </option>
                    </select>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={clearFilters}
                  >
                    Clear filters
                  </Button>
                </div>
              </div>
            )}

            {/* COMPOSER */}
            {showComposer && (
              <section className="fc-composer">
                <div className="fc-composer-header">
                  <div className="fc-composer-title">
                    <Sprout className="size-4 text-primary" />
                    Ask your farming community
                  </div>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      setShowComposer(false)
                    }
                  >
                    <X className="size-4" />
                  </Button>
                </div>

                <div className="fc-composer-body">
                  <Textarea
                    value={draft}
                    onChange={(event) =>
                      setDraft(
                        event.target.value
                      )
                    }
                    placeholder="Describe your problem clearly. Mention crop, symptoms, irrigation, recent rainfall and when the problem started..."
                    rows={5}
                  />

                  <div className="fc-composer-options">
                    <select
                      className="fc-select"
                      value={postTag}
                      onChange={(event) =>
                        setPostTag(
                          event.target.value
                        )
                      }
                    >
                      {postTypes.map(
                        (type) => (
                          <option
                            key={type}
                          >
                            {type}
                          </option>
                        )
                      )}
                    </select>

                    <select
                      className="fc-select"
                      value={postCrop}
                      onChange={(event) =>
                        setPostCrop(
                          event.target.value
                        )
                      }
                    >
                      {cropOptions
                        .filter(
                          (crop) =>
                            crop !==
                            "All crops"
                        )
                        .map(
                          (crop) => (
                            <option
                              key={crop}
                            >
                              {crop}
                            </option>
                          )
                        )}
                    </select>

                    <button
                      className={`fc-urgent-toggle ${
                        urgent
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setUrgent(
                          (current) =>
                            !current
                        )
                      }
                    >
                      <Zap className="size-3.5" />

                      {urgent
                        ? "Urgent problem"
                        : "Mark as urgent"}
                    </button>

                    <Button
                      className="ml-auto"
                      onClick={publish}
                      disabled={
                        !draft.trim()
                      }
                    >
                      <Send className="mr-2 size-4" />
                      Publish
                    </Button>
                  </div>

                  <p className="mt-3 text-[10px] leading-5 text-muted-foreground">
                    Better questions receive
                    better answers. Include crop
                    variety, field conditions,
                    visible symptoms and recent
                    weather.
                  </p>
                </div>
              </section>
            )}

            {/* RESULT HEADER */}
            <div className="fc-toolbar">
              <div>
                <div className="fc-toolbar-title">
                  Community discussions
                </div>

                <div className="fc-toolbar-sub">
                  Showing{" "}
                  {filteredPosts.length}{" "}
                  of {posts.length} discussions
                </div>
              </div>

              <div className="fc-sort">
                <Badge variant="secondary">
                  {totalReplies} replies
                </Badge>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSortMode(
                      (current) =>
                        current ===
                        "latest"
                          ? "popular"
                          : current ===
                            "popular"
                          ? "discussed"
                          : "latest"
                    );
                  }}
                >
                  {sortMode === "latest"
                    ? "Latest"
                    : sortMode === "popular"
                    ? "Popular"
                    : "Discussed"}

                  <ChevronDown className="ml-1 size-3.5" />
                </Button>
              </div>
            </div>

            {/* ERROR */}
            {isError && (
              <div className="mb-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-5">
                <div className="flex items-start gap-3">
                  <CircleHelp className="mt-0.5 size-5 text-destructive" />

                  <div>
                    <p className="font-bold">
                      Unable to load community
                      discussions
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Please check your
                      connection and try
                      again.
                    </p>

                    <Button
                      size="sm"
                      className="mt-3"
                      onClick={() =>
                        refetch()
                      }
                    >
                      Try again
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* POSTS */}
            {isLoading ? (
              <LoadingState rows={5} />
            ) : !posts.length ? (
              <div className="fc-empty">
                <div>
                  <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <Users className="size-7" />
                  </div>

                  <h3 className="mt-4 text-lg font-bold">
                    Your community starts here
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                    Ask a farming question,
                    share your experience or
                    post a useful field update.
                  </p>

                  <Button
                    className="mt-5"
                    onClick={() =>
                      setShowComposer(true)
                    }
                  >
                    <Send className="mr-2 size-4" />
                    Start Discussion
                  </Button>
                </div>
              </div>
            ) : !filteredPosts.length ? (
              <div className="fc-empty">
                <div>
                  <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <Search className="size-6" />
                  </div>

                  <h3 className="mt-4 text-lg font-bold">
                    No matching discussions
                  </h3>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Try another crop,
                    category or search
                    keyword.
                  </p>

                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            ) : (
              <div className="fc-post-list">
                {filteredPosts.map(
                  (post, index) => {
                    const isLiked =
                      liked.includes(
                        post.id
                      );

                    const isSaved =
                      bookmarked.includes(
                        post.id
                      );

                    const isFollowing =
                      following.includes(
                        post.author
                      );

                    const showReplies =
                      expandedReplies.includes(
                        post.id
                      );

                    const hasShared =
                      sharedPosts.includes(
                        post.id
                      );

                    return (
                      <article
                        key={post.id}
                        className={`fc-post ${
                          post.urgent
                            ? "urgent"
                            : ""
                        }`}
                        style={{
                          animationDelay: `${
                            index * 35
                          }ms`,
                        }}
                      >
                        {post.urgent && (
                          <div className="fc-urgent-line" />
                        )}

                        {/* POST HEADER */}
                        <div className="fc-post-head">
                          <div className="fc-user">
                            <div
                              className={`fc-avatar ${getAvatarClass(
                                post.author
                              )}`}
                            >
                              {getInitials(
                                post.author
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="fc-author">
                                <span className="truncate">
                                  {
                                    post.author
                                  }
                                </span>

                                {post.verified && (
                                  <CheckCircle2 className="fc-verified size-3.5" />
                                )}

                                {post.expert && (
                                  <span className="fc-expert">
                                    <BadgeCheck className="size-2.5" />
                                    Agri Expert
                                  </span>
                                )}
                              </div>

                              <div className="fc-author-meta">
                                <span>
                                  {
                                    post.village
                                  }
                                </span>

                                <span>
                                  •
                                </span>

                                <span>
                                  {
                                    post.postedAt
                                  }
                                </span>

                                {post.location && (
                                  <>
                                    <span>
                                      •
                                    </span>

                                    <span className="inline-flex items-center gap-1">
                                      <MapPin className="size-2.5" />
                                      {
                                        post.location
                                      }
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {post.urgent && (
                              <span className="fc-urgent-tag">
                                <Zap className="size-3" />
                                Urgent
                              </span>
                            )}

                            <Badge variant="secondary">
                              {post.tag}
                            </Badge>

                            <button
                              className="ml-1 grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
                              aria-label="More options"
                            >
                              <MoreHorizontal className="size-4" />
                            </button>
                          </div>
                        </div>

                        {/* BODY */}
                        <p className="fc-post-body">
                          {post.body}
                        </p>

                        {/* TAGS */}
                        <div className="fc-post-tags">
                          {post.crop && (
                            <span className="fc-crop-tag">
                              <Leaf className="size-3" />
                              {post.crop}
                            </span>
                          )}

                          {post.location && (
                            <span className="fc-location-tag">
                              <MapPin className="size-3" />
                              {post.location}
                            </span>
                          )}

                          {post.urgent && (
                            <span className="fc-urgent-tag">
                              <ShieldCheck className="size-3" />
                              Needs attention
                            </span>
                          )}

                          {post.verified && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-chart-2/10 px-2 py-1 text-[9px] font-bold text-chart-2">
                              <ShieldCheck className="size-3" />
                              Verified contributor
                            </span>
                          )}
                        </div>

                        {/* ACTIONS */}
                        <div className="fc-post-actions">
                          <button
                            className={`fc-action ${
                              isLiked
                                ? "liked"
                                : ""
                            }`}
                            onClick={() =>
                              like(post.id)
                            }
                          >
                            <Heart
                              className="size-4"
                              fill={
                                isLiked
                                  ? "currentColor"
                                  : "none"
                              }
                            />

                            {formatNumber(
                              Number(
                                post.likes ||
                                  0
                              )
                            )}
                          </button>

                          <button
                            className={`fc-action ${
                              showReplies
                                ? "active"
                                : ""
                            }`}
                            onClick={() =>
                              setExpandedReplies(
                                (
                                  previous
                                ) =>
                                  previous.includes(
                                    post.id
                                  )
                                    ? previous.filter(
                                        (
                                          id
                                        ) =>
                                          id !==
                                          post.id
                                      )
                                    : [
                                        ...previous,
                                        post.id,
                                      ]
                              )
                            }
                          >
                            <MessageCircle className="size-4" />

                            {Number(
                              post.replies ||
                                0
                            )}

                            <span className="hidden sm:inline">
                              replies
                            </span>
                          </button>

                          <button
                            className={`fc-action ${
                              isSaved
                                ? "active"
                                : ""
                            }`}
                            onClick={() =>
                              toggleBookmark(
                                post.id
                              )
                            }
                          >
                            <Bookmark
                              className="size-4"
                              fill={
                                isSaved
                                  ? "currentColor"
                                  : "none"
                              }
                            />

                            <span className="hidden sm:inline">
                              Save
                            </span>
                          </button>

                          <button
                            className={`fc-action ${
                              hasShared
                                ? "active"
                                : ""
                            }`}
                            onClick={() =>
                              sharePost(post)
                            }
                          >
                            <Share2 className="size-4" />

                            <span className="hidden sm:inline">
                              Share
                            </span>
                          </button>

                          <button
                            className={`fc-action fc-follow ${
                              isFollowing
                                ? "active"
                                : ""
                            }`}
                            onClick={() =>
                              toggleFollow(
                                post.author
                              )
                            }
                          >
                            <UserRound className="size-4" />

                            {isFollowing
                              ? "Following"
                              : "Follow"}
                          </button>
                        </div>

                        {/* REPLY */}
                        {showReplies && (
                          <div className="fc-reply-area">
                            <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                              Share your experience
                            </p>

                            <textarea
                              className="fc-reply-input"
                              value={
                                replyDrafts[
                                  post.id
                                ] || ""
                              }
                              onChange={(
                                event
                              ) =>
                                setReplyDrafts(
                                  (
                                    previous
                                  ) => ({
                                    ...previous,
                                    [post.id]:
                                      event
                                        .target
                                        .value,
                                  })
                                )
                              }
                              placeholder="Have you faced the same problem? Share what worked for you..."
                            />

                            <div className="mt-2 flex justify-end">
                              <Button
                                size="sm"
                                onClick={() =>
                                  addReply(
                                    post.id
                                  )
                                }
                                disabled={
                                  !replyDrafts[
                                    post.id
                                  ]?.trim()
                                }
                              >
                                <Send className="mr-1.5 size-3.5" />
                                Reply
                              </Button>
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  }
                )}
              </div>
            )}

            {/* HELP BANNER */}
            <div className="fc-help-banner">
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Tractor className="size-5" />
                  </div>

                  <div>
                    <p className="text-sm font-black">
                      Have a field problem?
                    </p>

                    <p className="mt-1 max-w-xl text-[10px] leading-5 text-muted-foreground">
                      Include crop, variety,
                      symptoms, irrigation,
                      recent rainfall and
                      location. This helps other
                      farmers provide practical
                      answers.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() =>
                    setShowComposer(true)
                  }
                >
                  Ask Farmers
                  <Send className="ml-2 size-3.5" />
                </Button>
              </div>
            </div>
          </main>

          {/* SIDEBAR */}
          <aside className="fc-sidebar">
            {/* TRENDING */}
            <div className="fc-side-card">
              <div className="fc-side-title">
                <Flame className="size-4 text-primary" />
                Trending discussions
              </div>

              <p className="fc-side-description">
                Topics currently getting
                attention from farmers.
              </p>

              <div className="mt-3">
                {[
                  [
                    "Yellow leaves after rain",
                    "Crop disease",
                    "24 discussions",
                  ],
                  [
                    "Cotton mandi prices",
                    "Market",
                    "19 discussions",
                  ],
                  [
                    "Drip irrigation savings",
                    "Water management",
                    "16 discussions",
                  ],
                  [
                    "Monsoon pest control",
                    "Weather",
                    "13 discussions",
                  ],
                  [
                    "Natural farming methods",
                    "Advice",
                    "11 discussions",
                  ],
                ].map((item, index) => (
                  <button
                    key={item[0]}
                    className="fc-trending-item"
                    onClick={() =>
                      setSearch(item[0])
                    }
                  >
                    <div className="fc-trending-number">
                      {index + 1}
                    </div>

                    <div className="min-w-0">
                      <div className="fc-trending-name truncate">
                        {item[0]}
                      </div>

                      <div className="fc-trending-count">
                        {item[1]} •{" "}
                        {item[2]}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="fc-side-card">
              <div className="fc-side-title">
                <Zap className="size-4 text-primary" />
                Quick actions
              </div>

              <div className="mt-4 grid gap-2">
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => {
                    setPostTag("Question");
                    setShowComposer(true);
                  }}
                >
                  <CircleHelp className="mr-2 size-4" />
                  Ask farming question
                </Button>

                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => {
                    setPostTag(
                      "Market Update"
                    );
                    setShowComposer(true);
                  }}
                >
                  <IndianRupee className="mr-2 size-4" />
                  Share market update
                </Button>

                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => {
                    setPostTag(
                      "Weather Alert"
                    );
                    setUrgent(true);
                    setShowComposer(true);
                  }}
                >
                  <CloudRain className="mr-2 size-4" />
                  Report weather problem
                </Button>

                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => {
                    setPostTag(
                      "Success Story"
                    );
                    setShowComposer(true);
                  }}
                >
                  <Award className="mr-2 size-4" />
                  Share success story
                </Button>
              </div>
            </div>

            {/* COMMUNITY HEALTH */}
            <div className="fc-side-card">
              <div className="fc-side-title">
                <TrendingUp className="size-4 text-primary" />
                Community activity
              </div>

              <div className="mt-4 fc-activity-grid">
                <div className="fc-activity-box">
                  <div className="fc-activity-label">
                    Contributors
                  </div>

                  <div className="fc-activity-value">
                    {activeFarmers}
                  </div>
                </div>

                <div className="fc-activity-box">
                  <div className="fc-activity-label">
                    Replies
                  </div>

                  <div className="fc-activity-value">
                    {totalReplies}
                  </div>
                </div>

                <div className="fc-activity-box">
                  <div className="fc-activity-label">
                    Experts
                  </div>

                  <div className="fc-activity-value">
                    {expertPosts}
                  </div>
                </div>

                <div className="fc-activity-box">
                  <div className="fc-activity-label">
                    Urgent
                  </div>

                  <div className="fc-activity-value">
                    {urgentPosts}
                  </div>
                </div>
              </div>
            </div>

            {/* RULES */}
            <div className="fc-side-card">
              <div className="fc-side-title">
                <ShieldCheck className="size-4 text-primary" />
                Community guidelines
              </div>

              <div className="mt-3">
                {[
                  "Give practical and respectful advice.",
                  "Mention crop and visible symptoms.",
                  "Never share passwords or bank details.",
                  "Verify recommendations before applying them.",
                  "Report misleading agricultural information.",
                ].map((rule, index) => (
                  <div
                    key={rule}
                    className="fc-community-rule"
                  >
                    <span className="fc-rule-number">
                      {index + 1}
                    </span>

                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ACTIVITY */}
            <div className="fc-side-card">
              <div className="fc-side-title">
                <Bookmark className="size-4 text-primary" />
                Your activity
              </div>

              <div className="mt-4 fc-activity-grid">
                <div className="fc-activity-box">
                  <p className="fc-activity-label">
                    Saved
                  </p>

                  <p className="fc-activity-value">
                    {bookmarked.length}
                  </p>
                </div>

                <div className="fc-activity-box">
                  <p className="fc-activity-label">
                    Following
                  </p>

                  <p className="fc-activity-value">
                    {following.length}
                  </p>
                </div>

                <div className="fc-activity-box">
                  <p className="fc-activity-label">
                    Liked
                  </p>

                  <p className="fc-activity-value">
                    {liked.length}
                  </p>
                </div>

                <div className="fc-activity-box">
                  <p className="fc-activity-label">
                    Replies
                  </p>

                  <p className="fc-activity-value">
                    {totalReplies}
                  </p>
                </div>
              </div>
            </div>

            {/* SMART TIP */}
            <div className="fc-side-card">
              <div className="fc-side-title">
                <Star className="size-4 text-primary" />
                Smart farming tip
              </div>

              <div className="mt-3 rounded-xl bg-primary/5 p-3">
                <div className="flex gap-2">
                  <Award className="mt-0.5 size-4 shrink-0 text-primary" />

                  <p className="text-[10px] leading-5 text-muted-foreground">
                    Farmers who mention
                    crop variety, field
                    location, symptoms and
                    recent rainfall usually
                    receive more useful
                    responses.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* BOTTOM STATUS */}
        <div className="fc-bottom-status">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Users className="size-5" />
            </div>

            <div>
              <p className="text-xs font-black">
                Strong farmer network
              </p>

              <p className="mt-1 text-[10px] text-muted-foreground">
                Share knowledge today and
                help another farmer solve a
                real field problem.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[9px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-3.5" />
              {activeFarmers} contributors
            </span>

            <span>•</span>

            <span className="inline-flex items-center gap-1.5">
              <MessageCircle className="size-3.5" />
              {posts.length} discussions
            </span>

            <span>•</span>

            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="size-3.5" />
              Community active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}