import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import {
  User,
  FarmerProfile,
  OfficerProfile,
  Farm,
  Crop,
  SoilData,
  FarmDocumentRecord,
  DiseaseDetectionResult,
  CropRecommendationItem,
  YieldPredictionResult,
  DailyAdvisory,
  DiseaseHotspot,
  NotificationItem,
  MLModelVersion,
  SystemAuditLog,
  IndianLanguage,
  AccountStatus,
  FarmerSupportTicket,
  SubsidizedAgriInputScheme,
  FarmerQuotaToken,
  IrrigationRecord,
  CropCalendarTask,
  FarmDiaryEntry,
  Expense,
  Market,
  MarketPrice,
  MarketplaceProduct,
  InsurancePolicy,
  Equipment,
  RentalRequest,
  ExpertConsultation,
  CommunityPost,
  CropListing,
  StorageFacility,
} from './types.ts';

interface DatabaseSchema {
  users: User[];
  farmerProfiles: FarmerProfile[];
  officerProfiles: OfficerProfile[];
  farms: Farm[];
  crops: Crop[];
  farmDocuments: FarmDocumentRecord[];
  diseaseDetections: DiseaseDetectionResult[];
  recommendations: { id: string; userId: string; input: any; results: CropRecommendationItem[]; createdAt: string }[];
  yieldPredictions: { id: string; userId: string; input: any; result: YieldPredictionResult; createdAt: string }[];
  advisories: DailyAdvisory[];
  hotspots: DiseaseHotspot[];
  notifications: NotificationItem[];
  modelVersions: MLModelVersion[];
  auditLogs: SystemAuditLog[];
  farmerSupportTickets: FarmerSupportTicket[];
  subsidizedInputSchemes: SubsidizedAgriInputScheme[];
  farmerQuotaTokens: FarmerQuotaToken[];
  irrigationRecords: IrrigationRecord[];
  cropCalendarTasks: CropCalendarTask[];
  farmDiaryEntries: FarmDiaryEntry[];
  expenses: Expense[];
  markets: Market[];
  marketPrices: MarketPrice[];
  marketplaceProducts: MarketplaceProduct[];
  insurancePolicies: InsurancePolicy[];
  equipment: Equipment[];
  rentalRequests: RentalRequest[];
  orders: any[];
  expertConsultations: ExpertConsultation[];
  communityPosts: CommunityPost[];
  cropListings: CropListing[];
  storageFacilities: StorageFacility[];
}

const DATA_DIR = path.join(process.cwd(), 'dataset');
const DB_FILE = path.join(DATA_DIR, 'agrivision_db.json');
const SQLITE_DB_FILE = path.join(DATA_DIR, 'agrivision.sqlite');

