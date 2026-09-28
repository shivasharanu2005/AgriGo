import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import {
  Tractor,
  MapPin,
  Calendar,
  CheckCircle,
  Search,
  Heart,
  Star,
  SlidersHorizontal,
  X,
  Clock,
  IndianRupee,
  Phone,
  User,
  ShieldCheck,
  Fuel,
  Gauge,
  Settings2,
  Navigation,
  ChevronDown,
  Grid3X3,
  List,
  RotateCcw,
  CalendarDays,
  BadgeCheck,
  CircleAlert,
  PackageCheck,
  Truck,
  Sprout,
  Wheat,
  Droplets,
  Leaf,
  ArrowUpDown,
  Plus,
  Minus,
  Info,
  Check,
} from 'lucide-react';
import { Equipment } from '../types/index.ts';
import { PaymentMethodModal } from '../components/PaymentMethodModal.tsx';

type EquipmentWithExtras = Equipment & {
  id: string;
  name: string;
  category: string;
  pricePerDay: number;
  available: boolean;
  lat: number;
  lng: number;
  image?: string;
  rating?: number;
  reviews?: number;
  ownerName?: string;
  ownerPhone?: string;
  locationName?: string;
  distance?: number;
  description?: string;
  fuelType?: string;
  power?: string;
  modelYear?: number;
  securityDeposit?: number;
  deliveryAvailable?: boolean;
  verifiedOwner?: boolean;
  hourlyRate?: number;
  minimumDays?: number;
  specifications?: string[];
};

type Booking = {
  id: string;
  equipmentId: string;
  equipmentName: string;
  startDate: string;
  endDate: string;
  days: number;
  total: number;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  createdAt: string;
};

const FALLBACK_EQUIPMENT: EquipmentWithExtras[] = [
  {
    id: 'fallback-tractor',
    name: 'Mahindra 575 DI Tractor',
    category: 'Tractor',
    pricePerDay: 1800,
    available: true,
    lat: 13.1367,
    lng: 78.1347,
    rating: 4.8,
    reviews: 24,
    ownerName: 'Verified Equipment Owner',
    ownerPhone: '+91 98765 43210',
    locationName: 'Kolar',
    distance: 4.2,
    description: 'Reliable tractor for tillage and field preparation.',
    fuelType: 'Diesel',
    power: '45 HP',
    modelYear: 2023,
    securityDeposit: 3600,
    deliveryAvailable: true,
    verifiedOwner: true,
    hourlyRate: 420,
    minimumDays: 1,
    specifications: ['Well maintained', 'Farm-ready', 'Flexible rental'],
  },
  {
    id: 'fallback-sprayer',
    name: 'Battery Sprayer 20 L',
    category: 'Sprayer',
    pricePerDay: 650,
    available: true,
    lat: 13.1467,
    lng: 78.1427,
    rating: 4.6,
    reviews: 14,
    ownerName: 'Local Farm Supply',
    ownerPhone: '+91 91234 56789',
    locationName: 'Srinivaspur',
    distance: 6.3,
    description: 'Portable spraying unit for chemical and nutrient application.',
    fuelType: 'Battery',
    power: '12V',
    modelYear: 2024,
    securityDeposit: 1300,
    deliveryAvailable: false,
    verifiedOwner: true,
    hourlyRate: 180,
    minimumDays: 1,
    specifications: ['Lightweight', 'Rechargeable', 'Efficient coverage'],
  },
];

