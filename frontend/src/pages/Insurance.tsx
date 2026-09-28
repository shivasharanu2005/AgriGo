import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ShieldCheck,
  Sprout,
  Calculator,
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  IndianRupee,
  MapPin,
  CalendarDays,
  CloudRain,
  PhoneCall,
  ExternalLink,
  ChevronRight,
  Search,
  ClipboardCheck,
  Camera,
  X,
  Info,
  LockKeyhole,
  BadgeCheck,
  CircleHelp,
  FileCheck2,
  Send,
  RefreshCw,
  Landmark,
  Globe2,
  Building2,
  ArrowUpRight,
  Smartphone,
  Tractor,
  BadgeIndianRupee,
  WalletCards,
  CircleCheck,
  Navigation,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type Season = "Kharif" | "Rabi";
type CropCategory = "Food & Oilseed" | "Commercial/Horticultural";

interface Policy {
  id: string;
  crop: string;
  variety: string;
  season: Season;
  area: number;
  sumInsured: number;
  premium: number;
  status: "Active" | "Under Review" | "Claim Filed";
  startDate: string;
  insurer: string;
}

interface Application {
  farmerName: string;
  mobile: string;
  state: string;
  district: string;
  village: string;
  crop: string;
  variety: string;
  season: Season;
  area: number;
  landType: string;
  sowingDate: string;
  bankAccount: string;
  ifsc: string;
}

interface SharedFarmDocument {
  id: string | number;
  name: string;
  documentType?: string;
  category?: string;
  purpose?: string;
  addedOn?: string;
  expiresOn?: string | null;
  url?: string;
  fileUrl?: string;
  status?: string;
}

interface Portal {
  id: string;
  name: string;
  shortName: string;
  description: string;
  category:
    | "Crop Insurance"
    | "Farmer Benefits"
    | "Karnataka"
    | "Insurance Support";
  badge: string;
  officialUrl: string;
  actionLabel: string;
  icon: React.ReactNode;
  keywords: string[];
  states?: string[];
  recommended?: boolean;
}

/* =========================================================
   CROP DATA
========================================================= */

const CROP_DATA: Record<
  string,
  {
    category: CropCategory;
    kharif: boolean;
    rabi: boolean;
    sumInsuredPerHa: number;
  }
> = {
  Rice: {
    category: "Food & Oilseed",
    kharif: true,
    rabi: false,
    sumInsuredPerHa: 65000,
  },
  Maize: {
    category: "Food & Oilseed",
    kharif: true,
    rabi: false,
    sumInsuredPerHa: 55000,
  },
  Cotton: {
    category: "Commercial/Horticultural",
    kharif: true,
    rabi: false,
    sumInsuredPerHa: 80000,
  },
  Groundnut: {
    category: "Food & Oilseed",
    kharif: true,
    rabi: false,
    sumInsuredPerHa: 60000,
  },
  Tomato: {
    category: "Commercial/Horticultural",
    kharif: true,
    rabi: true,
    sumInsuredPerHa: 90000,
  },
  Onion: {
    category: "Commercial/Horticultural",
    kharif: true,
    rabi: true,
    sumInsuredPerHa: 85000,
  },
  Wheat: {
    category: "Food & Oilseed",
    kharif: false,
    rabi: true,
    sumInsuredPerHa: 60000,
  },
  Chickpea: {
    category: "Food & Oilseed",
    kharif: false,
    rabi: true,
    sumInsuredPerHa: 58000,
  },
};

const VARIETIES: Record<string, string[]> = {
  Rice: ["IR-64", "BPT-5204", "Sona Masuri", "MTU-1010"],
  Maize: ["Pioneer", "NK-6240", "DHM-117", "Local Hybrid"],
  Cotton: ["Bt Cotton", "RCH-659", "Bunny", "Super Cotton"],
  Groundnut: ["TMV-2", "JL-24", "GPBD-4", "K-6"],
  Tomato: ["Arka Rakshak", "Arka Vikas", "Abhinav", "Hybrid Tomato"],
  Onion: ["Bhima Super", "Bhima Shakti", "Agrifound Dark Red"],
  Wheat: ["HD-2967", "HD-3086", "DBW-187"],
  Chickpea: ["JG-11", "Annigeri-1", "JAKI-9218"],
};

/* =========================================================
   OFFICIAL GOVERNMENT PORTALS
========================================================= */

const GOVERNMENT_PORTALS: Portal[] = [
  {
    id: "pmfby",
    name: "Pradhan Mantri Fasal Bima Yojana",
    shortName: "PMFBY",
    description:
      "Official Government of India crop insurance portal for crop insurance applications, premium information, policy status and crop-loss/grievance services.",
    category: "Crop Insurance",
    badge: "PRIMARY CROP INSURANCE",
    officialUrl: "https://pmfby.gov.in/",
    actionLabel: "Apply / Open PMFBY",
    icon: <ShieldCheck size={24} />,
    keywords: [
      "crop insurance",
      "fasal bima",
      "pmfby",
      "premium",
      "claim",
      "policy",
    ],
    recommended: true,
  },
  {
    id: "pmfby-login",
    name: "PMFBY Farmer Login",
    shortName: "Farmer Login",
    description:
      "Official PMFBY farmer login for accessing crop insurance services using the available government authentication flow.",
    category: "Crop Insurance",
    badge: "FARMER LOGIN",
    officialUrl: "https://pmfby.gov.in/farmerLogin",
    actionLabel: "Open Farmer Login",
    icon: <Smartphone size={24} />,
    keywords: ["login", "otp", "farmer", "pmfby"],
  },
  {
    id: "pmfby-register",
    name: "PMFBY New Farmer Registration",
    shortName: "New Registration",
    description:
      "Official PMFBY registration page for creating a farmer user account and entering farmer, residential and bank information.",
    category: "Crop Insurance",
    badge: "NEW FARMER",
    officialUrl: "https://pmfby.gov.in/farmerRegistrationForm",
    actionLabel: "Register Farmer",
    icon: <BadgeCheck size={24} />,
    keywords: ["registration", "new farmer", "account", "pmfby"],
  },
  {
    id: "pmfby-status",
    name: "PMFBY Application Status",
    shortName: "Application Status",
    description:
      "Use the official PMFBY system to check application and policy-related status.",
    category: "Insurance Support",
    badge: "TRACK STATUS",
    officialUrl: "https://pmfby.gov.in/",
    actionLabel: "Check Status",
    icon: <ClipboardCheck size={24} />,
    keywords: ["status", "application", "policy", "track"],
  },
  {
    id: "pmfby-krph",
    name: "Krishi Rakshak Portal & Helpline",
    shortName: "KRPH",
    description:
      "Official PMFBY grievance and crop-loss assistance channel. The PMFBY portal lists 14447 as the KRPH helpline.",
    category: "Insurance Support",
    badge: "LOSS / GRIEVANCE",
    officialUrl: "https://pmfby.gov.in/krph/login",
    actionLabel: "Open KRPH",
    icon: <PhoneCall size={24} />,
    keywords: ["loss", "grievance", "claim", "14447", "help"],
  },
  {
    id: "pmfby-insurers",
    name: "PMFBY Insurance Company Directory",
    shortName: "Insurer Directory",
    description:
      "Official PMFBY directory for finding insurance companies and brokers by season, scheme, state and district.",
    category: "Insurance Support",
    badge: "AUTHORIZED INSURERS",
    officialUrl: "https://pmfby.gov.in/insuranceCompanyDirectory",
    actionLabel: "Find Insurer",
    icon: <Building2 size={24} />,
    keywords: ["insurance company", "insurer", "broker", "district", "state"],
  },
  {
    id: "pmkisan",
    name: "PM-KISAN Samman Nidhi",
    shortName: "PM-KISAN",
    description:
      "Government of India farmer-benefit portal for PM-KISAN registration, beneficiary status, eKYC and related services. This is not a crop-insurance portal.",
    category: "Farmer Benefits",
    badge: "FARMER BENEFITS",
    officialUrl: "https://pmkisan.gov.in/",
    actionLabel: "Open PM-KISAN",
    icon: <WalletCards size={24} />,
    keywords: [
      "pm kisan",
      "samman nidhi",
      "benefit",
      "ekyc",
      "registration",
      "status",
    ],
  },
  {
    id: "karnataka-agriculture",
    name: "Karnataka Agriculture Services",
    shortName: "Karnataka Agriculture",
    description:
      "Karnataka Government agriculture information and services. Use the applicable state process where direct PMFBY NCIP enrolment is not available.",
    category: "Karnataka",
    badge: "STATE AGRICULTURE",
    officialUrl: "https://raitamitra.karnataka.gov.in/",
    actionLabel: "Open Karnataka Portal",
    icon: <Tractor size={24} />,
    keywords: [
      "karnataka",
      "agriculture",
      "state",
      "crop insurance",
      "farmer",
    ],
    states: ["Karnataka"],
  },
  {
    id: "karnataka-lri",
    name: "Karnataka Land Resource Information",
    shortName: "Karnataka LRI",
    description:
      "Karnataka Government land-resource information portal with agriculture, crop, soil and land-related information.",
    category: "Karnataka",
    badge: "LAND / CROP DATA",
    officialUrl: "https://sujala3lri.karnataka.gov.in/",
    actionLabel: "Open LRI Portal",
    icon: <Navigation size={24} />,
    keywords: ["land", "soil", "crop", "karnataka", "survey"],
    states: ["Karnataka"],
  },
];

/* =========================================================
   INITIAL DATA
========================================================= */

