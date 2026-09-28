import {
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
  Crop,
} from '../types/index.ts';

export const expansionApi = {
  // --- FIELDS & IRRIGATION ---
  async getFields(farmId: string): Promise<Crop[]> {
    const res = await fetch(`/api/farms/${farmId}/fields`);
    if (!res.ok) throw new Error('Failed to fetch fields');
    return res.json();
  },

  async getIrrigationRecords(fieldId: string): Promise<IrrigationRecord[]> {
    const res = await fetch(`/api/fields/${fieldId}/irrigation`);
    if (!res.ok) throw new Error('Failed to fetch irrigation records');
    return res.json();
  },

  async addIrrigationRecord(fieldId: string, data: Partial<IrrigationRecord>): Promise<IrrigationRecord> {
    const res = await fetch(`/api/fields/${fieldId}/irrigation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add irrigation record');
    return res.json();
  },

  // --- CROP CALENDAR ---
  async getCalendarTasks(farmId: string): Promise<CropCalendarTask[]> {
    const res = await fetch(`/api/farms/${farmId}/calendar`);
    if (!res.ok) throw new Error('Failed to fetch calendar tasks');
    return res.json();
  },

  async addCalendarTask(farmId: string, task: Partial<CropCalendarTask>): Promise<CropCalendarTask> {
    const res = await fetch(`/api/farms/${farmId}/calendar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    if (!res.ok) throw new Error('Failed to add calendar task');
    return res.json();
  },

  async updateCalendarTaskStatus(taskId: string, status: string): Promise<CropCalendarTask> {
    const res = await fetch(`/api/calendar/${taskId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update task status');
    return res.json();
  },

  // --- FARM DIARY ---
  async getDiaryEntries(farmId: string): Promise<FarmDiaryEntry[]> {
    const res = await fetch(`/api/farms/${farmId}/diary`);
    if (!res.ok) throw new Error('Failed to fetch diary entries');
    return res.json();
  },

  async addDiaryEntry(farmId: string, entry: Partial<FarmDiaryEntry>): Promise<FarmDiaryEntry> {
    const res = await fetch(`/api/farms/${farmId}/diary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error('Failed to add diary entry');
    return res.json();
  },

  // --- EXPENSES ---
  async getExpenses(farmId: string): Promise<Expense[]> {
    const res = await fetch(`/api/farms/${farmId}/expenses`);
    if (!res.ok) throw new Error('Failed to fetch expenses');
    return res.json();
  },

  async addExpense(farmId: string, expense: Partial<Expense>): Promise<Expense> {
    const res = await fetch(`/api/farms/${farmId}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    });
    if (!res.ok) throw new Error('Failed to add expense');
    return res.json();
  },

  // --- MARKETS ---
  async getMarkets(): Promise<Market[]> {
    const res = await fetch('/api/markets');
    if (!res.ok) throw new Error('Failed to fetch markets');
    return res.json();
  },

  async getMarketPrices(cropName?: string): Promise<MarketPrice[]> {
    const res = await fetch(`/api/markets/prices${cropName ? `?cropName=${encodeURIComponent(cropName)}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch market prices');
    return res.json();
  },

  // --- MARKETPLACE ---
  async getMarketplaceProducts(category?: string): Promise<MarketplaceProduct[]> {
    const res = await fetch(`/api/marketplace/products${category ? `?category=${encodeURIComponent(category)}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  // --- EXPERT CONSULTATION ---
  async getConsultations(farmerId: string): Promise<ExpertConsultation[]> {
    const res = await fetch(`/api/consultations?farmerId=${farmerId}`);
    if (!res.ok) throw new Error('Failed to fetch consultations');
    return res.json();
  },

  async addConsultation(consultation: Partial<ExpertConsultation>): Promise<ExpertConsultation> {
    const res = await fetch('/api/consultations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(consultation),
    });
    if (!res.ok) throw new Error('Failed to add consultation');
    return res.json();
  },

  // --- COMMUNITY ---
  async getCommunityPosts(): Promise<CommunityPost[]> {
    const res = await fetch('/api/community/posts');
    if (!res.ok) throw new Error('Failed to fetch community posts');
    return res.json();
  },

  async addCommunityPost(post: Partial<CommunityPost>): Promise<CommunityPost> {
    const res = await fetch('/api/community/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    });
    if (!res.ok) throw new Error('Failed to create post');
    return res.json();
  },

  async likeCommunityPost(postId: string): Promise<CommunityPost> {
    const res = await fetch(`/api/community/posts/${postId}/like`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to like post');
    return res.json();
  }
};