const EQUIPMENT_TEMPLATES = [
  // 🚜 TRACTORS
  {
    category: 'Tractor',
    names: [
      'Mahindra 575 DI Tractor',
      'John Deere 5310 Tractor',
      'Swaraj 744 FE',
      'New Holland 3630 Tractor',
      'Massey Ferguson 241 DI',
      'Sonalika DI 745 III',
      'Farmtrac 60 Tractor',
      'Kubota MU4501 Tractor',
      'Mahindra 475 DI Tractor',
      'John Deere 5050 D Tractor',
    ],
    priceRange: [1500, 3000],
    hourlyRange: [350, 700],
  },

  // 🌾 HARVESTERS
  {
    category: 'Harvester',
    names: [
      'Kubota Combine Harvester',
      'Mini Combine Harvester',
      'John Deere Combine Harvester',
      'New Holland Combine Harvester',
      'Preet Combine Harvester',
      'Mahindra Rice Combine',
      'Self Propelled Reaper',
      'Paddy Reaper Binder',
      'Wheat Reaper',
      'Multi Crop Harvester',
    ],
    priceRange: [3500, 8000],
    hourlyRange: [900, 1800],
  },

  // 🔨 TILLAGE
  {
    category: 'Tillage',
    names: [
      'Rotavator 7 Feet',
      'Rotavator 6 Feet',
      'Rotavator 5 Feet',
      'Disc Plough 3 Bottom',
      'Disc Plough 2 Bottom',
      'Mould Board Plough',
      'Reversible Plough',
      'Cultivator 9 Tine',
      'Cultivator 11 Tine',
      'Spring Loaded Cultivator',
    ],
    priceRange: [700, 1800],
    hourlyRange: [180, 450],
  },

  // 🌱 PLANTING
  {
    category: 'Planting',
    names: [
      'Seed Drill 9 Tine',
      'Seed Drill 11 Tine',
      'Zero Till Seed Drill',
      'Multi Crop Planter',
      'Potato Planter',
      'Groundnut Planter',
      'Maize Planter',
      'Paddy Transplanter',
      'Vegetable Planter',
      'Manual Seed Drill',
    ],
    priceRange: [900, 3500],
    hourlyRange: [220, 750],
  },

  // 💦 SPRAYERS
  {
    category: 'Sprayer',
    names: [
      'Power Sprayer 20 L',
      'Battery Sprayer 16 L',
      'Battery Sprayer 20 L',
      'Petrol Sprayer 25 L',
      'Tractor Mounted Sprayer',
      'Boom Sprayer',
      'Mist Blower',
      'Orchard Sprayer',
      'Knapsack Sprayer',
      'High Pressure Sprayer',
    ],
    priceRange: [500, 2200],
    hourlyRange: [150, 550],
  },

  // 💧 IRRIGATION
  {
    category: 'Irrigation',
    names: [
      'Water Pump 5 HP',
      'Water Pump 7.5 HP',
      'Water Pump 10 HP',
      'Diesel Water Pump',
      'Electric Water Pump',
      'Submersible Pump',
      'Solar Water Pump',
      'Centrifugal Pump',
      'Trailer Mounted Pump',
      'Portable Irrigation Pump',
    ],
    priceRange: [600, 2500],
    hourlyRange: [150, 600],
  },

  // 📐 LAND PREPARATION
  {
    category: 'Land Preparation',
    names: [
      'Laser Land Leveler',
      'Land Leveler 8 Feet',
      'Land Leveler 10 Feet',
      'Hydraulic Land Leveler',
      'Scraper Blade',
      'Tractor Dozer Blade',
      'Farm Leveler',
      'Bund Former',
      'Ridger',
      'Bed Former',
    ],
    priceRange: [1000, 3500],
    hourlyRange: [250, 800],
  },

  // 🌿 WEEDING
  {
    category: 'Weeding',
    names: [
      'Power Weeder',
      'Mini Power Weeder',
      'Petrol Power Weeder',
      'Electric Power Weeder',
      'Wheel Hoe',
      'Inter Row Weeder',
      'Cono Weeder',
      'Rotary Weeder',
      'Manual Weeder',
      'Vegetable Weeder',
    ],
    priceRange: [600, 2500],
    hourlyRange: [150, 600],
  },

  // 🌾 HARVESTING
  {
    category: 'Harvesting',
    names: [
      'Sugarcane Harvester',
      'Groundnut Harvester',
      'Potato Harvester',
      'Onion Harvester',
      'Maize Harvester',
      'Paddy Harvester',
      'Wheat Harvester',
      'Cotton Picker',
      'Fodder Harvester',
      'Chaff Cutter',
    ],
    priceRange: [2500, 7000],
    hourlyRange: [600, 1600],
  },

  // ⚙️ THRESHING
  {
    category: 'Threshing',
    names: [
      'Multi Crop Thresher',
      'Paddy Thresher',
      'Wheat Thresher',
      'Maize Thresher',
      'Groundnut Thresher',
      'Pulse Thresher',
      'Soybean Thresher',
      'Sunflower Thresher',
      'Axial Flow Thresher',
      'Mini Thresher',
    ],
    priceRange: [1800, 4500],
    hourlyRange: [400, 1000],
  },

  // 🧪 FERTILIZER APPLICATION
  {
    category: 'Fertilizer Application',
    names: [
      'Fertilizer Broadcaster',
      'Tractor Fertilizer Spreader',
      'Organic Manure Spreader',
      'Compost Spreader',
      'Granule Applicator',
      'Seed Cum Fertilizer Drill',
      'Liquid Fertilizer Sprayer',
      'Fertilizer Injector',
      'Manual Fertilizer Spreader',
      'Side Dressing Machine',
    ],
    priceRange: [700, 2200],
    hourlyRange: [180, 550],
  },

  // 🚛 TRANSPORT
  {
    category: 'Transport',
    names: [
      'Tractor Trailer 3 Ton',
      'Tractor Trailer 5 Ton',
      'Hydraulic Tipping Trailer',
      'Farm Utility Trailer',
      'Water Tanker Trailer',
      'Cattle Feed Trailer',
      'Produce Transport Trailer',
      'Mini Farm Trailer',
      'Four Wheel Farm Trailer',
      'Tractor Trolley',
    ],
    priceRange: [1000, 3000],
    hourlyRange: [250, 700],
  },

  // 🚰 PUMPS
  {
    category: 'Pumps',
    names: [
      'Diesel Pump Set 5 HP',
      'Diesel Pump Set 7.5 HP',
      'Petrol Pump Set 5 HP',
      'Electric Pump 3 HP',
      'Electric Pump 5 HP',
      'Solar Pump 3 HP',
      'Solar Pump 5 HP',
      'High Flow Pump',
      'Portable Pump Set',
      'Irrigation Pump Set',
    ],
    priceRange: [600, 2500],
    hourlyRange: [150, 600],
  },

  // 🚁 AGRICULTURAL DRONES
  {
    category: 'Drone',
    names: [
      'Agricultural Spraying Drone',
      '10 Litre Agri Drone',
      '16 Litre Agri Drone',
      '20 Litre Agri Drone',
      'Crop Monitoring Drone',
      'Multispectral Agriculture Drone',
      'Fertilizer Spraying Drone',
      'Pesticide Spraying Drone',
      'Orchard Spraying Drone',
      'Farm Survey Drone',
    ],
    priceRange: [4000, 12000],
    hourlyRange: [1200, 3000],
  },

  // 🏡 GREENHOUSE
  {
    category: 'Greenhouse',
    names: [
      'Greenhouse Fogging System',
      'Greenhouse Sprayer',
      'Greenhouse Irrigation Kit',
      'Automatic Ventilation System',
      'Shade Net Structure',
      'Polyhouse Equipment Kit',
      'Greenhouse Fertigation Unit',
      'Climate Controller',
      'Greenhouse Water Pump',
      'Nursery Irrigation System',
    ],
    priceRange: [800, 3500],
    hourlyRange: [200, 800],
  },

  // 🍎 HORTICULTURE
  {
    category: 'Horticulture',
    names: [
      'Orchard Sprayer',
      'Fruit Harvesting Machine',
      'Tree Pruner',
      'Battery Pruning Machine',
      'Hedge Trimmer',
      'Brush Cutter',
      'Coconut Climbing Machine',
      'Coconut Harvesting Tool',
      'Fruit Sorting Machine',
      'Orchard Mower',
    ],
    priceRange: [600, 3000],
    hourlyRange: [150, 700],
  },

  // 🐄 DAIRY
  {
    category: 'Dairy Equipment',
    names: [
      'Electric Chaff Cutter',
      'Dairy Milking Machine',
      'Portable Milking Machine',
      'Cattle Feed Mixer',
      'Fodder Cutter',
      'Fodder Chopper',
      'Milk Cooling Tank',
      'Cattle Feed Grinder',
      'Silage Cutter',
      'Automatic Feed Mixer',
    ],
    priceRange: [700, 3000],
    hourlyRange: [180, 700],
  },

  // 🏭 FARM PROCESSING
  {
    category: 'Farm Processing',
    names: [
      'Grain Cleaning Machine',
      'Grain Dryer',
      'Mini Rice Mill',
      'Mini Flour Mill',
      'Dal Mill',
      'Maize Sheller',
      'Groundnut Decorticator',
      'Oil Expeller',
      'Vegetable Grader',
      'Fruit Grading Machine',
    ],
    priceRange: [1200, 5000],
    hourlyRange: [300, 1200],
  },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Tractor: <Tractor className="w-5 h-5" />,
  Harvester: <Wheat className="w-5 h-5" />,
  Tillage: <Sprout className="w-5 h-5" />,
  Planting: <Leaf className="w-5 h-5" />,
  Sprayer: <Droplets className="w-5 h-5" />,
  Irrigation: <Droplets className="w-5 h-5" />,
  'Land Preparation': <Gauge className="w-5 h-5" />,
};

const getEquipmentEmoji = (category: string) => {
  switch (category) {
    case 'Tractor':
      return '🚜';
    case 'Harvester':
      return '🌾';
    case 'Tillage':
      return '🌱';
    case 'Planting':
      return '🌿';
    case 'Sprayer':
      return '💧';
    case 'Irrigation':
      return '🚰';
    default:
      return '🛠️';
  }
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(value);

const getTodayString = () => {
  const date = new Date();
  return date.toISOString().split('T')[0];
};

export const EquipmentRentalPage: React.FC = () => {
  const { role } = useAuth();
  const canManageEquipment = role === 'ADMIN' || role === 'OFFICER';
  const canBookEquipment = role === 'FARMER';

  const [equipmentList, setEquipmentList] =
    useState<EquipmentWithExtras[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEquipmentForm, setShowEquipmentForm] = useState(false);
  const [newEquipment, setNewEquipment] = useState({
    name: '',
    category: 'Tractor',
    pricePerDay: '1500',
    hourlyRate: '250',
    locationName: 'Kolar',
    description: '',
    power: 'Standard',
    fuelType: 'Diesel',
    minimumDays: '1',
  });

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [availability, setAvailability] = useState('All');
  const [sortBy, setSortBy] = useState('recommended');
  const [maxPrice, setMaxPrice] = useState(10000);
  const [maxDistance, setMaxDistance] = useState(100);
  const [minimumRating, setMinimumRating] = useState(0);

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [favorites, setFavorites] = useState<string[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [selectedEquipment, setSelectedEquipment] =
    useState<EquipmentWithExtras | null>(null);

  const [bookingOpen, setBookingOpen] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(getTodayString());
  const [bookingDays, setBookingDays] = useState(1);

  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    loadEquipment();

    const savedFavorites = localStorage.getItem(
      'agri_equipment_favorites'
    );

    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch {
        setFavorites([]);
      }
    }

    const savedBookings = localStorage.getItem('agri_equipment_bookings');

    if (savedBookings) {
      try {
        setBookings(JSON.parse(savedBookings));
      } catch {
        setBookings([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      'agri_equipment_favorites',
      JSON.stringify(favorites)
    );
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(
      'agri_equipment_bookings',
      JSON.stringify(bookings)
    );
  }, [bookings]);

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const diff =
        Math.ceil(
          (end.getTime() - start.getTime()) /
          (1000 * 60 * 60 * 24)
        ) + 1;

      setBookingDays(Math.max(1, diff));
    }
  }, [startDate, endDate]);

  const loadEquipment = async () => {
    try {
      const data = await api.getEquipment();

      if (Array.isArray(data) && data.length > 0) {
        const enhanced = data.map((item: Equipment) => ({
          ...item,
          rating: 4.5,
          reviews: 0,
          ownerName: 'Verified Equipment Owner',
          locationName: 'Nearby Farm',
          distance: 10,
          description:
            'Agricultural equipment available for rental from a local equipment owner.',
          fuelType: 'Diesel',
          power: 'Standard',
          modelYear: 2023,
          securityDeposit: item.pricePerDay * 2,
          deliveryAvailable: true,
          verifiedOwner: true,
          minimumDays: 1,
          specifications: [
            'Well maintained',
            'Agricultural use',
            'Flexible rental',
          ],
        }));

        setEquipmentList(enhanced);
      } else {
        setEquipmentList(FALLBACK_EQUIPMENT);
      }
    } catch (err) {
      console.error(
        'Failed to load equipment rentals:',
        err
      );

      setEquipmentList(FALLBACK_EQUIPMENT);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEquipment = async () => {
    if (!canManageEquipment) {
      setBookingMessage('Only admins and officers can add equipment listings.');
      setBookingSuccess(false);
      return;
    }

    const payload = {
      name: newEquipment.name.trim(),
      category: newEquipment.category,
      pricePerDay: Number(newEquipment.pricePerDay),
      hourlyRate: Number(newEquipment.hourlyRate),
      locationName: newEquipment.locationName,
      description: newEquipment.description.trim() || 'Available for agricultural rental.',
      power: newEquipment.power,
      fuelType: newEquipment.fuelType,
      minimumDays: Number(newEquipment.minimumDays) || 1,
      available: true,
    };

    if (!payload.name || !Number.isFinite(payload.pricePerDay) || payload.pricePerDay < 0) {
      setBookingMessage('Enter a valid equipment name and price.');
      setBookingSuccess(false);
      return;
    }

    try {
      await api.createEquipment(payload);
      setShowEquipmentForm(false);
      setNewEquipment({
        name: '',
        category: 'Tractor',
        pricePerDay: '1500',
        hourlyRate: '250',
        locationName: 'Kolar',
        description: '',
        power: 'Standard',
        fuelType: 'Diesel',
        minimumDays: '1',
      });
      setBookingMessage('Equipment listing created successfully.');
      setBookingSuccess(true);
      await loadEquipment();
    } catch (error: any) {
      setBookingMessage(error.message || 'Unable to create equipment listing.');
      setBookingSuccess(false);
    }
  };

  const handleDeleteEquipment = async (equipmentId: string) => {
    if (!canManageEquipment) {
      setBookingMessage('Only admins and officers can delete equipment listings.');
      setBookingSuccess(false);
      return;
    }

    try {
      await api.deleteEquipment(equipmentId);
      setBookingMessage('Equipment listing removed.');
      setBookingSuccess(true);
      await loadEquipment();
    } catch (error: any) {
      setBookingMessage(error.message || 'Unable to delete equipment listing.');
      setBookingSuccess(false);
    }
  };

  const categories = useMemo(() => {
    const values = equipmentList.map((item) => item.category);
    return ['All', ...Array.from(new Set(values))];
  }, [equipmentList]);

  const filteredEquipment = useMemo(() => {
    let result = equipmentList.filter((equipment) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        equipment.name.toLowerCase().includes(searchText) ||
        equipment.category.toLowerCase().includes(searchText) ||
        equipment.locationName
          ?.toLowerCase()
          .includes(searchText) ||
        equipment.ownerName
          ?.toLowerCase()
          .includes(searchText);

      const matchesCategory =
        category === 'All' ||
        equipment.category === category;

      const matchesAvailability =
        availability === 'All' ||
        (availability === 'Available'
          ? equipment.available
          : !equipment.available);

      const matchesPrice =
        equipment.pricePerDay <= maxPrice;

      const matchesDistance =
        (equipment.distance || 0) <= maxDistance;

      const matchesRating =
        (equipment.rating || 0) >= minimumRating;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesAvailability &&
        matchesPrice &&
        matchesDistance &&
        matchesRating
      );
    });

    result = [...result];

    if (sortBy === 'priceLow') {
      result.sort(
        (a, b) => a.pricePerDay - b.pricePerDay
      );
    }

    if (sortBy === 'priceHigh') {
      result.sort(
        (a, b) => b.pricePerDay - a.pricePerDay
      );
    }

    if (sortBy === 'rating') {
      result.sort(
        (a, b) =>
          (b.rating || 0) - (a.rating || 0)
      );
    }

    if (sortBy === 'distance') {
      result.sort(
        (a, b) =>
          (a.distance || 0) - (b.distance || 0)
      );
    }

    if (sortBy === 'popular') {
      result.sort(
        (a, b) =>
          (b.reviews || 0) - (a.reviews || 0)
      );
    }

    return result;
  }, [
    equipmentList,
    search,
    category,
    availability,
    maxPrice,
    maxDistance,
    minimumRating,
    sortBy,
  ]);

  const stats = useMemo(() => {
    const available = equipmentList.filter(
      (item) => item.available
    ).length;

    const verified = equipmentList.filter(
      (item) => item.verifiedOwner
    ).length;

    const averagePrice =
      equipmentList.length > 0
        ? equipmentList.reduce(
          (sum, item) => sum + item.pricePerDay,
          0
        ) / equipmentList.length
        : 0;

    return {
      total: equipmentList.length,
      available,
      verified,
      averagePrice,
    };
  }, [equipmentList]);

  const toggleFavorite = (id: string) => {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const openDetails = (
    equipment: EquipmentWithExtras
  ) => {
    setSelectedEquipment(equipment);
    setDetailsOpen(true);
  };

  const openBooking = (
    equipment: EquipmentWithExtras
  ) => {
    if (!canBookEquipment) {
      setBookingMessage('Only farmers can book equipment.');
      setBookingSuccess(false);
      return;
    }

    setSelectedEquipment(equipment);

    const today = getTodayString();

    setStartDate(today);
    setEndDate(today);
    setBookingDays(1);
    setBookingMessage('');
    setBookingSuccess(false);
    setBookingOpen(true);
  };

  const calculateTotal = () => {
    if (!selectedEquipment) return 0;

    return (
      selectedEquipment.pricePerDay * bookingDays
    );
  };

  const calculateDeposit = () => {
    return selectedEquipment?.securityDeposit || 0;
  };

  const resetFilters = () => {
    setSearch('');
    setCategory('All');
    setAvailability('All');
    setSortBy('recommended');
    setMaxPrice(10000);
    setMaxDistance(100);
    setMinimumRating(0);
  };

  const submitBooking = async () => {
    if (!selectedEquipment) return;

    if (!canBookEquipment) {
      setBookingMessage('Only farmers can book equipment.');
      setBookingSuccess(false);
      return;
    }

    if (!selectedEquipment.available) {
      setBookingMessage(
        'This equipment is currently unavailable.'
      );
      return;
    }

    if (bookingDays < (selectedEquipment.minimumDays || 1)) {
      setBookingMessage(
        `Minimum rental duration is ${selectedEquipment.minimumDays || 1
        } day(s).`
      );
      return;
    }

    try {
      await api.bookEquipment(selectedEquipment.id, {
        startDate,
        endDate,
        durationDays: bookingDays,
        totalAmount: calculateTotal(),
      });

      const booking: Booking = {
        id: `BK-${Date.now()}`,
        equipmentId: selectedEquipment.id,
        equipmentName: selectedEquipment.name,
        startDate,
        endDate,
        days: bookingDays,
        total: calculateTotal(),
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };

      setBookings((current) => [booking, ...current]);
      setBookingSuccess(true);
      setBookingMessage('Rental request submitted successfully. The equipment owner will confirm your booking.');
    } catch (error: any) {
      setBookingSuccess(false);
      setBookingMessage(error.message || 'Unable to confirm booking.');
    }
  };

  const confirmPaidBooking = () => {
    setShowPayment(false);
    void submitBooking();
  };

  const CardImage = ({
    equipment,
    large = false,
  }: {
    equipment: EquipmentWithExtras;
    large?: boolean;
  }) => (
    <div
      className={`relative ${large ? 'h-64' : 'h-52'
        } overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100`}
    >
      {equipment.image ? (
        <img
          src={equipment.image}
          alt={equipment.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center relative">
          <div className="absolute w-40 h-40 rounded-full bg-amber-200/40 blur-3xl" />

          <div className="relative z-10 w-24 h-24 rounded-3xl bg-white/80 backdrop-blur shadow-xl flex items-center justify-center text-6xl">
            {getEquipmentEmoji(
              equipment.category
            )}
          </div>

          <span className="relative z-10 mt-4 text-sm font-bold text-stone-600">
            {equipment.category}
          </span>
        </div>
      )}

      <div className="absolute top-3 left-3 flex flex-wrap gap-2">
        {equipment.verifiedOwner && (
          <span className="flex items-center gap-1 bg-white/95 backdrop-blur text-emerald-700 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm">
            <BadgeCheck className="w-3.5 h-3.5" />
            Verified Owner
          </span>
        )}
      </div>

      <button
        onClick={(event) => {
          event.stopPropagation();
          toggleFavorite(equipment.id);
        }}
        className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/95 backdrop-blur flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
        aria-label="Favorite"
      >
        <Heart
          className={`w-5 h-5 ${favorites.includes(equipment.id)
              ? 'fill-rose-500 text-rose-500'
              : 'text-stone-500'
            }`}
        />
      </button>

      <div className="absolute bottom-3 left-3">
        {equipment.available ? (
          <span className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
            <CheckCircle className="w-3.5 h-3.5" />
            Available Now
          </span>
        ) : (
          <span className="flex items-center gap-1.5 bg-rose-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
            <CircleAlert className="w-3.5 h-3.5" />
            Currently Rented
          </span>
        )}
      </div>
    </div>
  );

  const EquipmentCard = ({
    equipment,
  }: {
    equipment: EquipmentWithExtras;
  }) => (
    <div className="group bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      <CardImage equipment={equipment} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-[11px] font-bold">
                {CATEGORY_ICONS[equipment.category] || (
                  <Tractor className="w-4 h-4" />
                )}
                {equipment.category}
              </span>
            </div>

            <h3 className="text-lg font-extrabold text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-2">
              {equipment.name}
            </h3>
          </div>

          <div className="shrink-0 text-right">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-4 h-4 fill-amber-400" />
              <span className="font-bold text-stone-800">
                {equipment.rating?.toFixed(1)}
              </span>
            </div>
            <span className="text-[10px] text-stone-400">
              {equipment.reviews} reviews
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-stone-500">
          <MapPin className="w-4 h-4 text-amber-600" />
          <span>
            {equipment.locationName || 'Nearby'}
          </span>
          <span className="text-stone-300">•</span>
          <span>
            {equipment.distance?.toFixed(1)} km away
          </span>
        </div>

        <p className="mt-3 text-sm text-stone-500 leading-relaxed line-clamp-2">
          {equipment.description}
        </p>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="rounded-xl bg-stone-50 p-2.5">
            <div className="flex items-center gap-1.5 text-[10px] text-stone-400 uppercase font-bold">
              <Gauge className="w-3.5 h-3.5" />
              Power
            </div>
            <div className="mt-1 text-sm font-bold text-stone-800">
              {equipment.power}
            </div>
          </div>

          <div className="rounded-xl bg-stone-50 p-2.5">
            <div className="flex items-center gap-1.5 text-[10px] text-stone-400 uppercase font-bold">
              <Fuel className="w-3.5 h-3.5" />
              Fuel
            </div>
            <div className="mt-1 text-sm font-bold text-stone-800">
              {equipment.fuelType}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-stone-100 flex items-end justify-between">
          <div>
            <div className="text-[11px] text-stone-400 font-medium">
              Starting from
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-amber-700">
                ₹{formatCurrency(equipment.pricePerDay)}
              </span>
              <span className="text-xs text-stone-500">
                / day
              </span>
            </div>

            {equipment.hourlyRate && (
              <div className="text-[10px] text-stone-400 mt-0.5">
                ₹{formatCurrency(equipment.hourlyRate)}
                / hour
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => openDetails(equipment)}
              className="w-10 h-10 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 flex items-center justify-center transition-colors"
              title="View details"
            >
              <Info className="w-4 h-4" />
            </button>

            {canManageEquipment && (
              <button
                onClick={() => handleDeleteEquipment(equipment.id)}
                className="w-10 h-10 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
                title="Delete equipment"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => openBooking(equipment)}
              disabled={!equipment.available || !canBookEquipment}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${equipment.available && canBookEquipment
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm hover:shadow-md'
                  : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                }`}
            >
              <Calendar className="w-4 h-4" />
              {canManageEquipment ? 'View' : 'Rent'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ListCard = ({
    equipment,
  }: {
    equipment: EquipmentWithExtras;
  }) => (
    <div className="bg-white rounded-2xl border border-stone-200 p-4 hover:border-amber-300 hover:shadow-lg transition-all">
      <div className="flex flex-col lg:flex-row gap-5">
        <div className="lg:w-56 shrink-0">
          <CardImage equipment={equipment} />
        </div>

        <div className="flex-1">
          <div className="flex justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                {equipment.category}
              </span>

              <h3 className="text-xl font-extrabold text-stone-900 mt-1">
                {equipment.name}
              </h3>
            </div>

            <button
              onClick={() =>
                toggleFavorite(equipment.id)
              }
              className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center shrink-0"
            >
              <Heart
                className={`w-5 h-5 ${favorites.includes(equipment.id)
                    ? 'fill-rose-500 text-rose-500'
                    : 'text-stone-500'
                  }`}
              />
            </button>
          </div>

          <div className="flex flex-wrap gap-4 mt-3 text-sm text-stone-500">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-600" />
              {equipment.locationName}
            </span>

            <span className="flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-blue-600" />
              {equipment.distance?.toFixed(1)} km
            </span>

            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              {equipment.rating} ({equipment.reviews})
            </span>

            {equipment.verifiedOwner && (
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                Verified
              </span>
            )}
          </div>

          <p className="mt-3 text-sm text-stone-500 max-w-3xl">
            {equipment.description}
          </p>

          <div className="flex flex-wrap gap-2 mt-4">
            {(equipment.specifications || [])
              .slice(0, 4)
              .map((spec) => (
                <span
                  key={spec}
                  className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-600 text-xs font-medium"
                >
                  {spec}
                </span>
              ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-5 pt-4 border-t border-stone-100">
            <div>
              <span className="text-xs text-stone-400">
                Rental price
              </span>

              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-amber-700">
                  ₹{formatCurrency(equipment.pricePerDay)}
                </span>
                <span className="text-xs text-stone-500">
                  /day
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => openDetails(equipment)}
                className="px-4 py-2.5 rounded-xl border border-stone-200 text-sm font-bold text-stone-700 hover:bg-stone-50"
              >
                View Details
              </button>

              {!canManageEquipment && (
                <button
                  onClick={() => openBooking(equipment)}
                  disabled={!equipment.available || !canBookEquipment}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold ${equipment.available && canBookEquipment
                      ? 'bg-amber-600 text-white hover:bg-amber-700'
                      : 'bg-stone-100 text-stone-400'
                    }`}
                >
                  {equipment.available
                    ? canBookEquipment ? 'Rent Now' : 'Farmer Only'
                    : 'Currently Rented'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f7f3] pb-16">
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-800 via-orange-800 to-stone-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full border-[60px] border-white" />
          <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full border-[50px] border-white" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-3 py-1.5 text-xs font-bold mb-4">
                <Truck className="w-4 h-4" />
                FARM EQUIPMENT NETWORK
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
                Rent Equipment.
                <span className="block text-amber-200">
                  Farm Smarter.
                </span>
              </h1>

              <p className="mt-4 text-amber-100 text-sm sm:text-base leading-relaxed max-w-2xl">
                Access tractors, harvesters, rotavators, sprayers,
                irrigation equipment and more from verified
                equipment owners near your farm.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-xl px-4 py-2.5">
                  <PackageCheck className="w-5 h-5 text-amber-200" />
                  <div>
                    <div className="font-black">
                      {stats.available}
                    </div>
                    <div className="text-[10px] text-amber-200">
                      Available
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-xl px-4 py-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-200" />
                  <div>
                    <div className="font-black">
                      {stats.verified}
                    </div>
                    <div className="text-[10px] text-amber-200">
                      Verified Owners
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-xl px-4 py-2.5">
                  <IndianRupee className="w-5 h-5 text-yellow-200" />
                  <div>
                    <div className="font-black">
                      ₹{formatCurrency(stats.averagePrice)}
                    </div>
                    <div className="text-[10px] text-amber-200">
                      Avg. Daily Rate
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex w-48 h-48 rounded-[2rem] bg-white/10 backdrop-blur border border-white/10 items-center justify-center text-8xl shadow-2xl">
              🚜
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-5 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-stone-200 p-3">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />

              <input
                type="text"
                placeholder="Search tractors, harvesters, sprayers..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-100 outline-none transition-all text-sm"
              />
            </div>

            <div className="relative lg:w-56">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-600" />

              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
                className="appearance-none w-full pl-11 pr-10 py-3.5 rounded-xl bg-stone-50 border border-stone-200 focus:border-amber-500 outline-none text-sm font-semibold text-stone-700"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item === 'All'
                      ? 'All Categories'
                      : item}
                  </option>
                ))}
              </select>

              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
            </div>

            <div className="relative lg:w-56">
              <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value)
                }
                className="appearance-none w-full pl-11 pr-10 py-3.5 rounded-xl bg-stone-50 border border-stone-200 focus:border-amber-500 outline-none text-sm font-semibold text-stone-700"
              >
                <option value="recommended">
                  Recommended
                </option>
                <option value="priceLow">
                  Price: Low to High
                </option>
                <option value="priceHigh">
                  Price: High to Low
                </option>
                <option value="rating">
                  Highest Rated
                </option>
                <option value="distance">
                  Nearest First
                </option>
                <option value="popular">
                  Most Popular
                </option>
              </select>

              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
            </div>

            <button
              onClick={() =>
                setShowFilters(!showFilters)
              }
              className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border font-bold text-sm transition-all ${showFilters
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-3 p-5 rounded-xl bg-stone-50 border border-stone-200">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-extrabold text-stone-900">
                    Refine Equipment
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Find the best machine for your farm
                  </p>
                </div>

                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-xs font-bold text-stone-600">
                    Availability
                  </label>

                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {[
                      'All',
                      'Available',
                      'Rented',
                    ].map((item) => (
                      <button
                        key={item}
                        onClick={() =>
                          setAvailability(item)
                        }
                        className={`py-2 rounded-lg text-xs font-bold border ${availability === item
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-white text-stone-600 border-stone-200'
                          }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between">
                    <label className="text-xs font-bold text-stone-600">
                      Maximum Daily Price
                    </label>
                    <span className="text-xs font-black text-amber-700">
                      ₹{formatCurrency(maxPrice)}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="500"
                    max="10000"
                    step="500"
                    value={maxPrice}
                    onChange={(event) =>
                      setMaxPrice(
                        Number(event.target.value)
                      )
                    }
                    className="w-full mt-4 accent-amber-600"
                  />

                  <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                    <span>₹500</span>
                    <span>₹10,000+</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between">
                    <label className="text-xs font-bold text-stone-600">
                      Maximum Distance
                    </label>
                    <span className="text-xs font-black text-amber-700">
                      {maxDistance} km
                    </span>
                  </div>

                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={maxDistance}
                    onChange={(event) =>
                      setMaxDistance(
                        Number(event.target.value)
                      )
                    }
                    className="w-full mt-4 accent-amber-600"
                  />

                  <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                    <span>5 km</span>
                    <span>100 km</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-stone-600">
                    Minimum Rating
                  </label>
                  <span className="text-xs font-black text-amber-700">
                    {minimumRating === 0
                      ? 'Any'
                      : `${minimumRating}+ ⭐`}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {[0, 3, 3.5, 4, 4.5].map(
                    (rating) => (
                      <button
                        key={rating}
                        onClick={() =>
                          setMinimumRating(rating)
                        }
                        className={`px-4 py-2 rounded-lg text-xs font-bold border ${minimumRating === rating
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-white border-stone-200 text-stone-600'
                          }`}
                      >
                        {rating === 0
                          ? 'Any Rating'
                          : `${rating}+ ⭐`}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8 mb-5">
          <div>
            <h2 className="text-xl font-black text-stone-900">
              Equipment Near You
            </h2>
            <p className="text-sm text-stone-500 mt-1">
              Showing{' '}
              <span className="font-bold text-stone-800">
                {filteredEquipment.length}
              </span>{' '}
              of {equipmentList.length} machines
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-stone-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${viewMode === 'grid'
                  ? 'bg-amber-100 text-amber-700'
                  : 'text-stone-400'
                }`}
              title="Grid view"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setViewMode('list')}
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${viewMode === 'list'
                  ? 'bg-amber-100 text-amber-700'
                  : 'text-stone-400'
                }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-16 flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
              <Tractor className="w-7 h-7 text-amber-600 animate-pulse" />
            </div>

            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />

            <p className="mt-4 text-sm font-semibold text-stone-500">
              Finding agricultural equipment...
            </p>
          </div>
        ) : filteredEquipment.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200 py-20 px-6 text-center">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-stone-100 flex items-center justify-center">
              <Search className="w-9 h-9 text-stone-400" />
            </div>

            <h3 className="text-xl font-black text-stone-800 mt-5">
              No equipment found
            </h3>

            <p className="text-sm text-stone-500 mt-2 max-w-md mx-auto">
              Try changing your search, category, price,
              distance or rating filters.
            </p>

            <button
              onClick={resetFilters}
              className="mt-6 inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-3 rounded-xl font-bold text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEquipment.map((equipment) => (
              <EquipmentCard
                key={equipment.id}
                equipment={equipment}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEquipment.map((equipment) => (
              <ListCard
                key={equipment.id}
                equipment={equipment}
              />
            ))}
          </div>
        )}

        {canManageEquipment && (
          <section className="mt-12 bg-gradient-to-br from-stone-900 to-stone-800 rounded-3xl p-6 sm:p-8 text-white overflow-hidden relative">
            <div className="absolute right-0 top-0 opacity-10 text-[180px] leading-none">
              🚜
            </div>

            <div className="relative">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                    <Sprout className="w-4 h-4" />
                    Equipment Sharing
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black mt-2">
                    Have farming equipment?
                  </h2>

                  <p className="text-stone-300 mt-2 max-w-xl text-sm leading-relaxed">
                    Earn additional income by listing your tractor,
                    harvester or agricultural machinery for nearby
                    farmers to rent.
                  </p>
                </div>

                <button
                  onClick={() => setShowEquipmentForm(true)}
                  className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 px-6 py-3.5 rounded-xl font-black text-sm shadow-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  List Your Equipment
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {detailsOpen && selectedEquipment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl">
            <div className="sticky top-0 z-10 bg-white border-b border-stone-100 px-5 py-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-amber-600 font-bold uppercase tracking-wider">
                  Equipment Details
                </div>

                <h2 className="text-xl font-black text-stone-900">
                  {selectedEquipment.name}
                </h2>
              </div>

              <button
                onClick={() => setDetailsOpen(false)}
                className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5">
              <CardImage
                equipment={selectedEquipment}
                large
              />

              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-stone-50">
                  <Gauge className="w-5 h-5 text-amber-600" />
                  <div className="text-[10px] text-stone-400 mt-2 uppercase font-bold">
                    Power
                  </div>
                  <div className="font-black mt-1">
                    {selectedEquipment.power}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50">
                  <Fuel className="w-5 h-5 text-amber-600" />
                  <div className="text-[10px] text-stone-400 mt-2 uppercase font-bold">
                    Fuel
                  </div>
                  <div className="font-black mt-1">
                    {selectedEquipment.fuelType}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50">
                  <Settings2 className="w-5 h-5 text-amber-600" />
                  <div className="text-[10px] text-stone-400 mt-2 uppercase font-bold">
                    Model Year
                  </div>
                  <div className="font-black mt-1">
                    {selectedEquipment.modelYear}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                  <div className="text-[10px] text-stone-400 mt-2 uppercase font-bold">
                    Rating
                  </div>
                  <div className="font-black mt-1">
                    {selectedEquipment.rating}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-black text-stone-900">
                  About this equipment
                </h3>

                <p className="text-sm text-stone-500 mt-2 leading-relaxed">
                  {selectedEquipment.description}
                </p>
              </div>

              <div className="mt-6">
                <h3 className="font-black text-stone-900">
                  Specifications
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                  {(
                    selectedEquipment.specifications ||
                    []
                  ).map((specification) => (
                    <div
                      key={specification}
                      className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-sm font-semibold"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {specification}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-stone-200">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-amber-600" />
                    <span className="font-black">
                      Equipment Owner
                    </span>
                  </div>

                  <div className="mt-3 font-bold">
                    {selectedEquipment.ownerName}
                  </div>

                  <div className="mt-1 text-sm text-stone-500">
                    {selectedEquipment.locationName}
                  </div>

                  {selectedEquipment.verifiedOwner && (
                    <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                      <BadgeCheck className="w-3.5 h-3.5" />
                      Identity Verified
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl border border-stone-200">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-5 h-5 text-amber-600" />
                    <span className="font-black">
                      Rental Charges
                    </span>
                  </div>

                  <div className="mt-3 text-2xl font-black text-amber-700">
                    ₹
                    {formatCurrency(
                      selectedEquipment.pricePerDay
                    )}
                    <span className="text-xs text-stone-400 font-normal">
                      {' '}
                      / day
                    </span>
                  </div>

                  <div className="text-xs text-stone-500 mt-1">
                    Security deposit: ₹
                    {formatCurrency(
                      selectedEquipment.securityDeposit ||
                      0
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setDetailsOpen(false);

                    if (
                      selectedEquipment.available
                    ) {
                      openBooking(
                        selectedEquipment
                      );
                    }
                  }}
                  disabled={!selectedEquipment.available}
                  className={`flex-1 py-3.5 rounded-xl font-black text-sm ${selectedEquipment.available
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-stone-100 text-stone-400'
                    }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {selectedEquipment.available
                      ? 'Book This Equipment'
                      : 'Currently Unavailable'}
                  </span>
                </button>

                {selectedEquipment.ownerPhone && (
                  <a
                    href={`tel:${selectedEquipment.ownerPhone}`}
                    className="flex-1 py-3.5 rounded-xl border border-stone-200 hover:bg-stone-50 font-black text-sm text-stone-700 flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    Contact Owner
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {bookingOpen && selectedEquipment && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl max-h-[94vh] overflow-y-auto rounded-3xl shadow-2xl">
            <div className="sticky top-0 z-10 bg-white border-b border-stone-100 p-5 flex items-center justify-between">
              <div>
                <div className="text-xs text-amber-600 font-bold uppercase tracking-wider">
                  Rental Booking
                </div>

                <h2 className="text-xl font-black text-stone-900">
                  {selectedEquipment.name}
                </h2>
              </div>

              <button
                onClick={() => setBookingOpen(false)}
                className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5">
              {bookingSuccess ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check className="w-10 h-10 text-emerald-600" />
                  </div>

                  <h3 className="text-2xl font-black text-stone-900 mt-5">
                    Request Submitted!
                  </h3>

                  <p className="text-sm text-stone-500 mt-2 max-w-sm mx-auto">
                    {bookingMessage}
                  </p>

                  <div className="mt-6 p-4 rounded-2xl bg-stone-50 text-left">
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-500">
                        Equipment
                      </span>
                      <span className="font-bold">
                        {selectedEquipment.name}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm mt-3">
                      <span className="text-stone-500">
                        Rental duration
                      </span>
                      <span className="font-bold">
                        {bookingDays} day
                        {bookingDays !== 1
                          ? 's'
                          : ''}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm mt-3">
                      <span className="text-stone-500">
                        Estimated total
                      </span>
                      <span className="font-black text-amber-700">
                        ₹
                        {formatCurrency(
                          calculateTotal()
                        )}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      setBookingOpen(false)
                    }
                    className="mt-6 w-full bg-stone-900 hover:bg-stone-800 text-white py-3 rounded-xl font-bold"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-3xl shadow-sm">
                        {getEquipmentEmoji(
                          selectedEquipment.category
                        )}
                      </div>

                      <div>
                        <div className="font-black text-stone-900">
                          ₹
                          {formatCurrency(
                            selectedEquipment.pricePerDay
                          )}
                          <span className="text-xs text-stone-500 font-normal">
                            {' '}
                            / day
                          </span>
                        </div>

                        <div className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {selectedEquipment.locationName}{' '}
                          •{' '}
                          {selectedEquipment.distance?.toFixed(
                            1
                          )}{' '}
                          km away
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-bold text-stone-700 mb-2">
                      Start Date
                    </label>

                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-600" />

                      <input
                        type="date"
                        min={getTodayString()}
                        value={startDate}
                        onChange={(event) => {
                          const value =
                            event.target.value;

                          setStartDate(value);

                          if (
                            new Date(endDate) <
                            new Date(value)
                          ) {
                            setEndDate(value);
                          }
                        }}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-bold text-stone-700 mb-2">
                      End Date
                    </label>

                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-600" />

                      <input
                        type="date"
                        min={startDate}
                        value={endDate}
                        onChange={(event) =>
                          setEndDate(
                            event.target.value
                          )
                        }
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="mt-4 p-4 rounded-2xl bg-stone-50 border border-stone-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-amber-600" />
                        <span className="font-bold text-stone-700">
                          Rental Duration
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            setBookingDays(
                              Math.max(
                                1,
                                bookingDays - 1
                              )
                            )
                          }
                          className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center"
                        >
                          <Minus className="w-4 h-4" />
                        </button>

                        <span className="font-black min-w-[70px] text-center">
                          {bookingDays} day
                          {bookingDays !== 1
                            ? 's'
                            : ''}
                        </span>

                        <button
                          onClick={() =>
                            setBookingDays(
                              bookingDays + 1
                            )
                          }
                          className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {bookingMessage && (
                    <div className="mt-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-sm font-semibold flex items-start gap-2">
                      <CircleAlert className="w-5 h-5 shrink-0" />
                      {bookingMessage}
                    </div>
                  )}

                  <div className="mt-6 rounded-2xl border border-stone-200 overflow-hidden">
                    <div className="p-4 bg-stone-50">
                      <h3 className="font-black text-stone-900">
                        Booking Summary
                      </h3>
                    </div>

                    <div className="p-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-stone-500">
                          Daily rental
                        </span>
                        <span className="font-semibold">
                          ₹
                          {formatCurrency(
                            selectedEquipment.pricePerDay
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm mt-3">
                        <span className="text-stone-500">
                          Duration
                        </span>
                        <span className="font-semibold">
                          × {bookingDays}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm mt-3">
                        <span className="text-stone-500">
                          Security deposit
                        </span>
                        <span className="font-semibold">
                          ₹
                          {formatCurrency(
                            calculateDeposit()
                          )}
                        </span>
                      </div>

                      <div className="border-t border-stone-100 mt-4 pt-4 flex justify-between">
                        <span className="font-black text-stone-900">
                          Estimated Rental Cost
                        </span>

                        <span className="text-xl font-black text-amber-700">
                          ₹
                          {formatCurrency(
                            calculateTotal()
                          )}
                        </span>
                      </div>

                      <p className="text-[10px] text-stone-400 mt-3">
                        Security deposit is shown separately
                        and may be refundable according to
                        the owner's rental policy.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-start gap-2 text-xs text-stone-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    Your booking request is sent to the
                    equipment owner for confirmation.
                  </div>

                  <button
                    onClick={() => setShowPayment(true)}
                    className="w-full mt-6 bg-amber-600 hover:bg-amber-700 text-white py-3.5 rounded-xl font-black text-sm shadow-lg shadow-amber-600/20 transition-all"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Request Equipment
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showPayment && selectedEquipment && (
        <PaymentMethodModal
          title="Equipment rental payment"
          amount={calculateTotal() + calculateDeposit()}
          onClose={() => setShowPayment(false)}
          onSuccess={confirmPaidBooking}
        />
      )}

      {showEquipmentForm && canManageEquipment && (
        <div className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-black text-stone-900">Add equipment listing</h2>
                <p className="text-xs text-stone-500 mt-1">Admins and officers can publish rental equipment.</p>
              </div>
              <button onClick={() => setShowEquipmentForm(false)} className="p-2 rounded-xl hover:bg-stone-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <input value={newEquipment.name} onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })} placeholder="Equipment name" className="col-span-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50" />
              <select value={newEquipment.category} onChange={(e) => setNewEquipment({ ...newEquipment, category: e.target.value })} className="px-4 py-3 rounded-xl border border-stone-200 bg-stone-50">
                {Array.from(new Set(['Tractor', 'Harvester', 'Tillage', 'Planting', 'Sprayer', 'Irrigation', 'Land Preparation', 'Weeding', 'Harvesting', 'Threshing', 'Fertilizer Application'])).map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              <input value={newEquipment.pricePerDay} type="number" min="0" onChange={(e) => setNewEquipment({ ...newEquipment, pricePerDay: e.target.value })} placeholder="Price / day" className="px-4 py-3 rounded-xl border border-stone-200 bg-stone-50" />
              <input value={newEquipment.hourlyRate} type="number" min="0" onChange={(e) => setNewEquipment({ ...newEquipment, hourlyRate: e.target.value })} placeholder="Price / hour" className="px-4 py-3 rounded-xl border border-stone-200 bg-stone-50" />
              <input value={newEquipment.locationName} onChange={(e) => setNewEquipment({ ...newEquipment, locationName: e.target.value })} placeholder="Location" className="px-4 py-3 rounded-xl border border-stone-200 bg-stone-50" />
              <input value={newEquipment.minimumDays} type="number" min="1" onChange={(e) => setNewEquipment({ ...newEquipment, minimumDays: e.target.value })} placeholder="Minimum days" className="px-4 py-3 rounded-xl border border-stone-200 bg-stone-50" />
              <input value={newEquipment.power} onChange={(e) => setNewEquipment({ ...newEquipment, power: e.target.value })} placeholder="Power" className="px-4 py-3 rounded-xl border border-stone-200 bg-stone-50" />
              <input value={newEquipment.fuelType} onChange={(e) => setNewEquipment({ ...newEquipment, fuelType: e.target.value })} placeholder="Fuel type" className="px-4 py-3 rounded-xl border border-stone-200 bg-stone-50" />
              <textarea value={newEquipment.description} onChange={(e) => setNewEquipment({ ...newEquipment, description: e.target.value })} placeholder="Equipment description" rows={4} className="col-span-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50" />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowEquipmentForm(false)} className="px-4 py-3 rounded-xl border border-stone-200 text-stone-700 font-bold">Cancel</button>
              <button onClick={handleCreateEquipment} className="px-5 py-3 rounded-xl bg-amber-600 text-white font-bold">Publish Equipment</button>
            </div>
          </div>
        </div>
      )}

      {bookings.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-stone-900">
                  My Recent Rental Requests
                </h2>
                <p className="text-sm text-stone-500 mt-1">
                  Track your equipment booking requests
                </p>
              </div>

              <Calendar className="w-7 h-7 text-amber-600" />
            </div>

            <div className="mt-5 space-y-3">
              {bookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-100"
                >
                  <div>
                    <div className="font-bold text-stone-900">
                      {booking.equipmentName}
                    </div>

                    <div className="text-xs text-stone-500 mt-1">
                      {booking.startDate} →{' '}
                      {booking.endDate} •{' '}
                      {booking.days} day
                      {booking.days !== 1
                        ? 's'
                        : ''}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-black text-amber-700">
                      ₹{formatCurrency(booking.total)}
                    </span>

                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black ${booking.status ===
                          'Confirmed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : booking.status ===
                            'Cancelled'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentRentalPage;