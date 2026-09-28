export type UserRole = 'FARMER' | 'OFFICER' | 'ADMIN';

export type AccountStatus = 'REGISTERED' | 'VERIFIED' | 'ACTIVE' | 'INACTIVE';

export type IndianLanguage = 'en' | 'kn' | 'hi' | 'te' | 'ta' | 'mr' | 'bn';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  language: IndianLanguage;
  token?: string;
  createdAt: string;
  status?: AccountStatus;
  passwordHash?: string;
  verifiedAt?: string;
}

export interface FarmerProfile {
  userId: string;
  state: string;
  district: string;
  taluk: string;
  village: string;
  lat: number;
  lng: number;
  totalAcreage: number;
  preferredLanguage: IndianLanguage;
}

export interface OfficerProfile {
  userId: string;
  designation: string;
  department: string;
  assignedState: string;
  assignedDistrict: string;
  officeLocation: string;
}

export interface SoilData {
  soilType: 'Alluvial' | 'Black (Regur)' | 'Red & Yellow' | 'Laterite' | 'Sandy Loam' | 'Clay';
  nitrogen: number; // kg/ha
  phosphorus: number; // kg/ha
  potassium: number; // kg/ha
  ph: number;
  organicCarbon: number; // %
  lastTestedDate?: string;
}

export interface Crop {
  id: string;
  farmId: string;
  name: string;
  variety: string;
  sowingDate: string;
  expectedHarvestDate: string;
  season: 'Kharif' | 'Rabi' | 'Zaid';
  growthStage: 'Germination' | 'Vegetative' | 'Flowering' | 'Fruiting' | 'Maturity';
  healthScore: number; // 0 - 100
  areaAcres: number;
  status: 'ACTIVE' | 'HARVESTED' | 'FAILED';
}

export interface Farm {
  id: string;
  farmerId: string;
  farmerName: string;
  name: string;
  areaAcres: number;
  lat: number;
  lng: number;
  village: string;
  taluk: string;
  district: string;
  state: string;
  irrigationType: 'Drip' | 'Sprinkler' | 'Canal / Flood' | 'Rainfed' | 'Borewell';
  waterAvailability: 'Abundant' | 'Moderate' | 'Scarse' | 'Seasonal';
  soil: SoilData;
  activeCrops: Crop[];
  healthScore: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  createdAt: string;
}

export interface FarmDocumentRecord {
  id: string | number;
  userId: string;
  name: string;
  documentType: string;
  type?: string;
  category: string;
  purpose?: string;
  notes?: string;
  sizeKb: number;
  mimeType?: string;
  addedOn: string;
  expiresOn?: string | null;
  status: 'pending' | 'verified' | 'rejected' | 'expired';
  url?: string;
  fileUrl?: string;
  pinned?: boolean;
  important?: boolean;
  originalName?: string;
}

export interface DiseaseDetectionResult {
  id: string;
  userId?: string;
  farmId?: string;
  crop: string;
  disease: string;
  confidence: number;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Healthy' | 'Unknown';
  detectedAt: string;
  imageUrl?: string;
  imagePath?: string;
  modelVersion?: string;
  healthy?: boolean;
  message?: string;
  symptoms: string[];
  recommendedActions: string[];
  prevention: string[];
  officerConsultationNeeded: boolean;
  explanation: string;
  diseaseInfo?: {
    crop: string;
    disease: string;
    explanation: string;
    symptoms: string[];
    prevention: string[];
    recommendedActions: string[];
    whenToConsult: string;
  };
  botanicalIndicators?: {
    chlorosisRatio: number;
    necroticAreaPercent: number;
    leafSymmetryScore: number;
  };
}

export interface CropRecommendationInput {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  temperature: number;
  humidity: number;
  rainfall: number;
  soilType: string;
  state: string;
  season: string;
  irrigationAvailability: string;
}

export type CropCategory =
  | 'Cereals & Millets'
  | 'Pulses & Legumes'
  | 'Oilseeds'
  | 'Vegetables & Greens'
  | 'Fruits & Plantation'
  | 'Spices & Condiments'
  | 'Commercial & Fibre'
  | 'Fodder & Flowers';

