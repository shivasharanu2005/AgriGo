import React, { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Archive,
  BadgeCheck,
  Banknote,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CloudUpload,
  CreditCard,
  Download,
  Eye,
  FileCheck2,
  FileSignature,
  FileText,
  Filter,
  Fingerprint,
  FolderOpen,
  HardDrive,
  IdCard,
  Info,
  Landmark,
  LayoutGrid,
  List,
  Lock,
  MapPinned,
  MoreVertical,
  Paperclip,
  Pin,
  Printer,
  ReceiptText,
  RefreshCw,
  Search,
  ShieldCheck,
  Sprout,
  Star,
  Tractor,
  Trash2,
  Upload,
  UploadCloud,
  Wheat,
  X,
  Droplets,
  House,
  ClipboardCheck,
  WalletCards,
} from "lucide-react";

import { AgriculturePageHeader } from "@/components/agriculture/AgriculturePageHeader";
import { StatCard } from "@/components/agriculture/StatCard";
import { AlertCard } from "@/components/agriculture/AlertCard";
import { agricultureApi } from "@/services/agricultureApi";

/* =========================================================
   TYPES
========================================================= */

type DocumentCategory =
  | "all"
  | "identity"
  | "banking"
  | "land"
  | "farmer"
  | "agriculture"
  | "insurance"
  | "loan"
  | "scheme"
  | "equipment"
  | "other";

type DocumentStatus =
  | "pending"
  | "verified"
  | "rejected"
  | "expired";

type FarmDocument = {
  id: string | number;
  name: string;
  type?: string;
  documentType?: string;
  category?: DocumentCategory;
  sizeKb?: number;
  size?: number;
  addedOn?: string;
  createdAt?: string;
  expiresOn?: string | null;
  expiryDate?: string | null;
  url?: string;
  fileUrl?: string;
  mimeType?: string;
  status?: DocumentStatus;
  purpose?: string;
  notes?: string;
  pinned?: boolean;
  important?: boolean;
  originalName?: string;
};

type UploadForm = {
  documentType: string;
  category: Exclude<DocumentCategory, "all">;
  purpose: string;
  expiryDate: string;
  notes: string;
};

/* =========================================================
   API CONFIGURATION
========================================================= */

const API_BASE = (
  import.meta.env.VITE_API_URL || "/api"
).replace(/\/$/, "");

const DOCUMENTS_ENDPOINT =
  import.meta.env.VITE_FARM_DOCUMENTS_API ||
  `${API_BASE}/agriculture/documents/`;

/* =========================================================
   DOCUMENT MASTER DATA
========================================================= */

const DOCUMENT_TYPES = [
  {
    value: "aadhaar",
    label: "Aadhaar Card",
    category: "identity",
    icon: Fingerprint,
    description: "Identity verification",
  },
  {
    value: "pan",
    label: "PAN Card",
    category: "identity",
    icon: CreditCard,
    description: "Tax / financial identity",
  },
  {
    value: "voter_id",
    label: "Voter ID",
    category: "identity",
    icon: IdCard,
    description: "Identity / address proof",
  },
  {
    value: "driving_license",
    label: "Driving Licence",
    category: "identity",
    icon: IdCard,
    description: "Identity / vehicle related",
  },

  {
    value: "bank_passbook",
    label: "Bank Passbook",
    category: "banking",
    icon: Landmark,
    description: "Bank account proof",
  },
  {
    value: "cancelled_cheque",
    label: "Cancelled Cheque",
    category: "banking",
    icon: WalletCards,
    description: "Bank verification",
  },
  {
    value: "bank_statement",
    label: "Bank Statement",
    category: "banking",
    icon: Banknote,
    description: "Account transaction proof",
  },

  {
    value: "rtc_pahani",
    label: "RTC / Pahani",
    category: "land",
    icon: MapPinned,
    description: "Land record",
  },
  {
    value: "land_ownership",
    label: "Land Ownership Proof",
    category: "land",
    icon: House,
    description: "Ownership verification",
  },
  {
    value: "land_acquisition",
    label: "Land Acquisition Proof",
    category: "land",
    icon: FileSignature,
    description: "Acquisition / allotment record",
  },
  {
    value: "sale_deed",
    label: "Sale Deed",
    category: "land",
    icon: FileSignature,
    description: "Property transaction document",
  },
  {
    value: "mutation_record",
    label: "Mutation Record",
    category: "land",
    icon: FileCheck2,
    description: "Land ownership update",
  },
  {
    value: "survey_sketch",
    label: "Survey Sketch",
    category: "land",
    icon: MapPinned,
    description: "Survey / boundary record",
  },
  {
    value: "land_tax_receipt",
    label: "Land Tax Receipt",
    category: "land",
    icon: ReceiptText,
    description: "Land tax payment",
  },
  {
    value: "lease_agreement",
    label: "Land Lease Agreement",
    category: "land",
    icon: FileSignature,
    description: "Cultivation / lease proof",
  },

  {
    value: "farmer_id",
    label: "Farmer ID / FID",
    category: "farmer",
    icon: BadgeCheck,
    description: "Farmer registration",
  },
  {
    value: "ration_card",
    label: "Ration Card",
    category: "farmer",
    icon: House,
    description: "Family / address proof",
  },
  {
    value: "domicile",
    label: "Domicile / Residence Certificate",
    category: "farmer",
    icon: House,
    description: "Residence proof",
  },
  {
    value: "income_certificate",
    label: "Income Certificate",
    category: "farmer",
    icon: Banknote,
    description: "Income verification",
  },
  {
    value: "caste_certificate",
    label: "Caste Certificate",
    category: "farmer",
    icon: FileCheck2,
    description: "Applicable certificate",
  },

  {
    value: "soil_health_card",
    label: "Soil Health Card",
    category: "agriculture",
    icon: Sprout,
    description: "Soil testing record",
  },
  {
    value: "crop_record",
    label: "Crop Record",
    category: "agriculture",
    icon: Wheat,
    description: "Crop cultivation record",
  },
  {
    value: "crop_survey",
    label: "Crop Survey Record",
    category: "agriculture",
    icon: ClipboardCheck,
    description: "Crop survey information",
  },
  {
    value: "seed_bill",
    label: "Seed Purchase Bill",
    category: "agriculture",
    icon: ReceiptText,
    description: "Seed purchase proof",
  },
  {
    value: "fertilizer_bill",
    label: "Fertilizer Bill",
    category: "agriculture",
    icon: ReceiptText,
    description: "Fertilizer purchase proof",
  },
  {
    value: "pesticide_bill",
    label: "Pesticide Bill",
    category: "agriculture",
    icon: ReceiptText,
    description: "Crop protection purchase",
  },
  {
    value: "irrigation_document",
    label: "Irrigation / Water Document",
    category: "agriculture",
    icon: Droplets,
    description: "Water / irrigation record",
  },

  {
    value: "crop_insurance",
    label: "Crop Insurance Policy",
    category: "insurance",
    icon: ShieldCheck,
    description: "Crop insurance",
  },
  {
    value: "insurance_receipt",
    label: "Insurance Premium Receipt",
    category: "insurance",
    icon: ReceiptText,
    description: "Premium payment",
  },
  {
    value: "insurance_claim",
    label: "Insurance Claim Document",
    category: "insurance",
    icon: FileCheck2,
    description: "Claim-related record",
  },

  {
    value: "kcc",
    label: "KCC Document",
    category: "loan",
    icon: CreditCard,
    description: "Kisan Credit Card",
  },
  {
    value: "agriculture_loan",
    label: "Agriculture Loan Document",
    category: "loan",
    icon: Banknote,
    description: "Agricultural finance",
  },
  {
    value: "loan_sanction",
    label: "Loan Sanction Letter",
    category: "loan",
    icon: FileCheck2,
    description: "Loan approval record",
  },

  {
    value: "scheme_application",
    label: "Scheme Application Receipt",
    category: "scheme",
    icon: ClipboardCheck,
    description: "Government scheme application",
  },
  {
    value: "scheme_approval",
    label: "Scheme Approval Letter",
    category: "scheme",
    icon: BadgeCheck,
    description: "Scheme approval record",
  },
  {
    value: "subsidy_sanction",
    label: "Subsidy Sanction Letter",
    category: "scheme",
    icon: FileCheck2,
    description: "Subsidy approval",
  },
  {
    value: "subsidy_release",
    label: "Subsidy Release Proof",
    category: "scheme",
    icon: Banknote,
    description: "Subsidy payment record",
  },

  {
    value: "tractor_invoice",
    label: "Tractor Invoice",
    category: "equipment",
    icon: Tractor,
    description: "Equipment purchase",
  },
  {
    value: "equipment_invoice",
    label: "Farm Equipment Invoice",
    category: "equipment",
    icon: Tractor,
    description: "Farm machinery purchase",
  },
  {
    value: "vehicle_registration",
    label: "Vehicle / Equipment Registration",
    category: "equipment",
    icon: FileCheck2,
    description: "Registration record",
  },

  {
    value: "other",
    label: "Other Agriculture Document",
    category: "other",
    icon: FileText,
    description: "Any other farm record",
  },
] as const;

const CATEGORY_META: Record<
  Exclude<DocumentCategory, "all">,
  {
    label: string;
    description: string;
    icon: React.ElementType;
  }
> = {
  identity: {
    label: "Identity",
    description: "Aadhaar, PAN, Voter ID and identity proofs",
    icon: Fingerprint,
  },
  banking: {
    label: "Banking",
    description: "Passbook, cheque and account documents",
    icon: Landmark,
  },
  land: {
    label: "Land & Ownership",
    description: "RTC, Pahani, mutation and land records",
    icon: MapPinned,
  },
  farmer: {
    label: "Farmer & Family",
    description: "Farmer ID, ration and certificates",
    icon: BadgeCheck,
  },
  agriculture: {
    label: "Farm Records",
    description: "Soil, crops, seeds and farm purchases",
    icon: Sprout,
  },
  insurance: {
    label: "Insurance",
    description: "Crop insurance and claim documents",
    icon: ShieldCheck,
  },
  loan: {
    label: "Loans & KCC",
    description: "KCC and agricultural finance documents",
    icon: CreditCard,
  },
  scheme: {
    label: "Government Schemes",
    description: "Applications, approvals and subsidies",
    icon: Landmark,
  },
  equipment: {
    label: "Equipment",
    description: "Tractor and machinery documents",
    icon: Tractor,
  },
  other: {
    label: "Other",
    description: "Additional agricultural records",
    icon: FolderOpen,
  },
};

const PURPOSE_OPTIONS = [
  "Government scheme application",
  "Agricultural subsidy",
  "Crop insurance",
  "KCC / agricultural loan",
  "Land verification",
  "Farmer registration",
  "Bank verification",
  "Equipment subsidy",
  "Crop / farm record",
  "Personal record",
  "Other",
];

const COMMON_CHECKLIST = [
  {
    label: "Identity proof",
    type: "aadhaar",
    description: "Example: Aadhaar / another accepted identity proof",
  },
  {
    label: "Bank account proof",
    type: "bank_passbook",
    description: "Example: passbook or account proof",
  },
  {
    label: "Land record",
    type: "rtc_pahani",
    description: "Example: RTC / Pahani / accepted land record",
  },
  {
    label: "Farmer registration",
    type: "farmer_id",
    description: "Farmer ID where applicable",
  },
  {
    label: "Residence / family proof",
    type: "ration_card",
    description: "Example: ration card or accepted residence proof",
  },
  {
    label: "Farm record",
    type: "soil_health_card",
    description: "Example: soil health or crop record",
  },
];

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

/* =========================================================
   HELPERS
========================================================= */

function normalizeCategory(value?: string): DocumentCategory {
  if (!value) return "other";

  const v = value.toLowerCase();

  if (
    v.includes("aadhaar") ||
    v.includes("pan") ||
    v.includes("voter") ||
    v.includes("identity")
  ) {
    return "identity";
  }

  if (
    v.includes("bank") ||
    v.includes("passbook") ||
    v.includes("cheque")
  ) {
    return "banking";
  }

  if (
    v.includes("land") ||
    v.includes("rtc") ||
    v.includes("pahani") ||
    v.includes("mutation") ||
    v.includes("sale deed") ||
    v.includes("survey")
  ) {
    return "land";
  }

  if (
    v.includes("farmer") ||
    v.includes("ration") ||
    v.includes("domicile") ||
    v.includes("residence") ||
    v.includes("income") ||
    v.includes("caste")
  ) {
    return "farmer";
  }

  if (
    v.includes("soil") ||
    v.includes("crop") ||
    v.includes("seed") ||
    v.includes("fertilizer") ||
    v.includes("pesticide") ||
    v.includes("irrigation")
  ) {
    return "agriculture";
  }

  if (v.includes("insurance")) return "insurance";

  if (
    v.includes("loan") ||
    v.includes("kcc") ||
    v.includes("credit")
  ) {
    return "loan";
  }

  if (
    v.includes("scheme") ||
    v.includes("subsidy") ||
    v.includes("government")
  ) {
    return "scheme";
  }

  if (
    v.includes("tractor") ||
    v.includes("equipment") ||
    v.includes("machinery")
  ) {
    return "equipment";
  }

  return "other";
}

function normalizeDocument(raw: any): FarmDocument {
  const documentType =
    raw.documentType ||
    raw.document_type ||
    raw.type ||
    "other";

  const category = normalizeCategory(
    raw.category || documentType
  );

  return {
    ...raw,
    id: raw.id,
    name:
      raw.name ||
      raw.originalName ||
      raw.original_name ||
      documentType,
    type: raw.type || documentType,
    documentType,
    category,
    sizeKb:
      Number(
        raw.sizeKb ??
          raw.size_kb ??
          (raw.size ? raw.size / 1024 : 0)
      ) || 0,
    addedOn:
      raw.addedOn ||
      raw.added_on ||
      raw.createdAt ||
      raw.created_at ||
      new Date().toISOString(),
    expiresOn:
      raw.expiresOn ??
      raw.expiryDate ??
      raw.expiry_date ??
      null,
    url: raw.url || raw.fileUrl || raw.file_url,
    mimeType: raw.mimeType || raw.mime_type,
    status: raw.status || "pending",
    purpose: raw.purpose || "",
    notes: raw.notes || "",
    pinned: Boolean(raw.pinned ?? raw.is_pinned),
    important: Boolean(raw.important ?? raw.is_important),
  };
}

function extractDocuments(data: any): FarmDocument[] {
  const source = Array.isArray(data)
    ? data
    : Array.isArray(data?.results)
    ? data.results
    : Array.isArray(data?.documents)
    ? data.documents
    : [];

  return source.map(normalizeDocument);
}

function formatFileSize(kb: number) {
  if (!kb) return "0 KB";

  if (kb < 1024) {
    return `${Math.round(kb)} KB`;
  }

  return `${(kb / 1024).toFixed(1)} MB`;
}

function getDaysUntil(date?: string | null) {
  if (!date) return null;

  const target = new Date(date);
  if (Number.isNaN(target.getTime())) return null;

  const today = new Date();

  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  return Math.ceil(
    (target.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24)
  );
}

function getDocumentStatus(document: FarmDocument) {
  if (document.status === "rejected") {
    return {
      label: "Rejected",
      className: "rejected",
      icon: AlertTriangle,
    };
  }

  if (document.status === "verified") {
    return {
      label: "Verified",
      className: "verified",
      icon: CheckCircle2,
    };
  }

  const days = getDaysUntil(document.expiresOn);

  if (days !== null && days < 0) {
    return {
      label: "Expired",
      className: "expired",
      icon: AlertTriangle,
    };
  }

  if (days !== null && days <= 30) {
    return {
      label: "Renew soon",
      className: "warning",
      icon: Clock3,
    };
  }

  return {
    label: "Pending review",
    className: "pending",
    icon: Clock3,
  };
}

function getDocumentMeta(document: FarmDocument) {
  const type = String(
    document.documentType || document.type || ""
  ).toLowerCase();

  return (
    DOCUMENT_TYPES.find(
      (item) =>
        item.value === type ||
        item.label.toLowerCase() === type
    ) || {
      value: "other",
      label: document.name,
      category: document.category || "other",
      icon: FileText,
      description: "Agriculture document",
    }
  );
}

function escapeCsv(value: unknown) {
  return `"${String(value ?? "")
    .replace(/"/g, '""')
    .replace(/\n/g, " ")}"`;
}

function getCsrfToken() {
  const match = document.cookie.match(
    /(?:^|;\s*)csrftoken=([^;]+)/
  );

  return match ? decodeURIComponent(match[1]) : "";
}