const SQLITE_TABLES = [
  'users',
  'farmerProfiles',
  'officerProfiles',
  'farms',
  'crops',
  'farmDocuments',
  'diseaseDetections',
  'recommendations',
  'yieldPredictions',
  'advisories',
  'hotspots',
  'notifications',
  'modelVersions',
  'auditLogs',
  'farmerSupportTickets',
  'subsidizedInputSchemes',
  'farmerQuotaTokens',
  'irrigationRecords',
  'cropCalendarTasks',
  'farmDiaryEntries',
  'expenses',
  'markets',
  'marketPrices',
  'marketplaceProducts',
  'insurancePolicies',
  'equipment',
  'rentalRequests',
  'orders',
  'expertConsultations',
  'communityPosts',
  'cropListings',
  'storageFacilities',
] as const;

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Realistic Seed Dataset for Smart India Hackathon Demonstration
function getInitialSeedData(): DatabaseSchema {
  return {
    users: [
      {
        id: 'usr_farmer_1',
        name: 'Ramesh Gowda',
        email: 'ramesh.farmer@agrivision.in',
        phone: '+91 98451 23456',
        role: 'FARMER',
        language: 'kn',
        createdAt: '2026-08-10T09:00:00.000Z',
      },
      {
        id: 'usr_farmer_2',
        name: 'Harpreet Singh',
        email: 'harpreet.farmer@agrivision.in',
        phone: '+91 98765 43210',
        role: 'FARMER',
        language: 'hi',
        createdAt: '2026-08-12T10:30:00.000Z',
      },
      {
        id: 'usr_farmer_3',
        name: 'K. Venkat Reddy',
        email: 'venkat.farmer@agrivision.in',
        phone: '+91 94401 56789',
        role: 'FARMER',
        language: 'te',
        createdAt: '2026-08-15T11:00:00.000Z',
      },
      {
        id: 'usr_officer_1',
        name: 'Dr. Ananya Sharma',
        email: 'officer.kolar@agrivision.in',
        phone: '+91 94480 11223',
        role: 'OFFICER',
        language: 'en',
        createdAt: '2026-07-01T08:00:00.000Z',
      },
      {
        id: 'usr_admin_1',
        name: 'Dr. K. Swaminathan',
        email: 'admin@agrivision.in',
        phone: '+91 99000 88776',
        role: 'ADMIN',
        language: 'en',
        createdAt: '2026-06-01T08:00:00.000Z',
      },
    ],
    farmerProfiles: [
      {
        userId: 'usr_farmer_1',
        state: 'Karnataka',
        district: 'Kolar',
        taluk: 'Srinivaspur',
        village: 'Rayalpadu',
        lat: 13.1367,
        lng: 78.1347,
        totalAcreage: 4.5,
        preferredLanguage: 'kn',
      },
      {
        userId: 'usr_farmer_2',
        state: 'Punjab',
        district: 'Ludhiana',
        taluk: 'Samrala',
        village: 'Machhiwara',
        lat: 30.9010,
        lng: 75.8573,
        totalAcreage: 12.0,
        preferredLanguage: 'hi',
      },
      {
        userId: 'usr_farmer_3',
        state: 'Andhra Pradesh',
        district: 'Guntur',
        taluk: 'Tenali',
        village: 'Angalakuduru',
        lat: 16.3067,
        lng: 80.4365,
        totalAcreage: 6.0,
        preferredLanguage: 'te',
      },
    ],
    officerProfiles: [
      {
        userId: 'usr_officer_1',
        designation: 'Assistant Director of Agriculture (ADA)',
        department: 'Department of Agriculture & Horticulture, Govt of Karnataka',
        assignedState: 'Karnataka',
        assignedDistrict: 'Kolar',
        officeLocation: 'Kolar District Administrative Complex',
      },
    ],
    farms: [
      {
        id: 'farm_kolar_1',
        farmerId: 'usr_farmer_1',
        farmerName: 'Ramesh Gowda',
        name: 'Sri Manjunatha Organic Farm',
        areaAcres: 4.5,
        lat: 13.1367,
        lng: 78.1347,
        village: 'Rayalpadu',
        taluk: 'Srinivaspur',
        district: 'Kolar',
        state: 'Karnataka',
        irrigationType: 'Drip',
        waterAvailability: 'Moderate',
        soil: {
          soilType: 'Red & Yellow',
          nitrogen: 95,
          phosphorus: 55,
          potassium: 70,
          ph: 6.5,
          organicCarbon: 0.65,
          lastTestedDate: '2026-07-20',
        },
        activeCrops: [
          {
            id: 'crop_tomato_1',
            farmId: 'farm_kolar_1',
            name: 'Tomato',
            variety: 'Arka Rakshak (F1 Hybrid)',
            sowingDate: '2026-07-05',
            expectedHarvestDate: '2026-10-15',
            season: 'Kharif',
            growthStage: 'Fruiting',
            healthScore: 86,
            areaAcres: 3.0,
            status: 'ACTIVE',
          },
          {
            id: 'crop_maize_1',
            farmId: 'farm_kolar_1',
            name: 'Maize',
            variety: 'DeKalb 9108',
            sowingDate: '2026-07-15',
            expectedHarvestDate: '2026-10-28',
            season: 'Kharif',
            growthStage: 'Vegetative',
            healthScore: 92,
            areaAcres: 1.5,
            status: 'ACTIVE',
          },
        ],
        healthScore: 86,
        riskLevel: 'MODERATE',
        createdAt: '2026-07-01T10:00:00.000Z',
      },
      {
        id: 'farm_punjab_1',
        farmerId: 'usr_farmer_2',
        farmerName: 'Harpreet Singh',
        name: 'Malwa Golden Grain Farm',
        areaAcres: 12.0,
        lat: 30.9010,
        lng: 75.8573,
        village: 'Machhiwara',
        taluk: 'Samrala',
        district: 'Ludhiana',
        state: 'Punjab',
        irrigationType: 'Canal / Flood',
        waterAvailability: 'Abundant',
        soil: {
          soilType: 'Alluvial',
          nitrogen: 110,
          phosphorus: 60,
          potassium: 55,
          ph: 7.2,
          organicCarbon: 0.58,
          lastTestedDate: '2026-06-15',
        },
        activeCrops: [
          {
            id: 'crop_wheat_1',
            farmId: 'farm_punjab_1',
            name: 'Wheat',
            variety: 'HD-3086 (Pusa Gautami)',
            sowingDate: '2026-07-10',
            expectedHarvestDate: '2026-11-20',
            season: 'Kharif',
            growthStage: 'Vegetative',
            healthScore: 91,
            areaAcres: 12.0,
            status: 'ACTIVE',
          },
        ],
        healthScore: 91,
        riskLevel: 'LOW',
        createdAt: '2026-07-05T09:00:00.000Z',
      },
      {
        id: 'farm_ap_1',
        farmerId: 'usr_farmer_3',
        farmerName: 'K. Venkat Reddy',
        name: 'Guntur Delta Spice Acreage',
        areaAcres: 6.0,
        lat: 16.3067,
        lng: 80.4365,
        village: 'Angalakuduru',
        taluk: 'Tenali',
        district: 'Guntur',
        state: 'Andhra Pradesh',
        irrigationType: 'Drip',
        waterAvailability: 'Moderate',
        soil: {
          soilType: 'Black (Regur)',
          nitrogen: 88,
          phosphorus: 48,
          potassium: 62,
          ph: 7.4,
          organicCarbon: 0.72,
          lastTestedDate: '2026-07-01',
        },
        activeCrops: [
          {
            id: 'crop_chilli_1',
            farmId: 'farm_ap_1',
            name: 'Chilli',
            variety: 'Guntur Teja (S17)',
            sowingDate: '2026-06-25',
            expectedHarvestDate: '2026-11-30',
            season: 'Kharif',
            growthStage: 'Flowering',
            healthScore: 74,
            areaAcres: 6.0,
            status: 'ACTIVE',
          },
        ],
        healthScore: 74,
        riskLevel: 'HIGH',
        createdAt: '2026-07-10T11:00:00.000Z',
      },
      {
        id: 'farm_kolar_2',
        farmerId: 'usr_farmer_1',
        farmerName: 'Venkatesh Organic Co.',
        name: 'Mulbagal Hill Plot',
        areaAcres: 3.2,
        lat: 13.1645,
        lng: 78.3951,
        village: 'Mulbagal Rural',
        taluk: 'Mulbagal',
        district: 'Kolar',
        state: 'Karnataka',
        irrigationType: 'Sprinkler',
        waterAvailability: 'Moderate',
        soil: {
          soilType: 'Red & Yellow',
          nitrogen: 90,
          phosphorus: 50,
          potassium: 65,
          ph: 6.4,
          organicCarbon: 0.60,
          lastTestedDate: '2026-06-20',
        },
        activeCrops: [
          {
            id: 'crop_tomato_2',
            farmId: 'farm_kolar_2',
            name: 'Tomato',
            variety: 'Abhinav Hybrid',
            sowingDate: '2026-07-12',
            expectedHarvestDate: '2026-10-25',
            season: 'Kharif',
            growthStage: 'Fruiting',
            healthScore: 79,
            areaAcres: 3.2,
            status: 'ACTIVE',
          },
        ],
        healthScore: 79,
        riskLevel: 'MODERATE',
        createdAt: '2026-07-15T12:00:00.000Z',
      },
    ],
    crops: [],
    diseaseDetections: [
      {
        id: 'det_init_1',
        farmId: 'farm_kolar_1',
        crop: 'Tomato',
        disease: 'Early Blight (Alternaria solani)',
        confidence: 0.94,
        severity: 'Moderate',
        detectedAt: '2026-09-02T14:22:00.000Z',
        symptoms: [
          'Concentric dark brown rings forming target-like patterns on older leaves',
          'Yellowing (chlorosis) surrounding necrotic lesions',
        ],
        recommendedActions: [
          'Immediately prune and destroy severely infected lower leaves.',
          'Apply copper hydroxide or Mancozeb (2-2.5g/L water) in early morning.',
          'Suspend overhead sprinkler watering.',
        ],
        prevention: [
          'Maintain 3-year crop rotation.',
          'Apply organic straw mulch to prevent soil splash during rain.',
        ],
        officerConsultationNeeded: false,
        explanation: 'Early blight caused by Alternaria solani was identified with 94% confidence, triggered by recent warm humid weather.',
      },
      {
        id: 'det_init_2',
        farmId: 'farm_ap_1',
        crop: 'Chilli',
        disease: 'Chilli Leaf Curl Viral Complex',
        confidence: 0.91,
        severity: 'Severe',
        detectedAt: '2026-09-03T10:15:00.000Z',
        symptoms: [
          'Upward curling, puckering, and reduction of leaf size',
          'Bushy stunted plant growth with poor fruit set',
        ],
        recommendedActions: [
          'Vector control: spray Diafenthiuron @ 1g/L for whitefly control.',
          'Uproot and bury severely infected plants.',
          'Install yellow sticky traps across the plot.',
        ],
        prevention: ['Plant border barrier rows of maize or sorghum.'],
        officerConsultationNeeded: true,
        explanation: 'Viral curl complex detected. Since systemic spread is severe, an Agriculture Officer consultation is strongly advised.',
      },
    ],
    recommendations: [],
    yieldPredictions: [],
    advisories: [
      {
        id: 'adv_init_1',
        date: '2026-09-05',
        farmId: 'farm_kolar_1',
        farmName: 'Sri Manjunatha Organic Farm',
        cropName: 'Tomato (Arka Rakshak)',
        overallHealthScore: 86,
        todayActions: {
          irrigation: {
            recommended: false,
            statusText: 'Avoid Irrigation for the next 24 Hours',
            reason: 'Heavy precipitation (24.2 mm) is expected in Kolar district. Avoid root zone saturation.',
          },
          diseaseMonitoring: {
            riskLevel: 'MODERATE',
            targetPathogen: 'Alternaria solani (Early Blight)',
            scoutingInstructions: 'Inspect lower leaves for concentric brown circular lesions before noon.',
          },
          fertilizerApplication: {
            recommended: false,
            guidance: 'Delay urea or soluble nitrogen top-dressing to prevent leaching runoff.',
          },
          fieldWork: {
            sprayWindowSafe: true,
            recommendation: 'Wind speed is 11 km/h; early morning window (6-8 AM) is safe for organic neem oil sprays.',
          },
        },
        whyExplanation: [
          'Heavy precipitation forecast of 24.2mm will satisfy crop evapotranspiration needs for 48 hours.',
          'Ambient relative humidity above 75% heightens fungal sporulation kinetics.',
          'Current soil moisture is measured at 82% of field capacity.',
        ],
      },
    ],
    hotspots: [
      {
        id: 'hotspot_kolar_tomato',
        region: 'Srinivaspur - Mulbagal Taluks',
        district: 'Kolar',
        state: 'Karnataka',
        lat: 13.1367,
        lng: 78.1347,
        radiusKm: 18,
        crop: 'Tomato',
        disease: 'Early Blight (Alternaria solani)',
        reportedCases: 8,
        riskLevel: 'HIGH',
        firstReportedDate: '2026-08-28T00:00:00.000Z',
        lastReportedDate: '2026-09-04T12:00:00.000Z',
        status: 'CONFIRMED_OUTBREAK',
        affectedFarms: ['Sri Manjunatha Organic Farm', 'Mulbagal Hill Plot', 'Gowda Farmstead', 'Venkatesh Agro'],
      },
      {
        id: 'hotspot_guntur_chilli',
        region: 'Tenali - Mangalagiri Belt',
        district: 'Guntur',
        state: 'Andhra Pradesh',
        lat: 16.3067,
        lng: 80.4365,
        radiusKm: 15,
        crop: 'Chilli',
        disease: 'Chilli Leaf Curl Viral Complex',
        reportedCases: 5,
        riskLevel: 'MODERATE',
        firstReportedDate: '2026-08-30T00:00:00.000Z',
        lastReportedDate: '2026-09-03T10:00:00.000Z',
        status: 'SUSPECTED_CLUSTER',
        affectedFarms: ['Guntur Delta Spice Acreage', 'Krishna River Plot', 'Reddy Spices'],
      },
    ],
    notifications: [
      {
        id: 'notif_1',
        userId: 'usr_farmer_1',
        type: 'HEAVY_RAIN',
        severity: 'WARNING',
        title: 'Weather Warning: Heavy Rainfall Expected (24mm)',
        message: 'Kolar taluk weather alert: Rain showers will commence this afternoon. Please avoid irrigation and clear field drainage channels.',
        createdAt: '2026-09-05T06:30:00.000Z',
        read: false,
        channel: 'IN_APP',
      },
      {
        id: 'notif_2',
        userId: 'usr_farmer_1',
        type: 'DISEASE_ALERT',
        severity: 'WARNING',
        title: 'Regional Disease Advisory: Early Blight in Kolar',
        message: 'Multiple farms in Srinivaspur reported Early Blight on Tomato. Scout your fields and spray recommended copper hydroxide if lesions appear.',
        createdAt: '2026-09-04T14:00:00.000Z',
        read: false,
        channel: 'IN_APP',
      },
      {
        id: 'notif_3',
        userId: 'usr_officer_1',
        type: 'DISEASE_ALERT',
        severity: 'CRITICAL',
        title: 'Disease Cluster Alert: 8 Farms in Kolar Reporting Tomato Blight',
        message: 'Automated geospatial cluster analysis detected an active hotspot in Srinivaspur-Mulbagal. Recommended officer inspection and localized advisory broadcast.',
        createdAt: '2026-09-04T15:30:00.000Z',
        read: false,
        channel: 'IN_APP',
      },
    ],
    modelVersions: [
      {
        id: 'mod_cv_1',
        name: 'AgriVision-ResNet50-CropVision',
        task: 'DISEASE_DETECTION',
        version: 'v2.4.1',
        architecture: 'Deep Residual Convolutional Neural Network (ResNet-50) with Transfer Learning',
        trainingDate: '2026-08-15',
        datasetSize: '54,300 curated leaf images across 14 crop classes',
        accuracy: 0.942,
        precision: 0.938,
        recall: 0.945,
        f1Score: 0.941,
        status: 'PRODUCTION',
        confusionMatrix: {
          labels: ['Early Blight', 'Late Blight', 'Leaf Spot', 'Rust', 'Blast', 'Healthy'],
          matrix: [
            [482, 12, 8, 4, 2, 6],
            [9, 465, 14, 2, 5, 8],
            [5, 11, 470, 7, 3, 4],
            [3, 2, 8, 489, 4, 2],
            [1, 6, 4, 3, 478, 8],
            [4, 5, 6, 2, 5, 492],
          ],
        },
      },
      {
        id: 'mod_rec_1',
        name: 'AgriVision-Agronomic-Ensemble-XGBoost',
        task: 'CROP_RECOMMENDATION',
        version: 'v1.8.0',
        architecture: 'Gradient Boosted Decision Trees (XGBoost + Random Forest Ensemble)',
        trainingDate: '2026-07-28',
        datasetSize: '120,000 ICAR multi-variate soil, climate & crop yield samples',
        accuracy: 0.956,
        precision: 0.951,
        recall: 0.958,
        f1Score: 0.954,
        status: 'PRODUCTION',
        confusionMatrix: {
          labels: ['Rice', 'Wheat', 'Maize', 'Cotton', 'Tomato', 'Pulses'],
          matrix: [
            [960, 8, 12, 4, 6, 10],
            [6, 972, 10, 2, 4, 6],
            [8, 11, 955, 12, 6, 8],
            [3, 4, 9, 968, 8, 8],
            [5, 7, 8, 6, 961, 13],
            [7, 5, 11, 7, 10, 960],
          ],
        },
      },
      {
        id: 'mod_yield_1',
        name: 'AgriVision-YieldNet-RidgeGBM',
        task: 'YIELD_PREDICTION',
        version: 'v3.1.2',
        architecture: 'Bayesian Regularized Gradient Boosting Regressor with Weather Lag Features',
        trainingDate: '2026-08-02',
        datasetSize: '25-year historical district agro-yield dataset (Directorate of Economics and Statistics)',
        accuracy: 0.918,
        precision: 0.912,
        recall: 0.923,
        f1Score: 0.917,
        status: 'PRODUCTION',
        confusionMatrix: {
          labels: ['Yield Bucket < 2 t/ha', 'Yield Bucket 2-4 t/ha', 'Yield Bucket > 4 t/ha'],
          matrix: [
            [420, 28, 6],
            [22, 445, 19],
            [5, 21, 452],
          ],
        },
      },
    ],
    auditLogs: [
      {
        id: 'log_1',
        timestamp: '2026-09-05T01:00:00.000Z',
        userEmail: 'system@agrivision.in',
        action: 'SYSTEM_BOOTSTRAP',
        entity: 'Database',
        details: 'AgriVision AI production database initialized with SIH benchmark seed records.',
      },
      {
        id: 'log_2',
        timestamp: '2026-09-04T15:30:00.000Z',
        userEmail: 'system@agrivision.in',
        action: 'HOTSPOT_DETECTION',
        entity: 'SpatioTemporalCluster',
        details: 'Automated detection flagged 8 Early Blight cases within 18km radius in Kolar, Karnataka.',
      },
    ],
    farmerSupportTickets: [
      {
        id: 'tkt_101',
        ticketNumber: 'KS-2026-0841',
        farmerId: 'usr_farmer_1',
        farmerName: 'Ramesh Gowda',
        farmerPhone: '+91 98451 23456',
        district: 'Kolar',
        taluk: 'Srinivaspur',
        village: 'Rayalpadu',
        lat: 13.1367,
        lng: 78.1347,
        crop: 'Tomato',
        variety: 'Arka Rakshak',
        affectedAcreage: 1.8,
        category: 'CROP_DAMAGE_COMPENSATION',
        title: 'Continuous Heavy Downpour & Early Blight Foliar Decay',
        description: 'Severe waterlogging caused rapid spread of concentric dark lesions on leaves and stem girdling. Estimated 60% crop foliage affected across 1.8 acres.',
        imageUrl: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=600&auto=format&fit=crop&q=60',
        severity: 'SEVERE',
        status: 'APPROVED_RESOLVED',
        createdAt: '2026-09-03T11:20:00.000Z',
        officerResponse: {
          officerId: 'usr_officer_1',
          officerName: 'Dr. Ananya Sharma',
          designation: 'Assistant Director of Agriculture (ADA)',
          department: 'Department of Agriculture, Govt. of Karnataka',
          officialStampNumber: 'KA-AGRI-KLR-2026/049',
          diagnosisAndAction: 'Verified via GIS radar & field photograph: Phytophthora/Alternaria blight complex triggered by 72-hour moisture saturation. Recommended immediate trench drainage and authorized PMFBY compensation relief.',
          prescribedFormulation: 'Spray Metalaxyl 8% + Mancozeb 64% WP (Ridomil MZ) @ 2.5g/L water on next clear morning. Drench roots with Trichoderma harzianum @ 10g/L.',
          scheduledVisitDate: '2026-09-06 (10:30 AM)',
          pmfbyApprovedReliefAmount: 24500,
          respondedAt: '2026-09-04T09:45:00.000Z',
        },
      },
      {
        id: 'tkt_102',
        ticketNumber: 'KS-2026-0894',
        farmerId: 'usr_farmer_2',
        farmerName: 'Harpreet Singh',
        farmerPhone: '+91 98765 43210',
        district: 'Ludhiana',
        taluk: 'Samrala',
        village: 'Machhiwara',
        lat: 30.901,
        lng: 75.8573,
        crop: 'Wheat',
        variety: 'PBW-826',
        affectedAcreage: 3.5,
        category: 'PEST_DISEASE_EMERGENCY',
        title: 'Yellow Rust Early Warning Detected on Flag Leaves',
        description: 'Noticed linear yellow pustules arranged like stripes on upper leaves. Spreading fast due to cool misty mornings.',
        imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=60',
        severity: 'MODERATE',
        status: 'FIELD_VISIT_SCHEDULED',
        createdAt: '2026-09-04T14:10:00.000Z',
        officerResponse: {
          officerId: 'usr_officer_1',
          officerName: 'Dr. Gurpreet K. Brar',
          designation: 'Block Agricultural Development Officer (ADO)',
          department: 'Dept. of Agriculture & Farmers Welfare, Punjab',
          officialStampNumber: 'PB-AGRI-LDH-2026/112',
          diagnosisAndAction: 'Puccinia striiformis (Stripe Rust) early phase. Field surveillance unit scheduled to inspect plot. Strict preventive containment ordered.',
          prescribedFormulation: 'Foliar spray of Propiconazole 25% EC (Tilt) @ 1 ml/L or Tebuconazole 25.9% EC @ 1.2 ml/L with 200 L water/acre.',
          scheduledVisitDate: '2026-09-07 (02:00 PM)',
          respondedAt: '2026-09-04T16:30:00.000Z',
        },
      },
    ],
    subsidizedInputSchemes: [
      {
        id: 'sch_seed_01',
        schemeName: 'NFSM Subsidized High-Yield Certified Arka Rakshak F1 Tomato Seeds',
        category: 'CERTIFIED_SEEDS',
        crop: 'Tomato',
        originalPrice: 1600,
        subsidizedPrice: 800,
        subsidyPercent: 50,
        totalQuotaBags: 600,
        availableQuotaBags: 342,
        distributionCenter: 'Raitha Samparka Kendra (RSK), Srinivaspur Road, Kolar',
        eligibleDistricts: ['Kolar', 'Chikkaballapur', 'Bengaluru Rural'],
        authorizedByOfficer: 'Dr. Ananya Sharma, ADA',
        validUntil: '2026-10-31',
        isActive: true,
        createdAt: '2026-08-20T08:00:00.000Z',
      },
      {
        id: 'sch_nano_02',
        schemeName: 'PM-PRANAM Subsidized IFFCO Nano Urea Liquid (500ml Bottle)',
        category: 'NANO_FERTILIZERS',
        crop: 'All Crops (Cereals & Horticulture)',
        originalPrice: 450,
        subsidizedPrice: 225,
        subsidyPercent: 50,
        totalQuotaBags: 1500,
        availableQuotaBags: 890,
        distributionCenter: 'Central Krishi Seva Kendra, District Agriculture Office, Kolar',
        eligibleDistricts: ['Kolar', 'Ludhiana', 'Guntur', 'All Districts'],
        authorizedByOfficer: 'State Agriculture Commission',
        validUntil: '2026-11-30',
        isActive: true,
        createdAt: '2026-08-15T08:00:00.000Z',
      },
      {
        id: 'sch_bio_03',
        schemeName: 'ICAR-IIHR Certified Trichoderma Harzianum Bio-Fungicide Quota',
        category: 'BIO_PESTICIDES',
        crop: 'Tomato / Chilli / Pulses',
        originalPrice: 320,
        subsidizedPrice: 0,
        subsidyPercent: 100,
        totalQuotaBags: 450,
        availableQuotaBags: 215,
        distributionCenter: 'Raitha Samparka Kendra (RSK) Taluk Office, Malur',
        eligibleDistricts: ['Kolar', 'Chikkaballapur'],
        authorizedByOfficer: 'Dr. Ananya Sharma, ADA',
        validUntil: '2026-09-30',
        isActive: true,
        createdAt: '2026-08-25T08:00:00.000Z',
      },
      {
        id: 'sch_seed_04',
        schemeName: 'PAU Certified PBW-826 High-Resistance Wheat Seed Bags (40kg)',
        category: 'CERTIFIED_SEEDS',
        crop: 'Wheat',
        originalPrice: 2400,
        subsidizedPrice: 1440,
        subsidyPercent: 40,
        totalQuotaBags: 800,
        availableQuotaBags: 512,
        distributionCenter: 'PUNSEED Center, Main Grain Market, Ludhiana',
        eligibleDistricts: ['Ludhiana', 'Jalandhar', 'Patiala'],
        authorizedByOfficer: 'Dr. Gurpreet K. Brar, ADO',
        validUntil: '2026-11-15',
        isActive: true,
        createdAt: '2026-08-28T08:00:00.000Z',
      },
    ],
    farmerQuotaTokens: [
      {
        id: 'tok_881',
        tokenCode: 'RSK-KLR-8821',
        schemeId: 'sch_seed_01',
        schemeName: 'NFSM Subsidized High-Yield Certified Arka Rakshak F1 Tomato Seeds',
        farmerId: 'usr_farmer_1',
        farmerName: 'Ramesh Gowda',
        farmerPhone: '+91 98451 23456',
        farmerAadhaarLast4: '4289',
        quantityBooked: 2,
        amountPayable: 1600,
        distributionCenter: 'Raitha Samparka Kendra (RSK), Srinivaspur Road, Kolar',
        status: 'RESERVED',
        generatedAt: '2026-09-04T10:15:00.000Z',
      },
    ],
    irrigationRecords: [],
    cropCalendarTasks: [],
    farmDiaryEntries: [],
    expenses: [],
    markets: [
      { id: 'mkt_1', name: 'APMC Kolar', state: 'Karnataka', district: 'Kolar', lat: 13.1367, lng: 78.1347 },
      { id: 'mkt_2', name: 'APMC Mulbagal', state: 'Karnataka', district: 'Kolar', lat: 13.1645, lng: 78.3951 },
      { id: 'mkt_3', name: 'APMC Yeshwanthpur', state: 'Karnataka', district: 'Bengaluru', lat: 13.0285, lng: 77.5505 }
    ],
    marketPrices: [
      { id: 'mp_1', marketId: 'mkt_1', cropName: 'Tomato', minPrice: 1800, maxPrice: 2200, avgPrice: 2000, date: '2026-09-05' },
      { id: 'mp_2', marketId: 'mkt_2', cropName: 'Tomato', minPrice: 1750, maxPrice: 2150, avgPrice: 1950, date: '2026-09-05' },
      { id: 'mp_3', marketId: 'mkt_1', cropName: 'Chilli', minPrice: 8500, maxPrice: 11000, avgPrice: 9500, date: '2026-09-05' },
      { id: 'mp_4', marketId: 'mkt_3', cropName: 'Tomato', minPrice: 1900, maxPrice: 2300, avgPrice: 2100, date: '2026-09-05' },
    ],
    marketplaceProducts: [
      { id: 'prod_1', sellerId: 'seller_1', name: 'Arka Rakshak Tomato Seeds (50g)', category: 'Seeds', price: 450, stock: 150, images: ['https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=200&h=200&fit=crop'], description: 'High yielding F1 hybrid.' },
      { id: 'prod_2', sellerId: 'seller_2', name: 'Neem Oil Organic Pesticide (1L)', category: 'Pesticides', price: 320, stock: 45, images: ['https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?w=200&h=200&fit=crop'], description: 'Cold-pressed organic neem oil.' },
      { id: 'prod_3', sellerId: 'seller_3', name: 'Water Soluble NPK 19:19:19 (1kg)', category: 'Fertilizers', price: 180, stock: 200, images: ['https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=200&h=200&fit=crop'], description: 'Water soluble complex fertilizer.' },
    ],
    insurancePolicies: [],
    equipment: [
      { id: 'eq_1', providerId: 'usr_farmer_2', ownerId: 'usr_farmer_2', createdById: 'usr_farmer_2', ownerRole: 'FARMER', createdBy: 'Harpreet Singh', ownerName: 'Harpreet Singh', name: 'Mahindra 575 DI Tractor', category: 'Tractor', pricePerDay: 1200, hourlyRate: 250, lat: 30.9010, lng: 75.8573, available: true, description: 'Reliable tractor for field preparation and transport.', locationName: 'Ludhiana', fuelType: 'Diesel', power: '45 HP', modelYear: 2023, securityDeposit: 2400, deliveryAvailable: true, verifiedOwner: true, minimumDays: 1, specifications: ['Fuel efficient', 'Good for wetland use'] },
      { id: 'eq_2', providerId: 'usr_farmer_1', ownerId: 'usr_farmer_1', createdById: 'usr_farmer_1', ownerRole: 'FARMER', createdBy: 'Ramesh Gowda', ownerName: 'Ramesh Gowda', name: 'STIHL Petrol Brushcutter', category: 'Hand Tool', pricePerDay: 400, hourlyRate: 90, lat: 13.1367, lng: 78.1347, available: true, description: 'Compact brush cutter for orchard and field maintenance.', locationName: 'Kolar', fuelType: 'Petrol', power: '1.2 HP', modelYear: 2022, securityDeposit: 800, deliveryAvailable: false, verifiedOwner: true, minimumDays: 1, specifications: ['Low vibration', 'Ideal for field edges'] },
    ],
    rentalRequests: [],
    orders: [],
    expertConsultations: [],
    communityPosts: [],
    cropListings: [],
    storageFacilities: [],
    farmDocuments: [
      {
        id: 'doc_seed_1',
        userId: 'usr_farmer_1',
        name: 'RTC Pahani',
        documentType: 'rtc_pahani',
        type: 'rtc_pahani',
        category: 'land',
        purpose: 'Land verification',
        notes: 'Baseline land record for scheme applications.',
        sizeKb: 640,
        mimeType: 'application/pdf',
        addedOn: '2026-08-12T09:00:00.000Z',
        expiresOn: '2026-12-31',
        status: 'verified',
        url: '/uploads/demo/rtc-pahani.pdf',
        fileUrl: '/uploads/demo/rtc-pahani.pdf',
      },
      {
        id: 'doc_seed_2',
        userId: 'usr_farmer_1',
        name: 'Soil Health Card',
        documentType: 'soil_health_card',
        type: 'soil_health_card',
        category: 'agriculture',
        purpose: 'Seasonal crop planning',
        notes: 'Used for fertilizer planning and subsidy eligibility.',
        sizeKb: 420,
        mimeType: 'application/pdf',
        addedOn: '2026-08-25T12:00:00.000Z',
        expiresOn: '2026-11-30',
        status: 'pending',
        url: '/uploads/demo/soil-health-card.pdf',
        fileUrl: '/uploads/demo/soil-health-card.pdf',
      },
    ],
  };
}