export interface CropRecommendationItem {
  cropName: string;
  scientificName?: string;
  hindiName?: string;
  popularVarieties?: string[];
  category?: CropCategory;
  suitabilityScore: number; // 0 - 100
  expectedGrowingPeriod: string;
  durationDays?: number;
  waterRequirement: 'Low' | 'Moderate' | 'High';
  soilSuitability: string;
  climateSuitability: string;
  reasons: string[];
  riskFactors?: string[];
  marketProspect: string;

  // Real-world Kisan Economics & Agronomy
  mspOrBenchmarkPrice?: string;
  estimatedCostPerAcre?: number;
  estimatedGrossReturnPerAcre?: number;
  estimatedNetProfitPerAcre?: number;
  expectedYieldPerAcre?: string;
  sowingWindow?: string;
  harvestWindow?: string;
  recommendedFertilizerDose?: string;
  irrigationScheduleHint?: string;
  isBiologicallyFeasible?: boolean;
  criticalConstraint?: string;
}

export interface YieldPredictionInput {
  crop: string;
  farmAreaAcres: number;
  soilType: string;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  rainfallMm: number;
  temperatureC: number;
  humidityPercent: number;
  fertilizerUsageKgPerAcre: number;
  irrigationType: string;
  sowingDate: string;
  state: string;
}

export interface YieldPredictionResult {
  crop: string;
  estimatedYieldTonnesPerHectare: number;
  estimatedTotalYieldTonnes: number;
  yieldRangeMin: number;
  yieldRangeMax: number;
  confidenceScore: number;
  influencingFactors: {
    factor: string;
    impact: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
    description: string;
  }[];
  benchmarks: {
    stateAverageTonnesPerHa: number;
    nationalAverageTonnesPerHa: number;
    potentialMaximumTonnesPerHa: number;
  };
}

export interface HourlyWeatherPoint {
  time: string;
  hourLabel: string;
  temp: number;
  rainProbabilityPercent: number;
  precipitationMm: number;
  condition: string;
  isSpraySafe: boolean;
}

export interface RainPercentagePrediction {
  currentChancePercent: number;
  peakChance24h: number;
  accumulatedMm24h: number;
  riskCategory: 'NO_RAIN' | 'LIGHT_SHOWERS' | 'MODERATE_RAIN' | 'HEAVY_DOWNPOUR';
  timeOfNextRain: string;
  hourlyTimeline: HourlyWeatherPoint[];
  summaryNote: string;
}

export interface TemperatureAnalysis {
  currentTemp: number;
  feelsLikeTemp: number;
  tempMaxToday: number;
  tempMinToday: number;
  diurnalGap: number;
  thermalStressCategory: 'OPTIMAL_GROWTH' | 'MILD_HEAT' | 'SEVERE_HEAT_STRESS' | 'CHILL_RISK';
  vegetativeImpact: string;
}

export interface AutomatedOperationalDirectives {
  sprayWindow: {
    status: 'OPTIMAL' | 'MARGINAL' | 'UNSAFE_WASH_OFF';
    headline: string;
    explanation: string;
    chemicalLossSavings: string;
  };
  irrigationControl: {
    status: 'SUSPEND' | 'NORMAL' | 'CRITICAL';
    headline: string;
    explanation: string;
  };
  harvestSafety: {
    status: 'SAFE' | 'SECURE_CROPS';
    headline: string;
    explanation: string;
  };
  soilNitrogenLeachingRisk: {
    status: 'LOW' | 'HIGH_RUNOFF_RISK';
    explanation: string;
  };
}

export interface WeatherIntelligence {
  temperature: number;
  humidity: number;
  rainfallMm: number;
  windSpeedKmh: number;
  condition: string;
  uvIndex: number;
  forecast7Day: {
    date: string;
    dayName: string;
    tempMax: number;
    tempMin: number;
    rainfallChancePercent: number;
    rainfallMm: number;
    condition: string;
  }[];
  agronomicAdvisories: {
    category: 'IRRIGATION' | 'DISEASE_RISK' | 'FIELD_WORK' | 'HARVEST_SAFETY';
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    title: string;
    description: string;
    action: string;
  }[];
  fungalDiseaseRiskIndex: number; // 0 - 100
  evapotranspirationRateMm: number;

