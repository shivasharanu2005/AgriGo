import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext.tsx';
import { LocationProvider } from './contexts/LocationContext.tsx';
import { AgricultureLayout } from './components/AgricultureLayout.tsx';

import { FarmerDashboard } from './pages/FarmerDashboard.tsx';
import { DiseaseDetectionPage } from './pages/DiseaseDetectionPage.tsx';
import { CropRecommendationPage } from './pages/CropRecommendationPage.tsx';
import { YieldPredictionPage } from './pages/YieldPredictionPage.tsx';
import { WeatherIntelligencePage } from './pages/WeatherIntelligencePage.tsx';
import { GISMapPage } from './pages/GISMapPage.tsx';
import { OfficerPortalPage } from './pages/OfficerPortalPage.tsx';
import { AdminPortalPage } from './pages/AdminPortalPage.tsx';
import { SIHImpactPage } from './pages/SIHImpactPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { RegistrationPage } from './pages/RegistrationPage.tsx';
import { MandiPricesPage } from './pages/MandiPricesPage.tsx';
import { MarketplacePage } from './pages/MarketplacePage.tsx';
import { EquipmentRentalPage } from './pages/EquipmentRentalPage.tsx';
import { GovernmentSchemesPage } from './pages/GovernmentSchemesPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { ServicesPage } from './pages/ServicesPage.tsx';
import EcosystemPage from './pages/Ecosystem.tsx';
import AgricultureNews from './pages/agriculture/AgricultureNews.tsx';
import FarmAnalytics from './pages/agriculture/FarmAnalytics.tsx';
import FarmDocuments from './pages/agriculture/FarmDocuments.tsx';
import FarmerCommunity from './pages/agriculture/Farmercommunity.tsx';
import FarmerLearningHub from './pages/agriculture/FarmerLearningHub.tsx';
import FarmerSuccessStories from './pages/agriculture/FarmerSuccessStories.tsx';
import FarmFinancialOverview from './pages/agriculture/FarmFinancialOverview.tsx';
import FarmTaskPlanner from './pages/agriculture/FarmTaskPlanner.tsx';
import FertilizerPlanner from './pages/agriculture/FertilizerPlanner.tsx';
import HelpCenter from './pages/agriculture/helpcenter.tsx';
import LivestockCare from './pages/agriculture/LivestockCare.tsx';
import NearbyAgricultureServices from './pages/agriculture/NearbyAgricultureServices.tsx';
import PersonalizedAlerts from './pages/agriculture/PersonalizedAlerts.tsx';
import { SmartIrrigationPlanner } from './pages/agriculture/SmartIrrigationPlanner.tsx';
import { SoilHealthAdvisor } from './pages/agriculture/SoilHealthAdvisor.tsx';
import WaterUsageTracker from './pages/agriculture/WaterUsageTracker.tsx';
import Insurance from './pages/Insurance.tsx';
import HomePage from './pages/HomePage.tsx';
import LandMeasurementPage from "./pages/agriculture/LandMeasurementPage";


const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  const { user, loading, logout } = useAuth();
  useLanguage();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [authView, setAuthView] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [showHome, setShowHome] = useState(true);

  // Callback when evaluator clicks a sample leaf in the SIH toolbar
  const handleLoadSampleLeaf = (sampleKey: string) => {
    setActiveTab('disease');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
      </div>
    );
  }

  if (showHome) {
    return (
      <HomePage
        onGetStarted={() => {
          setShowHome(false);
          setAuthView('REGISTER');
        }}
        onSignIn={() => {
          setShowHome(false);
          setAuthView('LOGIN');
        }}
      />
    );
  }

  if (!user) {
    if (authView === 'REGISTER') {
      return <RegistrationPage onNavigateToLogin={() => setAuthView('LOGIN')} />;
    }
    return <LoginPage onNavigateToRegister={() => setAuthView('REGISTER')} />;
  }

  const onLogout = async () => {
    await logout();
    setAuthView('LOGIN');
    setShowHome(true);
  };

  return (
    <AgricultureLayout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={onLogout}
        onOpenVoiceAssistant={() => setIsVoiceAssistantOpen(true)}
        isVoiceAssistantOpen={isVoiceAssistantOpen}
        onCloseVoiceAssistant={() => setIsVoiceAssistantOpen(false)}
        onGoHome={() => setShowHome(true)}
      >
        {activeTab === 'dashboard' && (
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <FarmerDashboard
              onNavigate={tab => setActiveTab(tab)}
              onOpenVoiceAssistant={() => setIsVoiceAssistantOpen(true)}
              onSelectDiseaseLeafSample={handleLoadSampleLeaf}
            />
          </div>
        )}

        {activeTab === 'disease' && <DiseaseDetectionPage />}

        {activeTab === 'crop_rec' && <CropRecommendationPage />}

        {activeTab === 'yield' && <YieldPredictionPage />}

        {activeTab === 'weather' && <WeatherIntelligencePage />}

        {activeTab === 'map' && <GISMapPage />}

        {activeTab === 'land_measurement' && <LandMeasurementPage />}

        {activeTab === 'officer' && <OfficerPortalPage />}

        {activeTab === 'admin' && <AdminPortalPage />}

        {activeTab === 'impact' && <SIHImpactPage onNavigate={setActiveTab} />}

        {activeTab === 'mandi' && <MandiPricesPage />}

        {activeTab === 'marketplace' && <MarketplacePage />}

        {activeTab === 'equipment' && <EquipmentRentalPage />}

        {activeTab === 'schemes' && <GovernmentSchemesPage />}

        {activeTab === 'insurance' && <Insurance />}

        {activeTab === 'services' && <ServicesPage onNavigate={setActiveTab} />}

        {activeTab === 'ecosystem' && <EcosystemPage onNavigate={setActiveTab} />}

        {activeTab === 'news' && <AgricultureNews />}
        {activeTab === 'analytics' && <FarmAnalytics />}
        {activeTab === 'documents' && <FarmDocuments />}
        {activeTab === 'community' && <FarmerCommunity />}
        {activeTab === 'learning' && <FarmerLearningHub />}
        {activeTab === 'stories' && <FarmerSuccessStories />}
        {activeTab === 'finance' && <FarmFinancialOverview />}
        {activeTab === 'tasks' && <FarmTaskPlanner />}
        {activeTab === 'fertilizer' && <FertilizerPlanner />}
        {activeTab === 'help' && <HelpCenter />}
        {activeTab === 'livestock' && <LivestockCare />}
        {activeTab === 'nearby' && <NearbyAgricultureServices />}
        {activeTab === 'alerts' && <PersonalizedAlerts />}
        {activeTab === 'irrigation' && <SmartIrrigationPlanner />}
        {activeTab === 'soil' && <SoilHealthAdvisor />}
        {activeTab === 'water' && <WaterUsageTracker />}

        {activeTab === 'profile' && <ProfilePage />}
    </AgricultureLayout>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <LocationProvider>
            <AppContent />
          </LocationProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
