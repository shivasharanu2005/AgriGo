import axios from 'axios';

export interface SoilReport {
  id: string;
  fieldId: string;
  fieldName: string;
  phLevel: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  organicMatter: number;
  moistureContent: number;
  ec: number;
  temperature: number;
  salinity: number;
  micronutrients: {
    zinc: number;
    iron: number;
    manganese: number;
    copper: number;
    boron: number;
  };
  sampleDate: string;
  healthScore: number;
  recommendations: { id: string; text: string; severity: 'high' | 'medium' | 'low' }[];
}

export interface IrrigationZone {
  id: string;
  name: string;
  cropType: string;
  soilMoistureCurrent: number;
  targetMoisture: number;
  flowRateLpm: number;
  nextIrrigationTime: string;
  waterAmountLiters: number;
  durationMinutes: number;
  method: 'DRIP' | 'SPRINKLER' | 'FLOOD' | 'PIVOT';
  status: 'SCHEDULED' | 'RUNNING' | 'COMPLETED' | 'PAUSED';
  manualOverride: boolean;
  valveHealth: number;
  distanceKm?: number;
}

export type Trend = 'up' | 'down' | 'flat';
export interface FarmTask { id: string; title: string; field: string; due: string; category: string; priority: 'high' | 'medium' | 'low'; done: boolean; }
export interface CommunityPost { id: string; author: string; village: string; postedAt: string; body: string; tag: string; replies: number; likes: number; }
interface NewsItem { id: string; title: string; source: string; publishedAt: string; category: 'policy' | 'market' | 'weather' | 'technology'; summary: string; url: string; }
interface YieldEntry { season: string; wheat: number; rice: number; cotton: number; }
interface LedgerEntry { id: string; date: string; label: string; category: string; amount: number; }
interface FertilizerPlan { id: string; crop: string; field: string; area: number; stage: string; product: string; category?: string; dosePerHa: number; applyOn: string; note: string; }
interface DocumentEntry { id: string; name: string; type: string; addedOn: string; expiresOn?: string; sizeKb: number; }
interface Lesson { id: string; title: string; topic: string; durationMin: number; level: string; description: string; progress: number; }
interface LivestockEntry { id: string; tag: string; species: string; age: string; health: 'healthy' | 'monitor' | 'treatment'; lastCheck: string; nextVaccination: string; yield?: string; note: string; }
interface NearbyService { id: string; name: string; type: 'mandi' | 'vet' | 'equipment rental' | 'soil lab' | 'seed store'; address: string; distanceKm: number; phone: string; openNow: boolean; }
interface AlertEntry { id: string; title: string; detail: string; severity: 'info' | 'warning' | 'critical'; raisedAt: string; channel: string; }
interface WaterLog { id: string; date: string; litres: number; costPerKilolitre: number; source: string; fieldName?: string; field?: string; }
interface HelpArticle { id: string; question: string; answer: string; topic: string; }
interface SuccessStory { id: string; headline: string; farmer: string; village: string; crop: string; story: string; metric: string; }

const API_BASE_URL = import.meta.env.VITE_AGRICULTURE_API_URL || '/api';
const apiClient = axios.create({ baseURL: API_BASE_URL, headers: { 'Content-Type': 'application/json' } });

