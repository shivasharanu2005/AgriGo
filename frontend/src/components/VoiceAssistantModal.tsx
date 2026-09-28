import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  BarChart3,
  Bot,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Copy,
  Droplets,
  Leaf,
  Lightbulb,
  MapPin,
  Mic,
  MicOff,
  Minus,
  Pause,
  Play,
  RefreshCw,
  Send,
  ShieldAlert,
  Sparkles,
  Sprout,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  User as UserIcon,
  Volume2,
  VolumeX,
  WandSparkles,
  Waves,
  CloudRain,
  X,
  Zap,
} from 'lucide-react';

import { useAuth } from '../contexts/AuthContext.tsx';
import { useLanguage } from '../i18n/LanguageContext.tsx';
import { api } from '../services/api.ts';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCrop?: string;
  farmLocation?: string;

  /*
   * Optional real farm data.
   *
   * These props are optional so this component can be dropped
   * into the existing AgriGo project without breaking current pages.
   */
  farmData?: Partial<FarmContext>;
}

interface FarmContext {
  farmerName: string;
  crop: string;
  location: string;

  soil: {
    type: string;
    ph: number | null;
    moisture: number | null;
    nitrogen: number | null;
    phosphorus: number | null;
    potassium: number | null;
  };

  weather: {
    temperature: number | null;
    humidity: number | null;
    rainfall24h: number | null;
    rainfall7d: number | null;
    rainProbability: number | null;
    forecast: string;
    windSpeed: number | null;
  };

  cropProfile: {
    variety: string;
    growthStage: string;
    sowingDate: string;
    acreage: number | null;
  };

  irrigation: {
    method: string;
    lastIrrigation: string;
    waterSource: string;
  };

  diseaseHistory: string[];

  economics: {
    investment: number | null;
    expectedRevenue: number | null;
  };
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;

  factors?: string[];
  category?: AdviceCategory;
  urgency?: AdviceUrgency;
  confidence?: number;
  recommendations?: string[];
  reasons?: string[];
  actions?: string[];
  warnings?: string[];

  feedback?: 'positive' | 'negative';
}

type AdviceCategory =
  | 'irrigation'
  | 'disease'
  | 'fertilizer'
  | 'weather'
  | 'crop'
  | 'market'
  | 'profit'
  | 'general';

type AdviceUrgency = 'low' | 'medium' | 'high' | 'critical';

interface AssistantResponse {
  answer: string;
  category?: AdviceCategory;
  urgency?: AdviceUrgency;
  confidence?: number;
  recommendations?: string[];
  reasons?: string[];
  actions?: string[];
  warnings?: string[];
  contextualFactorsUsed?: string[];
  followUpQuestion?: string;
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const nowTime = () =>
  new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

const formatNumber = (value: number | null | undefined, suffix = '') => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—';
  }

  return `${value}${suffix}`;
};

const getCategoryIcon = (category?: AdviceCategory) => {
  switch (category) {
    case 'irrigation':
      return <Droplets className="w-4 h-4" />;

    case 'disease':
      return <ShieldAlert className="w-4 h-4" />;

    case 'fertilizer':
      return <Leaf className="w-4 h-4" />;

    case 'weather':
      return <CloudRain className="w-4 h-4" />;

    case 'crop':
      return <Sprout className="w-4 h-4" />;

    case 'market':
      return <TrendingUp className="w-4 h-4" />;

    case 'profit':
      return <BarChart3 className="w-4 h-4" />;

    default:
      return <Sparkles className="w-4 h-4" />;
  }
};

const getCategoryLabel = (category?: AdviceCategory) => {
  switch (category) {
    case 'irrigation':
      return 'Irrigation';

    case 'disease':
      return 'Disease';

    case 'fertilizer':
      return 'Fertilizer';

    case 'weather':
      return 'Weather';

    case 'crop':
      return 'Crop Planning';

    case 'market':
      return 'Market';

    case 'profit':
      return 'Farm Profit';

    default:
      return 'Farm Advice';
  }
};

const getUrgencyLabel = (urgency?: AdviceUrgency) => {
  switch (urgency) {
    case 'critical':
      return 'Critical';

    case 'high':
      return 'High Priority';

    case 'medium':
      return 'Monitor';

    default:
      return 'Normal';
  }
};

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  activeCrop = 'Tomato',
  farmLocation = 'Kolar, Karnataka',
  farmData,
}) => {
  const { user } = useAuth();
  const { language, currentLanguageMeta } = useLanguage();

  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [activeTab, setActiveTab] = useState<'chat' | 'farm'>('chat');

  const [showFarmContext, setShowFarmContext] = useState(true);

  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  /* ------------------------------------------------------------------------ */
  /* Farm context                                                             */
  /* ------------------------------------------------------------------------ */

  const farmContext: FarmContext = useMemo(() => {
    return {
      farmerName: farmData?.farmerName || user?.name || 'Farmer',

      crop: farmData?.crop || activeCrop,

      location: farmData?.location || farmLocation,

      soil: {
        type: farmData?.soil?.type || 'Red Sandy Loam',
        ph: farmData?.soil?.ph ?? 6.5,
        moisture: farmData?.soil?.moisture ?? null,
        nitrogen: farmData?.soil?.nitrogen ?? null,
        phosphorus: farmData?.soil?.phosphorus ?? null,
        potassium: farmData?.soil?.potassium ?? null,
      },

      weather: {
        temperature: farmData?.weather?.temperature ?? 28,
        humidity: farmData?.weather?.humidity ?? null,
        rainfall24h: farmData?.weather?.rainfall24h ?? 24,
        rainfall7d: farmData?.weather?.rainfall7d ?? null,
        rainProbability: farmData?.weather?.rainProbability ?? null,
        forecast: farmData?.weather?.forecast || 'Partly cloudy',
        windSpeed: farmData?.weather?.windSpeed ?? null,
      },

      cropProfile: {
        variety: farmData?.cropProfile?.variety || 'Not specified',
        growthStage: farmData?.cropProfile?.growthStage || 'Vegetative stage',
        sowingDate: farmData?.cropProfile?.sowingDate || 'Not specified',
        acreage: farmData?.cropProfile?.acreage ?? null,
      },

      irrigation: {
        method: farmData?.irrigation?.method || 'Not specified',
        lastIrrigation: farmData?.irrigation?.lastIrrigation || 'Not specified',
        waterSource: farmData?.irrigation?.waterSource || 'Not specified',
      },

      diseaseHistory: farmData?.diseaseHistory || [
        'Early Blight (Alternaria solani)',
      ],

      economics: {
        investment: farmData?.economics?.investment ?? null,
        expectedRevenue: farmData?.economics?.expectedRevenue ?? null,
      },
    };
  }, [farmData, user?.name, activeCrop, farmLocation]);

  /* ------------------------------------------------------------------------ */
  /* Welcome message                                                          */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!isOpen) return;

    const createWelcome = () => {
      const name = farmContext.farmerName;
      const crop = farmContext.crop;

      if (language === 'kn') {
        return `ನಮಸ್ಕಾರ ${name}! 🌱 ನಾನು ನಿಮ್ಮ AgriGo AI Farm Copilot. ನಿಮ್ಮ ${crop} ಬೆಳೆ, ನೀರಾವರಿ, ಮಣ್ಣು, ಹವಾಮಾನ, ರೋಗಗಳು ಮತ್ತು ಕೃಷಿ ವೆಚ್ಚಗಳ ಬಗ್ಗೆ ಸಹಾಯ ಮಾಡಬಹುದು.`;
      }

      if (language === 'hi') {
        return `नमस्ते ${name}! 🌱 मैं आपका AgriGo AI Farm Copilot हूँ। मैं आपकी ${crop} फसल, सिंचाई, मिट्टी, मौसम, रोग और खेती की लागत से संबंधित सलाह दे सकता हूँ।`;
      }

      if (language === 'te') {
        return `నమస్కారం ${name}! 🌱 నేను మీ AgriGo AI Farm Copilot. మీ ${crop} పంట, నీటిపారుదల, నేల, వాతావరణం, తెగుళ్లు మరియు వ్యవసాయ ఖర్చుల గురించి సహాయం చేయగలను.`;
      }

      if (language === 'ta') {
        return `வணக்கம் ${name}! 🌱 நான் உங்கள் AgriGo AI Farm Copilot. உங்கள் ${crop} பயிர், நீர்ப்பாசனம், மண், வானிலை, நோய்கள் மற்றும் விவசாய செலவுகள் குறித்து உதவ முடியும்.`;
      }

      return `Hello ${name}! 🌱 I am your AgriGo AI Farm Copilot. I can help with your ${crop} crop, irrigation, soil, weather, disease risk and farm economics.`;
    };

    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: createWelcome(),
        timestamp: nowTime(),
        category: 'general',
        confidence: 96,
        factors: [
          `Crop: ${farmContext.crop}`,
          `Location: ${farmContext.location}`,
          `Soil: ${farmContext.soil.type}`,
        ],
      },
    ]);
  }, [
    isOpen,
    language,
    farmContext.farmerName,
    farmContext.crop,
    farmContext.location,
    farmContext.soil.type,
  ]);

  /* ------------------------------------------------------------------------ */
  /* Online/offline                                                           */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);

    window.addEventListener('online', online);
    window.addEventListener('offline', offline);

    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Auto scroll                                                              */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages, isLoading]);

  /* ------------------------------------------------------------------------ */
  /* Speech recognition                                                       */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      recognitionRef.current = null;
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = currentLanguageMeta.speechLocale;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0]?.transcript || '')
        .join('');

      setInputText(transcript);
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {
        // Ignore browser recognition cleanup errors.
      }
    };
  }, [currentLanguageMeta.speechLocale]);

  /* ------------------------------------------------------------------------ */
  /* Voice input                                                              */
  /* ------------------------------------------------------------------------ */

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(
        'Voice recognition is not supported in this browser. Please type your question.'
      );
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      setInputText('');
      recognitionRef.current.lang = currentLanguageMeta.speechLocale;
      recognitionRef.current.start();
    } catch (error) {
      console.warn('Could not start speech recognition:', error);
      setIsListening(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Text to speech                                                           */
  /* ------------------------------------------------------------------------ */

  const speakAnswer = (text: string) => {
    if (!('speechSynthesis' in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = currentLanguageMeta.speechLocale;
    utterance.rate = 0.92;
    utterance.pitch = 1;

    utterance.onstart = () => setIsSpeaking(true);

    utterance.onend = () => setIsSpeaking(false);

    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Build backend context                                                    */
  /* ------------------------------------------------------------------------ */

  const buildAIContext = () => {
    return {
      farmerName: farmContext.farmerName,

      activeCrop: farmContext.crop,

      location: farmContext.location,

      soil: {
        type: farmContext.soil.type,
        ph: farmContext.soil.ph,
        moisture: farmContext.soil.moisture,
        nitrogen: farmContext.soil.nitrogen,
        phosphorus: farmContext.soil.phosphorus,
        potassium: farmContext.soil.potassium,
      },

      weather: {
        temperature: farmContext.weather.temperature,
        humidity: farmContext.weather.humidity,
        rainfall24h: farmContext.weather.rainfall24h,
        rainfall7d: farmContext.weather.rainfall7d,
        rainProbability: farmContext.weather.rainProbability,
        forecast: farmContext.weather.forecast,
        windSpeed: farmContext.weather.windSpeed,
      },

      crop: {
        variety: farmContext.cropProfile.variety,
        growthStage: farmContext.cropProfile.growthStage,
        sowingDate: farmContext.cropProfile.sowingDate,
        acreage: farmContext.cropProfile.acreage,
      },

      irrigation: {
        method: farmContext.irrigation.method,
        lastIrrigation: farmContext.irrigation.lastIrrigation,
        waterSource: farmContext.irrigation.waterSource,
      },

      diseaseHistory: farmContext.diseaseHistory,

      economics: {
        investment: farmContext.economics.investment,
        expectedRevenue: farmContext.economics.expectedRevenue,
      },

      systemInstruction:
        'Provide practical farmer-friendly agricultural advice. Clearly separate observations, recommendations and warnings. Never invent exact pesticide dosage, government benefits, market prices or weather values when reliable data is unavailable. Recommend consulting a local agricultural officer or qualified agronomist for high-risk crop protection decisions.',
    };
  };

  /* ------------------------------------------------------------------------ */
  /* Send message                                                             */
  /* ------------------------------------------------------------------------ */

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputText).trim();

    if (!textToSend || isLoading) {
      return;
    }

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore.
      }

      setIsListening(false);
    }

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: nowTime(),
    };

    setMessages(prev => [...prev, userMessage]);

    setInputText('');

    setIsLoading(true);

    try {
      const response = await api.askAssistant(
        textToSend,
        buildAIContext(),
        language
      );

      const res = response as AssistantResponse;

      const assistantMessage: ChatMessage = {
        id: `assistant_${Date.now()}`,
        sender: 'assistant',
        text:
          res.answer ||
          'I could not generate an answer right now. Please try again.',

        timestamp: nowTime(),

        category: res.category || inferCategory(textToSend),

        urgency: res.urgency || 'low',

        confidence:
          typeof res.confidence === 'number' ? res.confidence : 85,

        factors: res.contextualFactorsUsed || [],

        recommendations: res.recommendations || [],

        reasons: res.reasons || [],

        actions: res.actions || [],

        warnings: res.warnings || [],
      };

      setMessages(prev => [...prev, assistantMessage]);

      speakAnswer(assistantMessage.text);
    } catch (error) {
      console.error('AgriGo AI Assistant error:', error);

      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        sender: 'assistant',
        text: isOnline
          ? 'I could not connect to the agricultural AI service. Please check the server and try again.'
          : 'You appear to be offline. Please reconnect to the internet and try again.',
        timestamp: nowTime(),
        category: 'general',
        urgency: 'medium',
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Category inference                                                       */
  /* ------------------------------------------------------------------------ */

  const inferCategory = (query: string): AdviceCategory => {
    const q = query.toLowerCase();

    if (
      q.includes('water') ||
      q.includes('irrigat') ||
      q.includes('ನೀರು') ||
      q.includes('सिंचाई')
    ) {
      return 'irrigation';
    }

    if (
      q.includes('disease') ||
      q.includes('pest') ||
      q.includes('insect') ||
      q.includes('ರೋಗ') ||
      q.includes('कीट')
    ) {
      return 'disease';
    }

    if (
      q.includes('fertilizer') ||
      q.includes('fertiliser') ||
      q.includes('nutrient') ||
      q.includes('ಗೊಬ್ಬರ') ||
      q.includes('खाद')
    ) {
      return 'fertilizer';
    }

    if (
      q.includes('weather') ||
      q.includes('rain') ||
      q.includes('temperature') ||
      q.includes('ಮಳೆ') ||
      q.includes('मौसम')
    ) {
      return 'weather';
    }

    if (
      q.includes('market') ||
      q.includes('price') ||
      q.includes('mandi')
    ) {
      return 'market';
    }

    if (
      q.includes('profit') ||
      q.includes('cost') ||
      q.includes('expense') ||
      q.includes('roi')
    ) {
      return 'profit';
    }

    if (
      q.includes('crop') ||
      q.includes('sowing') ||
      q.includes('plant')
    ) {
      return 'crop';
    }

    return 'general';
  };

  /* ------------------------------------------------------------------------ */
  /* Copy answer                                                              */
  /* ------------------------------------------------------------------------ */

  const copyMessage = async (message: ChatMessage) => {
    try {
      await navigator.clipboard.writeText(message.text);

      setCopiedMessageId(message.id);

      window.setTimeout(() => {
        setCopiedMessageId(null);
      }, 1800);
    } catch (error) {
      console.warn('Copy failed:', error);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Feedback                                                                 */
  /* ------------------------------------------------------------------------ */

  const giveFeedback = (
    messageId: string,
    feedback: 'positive' | 'negative'
  ) => {
    setMessages(prev =>
      prev.map(message =>
        message.id === messageId
          ? {
              ...message,
              feedback,
            }
          : message
      )
    );
  };

  /* ------------------------------------------------------------------------ */
  /* Clear conversation                                                       */
  /* ------------------------------------------------------------------------ */

  const clearConversation = () => {
    stopSpeaking();

    setMessages([
      {
        id: `welcome_${Date.now()}`,
        sender: 'assistant',
        text: `Conversation cleared. I am ready to help with your ${farmContext.crop} farm. 🌱`,
        timestamp: nowTime(),
        category: 'general',
      },
    ]);
  };

  /* ------------------------------------------------------------------------ */
  /* Quick actions                                                            */
  /* ------------------------------------------------------------------------ */

  const quickActions = [
    {
      label: '💧 Irrigation',
      query: `Should I irrigate my ${farmContext.crop} today based on the current soil, rainfall and weather conditions?`,
    },
    {
      label: '🐛 Disease risk',
      query: `What disease and pest risks should I watch for in my ${farmContext.crop} based on the current conditions?`,
    },
    {
      label: '🌱 Fertilizer',
      query: `What fertilizer and nutrient management should I consider for my ${farmContext.crop} based on my soil condition?`,
    },
    {
      label: '🌦 Weather',
      query: `How can the current and upcoming weather affect my ${farmContext.crop}?`,
    },
    {
      label: '📅 Crop calendar',
      query: `What important farm activities should I do now for my ${farmContext.crop} at its current growth stage?`,
    },
    {
      label: '💰 Profit',
      query: `How can I reduce production costs and improve profitability for my ${farmContext.crop}?`,
    },
  ];

  /* ------------------------------------------------------------------------ */
  /* Farm health indicators                                                   */
  /* ------------------------------------------------------------------------ */

  const farmIndicators = [
    {
      label: 'Temperature',
      value: formatNumber(farmContext.weather.temperature, '°C'),
      icon: <Waves className="w-4 h-4" />,
    },
    {
      label: 'Rainfall',
      value: formatNumber(farmContext.weather.rainfall24h, ' mm'),
      icon: <CloudRain className="w-4 h-4" />,
    },
    {
      label: 'Soil pH',
      value: formatNumber(farmContext.soil.ph),
      icon: <Leaf className="w-4 h-4" />,
    },
    {
      label: 'Moisture',
      value: formatNumber(farmContext.soil.moisture, '%'),
      icon: <Droplets className="w-4 h-4" />,
    },
  ];

  /* ------------------------------------------------------------------------ */
  /* Don't render closed modal                                                */
  /* ------------------------------------------------------------------------ */

  if (!isOpen) {
    return null;
  }

  /* ------------------------------------------------------------------------ */
  /* UI                                                                       */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4">
      <div className="relative flex h-[96vh] max-h-[900px] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xl">
        {/* ---------------------------------------------------------------- */}
        {/* HEADER                                                            */}
        {/* ---------------------------------------------------------------- */}

        <div className="relative shrink-0 overflow-hidden bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 px-4 py-4 text-white sm:px-6">
          <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-lime-300/10 blur-3xl" />

          <div className="relative flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur">
                <Bot className="h-6 w-6 text-emerald-100" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-base font-extrabold sm:text-lg">
                    AgriGo AI Farm Copilot
                  </h2>

                  <span className="rounded-full bg-emerald-950/40 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-100">
                    AI Powered
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-emerald-100/90">
                  <span className="flex items-center gap-1">
                    <Sprout className="h-3.5 w-3.5" />
                    {farmContext.crop}
                  </span>

                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {farmContext.location}
                  </span>

                  <span className="flex items-center gap-1">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isOnline ? 'bg-lime-300' : 'bg-rose-400'
                      }`}
                    />
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="flex items-center gap-1.5 rounded-xl bg-white/10 px-2.5 py-2 text-xs font-semibold transition hover:bg-white/20"
                  title="Stop speaking"
                >
                  <VolumeX className="h-4 w-4" />
                  <span className="hidden sm:inline">Stop</span>
                </button>
              )}

              <button
                onClick={clearConversation}
                className="rounded-xl p-2 transition hover:bg-white/10"
                title="Clear conversation"
              >
                <RefreshCw className="h-4 w-4" />
              </button>

              <button
                onClick={onClose}
                className="rounded-xl p-2 transition hover:bg-white/10"
                title="Close assistant"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* NAVIGATION                                                        */}
        {/* ---------------------------------------------------------------- */}

        <div className="flex shrink-0 border-b border-stone-200 bg-white px-3 sm:px-5">
          <button
            onClick={() => setActiveTab('chat')}
            className={`relative flex items-center gap-2 px-4 py-3 text-xs font-bold transition ${
              activeTab === 'chat'
                ? 'text-emerald-700'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Bot className="h-4 w-4" />
            AI Assistant

            {activeTab === 'chat' && (
              <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-emerald-600" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('farm')}
            className={`relative flex items-center gap-2 px-4 py-3 text-xs font-bold transition ${
              activeTab === 'farm'
                ? 'text-emerald-700'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Farm Context

            {activeTab === 'farm' && (
              <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-emerald-600" />
            )}
          </button>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* FARM CONTEXT TAB                                                  */}
        {/* ---------------------------------------------------------------- */}

        {activeTab === 'farm' ? (
          <div className="flex-1 overflow-y-auto bg-stone-50 p-4 sm:p-6">
            <div className="mx-auto max-w-4xl">
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  AI Decision Context
                </p>

                <h3 className="mt-1 text-xl font-extrabold text-stone-900">
                  Your farm snapshot
                </h3>

                <p className="mt-1 text-sm text-stone-500">
                  These details can be used by the AI to provide more
                  personalized agricultural recommendations.
                </p>
              </div>

              {/* Farm overview */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Sprout className="h-5 w-5" />
                  </div>

                  <p className="text-[11px] font-bold uppercase tracking-wide text-stone-400">
                    Crop
                  </p>

                  <p className="mt-1 font-bold text-stone-900">
                    {farmContext.crop}
                  </p>

                  <p className="mt-1 text-xs text-stone-500">
                    {farmContext.cropProfile.variety}
                  </p>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <MapPin className="h-5 w-5" />
                  </div>

                  <p className="text-[11px] font-bold uppercase tracking-wide text-stone-400">
                    Location
                  </p>

                  <p className="mt-1 font-bold text-stone-900">
                    {farmContext.location}
                  </p>

                  <p className="mt-1 text-xs text-stone-500">
                    Farm location context
                  </p>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                    <Leaf className="h-5 w-5" />
                  </div>

                  <p className="text-[11px] font-bold uppercase tracking-wide text-stone-400">
                    Soil
                  </p>

                  <p className="mt-1 font-bold text-stone-900">
                    {farmContext.soil.type}
                  </p>

                  <p className="mt-1 text-xs text-stone-500">
                    pH {formatNumber(farmContext.soil.ph)}
                  </p>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                    <Droplets className="h-5 w-5" />
                  </div>

                  <p className="text-[11px] font-bold uppercase tracking-wide text-stone-400">
                    Irrigation
                  </p>

                  <p className="mt-1 font-bold text-stone-900">
                    {farmContext.irrigation.method}
                  </p>

                  <p className="mt-1 text-xs text-stone-500">
                    {farmContext.irrigation.waterSource}
                  </p>
                </div>
              </div>

              {/* Telemetry */}
              <div className="mt-5 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-stone-900">
                      Farm telemetry
                    </h4>

                    <p className="text-xs text-stone-500">
                      Current available environmental indicators
                    </p>
                  </div>

                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Context Ready
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {farmIndicators.map(indicator => (
                    <div
                      key={indicator.label}
                      className="rounded-xl border border-stone-100 bg-stone-50 p-3"
                    >
                      <div className="flex items-center gap-2 text-stone-400">
                        {indicator.icon}
                        <span className="text-[10px] font-bold uppercase tracking-wide">
                          {indicator.label}
                        </span>
                      </div>

                      <p className="mt-2 text-lg font-extrabold text-stone-900">
                        {indicator.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Crop details */}
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-emerald-600" />

                    <h4 className="font-bold text-stone-900">
                      Crop details
                    </h4>
                  </div>

                  <div className="space-y-3 text-sm">
                    <InfoRow
                      label="Crop"
                      value={farmContext.crop}
                    />

                    <InfoRow
                      label="Variety"
                      value={farmContext.cropProfile.variety}
                    />

                    <InfoRow
                      label="Growth stage"
                      value={farmContext.cropProfile.growthStage}
                    />

                    <InfoRow
                      label="Sowing date"
                      value={farmContext.cropProfile.sowingDate}
                    />

                    <InfoRow
                      label="Area"
                      value={
                        farmContext.cropProfile.acreage !== null
                          ? `${farmContext.cropProfile.acreage} acre`
                          : 'Not available'
                      }
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-amber-600" />

                    <h4 className="font-bold text-stone-900">
                      Risk history
                    </h4>
                  </div>

                  {farmContext.diseaseHistory.length > 0 ? (
                    <div className="space-y-2">
                      {farmContext.diseaseHistory.map((disease, index) => (
                        <div
                          key={`${disease}-${index}`}
                          className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-900"
                        >
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                          <span>{disease}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
                      No disease history has been recorded.
                    </div>
                  )}
                </div>
              </div>

              {/* AI note */}
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                    <WandSparkles className="h-5 w-5" />
                  </div>

                  <div>
                    <h4 className="font-bold text-emerald-950">
                      How AgriGo uses this information
                    </h4>

                    <p className="mt-1 text-sm leading-relaxed text-emerald-900/80">
                      The assistant can combine crop, soil, weather,
                      irrigation and farm-history information to make advice
                      more relevant to your farm instead of giving generic
                      answers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* ------------------------------------------------------------ */}
            {/* FARM STATUS BAR                                                */}
            {/* ------------------------------------------------------------ */}

            {showFarmContext && (
              <div className="shrink-0 border-b border-stone-200 bg-stone-50 px-4 py-3 sm:px-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-800">
                      <Sprout className="h-3.5 w-3.5" />
                      {farmContext.crop}
                    </span>

                    <span className="flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold text-blue-800">
                      <CloudRain className="h-3.5 w-3.5" />
                      {formatNumber(
                        farmContext.weather.temperature,
                        '°C'
                      )}
                    </span>

                    <span className="flex items-center gap-1.5 rounded-full bg-cyan-100 px-2.5 py-1 text-[10px] font-bold text-cyan-800">
                      <Droplets className="h-3.5 w-3.5" />
                      Rain {formatNumber(
                        farmContext.weather.rainfall24h,
                        ' mm'
                      )}
                    </span>

                    <span className="hidden items-center gap-1.5 rounded-full bg-stone-200 px-2.5 py-1 text-[10px] font-bold text-stone-700 sm:flex">
                      <Leaf className="h-3.5 w-3.5" />
                      {farmContext.soil.type}
                    </span>
                  </div>

                  <button
                    onClick={() => setShowFarmContext(false)}
                    className="shrink-0 rounded-lg p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700"
                    title="Hide farm context"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------ */}
            {/* CHAT STREAM                                                     */}
            {/* ------------------------------------------------------------ */}

            <div className="flex-1 overflow-y-auto bg-gradient-to-b from-stone-50 to-white px-3 py-4 sm:px-5">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`mb-5 flex items-start gap-2.5 ${
                    message.sender === 'user'
                      ? 'flex-row-reverse'
                      : ''
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-sm ${
                      message.sender === 'user'
                        ? 'bg-stone-800 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {message.sender === 'user' ? (
                      <UserIcon className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>

                  {/* Message */}
                  <div
                    className={`max-w-[88%] sm:max-w-[78%] ${
                      message.sender === 'user'
                        ? 'items-end'
                        : 'items-start'
                    }`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-3 shadow-sm ${
                        message.sender === 'user'
                          ? 'rounded-tr-sm bg-stone-900 text-white'
                          : 'rounded-tl-sm border border-stone-200 bg-white text-stone-900'
                      }`}
                    >
                      {/* Category */}
                      {message.sender === 'assistant' &&
                        message.category && (
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                              {getCategoryIcon(message.category)}
                              {getCategoryLabel(message.category)}
                            </span>

                            {message.urgency && (
                              <span
                                className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                                  message.urgency === 'critical'
                                    ? 'bg-red-100 text-red-700'
                                    : message.urgency === 'high'
                                      ? 'bg-orange-100 text-orange-700'
                                      : message.urgency === 'medium'
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-emerald-100 text-emerald-700'
                                }`}
                              >
                                {getUrgencyLabel(message.urgency)}
                              </span>
                            )}
                          </div>
                        )}

                      <p className="whitespace-pre-wrap text-sm leading-6">
                        {message.text}
                      </p>

                      {/* Confidence */}
                      {message.sender === 'assistant' &&
                        message.confidence !== undefined && (
                          <div className="mt-3 border-t border-stone-100 pt-3">
                            <div className="mb-1 flex items-center justify-between">
                              <span className="text-[10px] font-semibold text-stone-400">
                                AI confidence
                              </span>

                              <span className="text-[10px] font-bold text-emerald-700">
                                {message.confidence}%
                              </span>
                            </div>

                            <div className="h-1.5 overflow-hidden rounded-full bg-stone-100">
                              <div
                                className="h-full rounded-full bg-emerald-500 transition-all"
                                style={{
                                  width: `${Math.max(
                                    0,
                                    Math.min(
                                      100,
                                      message.confidence
                                    )
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}

                      {/* Recommendation */}
                      {message.recommendations &&
                        message.recommendations.length > 0 && (
                          <div className="mt-3 rounded-xl bg-emerald-50 p-3">
                            <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                              <CheckCircle2 className="h-4 w-4" />
                              Recommended
                            </div>

                            <ul className="space-y-1.5">
                              {message.recommendations.map(
                                (item, index) => (
                                  <li
                                    key={index}
                                    className="flex gap-2 text-xs leading-relaxed text-emerald-900"
                                  >
                                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                                    {item}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                      {/* Why */}
                      {message.reasons &&
                        message.reasons.length > 0 && (
                          <div className="mt-3 rounded-xl bg-blue-50 p-3">
                            <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-blue-900">
                              <Lightbulb className="h-4 w-4" />
                              Why this advice?
                            </div>

                            <ul className="space-y-1.5">
                              {message.reasons.map((item, index) => (
                                <li
                                  key={index}
                                  className="text-xs leading-relaxed text-blue-900"
                                >
                                  • {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                      {/* Actions */}
                      {message.actions &&
                        message.actions.length > 0 && (
                          <div className="mt-3 rounded-xl bg-violet-50 p-3">
                            <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-violet-900">
                              <Zap className="h-4 w-4" />
                              Suggested actions
                            </div>

                            <div className="space-y-1.5">
                              {message.actions.map((item, index) => (
                                <div
                                  key={index}
                                  className="text-xs leading-relaxed text-violet-900"
                                >
                                  {index + 1}. {item}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Warnings */}
                      {message.warnings &&
                        message.warnings.length > 0 && (
                          <div className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3">
                            <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-red-800">
                              <AlertCircle className="h-4 w-4" />
                              Important
                            </div>

                            <ul className="space-y-1">
                              {message.warnings.map((item, index) => (
                                <li
                                  key={index}
                                  className="text-xs leading-relaxed text-red-800"
                                >
                                  • {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                      {/* Context factors */}
                      {message.factors &&
                        message.factors.length > 0 && (
                          <div className="mt-3">
                            <button
                              onClick={() =>
                                setExpandedMessage(
                                  expandedMessage === message.id
                                    ? null
                                    : message.id
                                )
                              }
                              className="flex items-center gap-1.5 text-[10px] font-bold text-stone-400 transition hover:text-emerald-700"
                            >
                              <BarChart3 className="h-3.5 w-3.5" />

                              {expandedMessage === message.id
                                ? 'Hide farm factors'
                                : 'Show farm factors'}

                              <ChevronDown
                                className={`h-3 w-3 transition-transform ${
                                  expandedMessage === message.id
                                    ? 'rotate-180'
                                    : ''
                                }`}
                              />
                            </button>

                            {expandedMessage === message.id && (
                              <div className="mt-2 rounded-xl bg-stone-50 p-3">
                                <ul className="space-y-1">
                                  {message.factors.map(
                                    (factor, index) => (
                                      <li
                                        key={index}
                                        className="text-[10px] text-stone-600"
                                      >
                                        ✓ {factor}
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                      {/* Timestamp / controls */}
                      <div
                        className={`mt-3 flex items-center justify-between gap-3 text-[10px] ${
                          message.sender === 'user'
                            ? 'text-stone-400'
                            : 'text-stone-400'
                        }`}
                      >
                        <span className="flex items-center gap-1">
                          <Clock3 className="h-3 w-3" />
                          {message.timestamp}
                        </span>

                        {message.sender === 'assistant' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                speakAnswer(message.text)
                              }
                              className="flex items-center gap-1 hover:text-emerald-700"
                              title="Listen"
                            >
                              <Volume2 className="h-3 w-3" />
                              Listen
                            </button>

                            <button
                              onClick={() =>
                                copyMessage(message)
                              }
                              className="flex items-center gap-1 hover:text-emerald-700"
                              title="Copy"
                            >
                              {copiedMessageId === message.id ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" />
                                  Copy
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Feedback */}
                    {message.sender === 'assistant' &&
                      message.id !== 'welcome' && (
                        <div className="mt-1.5 flex items-center gap-1 px-1">
                          <span className="mr-1 text-[9px] text-stone-400">
                            Was this useful?
                          </span>

                          <button
                            onClick={() =>
                              giveFeedback(
                                message.id,
                                'positive'
                              )
                            }
                            className={`rounded-lg p-1.5 transition ${
                              message.feedback === 'positive'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'text-stone-400 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                            title="Useful"
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() =>
                              giveFeedback(
                                message.id,
                                'negative'
                              )
                            }
                            className={`rounded-lg p-1.5 transition ${
                              message.feedback === 'negative'
                                ? 'bg-red-100 text-red-700'
                                : 'text-stone-400 hover:bg-red-50 hover:text-red-700'
                            }`}
                            title="Not useful"
                          >
                            <ThumbsDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              ))}

              {/* Loading */}
              {isLoading && (
                <div className="mb-5 flex items-start gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
                    <Bot className="h-4 w-4 animate-pulse" />
                  </div>

                  <div className="rounded-2xl rounded-tl-sm border border-stone-200 bg-white px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <Sparkles className="h-4 w-4 animate-pulse" />

                      <span className="text-xs font-semibold">
                        Analyzing farm conditions...
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400 [animation-delay:120ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400 [animation-delay:240ms]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* ------------------------------------------------------------ */}
            {/* QUICK ACTIONS                                                   */}
            {/* ------------------------------------------------------------ */}

            <div className="shrink-0 border-t border-stone-200 bg-stone-50/90 px-3 py-2.5 sm:px-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-stone-500">
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  Quick farm actions
                </span>

                {!showFarmContext && (
                  <button
                    onClick={() => setShowFarmContext(true)}
                    className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    Show farm context
                  </button>
                )}
              </div>

              <div className="flex gap-2 overflow-x-auto pb-0.5">
                {quickActions.map(action => (
                  <button
                    key={action.label}
                    onClick={() => handleSend(action.query)}
                    disabled={isLoading}
                    className="shrink-0 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-stone-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* VOICE STATUS                                                    */}
            {/* ------------------------------------------------------------ */}

            {isListening && (
              <div className="shrink-0 border-t border-emerald-200 bg-emerald-50 px-4 py-2">
                <div className="flex items-center justify-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-70" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-500" />
                  </span>

                  <span className="text-xs font-bold text-emerald-900">
                    Listening in {currentLanguageMeta.name}...
                  </span>

                  <div className="ml-1 flex items-center gap-1">
                    <span className="h-3 w-1 animate-pulse rounded-full bg-emerald-600" />
                    <span className="h-5 w-1 animate-pulse rounded-full bg-emerald-600 [animation-delay:100ms]" />
                    <span className="h-4 w-1 animate-pulse rounded-full bg-emerald-600 [animation-delay:200ms]" />
                    <span className="h-6 w-1 animate-pulse rounded-full bg-emerald-600 [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------ */}
            {/* INPUT                                                           */}
            {/* ------------------------------------------------------------ */}

            <div className="shrink-0 border-t border-stone-200 bg-white p-3 sm:p-4">
              <div className="flex items-end gap-2">
                <button
                  onClick={toggleListening}
                  disabled={isLoading}
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
                    isListening
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-200'
                      : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                  title={
                    isListening
                      ? 'Stop listening'
                      : 'Start voice input'
                  }
                >
                  {isListening ? (
                    <MicOff className="h-5 w-5 animate-pulse" />
                  ) : (
                    <Mic className="h-5 w-5" />
                  )}
                </button>

                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputText}
                    onChange={event =>
                      setInputText(event.target.value)
                    }
                    onKeyDown={event => {
                      if (
                        event.key === 'Enter' &&
                        !event.shiftKey
                      ) {
                        event.preventDefault();
                        handleSend();
                      }
                    }}
                    disabled={isLoading}
                    placeholder={
                      isListening
                        ? 'Listening... speak your question'
                        : language === 'kn'
                          ? 'ನಿಮ್ಮ ಕೃಷಿ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ...'
                          : language === 'hi'
                            ? 'अपना कृषि प्रश्न यहाँ लिखें...'
                            : language === 'te'
                              ? 'మీ వ్యవసాయ ప్రశ్నను ఇక్కడ టైప్ చేయండి...'
                              : language === 'ta'
                                ? 'உங்கள் விவசாய கேள்வியை இங்கே தட்டச்சு செய்யுங்கள்...'
                                : 'Ask AgriGo about your farm...'
                    }
                    className="h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 pr-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
                  />
                </div>

                <button
                  onClick={() => handleSend()}
                  disabled={!inputText.trim() || isLoading}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400"
                  title="Send question"
                >
                  {isLoading ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="flex items-center gap-1.5 text-[9px] leading-relaxed text-stone-400">
                  <ShieldAlert className="h-3 w-3 shrink-0" />
                  AI advice is informational. For serious crop disease or
                  chemical decisions, verify with a qualified agricultural
                  expert.
                </p>

                <span className="hidden shrink-0 text-[9px] font-semibold text-stone-400 sm:inline">
                  {currentLanguageMeta.nativeName}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Small reusable UI component                                                */
/* -------------------------------------------------------------------------- */

const InfoRow: React.FC<{
  label: string;
  value: string;
}> = ({ label, value }) => {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-stone-100 pb-2.5 last:border-0 last:pb-0">
      <span className="text-xs font-medium text-stone-500">
        {label}
      </span>

      <span className="text-right text-xs font-bold text-stone-900">
        {value}
      </span>
    </div>
  );
};

export default VoiceAssistantModal;