  // Real-world automated GPS-based analysis
  rainPrediction?: RainPercentagePrediction;
  temperatureAnalysis?: TemperatureAnalysis;
  automatedDirectives?: AutomatedOperationalDirectives;
  stationCoordinates?: { lat: number; lng: number; locationName?: string };
}

export interface DailyAdvisory {
  id: string;
  date: string;
  farmId: string;
  farmName: string;
  cropName: string;
  overallHealthScore: number;
  todayActions: {
    irrigation: {
      recommended: boolean;
      statusText: string;
      reason: string;
    };
    diseaseMonitoring: {
      riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
      targetPathogen: string;
      scoutingInstructions: string;
    };
    fertilizerApplication: {
      recommended: boolean;
      guidance: string;
    };
    fieldWork: {
      sprayWindowSafe: boolean;
      recommendation: string;
    };
  };
  whyExplanation: string[];
}

export interface DiseaseHotspot {
  id: string;
  region: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  radiusKm: number;
  crop: string;
  disease: string;
  reportedCases: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  firstReportedDate: string;
  lastReportedDate: string;
  status: 'SUSPECTED_CLUSTER' | 'CONFIRMED_OUTBREAK' | 'CONTAINED';
  affectedFarms: string[];
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'DISEASE_ALERT' | 'HEAVY_RAIN' | 'TEMPERATURE_EXTREME' | 'OFFICER_ADVISORY' | 'SYSTEM';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  channel: 'IN_APP' | 'SMS' | 'EMAIL';
}

export interface MLModelVersion {
  id: string;
  name: string;
  task: 'DISEASE_DETECTION' | 'CROP_RECOMMENDATION' | 'YIELD_PREDICTION';
  version: string;
  architecture: string;
  trainingDate: string;
  datasetSize: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  status: 'PRODUCTION' | 'STAGING' | 'ARCHIVED';
  confusionMatrix: {
    labels: string[];
    matrix: number[][];
  };
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  userEmail: string;
  action: string;
  entity: string;
  details: string;
  ipAddress?: string;
}

// --- AGRICULTURE OFFICER & FARMER INTERACTION MODELS ---
export interface FarmerSupportTicket {
  id: string;
  ticketNumber: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  district: string;
  taluk: string;
  village: string;
  lat: number;
  lng: number;
  crop: string;
  variety: string;
  affectedAcreage: number;
  category: 'CROP_DAMAGE_COMPENSATION' | 'PEST_DISEASE_EMERGENCY' | 'SOIL_FERTILIZER_ISSUE' | 'WEATHER_HAIL_LOSS' | 'GOVT_SUBSIDY_QUERY';
  title: string;
  description: string;
  imageUrl?: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE' | 'CATASTROPHIC';
  status: 'SUBMITTED' | 'OFFICER_ASSIGNED' | 'FIELD_VISIT_SCHEDULED' | 'APPROVED_RESOLVED';
  createdAt: string;
  officerResponse?: {
    officerId: string;
    officerName: string;
    designation: string;
    department: string;
    officialStampNumber: string;
    diagnosisAndAction: string;
    prescribedFormulation?: string;
    scheduledVisitDate?: string;
    pmfbyApprovedReliefAmount?: number;
    respondedAt: string;
  };
}

export interface SubsidizedAgriInputScheme {
  id: string;
  schemeName: string;
  category: 'CERTIFIED_SEEDS' | 'NANO_FERTILIZERS' | 'BIO_PESTICIDES' | 'MICRO_IRRIGATION';
  crop: string;
  originalPrice: number;
  subsidizedPrice: number;
  subsidyPercent: number;
  totalQuotaBags: number;
  availableQuotaBags: number;
  distributionCenter: string;
  eligibleDistricts: string[];
  authorizedByOfficer: string;
  validUntil: string;
  isActive: boolean;
  createdAt: string;
}