class DatabaseService {
  public data: DatabaseSchema;
  private sqlite: DatabaseSync;

  constructor() {
    this.sqlite = new DatabaseSync(SQLITE_DB_FILE);
    this.sqlite.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
    this.initializeSqliteSchema();
    this.data = this.loadData();
  }

  private initializeSqliteSchema(): void {
    const createTableSql = SQLITE_TABLES.map(tableName => `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id TEXT PRIMARY KEY,
        payload_json TEXT NOT NULL
      )
    `);

    this.sqlite.exec(createTableSql.join(';'));
  }

  private getEmptyDatabaseShape(): DatabaseSchema {
    const seed = getInitialSeedData();
    return {
      ...seed,
      users: [],
      farmerProfiles: [],
      officerProfiles: [],
      farms: [],
      crops: [],
      farmDocuments: [],
      diseaseDetections: [],
      recommendations: [],
      yieldPredictions: [],
      advisories: [],
      hotspots: [],
      notifications: [],
      modelVersions: [],
      auditLogs: [],
      farmerSupportTickets: [],
      subsidizedInputSchemes: [],
      farmerQuotaTokens: [],
      irrigationRecords: [],
      cropCalendarTasks: [],
      farmDiaryEntries: [],
      expenses: [],
      markets: [],
      marketPrices: [],
      marketplaceProducts: [],
      insurancePolicies: [],
      equipment: [],
      rentalRequests: [],
      orders: [],
      expertConsultations: [],
      communityPosts: [],
      cropListings: [],
      storageFacilities: [],
    };
  }

