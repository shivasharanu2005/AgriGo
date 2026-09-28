import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.ts';
import {
  IndianRupee,
  MapPin,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  RefreshCw,
  Star,
  Heart,
  X,
  ChevronDown,
  ArrowUpDown,
  Navigation,
  CalendarDays,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  BarChart3,
  LocateFixed,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Wheat,
  Sprout,
  Leaf,
  Droplets,
  Package,
  Globe2,
  SearchCheck,
  Info,
} from 'lucide-react';
import { MarketPrice } from '../types/index.ts';

type ExtendedMarketPrice = MarketPrice & {
  state?: string;
  district?: string;
  variety?: string;
  commodity?: string;
  trend?: number;
  arrivals?: number;
  source?: string;
  marketName?: string;
  minPrice?: number;
  maxPrice?: number;
  avgPrice?: number;
};

type CropInfo = {
  name: string;
  category: string;
  aliases: string[];
  season: string;
  icon: string;
};

type GooglePriceResult = {
  cropName: string;
  answer: string;
  source?: string;
  checkedAt?: string;
  sources?: {
    title: string;
    url: string;
  }[];
};


const INDIAN_CROPS: CropInfo[] = [
  // Cereals
  {
    name: 'Rice',
    category: 'Cereals',
    aliases: ['Paddy', 'Dhan', 'Basmati Rice'],
    season: 'Kharif',
    icon: '🌾',
  },
  {
    name: 'Wheat',
    category: 'Cereals',
    aliases: ['Gehu'],
    season: 'Rabi',
    icon: '🌾',
  },
  {
    name: 'Maize',
    category: 'Cereals',
    aliases: ['Corn', 'Makka'],
    season: 'Kharif',
    icon: '🌽',
  },
  {
    name: 'Jowar',
    category: 'Cereals',
    aliases: ['Sorghum'],
    season: 'Kharif/Rabi',
    icon: '🌾',
  },
  {
    name: 'Bajra',
    category: 'Cereals',
    aliases: ['Pearl Millet'],
    season: 'Kharif',
    icon: '🌾',
  },
  {
    name: 'Ragi',
    category: 'Cereals',
    aliases: ['Finger Millet', 'Nachni'],
    season: 'Kharif',
    icon: '🌾',
  },
  {
    name: 'Barley',
    category: 'Cereals',
    aliases: ['Jau'],
    season: 'Rabi',
    icon: '🌾',
  },
  {
    name: 'Sorghum',
    category: 'Cereals',
    aliases: ['Jowar'],
    season: 'Kharif/Rabi',
    icon: '🌾',
  },

  // Pulses
  {
    name: 'Toor Dal',
    category: 'Pulses',
    aliases: ['Tur', 'Arhar', 'Pigeon Pea'],
    season: 'Kharif',
    icon: '🫘',
  },
  {
    name: 'Urad Dal',
    category: 'Pulses',
    aliases: ['Black Gram', 'Urad'],
    season: 'Kharif',
    icon: '🫘',
  },
  {
    name: 'Moong Dal',
    category: 'Pulses',
    aliases: ['Green Gram', 'Moong'],
    season: 'Kharif/Zaid',
    icon: '🫘',
  },
  {
    name: 'Chana',
    category: 'Pulses',
    aliases: ['Gram', 'Chickpea', 'Bengal Gram'],
    season: 'Rabi',
    icon: '🫘',
  },
  {
    name: 'Masoor Dal',
    category: 'Pulses',
    aliases: ['Lentil', 'Masoor'],
    season: 'Rabi',
    icon: '🫘',
  },
  {
    name: 'Horse Gram',
    category: 'Pulses',
    aliases: ['Hurali', 'Kulthi'],
    season: 'Kharif',
    icon: '🫘',
  },
  {
    name: 'Cowpea',
    category: 'Pulses',
    aliases: ['Lobia', 'Alasande'],
    season: 'Kharif',
    icon: '🫘',
  },
  {
    name: 'Field Pea',
    category: 'Pulses',
    aliases: ['Peas'],
    season: 'Rabi',
    icon: '🫘',
  },

  // Oilseeds
  {
    name: 'Groundnut',
    category: 'Oilseeds',
    aliases: ['Peanut', 'Moongfali'],
    season: 'Kharif',
    icon: '🥜',
  },
  {
    name: 'Soybean',
    category: 'Oilseeds',
    aliases: ['Soya'],
    season: 'Kharif',
    icon: '🌱',
  },
  {
    name: 'Sunflower',
    category: 'Oilseeds',
    aliases: ['Sunflower Seed'],
    season: 'Kharif/Rabi',
    icon: '🌻',
  },
  {
    name: 'Mustard',
    category: 'Oilseeds',
    aliases: ['Sarson', 'Rapeseed'],
    season: 'Rabi',
    icon: '🌼',
  },
  {
    name: 'Sesame',
    category: 'Oilseeds',
    aliases: ['Til', 'Gingelly'],
    season: 'Kharif',
    icon: '🌱',
  },
  {
    name: 'Castor',
    category: 'Oilseeds',
    aliases: ['Castor Seed'],
    season: 'Kharif',
    icon: '🌱',
  },
  {
    name: 'Safflower',
    category: 'Oilseeds',
    aliases: ['Kusum'],
    season: 'Rabi',
    icon: '🌱',
  },
  {
    name: 'Linseed',
    category: 'Oilseeds',
    aliases: ['Flaxseed', 'Alasi'],
    season: 'Rabi',
    icon: '🌱',
  },

  // Commercial crops
  {
    name: 'Cotton',
    category: 'Commercial',
    aliases: ['Kapas', 'Cotton Seed'],
    season: 'Kharif',
    icon: '☁️',
  },
  {
    name: 'Sugarcane',
    category: 'Commercial',
    aliases: ['Ganna'],
    season: 'Annual',
    icon: '🎋',
  },
  {
    name: 'Jute',
    category: 'Commercial',
    aliases: ['Patson'],
    season: 'Kharif',
    icon: '🌿',
  },
  {
    name: 'Tobacco',
    category: 'Commercial',
    aliases: ['Tobacco Leaf'],
    season: 'Rabi',
    icon: '🍃',
  },

  // Vegetables
  {
    name: 'Tomato',
    category: 'Vegetables',
    aliases: ['Tamatar'],
    season: 'All Season',
    icon: '🍅',
  },
  {
    name: 'Potato',
    category: 'Vegetables',
    aliases: ['Aloo'],
    season: 'Rabi',
    icon: '🥔',
  },
  {
    name: 'Onion',
    category: 'Vegetables',
    aliases: ['Pyaz'],
    season: 'Rabi/Kharif',
    icon: '🧅',
  },
  {
    name: 'Garlic',
    category: 'Vegetables',
    aliases: ['Lahsun'],
    season: 'Rabi',
    icon: '🧄',
  },
  {
    name: 'Green Chilli',
    category: 'Vegetables',
    aliases: ['Hari Mirch', 'Chilli'],
    season: 'All Season',
    icon: '🌶️',
  },
  {
    name: 'Brinjal',
    category: 'Vegetables',
    aliases: ['Eggplant', 'Baingan'],
    season: 'All Season',
    icon: '🍆',
  },
  {
    name: 'Cabbage',
    category: 'Vegetables',
    aliases: ['Patta Gobhi'],
    season: 'Rabi',
    icon: '🥬',
  },
  {
    name: 'Cauliflower',
    category: 'Vegetables',
    aliases: ['Phool Gobhi'],
    season: 'Rabi',
    icon: '🥦',
  },
  {
    name: 'Carrot',
    category: 'Vegetables',
    aliases: ['Gajar'],
    season: 'Rabi',
    icon: '🥕',
  },
  {
    name: 'Beetroot',
    category: 'Vegetables',
    aliases: ['Beet'],
    season: 'Rabi',
    icon: '🫜',
  },
  {
    name: 'Lady Finger',
    category: 'Vegetables',
    aliases: ['Okra', 'Bhindi'],
    season: 'Kharif',
    icon: '🥒',
  },
  {
    name: 'Cucumber',
    category: 'Vegetables',
    aliases: ['Kheera'],
    season: 'Zaid',
    icon: '🥒',
  },
  {
    name: 'Bottle Gourd',
    category: 'Vegetables',
    aliases: ['Lauki', 'Sorekayi'],
    season: 'All Season',
    icon: '🥒',
  },
  {
    name: 'Bitter Gourd',
    category: 'Vegetables',
    aliases: ['Karela'],
    season: 'All Season',
    icon: '🥒',
  },
  {
    name: 'Pumpkin',
    category: 'Vegetables',
    aliases: ['Kaddu', 'Kumbalakai'],
    season: 'Kharif',
    icon: '🎃',
  },
  {
    name: 'Beans',
    category: 'Vegetables',
    aliases: ['French Beans', 'Avarekalu'],
    season: 'All Season',
    icon: '🫛',
  },
  {
    name: 'Peas',
    category: 'Vegetables',
    aliases: ['Green Peas', 'Matar'],
    season: 'Rabi',
    icon: '🫛',
  },
  {
    name: 'Drumstick',
    category: 'Vegetables',
    aliases: ['Moringa', 'Nuggekai'],
    season: 'All Season',
    icon: '🌿',
  },

  // Fruits
  {
    name: 'Mango',
    category: 'Fruits',
    aliases: ['Aam'],
    season: 'Summer',
    icon: '🥭',
  },
  {
    name: 'Banana',
    category: 'Fruits',
    aliases: ['Kela'],
    season: 'All Season',
    icon: '🍌',
  },
  {
    name: 'Grapes',
    category: 'Fruits',
    aliases: ['Draksha'],
    season: 'Winter',
    icon: '🍇',
  },
  {
    name: 'Pomegranate',
    category: 'Fruits',
    aliases: ['Anar', 'Dalimb'],
    season: 'All Season',
    icon: '🍎',
  },
  {
    name: 'Papaya',
    category: 'Fruits',
    aliases: ['Papita'],
    season: 'All Season',
    icon: '🥭',
  },
  {
    name: 'Guava',
    category: 'Fruits',
    aliases: ['Amrud', 'Seebe Hannu'],
    season: 'All Season',
    icon: '🍐',
  },
  {
    name: 'Watermelon',
    category: 'Fruits',
    aliases: ['Tarbooz'],
    season: 'Summer',
    icon: '🍉',
  },
  {
    name: 'Muskmelon',
    category: 'Fruits',
    aliases: ['Kharbuja'],
    season: 'Summer',
    icon: '🍈',
  },
  {
    name: 'Orange',
    category: 'Fruits',
    aliases: ['Santra', 'Mandarin'],
    season: 'Winter',
    icon: '🍊',
  },
  {
    name: 'Lemon',
    category: 'Fruits',
    aliases: ['Nimbu', 'Nimbe Hannu'],
    season: 'All Season',
    icon: '🍋',
  },

  // Plantation
  {
    name: 'Coconut',
    category: 'Plantation',
    aliases: ['Nariyal', 'Thenginakai'],
    season: 'Perennial',
    icon: '🥥',
  },
  {
    name: 'Arecanut',
    category: 'Plantation',
    aliases: ['Supari', 'Adike'],
    season: 'Perennial',
    icon: '🌴',
  },
  {
    name: 'Cashew',
    category: 'Plantation',
    aliases: ['Kaju'],
    season: 'Perennial',
    icon: '🥜',
  },
  {
    name: 'Coffee',
    category: 'Plantation',
    aliases: ['Coffee Bean'],
    season: 'Perennial',
    icon: '☕',
  },
  {
    name: 'Tea',
    category: 'Plantation',
    aliases: ['Tea Leaf'],
    season: 'Perennial',
    icon: '🍃',
  },
  {
    name: 'Rubber',
    category: 'Plantation',
    aliases: ['Natural Rubber'],
    season: 'Perennial',
    icon: '🌳',
  },

  // Spices
  {
    name: 'Turmeric',
    category: 'Spices',
    aliases: ['Haldi', 'Arishina'],
    season: 'Kharif',
    icon: '🟡',
  },
  {
    name: 'Ginger',
    category: 'Spices',
    aliases: ['Adrak', 'Shunti'],
    season: 'Kharif',
    icon: '🫚',
  },
  {
    name: 'Black Pepper',
    category: 'Spices',
    aliases: ['Pepper', 'Kali Mirch'],
    season: 'Perennial',
    icon: '⚫',
  },
  {
    name: 'Cardamom',
    category: 'Spices',
    aliases: ['Elaichi'],
    season: 'Perennial',
    icon: '🌿',
  },
  {
    name: 'Cumin',
    category: 'Spices',
    aliases: ['Jeera'],
    season: 'Rabi',
    icon: '🌱',
  },
  {
    name: 'Coriander',
    category: 'Spices',
    aliases: ['Dhaniya'],
    season: 'Rabi',
    icon: '🌿',
  },
  {
    name: 'Fenugreek',
    category: 'Spices',
    aliases: ['Methi'],
    season: 'Rabi',
    icon: '🌿',
  },
  {
    name: 'Fennel',
    category: 'Spices',
    aliases: ['Saunf'],
    season: 'Rabi',
    icon: '🌱',
  },
  {
    name: 'Chilli',
    category: 'Spices',
    aliases: ['Dry Chilli', 'Lal Mirch'],
    season: 'Kharif',
    icon: '🌶️',
  },

  // Seeds
  {
    name: 'Sesame Seed',
    category: 'Seeds',
    aliases: ['Til Seed'],
    season: 'Kharif',
    icon: '🌱',
  },
  {
    name: 'Mustard Seed',
    category: 'Seeds',
    aliases: ['Sarson Seed'],
    season: 'Rabi',
    icon: '🌱',
  },
  {
    name: 'Groundnut Seed',
    category: 'Seeds',
    aliases: ['Peanut Seed'],
    season: 'Kharif',
    icon: '🥜',
  },
  {
    name: 'Sunflower Seed',
    category: 'Seeds',
    aliases: ['Surajmukhi Seed'],
    season: 'Kharif/Rabi',
    icon: '🌻',
  },
  {
    name: 'Soybean Seed',
    category: 'Seeds',
    aliases: ['Soya Seed'],
    season: 'Kharif',
    icon: '🌱',
  },
  {
    name: 'Maize Seed',
    category: 'Seeds',
    aliases: ['Corn Seed'],
    season: 'Kharif',
    icon: '🌽',
  },
  {
    name: 'Paddy Seed',
    category: 'Seeds',
    aliases: ['Rice Seed'],
    season: 'Kharif',
    icon: '🌾',
  },
  {
    name: 'Cotton Seed',
    category: 'Seeds',
    aliases: ['Kapas Seed'],
    season: 'Kharif',
    icon: '☁️',
  },
  {
    name: 'Ragi Seed',
    category: 'Seeds',
    aliases: ['Finger Millet Seed'],
    season: 'Kharif',
    icon: '🌾',
  },
  {
    name: 'Jowar Seed',
    category: 'Seeds',
    aliases: ['Sorghum Seed'],
    season: 'Kharif',
    icon: '🌾',
  },
  {
    name: 'Bajra Seed',
    category: 'Seeds',
    aliases: ['Pearl Millet Seed'],
    season: 'Kharif',
    icon: '🌾',
  },
  {
    name: 'Chickpea Seed',
    category: 'Seeds',
    aliases: ['Chana Seed', 'Gram Seed'],
    season: 'Rabi',
    icon: '🫘',
  },
  {
    name: 'Moong Seed',
    category: 'Seeds',
    aliases: ['Green Gram Seed'],
    season: 'Kharif',
    icon: '🫘',
  },
  {
    name: 'Urad Seed',
    category: 'Seeds',
    aliases: ['Black Gram Seed'],
    season: 'Kharif',
    icon: '🫘',
  },
  {
    name: 'Toor Seed',
    category: 'Seeds',
    aliases: ['Arhar Seed', 'Tur Seed'],
    season: 'Kharif',
    icon: '🫘',
  },
];