export interface FarmerQuotaToken {
  id: string;
  tokenCode: string;
  schemeId: string;
  schemeName: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerAadhaarLast4: string;
  quantityBooked: number;
  amountPayable: number;
  distributionCenter: string;
  status: 'RESERVED' | 'COLLECTED' | 'EXPIRED';
  generatedAt: string;
}

// --- NEW EXPANSION MODELS ---

export interface IrrigationRecord {
  id: string;
  fieldId: string;
  farmId: string;
  date: string;
  waterQuantityLiters: number;
  method: string;
  durationMinutes: number;
}

export interface CropCalendarTask {
  id: string;
  cropId: string;
  farmId: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'PENDING' | 'COMPLETED' | 'OVERDUE';
  stage: string;
}

export interface FarmDiaryEntry {
  id: string;
  farmId: string;
  date: string;
  category: 'ACTIVITY' | 'OBSERVATION' | 'WEATHER' | 'NOTE';
  title: string;
  content: string;
  images: string[];
}

export interface Expense {
  id: string;
  farmId: string;
  cropId?: string;
  date: string;
  category: 'SEED' | 'FERTILIZER' | 'PESTICIDE' | 'LABOUR' | 'MACHINERY' | 'IRRIGATION' | 'OTHER';
  amount: number;
  description: string;
}

export interface Market {
  id: string;
  name: string;
  state: string;
  district: string;
  lat: number;
  lng: number;
}

export interface MarketPrice {
  id: string;
  marketId: string;
  cropName: string;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  date: string;
}

export interface MarketplaceProduct {
  id: string;
  sellerId: string;
  createdBy?: string;
  createdById?: string;
  ownerId?: string;
  ownerRole?: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  images: string[];
  description: string;
  unit?: string;
  brand?: string;
  seller?: string;
  sellerVerified?: boolean;
  rating?: number;
  reviewCount?: number;
  location?: string;
  tags?: string[];
  featured?: boolean;
  organic?: boolean;
  deliveryDays?: string;
  originalPrice?: number;
  discount?: number;
}

export interface InsurancePolicy {
  id: string;
  farmerId: string;
  provider: string;
  policyName: string;
  cropName: string;
  coverageAmount: number;
  premiumAmount: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CLAIMED';
}

export interface Equipment {
  id: string;
  providerId?: string;
  createdBy?: string;
  createdById?: string;
  ownerId?: string;
  ownerRole?: string;
  name: string;
  category: string;
  pricePerDay: number;
  hourlyRate?: number;
  lat: number;
  lng: number;
  available: boolean;
  description?: string;
  image?: string;
  locationName?: string;
  ownerName?: string;
  distance?: number;
  rating?: number;
  reviews?: number;
  fuelType?: string;
  power?: string;
  modelYear?: number;
  securityDeposit?: number;
  deliveryAvailable?: boolean;
  verifiedOwner?: boolean;
  minimumDays?: number;
  specifications?: string[];
}

export interface RentalRequest {
  id: string;
  equipmentId: string;
  farmerId: string;
  farmerName?: string;
  ownerId?: string;
  equipmentName?: string;
  startDate: string;
  endDate: string;
  days?: number;
  totalAmount?: number;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'Pending' | 'Confirmed' | 'Approved' | 'Rejected' | 'Cancelled';
  createdAt?: string;
}

export interface ExpertConsultation {
  id: string;
  farmerId: string;
  expertId?: string;
  cropName: string;
  category: string;
  problemDescription: string;
  images: string[];
  status: 'PENDING' | 'IN_PROGRESS' | 'ANSWERED' | 'CLOSED';
  expertResponse?: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  category: string;
  title: string;
  content: string;
  images: string[];
  likes: number;
  createdAt: string;
}

export interface CropListing {
  id: string;
  farmerId: string;
  cropName: string;
  variety: string;
  quantityKg: number;
  expectedPricePerKg: number;
  harvestDate: string;
  images: string[];
  status: 'AVAILABLE' | 'NEGOTIATING' | 'SOLD';
}

export interface StorageFacility {
  id: string;
  name: string;
  type: string;
  capacityTonnes: number;
  availableTonnes: number;
  pricePerTonnePerMonth: number;
  lat: number;
  lng: number;
}