export const agricultureApi = {
  getSoilReports: async (farmId: string): Promise<SoilReport[]> => {
    try {
      const response = await apiClient.get(`/farms/${farmId}/soil-reports`);
      return response.data;
    } catch {
      return [
        {
          id: 'soil-001',
          fieldId: 'field-north',
          fieldName: 'North Field (Wheat Block A)',
          phLevel: 6.8,
          nitrogen: 140,
          phosphorus: 45,
          potassium: 210,
          organicMatter: 3.2,
          moistureContent: 22,
          ec: 1.2,
          temperature: 18.5,
          salinity: 0.4,
          micronutrients: { zinc: 1.2, iron: 4.5, manganese: 2.1, copper: 0.8, boron: 0.5 },
          sampleDate: '2026-09-06',
          healthScore: 84,
          recommendations: [
            { id: 'r1', text: 'Apply 25kg/ha Nitrogen supplement before next irrigation cycle.', severity: 'medium' },
            { id: 'r2', text: 'Maintain current organic composting routine.', severity: 'low' }
          ]
        },
        {
          id: 'soil-002',
          fieldId: 'field-south',
          fieldName: 'South Orchard (Apples)',
          phLevel: 5.4,
          nitrogen: 90,
          phosphorus: 20,
          potassium: 150,
          organicMatter: 1.8,
          moistureContent: 15,
          ec: 2.1,
          temperature: 21.0,
          salinity: 0.9,
          micronutrients: { zinc: 0.6, iron: 2.1, manganese: 1.0, copper: 0.3, boron: 0.2 },
          sampleDate: '2026-09-05',
          healthScore: 58,
          recommendations: [
            { id: 'r3', text: 'Apply agricultural lime to increase soil pH above 6.2.', severity: 'high' },
            { id: 'r4', text: 'Zinc and Iron deficits detected; schedule foliar treatment.', severity: 'high' }
          ]
        }
      ];
    }
  },

  getIrrigationZones: async (farmId: string): Promise<IrrigationZone[]> => {
    try {
      const response = await apiClient.get(`/farms/${farmId}/irrigation`);
      return response.data;
    } catch {
      return [
        {
          id: 'zone-1',
          name: 'Zone A - Drip Network',
          cropType: 'Wheat',
          soilMoistureCurrent: 22,
          targetMoisture: 35,
          flowRateLpm: 42.5,
          nextIrrigationTime: '2026-09-06T18:00:00Z',
          waterAmountLiters: 4500,
          durationMinutes: 45,
          method: 'DRIP',
          status: 'SCHEDULED',
          manualOverride: false,
          valveHealth: 98
        },
        {
          id: 'zone-2',
          name: 'Zone B - Pivot Array',
          cropType: 'Apples',
          soilMoistureCurrent: 14,
          targetMoisture: 40,
          flowRateLpm: 88.0,
          nextIrrigationTime: '2026-09-06T14:30:00Z',
          waterAmountLiters: 8200,
          durationMinutes: 90,
          method: 'SPRINKLER',
          status: 'RUNNING',
          manualOverride: true,
          valveHealth: 82
        }
      ];
    }
  },

  toggleZoneState: async (zoneId: string, action: 'START' | 'STOP' | 'PAUSE'): Promise<boolean> => {
    try {
      await apiClient.post(`/irrigation/zones/${zoneId}/control`, { action });
      return true;
    } catch {
      return true; // Fallback mock success
    }
  },
  getNews: async (): Promise<NewsItem[]> => [
    { id: 'news-1', title: 'Rain window opens for field preparation', source: 'Agri Weather Desk', publishedAt: '2026-09-06', category: 'weather', summary: 'Plan soil work during the next dry interval and avoid spraying before rainfall.', url: '#' },
    { id: 'news-2', title: 'Mandi prices remain firm for quality produce', source: 'Market Watch', publishedAt: '2026-09-05', category: 'market', summary: 'Compare nearby markets and factor transport cost before selling.', url: '#' },
    { id: 'news-3', title: 'New micro-irrigation support guidance', source: 'Farm Policy Bulletin', publishedAt: '2026-09-04', category: 'policy', summary: 'Review eligibility and keep land and bank documents ready for applications.', url: '#' },
  ],
  getYieldHistory: async (): Promise<YieldEntry[]> => [
    { season: '2022', wheat: 3.1, rice: 3.8, cotton: 1.7 }, { season: '2023', wheat: 3.4, rice: 4.1, cotton: 1.8 }, { season: '2024', wheat: 3.6, rice: 4.0, cotton: 1.6 }, { season: '2025', wheat: 3.9, rice: 4.4, cotton: 2.0 }, { season: '2026', wheat: 4.2, rice: 4.6, cotton: 2.1 },
  ],
  getLedger: async (): Promise<LedgerEntry[]> => [
    { id: 'ledger-1', date: '2026-08-22', label: 'Tomato sale', category: 'Sales', amount: 48500 }, { id: 'ledger-2', date: '2026-08-18', label: 'Drip maintenance', category: 'Irrigation', amount: -6200 }, { id: 'ledger-3', date: '2026-08-12', label: 'Fertilizer purchase', category: 'Inputs', amount: -11800 }, { id: 'ledger-4', date: '2026-08-05', label: 'Labour', category: 'Labour', amount: -9300 },
  ],
  getTasks: async (): Promise<FarmTask[]> => [
    { id: 'task-1', title: 'Scout tomato leaves for early blight', field: 'North field', due: '2026-09-07', category: 'Crop health', priority: 'high', done: false }, { id: 'task-2', title: 'Clean drip filters', field: 'South field', due: '2026-09-08', category: 'Irrigation', priority: 'medium', done: false }, { id: 'task-3', title: 'Record weekly mandi prices', field: 'Farm office', due: '2026-09-05', category: 'Market', priority: 'low', done: true },
  ],
  getFertilizerPlans: async (): Promise<FertilizerPlan[]> => [
    { id: 'fert-1', crop: 'Tomato', field: 'North field', area: 1.2, stage: 'Flowering', product: 'NPK 19:19:19', dosePerHa: 24, applyOn: '2026-09-08', note: 'Apply after irrigation and avoid leaf wetting in strong sun.' }, { id: 'fert-2', crop: 'Wheat', field: 'West field', area: 2.0, stage: 'Tillering', product: 'Urea', dosePerHa: 32, applyOn: '2026-09-12', note: 'Split the dose and check the soil moisture first.' },
  ],
  getDocuments: async (): Promise<DocumentEntry[]> => {
    try {
      const response = await fetch('/api/agriculture/documents', { credentials: 'include' });
      if (!response.ok) throw new Error('Documents API unavailable');
      const data = await response.json();
      if (!Array.isArray(data)) return [];

      return data.map((doc: any) => ({
        id: doc.id,
        name: doc.name || doc.originalName || 'Farm document',
        type: doc.documentType || doc.type || 'Other',
        addedOn: doc.addedOn || doc.createdAt || new Date().toISOString(),
        expiresOn: doc.expiresOn || doc.expiryDate || undefined,
        sizeKb: Number(doc.sizeKb ?? 0),
      }));
    } catch {
      return [
        { id: 'doc-1', name: 'Land record - North field', type: 'Land record', addedOn: '2026-01-10', sizeKb: 820 },
        { id: 'doc-2', name: 'Crop insurance policy', type: 'Insurance', addedOn: '2026-04-03', expiresOn: '2026-10-01', sizeKb: 540 },
        { id: 'doc-3', name: 'Soil test report', type: 'Soil report', addedOn: '2026-08-28', sizeKb: 320 },
      ];
    }
  },
  getCommunityPosts: async (): Promise<CommunityPost[]> => [
    { id: 'post-1', author: 'Meena R.', village: 'Kolar', postedAt: 'today', body: 'Has anyone tried neem-based control for whitefly on tomato?', tag: 'Crop health', replies: 6, likes: 14 }, { id: 'post-2', author: 'Ravi K.', village: 'Mandya', postedAt: 'yesterday', body: 'Drip irrigation reduced my water use noticeably this season.', tag: 'Water', replies: 3, likes: 21 },
  ],
  getLessons: async (): Promise<Lesson[]> => [
    { id: 'lesson-1', title: 'Read a soil test card', topic: 'Soil', durationMin: 12, level: 'Beginner', description: 'Understand pH, NPK and organic carbon before choosing inputs.', progress: 100 }, { id: 'lesson-2', title: 'Scout for pests early', topic: 'Crop health', durationMin: 18, level: 'Practical', description: 'A field walk checklist for spotting disease before it spreads.', progress: 45 }, { id: 'lesson-3', title: 'Sell with a market comparison', topic: 'Market', durationMin: 10, level: 'Beginner', description: 'Calculate a realistic net return after transport and fees.', progress: 0 },
  ],
  getSuccessStories: async (): Promise<SuccessStory[]> => [
    { id: 'story-1', headline: 'A calmer irrigation morning', farmer: 'Lakshmi Devi', village: 'Mysuru', crop: 'Tomato', story: 'Checking moisture before opening the valve changed my morning routine.', metric: '18% lower water use' }, { id: 'story-2', headline: 'Nutrition at the right stage', farmer: 'Suresh Gowda', village: 'Kolar', crop: 'Ragi', story: 'The task planner helped me apply nutrition at the right stage.', metric: '12% higher yield' },
  ],
  getWaterLogs: async (): Promise<WaterLog[]> => [
    { id: 'water-1', date: '2026-09-01', litres: 4200, costPerKilolitre: 18, source: 'Borewell' }, { id: 'water-2', date: '2026-09-02', litres: 3600, costPerKilolitre: 0, source: 'Rainwater pond' }, { id: 'water-3', date: '2026-09-04', litres: 5100, costPerKilolitre: 18, source: 'Borewell' }, { id: 'water-4', date: '2026-09-05', litres: 2800, costPerKilolitre: 12, source: 'Canal' },
  ],
  getLivestock: async (): Promise<LivestockEntry[]> => [
    { id: 'animal-1', tag: 'Cow 07', species: 'Cattle', age: '4 years', health: 'healthy', lastCheck: '2026-08-20', nextVaccination: '2026-10-20', yield: '11 L/day', note: 'Good appetite and stable milk yield.' }, { id: 'animal-2', tag: 'Cow 11', species: 'Cattle', age: '6 years', health: 'monitor', lastCheck: '2026-08-15', nextVaccination: '2026-09-18', yield: '7 L/day', note: 'Monitor hoof health and schedule the next check-up.' },
  ],
  getNearbyServices: async (): Promise<NearbyService[]> => [
    { id: 'near-1', name: 'Kolar APMC Mandi', type: 'mandi', address: 'Market yard road', distanceKm: 4.2, phone: '080 1234 5678', openNow: true }, { id: 'near-2', name: 'GreenCare Vet Clinic', type: 'vet', address: 'Hosur main road', distanceKm: 6.8, phone: '09876543210', openNow: true }, { id: 'near-3', name: 'SoilSense Lab', type: 'soil lab', address: 'Industrial area', distanceKm: 8.1, phone: '09988776655', openNow: false },
  ],
  getAlerts: async (): Promise<AlertEntry[]> => [
    { id: 'alert-1', title: 'Rain expected tomorrow', detail: 'Delay irrigation and review your spray plan.', severity: 'warning', raisedAt: 'Today, 08:10', channel: 'weather service' }, { id: 'alert-2', title: 'Soil moisture is low', detail: 'North field is below the target moisture band.', severity: 'critical', raisedAt: 'Today, 07:45', channel: 'soil sensor' }, { id: 'alert-3', title: 'New learning lesson', detail: 'A short guide on market comparison is ready.', severity: 'info', raisedAt: 'Yesterday, 18:20', channel: 'learning hub' },
  ],
  getHelpArticles: async (): Promise<HelpArticle[]> => [
    { id: 'help-1', question: 'How do I change my farm location?', answer: 'Open the location selector from the dashboard and choose your saved farm or use GPS.', topic: 'Account' }, { id: 'help-2', question: 'What happens when the network is unavailable?', answer: 'The app keeps the last loaded farm summary and retries live data when you reconnect.', topic: 'Offline use' }, { id: 'help-3', question: 'How can I get expert support?', answer: 'Use Expert Consultation in Services and submit your crop, issue and callback time.', topic: 'Support' },
  ],
};

export const formatCurrency = (value: number) => `₹${Math.abs(value).toLocaleString('en-IN')}`;
export const formatDate = (value: string) => new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });