import React, { ReactNode } from 'react';
import { Mic } from 'lucide-react';
import { Navbar } from './Navbar.tsx';
import { VoiceAssistantModal } from './VoiceAssistantModal.tsx';
import Footer from './footer.tsx';
import { useLanguage } from '../i18n/LanguageContext.tsx';

interface AgricultureLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void | Promise<void>;
  onOpenVoiceAssistant: () => void;
  isVoiceAssistantOpen: boolean;
  onCloseVoiceAssistant: () => void;
  onGoHome: () => void;
  children: ReactNode;
}

export function AgricultureLayout({
  activeTab,
  setActiveTab,
  onLogout,
  onOpenVoiceAssistant,
  isVoiceAssistantOpen,
  onCloseVoiceAssistant,
  onGoHome,
  children,
}: AgricultureLayoutProps) {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen flex-col bg-stone-100/70 text-stone-900 selection:bg-emerald-200 selection:text-emerald-900">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectTab={setActiveTab}
        onOpenVoiceAssistant={onOpenVoiceAssistant}
        onGoHome={onGoHome}
      />

      <div className="mx-auto flex w-full max-w-7xl justify-end gap-2 px-4 pt-4 sm:px-6">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'profile' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'}`}
        >
          {t('profile', 'My profile')}
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50"
        >
          {t('logout', 'Logout')}
        </button>
      </div>

      <main className="min-w-0 w-screen max-w-none flex-1 pb-20 pt-6">{children}</main>

      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={onOpenVoiceAssistant}
          className="group flex items-center gap-2.5 rounded-full border-2 border-white/20 bg-emerald-600 px-4 py-3 text-white shadow-xl transition-all hover:scale-105 hover:bg-emerald-700 hover:shadow-2xl active:scale-95"
          title="AgriVision Multilingual Voice Assistant"
        >
          <Mic className="h-5 w-5" />
          <span className="pr-1 text-xs font-bold sm:text-sm">{t('voiceAssistant', 'AI Voice Assistant')}</span>
        </button>
      </div>

      <VoiceAssistantModal
        isOpen={isVoiceAssistantOpen}
        onClose={onCloseVoiceAssistant}
        activeCrop="Tomato (Arka Rakshak)"
        farmLocation="Kolar, Karnataka"
      />

      <Footer />
    </div>
  );
}