function getAuthHeaders() {
  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token");

  return {
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
    ...(getCsrfToken()
      ? {
          "X-CSRFToken": getCsrfToken(),
        }
      : {}),
  };
}

/* =========================================================
   API
========================================================= */

async function apiRequest(
  url: string,
  options: RequestInit = {}
) {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    try {
      const error = await response.json();
      message =
        error?.detail ||
        error?.message ||
        error?.error ||
        message;
    } catch {
      // Ignore JSON parsing errors.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

const documentApi = {
  async upload(form: UploadForm, file: File) {
    const data = new FormData();

    data.append("file", file);
    data.append("name", file.name);
    data.append("document_type", form.documentType);
    data.append("category", form.category);
    data.append("purpose", form.purpose);

    if (form.expiryDate) {
      data.append("expiry_date", form.expiryDate);
    }

    if (form.notes) {
      data.append("notes", form.notes);
    }

    return apiRequest(DOCUMENTS_ENDPOINT, {
      method: "POST",
      body: data,
    });
  },

  async delete(id: string | number) {
    return apiRequest(
      `${DOCUMENTS_ENDPOINT}${id}/`,
      {
        method: "DELETE",
      }
    );
  },

  async update(
    id: string | number,
    payload: Partial<FarmDocument>
  ) {
    return apiRequest(
      `${DOCUMENTS_ENDPOINT}${id}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
  },
};

/* =========================================================
   COMPONENT
========================================================= */

export default function FarmDocuments() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] =
    useState<DocumentCategory>("all");

  const [sort, setSort] = useState<
    "recent" | "oldest" | "name" | "size" | "expiry"
  >("recent");

  const [viewMode, setViewMode] =
    useState<"grid" | "list">("grid");

  const [selectedDocument, setSelectedDocument] =
    useState<FarmDocument | null>(null);

  const [showUpload, setShowUpload] = useState(false);

  const [showFilters, setShowFilters] = useState(false);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [uploadError, setUploadError] =
    useState("");

  const [dragActive, setDragActive] =
    useState(false);

  const [uploadForm, setUploadForm] =
    useState<UploadForm>({
      documentType: "",
      category: "identity",
      purpose: "",
      expiryDate: "",
      notes: "",
    });

  const {
    data,
    isLoading,
    isFetching,
    refetch,
    error,
  } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      try {
        const result =
          await agricultureApi.getDocuments();

        return extractDocuments(result);
      } catch {
        const result = await apiRequest(
          DOCUMENTS_ENDPOINT
        );

        return extractDocuments(result);
      }
    },
  });

  const documents = data || [];

  /* =========================================================
     MUTATIONS
  ========================================================= */

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) {
        throw new Error("Please select a document.");
      }

      return documentApi.upload(
        uploadForm,
        selectedFile
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["documents"],
      });

      resetUpload();
    },

    onError: (err: any) => {
      setUploadError(
        err?.message ||
          "Unable to upload the document."
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) =>
      documentApi.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["documents"],
      });

      setSelectedDocument(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | number;
      payload: Partial<FarmDocument>;
    }) => documentApi.update(id, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["documents"],
      });
    },
  });

  /* =========================================================
     DERIVED DATA
  ========================================================= */

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = documents.filter((document) => {
      const matchesCategory =
        category === "all" ||
        document.category === category;

      if (!matchesCategory) return false;

      if (!query) return true;

      const searchable = [
        document.name,
        document.type,
        document.documentType,
        document.purpose,
        document.notes,
        document.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });

    return [...result].sort((a, b) => {
      if (sort === "name") {
        return a.name.localeCompare(b.name);
      }

      if (sort === "size") {
        return (b.sizeKb || 0) - (a.sizeKb || 0);
      }

      if (sort === "oldest") {
        return (
          new Date(a.addedOn || 0).getTime() -
          new Date(b.addedOn || 0).getTime()
        );
      }

      if (sort === "expiry") {
        return (
          new Date(a.expiresOn || "9999-12-31").getTime() -
          new Date(b.expiresOn || "9999-12-31").getTime()
        );
      }

      return (
        new Date(b.addedOn || 0).getTime() -
        new Date(a.addedOn || 0).getTime()
      );
    });
  }, [documents, search, category, sort]);

  const totalStorageKb = documents.reduce(
    (sum, document) =>
      sum + Number(document.sizeKb || 0),
    0
  );

  const storageLimitKb = 1024 * 1024;

  const storagePercentage = Math.min(
    100,
    (totalStorageKb / storageLimitKb) * 100
  );

  const expiringDocuments = documents.filter((doc) => {
    const days = getDaysUntil(doc.expiresOn);
    return days !== null && days >= 0 && days <= 30;
  });

  const expiredDocuments = documents.filter((doc) => {
    const days = getDaysUntil(doc.expiresOn);
    return days !== null && days < 0;
  });

  const verifiedDocuments = documents.filter(
    (doc) => doc.status === "verified"
  );

  const categoryCounts = useMemo(() => {
    return Object.keys(CATEGORY_META).reduce(
      (acc, key) => {
        acc[key as Exclude<DocumentCategory, "all">] =
          documents.filter(
            (doc) => doc.category === key
          ).length;

        return acc;
      },
      {} as Record<
        Exclude<DocumentCategory, "all">,
        number
      >
    );
  }, [documents]);

  const checklistProgress = COMMON_CHECKLIST.filter(
    (item) =>
      documents.some(
        (doc) =>
          String(doc.documentType).toLowerCase() ===
          item.type.toLowerCase()
      )
  ).length;

  const readinessPercentage = Math.round(
    (checklistProgress /
      COMMON_CHECKLIST.length) *
      100
  );

  /* =========================================================
     UPLOAD HANDLERS
  ========================================================= */

  function resetUpload() {
    setShowUpload(false);
    setSelectedFile(null);
    setUploadError("");

    setUploadForm({
      documentType: "",
      category: "identity",
      purpose: "",
      expiryDate: "",
      notes: "",
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function validateFile(file: File) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Only PDF, JPG, PNG and WEBP files are supported.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return "Maximum file size is 10 MB.";
    }

    return "";
  }

  function handleFile(file: File | undefined) {
    if (!file) return;

    const validation = validateFile(file);

    if (validation) {
      setUploadError(validation);
      setSelectedFile(null);
      return;
    }

    setUploadError("");
    setSelectedFile(file);
  }

  function handleDrop(
    event: React.DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    setDragActive(false);

    const file = event.dataTransfer.files?.[0];

    handleFile(file);
  }

  function handleDocumentTypeChange(
    value: string
  ) {
    const selected = DOCUMENT_TYPES.find(
      (item) => item.value === value
    );

    setUploadForm((current) => ({
      ...current,
      documentType: value,
      category:
        (selected?.category as Exclude<
          DocumentCategory,
          "all"
        >) || current.category,
    }));
  }

  /* =========================================================
     ACTIONS
  ========================================================= */

  function downloadDocument(document: FarmDocument) {
    if (!document.url) {
      setSelectedDocument(document);
      return;
    }

    window.open(
      document.url,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function togglePin(document: FarmDocument) {
    updateMutation.mutate({
      id: document.id,
      payload: {
        pinned: !document.pinned,
      },
    });
  }

  function toggleImportant(
    document: FarmDocument
  ) {
    updateMutation.mutate({
      id: document.id,
      payload: {
        important: !document.important,
      },
    });
  }

  function handleDelete(document: FarmDocument) {
    const confirmed = window.confirm(
      `Delete "${document.name}" permanently?`
    );

    if (!confirmed) return;

    deleteMutation.mutate(document.id);
  }

  function exportCsv() {
    const headers = [
      "Document",
      "Type",
      "Category",
      "Purpose",
      "Added On",
      "Expiry",
      "Status",
      "Size",
    ];

    const rows = documents.map((doc) => [
      doc.name,
      doc.documentType || doc.type || "",
      doc.category || "",
      doc.purpose || "",
      doc.addedOn || "",
      doc.expiresOn || "",
      getDocumentStatus(doc).label,
      formatFileSize(doc.sizeKb || 0),
    ]);

    const csv = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) =>
        row.map(escapeCsv).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `agrigo-farm-documents-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    link.click();

    URL.revokeObjectURL(url);
  }

  function printReport() {
    window.print();
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="fd-page">
      <style>{`
        .fd-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at 0% 0%, rgba(34,197,94,.10), transparent 28%),
            radial-gradient(circle at 100% 10%, rgba(16,185,129,.08), transparent 24%),
            #f7faf8;
          color: #17231b;
          padding-bottom: 50px;
        }

        .fd-shell {
          max-width: 1500px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .fd-hero {
          position: relative;
          overflow: hidden;
          margin-top: 22px;
          padding: 34px;
          border-radius: 28px;
          background:
            linear-gradient(135deg, #0f5132 0%, #147a49 52%, #1d9b5d 100%);
          color: white;
          box-shadow: 0 24px 60px rgba(15,81,50,.20);
        }

        .fd-hero:before,
        .fd-hero:after {
          content: "";
          position: absolute;
          border-radius: 999px;
          background: rgba(255,255,255,.08);
          pointer-events: none;
        }

        .fd-hero:before {
          width: 280px;
          height: 280px;
          right: -90px;
          top: -140px;
        }

        .fd-hero:after {
          width: 190px;
          height: 190px;
          right: 190px;
          bottom: -130px;
        }

        .fd-hero-content {
          position: relative;
          z-index: 1;
          display: flex;
          justify-content: space-between;
          gap: 30px;
          align-items: center;
        }

        .fd-hero-copy {
          max-width: 760px;
        }

        .fd-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 12px;
          border: 1px solid rgba(255,255,255,.22);
          background: rgba(255,255,255,.10);
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .04em;
          text-transform: uppercase;
        }

        .fd-hero h1 {
          margin: 16px 0 10px;
          font-size: clamp(30px, 4vw, 48px);
          line-height: 1.05;
          letter-spacing: -.04em;
        }

        .fd-hero p {
          margin: 0;
          max-width: 700px;
          color: rgba(255,255,255,.84);
          font-size: 16px;
          line-height: 1.7;
        }

        .fd-hero-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .fd-btn {
          min-height: 44px;
          border: 0;
          border-radius: 13px;
          padding: 0 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          font-weight: 800;
          transition: .2s ease;
        }

        .fd-btn:hover {
          transform: translateY(-1px);
        }

        .fd-btn-primary {
          background: white;
          color: #12633b;
          box-shadow: 0 10px 25px rgba(0,0,0,.14);
        }

        .fd-btn-soft {
          color: white;
          background: rgba(255,255,255,.12);
          border: 1px solid rgba(255,255,255,.20);
        }

        .fd-storage {
          margin-top: 18px;
          padding: 18px 20px;
          border-radius: 18px;
          background: rgba(255,255,255,.09);
          border: 1px solid rgba(255,255,255,.12);
        }

        .fd-storage-top {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 10px;
          font-size: 13px;
          font-weight: 700;
        }

        .fd-storage-track {
          height: 7px;
          overflow: hidden;
          background: rgba(255,255,255,.18);
          border-radius: 999px;
        }

        .fd-storage-fill {
          height: 100%;
          border-radius: inherit;
          background: white;
          transition: width .4s ease;
        }

        .fd-kpis {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin: 20px 0;
        }

        .fd-kpi {
          border: 1px solid #e5ece7;
          border-radius: 20px;
          background: white;
          box-shadow: 0 10px 35px rgba(24,48,34,.06);
        }

        .fd-kpi > div {
          height: 100%;
        }

        .fd-alerts {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }

        .fd-workspace {
          border: 1px solid #e2eae4;
          border-radius: 24px;
          background: rgba(255,255,255,.88);
          box-shadow: 0 16px 45px rgba(24,48,34,.06);
          overflow: hidden;
        }

        .fd-toolbar {
          padding: 18px;
          border-bottom: 1px solid #e8eee9;
        }

        .fd-toolbar-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .fd-search {
          flex: 1;
          min-width: 260px;
          position: relative;
        }

        .fd-search svg {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: #819087;
        }

        .fd-input,
        .fd-select,
        .fd-textarea {
          width: 100%;
          border: 1px solid #dbe5de;
          border-radius: 12px;
          background: white;
          color: #17231b;
          outline: none;
          transition: .2s ease;
          box-sizing: border-box;
        }

        .fd-input,
        .fd-select {
          height: 44px;
          padding: 0 13px;
        }

        .fd-search .fd-input {
          padding-left: 42px;
        }

        .fd-textarea {
          min-height: 90px;
          padding: 12px;
          resize: vertical;
        }

        .fd-input:focus,
        .fd-select:focus,
        .fd-textarea:focus {
          border-color: #35a866;
          box-shadow: 0 0 0 3px rgba(53,168,102,.10);
        }

        .fd-tool-btn {
          height: 44px;
          border: 1px solid #dbe5de;
          background: white;
          color: #3b4a41;
          border-radius: 12px;
          padding: 0 13px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          cursor: pointer;
          font-weight: 700;
        }

        .fd-tool-btn.active {
          background: #eaf7ef;
          border-color: #b8dec5;
          color: #12633b;
        }

        .fd-filters {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-top: 14px;
        }

        .fd-chip {
          white-space: nowrap;
          border: 1px solid #dce6df;
          background: white;
          color: #59675f;
          padding: 9px 13px;
          border-radius: 999px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 800;
        }

        .fd-chip.active {
          color: white;
          background: #16834d;
          border-color: #16834d;
        }

        .fd-content {
          padding: 20px;
        }

        .fd-section-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          margin-bottom: 17px;
        }

        .fd-section-heading h2 {
          margin: 0;
          font-size: 20px;
          letter-spacing: -.02em;
        }

        .fd-section-heading p {
          margin: 5px 0 0;
          color: #708077;
          font-size: 13px;
        }

        .fd-doc-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }

        .fd-doc {
          position: relative;
          border: 1px solid #e1e9e4;
          border-radius: 20px;
          background: white;
          padding: 17px;
          transition: .2s ease;
          overflow: hidden;
        }

        .fd-doc:hover {
          transform: translateY(-2px);
          border-color: #bdd9c7;
          box-shadow: 0 15px 35px rgba(25,75,46,.09);
        }

        .fd-doc-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .fd-doc-icon {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 15px;
          background: #eaf7ef;
          color: #147744;
        }

        .fd-doc-actions {
          display: flex;
          gap: 3px;
        }

        .fd-icon-btn {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 9px;
          background: transparent;
          color: #718078;
          cursor: pointer;
        }

        .fd-icon-btn:hover {
          background: #f1f5f2;
          color: #12633b;
        }

        .fd-icon-btn.active {
          background: #fff6db;
          color: #a16b00;
        }

        .fd-doc h3 {
          margin: 15px 0 5px;
          font-size: 16px;
          line-height: 1.35;
        }

        .fd-doc-type {
          color: #748078;
          font-size: 12px;
        }

        .fd-doc-meta {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-top: 16px;
          color: #66746c;
          font-size: 12px;
        }

        .fd-status {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin-top: 14px;
          padding: 6px 9px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 900;
        }

        .fd-status.verified {
          background: #e8f8ed;
          color: #14733f;
        }

        .fd-status.pending {
          background: #fff7df;
          color: #976600;
        }

        .fd-status.warning {
          background: #fff0d8;
          color: #a05200;
        }

        .fd-status.expired,
        .fd-status.rejected {
          background: #feeaea;
          color: #a63232;
        }

        .fd-purpose {
          margin-top: 12px;
          padding: 10px;
          background: #f7faf8;
          border-radius: 10px;
          color: #536159;
          font-size: 12px;
          line-height: 1.45;
        }

        .fd-list {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .fd-list-row {
          display: grid;
          grid-template-columns: 46px 1fr auto auto auto;
          align-items: center;
          gap: 13px;
          padding: 13px;
          border: 1px solid #e4ebe6;
          border-radius: 14px;
          background: white;
        }

        .fd-list-name {
          font-weight: 800;
          font-size: 14px;
        }

        .fd-list-sub {
          margin-top: 3px;
          color: #7a867f;
          font-size: 11px;
        }

        .fd-list-purpose {
          color: #69766f;
          font-size: 12px;
          max-width: 230px;
        }

        .fd-empty {
          padding: 65px 20px;
          text-align: center;
          border: 1px dashed #cbd9cf;
          border-radius: 20px;
          background: #fbfdfb;
        }

        .fd-empty-icon {
          width: 65px;
          height: 65px;
          margin: 0 auto 14px;
          display: grid;
          place-items: center;
          border-radius: 20px;
          background: #eaf7ef;
          color: #147744;
        }

        .fd-empty h3 {
          margin: 0 0 6px;
        }

        .fd-empty p {
          max-width: 500px;
          margin: 0 auto 18px;
          color: #738078;
          line-height: 1.6;
          font-size: 13px;
        }

        .fd-bottom-grid {
          display: grid;
          grid-template-columns: 1.3fr .7fr;
          gap: 20px;
          margin-top: 20px;
        }

        .fd-panel {
          border: 1px solid #e2eae4;
          border-radius: 22px;
          background: white;
          padding: 20px;
          box-shadow: 0 12px 35px rgba(24,48,34,.05);
        }

        .fd-panel h3 {
          margin: 0;
          font-size: 17px;
        }

        .fd-panel-sub {
          margin: 5px 0 18px;
          color: #758178;
          font-size: 12px;
          line-height: 1.5;
        }

        .fd-category-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 9px;
        }

        .fd-category {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px;
          border-radius: 13px;
          background: #f7faf8;
          border: 1px solid #edf2ee;
          cursor: pointer;
          text-align: left;
        }

        .fd-category:hover {
          border-color: #c8dfd0;
          background: #f1f9f4;
        }

        .fd-category-icon {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: #e4f4e9;
          color: #177646;
          flex-shrink: 0;
        }

        .fd-category strong {
          display: block;
          font-size: 12px;
        }

        .fd-category span {
          color: #7b867f;
          font-size: 10px;
        }

        .fd-progress {
          margin: 16px 0;
          height: 9px;
          border-radius: 999px;
          background: #eaf0eb;
          overflow: hidden;
        }

        .fd-progress-fill {
          height: 100%;
          background: #17904f;
          border-radius: inherit;
        }

        .fd-checklist {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .fd-check {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px;
          border-radius: 12px;
          background: #f8faf8;
        }

        .fd-check-icon {
          color: #1a9552;
          margin-top: 1px;
        }

        .fd-check.missing .fd-check-icon {
          color: #9aa69e;
        }

        .fd-check strong {
          font-size: 12px;
        }

        .fd-check p {
          margin: 3px 0 0;
          color: #7c8881;
          font-size: 10px;
          line-height: 1.4;
        }

        .fd-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(8,25,16,.60);
          backdrop-filter: blur(6px);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .fd-modal {
          width: min(700px, 100%);
          max-height: 92vh;
          overflow-y: auto;
          background: white;
          border-radius: 24px;
          box-shadow: 0 30px 90px rgba(0,0,0,.25);
        }

        .fd-modal-large {
          width: min(850px, 100%);
        }

        .fd-modal-head {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          align-items: center;
          padding: 20px 22px;
          border-bottom: 1px solid #e8eee9;
        }

        .fd-modal-head h2 {
          margin: 0;
          font-size: 20px;
        }

        .fd-modal-head p {
          margin: 4px 0 0;
          color: #758178;
          font-size: 12px;
        }

        .fd-close {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 11px;
          background: #f2f5f3;
          color: #617068;
          cursor: pointer;
        }

        .fd-modal-body {
          padding: 22px;
        }

        .fd-dropzone {
          min-height: 190px;
          border: 2px dashed #bcd6c4;
          border-radius: 19px;
          background: #f8fcf9;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 25px;
          cursor: pointer;
          transition: .2s ease;
        }

        .fd-dropzone:hover,
        .fd-dropzone.active {
          border-color: #159052;
          background: #eef9f2;
        }

        .fd-upload-icon {
          width: 58px;
          height: 58px;
          display: grid;
          place-items: center;
          margin: 0 auto 10px;
          border-radius: 17px;
          background: #dff3e6;
          color: #16834d;
        }

        .fd-dropzone h3 {
          margin: 0 0 5px;
          font-size: 16px;
        }

        .fd-dropzone p {
          margin: 0;
          color: #7b8780;
          font-size: 12px;
          line-height: 1.5;
        }

        .fd-selected-file {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px;
          border-radius: 14px;
          background: #eef8f1;
          margin-top: 12px;
        }

        .fd-file-icon {
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          background: white;
          color: #16834d;
        }

        .fd-file-name {
          flex: 1;
          min-width: 0;
        }

        .fd-file-name strong {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 13px;
        }

        .fd-file-name span {
          color: #748178;
          font-size: 11px;
        }

        .fd-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-top: 18px;
        }

        .fd-form-group {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .fd-form-group.full {
          grid-column: 1 / -1;
        }

        .fd-label {
          font-size: 12px;
          font-weight: 900;
          color: #34443b;
        }

        .fd-required {
          color: #d43f3f;
        }

        .fd-error {
          margin-top: 12px;
          padding: 11px 13px;
          border-radius: 11px;
          background: #fff0f0;
          color: #a52d2d;
          font-size: 12px;
          line-height: 1.5;
        }

        .fd-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 9px;
          padding: 17px 22px;
          border-top: 1px solid #e8eee9;
        }

        .fd-secondary {
          border: 1px solid #dbe4de;
          background: white;
          color: #435249;
        }

        .fd-green {
          background: #16834d;
          color: white;
        }

        .fd-green:disabled {
          opacity: .5;
          cursor: not-allowed;
          transform: none;
        }

        .fd-detail-layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          min-height: 350px;
        }

        .fd-preview {
          background: #eef3ef;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          min-height: 350px;
        }

        .fd-preview img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .fd-preview iframe {
          width: 100%;
          height: 100%;
          min-height: 350px;
          border: 0;
        }

        .fd-preview-placeholder {
          text-align: center;
          padding: 25px;
          color: #748078;
        }

        .fd-detail-info {
          padding: 23px;
        }

        .fd-detail-icon {
          width: 60px;
          height: 60px;
          display: grid;
          place-items: center;
          border-radius: 18px;
          background: #eaf7ef;
          color: #16834d;
          margin-bottom: 14px;
        }

        .fd-detail-info h2 {
          margin: 0 0 6px;
          font-size: 21px;
        }

        .fd-detail-info > p {
          color: #77837c;
          font-size: 12px;
        }

        .fd-detail-table {
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          border-top: 1px solid #e7ede8;
        }

        .fd-detail-row {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          padding: 11px 0;
          border-bottom: 1px solid #edf1ee;
          font-size: 12px;
        }

        .fd-detail-row span:first-child {
          color: #7a867f;
        }

        .fd-detail-row span:last-child {
          text-align: right;
          font-weight: 800;
        }

        .fd-security-note {
          display: flex;
          gap: 10px;
          margin-top: 17px;
          padding: 12px;
          border-radius: 12px;
          background: #f7faf8;
          color: #66736b;
          font-size: 11px;
          line-height: 1.5;
        }

        .fd-footer {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          margin-top: 20px;
          padding: 14px 4px;
          color: #77847c;
          font-size: 11px;
        }

        .fd-footer strong {
          color: #3c4a42;
        }

        @media (max-width: 1100px) {
          .fd-kpis {
            grid-template-columns: repeat(2, 1fr);
          }

          .fd-doc-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .fd-bottom-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 760px) {
          .fd-shell {
            padding: 0 13px;
          }

          .fd-hero {
            padding: 24px;
            border-radius: 22px;
          }

          .fd-hero-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .fd-hero-actions {
            justify-content: flex-start;
          }

          .fd-alerts {
            grid-template-columns: 1fr;
          }

          .fd-doc-grid {
            grid-template-columns: 1fr;
          }

          .fd-form-grid {
            grid-template-columns: 1fr;
          }

          .fd-form-group.full {
            grid-column: auto;
          }

          .fd-detail-layout {
            grid-template-columns: 1fr;
          }

          .fd-preview {
            min-height: 250px;
          }

          .fd-list-row {
            grid-template-columns: 44px 1fr auto;
          }

          .fd-list-purpose {
            display: none;
          }

          .fd-list-row .fd-status {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .fd-kpis {
            grid-template-columns: 1fr;
          }

          .fd-toolbar-row {
            align-items: stretch;
          }

          .fd-search {
            min-width: 100%;
          }

          .fd-tool-btn {
            flex: 1;
            justify-content: center;
          }

          .fd-category-grid {
            grid-template-columns: 1fr;
          }

          .fd-footer {
            flex-direction: column;
          }
        }

        @media print {
          .fd-page {
            background: white;
          }

          .fd-hero-actions,
          .fd-toolbar,
          .fd-doc-actions,
          .fd-bottom-grid,
          .fd-footer {
            display: none !important;
          }

          .fd-hero {
            color: black;
            background: white;
            box-shadow: none;
            border: 1px solid #ddd;
          }

          .fd-hero p {
            color: #555;
          }

          .fd-workspace {
            box-shadow: none;
          }
        }
      `}</style>

      <AgriculturePageHeader
        title="Farmer Document Center"
        description="Keep important farm, identity, land, banking, insurance and scheme records organized in one place."
      />

      <main className="fd-shell">
        {/* ===================================================
            HERO
        =================================================== */}

        <section className="fd-hero">
          <div className="fd-hero-content">
            <div className="fd-hero-copy">
              <div className="fd-eyebrow">
                <ShieldCheck size={14} />
                AgriGo Secure Farm Records
              </div>

              <h1>
                Your farm documents,
                <br />
                ready when you need them.
              </h1>

              <p>
                Store important agricultural documents for
                scheme applications, subsidies, crop insurance,
                KCC, land verification, farmer registration and
                everyday farm services.
              </p>

              <div className="fd-storage">
                <div className="fd-storage-top">
                  <span>
                    <HardDrive
                      size={13}
                      style={{
                        verticalAlign: "middle",
                        marginRight: 5,
                      }}
                    />
                    Document storage
                  </span>

                  <span>
                    {formatFileSize(totalStorageKb)} / 1 GB
                  </span>
                </div>

                <div className="fd-storage-track">
                  <div
                    className="fd-storage-fill"
                    style={{
                      width: `${storagePercentage}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="fd-hero-actions">
              <button
                className="fd-btn fd-btn-primary"
                onClick={() => setShowUpload(true)}
              >
                <UploadCloud size={18} />
                Upload Document
              </button>

              <button
                className="fd-btn fd-btn-soft"
                onClick={exportCsv}
              >
                <Download size={17} />
                Export
              </button>
            </div>
          </div>
        </section>

        {/* ===================================================
            STATS
        =================================================== */}

        <section className="fd-kpis">
          <div className="fd-kpi">
            <StatCard
              title="Total Documents"
              value={documents.length}
              icon={<FolderOpen size={20} />}
            />
          </div>

          <div className="fd-kpi">
            <StatCard
              title="Verified Records"
              value={verifiedDocuments.length}
              icon={<CheckCircle2 size={20} />}
            />
          </div>

          <div className="fd-kpi">
            <StatCard
              title="Renewals Due"
              value={
                expiringDocuments.length +
                expiredDocuments.length
              }
              icon={<Clock3 size={20} />}
            />
          </div>

          <div className="fd-kpi">
            <StatCard
              title="Document Readiness"
              value={`${readinessPercentage}%`}
              icon={<ShieldCheck size={20} />}
            />
          </div>
        </section>

        {/* ===================================================
            ALERTS
        =================================================== */}

        {(expiredDocuments.length > 0 ||
          expiringDocuments.length > 0) && (
          <section className="fd-alerts">
            {expiredDocuments.length > 0 && (
              <AlertCard
                title={`${expiredDocuments.length} document${
                  expiredDocuments.length > 1 ? "s" : ""
                } expired`}
                description="Review these records and upload updated versions where necessary."
                icon={<AlertTriangle size={19} />}
              />
            )}

            {expiringDocuments.length > 0 && (
              <AlertCard
                title={`${expiringDocuments.length} document${
                  expiringDocuments.length > 1 ? "s" : ""
                } need renewal soon`}
                description="Some documents have an expiry date within the next 30 days."
                icon={<Clock3 size={19} />}
              />
            )}
          </section>
        )}

        {/* ===================================================
            DOCUMENT WORKSPACE
        =================================================== */}

        <section className="fd-workspace">
          <div className="fd-toolbar">
            <div className="fd-toolbar-row">
              <div className="fd-search">
                <Search size={18} />

                <input
                  className="fd-input"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search Aadhaar, RTC, passbook, crop insurance..."
                />
              </div>

              <button
                className={`fd-tool-btn ${
                  showFilters ? "active" : ""
                }`}
                onClick={() =>
                  setShowFilters((current) => !current)
                }
              >
                <Filter size={16} />
                Filters
              </button>

              <select
                className="fd-select"
                style={{ width: 150 }}
                value={sort}
                onChange={(e) =>
                  setSort(e.target.value as any)
                }
              >
                <option value="recent">
                  Recently added
                </option>
                <option value="oldest">
                  Oldest first
                </option>
                <option value="name">
                  Name
                </option>
                <option value="size">
                  File size
                </option>
                <option value="expiry">
                  Expiry
                </option>
              </select>

              <button
                className={`fd-tool-btn ${
                  viewMode === "grid" ? "active" : ""
                }`}
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
              >
                <LayoutGrid size={16} />
              </button>

              <button
                className={`fd-tool-btn ${
                  viewMode === "list" ? "active" : ""
                }`}
                onClick={() => setViewMode("list")}
                aria-label="List view"
              >
                <List size={16} />
              </button>

              <button
                className="fd-tool-btn"
                onClick={() => refetch()}
              >
                <RefreshCw
                  size={16}
                  className={
                    isFetching ? "fd-spin" : ""
                  }
                />
              </button>

              <button
                className="fd-tool-btn"
                onClick={printReport}
              >
                <Printer size={16} />
              </button>
            </div>

            {showFilters && (
              <div className="fd-filters">
                <button
                  className={`fd-chip ${
                    category === "all" ? "active" : ""
                  }`}
                  onClick={() => setCategory("all")}
                >
                  All ({documents.length})
                </button>

                {(
                  Object.keys(
                    CATEGORY_META
                  ) as Exclude<
                    DocumentCategory,
                    "all"
                  >[]
                ).map((key) => {
                  const meta = CATEGORY_META[key];

                  return (
                    <button
                      key={key}
                      className={`fd-chip ${
                        category === key
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setCategory(key)
                      }
                    >
                      {meta.label} (
                      {categoryCounts[key]})
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="fd-content">
            <div className="fd-section-heading">
              <div>
                <h2>
                  {category === "all"
                    ? "My farm documents"
                    : CATEGORY_META[category].label}
                </h2>

                <p>
                  {filteredDocuments.length} record
                  {filteredDocuments.length !== 1
                    ? "s"
                    : ""}{" "}
                  found
                </p>
              </div>

              <button
                className="fd-tool-btn"
                onClick={() => setShowUpload(true)}
              >
                <Upload size={16} />
                Quick upload
              </button>
            </div>

            {/* Loading */}

            {isLoading && (
              <div className="fd-empty">
                <div className="fd-empty-icon">
                  <RefreshCw size={28} />
                </div>

                <h3>Loading your documents...</h3>

                <p>
                  AgriGo is securely retrieving your farm
                  records.
                </p>
              </div>
            )}

            {/* Error */}

            {!isLoading && error && (
              <div className="fd-empty">
                <div className="fd-empty-icon">
                  <AlertTriangle size={28} />
                </div>

                <h3>Unable to load documents</h3>

                <p>
                  Check your Django API connection and try
                  again.
                </p>

                <button
                  className="fd-btn fd-green"
                  onClick={() => refetch()}
                >
                  <RefreshCw size={16} />
                  Try again
                </button>
              </div>
            )}

            {/* Empty */}

            {!isLoading &&
              !error &&
              filteredDocuments.length === 0 && (
                <div className="fd-empty">
                  <div className="fd-empty-icon">
                    <FolderOpen size={30} />
                  </div>

                  <h3>
                    {search
                      ? "No matching documents"
                      : "Your document center is empty"}
                  </h3>

                  <p>
                    {search
                      ? "Try another document name, category or purpose."
                      : "Upload Aadhaar, bank proof, land records, farmer certificates and other documents you may use for agricultural services."}
                  </p>

                  {!search && (
                    <button
                      className="fd-btn fd-green"
                      onClick={() =>
                        setShowUpload(true)
                      }
                    >
                      <Upload size={17} />
                      Upload your first document
                    </button>
                  )}
                </div>
              )}

            {/* Grid */}

            {!isLoading &&
              !error &&
              filteredDocuments.length > 0 &&
              viewMode === "grid" && (
                <div className="fd-doc-grid">
                  {filteredDocuments.map(
                    (document) => {
                      const meta =
                        getDocumentMeta(document);

                      const Icon = meta.icon;

                      const status =
                        getDocumentStatus(document);

                      const StatusIcon =
                        status.icon;

                      const days = getDaysUntil(
                        document.expiresOn
                      );

                      return (
                        <article
                          className="fd-doc"
                          key={document.id}
                        >
                          <div className="fd-doc-top">
                            <div className="fd-doc-icon">
                              <Icon size={23} />
                            </div>

                            <div className="fd-doc-actions">
                              <button
                                className={`fd-icon-btn ${
                                  document.pinned
                                    ? "active"
                                    : ""
                                }`}
                                title="Pin document"
                                onClick={() =>
                                  togglePin(document)
                                }
                              >
                                <Pin size={16} />
                              </button>

                              <button
                                className={`fd-icon-btn ${
                                  document.important
                                    ? "active"
                                    : ""
                                }`}
                                title="Mark important"
                                onClick={() =>
                                  toggleImportant(
                                    document
                                  )
                                }
                              >
                                <Star size={16} />
                              </button>

                              <button
                                className="fd-icon-btn"
                                title="More"
                                onClick={() =>
                                  setSelectedDocument(
                                    document
                                  )
                                }
                              >
                                <MoreVertical
                                  size={16}
                                />
                              </button>
                            </div>
                          </div>

                          <h3>{document.name}</h3>

                          <div className="fd-doc-type">
                            {meta.label} •{" "}
                            {CATEGORY_META[
                              document.category ||
                                "other"
                            ]?.label || "Other"}
                          </div>

                          <div
                            className={`fd-status ${status.className}`}
                          >
                            <StatusIcon size={13} />
                            {status.label}
                          </div>

                          {document.purpose && (
                            <div className="fd-purpose">
                              <strong>Used for:</strong>{" "}
                              {document.purpose}
                            </div>
                          )}

                          <div className="fd-doc-meta">
                            <span>
                              {formatFileSize(
                                document.sizeKb || 0
                              )}
                            </span>

                            <span>
                              {document.expiresOn
                                ? days !== null &&
                                  days < 0
                                  ? "Expired"
                                  : `${days} days left`
                                : "No expiry set"}
                            </span>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              gap: 7,
                              marginTop: 14,
                            }}
                          >
                            <button
                              className="fd-tool-btn"
                              style={{
                                flex: 1,
                                justifyContent:
                                  "center",
                              }}
                              onClick={() =>
                                setSelectedDocument(
                                  document
                                )
                              }
                            >
                              <Eye size={15} />
                              View
                            </button>

                            {document.url && (
                              <button
                                className="fd-tool-btn"
                                onClick={() =>
                                  downloadDocument(
                                    document
                                  )
                                }
                              >
                                <Download
                                  size={15}
                                />
                              </button>
                            )}
                          </div>
                        </article>
                      );
                    }
                  )}
                </div>
              )}

            {/* List */}

            {!isLoading &&
              !error &&
              filteredDocuments.length > 0 &&
              viewMode === "list" && (
                <div className="fd-list">
                  {filteredDocuments.map(
                    (document) => {
                      const meta =
                        getDocumentMeta(document);

                      const Icon = meta.icon;

                      const status =
                        getDocumentStatus(document);

                      const StatusIcon =
                        status.icon;

                      return (
                        <div
                          className="fd-list-row"
                          key={document.id}
                        >
                          <div className="fd-doc-icon">
                            <Icon size={20} />
                          </div>

                          <div>
                            <div className="fd-list-name">
                              {document.name}
                            </div>

                            <div className="fd-list-sub">
                              {meta.label} •{" "}
                              {formatFileSize(
                                document.sizeKb || 0
                              )}
                            </div>
                          </div>

                          <div className="fd-list-purpose">
                            {document.purpose ||
                              "General farm record"}
                          </div>

                          <div
                            className={`fd-status ${status.className}`}
                          >
                            <StatusIcon size={12} />
                            {status.label}
                          </div>

                          <div
                            style={{
                              display: "flex",
                              gap: 3,
                            }}
                          >
                            <button
                              className="fd-icon-btn"
                              onClick={() =>
                                setSelectedDocument(
                                  document
                                )
                              }
                            >
                              <Eye size={16} />
                            </button>

                            {document.url && (
                              <button
                                className="fd-icon-btn"
                                onClick={() =>
                                  downloadDocument(
                                    document
                                  )
                                }
                              >
                                <Download
                                  size={16}
                                />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
          </div>
        </section>

        {/* ===================================================
            LOWER PANELS
        =================================================== */}

        <section className="fd-bottom-grid">
          <div className="fd-panel">
            <h3>Document categories</h3>

            <p className="fd-panel-sub">
              Keep different types of agricultural records
              organized so you can find them quickly when
              applying for a service.
            </p>

            <div className="fd-category-grid">
              {(
                Object.keys(
                  CATEGORY_META
                ) as Exclude<
                  DocumentCategory,
                  "all"
                >[]
              ).map((key) => {
                const meta = CATEGORY_META[key];

                const Icon = meta.icon;

                return (
                  <button
                    className="fd-category"
                    key={key}
                    onClick={() =>
                      setCategory(key)
                    }
                  >
                    <div className="fd-category-icon">
                      <Icon size={17} />
                    </div>

                    <div>
                      <strong>
                        {meta.label}
                      </strong>

                      <span>
                        {categoryCounts[key]} document
                        {categoryCounts[key] !== 1
                          ? "s"
                          : ""}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="fd-panel">
            <h3>General document checklist</h3>

            <p className="fd-panel-sub">
              A helpful readiness checklist for common farm
              services. Requirements vary by scheme, bank,
              insurer and government department.
            </p>

            <div className="fd-progress">
              <div
                className="fd-progress-fill"
                style={{
                  width: `${readinessPercentage}%`,
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 14,
                fontSize: 12,
              }}
            >
              <strong>
                {checklistProgress} of{" "}
                {COMMON_CHECKLIST.length} available
              </strong>

              <span>
                {readinessPercentage}%
              </span>
            </div>

            <div className="fd-checklist">
              {COMMON_CHECKLIST.map((item) => {
                const available =
                  documents.some(
                    (doc) =>
                      String(
                        doc.documentType
                      ).toLowerCase() ===
                      item.type.toLowerCase()
                  );

                return (
                  <div
                    className={`fd-check ${
                      available ? "" : "missing"
                    }`}
                    key={item.type}
                  >
                    {available ? (
                      <CheckCircle2
                        size={16}
                        className="fd-check-icon"
                      />
                    ) : (
                      <Archive
                        size={16}
                        className="fd-check-icon"
                      />
                    )}

                    <div>
                      <strong>
                        {item.label}
                      </strong>

                      <p>
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <footer className="fd-footer">
          <span>
            <Lock
              size={12}
              style={{
                verticalAlign: "middle",
                marginRight: 4,
              }}
            />
            <strong>Private farm records</strong>
            {" · "}
            Keep sensitive documents protected.
          </span>

          <span>
            Showing {filteredDocuments.length} of{" "}
            {documents.length} documents
          </span>
        </footer>
      </main>

      {/* =====================================================
          UPLOAD MODAL
      ===================================================== */}

      {showUpload && (
        <div
          className="fd-modal-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              resetUpload();
            }
          }}
        >
          <div className="fd-modal">
            <div className="fd-modal-head">
              <div>
                <h2>Upload farm document</h2>

                <p>
                  Add a document you may need for farm
                  services, schemes, banking or land
                  verification.
                </p>
              </div>

              <button
                className="fd-close"
                onClick={resetUpload}
              >
                <X size={18} />
              </button>
            </div>

            <div className="fd-modal-body">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                hidden
                onChange={(event) =>
                  handleFile(
                    event.target.files?.[0]
                  )
                }
              />

              <div
                className={`fd-dropzone ${
                  dragActive ? "active" : ""
                }`}
                onClick={() =>
                  fileInputRef.current?.click()
                }
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() =>
                  setDragActive(false)
                }
                onDrop={handleDrop}
              >
                <div>
                  <div className="fd-upload-icon">
                    <CloudUpload size={27} />
                  </div>

                  <h3>
                    Drop your document here
                  </h3>

                  <p>
                    or click to browse from your
                    computer
                    <br />
                    PDF, JPG, PNG or WEBP • Maximum
                    10 MB
                  </p>
                </div>
              </div>

              {selectedFile && (
                <div className="fd-selected-file">
                  <div className="fd-file-icon">
                    <Paperclip size={18} />
                  </div>

                  <div className="fd-file-name">
                    <strong>
                      {selectedFile.name}
                    </strong>

                    <span>
                      {formatFileSize(
                        selectedFile.size / 1024
                      )}
                    </span>
                  </div>

                  <button
                    className="fd-icon-btn"
                    onClick={() =>
                      setSelectedFile(null)
                    }
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <div className="fd-form-grid">
                <div className="fd-form-group">
                  <label className="fd-label">
                    Document type{" "}
                    <span className="fd-required">
                      *
                    </span>
                  </label>

                  <select
                    className="fd-select"
                    value={uploadForm.documentType}
                    onChange={(event) =>
                      handleDocumentTypeChange(
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Select document
                    </option>

                    {DOCUMENT_TYPES.map(
                      (item) => (
                        <option
                          value={item.value}
                          key={item.value}
                        >
                          {item.label}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="fd-form-group">
                  <label className="fd-label">
                    Category
                  </label>

                  <select
                    className="fd-select"
                    value={uploadForm.category}
                    onChange={(event) =>
                      setUploadForm(
                        (current) => ({
                          ...current,
                          category:
                            event.target
                              .value as Exclude<
                              DocumentCategory,
                              "all"
                            >,
                        })
                      )
                    }
                  >
                    {(
                      Object.keys(
                        CATEGORY_META
                      ) as Exclude<
                        DocumentCategory,
                        "all"
                      >[]
                    ).map((key) => (
                      <option
                        key={key}
                        value={key}
                      >
                        {CATEGORY_META[key].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="fd-form-group">
                  <label className="fd-label">
                    What will you use it for?
                  </label>

                  <select
                    className="fd-select"
                    value={uploadForm.purpose}
                    onChange={(event) =>
                      setUploadForm(
                        (current) => ({
                          ...current,
                          purpose:
                            event.target.value,
                        })
                      )
                    }
                  >
                    <option value="">
                      Select purpose
                    </option>

                    {PURPOSE_OPTIONS.map(
                      (purpose) => (
                        <option
                          key={purpose}
                          value={purpose}
                        >
                          {purpose}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="fd-form-group">
                  <label className="fd-label">
                    Expiry date
                  </label>

                  <input
                    type="date"
                    className="fd-input"
                    value={
                      uploadForm.expiryDate
                    }
                    onChange={(event) =>
                      setUploadForm(
                        (current) => ({
                          ...current,
                          expiryDate:
                            event.target.value,
                        })
                      )
                    }
                  />
                </div>

                <div className="fd-form-group full">
                  <label className="fd-label">
                    Notes
                  </label>

                  <textarea
                    className="fd-textarea"
                    value={uploadForm.notes}
                    onChange={(event) =>
                      setUploadForm(
                        (current) => ({
                          ...current,
                          notes:
                            event.target.value,
                        })
                      )
                    }
                    placeholder="Example: Land document for Survey No. 125/2..."
                  />
                </div>
              </div>

              {uploadError && (
                <div className="fd-error">
                  <AlertTriangle
                    size={14}
                    style={{
                      verticalAlign: "middle",
                      marginRight: 5,
                    }}
                  />
                  {uploadError}
                </div>
              )}

              <div className="fd-security-note">
                <Lock size={16} />

                <span>
                  Sensitive documents such as identity,
                  banking and land records should only be
                  accessible to the authenticated farmer.
                  Configure private file permissions in
                  Django rather than exposing files publicly.
                </span>
              </div>
            </div>

            <div className="fd-modal-footer">
              <button
                className="fd-btn fd-secondary"
                onClick={resetUpload}
                disabled={
                  uploadMutation.isPending
                }
              >
                Cancel
              </button>

              <button
                className="fd-btn fd-green"
                disabled={
                  !selectedFile ||
                  !uploadForm.documentType ||
                  uploadMutation.isPending
                }
                onClick={() =>
                  uploadMutation.mutate()
                }
              >
                {uploadMutation.isPending ? (
                  <>
                    <RefreshCw size={16} />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadCloud size={16} />
                    Upload document
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          DOCUMENT DETAIL MODAL
      ===================================================== */}

      {selectedDocument && (
        <div
          className="fd-modal-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedDocument(null);
            }
          }}
        >
          <div className="fd-modal fd-modal-large">
            <div className="fd-modal-head">
              <div>
                <h2>Document details</h2>

                <p>
                  Review your uploaded farm record.
                </p>
              </div>

              <button
                className="fd-close"
                onClick={() =>
                  setSelectedDocument(null)
                }
              >
                <X size={18} />
              </button>
            </div>

            <div className="fd-detail-layout">
              <div className="fd-preview">
                {selectedDocument.url &&
                selectedDocument.mimeType?.startsWith(
                  "image/"
                ) ? (
                  <img
                    src={selectedDocument.url}
                    alt={selectedDocument.name}
                  />
                ) : selectedDocument.url &&
                  (selectedDocument.mimeType ===
                    "application/pdf" ||
                    selectedDocument.url
                      .toLowerCase()
                      .includes(".pdf")) ? (
                  <iframe
                    src={selectedDocument.url}
                    title={selectedDocument.name}
                  />
                ) : (
                  <div className="fd-preview-placeholder">
                    <FileText
                      size={45}
                      style={{
                        marginBottom: 10,
                      }}
                    />

                    <div>
                      Preview is not available for this
                      file.
                    </div>
                  </div>
                )}
              </div>

              <div className="fd-detail-info">
                {(() => {
                  const meta =
                    getDocumentMeta(
                      selectedDocument
                    );

                  const Icon = meta.icon;

                  const status =
                    getDocumentStatus(
                      selectedDocument
                    );

                  const StatusIcon =
                    status.icon;

                  return (
                    <>
                      <div className="fd-detail-icon">
                        <Icon size={29} />
                      </div>

                      <h2>
                        {selectedDocument.name}
                      </h2>

                      <p>
                        {meta.label} ·{" "}
                        {CATEGORY_META[
                          selectedDocument
                            .category ||
                            "other"
                        ]?.label ||
                          "Other"}
                      </p>

                      <div
                        className={`fd-status ${status.className}`}
                      >
                        <StatusIcon size={13} />
                        {status.label}
                      </div>
                    </>
                  );
                })()}

                <div className="fd-detail-table">
                  <div className="fd-detail-row">
                    <span>File size</span>
                    <span>
                      {formatFileSize(
                        selectedDocument.sizeKb ||
                          0
                      )}
                    </span>
                  </div>

                  <div className="fd-detail-row">
                    <span>Added</span>
                    <span>
                      {selectedDocument.addedOn
                        ? new Date(
                            selectedDocument.addedOn
                          ).toLocaleDateString(
                            "en-IN"
                          )
                        : "—"}
                    </span>
                  </div>

                  <div className="fd-detail-row">
                    <span>Expiry</span>
                    <span>
                      {selectedDocument.expiresOn
                        ? new Date(
                            selectedDocument.expiresOn
                          ).toLocaleDateString(
                            "en-IN"
                          )
                        : "No expiry"}
                    </span>
                  </div>

                  <div className="fd-detail-row">
                    <span>Purpose</span>
                    <span>
                      {selectedDocument.purpose ||
                        "General farm record"}
                    </span>
                  </div>
                </div>

                {selectedDocument.notes && (
                  <div className="fd-purpose">
                    <strong>Notes</strong>
                    <br />
                    {selectedDocument.notes}
                  </div>
                )}

                <div className="fd-security-note">
                  <Lock size={16} />

                  <span>
                    Keep copies of sensitive records
                    protected. AgriGo should enforce
                    authenticated access through the Django
                    backend.
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 18,
                    flexWrap: "wrap",
                  }}
                >
                  {selectedDocument.url && (
                    <button
                      className="fd-btn fd-green"
                      onClick={() =>
                        downloadDocument(
                          selectedDocument
                        )
                      }
                    >
                      <Download size={16} />
                      Open / Download
                    </button>
                  )}

                  <button
                    className="fd-btn fd-secondary"
                    onClick={() =>
                      togglePin(selectedDocument)
                    }
                  >
                    <Pin size={16} />
                    {selectedDocument.pinned
                      ? "Unpin"
                      : "Pin"}
                  </button>

                  <button
                    className="fd-btn"
                    style={{
                      background: "#fff0f0",
                      color: "#a52d2d",
                    }}
                    onClick={() =>
                      handleDelete(
                        selectedDocument
                      )
                    }
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}