  private readSqliteData(): DatabaseSchema | null {
    const base = this.getEmptyDatabaseShape();
    let hasRows = false;

    for (const tableName of SQLITE_TABLES) {
      try {
        const rows = this.sqlite.prepare(`SELECT id, payload_json FROM ${tableName}`).all() as Array<{ id: string; payload_json: string }>;
        if (!rows || rows.length === 0) continue;

        hasRows = true;
        const values = rows
          .map(row => {
            try {
              return JSON.parse(row.payload_json);
            } catch {
              return null;
            }
          })
          .filter(Boolean) as any[];

        (base as any)[tableName] = values;
      } catch (error) {
        console.warn(`Failed to query SQLite table ${tableName}:`, error);
      }
    }

    return hasRows ? base : null;
  }

  private syncDatabaseFromMemory(dataToSave: DatabaseSchema = this.data): void {
    try {
      for (const tableName of SQLITE_TABLES) {
        this.sqlite.exec(`DELETE FROM ${tableName};`);
        const rows = (dataToSave as any)[tableName] ?? [];
        const insertSql = `INSERT INTO ${tableName} (id, payload_json) VALUES (?, ?)`;
        const stmt = this.sqlite.prepare(insertSql);

        for (const row of rows) {
          const rowId = row?.id ?? `${tableName}_${Math.random().toString(36).slice(2, 10)}`;
          stmt.run(rowId, JSON.stringify(row));
        }
      }
    } catch (error) {
      console.error('Error synchronizing SQLite database:', error);
    }
  }

