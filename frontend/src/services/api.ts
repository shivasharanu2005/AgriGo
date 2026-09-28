import {
  Farm,
  Crop,
  DiseaseDetectionResult,
  CropRecommendationItem,
  YieldPredictionResult,
  WeatherIntelligence,
  DailyAdvisory,
  DiseaseHotspot,
  NotificationItem,
  MLModelVersion,
  SystemAuditLog,
  IndianLanguage,
  FarmerSupportTicket,
  SubsidizedAgriInputScheme,
  FarmerQuotaToken,
} from '../types/index.ts';

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('agrivision_token');
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  return fetch(url, { ...options, headers });
};

export const api = {
  async getDashboard(farmerId?: string) {
    const res = await fetchWithAuth(`/api/dashboard?farmerId=${farmerId || ''}`);
    if (!res.ok) throw new Error('Failed to fetch dashboard data');
    return res.json();
  },

  async requestPasswordReset(email: string): Promise<{ success: boolean; message?: string; resetToken?: string }> {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Unable to send reset instructions');
    return data;
  },

  async getProfile(): Promise<{ user: any; farmerProfile?: any; adminProfile?: any }> {
    const res = await fetchWithAuth('/api/auth/profile');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Unable to load profile');
    return data;
  },

  async updateProfile(details: Record<string, any>) {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(details),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Unable to update profile');
    return data;
  },

  async resetPassword(token: string, password: string): Promise<{ success: boolean; message?: string }> {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Unable to reset password');
    return data;
  },

  async getFarms(farmerId?: string): Promise<Farm[]> {
    const res = await fetchWithAuth(`/api/farms${farmerId ? `?farmerId=${farmerId}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch farms');
    return res.json();
  },

  async getFarm(id: string): Promise<Farm> {
    const res = await fetchWithAuth(`/api/farms/${id}`);
    if (!res.ok) throw new Error('Failed to fetch farm');
    return res.json();
  },

  async createFarm(farm: Partial<Farm>): Promise<Farm> {
    const res = await fetchWithAuth('/api/farms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(farm),
    });
    if (!res.ok) throw new Error('Failed to create farm');
    return res.json();
  },

  async deleteFarm(id: string | number): Promise<void> {
    const res = await fetchWithAuth(`/api/farms/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete farm');
  },

  async addCrop(farmId: string, crop: Partial<Crop>): Promise<Crop> {
    const res = await fetchWithAuth(`/api/farms/${farmId}/crops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(crop),
    });
    if (!res.ok) throw new Error('Failed to add crop');
    return res.json();
  },

  async detectDisease(image: string, cropHint?: string, farmId?: string): Promise<DiseaseDetectionResult> {
    const res = await fetchWithAuth('/api/disease/detect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image, cropHint, farmId }),
    });
    if (!res.ok) throw new Error('Failed to detect disease');
    return res.json();
  },

  async uploadDiseaseImage(file: File, cropHint?: string): Promise<DiseaseDetectionResult> {
    const formData = new FormData();
    formData.append('image', file, file.name);
    if (cropHint) {
      formData.append('cropHint', cropHint);
    }

    const res = await fetch('/api/disease-detection/predict', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || data?.message || 'Failed to detect disease from uploaded image');
    }
    return data;
  },

  async getDetections(farmId?: string): Promise<DiseaseDetectionResult[]> {
    const res = await fetchWithAuth(`/api/disease/detections${farmId ? `?farmId=${farmId}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch disease detections');
    return res.json();
  },

  async recommendCrops(input: any): Promise<{ recommendations: CropRecommendationItem[] }> {
    const res = await fetchWithAuth('/api/crop/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('Failed to get crop recommendations');
    return res.json();
  },

  async getCropCatalog(category?: string, search?: string): Promise<{ total: number; crops: any[] }> {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    const res = await fetch(`/api/crop/catalog?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to get crop catalog');
    return res.json();
  },

  async predictYield(input: any): Promise<YieldPredictionResult> {
    const res = await fetchWithAuth('/api/yield/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('Failed to predict yield');
    return res.json();
  },

  async getWeather(lat = 13.1367, lng = 78.1347): Promise<WeatherIntelligence> {
    const res = await fetch(`/api/weather?lat=${lat}&lng=${lng}`);
    if (!res.ok) throw new Error('Failed to fetch weather');
    return res.json();
  },

  async reverseGeocode(lat: number, lng: number): Promise<{
    lat: number;
    lng: number;
    displayName: string;
    village?: string;
    taluk?: string;
    district: string;
    state: string;
    country: string;
  }> {
    const res = await fetch(`/api/location/reverse?lat=${lat}&lng=${lng}`);
    if (!res.ok) throw new Error('Failed to reverse geocode location');
    return res.json();
  },

  async searchLocations(query: string): Promise<Array<{
    lat: number;
    lng: number;
    displayName: string;
    village?: string;
    taluk?: string;
    district: string;
    state: string;
  }>> {
    const res = await fetch(`/api/location/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Failed to search locations');
    return res.json();
  },

  async getAdvisories(farmId?: string): Promise<DailyAdvisory[]> {
    const res = await fetch(`/api/advisories${farmId ? `?farmId=${farmId}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch advisories');
    const data = await res.json();
    return Array.isArray(data) ? data : [data];
  },

  async getHotspots(): Promise<DiseaseHotspot[]> {
    const res = await fetch('/api/officer/disease-hotspots');
    if (!res.ok) throw new Error('Failed to fetch disease hotspots');
    return res.json();
  },

  async getNotifications(userId?: string): Promise<NotificationItem[]> {
    const res = await fetch(`/api/notifications${userId ? `?userId=${userId}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  async markNotificationRead(id: string): Promise<boolean> {
    const res = await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    if (!res.ok) return false;
    const data = await res.json();
    return data.success;
  },

  async askAssistant(question: string, context?: any, language?: IndianLanguage) {
    const res = await fetch('/api/assistant/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, context, language }),
    });
    if (!res.ok) throw new Error('Failed to ask assistant');
    return res.json();
  },

  async submitOnboarding(data: any) {
    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Onboarding failed');
    return res.json();
  },

  async broadcastOfficerAdvisory(data: { title: string; message: string; severity?: string; targetDistrict: string; targetCrop?: string; senderOfficer?: string }) {
    const res = await fetch('/api/officer/broadcast-advisory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to broadcast advisory');
    return res.json();
  },

  async broadcastAdvisory(data: { title: string; message: string; severity?: string; targetDistrict: string; targetCrop?: string; senderOfficer?: string }) {
    return this.broadcastOfficerAdvisory(data);
  },

  async getAdminModels(): Promise<MLModelVersion[]> {
    const res = await fetch('/api/admin/models');
    if (!res.ok) throw new Error('Failed to fetch models');
    return res.json();
  },

  async getAdminAuditLogs(): Promise<SystemAuditLog[]> {
    const res = await fetch('/api/admin/audit-logs');
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  async getImpactAnalytics() {
    const res = await fetch('/api/analytics/impact');
    if (!res.ok) throw new Error('Failed to fetch impact analytics');
    return res.json();
  },

  // --- AGRICULTURE OFFICER & FARMER INTERACTION SERVICES ---
  async getFarmerTickets(farmerId?: string): Promise<FarmerSupportTicket[]> {
    const res = await fetch(`/api/support-tickets${farmerId ? `?farmerId=${farmerId}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch support tickets');
    return res.json();
  },

  async createFarmerTicket(ticketData: Partial<FarmerSupportTicket>): Promise<FarmerSupportTicket> {
    const res = await fetch('/api/support-tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticketData),
    });
    if (!res.ok) throw new Error('Failed to submit support ticket');
    return res.json();
  },

  async resolveFarmerTicket(ticketId: string, resolutionData: {
    officerId?: string;
    officerName: string;
    designation: string;
    department?: string;
    officialStampNumber?: string;
    diagnosisAndAction: string;
    prescribedFormulation?: string;
    scheduledVisitDate?: string;
    pmfbyApprovedReliefAmount?: number;
    status?: FarmerSupportTicket['status'];
  }): Promise<FarmerSupportTicket> {
    const res = await fetch(`/api/support-tickets/${ticketId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resolutionData),
    });
    if (!res.ok) throw new Error('Failed to resolve ticket');
    return res.json();
  },

  async getSubsidizedSchemes(district?: string): Promise<SubsidizedAgriInputScheme[]> {
    const res = await fetch(`/api/subsidized-schemes${district ? `?district=${encodeURIComponent(district)}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch subsidized schemes');
    return res.json();
  },

  async createSubsidizedScheme(schemeData: Partial<SubsidizedAgriInputScheme>): Promise<SubsidizedAgriInputScheme> {
    const res = await fetch('/api/subsidized-schemes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schemeData),
    });
    if (!res.ok) throw new Error('Failed to create subsidized scheme');
    return res.json();
  },

  async claimQuotaToken(data: {
    schemeId: string;
    farmerId: string;
    farmerName: string;
    farmerPhone: string;
    farmerAadhaarLast4: string;
    quantityBooked: number;
  }): Promise<{ token: FarmerQuotaToken; scheme: SubsidizedAgriInputScheme }> {
    const res = await fetch('/api/claim-quota-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to claim quota token' }));
      throw new Error(err.error || 'Failed to claim quota token');
    }
    return res.json();
  },

  async getFarmerTokens(farmerId?: string): Promise<FarmerQuotaToken[]> {
    const res = await fetch(`/api/quota-tokens${farmerId ? `?farmerId=${farmerId}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch quota tokens');
    return res.json();
  },

  async resetDemoData() {
    const res = await fetch('/api/demo/reset', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset demo data');
    return res.json();
  },
  async getMandiPrices(cropName?: string): Promise<any[]> {
    const res = await fetch(`/api/markets/prices${cropName ? `?cropName=${encodeURIComponent(cropName)}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch mandi prices');
    return res.json();
  },

  async getMarketplaceProducts(category?: string): Promise<any[]> {
    const res = await fetch(`/api/marketplace/products${category ? `?category=${encodeURIComponent(category)}` : ''}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch marketplace products');
    return res.json();
  },

  async createMarketplaceProduct(payload: Record<string, any>): Promise<any> {
    const res = await fetch('/api/marketplace/products', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to create marketplace product');
    return data;
  },

  async updateMarketplaceProduct(id: string, payload: Record<string, any>): Promise<any> {
    const res = await fetch(`/api/marketplace/products/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to update marketplace product');
    return data;
  },

  async deleteMarketplaceProduct(id: string): Promise<any> {
    const res = await fetch(`/api/marketplace/products/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to delete marketplace product');
    return data;
  },

  async post(path: string, body?: Record<string, any>) {
    const res = await fetch(path.startsWith('/') ? path : `/${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  },

  async patch(path: string, body?: Record<string, any>) {
    const res = await fetch(path.startsWith('/') ? path : `/${path}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  },

  async delete(path: string) {
    const res = await fetch(path.startsWith('/') ? path : `/${path}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  },

  async getEquipment(): Promise<any[]> {
    const res = await fetch('/api/equipment', { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch equipment rentals');
    return res.json();
  },

  async createEquipment(payload: Record<string, any>): Promise<any> {
    const res = await fetch('/api/equipment', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to create equipment');
    return data;
  },

  async updateEquipment(id: string, payload: Record<string, any>): Promise<any> {
    const res = await fetch(`/api/equipment/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to update equipment');
    return data;
  },

  async deleteEquipment(id: string): Promise<any> {
    const res = await fetch(`/api/equipment/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to delete equipment');
    return data;
  },

  async getEquipmentBookings(farmerId?: string): Promise<any[]> {
    const query = farmerId ? `?farmerId=${encodeURIComponent(farmerId)}` : '';
    const res = await fetch(`/api/equipment/requests${query}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch equipment bookings');
    return res.json();
  },

  async bookEquipment(id: string, payload: Record<string, any>): Promise<any> {
    const res = await fetch(`/api/equipment/${id}/book`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Unable to confirm booking');
    return data;
  },
};