const INITIAL_POLICIES: Policy[] = [
  {
    id: "AGR-2026-008721",
    crop: "Rice",
    variety: "IR-64",
    season: "Kharif",
    area: 2.5,
    sumInsured: 162500,
    premium: 3250,
    status: "Active",
    startDate: "15 Jun 2026",
    insurer: "Government-authorized insurer",
  },
];

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Insurance() {
  const [activeTab, setActiveTab] = useState("overview");

  const [showApplication, setShowApplication] = useState(false);
  const [showLossModal, setShowLossModal] = useState(false);

  const [showPortalCenter, setShowPortalCenter] = useState(false);
  const [portalSearch, setPortalSearch] = useState("");
  const [portalCategory, setPortalCategory] = useState("All");

  const [searchPolicy, setSearchPolicy] = useState("");
  const [farmDocuments, setFarmDocuments] = useState<SharedFarmDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentUploadMessage, setDocumentUploadMessage] = useState("");
  const [uploadingDocument, setUploadingDocument] = useState<string | null>(null);
  const documentInputRef = useRef<HTMLInputElement | null>(null);
  const documentTypeRef = useRef("other");

  const [policies, setPolicies] =
    useState<Policy[]>(INITIAL_POLICIES);

  const [application, setApplication] =
    useState<Application>({
      farmerName: "",
      mobile: "",
      state: "Karnataka",
      district: "",
      village: "",
      crop: "Rice",
      variety: "IR-64",
      season: "Kharif",
      area: 1,
      landType: "Owned",
      sowingDate: "",
      bankAccount: "",
      ifsc: "",
    });

  const [lossData, setLossData] = useState({
    policyId: INITIAL_POLICIES[0].id,
    incidentDate: "",
    damageType: "Heavy Rain / Flood",
    estimatedLoss: 25,
    description: "",
    photos: [] as File[],
  });

  useEffect(() => {
    if (activeTab !== "documents") return;

    const loadSharedDocuments = async () => {
      setDocumentsLoading(true);
      try {
        const token = localStorage.getItem("agrivision_token");
        const response = await fetch("/api/agriculture/documents", {
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!response.ok) throw new Error("Unable to load documents");
        const data = await response.json();
        setFarmDocuments(Array.isArray(data) ? data : []);
      } catch {
        setFarmDocuments([]);
      } finally {
        setDocumentsLoading(false);
      }
    };

    void loadSharedDocuments();
  }, [activeTab]);

  const insuranceDocuments = farmDocuments.filter((document) => {
    const searchable = `${document.name} ${document.documentType || ""} ${document.category || ""} ${document.purpose || ""}`.toLowerCase();
    return /aadhaar|identity|bank|passbook|cheque|land|rtc|pahani|farmer|crop|insurance|policy|soil|survey/.test(searchable);
  });

  const uploadInsuranceDocument = async (file: File, title: string) => {
    setUploadingDocument(title);
    setDocumentUploadMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", file.name);
      formData.append("document_type", documentTypeRef.current);
      formData.append("category", "insurance");
      formData.append("purpose", `Insurance: ${title}`);
      const token = localStorage.getItem("agrivision_token");
      const response = await fetch("/api/agriculture/documents", {
        method: "POST",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Document upload failed.");
      setFarmDocuments((current) => [result, ...current]);
      setDocumentUploadMessage(`${title} uploaded and saved to Farmer Documents.`);
    } catch (error) {
      setDocumentUploadMessage(error instanceof Error ? error.message : "Document upload failed.");
    } finally {
      setUploadingDocument(null);
    }
  };

  const selectedCrop = CROP_DATA[application.crop];

  const premiumRate = useMemo(() => {
    if (!selectedCrop) return 0;

    if (
      selectedCrop.category ===
      "Commercial/Horticultural"
    ) {
      return 0.05;
    }

    return application.season === "Kharif"
      ? 0.02
      : 0.015;
  }, [application.season, selectedCrop]);

  const estimatedSumInsured = useMemo(() => {
    return Math.round(
      (selectedCrop?.sumInsuredPerHa || 0) *
        Number(application.area || 0)
    );
  }, [selectedCrop, application.area]);

  const estimatedPremium = useMemo(() => {
    return Math.round(
      estimatedSumInsured * premiumRate
    );
  }, [estimatedSumInsured, premiumRate]);

  const filteredPolicies = policies.filter((policy) =>
    `${policy.id} ${policy.crop} ${policy.variety}`
      .toLowerCase()
      .includes(searchPolicy.toLowerCase())
  );

  const filteredPortals = GOVERNMENT_PORTALS.filter(
    (portal) => {
      const searchMatch =
        `${portal.name} ${portal.shortName} ${portal.description} ${portal.keywords.join(
          " "
        )}`
          .toLowerCase()
          .includes(portalSearch.toLowerCase());

      const categoryMatch =
        portalCategory === "All" ||
        portal.category === portalCategory;

      return searchMatch && categoryMatch;
    }
  );

  const updateApplication = (
    field: keyof Application,
    value: string | number
  ) => {
    setApplication((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "crop"
        ? {
            variety:
              VARIETIES[String(value)]?.[0] || "",
          }
        : {}),
    }));
  };

  /* =======================================================
     PORTAL FUNCTIONS
  ======================================================= */

  const openGovernmentPortal = (
    portal: Portal
  ) => {
    window.open(
      portal.officialUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const openInsuranceCenter = () => {
    setShowPortalCenter(true);
  };

  const openRecommendedPortal = () => {
    setShowPortalCenter(true);
    setPortalCategory("Crop Insurance");
    setPortalSearch("");
  };

  /* =======================================================
     APPLICATION
  ======================================================= */

  const submitApplication = () => {
    if (
      !application.farmerName ||
      !application.mobile ||
      !application.district ||
      !application.village ||
      !application.sowingDate
    ) {
      alert(
        "Please complete all required farmer and crop details."
      );
      return;
    }

    const newPolicy: Policy = {
      id: `AGR-${new Date().getFullYear()}-${Math.floor(
        100000 + Math.random() * 900000
      )}`,
      crop: application.crop,
      variety: application.variety,
      season: application.season,
      area: Number(application.area),
      sumInsured: estimatedSumInsured,
      premium: estimatedPremium,
      status: "Under Review",
      startDate:
        new Date().toLocaleDateString("en-IN"),
      insurer: "Pending official allocation",
    };

    setPolicies((prev) => [newPolicy, ...prev]);
    setShowApplication(false);
    setActiveTab("policies");

    alert(
      `AgriGo application prepared successfully.\n\nReference ID: ${newPolicy.id}\n\nNext step: open the applicable official government portal and complete the actual insurance enrolment there.`
    );

    setTimeout(() => {
      setShowPortalCenter(true);
      setPortalCategory("Crop Insurance");
    }, 200);
  };

  /* =======================================================
     LOSS REPORT
  ======================================================= */

  const submitLossReport = () => {
    if (
      !lossData.incidentDate ||
      !lossData.description
    ) {
      alert(
        "Please enter the incident date and describe the crop loss."
      );
      return;
    }

    setPolicies((prev) =>
      prev.map((policy) =>
        policy.id === lossData.policyId
          ? {
              ...policy,
              status: "Claim Filed",
            }
          : policy
      )
    );

    setShowLossModal(false);
    setActiveTab("claims");

    alert(
      "Crop-loss report saved in AgriGo. For an actual PMFBY claim, submit the loss intimation through the applicable official government / insurer channel."
    );
  };

  return (
    <div className="insurance-page">
      <style>{styles}</style>

      {/* ===================================================
          HERO
      =================================================== */}

      <section className="insurance-hero">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />

        <div className="hero-content">
          <div className="hero-badge">
            <ShieldCheck size={17} />
            AgriGo AgriShield
            <span>Crop Insurance Assistant</span>
          </div>

          <h1>
            Protect your crop.
            <br />
            <span>Protect your income.</span>
          </h1>

          <p>
            Check insurance eligibility, estimate your
            premium, prepare your application, organize
            documents and reach the applicable official
            government insurance portal from one
            farmer-friendly dashboard.
          </p>

          <div className="hero-actions">
            <button
              className="primary-button"
              onClick={openRecommendedPortal}
            >
              <ShieldCheck size={19} />
              Apply for Crop Insurance
              <ChevronRight size={18} />
            </button>

            <button
              className="secondary-button"
              onClick={() =>
                setActiveTab("calculator")
              }
            >
              <Calculator size={18} />
              Calculate Premium
            </button>
          </div>

          <div className="hero-trust">
            <span>
              <LockKeyhole size={15} />
              AgriGo does not replace government portals
            </span>

            <span>
              <BadgeCheck size={15} />
              Official portal links
            </span>

            <span>
              <CircleHelp size={15} />
              Farmer assistance
            </span>
          </div>
        </div>

        <div className="hero-insurance-card">
          <div className="shield-circle">
            <ShieldCheck size={48} />
          </div>

          <span className="mini-label">
            YOUR CROP SAFETY
          </span>

          <h3>Insurance Protection</h3>

          <div className="protection-line">
            <div>
              <span>Policies</span>
              <strong>{policies.length}</strong>
            </div>

            <div>
              <span>Coverage</span>
              <strong>
                ₹
                {policies
                  .reduce(
                    (sum, p) => sum + p.sumInsured,
                    0
                  )
                  .toLocaleString("en-IN")}
              </strong>
            </div>
          </div>

          <div className="protection-status">
            <CheckCircle2 size={17} />
            Insurance workspace ready
          </div>
        </div>
      </section>

      {/* ===================================================
          OFFICIAL PORTAL QUICK BAR
      =================================================== */}

      <section className="portal-quick-bar">
        <div className="portal-quick-left">
          <div className="portal-government-icon">
            <Landmark size={22} />
          </div>

          <div>
            <span>OFFICIAL GOVERNMENT SERVICES</span>
            <strong>
              Need to apply? Find the correct portal first.
            </strong>
          </div>
        </div>

        <button
          className="portal-center-button"
          onClick={openInsuranceCenter}
        >
          <Globe2 size={18} />
          View Government Portals
          <ArrowUpRight size={17} />
        </button>
      </section>

      {/* ===================================================
          NAVIGATION
      =================================================== */}

      <div className="insurance-tabs">
        {[
          ["overview", "Overview", ShieldCheck],
          [
            "calculator",
            "Premium Calculator",
            Calculator,
          ],
          ["policies", "My Policies", FileCheck2],
          [
            "claims",
            "Crop Loss & Claims",
            AlertTriangle,
          ],
          ["documents", "Documents", FileText],
        ].map(([key, label, Icon]: any) => (
          <button
            key={key}
            className={
              activeTab === key ? "active" : ""
            }
            onClick={() => setActiveTab(key)}
          >
            <Icon size={17} />
            {label}
          </button>
        ))}
      </div>

      <main className="insurance-container">
        {/* =================================================
            OVERVIEW
        ================================================= */}

        {activeTab === "overview" && (
          <>
            <section className="section-heading">
              <div>
                <span className="eyebrow">
                  FARMER PROTECTION
                </span>

                <h2>
                  Insurance made understandable
                </h2>

                <p>
                  AgriGo converts the complicated
                  insurance journey into simple steps
                  and sends farmers to the appropriate
                  official portal for actual submission.
                </p>
              </div>

              <button
                className="official-button"
                onClick={openInsuranceCenter}
              >
                Government Insurance Portals
                <ExternalLink size={16} />
              </button>
            </section>

            <div className="problem-grid">
              <div className="problem-card problem">
                <div className="problem-icon">
                  <AlertTriangle />
                </div>

                <span>
                  REAL-WORLD PROBLEM
                </span>

                <h3>
                  Insurance information is fragmented
                </h3>

                <p>
                  Farmers may need to understand
                  notifications, seasons, premium,
                  documents, policy status, insurers
                  and crop-loss reporting separately.
                </p>
              </div>

              <div className="problem-card solution">
                <div className="problem-icon">
                  <Sprout />
                </div>

                <span>AGRIGO SOLUTION</span>

                <h3>
                  One farmer-first insurance workspace
                </h3>

                <p>
                  AgriGo prepares information and then
                  directs the farmer to the applicable
                  official government portal instead of
                  pretending to provide government
                  enrolment itself.
                </p>
              </div>
            </div>

            {/* PORTAL FEATURE CARD */}

            <section className="portal-feature-card">
              <div className="portal-feature-icon">
                <Landmark size={32} />
              </div>

              <div className="portal-feature-content">
                <span className="eyebrow">
                  NEW AGRIGO FEATURE
                </span>

                <h2>
                  Government Insurance Portal Center
                </h2>

                <p>
                  Click once to see PMFBY crop
                  insurance, farmer login, registration,
                  insurer directory, crop-loss support,
                  PM-KISAN and Karnataka government
                  agriculture services.
                </p>

                <div className="portal-mini-list">
                  <span>
                    <CircleCheck size={15} />
                    PMFBY Crop Insurance
                  </span>

                  <span>
                    <CircleCheck size={15} />
                    Farmer Login
                  </span>

                  <span>
                    <CircleCheck size={15} />
                    New Farmer Registration
                  </span>

                  <span>
                    <CircleCheck size={15} />
                    Insurance Company Directory
                  </span>
                </div>
              </div>

              <button
                className="portal-feature-button"
                onClick={openInsuranceCenter}
              >
                Find Official Portal
                <ArrowUpRight size={18} />
              </button>
            </section>

            <section className="workflow-card">
              <div className="workflow-title">
                <div>
                  <span className="eyebrow">
                    HOW IT WORKS
                  </span>

                  <h2>
                    From crop to protection
                  </h2>
                </div>

                <span className="workflow-tag">
                  <ClipboardCheck size={16} />
                  7-step workflow
                </span>
              </div>

              <div className="workflow">
                {[
                  [
                    "01",
                    "Add Farm",
                    "Location & land details",
                  ],
                  [
                    "02",
                    "Select Crop",
                    "Crop & variety",
                  ],
                  [
                    "03",
                    "Check Eligibility",
                    "Season & notification",
                  ],
                  [
                    "04",
                    "Calculate",
                    "Coverage & premium",
                  ],
                  [
                    "05",
                    "Prepare",
                    "Application & documents",
                  ],
                  [
                    "06",
                    "Choose Portal",
                    "Official government route",
                  ],
                  [
                    "07",
                    "Track",
                    "Policy & claims",
                  ],
                ].map(
                  ([num, title, desc]) => (
                    <div
                      className="workflow-step"
                      key={num}
                    >
                      <div className="step-number">
                        {num}
                      </div>

                      <h4>{title}</h4>

                      <p>{desc}</p>
                    </div>
                  )
                )}
              </div>
            </section>

            <div className="feature-grid">
              <FeatureCard
                icon={<Calculator />}
                title="Premium Calculator"
                description="Estimate farmer-side premium before starting the application."
                onClick={() =>
                  setActiveTab("calculator")
                }
              />

              <FeatureCard
                icon={<Landmark />}
                title="Government Portals"
                description="Find the official insurance or farmer-service portal."
                onClick={openInsuranceCenter}
              />

              <FeatureCard
                icon={<FileCheck2 />}
                title="Policy Wallet"
                description="Keep policy references, crop details and coverage together."
                onClick={() =>
                  setActiveTab("policies")
                }
              />

              <FeatureCard
                icon={<AlertTriangle />}
                title="Crop Loss Report"
                description="Record crop damage and then continue through the official claim channel."
                onClick={() =>
                  setShowLossModal(true)
                }
              />

              <FeatureCard
                icon={<FileText />}
                title="Document Vault"
                description="Prepare information and documents needed for insurance."
                onClick={() =>
                  setActiveTab("documents")
                }
              />
            </div>

            <section className="important-note">
              <Info size={20} />

              <div>
                <strong>
                  Important for Karnataka farmers
                </strong>

                <p>
                  The current PMFBY farmer-login page
                  states that direct online farmer
                  enrolment through NCIP is not available
                  for Karnataka and Gujarat because those
                  states use their own enrolment process.
                  AgriGo therefore provides guidance and
                  links rather than claiming to complete
                  government enrolment itself.
                </p>

                <button
                  className="inline-link"
                  onClick={openInsuranceCenter}
                >
                  View applicable government portals
                  <ArrowUpRight size={15} />
                </button>
              </div>
            </section>
          </>
        )}

        {/* =================================================
            CALCULATOR
        ================================================= */}

        {activeTab === "calculator" && (
          <section>
            <div className="section-heading">
              <div>
                <span className="eyebrow">
                  BEFORE YOU APPLY
                </span>

                <h2>
                  Insurance Premium Calculator
                </h2>

                <p>
                  Estimate the farmer-side premium
                  using the selected season, crop
                  category and area.
                </p>
              </div>
            </div>

            <div className="calculator-layout">
              <div className="form-card">
                <div className="form-card-header">
                  <div>
                    <span className="eyebrow">
                      CROP DETAILS
                    </span>

                    <h3>
                      Tell us about your crop
                    </h3>
                  </div>

                  <Calculator />
                </div>

                <div className="form-grid">
                  <Field label="Season">
                    <select
                      value={application.season}
                      onChange={(e) =>
                        updateApplication(
                          "season",
                          e.target.value as Season
                        )
                      }
                    >
                      <option value="Kharif">
                        Kharif
                      </option>

                      <option value="Rabi">
                        Rabi
                      </option>
                    </select>
                  </Field>

                  <Field label="Crop">
                    <select
                      value={application.crop}
                      onChange={(e) =>
                        updateApplication(
                          "crop",
                          e.target.value
                        )
                      }
                    >
                      {Object.keys(CROP_DATA).map(
                        (crop) => (
                          <option key={crop}>
                            {crop}
                          </option>
                        )
                      )}
                    </select>
                  </Field>

                  <Field label="Variety">
                    <select
                      value={application.variety}
                      onChange={(e) =>
                        updateApplication(
                          "variety",
                          e.target.value
                        )
                      }
                    >
                      {(
                        VARIETIES[
                          application.crop
                        ] || []
                      ).map((v) => (
                        <option key={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Cultivated Area">
                    <div className="input-with-unit">
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={application.area}
                        onChange={(e) =>
                          updateApplication(
                            "area",
                            Number(e.target.value)
                          )
                        }
                      />

                      <span>Hectare</span>
                    </div>
                  </Field>
                </div>

                <div className="calculation-info">
                  <Info size={17} />

                  <span>
                    This is an{" "}
                    <strong>
                      AgriGo estimate
                    </strong>
                    . Actual insurance premium,
                    notified crop, sum insured, area and
                    applicable terms must be confirmed
                    against the current government/state
                    notification.
                  </span>
                </div>
              </div>

              <div className="premium-result">
                <div className="result-icon">
                  <IndianRupee size={25} />
                </div>

                <span className="eyebrow">
                  ESTIMATED FARMER PREMIUM
                </span>

                <div className="premium-number">
                  ₹
                  {estimatedPremium.toLocaleString(
                    "en-IN"
                  )}
                </div>

                <div className="premium-rate">
                  Approx. farmer rate:{" "}
                  {(premiumRate * 100).toFixed(1)}%
                </div>

                <div className="result-breakdown">
                  <div>
                    <span>
                      Estimated Sum Insured
                    </span>

                    <strong>
                      ₹
                      {estimatedSumInsured.toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Crop</span>
                    <strong>
                      {application.crop}
                    </strong>
                  </div>

                  <div>
                    <span>Area</span>
                    <strong>
                      {application.area} ha
                    </strong>
                  </div>

                  <div>
                    <span>Season</span>
                    <strong>
                      {application.season}
                    </strong>
                  </div>
                </div>

                <button
                  className="primary-button full"
                  onClick={() =>
                    setShowApplication(true)
                  }
                >
                  Continue Application
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* =================================================
            POLICIES
        ================================================= */}

        {activeTab === "policies" && (
          <section>
            <div className="section-heading">
              <div>
                <span className="eyebrow">
                  MY INSURANCE
                </span>

                <h2>Policy Wallet</h2>

                <p>
                  Track the insurance applications
                  connected to your farm.
                </p>
              </div>

              <button
                className="primary-button"
                onClick={openRecommendedPortal}
              >
                <ShieldCheck size={18} />
                Apply / Official Portal
              </button>
            </div>

            <div className="policy-toolbar">
              <div className="search-box">
                <Search size={17} />

                <input
                  placeholder="Search policy, crop or variety..."
                  value={searchPolicy}
                  onChange={(e) =>
                    setSearchPolicy(
                      e.target.value
                    )
                  }
                />
              </div>

              <button
                className="refresh-button"
                onClick={() =>
                  setPolicies([...policies])
                }
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>

            <div className="policy-list">
              {filteredPolicies.map((policy) => (
                <div
                  className="policy-card"
                  key={policy.id}
                >
                  <div className="policy-crop-icon">
                    <Sprout />
                  </div>

                  <div className="policy-main">
                    <div className="policy-title">
                      <h3>
                        {policy.crop}{" "}
                        <span>
                          • {policy.variety}
                        </span>
                      </h3>

                      <StatusBadge
                        status={policy.status}
                      />
                    </div>

                    <p className="policy-id">
                      Policy / Reference:{" "}
                      <strong>
                        {policy.id}
                      </strong>
                    </p>

                    <div className="policy-details">
                      <span>
                        <MapPin size={15} />
                        {policy.area} hectare
                      </span>

                      <span>
                        <CalendarDays size={15} />
                        {policy.season}
                      </span>

                      <span>
                        <IndianRupee size={15} />
                        Premium ₹
                        {policy.premium.toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="coverage-box">
                    <span>Coverage</span>

                    <strong>
                      ₹
                      {policy.sumInsured.toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* =================================================
            CLAIMS
        ================================================= */}

        {activeTab === "claims" && (
          <section>
            <div className="section-heading">
              <div>
                <span className="eyebrow">
                  WHEN SOMETHING GOES WRONG
                </span>

                <h2>
                  Crop Loss & Claim Assistant
                </h2>

                <p>
                  Record damage quickly and keep the
                  incident information organized for
                  the applicable official claim process.
                </p>
              </div>

              <button
                className="danger-button"
                onClick={() =>
                  setShowLossModal(true)
                }
              >
                <AlertTriangle size={18} />
                Report Crop Loss
              </button>
            </div>

            <div className="claim-alert">
              <div className="claim-alert-icon">
                <Clock3 />
              </div>

              <div>
                <strong>
                  Time-sensitive action
                </strong>

                <p>
                  If your crop is damaged, check your
                  applicable policy/state/insurer
                  notification for the prescribed
                  reporting timeline and submit the
                  official intimation through the
                  applicable channel.
                </p>
              </div>
            </div>

            <div className="claim-grid">
              <div className="claim-process-card">
                <span className="eyebrow">
                  LOSS REPORT WORKFLOW
                </span>

                {[
                  [
                    "01",
                    "Record incident",
                    "Date, location and damage type",
                  ],
                  [
                    "02",
                    "Capture evidence",
                    "Photos/videos and crop details",
                  ],
                  [
                    "03",
                    "Submit official intimation",
                    "Use applicable government/insurer channel",
                  ],
                  [
                    "04",
                    "Track claim",
                    "Keep reference number and updates",
                  ],
                ].map(
                  ([num, title, desc]) => (
                    <div
                      className="claim-step"
                      key={num}
                    >
                      <div>{num}</div>

                      <section>
                        <strong>{title}</strong>
                        <span>{desc}</span>
                      </section>
                    </div>
                  )
                )}
              </div>

              <div className="claim-help-card">
                <CloudRain size={30} />

                <h3>
                  Common crop-loss events
                </h3>

                <div className="damage-tags">
                  <span>Heavy Rain</span>
                  <span>Flood</span>
                  <span>Drought</span>
                  <span>Hailstorm</span>
                  <span>Storm</span>
                  <span>Pest/Disease</span>
                  <span>Heatwave</span>
                </div>

                <button
                  className="secondary-button full"
                  onClick={() => {
                    setShowPortalCenter(true);
                    setPortalCategory(
                      "Insurance Support"
                    );
                  }}
                >
                  Official Loss / Claim Portals
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>

            <div className="helpline-card">
              <div>
                <PhoneCall size={22} />

                <div>
                  <strong>
                    PMFBY / Krishi Rakshak
                    Helpline
                  </strong>

                  <span>
                    Official PMFBY portal lists
                  </span>
                </div>
              </div>

              <a href="tel:14447">14447</a>
            </div>
          </section>
        )}

        {/* =================================================
            DOCUMENTS
        ================================================= */}

        {activeTab === "documents" && (
          <section>
            <div className="section-heading">
              <div>
                <span className="eyebrow">
                  APPLICATION READINESS
                </span>

                <h2>
                  Insurance Document Vault
                </h2>

                <p>
                  Keep commonly required information
                  organized before starting an insurance
                  application.
                </p>
              </div>
            </div>

            <div className="document-grid">
              {[
                [
                  "Identity Proof",
                  "Aadhaar / applicable farmer ID",
                  "Required for identity verification",
                ],
                [
                  "Bank Details",
                  "Account + IFSC",
                  "For eligible claim/payment processing",
                ],
                [
                  "Land / Cultivation Details",
                  "Land record / cultivation proof as applicable",
                  "Farm and insurable-interest information",
                ],
                [
                  "Crop Details",
                  "Crop, variety, area and sowing date",
                  "Used to prepare the application",
                ],
                [
                  "Crop Damage Evidence",
                  "Photos / videos",
                  "Useful when reporting crop damage",
                ],
                [
                  "Policy Documents",
                  "Policy/reference number",
                  "Keep for future tracking",
                ],
              ].map(
                ([title, desc, note]) => (
                  <div
                    className="document-card"
                    key={title}
                  >
                    <div className="document-icon">
                      <FileText size={22} />
                    </div>

                    <div>
                      <h3>{title}</h3>
                      <p>{desc}</p>
                      <small>{note}</small>
                    </div>

                    <button
                      title={`Upload ${title}`}
                      disabled={uploadingDocument === title}
                      onClick={() => {
                        documentTypeRef.current = title.toLowerCase().replace(/[^a-z0-9]+/g, "_");
                        documentInputRef.current?.click();
                      }}
                    >
                      {uploadingDocument === title ? <RefreshCw size={17} className="fd-spin" /> : <Upload size={17} />}
                    </button>
                  </div>
                )
              )}
            </div>

            <input
              ref={documentInputRef}
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void uploadInsuranceDocument(file, documentTypeRef.current.replace(/_/g, " "));
                event.target.value = "";
              }}
            />

            {documentUploadMessage && (
              <div className="privacy-card" style={{ marginTop: 18 }}>
                <FileCheck2 size={22} />
                <p>{documentUploadMessage}</p>
              </div>
            )}

            <div className="privacy-card" style={{ marginTop: 18 }}>
              <FileCheck2 size={22} />
              <div style={{ width: "100%" }}>
                <strong>Documents linked from Farmer Documents</strong>
                <p>
                  Uploads and updates from the Farmer Documents page appear here automatically.
                </p>
                {documentsLoading ? (
                  <p>Loading your saved documents...</p>
                ) : insuranceDocuments.length === 0 ? (
                  <p>No saved insurance-related documents yet. Upload one from Farmer Documents.</p>
                ) : (
                  <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                    {insuranceDocuments.map((document) => {
                      const documentUrl = document.url || document.fileUrl;
                      return (
                        <div key={document.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                          <span>
                            {document.name} {document.status ? `(${document.status})` : ""}
                          </span>
                          {documentUrl && (
                            <a href={documentUrl} target="_blank" rel="noreferrer" className="refresh-button">
                              View
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="privacy-card">
              <LockKeyhole size={22} />

              <div>
                <strong>
                  Privacy-first design
                </strong>

                <p>
                  Sensitive documents should be stored
                  securely on your authenticated backend.
                  Do not permanently store Aadhaar,
                  bank details or other sensitive
                  documents in browser localStorage.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ===================================================
          GOVERNMENT PORTAL CENTER MODAL
      =================================================== */}

      {showPortalCenter && (
        <div
          className="portal-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPortalCenter(false);
            }
          }}
        >
          <div className="portal-center-modal">
            <button
              className="portal-close"
              onClick={() =>
                setShowPortalCenter(false)
              }
            >
              <X size={20} />
            </button>

            <div className="portal-modal-header">
              <div className="portal-modal-icon">
                <Landmark size={30} />
              </div>

              <div>
                <span className="eyebrow">
                  AGRIGO GOVERNMENT CONNECT
                </span>

                <h2>
                  Official Government Portals
                </h2>

                <p>
                  Choose the service you need. AgriGo
                  will open the official government
                  website in a new tab.
                </p>
              </div>
            </div>

            <div className="portal-warning">
              <Info size={17} />

              <span>
                <strong>
                  Important:
                </strong>{" "}
                AgriGo does not collect government
                insurance applications on this page.
                The actual application, authentication,
                payment and enrolment happen on the
                official government portal.
              </span>
            </div>

            <div className="portal-tools">
              <div className="portal-search">
                <Search size={18} />

                <input
                  placeholder="Search PMFBY, PM-KISAN, Karnataka, claim..."
                  value={portalSearch}
                  onChange={(e) =>
                    setPortalSearch(
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="portal-filters">
                {[
                  "All",
                  "Crop Insurance",
                  "Insurance Support",
                  "Farmer Benefits",
                  "Karnataka",
                ].map((category) => (
                  <button
                    key={category}
                    className={
                      portalCategory ===
                      category
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      setPortalCategory(
                        category
                      )
                    }
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="portal-grid">
              {filteredPortals.map(
                (portal) => (
                  <div
                    className={`portal-card ${
                      portal.recommended
                        ? "recommended"
                        : ""
                    }`}
                    key={portal.id}
                  >
                    {portal.recommended && (
                      <div className="recommended-ribbon">
                        RECOMMENDED
                      </div>
                    )}

                    <div className="portal-card-top">
                      <div className="portal-card-icon">
                        {portal.icon}
                      </div>

                      <span
                        className={`portal-category ${
                          portal.category
                            .toLowerCase()
                            .replace(
                              /\s+/g,
                              "-"
                            )
                        }`}
                      >
                        {portal.badge}
                      </span>
                    </div>

                    <h3>{portal.name}</h3>

                    <p>
                      {portal.description}
                    </p>

                    <div className="portal-url-label">
                      <Globe2 size={14} />
                      Official government website
                    </div>

                    <button
                      className="portal-open-button"
                      onClick={() =>
                        openGovernmentPortal(
                          portal
                        )
                      }
                    >
                      {portal.actionLabel}
                      <ExternalLink
                        size={16}
                      />
                    </button>
                  </div>
                )
              )}
            </div>

            {filteredPortals.length === 0 && (
              <div className="portal-empty">
                <Search size={28} />

                <h3>
                  No portal found
                </h3>

                <p>
                  Try searching for PMFBY,
                  PM-KISAN, Karnataka, claim,
                  insurer or registration.
                </p>
              </div>
            )}

            <div className="portal-footer-note">
              <ShieldCheck size={18} />

              <span>
                Always verify the website address and
                government branding before entering
                sensitive information.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          APPLICATION MODAL
      =================================================== */}

      {showApplication && (
        <div className="modal-backdrop">
          <div className="application-modal">
            <button
              className="close-modal"
              onClick={() =>
                setShowApplication(false)
              }
            >
              <X />
            </button>

            <div className="modal-header">
              <div className="modal-icon">
                <ShieldCheck />
              </div>

              <div>
                <span className="eyebrow">
                  AGRISHIELD
                </span>

                <h2>
                  Prepare Crop Insurance
                  Application
                </h2>

                <p>
                  AgriGo prepares your information.
                  After this, you can continue to
                  the appropriate official government
                  portal.
                </p>
              </div>
            </div>

            <div className="form-grid">
              <Field label="Farmer Name *">
                <input
                  value={
                    application.farmerName
                  }
                  onChange={(e) =>
                    updateApplication(
                      "farmerName",
                      e.target.value
                    )
                  }
                  placeholder="Enter farmer name"
                />
              </Field>

              <Field label="Mobile Number *">
                <input
                  value={application.mobile}
                  onChange={(e) =>
                    updateApplication(
                      "mobile",
                      e.target.value
                    )
                  }
                  placeholder="10-digit mobile number"
                  maxLength={10}
                />
              </Field>

              <Field label="State">
                <select
                  value={application.state}
                  onChange={(e) =>
                    updateApplication(
                      "state",
                      e.target.value
                    )
                  }
                >
                  <option>
                    Karnataka
                  </option>
                  <option>
                    Maharashtra
                  </option>
                  <option>
                    Telangana
                  </option>
                  <option>
                    Andhra Pradesh
                  </option>
                  <option>
                    Tamil Nadu
                  </option>
                  <option>Other</option>
                </select>
              </Field>

              <Field label="District *">
                <input
                  value={
                    application.district
                  }
                  onChange={(e) =>
                    updateApplication(
                      "district",
                      e.target.value
                    )
                  }
                  placeholder="District"
                />
              </Field>

              <Field label="Village *">
                <input
                  value={
                    application.village
                  }
                  onChange={(e) =>
                    updateApplication(
                      "village",
                      e.target.value
                    )
                  }
                  placeholder="Village"
                />
              </Field>

              <Field label="Land Type">
                <select
                  value={
                    application.landType
                  }
                  onChange={(e) =>
                    updateApplication(
                      "landType",
                      e.target.value
                    )
                  }
                >
                  <option>Owned</option>
                  <option>Leased</option>
                  <option>
                    Other eligible interest
                  </option>
                </select>
              </Field>

              <Field label="Crop *">
                <select
                  value={application.crop}
                  onChange={(e) =>
                    updateApplication(
                      "crop",
                      e.target.value
                    )
                  }
                >
                  {Object.keys(
                    CROP_DATA
                  ).map((crop) => (
                    <option key={crop}>
                      {crop}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Variety">
                <select
                  value={
                    application.variety
                  }
                  onChange={(e) =>
                    updateApplication(
                      "variety",
                      e.target.value
                    )
                  }
                >
                  {(
                    VARIETIES[
                      application.crop
                    ] || []
                  ).map((v) => (
                    <option key={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Season">
                <select
                  value={
                    application.season
                  }
                  onChange={(e) =>
                    updateApplication(
                      "season",
                      e.target.value as Season
                    )
                  }
                >
                  <option>Kharif</option>
                  <option>Rabi</option>
                </select>
              </Field>

              <Field label="Cultivated Area (ha) *">
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={
                    application.area
                  }
                  onChange={(e) =>
                    updateApplication(
                      "area",
                      Number(
                        e.target.value
                      )
                    )
                  }
                />
              </Field>

              <Field label="Sowing Date *">
                <input
                  type="date"
                  value={
                    application.sowingDate
                  }
                  onChange={(e) =>
                    updateApplication(
                      "sowingDate",
                      e.target.value
                    )
                  }
                />
              </Field>

              <Field label="IFSC">
                <input
                  value={
                    application.ifsc
                  }
                  onChange={(e) =>
                    updateApplication(
                      "ifsc",
                      e.target.value.toUpperCase()
                    )
                  }
                  placeholder="Example: SBIN0001234"
                />
              </Field>
            </div>

            <div className="application-summary">
              <div>
                <span>
                  Estimated coverage
                </span>

                <strong>
                  ₹
                  {estimatedSumInsured.toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Estimated premium
                </span>

                <strong>
                  ₹
                  {estimatedPremium.toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Rate used
                </span>

                <strong>
                  {(premiumRate * 100).toFixed(
                    1
                  )}
                  %
                </strong>
              </div>
            </div>

            <div className="modal-warning">
              <AlertTriangle size={17} />

              <span>
                This creates an AgriGo
                application/reference record. It
                does not itself constitute government
                enrolment or insurance coverage. Final
                eligibility, notified crop, sum
                insured, premium and submission
                channel must be confirmed officially.
              </span>
            </div>

            <div className="modal-actions">
              <button
                className="secondary-button"
                onClick={() =>
                  setShowApplication(false)
                }
              >
                Cancel
              </button>

              <button
                className="primary-button"
                onClick={submitApplication}
              >
                <Send size={17} />
                Prepare & Find Official Portal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          LOSS MODAL
      =================================================== */}

      {showLossModal && (
        <div className="modal-backdrop">
          <div className="application-modal loss-modal">
            <button
              className="close-modal"
              onClick={() =>
                setShowLossModal(false)
              }
            >
              <X />
            </button>

            <div className="modal-header">
              <div className="modal-icon danger">
                <AlertTriangle />
              </div>

              <div>
                <span className="eyebrow">
                  CROP LOSS
                </span>

                <h2>
                  Report Crop Damage
                </h2>

                <p>
                  Record the incident and evidence so
                  the information is ready for the
                  applicable official process.
                </p>
              </div>
            </div>

            <div className="form-grid">
              <Field label="Policy / Reference">
                <select
                  value={
                    lossData.policyId
                  }
                  onChange={(e) =>
                    setLossData({
                      ...lossData,
                      policyId:
                        e.target.value,
                    })
                  }
                >
                  {policies.map(
                    (policy) => (
                      <option
                        key={policy.id}
                        value={policy.id}
                      >
                        {policy.id} —{" "}
                        {policy.crop}
                      </option>
                    )
                  )}
                </select>
              </Field>

              <Field label="Incident Date *">
                <input
                  type="date"
                  value={
                    lossData.incidentDate
                  }
                  onChange={(e) =>
                    setLossData({
                      ...lossData,
                      incidentDate:
                        e.target.value,
                    })
                  }
                />
              </Field>

              <Field label="Damage Type">
                <select
                  value={
                    lossData.damageType
                  }
                  onChange={(e) =>
                    setLossData({
                      ...lossData,
                      damageType:
                        e.target.value,
                    })
                  }
                >
                  <option>
                    Heavy Rain / Flood
                  </option>
                  <option>Drought</option>
                  <option>
                    Hailstorm
                  </option>
                  <option>
                    Storm / Cyclone
                  </option>
                  <option>
                    Heatwave
                  </option>
                  <option>
                    Pest Attack
                  </option>
                  <option>
                    Disease
                  </option>
                  <option>Other</option>
                </select>
              </Field>

              <Field label="Estimated Crop Damage">
                <div className="range-control">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={
                      lossData.estimatedLoss
                    }
                    onChange={(e) =>
                      setLossData({
                        ...lossData,
                        estimatedLoss:
                          Number(
                            e.target.value
                          ),
                      })
                    }
                  />

                  <strong>
                    {lossData.estimatedLoss}%
                  </strong>
                </div>
              </Field>

              <div className="full-field">
                <label>
                  Describe the damage *
                </label>

                <textarea
                  rows={5}
                  value={
                    lossData.description
                  }
                  onChange={(e) =>
                    setLossData({
                      ...lossData,
                      description:
                        e.target.value,
                    })
                  }
                  placeholder="Example: Heavy rain damaged approximately 40% of the rice crop..."
                />
              </div>

              <div className="full-field">
                <label>
                  Evidence Photos
                </label>

                <label className="upload-zone">
                  <Camera size={25} />

                  <strong>
                    Add crop damage photos
                  </strong>

                  <span>
                    Photos should clearly show
                    the affected crop and field.
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) =>
                      setLossData({
                        ...lossData,
                        photos:
                          Array.from(
                            e.target.files ||
                              []
                          ),
                      })
                    }
                  />
                </label>

                {lossData.photos.length >
                  0 && (
                  <div className="selected-files">
                    {lossData.photos.map(
                      (file) => (
                        <span
                          key={file.name}
                        >
                          <FileCheck2
                            size={14}
                          />
                          {file.name}
                        </span>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-warning">
              <Clock3 size={17} />

              <span>
                AgriGo saves this as an assistance
                record. It should not be treated as
                confirmation that an official claim has
                been lodged. Follow the applicable
                policy/state/insurer reporting
                procedure and timeline.
              </span>
            </div>

            <div className="modal-actions">
              <button
                className="secondary-button"
                onClick={() =>
                  setShowLossModal(false)
                }
              >
                Cancel
              </button>

              <button
                className="secondary-button"
                onClick={() => {
                  setShowLossModal(false);
                  setShowPortalCenter(true);
                  setPortalCategory(
                    "Insurance Support"
                  );
                }}
              >
                <ExternalLink size={17} />
                Official Claim Portal
              </button>

              <button
                className="danger-button"
                onClick={submitLossReport}
              >
                <Send size={17} />
                Save Loss Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   REUSABLE COMPONENTS
========================================================= */

function FeatureCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      className="feature-card"
      onClick={onClick}
    >
      <div className="feature-icon">
        {icon}
      </div>

      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      <ChevronRight />
    </button>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: Policy["status"];
}) {
  const map = {
    Active: "active",
    "Under Review": "review",
    "Claim Filed": "claim",
  };

  return (
    <span
      className={`status-badge ${map[status]}`}
    >
      {status === "Active" && (
        <CheckCircle2 size={14} />
      )}

      {status === "Under Review" && (
        <Clock3 size={14} />
      )}

      {status === "Claim Filed" && (
        <AlertTriangle size={14} />
      )}

      {status}
    </span>
  );
}

/* =========================================================
   SINGLE FILE CSS
========================================================= */

const styles = `
* {
  box-sizing: border-box;
}

.insurance-page {
  min-height: 100vh;
  background:
    radial-gradient(
      circle at 10% 0%,
      rgba(52, 211, 153, .10),
      transparent 32%
    ),
    #f6faf7;
  color: #14231b;
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

/* =========================================================
   HERO
========================================================= */

.insurance-hero {
  position: relative;
  min-height: 470px;
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(330px, .6fr);
  gap: 60px;
  align-items: center;
  padding: 70px clamp(24px, 7vw, 100px);
  background:
    linear-gradient(
      135deg,
      #073b25 0%,
      #0b5734 48%,
      #0e713f 100%
    );
  color: white;
}

.hero-glow {
  position: absolute;
  width: 430px;
  height: 430px;
  border-radius: 50%;
  filter: blur(10px);
  pointer-events: none;
}

.hero-glow-one {
  top: -240px;
  right: 12%;
  background: rgba(110, 231, 183, .15);
}

.hero-glow-two {
  bottom: -300px;
  left: -100px;
  background: rgba(255, 255, 255, .08);
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 850px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 13px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,.18);
  background: rgba(255,255,255,.09);
  backdrop-filter: blur(12px);
  font-size: 13px;
  font-weight: 800;
}

.hero-badge span {
  opacity: .72;
  font-weight: 500;
}

.hero-content h1 {
  margin: 23px 0 16px;
  font-size: clamp(40px, 5vw, 70px);
  line-height: .98;
  letter-spacing: -3px;
}

.hero-content h1 span {
  color: #9ff0bf;
}

.hero-content > p {
  max-width: 700px;
  margin: 0;
  color: rgba(255,255,255,.78);
  font-size: 16px;
  line-height: 1.75;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}

.hero-trust {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 26px;
}

.hero-trust span {
  display: flex;
  align-items: center;
  gap: 7px;
  color: rgba(255,255,255,.65);
  font-size: 12px;
}

.hero-insurance-card {
  position: relative;
  z-index: 2;
  padding: 28px;
  border: 1px solid rgba(255,255,255,.16);
  border-radius: 28px;
  background:
    linear-gradient(
      145deg,
      rgba(255,255,255,.13),
      rgba(255,255,255,.06)
    );
  box-shadow: 0 30px 70px rgba(0,0,0,.18);
  backdrop-filter: blur(20px);
}

.shield-circle {
  width: 78px;
  height: 78px;
  display: grid;
  place-items: center;
  border-radius: 24px;
  background: rgba(167,243,208,.15);
  color: #a7f3d0;
  margin-bottom: 25px;
}

.mini-label {
  display: block;
  color: #a7f3d0;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 1.6px;
}

.hero-insurance-card h3 {
  margin: 7px 0 22px;
  font-size: 27px;
}

.protection-line {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.protection-line div {
  padding: 15px;
  border-radius: 17px;
  background: rgba(0,0,0,.12);
}

.protection-line span {
  display: block;
  color: rgba(255,255,255,.58);
  font-size: 11px;
  margin-bottom: 6px;
}

.protection-line strong {
  font-size: 18px;
}

.protection-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 18px;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(167,243,208,.10);
  color: #bbf7d0;
  font-size: 12px;
  font-weight: 700;
}

/* =========================================================
   BUTTONS
========================================================= */

.primary-button,
.secondary-button,
.official-button,
.danger-button,
.portal-center-button,
.portal-feature-button,
.portal-open-button,
.refresh-button {
  border: 0;
  cursor: pointer;
  font: inherit;
  font-weight: 800;
  transition:
    transform .2s ease,
    box-shadow .2s ease,
    background .2s ease;
}

.primary-button {
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 0 18px;
  border-radius: 14px;
  color: #06351f;
  background: #b7f7ce;
  box-shadow: 0 12px 25px rgba(0,0,0,.12);
}

.primary-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 30px rgba(0,0,0,.17);
}

.secondary-button {
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 0 18px;
  border-radius: 14px;
  color: #135b38;
  background: #e9f7ef;
  border: 1px solid #cde9d8;
}

.secondary-button:hover {
  transform: translateY(-2px);
  background: #dcf5e6;
}

.insurance-hero .secondary-button {
  color: white;
  background: rgba(255,255,255,.09);
  border-color: rgba(255,255,255,.18);
}

.official-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 15px;
  border-radius: 12px;
  color: #11623a;
  background: #e8f8ef;
}

.danger-button {
  min-height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 17px;
  border-radius: 13px;
  color: #991b1b;
  background: #fee2e2;
  border: 1px solid #fecaca;
}

.danger-button:hover {
  transform: translateY(-2px);
  background: #fecaca;
}

.full {
  width: 100%;
}

/* =========================================================
   PORTAL QUICK BAR
========================================================= */

.portal-quick-bar {
  width: min(1180px, calc(100% - 36px));
  margin: -32px auto 0;
  position: relative;
  z-index: 5;
  padding: 17px 19px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  border: 1px solid #d9ebe0;
  border-radius: 20px;
  background: rgba(255,255,255,.96);
  box-shadow: 0 18px 45px rgba(18, 67, 41, .12);
  backdrop-filter: blur(18px);
}

.portal-quick-left {
  display: flex;
  align-items: center;
  gap: 13px;
}

.portal-government-icon {
  width: 45px;
  height: 45px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  color: #166534;
  background: #dcfce7;
}

.portal-quick-left span {
  display: block;
  color: #689078;
  font-size: 9px;
  letter-spacing: 1.4px;
  font-weight: 900;
}

.portal-quick-left strong {
  display: block;
  margin-top: 3px;
  font-size: 14px;
  color: #173626;
}

.portal-center-button {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 15px;
  border-radius: 12px;
  color: white;
  background: #126238;
}

.portal-center-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(18,98,56,.2);
}

/* =========================================================
   TABS
========================================================= */

.insurance-tabs {
  width: min(1180px, calc(100% - 36px));
  margin: 30px auto 0;
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 6px;
  border: 1px solid #dcece2;
  border-radius: 17px;
  background: white;
}

.insurance-tabs button {
  flex: 1;
  min-width: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 43px;
  padding: 0 12px;
  border: 0;
  border-radius: 11px;
  background: transparent;
  color: #607668;
  cursor: pointer;
  font-weight: 800;
}

.insurance-tabs button.active {
  color: white;
  background: #116139;
  box-shadow: 0 8px 18px rgba(17,97,57,.18);
}

/* =========================================================
   CONTAINER
========================================================= */

.insurance-container {
  width: min(1180px, calc(100% - 36px));
  margin: 38px auto 90px;
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 30px;
  margin-bottom: 25px;
}

.eyebrow {
  color: #1a7a48;
  font-size: 10px;
  font-weight: 950;
  letter-spacing: 1.7px;
}

.section-heading h2 {
  margin: 7px 0 8px;
  font-size: 34px;
  letter-spacing: -1.2px;
}

.section-heading p {
  max-width: 700px;
  margin: 0;
  color: #718379;
  line-height: 1.7;
}

/* =========================================================
   PROBLEM CARDS
========================================================= */

.problem-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 17px;
  margin-bottom: 22px;
}

.problem-card {
  padding: 25px;
  border: 1px solid #dfebe3;
  border-radius: 23px;
  background: white;
}

.problem-card .problem-icon {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  margin-bottom: 18px;
}

.problem-card.problem .problem-icon {
  color: #b45309;
  background: #fef3c7;
}

.problem-card.solution .problem-icon {
  color: #15803d;
  background: #dcfce7;
}

.problem-card > span {
  color: #759080;
  font-size: 9px;
  font-weight: 950;
  letter-spacing: 1.4px;
}

.problem-card h3 {
  margin: 8px 0;
  font-size: 21px;
}

.problem-card p {
  margin: 0;
  color: #718379;
  line-height: 1.65;
}

/* =========================================================
   PORTAL FEATURE
========================================================= */

.portal-feature-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 22px;
  align-items: center;
  padding: 27px;
  margin-bottom: 22px;
  border: 1px solid #bfe6ce;
  border-radius: 24px;
  background:
    radial-gradient(
      circle at 85% 20%,
      rgba(74,222,128,.15),
      transparent 32%
    ),
    linear-gradient(
      135deg,
      #f4fff7,
      #eaf8ef
    );
}

.portal-feature-icon {
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  border-radius: 19px;
  color: #166534;
  background: white;
  box-shadow: 0 10px 25px rgba(22,101,52,.10);
}

.portal-feature-content h2 {
  margin: 5px 0 7px;
  font-size: 24px;
}

.portal-feature-content p {
  margin: 0;
  max-width: 720px;
  color: #668071;
  line-height: 1.65;
}

.portal-mini-list {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin-top: 13px;
}

.portal-mini-list span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 9px;
  border-radius: 999px;
  background: rgba(255,255,255,.85);
  color: #276342;
  font-size: 11px;
  font-weight: 750;
}

.portal-feature-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 15px;
  border-radius: 13px;
  color: white;
  background: #146337;
}

/* =========================================================
   WORKFLOW
========================================================= */

.workflow-card {
  padding: 28px;
  border: 1px solid #dfebe3;
  border-radius: 25px;
  background: white;
}

.workflow-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.workflow-title h2 {
  margin: 6px 0 0;
  font-size: 25px;
}

.workflow-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 11px;
  border-radius: 999px;
  background: #edf8f1;
  color: #267247;
  font-size: 11px;
  font-weight: 800;
}

.workflow {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
  margin-top: 25px;
}

.workflow-step {
  min-height: 135px;
  padding: 13px;
  border-radius: 17px;
  background: #f8fbf9;
  border: 1px solid #e7f0e9;
}

.step-number {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 9px;
  background: #d9f4e2;
  color: #18703f;
  font-size: 10px;
  font-weight: 950;
}

.workflow-step h4 {
  margin: 13px 0 5px;
  font-size: 13px;
}

.workflow-step p {
  margin: 0;
  color: #809188;
  font-size: 11px;
  line-height: 1.45;
}

/* =========================================================
   FEATURES
========================================================= */

.feature-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin: 22px 0;
}

.feature-card {
  min-height: 175px;
  text-align: left;
  padding: 18px;
  border: 1px solid #dfebe3;
  border-radius: 19px;
  background: white;
  cursor: pointer;
  position: relative;
  transition: .2s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  border-color: #b9dfc7;
  box-shadow: 0 15px 30px rgba(17,72,42,.08);
}

.feature-icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  color: #18713f;
  background: #e5f7eb;
  margin-bottom: 15px;
}

.feature-card h3 {
  margin: 0 0 7px;
  font-size: 15px;
}

.feature-card p {
  margin: 0;
  color: #7b8b82;
  font-size: 12px;
  line-height: 1.55;
}

.feature-card > svg {
  position: absolute;
  right: 13px;
  top: 14px;
  color: #a4b5aa;
}

/* =========================================================
   NOTES
========================================================= */

.important-note,
.calculation-info,
.modal-warning,
.portal-warning {
  display: flex;
  gap: 12px;
  padding: 17px;
  border-radius: 15px;
  background: #fffbea;
  border: 1px solid #f3e4a5;
  color: #715b16;
}

.important-note {
  margin-top: 20px;
}

.important-note p,
.modal-warning span,
.portal-warning span {
  margin: 5px 0 0;
  line-height: 1.6;
  font-size: 12px;
}

.inline-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 10px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #126238;
  cursor: pointer;
  font-weight: 900;
}

/* =========================================================
   CALCULATOR
========================================================= */

.calculator-layout {
  display: grid;
  grid-template-columns: 1.3fr .7fr;
  gap: 20px;
}

.form-card,
.premium-result {
  padding: 27px;
  border: 1px solid #dfebe3;
  border-radius: 23px;
  background: white;
}

.form-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.form-card-header h3 {
  margin: 6px 0 0;
  font-size: 23px;
}

.form-card-header > svg {
  width: 42px;
  height: 42px;
  padding: 10px;
  border-radius: 13px;
  background: #e7f7ed;
  color: #187140;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.field label,
.full-field label {
  display: block;
  margin-bottom: 7px;
  color: #42564a;
  font-size: 11px;
  font-weight: 850;
}

.field input,
.field select,
.full-field textarea {
  width: 100%;
  min-height: 46px;
  padding: 0 13px;
  border: 1px solid #dbe7df;
  border-radius: 12px;
  background: #fbfdfc;
  outline: none;
  color: #20352a;
  font: inherit;
}

.field input:focus,
.field select:focus,
.full-field textarea:focus {
  border-color: #58aa78;
  box-shadow: 0 0 0 3px rgba(88,170,120,.10);
}

.input-with-unit {
  display: flex;
}

.input-with-unit input {
  border-radius: 12px 0 0 12px;
}

.input-with-unit span {
  display: flex;
  align-items: center;
  padding: 0 10px;
  border: 1px solid #dbe7df;
  border-left: 0;
  border-radius: 0 12px 12px 0;
  color: #809188;
  font-size: 11px;
}

.calculation-info {
  margin-top: 18px;
  background: #f3faf5;
  border-color: #d8ecdf;
  color: #52705e;
}

.premium-result {
  background:
    radial-gradient(
      circle at 90% 5%,
      rgba(111, 226, 153, .20),
      transparent 38%
    ),
    #0d4f2e;
  color: white;
}

.result-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  color: #a7f3d0;
  background: rgba(167,243,208,.13);
  margin-bottom: 22px;
}

.premium-result .eyebrow {
  color: #9be9bb;
}

.premium-number {
  margin: 10px 0 5px;
  font-size: 42px;
  font-weight: 950;
  letter-spacing: -2px;
}

.premium-rate {
  color: rgba(255,255,255,.58);
  font-size: 12px;
}

.result-breakdown {
  margin: 25px 0;
  border-top: 1px solid rgba(255,255,255,.12);
}

.result-breakdown div {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255,255,255,.09);
}

.result-breakdown span {
  color: rgba(255,255,255,.56);
  font-size: 11px;
}

.result-breakdown strong {
  font-size: 12px;
}

/* =========================================================
   POLICIES
========================================================= */

.policy-toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 17px;
}

.search-box {
  flex: 1;
  min-height: 46px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 13px;
  border: 1px solid #dce9e1;
  border-radius: 13px;
  background: white;
  color: #8a9a91;
}

.search-box input {
  width: 100%;
  border: 0;
  outline: 0;
  font: inherit;
}

.refresh-button {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 14px;
  border-radius: 12px;
  background: white;
  border: 1px solid #dce9e1;
  color: #3d5a48;
}

.policy-list {
  display: grid;
  gap: 12px;
}

.policy-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 17px;
  padding: 20px;
  border: 1px solid #dfebe3;
  border-radius: 19px;
  background: white;
}

.policy-crop-icon {
  width: 53px;
  height: 53px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  color: #187140;
  background: #e4f7eb;
}

.policy-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.policy-title h3 {
  margin: 0;
  font-size: 17px;
}

.policy-title h3 span {
  color: #87958c;
  font-weight: 600;
}

.policy-id {
  margin: 5px 0 9px;
  color: #839188;
  font-size: 11px;
}

.policy-details {
  display: flex;
  flex-wrap: wrap;
  gap: 13px;
}

.policy-details span {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #6f8177;
  font-size: 11px;
}

.coverage-box {
  min-width: 145px;
  padding: 13px;
  text-align: right;
  border-radius: 13px;
  background: #f3faf5;
}

.coverage-box span {
  display: block;
  color: #7c8e83;
  font-size: 10px;
}

.coverage-box strong {
  display: block;
  margin-top: 3px;
  color: #166337;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 850;
}

.status-badge.active {
  color: #166534;
  background: #dcfce7;
}

.status-badge.review {
  color: #92400e;
  background: #fef3c7;
}

.status-badge.claim {
  color: #991b1b;
  background: #fee2e2;
}

/* =========================================================
   CLAIMS
========================================================= */

.claim-alert {
  display: flex;
  gap: 13px;
  padding: 18px;
  border: 1px solid #fed7aa;
  border-radius: 17px;
  background: #fff7ed;
  margin-bottom: 20px;
}

.claim-alert-icon {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  color: #c2410c;
  background: #ffedd5;
}

.claim-alert strong {
  color: #9a3412;
}

.claim-alert p {
  margin: 5px 0 0;
  color: #8b6652;
  line-height: 1.6;
  font-size: 12px;
}

.claim-grid {
  display: grid;
  grid-template-columns: 1.2fr .8fr;
  gap: 17px;
}

.claim-process-card,
.claim-help-card {
  padding: 25px;
  border: 1px solid #dfebe3;
  border-radius: 21px;
  background: white;
}

.claim-step {
  display: flex;
  gap: 14px;
  margin-top: 17px;
  align-items: center;
}

.claim-step > div {
  width: 37px;
  height: 37px;
  flex: 0 0 37px;
  display: grid;
  place-items: center;
  border-radius: 11px;
  color: #176d3e;
  background: #e3f7e9;
  font-size: 10px;
  font-weight: 950;
}

.claim-step section strong {
  display: block;
  font-size: 13px;
}

.claim-step section span {
  display: block;
  margin-top: 3px;
  color: #819087;
  font-size: 11px;
}

.claim-help-card {
  background: #f5fbf7;
}

.claim-help-card > svg {
  color: #19804a;
}

.claim-help-card h3 {
  margin: 14px 0;
}

.damage-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-bottom: 20px;
}

.damage-tags span {
  padding: 7px 9px;
  border-radius: 999px;
  color: #4e6758;
  background: white;
  border: 1px solid #dbece1;
  font-size: 10px;
  font-weight: 750;
}

.helpline-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-top: 17px;
  padding: 17px 20px;
  border-radius: 16px;
  background: #0d4f2e;
  color: white;
}

.helpline-card > div {
  display: flex;
  align-items: center;
  gap: 11px;
}

.helpline-card strong,
.helpline-card span {
  display: block;
}

.helpline-card span {
  margin-top: 2px;
  color: rgba(255,255,255,.55);
  font-size: 10px;
}

.helpline-card a {
  color: #a7f3d0;
  font-size: 22px;
  font-weight: 950;
  text-decoration: none;
}

/* =========================================================
   DOCUMENTS
========================================================= */

.document-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.document-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 13px;
  padding: 18px;
  border: 1px solid #dfebe3;
  border-radius: 17px;
  background: white;
}

.document-icon {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 13px;
  color: #187140;
  background: #e8f7ed;
}

.document-card h3 {
  margin: 0 0 4px;
  font-size: 14px;
}

.document-card p {
  margin: 0;
  color: #64766b;
  font-size: 11px;
}

.document-card small {
  display: block;
  margin-top: 4px;
  color: #9aa69f;
  font-size: 10px;
}

.document-card button {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 10px;
  color: #176c3d;
  background: #edf8f1;
  cursor: pointer;
}

.privacy-card {
  display: flex;
  gap: 12px;
  margin-top: 17px;
  padding: 19px;
  border-radius: 16px;
  color: #486252;
  background: #edf7f0;
}

.privacy-card p {
  margin: 5px 0 0;
  font-size: 12px;
  line-height: 1.6;
}

/* =========================================================
   GOVERNMENT PORTAL MODAL
========================================================= */

.portal-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 25px;
  background: rgba(3,18,11,.68);
  backdrop-filter: blur(10px);
  animation: fadeIn .2s ease;
}

.portal-center-modal {
  position: relative;
  width: min(1120px, 100%);
  max-height: 92vh;
  overflow-y: auto;
  padding: 30px;
  border-radius: 27px;
  background: #f7fbf8;
  box-shadow: 0 40px 100px rgba(0,0,0,.3);
  animation: portalUp .28s ease;
}

.portal-close {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 39px;
  height: 39px;
  display: grid;
  place-items: center;
  border: 1px solid #dce9e1;
  border-radius: 12px;
  color: #5d7065;
  background: white;
  cursor: pointer;
}

.portal-modal-header {
  display: flex;
  gap: 17px;
  padding-right: 50px;
}

.portal-modal-icon {
  width: 60px;
  height: 60px;
  flex: 0 0 60px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  color: #126238;
  background: #dcfce7;
}

.portal-modal-header h2 {
  margin: 5px 0 6px;
  font-size: 29px;
  letter-spacing: -.8px;
}

.portal-modal-header p {
  margin: 0;
  color: #718279;
  line-height: 1.6;
  font-size: 13px;
}

.portal-warning {
  margin-top: 20px;
  background: #fffbea;
}

.portal-tools {
  margin: 20px 0;
}

.portal-search {
  display: flex;
  align-items: center;
  gap: 9px;
  min-height: 48px;
  padding: 0 14px;
  border: 1px solid #dbe9df;
  border-radius: 13px;
  background: white;
  color: #7b8c81;
}

.portal-search input {
  width: 100%;
  border: 0;
  outline: 0;
  font: inherit;
}

.portal-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 11px;
}

.portal-filters button {
  padding: 8px 11px;
  border: 1px solid #dbe8df;
  border-radius: 999px;
  background: white;
  color: #61756a;
  cursor: pointer;
  font-size: 10px;
  font-weight: 800;
}

.portal-filters button.selected {
  color: white;
  background: #146337;
  border-color: #146337;
}

.portal-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 13px;
}

.portal-card {
  position: relative;
  padding: 19px;
  overflow: hidden;
  border: 1px solid #dfeae2;
  border-radius: 19px;
  background: white;
  transition: .2s ease;
}

.portal-card:hover {
  transform: translateY(-3px);
  border-color: #b5dcc4;
  box-shadow: 0 17px 35px rgba(19,77,44,.09);
}

.portal-card.recommended {
  border-color: #8fd0a8;
  box-shadow: inset 0 0 0 1px #d8f3e2;
}

.recommended-ribbon {
  position: absolute;
  top: 0;
  right: 0;
  padding: 5px 8px;
  border-radius: 0 0 0 9px;
  color: white;
  background: #14703f;
  font-size: 8px;
  font-weight: 950;
  letter-spacing: .8px;
}

.portal-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.portal-card-icon {
  width: 45px;
  height: 45px;
  display: grid;
  place-items: center;
  border-radius: 13px;
  color: #176b3d;
  background: #e5f7eb;
}

.portal-category {
  max-width: 125px;
  padding: 5px 7px;
  border-radius: 999px;
  color: #507061;
  background: #f0f6f2;
  font-size: 8px;
  line-height: 1.2;
  text-align: center;
  font-weight: 950;
}

.portal-card h3 {
  margin: 14px 0 7px;
  font-size: 15px;
  line-height: 1.35;
}

.portal-card p {
  min-height: 82px;
  margin: 0;
  color: #718179;
  font-size: 11px;
  line-height: 1.55;
}

.portal-url-label {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 13px 0;
  color: #8a998f;
  font-size: 9px;
}

.portal-open-button {
  width: 100%;
  min-height: 39px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 7px;
  border-radius: 10px;
  color: white;
  background: #146337;
  font-size: 11px;
}

.portal-open-button:hover {
  background: #0d512c;
}

.portal-empty {
  text-align: center;
  padding: 55px 20px;
  border: 1px dashed #cddfd4;
  border-radius: 18px;
  color: #718379;
}

.portal-empty h3 {
  margin: 12px 0 4px;
  color: #304a3b;
}

.portal-empty p {
  margin: 0;
  font-size: 12px;
}

.portal-footer-note {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid #dfebe3;
  color: #76867d;
  font-size: 10px;
}

/* =========================================================
   APPLICATION MODAL
========================================================= */

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 25px;
  background: rgba(3,18,11,.65);
  backdrop-filter: blur(9px);
}

.application-modal {
  position: relative;
  width: min(850px, 100%);
  max-height: 92vh;
  overflow-y: auto;
  padding: 29px;
  border-radius: 25px;
  background: #f8fcf9;
  box-shadow: 0 35px 90px rgba(0,0,0,.3);
  animation: portalUp .25s ease;
}

.close-modal {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border: 1px solid #dce8df;
  border-radius: 11px;
  background: white;
  color: #65756b;
  cursor: pointer;
}

.modal-header {
  display: flex;
  gap: 15px;
  padding-right: 45px;
  margin-bottom: 25px;
}

.modal-icon {
  width: 55px;
  height: 55px;
  flex: 0 0 55px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  color: #176e3e;
  background: #dcfce7;
}

.modal-icon.danger {
  color: #b91c1c;
  background: #fee2e2;
}

.modal-header h2 {
  margin: 5px 0 6px;
  font-size: 25px;
}

.modal-header p {
  margin: 0;
  color: #75847c;
  font-size: 12px;
  line-height: 1.6;
}

.application-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 20px;
}

.application-summary div {
  padding: 14px;
  border-radius: 13px;
  background: white;
  border: 1px solid #dfebe3;
}

.application-summary span {
  display: block;
  color: #87958d;
  font-size: 10px;
}

.application-summary strong {
  display: block;
  margin-top: 4px;
  color: #176c3d;
}

.modal-warning {
  margin-top: 16px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.range-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.range-control input {
  flex: 1;
}

.range-control strong {
  min-width: 42px;
  color: #a44324;
}

.full-field {
  grid-column: 1 / -1;
}

.full-field textarea {
  padding: 12px;
  min-height: 110px;
  resize: vertical;
}

.upload-zone {
  min-height: 145px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 20px;
  border: 1.5px dashed #b8d7c3;
  border-radius: 15px;
  background: #f4fbf6;
  text-align: center;
  cursor: pointer;
  color: #729080;
}

.upload-zone strong {
  color: #315b42;
  font-size: 12px;
}

.upload-zone span {
  font-size: 10px;
}

.upload-zone input {
  display: none;
}

.selected-files {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 9px;
}

.selected-files span {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 8px;
  border-radius: 8px;
  background: #e8f7ed;
  color: #287048;
  font-size: 10px;
}

/* =========================================================
   ANIMATION
========================================================= */

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes portalUp {
  from {
    opacity: 0;
    transform: translateY(18px) scale(.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 1050px) {
  .insurance-hero {
    grid-template-columns: 1fr;
  }

  .hero-insurance-card {
    max-width: 520px;
  }

  .workflow {
    grid-template-columns: repeat(4, 1fr);
  }

  .feature-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .portal-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 760px) {
  .insurance-hero {
    min-height: auto;
    padding: 48px 20px 80px;
    gap: 35px;
  }

  .hero-content h1 {
    font-size: 43px;
    letter-spacing: -2px;
  }

  .hero-trust {
    display: grid;
    gap: 9px;
  }

  .portal-quick-bar {
    margin-top: -28px;
    flex-direction: column;
    align-items: stretch;
  }

  .portal-center-button {
    width: 100%;
    justify-content: center;
  }

  .insurance-container {
    width: min(100% - 24px, 1180px);
    margin-top: 25px;
  }

  .insurance-tabs {
    width: calc(100% - 24px);
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .problem-grid,
  .calculator-layout,
  .claim-grid,
  .document-grid {
    grid-template-columns: 1fr;
  }

  .portal-feature-card {
    grid-template-columns: 1fr;
  }

  .portal-feature-button {
    width: 100%;
    justify-content: center;
  }

  .workflow {
    grid-template-columns: repeat(2, 1fr);
  }

  .feature-grid {
    grid-template-columns: 1fr;
  }

  .portal-center-modal,
  .application-modal {
    padding: 21px;
  }

  .portal-grid {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .application-summary {
    grid-template-columns: 1fr;
  }

  .policy-card {
    grid-template-columns: auto 1fr;
  }

  .coverage-box {
    grid-column: 2;
    text-align: left;
  }

  .modal-actions {
    flex-direction: column;
  }

  .modal-actions button {
    width: 100%;
  }
}

@media (max-width: 500px) {
  .hero-content h1 {
    font-size: 37px;
  }

  .hero-actions {
    flex-direction: column;
  }

  .hero-actions button {
    width: 100%;
  }

  .workflow {
    grid-template-columns: 1fr;
  }

  .portal-modal-header {
    display: block;
  }

  .portal-modal-icon {
    margin-bottom: 13px;
  }

  .portal-modal-header h2 {
    font-size: 23px;
  }

  .policy-title {
    align-items: flex-start;
    flex-direction: column;
  }

  .policy-card {
    grid-template-columns: 1fr;
  }

  .coverage-box {
    grid-column: auto;
  }

  .helpline-card {
    align-items: flex-start;
    flex-direction: column;
  }
}
`;