  private loadData(): DatabaseSchema {
    const sqliteData = this.readSqliteData();
    if (sqliteData) {
      return sqliteData;
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        const seed = getInitialSeedData();
        if (!parsed.farmerSupportTickets) parsed.farmerSupportTickets = seed.farmerSupportTickets;
        if (!parsed.subsidizedInputSchemes) parsed.subsidizedInputSchemes = seed.subsidizedInputSchemes;
        if (!parsed.farmerQuotaTokens) parsed.farmerQuotaTokens = seed.farmerQuotaTokens;
        if (!parsed.marketPrices) parsed.marketPrices = seed.marketPrices;
        if (!parsed.marketplaceProducts) parsed.marketplaceProducts = seed.marketplaceProducts;
        if (!parsed.equipment) parsed.equipment = seed.equipment;
        if (!parsed.markets) parsed.markets = seed.markets;
        if (!parsed.farmDocuments) parsed.farmDocuments = seed.farmDocuments;
        this.syncDatabaseFromMemory(parsed);
        return parsed;
      } catch (err) {
        console.warn('Failed to parse existing db file, initializing seed:', err);
      }
    }

    const initial = getInitialSeedData();
    this.syncDatabaseFromMemory(initial);
    this.saveData(initial);
    return initial;
  }

  public saveData(dataToSave: DatabaseSchema = this.data): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error persisting database to disk:', err);
    }

    try {
      this.syncDatabaseFromMemory(dataToSave);
    } catch (err) {
      console.error('Error persisting database to SQLite:', err);
    }
  }

  // --- USERS & AUTH ---
  public getAllUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserByPhone(phone: string): User | undefined {
    const normalized = phone.replace(/\D/g, '');
    return this.data.users.find(u => u.phone.replace(/\D/g, '') === normalized);
  }

  public registerUser(userData: {
    name: string;
    email: string;
    phone: string;
    role?: 'FARMER' | 'OFFICER' | 'ADMIN';
    language?: IndianLanguage;
    passwordHash?: string;
    status?: AccountStatus;
  }): User {
    const existing = this.getUserByEmail(userData.email);
    if (existing) {
      return existing;
    }
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      role: userData.role || 'FARMER',
      language: userData.language || 'en',
      createdAt: new Date().toISOString(),
      passwordHash: userData.passwordHash,
      status: userData.status || 'REGISTERED',
    };
    this.data.users.push(newUser);
    this.addAuditLog(newUser.email, 'USER_REGISTRATION', 'User', `Registered new ${newUser.role} account.`);
    this.saveData();
    return newUser;
  }

  public updateUserAuth(userId: string, updates: { passwordHash?: string; status?: AccountStatus; verifiedAt?: string }): User | undefined {
    const user = this.getUserById(userId);
    if (!user) return undefined;
    Object.assign(user, updates);
    this.saveData();
    return user;
  }

  public updateUserLanguage(userId: string, language: IndianLanguage): User | undefined {
    const user = this.getUserById(userId);
    if (user) {
      user.language = language;
      this.saveData();
    }
    return user;
  }

  // --- FARMER PROFILES & ONBOARDING ---
  public saveFarmerProfile(profile: FarmerProfile): FarmerProfile {
    const idx = this.data.farmerProfiles.findIndex(p => p.userId === profile.userId);
    if (idx >= 0) {
      this.data.farmerProfiles[idx] = profile;
    } else {
      this.data.farmerProfiles.push(profile);
    }
    this.saveData();
    return profile;
  }

  public getFarmerProfile(userId: string): FarmerProfile | undefined {
    return this.data.farmerProfiles.find(p => p.userId === userId);
  }

  public saveOfficerProfile(profile: OfficerProfile): OfficerProfile {
    const idx = this.data.officerProfiles.findIndex(p => p.userId === profile.userId);
    if (idx >= 0) {
      this.data.officerProfiles[idx] = profile;
    } else {
      this.data.officerProfiles.push(profile);
    }
    this.saveData();
    return profile;
  }

  public getOfficerProfile(userId: string): OfficerProfile | undefined {
    return this.data.officerProfiles.find(p => p.userId === userId);
  }

  public completeFarmerOnboarding(data: {
    userId: string;
    name: string;
    email: string;
    phone: string;
    language: IndianLanguage;
    state: string;
    district: string;
    taluk: string;
    village: string;
    lat: number;
    lng: number;
    farmName: string;
    farmArea: number;
    soilType: 'Alluvial' | 'Black (Regur)' | 'Red & Yellow' | 'Laterite' | 'Sandy Loam' | 'Clay';
    irrigationType: 'Drip' | 'Sprinkler' | 'Canal / Flood' | 'Rainfed' | 'Borewell';
    waterAvailability: 'Abundant' | 'Moderate' | 'Scarse' | 'Seasonal';
    cropName: string;
    variety: string;
    sowingDate: string;
    expectedHarvestDate: string;
    season: 'Kharif' | 'Rabi' | 'Zaid';
  }): { user: User; farm: Farm } {
    let user = this.getUserById(data.userId);
    if (!user) {
      user = this.registerUser({
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: 'FARMER',
        language: data.language,
      });
    }

    const farmerProfile: FarmerProfile = {
      userId: user.id,
      state: data.state,
      district: data.district,
      taluk: data.taluk,
      village: data.village,
      lat: data.lat,
      lng: data.lng,
      totalAcreage: data.farmArea,
      preferredLanguage: data.language,
    };
    this.saveFarmerProfile(farmerProfile);

    const newFarm: Farm = {
      id: `farm_${Date.now()}`,
      farmerId: user.id,
      farmerName: user.name,
      name: data.farmName,
      areaAcres: data.farmArea,
      lat: data.lat,
      lng: data.lng,
      village: data.village,
      taluk: data.taluk,
      district: data.district,
      state: data.state,
      irrigationType: data.irrigationType,
      waterAvailability: data.waterAvailability,
      soil: {
        soilType: data.soilType,
        nitrogen: 90,
        phosphorus: 50,
        potassium: 65,
        ph: 6.5,
        organicCarbon: 0.62,
        lastTestedDate: new Date().toISOString().split('T')[0],
      },
      activeCrops: [
        {
          id: `crop_${Date.now()}`,
          farmId: `farm_${Date.now()}`,
          name: data.cropName,
          variety: data.variety,
          sowingDate: data.sowingDate,
          expectedHarvestDate: data.expectedHarvestDate,
          season: data.season,
          growthStage: 'Vegetative',
          healthScore: 90,
          areaAcres: data.farmArea,
          status: 'ACTIVE',
        },
      ],
      healthScore: 90,
      riskLevel: 'LOW',
      createdAt: new Date().toISOString(),
    };

    this.data.farms.push(newFarm);
    this.addAuditLog(user.email, 'ONBOARDING_COMPLETED', 'Farm', `Created farm ${newFarm.name} with crop ${data.cropName}.`);
    this.saveData();

    return { user, farm: newFarm };
  }

  // --- FARMS ---
  public getAllFarms(): Farm[] {
    return this.data.farms;
  }

  public getFarmsByFarmer(farmerId: string): Farm[] {
    return this.data.farms.filter(f => f.farmerId === farmerId);
  }

  public getFarmById(id: string): Farm | undefined {
    return this.data.farms.find(f => f.id === id);
  }

  public createFarm(farmData: Omit<Farm, 'id' | 'createdAt'>): Farm {
    const farm: Farm = {
      ...farmData,
      id: `farm_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.data.farms.push(farm);
    this.saveData();
    return farm;
  }

  public addCropToFarm(farmId: string, cropData: Omit<Crop, 'id' | 'farmId'>): Crop | undefined {
    const farm = this.getFarmById(farmId);
    if (!farm) return undefined;

    const newCrop: Crop = {
      ...cropData,
      id: `crop_${Date.now()}`,
      farmId,
    };
    farm.activeCrops.push(newCrop);
    this.saveData();
    return newCrop;
  }

  // --- FARM DOCUMENTS ---
  public getFarmDocumentsByUser(userId: string): FarmDocumentRecord[] {
    return [...this.data.farmDocuments]
      .filter(doc => doc.userId === userId)
      .sort((a, b) => new Date(b.addedOn).getTime() - new Date(a.addedOn).getTime());
  }

  public saveFarmDocument(document: Partial<FarmDocumentRecord> & { userId: string; name: string; documentType: string; category: string }): FarmDocumentRecord {
    const saved: FarmDocumentRecord = {
      id: document.id || `doc_${Date.now()}`,
      userId: document.userId,
      name: document.name,
      documentType: document.documentType,
      type: document.type || document.documentType,
      category: document.category,
      purpose: document.purpose || 'Farm record',
      notes: document.notes || '',
      sizeKb: Number(document.sizeKb ?? 0),
      mimeType: document.mimeType || 'application/octet-stream',
      addedOn: document.addedOn || new Date().toISOString(),
      expiresOn: document.expiresOn ?? null,
      status: document.status || 'pending',
      url: document.url,
      fileUrl: document.fileUrl,
      pinned: Boolean(document.pinned),
      important: Boolean(document.important),
      originalName: document.originalName || document.name,
    };

    const existingIndex = this.data.farmDocuments.findIndex(doc => String(doc.id) === String(saved.id));
    if (existingIndex >= 0) {
      this.data.farmDocuments[existingIndex] = saved;
    } else {
      this.data.farmDocuments.unshift(saved);
    }
    this.saveData();
    return saved;
  }

  public updateFarmDocument(id: string | number, updates: Partial<FarmDocumentRecord>): FarmDocumentRecord | undefined {
    const doc = this.data.farmDocuments.find(item => String(item.id) === String(id));
    if (!doc) return undefined;
    Object.assign(doc, updates, {
      updatedAt: new Date().toISOString(),
    });
    this.saveData();
    return doc;
  }

  public deleteFarmDocument(id: string | number): boolean {
    const before = this.data.farmDocuments.length;
    this.data.farmDocuments = this.data.farmDocuments.filter(doc => String(doc.id) !== String(id));
    this.saveData();
    return this.data.farmDocuments.length !== before;
  }

  // --- DISEASE DETECTIONS ---
  public saveDiseaseDetection(result: DiseaseDetectionResult): DiseaseDetectionResult {
    const normalized: DiseaseDetectionResult = {
      ...result,
      id: result.id || `det_${Date.now()}`,
      detectedAt: result.detectedAt || new Date().toISOString(),
      severity: result.severity || 'Unknown',
      crop: result.crop || 'Unknown',
      disease: result.disease || 'Unknown',
      confidence: Number(result.confidence ?? 0),
    };

    this.data.diseaseDetections.unshift(normalized);
    if (normalized.severity === 'Severe') {
      this.createNotification({
        userId: normalized.userId || 'usr_farmer_1',
        type: 'DISEASE_ALERT',
        severity: 'CRITICAL',
        title: `Severe Disease Alert: ${normalized.disease}`,
        message: `High risk detected in ${normalized.crop}. Immediate IPM action required. Consult your local agriculture officer.`,
        channel: 'IN_APP',
      });
    }
    this.saveData();
    return normalized;
  }

  public getAllDiseaseDetections(): DiseaseDetectionResult[] {
    return this.data.diseaseDetections;
  }

  public getDetectionsByFarm(farmId: string): DiseaseDetectionResult[] {
    return this.data.diseaseDetections.filter(d => d.farmId === farmId);
  }

  // --- RECOMMENDATIONS & YIELD ---
  public saveCropRecommendation(userId: string, input: any, results: CropRecommendationItem[]) {
    const entry = {
      id: `rec_${Date.now()}`,
      userId,
      input,
      results,
      createdAt: new Date().toISOString(),
    };
    this.data.recommendations.unshift(entry);
    this.saveData();
    return entry;
  }

  public saveYieldPrediction(userId: string, input: any, result: YieldPredictionResult) {
    const entry = {
      id: `yield_${Date.now()}`,
      userId,
      input,
      result,
      createdAt: new Date().toISOString(),
    };
    this.data.yieldPredictions.unshift(entry);
    this.saveData();
    return entry;
  }

  // --- ADVISORIES ---
  public getAdvisories(): DailyAdvisory[] {
    return this.data.advisories;
  }

  public getAdvisoryByFarm(farmId: string): DailyAdvisory | undefined {
    return this.data.advisories.find(a => a.farmId === farmId) || this.data.advisories[0];
  }

  public saveAdvisory(advisory: DailyAdvisory): DailyAdvisory {
    const idx = this.data.advisories.findIndex(a => a.farmId === advisory.farmId);
    if (idx >= 0) {
      this.data.advisories[idx] = advisory;
    } else {
      this.data.advisories.unshift(advisory);
    }
    this.saveData();
    return advisory;
  }

  // --- HOTSPOTS & CLUSTERS ---
  public getHotspots(): DiseaseHotspot[] {
    return this.data.hotspots;
  }

  public addHotspot(hotspot: DiseaseHotspot): DiseaseHotspot {
    this.data.hotspots.unshift(hotspot);
    this.saveData();
    return hotspot;
  }

  // --- NOTIFICATIONS ---
  public getNotifications(userId?: string): NotificationItem[] {
    if (!userId) return this.data.notifications;
    return this.data.notifications.filter(n => n.userId === userId || n.userId === 'all');
  }

  public createNotification(notif: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>): NotificationItem {
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    this.data.notifications.unshift(newNotif);
    this.saveData();
    return newNotif;
  }

  public markNotificationRead(id: string): boolean {
    const n = this.data.notifications.find(item => item.id === id);
    if (n) {
      n.read = true;
      this.saveData();
      return true;
    }
    return false;
  }

  // --- ML MODELS REGISTRY ---
  public getModelVersions(): MLModelVersion[] {
    return this.data.modelVersions;
  }

  // --- AUDIT LOGS ---
  public addAuditLog(userEmail: string, action: string, entity: string, details: string): SystemAuditLog {
    const log: SystemAuditLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userEmail,
      action,
      entity,
      details,
    };
    this.data.auditLogs.unshift(log);
    if (this.data.auditLogs.length > 200) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 200);
    }
    this.saveData();
    return log;
  }

  public getAuditLogs(): SystemAuditLog[] {
    return this.data.auditLogs;
  }

  // --- SIH IMPACT STATS ---
  public getSystemImpactAnalytics() {
    const totalFarmers = this.data.users.filter(u => u.role === 'FARMER').length;
    const totalFarms = this.data.farms.length;
    const totalAcreage = this.data.farms.reduce((acc, f) => acc + (f.areaAcres || 0), 0);
    const diseasesDiagnosed = this.data.diseaseDetections.length;
    const activeHotspots = this.data.hotspots.filter(h => h.status !== 'CONTAINED').length;
    const advisoriesIssued = this.data.advisories.length + 42; // cumulative
    // Estimated financial crop loss prevented in INR (based on ICAR standard saving: ~₹18,000/acre upon early blight interception)
    const estimatedLossesPreventedInr = Math.round(totalAcreage * 18500 * (diseasesDiagnosed > 0 ? 1.2 : 0.8));

    return {
      totalFarmers,
      totalFarms,
      totalHectaresMonitored: Number((totalAcreage * 0.404686).toFixed(1)),
      totalAcreage: Number(totalAcreage.toFixed(1)),
      diseasesDiagnosed,
      activeHotspots,
      advisoriesIssued,
      estimatedLossesPreventedInr,
      highRiskFarmsCount: this.data.farms.filter(f => f.riskLevel === 'HIGH').length,
    };
  }

  // --- AGRICULTURE OFFICER & FARMER INTERACTION SERVICES ---
  public getFarmerTickets(farmerId?: string): FarmerSupportTicket[] {
    if (farmerId) {
      return this.data.farmerSupportTickets.filter(t => t.farmerId === farmerId);
    }
    return this.data.farmerSupportTickets;
  }

  public getTicketById(id: string): FarmerSupportTicket | undefined {
    return this.data.farmerSupportTickets.find(t => t.id === id);
  }

  public createFarmerTicket(ticketData: Omit<FarmerSupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'status'>): FarmerSupportTicket {
    const count = this.data.farmerSupportTickets.length + 1;
    const pad = count.toString().padStart(4, '0');
    const newTicket: FarmerSupportTicket = {
      ...ticketData,
      id: `tkt_${Date.now()}`,
      ticketNumber: `KS-2026-${pad}`,
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
    };
    this.data.farmerSupportTickets.unshift(newTicket);
    this.addAuditLog(ticketData.farmerName, 'TICKET_CREATED', 'FarmerSupportTicket', `Raised ticket ${newTicket.ticketNumber} for ${ticketData.crop} (${ticketData.category})`);
    this.saveData();
    return newTicket;
  }

  public resolveFarmerTicket(
    ticketId: string,
    officerResponse: FarmerSupportTicket['officerResponse'],
    nextStatus: FarmerSupportTicket['status'] = 'APPROVED_RESOLVED'
  ): FarmerSupportTicket | null {
    const ticket = this.data.farmerSupportTickets.find(t => t.id === ticketId);
    if (!ticket) return null;

    ticket.officerResponse = officerResponse;
    ticket.status = nextStatus;
    this.addAuditLog(
      officerResponse?.officerName || 'Officer',
      'TICKET_RESOLVED',
      'FarmerSupportTicket',
      `Resolved ticket ${ticket.ticketNumber} with status ${nextStatus}`
    );

    // Also push an in-app notification to the farmer
    const notification: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: ticket.farmerId,
      type: 'OFFICER_ADVISORY',
      severity: nextStatus === 'APPROVED_RESOLVED' ? 'INFO' : 'WARNING',
      title: `Official Agriculture Officer Resolution: ${ticket.ticketNumber}`,
      message: `${officerResponse?.officerName} (${officerResponse?.designation}) has issued official resolution & prescription for your ${ticket.crop} field.`,
      createdAt: new Date().toISOString(),
      read: false,
      channel: 'IN_APP',
    };
    this.data.notifications.unshift(notification);

    this.saveData();
    return ticket;
  }

  public getSubsidizedSchemes(district?: string): SubsidizedAgriInputScheme[] {
    if (!district || district === 'All Districts') {
      return this.data.subsidizedInputSchemes;
    }
    return this.data.subsidizedInputSchemes.filter(
      s => s.eligibleDistricts.includes('All Districts') || s.eligibleDistricts.some(d => d.toLowerCase() === district.toLowerCase())
    );
  }

  public createSubsidizedScheme(schemeData: Omit<SubsidizedAgriInputScheme, 'id' | 'createdAt'>): SubsidizedAgriInputScheme {
    const newScheme: SubsidizedAgriInputScheme = {
      ...schemeData,
      id: `sch_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.data.subsidizedInputSchemes.unshift(newScheme);
    this.addAuditLog(schemeData.authorizedByOfficer, 'SCHEME_CREATED', 'SubsidizedAgriInputScheme', `Allocated new quota: ${schemeData.schemeName} (${schemeData.totalQuotaBags} units)`);
    this.saveData();
    return newScheme;
  }

  public claimQuotaToken(tokenInput: {
    schemeId: string;
    farmerId: string;
    farmerName: string;
    farmerPhone: string;
    farmerAadhaarLast4: string;
    quantityBooked: number;
  }): { token: FarmerQuotaToken; scheme: SubsidizedAgriInputScheme } | { error: string } {
    const scheme = this.data.subsidizedInputSchemes.find(s => s.id === tokenInput.schemeId);
    if (!scheme) return { error: 'Scheme not found' };
    if (!scheme.isActive) return { error: 'This subsidized scheme is currently inactive' };
    if (scheme.availableQuotaBags < tokenInput.quantityBooked) {
      return { error: `Only ${scheme.availableQuotaBags} units remaining in quota` };
    }

    scheme.availableQuotaBags -= tokenInput.quantityBooked;

    const tokenCode = `RSK-${Math.floor(1000 + Math.random() * 9000)}`;
    const token: FarmerQuotaToken = {
      id: `tok_${Date.now()}`,
      tokenCode,
      schemeId: scheme.id,
      schemeName: scheme.schemeName,
      farmerId: tokenInput.farmerId,
      farmerName: tokenInput.farmerName,
      farmerPhone: tokenInput.farmerPhone,
      farmerAadhaarLast4: tokenInput.farmerAadhaarLast4,
      quantityBooked: tokenInput.quantityBooked,
      amountPayable: scheme.subsidizedPrice * tokenInput.quantityBooked,
      distributionCenter: scheme.distributionCenter,
      status: 'RESERVED',
      generatedAt: new Date().toISOString(),
    };

    this.data.farmerQuotaTokens.unshift(token);
    this.addAuditLog(tokenInput.farmerName, 'TOKEN_CLAIMED', 'FarmerQuotaToken', `Generated RSK token ${tokenCode} for ${scheme.schemeName}`);
    this.saveData();

    return { token, scheme };
  }

  public getFarmerTokens(farmerId?: string): FarmerQuotaToken[] {
    if (farmerId) {
      return this.data.farmerQuotaTokens.filter(t => t.farmerId === farmerId);
    }
    return this.data.farmerQuotaTokens;
  }

  // Reset to clean SIH Demo State
  public resetToSeedData(): void {
    this.data = getInitialSeedData();
    this.saveData();
  }
}

export const db = new DatabaseService();