const CATEGORIES = [
  'All',
  'Cereals',
  'Pulses',
  'Oilseeds',
  'Commercial',
  'Vegetables',
  'Fruits',
  'Plantation',
  'Spices',
  'Seeds',
];

const STATES = [
  'All India',
  'Karnataka',
  'Andhra Pradesh',
  'Telangana',
  'Tamil Nadu',
  'Maharashtra',
  'Gujarat',
  'Madhya Pradesh',
  'Rajasthan',
  'Uttar Pradesh',
  'Punjab',
  'Haryana',
  'West Bengal',
  'Odisha',
  'Bihar',
  'Kerala',
];

const MARKET_NAMES: Record<string, string> = {
  mkt_1: 'APMC Kolar',
  mkt_2: 'APMC Mulbagal',
  mkt_3: 'APMC Yeshwanthpur',
  mkt_4: 'APMC Bengaluru',
  mkt_5: 'APMC Tumakuru',
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const getMarketName = (marketId?: string) =>
  MARKET_NAMES[marketId || ''] ||
  'Agricultural Market';

const getTrend = (price: ExtendedMarketPrice) => {
  if (typeof price.trend === 'number') {
    return price.trend;
  }

  const spread =
    Number(price.maxPrice || 0) -
    Number(price.minPrice || 0);

  if (!spread) return 0;

  return Math.round(
    ((Number(price.avgPrice || 0) -
      Number(price.minPrice || 0)) /
      spread) *
    10
  );
};

export const MandiPricesPage: React.FC = () => {
  const [prices, setPrices] = useState<
    ExtendedMarketPrice[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [googleLoading, setGoogleLoading] =
    useState(false);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState('All');

  const [selectedState, setSelectedState] =
    useState('All India');

  const [selectedMarket, setSelectedMarket] =
    useState('All');

  const [sortBy, setSortBy] =
    useState('recommended');

  const [showFilters, setShowFilters] =
    useState(false);

  const [favorites, setFavorites] = useState<string[]>(
    []
  );

  const [selectedCrop, setSelectedCrop] =
    useState<CropInfo | null>(null);

  const [googleResult, setGoogleResult] =
    useState<GooglePriceResult | null>(null);

  const [seedResults, setSeedResults] = useState<
    Record<string, GooglePriceResult>
  >({});

  const [seedLoading, setSeedLoading] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] =
    useState('');

  const [lastUpdated, setLastUpdated] =
    useState<Date | null>(null);

  useEffect(() => {
    loadPrices();

    const savedFavorites =
      localStorage.getItem('mandi_favorite_crops');

    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch {
        setFavorites([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      'mandi_favorite_crops',
      JSON.stringify(favorites)
    );
  }, [favorites]);

  const loadPrices = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const data = await api.getMandiPrices();

      if (Array.isArray(data)) {
        setPrices(data as ExtendedMarketPrice[]);
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error(
        'Failed to load mandi prices:',
        err
      );

      setErrorMessage(
        'Unable to load live mandi data. You can still search crops using the crop catalogue.'
      );
    } finally {
      setLoading(false);
    }
  };

  const searchGooglePrice = async (
    cropName: string
  ) => {
    if (!cropName.trim()) return;

    setGoogleLoading(true);
    setGoogleResult(null);
    setErrorMessage('');

    try {
      /*
       * IMPORTANT:
       * This endpoint should be implemented in Django.
       *
       * Example:
       * POST /api/mandi/google-search/
       *
       * Body:
       * { cropName: "Tomato", state: "Karnataka" }
       *
       * The Django backend should call Gemini with
       * Google Search grounding enabled.
       */
      const response = await fetch(
        '/api/mandi/google-search',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cropName,
            state: selectedState,
            market:
              selectedMarket === 'All'
                ? ''
                : selectedMarket,
          }),
        }
      );

      const result = (await response.json()) as GooglePriceResult & { error?: string };
      if (!response.ok) {
        throw new Error(result.error || `Google price service returned ${response.status}`);
      }

      setGoogleResult(result);
    } catch (error) {
      console.error(
        'Google grounded mandi search failed:',
        error
      );

      setErrorMessage(error instanceof Error ? error.message : 'Unable to retrieve a live Google-grounded price right now.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const searchSeedPrice = async (seedName: string) => {
    setSeedLoading(seedName);
    setErrorMessage('');

    try {
      const response = await fetch('/api/mandi/google-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cropName: seedName,
          state: selectedState,
          market: selectedMarket === 'All' ? '' : selectedMarket,
        }),
      });

      const result = (await response.json()) as GooglePriceResult & { error?: string };
      if (!response.ok) throw new Error(result.error || 'Seed price search failed.');
      setSeedResults((current) => ({ ...current, [seedName]: result }));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to check this seed price.');
    } finally {
      setSeedLoading(null);
    }
  };

  const seedCatalogue = useMemo(
    () => INDIAN_CROPS.filter((crop) => crop.category === 'Seeds'),
    [],
  );

  const toggleFavorite = (cropName: string) => {
    setFavorites((current) =>
      current.includes(cropName)
        ? current.filter((item) => item !== cropName)
        : [...current, cropName]
    );
  };

  const availableMarkets = useMemo(() => {
    const names = prices.map((price) =>
      getMarketName(price.marketId)
    );

    return [
      'All',
      ...Array.from(new Set(names)),
    ];
  }, [prices]);

  const cropSuggestions = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) return INDIAN_CROPS.slice(0, 16);

    return INDIAN_CROPS.filter((crop) => {
      const text = [
        crop.name,
        crop.category,
        crop.season,
        ...crop.aliases,
      ]
        .join(' ')
        .toLowerCase();

      return text.includes(query);
    }).slice(0, 20);
  }, [search]);

  const filteredPrices = useMemo(() => {
    const query = search.trim().toLowerCase();

    let result = prices.filter((price) => {
      const cropName = (
        price.cropName ||
        price.commodity ||
        ''
      ).toLowerCase();

      const marketName = getMarketName(
        price.marketId
      ).toLowerCase();

      const state = (
        price.state || ''
      ).toLowerCase();

      const matchesSearch =
        !query ||
        cropName.includes(query) ||
        marketName.includes(query) ||
        state.includes(query);

      const matchesState =
        selectedState === 'All India' ||
        !price.state ||
        price.state === selectedState;

      const matchesMarket =
        selectedMarket === 'All' ||
        marketName === selectedMarket;

      const crop = INDIAN_CROPS.find(
        (item) =>
          item.name.toLowerCase() ===
          cropName
      );

      const matchesCategory =
        selectedCategory === 'All' ||
        crop?.category === selectedCategory;

      return (
        matchesSearch &&
        matchesState &&
        matchesMarket &&
        matchesCategory
      );
    });

    result = [...result];

    if (sortBy === 'priceLow') {
      result.sort(
        (a, b) =>
          Number(a.avgPrice || 0) -
          Number(b.avgPrice || 0)
      );
    }

    if (sortBy === 'priceHigh') {
      result.sort(
        (a, b) =>
          Number(b.avgPrice || 0) -
          Number(a.avgPrice || 0)
      );
    }

    if (sortBy === 'crop') {
      result.sort((a, b) =>
        String(a.cropName).localeCompare(
          String(b.cropName)
        )
      );
    }

    return result;
  }, [
    prices,
    search,
    selectedState,
    selectedMarket,
    selectedCategory,
    sortBy,
  ]);

  const popularCrops = useMemo(() => {
    const names = prices
      .map((item) => item.cropName)
      .filter(Boolean);

    return Array.from(new Set(names)).slice(0, 10);
  }, [prices]);

  const currentSearchCrop = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) return null;

    return INDIAN_CROPS.find(
      (crop) =>
        crop.name.toLowerCase() === query ||
        crop.aliases.some(
          (alias) =>
            alias.toLowerCase() === query
        )
    );
  }, [search]);

  const liveMatchingPrice = useMemo(() => {
    if (!search.trim()) return null;

    const query = search
      .trim()
      .toLowerCase();

    return (
      prices.find((price) => {
        const name = String(
          price.cropName || ''
        ).toLowerCase();

        return (
          name === query ||
          name.includes(query)
        );
      }) || null
    );
  }, [prices, search]);

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedState('All India');
    setSelectedMarket('All');
    setSortBy('recommended');
    setGoogleResult(null);
  };

  const handleCropClick = (crop: CropInfo) => {
    setSelectedCrop(crop);
    setSearch(crop.name);
  };

  return (
    <div className="min-h-screen bg-[#f5f8f4] pb-16">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-800 to-teal-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-32 -right-20 text-[240px]">
            🌾
          </div>

          <div className="absolute -bottom-28 -left-20 text-[220px]">
            🌱
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-3 py-1.5 text-xs font-bold mb-5">
              <Globe2 className="w-4 h-4 text-emerald-200" />
              INDIA AGRICULTURAL MARKET INTELLIGENCE
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
              Mandi Prices
              <span className="block text-emerald-300">
                Before You Sell
              </span>
            </h1>

            <p className="mt-4 text-emerald-100 max-w-2xl text-sm sm:text-base leading-relaxed">
              Search thousands of crops and compare
              mandi prices across India. Use live market
              data and Google-grounded agricultural
              information to make better selling decisions.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2.5 border border-white/10">
                <BarChart3 className="w-5 h-5 text-emerald-300" />
                <div>
                  <div className="font-black">
                    {prices.length}
                  </div>
                  <div className="text-[10px] text-emerald-200">
                    Market Records
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2.5 border border-white/10">
                <Wheat className="w-5 h-5 text-yellow-300" />
                <div>
                  <div className="font-black">
                    {INDIAN_CROPS.length}+
                  </div>
                  <div className="text-[10px] text-emerald-200">
                    Crops & Seeds
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2.5 border border-white/10">
                <ShieldCheck className="w-5 h-5 text-blue-300" />
                <div>
                  <div className="font-black">
                    India
                  </div>
                  <div className="text-[10px] text-emerald-200">
                    Market Coverage
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        {/* SEARCH */}
        <div className="bg-white rounded-3xl shadow-xl border border-stone-200 p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search crop, seed or mandi — e.g. Tomato, Rice, Ragi..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none text-sm transition-all"
              />
            </div>

            <button
              onClick={() =>
                searchGooglePrice(
                  search || 'Tomato'
                )
              }
              disabled={
                googleLoading ||
                !search.trim()
              }
              className="flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-blue-600/20"
            >
              {googleLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              {googleLoading
                ? 'Checking...'
                : 'Google Live Search'}
            </button>

            <button
              onClick={() =>
                setShowFilters(!showFilters)
              }
              className={`flex items-center justify-center gap-2 px-5 py-4 rounded-2xl border font-bold text-sm ${showFilters
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'bg-white border-stone-200 text-stone-700'
                }`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* SUGGESTIONS */}
          {search.trim() && (
            <div className="mt-3 border-t border-stone-100 pt-3">
              <div className="text-[10px] font-black uppercase tracking-wider text-stone-400 mb-2">
                Crop Suggestions
              </div>

              <div className="flex flex-wrap gap-2">
                {cropSuggestions
                  .slice(0, 10)
                  .map((crop) => (
                    <button
                      key={crop.name}
                      onClick={() =>
                        handleCropClick(crop)
                      }
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold"
                    >
                      <span>{crop.icon}</span>
                      {crop.name}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {showFilters && (
            <div className="mt-4 p-5 bg-stone-50 rounded-2xl border border-stone-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-600">
                    State
                  </label>

                  <select
                    value={selectedState}
                    onChange={(event) =>
                      setSelectedState(
                        event.target.value
                      )
                    }
                    className="w-full mt-2 px-3 py-3 rounded-xl border border-stone-200 bg-white outline-none focus:border-emerald-500 text-sm"
                  >
                    {STATES.map((state) => (
                      <option key={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-600">
                    Crop Category
                  </label>

                  <select
                    value={selectedCategory}
                    onChange={(event) =>
                      setSelectedCategory(
                        event.target.value
                      )
                    }
                    className="w-full mt-2 px-3 py-3 rounded-xl border border-stone-200 bg-white outline-none focus:border-emerald-500 text-sm"
                  >
                    {CATEGORIES.map((item) => (
                      <option key={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-600">
                    Market
                  </label>

                  <select
                    value={selectedMarket}
                    onChange={(event) =>
                      setSelectedMarket(
                        event.target.value
                      )
                    }
                    className="w-full mt-2 px-3 py-3 rounded-xl border border-stone-200 bg-white outline-none focus:border-emerald-500 text-sm"
                  >
                    {availableMarkets.map(
                      (market) => (
                        <option
                          key={market}
                          value={market}
                        >
                          {market === 'All'
                            ? 'All Markets'
                            : market}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-600">
                    Sort Prices
                  </label>

                  <select
                    value={sortBy}
                    onChange={(event) =>
                      setSortBy(event.target.value)
                    }
                    className="w-full mt-2 px-3 py-3 rounded-xl border border-stone-200 bg-white outline-none focus:border-emerald-500 text-sm"
                  >
                    <option value="recommended">
                      Recommended
                    </option>
                    <option value="priceLow">
                      Lowest Price
                    </option>
                    <option value="priceHigh">
                      Highest Price
                    </option>
                    <option value="crop">
                      Crop Name
                    </option>
                  </select>
                </div>
              </div>

              <button
                onClick={clearFilters}
                className="mt-4 flex items-center gap-2 text-xs font-bold text-rose-600"
              >
                <X className="w-4 h-4" />
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* LIVE GOOGLE RESULT */}
        {googleResult && (
          <section className="mt-6 bg-gradient-to-br from-blue-950 to-indigo-900 text-white rounded-3xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-blue-200 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  Google Grounded Market Intelligence
                </div>

                <h2 className="text-2xl font-black mt-2">
                  {googleResult.cropName}
                </h2>

                <p className="mt-4 text-blue-100 text-sm leading-relaxed whitespace-pre-line">
                  {googleResult.answer}
                </p>
              </div>

              <button
                onClick={() =>
                  setGoogleResult(null)
                }
                className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {googleResult.sources &&
              googleResult.sources.length > 0 && (
                <div className="mt-5 pt-4 border-t border-white/10">
                  <div className="text-xs font-bold text-blue-200 mb-2">
                    Sources
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {googleResult.sources
                      .slice(0, 5)
                      .map((source) => (
                        <a
                          key={source.url}
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs"
                        >
                          {source.title}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                  </div>
                </div>
              )}

            <div className="mt-4 flex items-center gap-2 text-[10px] text-blue-300">
              <Clock3 className="w-3.5 h-3.5" />
              Checked{' '}
              {googleResult.checkedAt ||
                new Date().toLocaleString('en-IN')}
            </div>
          </section>
        )}

        {/* ERROR */}
        {errorMessage && (
          <div className="mt-5 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <div className="font-bold text-sm">
                Live data notice
              </div>
              <div className="text-xs mt-1">
                {errorMessage}
              </div>
            </div>
          </div>
        )}

        {/* CROP CATALOGUE */}
        <section className="mt-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-600" />
                <h2 className="text-xl font-black text-stone-900">
                  Indian Crop & Seed Catalogue
                </h2>
              </div>

              <p className="text-sm text-stone-500 mt-1">
                Search crops by English name, local name or
                common market name.
              </p>
            </div>

            <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full">
              {INDIAN_CROPS.length}+ crops
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
            {CATEGORIES.map((item) => (
              <button
                key={item}
                onClick={() =>
                  setSelectedCategory(item)
                }
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold border ${selectedCategory === item
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-emerald-300'
                  }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-3">
            {INDIAN_CROPS.filter(
              (crop) =>
                selectedCategory === 'All' ||
                crop.category === selectedCategory
            )
              .slice(0, 40)
              .map((crop) => (
                <button
                  key={crop.name}
                  onClick={() =>
                    handleCropClick(crop)
                  }
                  className="group bg-white border border-stone-200 rounded-2xl p-3 text-left hover:border-emerald-400 hover:shadow-md transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {crop.icon}
                  </div>

                  <div className="font-bold text-xs text-stone-800 mt-2 line-clamp-1">
                    {crop.name}
                  </div>

                  <div className="text-[9px] text-stone-400 mt-1">
                    {crop.category}
                  </div>
                </button>
              ))}
          </div>
        </section>

        {/* SEED MARKET PRICE DIRECTORY */}
        <section className="mt-10 rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-700">
                <Sprout className="h-5 w-5" />
                <span className="text-xs font-black uppercase tracking-[0.14em]">India seed market</span>
              </div>
              <h2 className="mt-2 text-2xl font-black text-stone-900">All available crop seeds</h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-stone-600">
                Check the latest web-grounded reference price for each seed. Results are shown separately from harvested-crop mandi prices and include available source links.
              </p>
            </div>
            <span className="w-fit rounded-full bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-sm">
              {seedCatalogue.length} seed types
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {seedCatalogue.map((seed) => {
              const result = seedResults[seed.name];
              const isLoading = seedLoading === seed.name;

              return (
                <article key={seed.name} className="rounded-2xl border border-stone-200 bg-white p-4 transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-100 text-2xl">{seed.icon}</span>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-black text-stone-900">{seed.name}</h3>
                        <p className="mt-0.5 text-[11px] text-stone-500">{seed.season} · {seed.aliases[0] || 'Indian seed'}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => searchSeedPrice(seed.name)}
                      disabled={seedLoading !== null}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-[11px] font-bold text-white transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60"
                    >
                      {isLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <SearchCheck className="h-3.5 w-3.5" />}
                      {isLoading ? 'Checking' : 'Price'}
                    </button>
                  </div>

                  {result ? (
                    <div className="mt-3 rounded-xl bg-emerald-50 p-3">
                      <p className="whitespace-pre-line text-xs leading-relaxed text-stone-700">{result.answer}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-semibold text-emerald-700">Web checked {result.checkedAt ? new Date(result.checkedAt).toLocaleDateString('en-IN') : ''}</span>
                        {result.sources?.slice(0, 2).map((source) => (
                          <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 hover:underline">
                            {source.title.slice(0, 22)} <ExternalLink className="h-3 w-3" />
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-[11px] text-stone-400">No seed price checked yet.</p>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        {/* SELECTED CROP INFORMATION */}
        {selectedCrop && (
          <section className="mt-8 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-3xl p-6">
            <div className="flex justify-between gap-4">
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-4xl">
                  {selectedCrop.icon}
                </div>

                <div>
                  <div className="text-xs text-emerald-600 font-bold uppercase">
                    Selected Crop
                  </div>

                  <h2 className="text-2xl font-black text-stone-900">
                    {selectedCrop.name}
                  </h2>

                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-2.5 py-1 rounded-full bg-white text-xs font-bold text-stone-600">
                      {selectedCrop.category}
                    </span>

                    <span className="px-2.5 py-1 rounded-full bg-white text-xs font-bold text-stone-600">
                      {selectedCrop.season}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  setSelectedCrop(null)
                }
                className="w-9 h-9 rounded-xl bg-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-5">
              <div className="text-xs font-bold text-stone-500 mb-2">
                Common Names
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedCrop.aliases.map(
                  (alias) => (
                    <span
                      key={alias}
                      className="px-3 py-1.5 bg-white rounded-lg text-xs text-stone-600 font-semibold"
                    >
                      {alias}
                    </span>
                  )
                )}
              </div>
            </div>

            <button
              onClick={() =>
                searchGooglePrice(
                  selectedCrop.name
                )
              }
              className="mt-5 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold"
            >
              <SearchCheck className="w-4 h-4" />
              Check Current {selectedCrop.name} Price
            </button>
          </section>
        )}

        {/* CURRENT MARKET DATA */}
        <section className="mt-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                <h2 className="text-xl font-black text-stone-900">
                  Current Mandi Prices
                </h2>
              </div>

              <p className="text-sm text-stone-500 mt-1">
                Government market-price records available
                through your configured API.
              </p>
            </div>

            <button
              onClick={loadPrices}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? 'animate-spin' : ''
                  }`}
              />
              Refresh Prices
            </button>
          </div>

          {lastUpdated && (
            <div className="mb-5 flex items-center gap-2 text-[11px] text-stone-400">
              <Clock3 className="w-3.5 h-3.5" />
              Last checked:{' '}
              {lastUpdated.toLocaleString(
                'en-IN'
              )}
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-3xl border border-stone-200 py-20 flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <IndianRupee className="w-7 h-7 text-emerald-600 animate-pulse" />
              </div>

              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mt-5" />

              <p className="mt-4 text-sm font-semibold text-stone-500">
                Loading mandi prices...
              </p>
            </div>
          ) : filteredPrices.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 py-16 text-center">
              <div className="text-5xl">🌾</div>

              <h3 className="text-xl font-black text-stone-800 mt-4">
                No matching mandi record
              </h3>

              <p className="text-sm text-stone-500 mt-2">
                Try another crop or use Google Live Search
                for current web-grounded information.
              </p>

              {search && (
                <button
                  onClick={() =>
                    searchGooglePrice(search)
                  }
                  className="mt-5 inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-bold text-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  Search Current Price
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredPrices.map((price) => {
                const trend = getTrend(price);

                const cropInfo =
                  INDIAN_CROPS.find(
                    (crop) =>
                      crop.name.toLowerCase() ===
                      String(
                        price.cropName
                      ).toLowerCase()
                  );

                const favorite = favorites.includes(
                  String(price.cropName)
                );

                return (
                  <div
                    key={price.id}
                    className="group bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden"
                  >
                    <div className="p-5">
                      <div className="flex justify-between gap-3">
                        <div className="flex gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-2xl">
                            {cropInfo?.icon ||
                              '🌾'}
                          </div>

                          <div>
                            <h3 className="font-black text-stone-900">
                              {price.cropName}
                            </h3>

                            <div className="flex items-center gap-1 text-xs text-stone-500 mt-1">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                              {getMarketName(
                                price.marketId
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            toggleFavorite(
                              String(
                                price.cropName
                              )
                            )
                          }
                          className="w-9 h-9 rounded-xl bg-stone-50 flex items-center justify-center"
                        >
                          <Heart
                            className={`w-4 h-4 ${favorite
                              ? 'fill-rose-500 text-rose-500'
                              : 'text-stone-400'
                              }`}
                          />
                        </button>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
                          <CalendarDays className="w-3 h-3" />
                          {price.date}
                        </span>

                        {price.source && (
                          <span className="text-[9px] text-stone-400">
                            {price.source}
                          </span>
                        )}
                      </div>

                      <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                        <div className="text-xs text-emerald-700 font-semibold">
                          Modal / Average Price
                        </div>

                        <div className="flex items-baseline gap-1 mt-1">
                          <IndianRupee className="w-5 h-5 text-emerald-700" />

                          <span className="text-3xl font-black text-stone-900">
                            {formatCurrency(
                              Number(
                                price.avgPrice || 0
                              )
                            )}
                          </span>

                          <span className="text-xs text-stone-500">
                            / quintal
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div className="p-3 rounded-xl border border-stone-100 bg-stone-50">
                          <span className="text-[10px] uppercase font-bold text-stone-400">
                            Min
                          </span>

                          <div className="flex items-center gap-1 mt-1 text-rose-600 font-black">
                            <TrendingDown className="w-4 h-4" />
                            ₹
                            {formatCurrency(
                              Number(
                                price.minPrice || 0
                              )
                            )}
                          </div>
                        </div>

                        <div className="p-3 rounded-xl border border-stone-100 bg-stone-50">
                          <span className="text-[10px] uppercase font-bold text-stone-400">
                            Max
                          </span>

                          <div className="flex items-center gap-1 mt-1 text-emerald-600 font-black">
                            <TrendingUp className="w-4 h-4" />
                            ₹
                            {formatCurrency(
                              Number(
                                price.maxPrice || 0
                              )
                            )}
                          </div>
                        </div>
                      </div>

                      {typeof price.arrivals ===
                        'number' && (
                          <div className="mt-3 flex items-center justify-between text-xs">
                            <span className="text-stone-500">
                              Market arrivals
                            </span>

                            <span className="font-bold text-stone-800">
                              {formatCurrency(
                                price.arrivals
                              )}{' '}
                              qtl
                            </span>
                          </div>
                        )}

                      <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
                        <div
                          className={`flex items-center gap-1.5 text-xs font-bold ${trend >= 5
                            ? 'text-emerald-600'
                            : trend < 0
                              ? 'text-rose-600'
                              : 'text-stone-500'
                            }`}
                        >
                          {trend >= 5 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}

                          {trend >= 5
                            ? 'Price strength'
                            : 'Market range'}
                        </div>

                        <button
                          onClick={() => {
                            setSearch(
                              String(
                                price.cropName
                              )
                            );

                            searchGooglePrice(
                              String(
                                price.cropName
                              )
                            );
                          }}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Verify Live
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* POPULAR CROPS */}
        {popularCrops.length > 0 && (
          <section className="mt-10">
            <div className="bg-white rounded-3xl border border-stone-200 p-6">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                <h2 className="text-xl font-black text-stone-900">
                  Popular Crops in Market Data
                </h2>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {popularCrops.map((crop) => (
                  <button
                    key={crop}
                    onClick={() => {
                      setSearch(crop);
                      setSelectedCrop(
                        INDIAN_CROPS.find(
                          (item) =>
                            item.name.toLowerCase() ===
                            crop.toLowerCase()
                        ) || null
                      );
                    }}
                    className="px-4 py-2.5 rounded-xl bg-stone-50 hover:bg-emerald-50 hover:text-emerald-700 border border-stone-100 text-xs font-bold"
                  >
                    {crop}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* TRUST / SOURCE INFORMATION */}
        <section className="mt-10 bg-gradient-to-r from-stone-900 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white">
          <div className="flex flex-col lg:flex-row gap-6 justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                Data Transparency
              </div>

              <h2 className="text-2xl font-black mt-2">
                Don't trust a price without checking its source.
              </h2>

              <p className="text-stone-300 text-sm leading-relaxed mt-3">
                Your application should display the source,
                market, commodity, variety, date and unit for
                every price. Google Search should be used as a
                grounded verification layer rather than blindly
                replacing official mandi records.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:w-80">
              <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                <div className="font-black mt-2">
                  Source
                </div>
                <div className="text-[10px] text-stone-400">
                  Displayed
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
                <CalendarDays className="w-5 h-5 text-blue-300" />
                <div className="font-black mt-2">
                  Date
                </div>
                <div className="text-[10px] text-stone-400">
                  Displayed
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
                <MapPin className="w-5 h-5 text-amber-300" />
                <div className="font-black mt-2">
                  Market
                </div>
                <div className="text-[10px] text-stone-400">
                  Displayed
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
                <SearchCheck className="w-5 h-5 text-purple-300" />
                <div className="font-black mt-2">
                  Google
                </div>
                <div className="text-[10px] text-stone-400">
                  Verification
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default MandiPricesPage;