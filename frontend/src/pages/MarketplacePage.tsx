import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { MarketplaceProduct } from '../types/index.ts';
import { PaymentMethodModal } from '../components/PaymentMethodModal.tsx';
import {
  IndianRupee,
  ShoppingCart,
  Star,
  Search,
  Filter,
  Heart,
  HeartOff,
  MapPin,
  ShieldCheck,
  Truck,
  PackageCheck,
  Leaf,
  Sprout,
  FlaskConical,
  Wrench,
  Bug,
  ChevronDown,
  X,
  Plus,
  Minus,
  Trash2,
  Eye,
  CheckCircle2,
  Store,
  BadgeCheck,
  Clock3,
  ArrowUpDown,
  ShoppingBag,
  Percent,
  Phone,
  MessageCircle,
  RefreshCw,
  SlidersHorizontal,
  Package,
  CreditCard,
  Navigation,
  AlertCircle,
  Tag,
  SearchX,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

type Category =
  | 'All'
  | 'Seeds'
  | 'Fertilizers'
  | 'Pesticides'
  | 'Bio Products'
  | 'Farm Tools'
  | 'Irrigation'
  | 'Crop Protection'
  | 'Equipment';

type SortOption =
  | 'recommended'
  | 'price-low'
  | 'price-high'
  | 'rating'
  | 'newest'
  | 'discount';

interface ProductView extends MarketplaceProduct {
  brand: string;
  seller: string;
  sellerVerified: boolean;
  rating: number;
  reviewCount: number;
  stock: number;
  unit: string;
  originalPrice: number;
  discount: number;
  deliveryDays: string;
  location: string;
  tags: string[];
  featured?: boolean;
  organic?: boolean;
  popular?: boolean;
}

interface CartItem {
  product: ProductView;
  quantity: number;
}

interface ProductDetailsModalProps {
  product: ProductView | null;
  onClose: () => void;
  onAdd: (product: ProductView) => void;
}

const FALLBACK_PRODUCTS: ProductView[] = [
  // ============================================================
  // 🌱 SEEDS — 15 PRODUCTS
  // ============================================================
  {
    id: 'seed-001',
    name: 'Hybrid Tomato Seeds - Arka Rakshak',
    description: 'High-yield tomato hybrid suitable for commercial cultivation.',
    category: 'Seeds',
    price: 245,
    images: [],
    brand: 'ICAR Certified',
    seller: 'Kisan Agro Seeds',
    sellerVerified: true,
    rating: 4.7,
    reviewCount: 184,
    stock: 48,
    unit: '10 g',
    originalPrice: 320,
    discount: 23,
    deliveryDays: '2-4 days',
    location: 'Karnataka',
    tags: ['Tomato', 'Hybrid', 'High Yield'],
    featured: true,
    popular: true,
  },
  {
    id: 'seed-002',
    name: 'Paddy Seeds - High Yield Variety',
    description: 'Quality paddy seed suitable for irrigated agricultural regions.',
    category: 'Seeds',
    price: 680,
    images: [],
    brand: 'National Seeds',
    seller: 'Bharat Seeds Store',
    sellerVerified: true,
    rating: 4.5,
    reviewCount: 97,
    stock: 35,
    unit: '5 kg',
    originalPrice: 850,
    discount: 20,
    deliveryDays: '3-5 days',
    location: 'Karnataka',
    tags: ['Paddy', 'Rice', 'High Yield'],
    popular: true,
  },
  {
    id: 'seed-003',
    name: 'Maize Hybrid Seeds',
    description: 'Hybrid maize seeds designed for improved yield and uniform growth.',
    category: 'Seeds',
    price: 540,
    images: [],
    brand: 'Bharat Seeds',
    seller: 'Green Field Agro',
    sellerVerified: true,
    rating: 4.6,
    reviewCount: 121,
    stock: 62,
    unit: '4 kg',
    originalPrice: 690,
    discount: 22,
    deliveryDays: '2-4 days',
    location: 'Maharashtra',
    tags: ['Maize', 'Hybrid', 'Kharif'],
  },
  {
    id: 'seed-004',
    name: 'Chilli Hybrid Seeds - Teja',
    description: 'High-quality chilli seeds suitable for commercial cultivation.',
    category: 'Seeds',
    price: 385,
    images: [],
    brand: 'Kisan Seeds',
    seller: 'South India Agro',
    sellerVerified: true,
    rating: 4.6,
    reviewCount: 142,
    stock: 41,
    unit: '10 g',
    originalPrice: 450,
    discount: 14,
    deliveryDays: '2-4 days',
    location: 'Karnataka',
    tags: ['Chilli', 'Hybrid', 'Teja'],
  },
  {
    id: 'seed-005',
    name: 'Onion Seeds - N-53',
    description: 'Reliable onion variety suitable for rabi and kharif cultivation.',
    category: 'Seeds',
    price: 290,
    images: [],
    brand: 'FarmGold',
    seller: 'Deccan Seeds',
    sellerVerified: true,
    rating: 4.5,
    reviewCount: 89,
    stock: 56,
    unit: '50 g',
    originalPrice: 350,
    discount: 17,
    deliveryDays: '2-5 days',
    location: 'Karnataka',
    tags: ['Onion', 'N-53', 'Vegetable'],
  },
  {
    id: 'seed-006',
    name: 'Brinjal Hybrid Seeds',
    description: 'Hybrid brinjal variety with good fruit quality and productivity.',
    category: 'Seeds',
    price: 210,
    images: [],
    brand: 'AgriMax',
    seller: 'Farm Seeds India',
    sellerVerified: true,
    rating: 4.4,
    reviewCount: 76,
    stock: 44,
    unit: '10 g',
    originalPrice: 260,
    discount: 19,
    deliveryDays: '2-4 days',
    location: 'Tamil Nadu',
    tags: ['Brinjal', 'Hybrid', 'Vegetable'],
  },
  {
    id: 'seed-007',
    name: 'Cotton Hybrid Seeds - Bt Cotton',
    description: 'Hybrid cotton seed suitable for major cotton-growing regions.',
    category: 'Seeds',
    price: 820,
    images: [],
    brand: 'Bharat Cotton',
    seller: 'Deccan Agro',
    sellerVerified: true,
    rating: 4.6,
    reviewCount: 198,
    stock: 32,
    unit: '450 g',
    originalPrice: 980,
    discount: 16,
    deliveryDays: '3-5 days',
    location: 'Maharashtra',
    tags: ['Cotton', 'Hybrid', 'Commercial'],
    popular: true,
  },
  {
    id: 'seed-008',
    name: 'Groundnut Seeds - TMV 2',
    description: 'Groundnut variety suitable for dryland and irrigated farming.',
    category: 'Seeds',
    price: 720,
    images: [],
    brand: 'National Seeds',
    seller: 'Kisan Beej Bhandar',
    sellerVerified: true,
    rating: 4.5,
    reviewCount: 112,
    stock: 28,
    unit: '5 kg',
    originalPrice: 850,
    discount: 15,
    deliveryDays: '3-6 days',
    location: 'Andhra Pradesh',
    tags: ['Groundnut', 'Oilseed', 'Dryland'],
  },
  {
    id: 'seed-009',
    name: 'Sunflower Hybrid Seeds',
    description: 'High-oil-content sunflower hybrid for commercial farming.',
    category: 'Seeds',
    price: 460,
    images: [],
    brand: 'SunGrow',
    seller: 'Agri Seed Mart',
    sellerVerified: true,
    rating: 4.4,
    reviewCount: 67,
    stock: 37,
    unit: '1 kg',
    originalPrice: 540,
    discount: 15,
    deliveryDays: '2-5 days',
    location: 'Karnataka',
    tags: ['Sunflower', 'Oilseed', 'Hybrid'],
  },
  {
    id: 'seed-010',
    name: 'Okra Hybrid Seeds',
    description: 'Early-bearing okra variety with uniform green fruits.',
    category: 'Seeds',
    price: 175,
    images: [],
    brand: 'GreenGrow',
    seller: 'Vegetable Seed Hub',
    sellerVerified: true,
    rating: 4.6,
    reviewCount: 93,
    stock: 72,
    unit: '50 g',
    originalPrice: 220,
    discount: 20,
    deliveryDays: '2-4 days',
    location: 'Karnataka',
    tags: ['Okra', 'Bhendi', 'Vegetable'],
  },
  {
    id: 'seed-011',
    name: 'Watermelon Hybrid Seeds',
    description: 'Commercial watermelon hybrid producing large uniform fruits.',
    category: 'Seeds',
    price: 640,
    images: [],
    brand: 'AgroStar Seeds',
    seller: 'Fresh Crop Seeds',
    sellerVerified: true,
    rating: 4.7,
    reviewCount: 84,
    stock: 29,
    unit: '25 g',
    originalPrice: 780,
    discount: 18,
    deliveryDays: '3-5 days',
    location: 'Telangana',
    tags: ['Watermelon', 'Hybrid', 'Fruit'],
  },
  {
    id: 'seed-012',
    name: 'Cucumber Hybrid Seeds',
    description: 'Fast-growing cucumber hybrid suitable for open-field cultivation.',
    category: 'Seeds',
    price: 260,
    images: [],
    brand: 'Nature Seeds',
    seller: 'South Agro Store',
    sellerVerified: true,
    rating: 4.5,
    reviewCount: 58,
    stock: 45,
    unit: '25 g',
    originalPrice: 320,
    discount: 19,
    deliveryDays: '2-4 days',
    location: 'Karnataka',
    tags: ['Cucumber', 'Hybrid', 'Vegetable'],
  },
  {
    id: 'seed-013',
    name: 'Carrot Seeds - Nantes',
    description: 'Uniform carrot variety with attractive color and good root quality.',
    category: 'Seeds',
    price: 195,
    images: [],
    brand: 'HortiGrow',
    seller: 'Hill Farm Seeds',
    sellerVerified: true,
    rating: 4.3,
    reviewCount: 44,
    stock: 64,
    unit: '50 g',
    originalPrice: 240,
    discount: 19,
    deliveryDays: '3-5 days',
    location: 'Karnataka',
    tags: ['Carrot', 'Nantes', 'Vegetable'],
  },
  {
    id: 'seed-014',
    name: 'Soybean Seeds - JS 335',
    description: 'Popular soybean variety suitable for kharif cultivation.',
    category: 'Seeds',
    price: 590,
    images: [],
    brand: 'National Seeds',
    seller: 'Central Agro Seeds',
    sellerVerified: true,
    rating: 4.5,
    reviewCount: 103,
    stock: 40,
    unit: '5 kg',
    originalPrice: 700,
    discount: 16,
    deliveryDays: '3-6 days',
    location: 'Madhya Pradesh',
    tags: ['Soybean', 'Kharif', 'Oilseed'],
  },
  {
    id: 'seed-015',
    name: 'Wheat Seeds - HD 2967',
    description: 'High-performing wheat variety for suitable rabi regions.',
    category: 'Seeds',
    price: 650,
    images: [],
    brand: 'Kisan Seeds',
    seller: 'Bharat Beej Store',
    sellerVerified: true,
    rating: 4.6,
    reviewCount: 137,
    stock: 55,
    unit: '10 kg',
    originalPrice: 780,
    discount: 17,
    deliveryDays: '3-6 days',
    location: 'Punjab',
    tags: ['Wheat', 'Rabi', 'High Yield'],
  },

  // ============================================================
  // 🧪 FERTILIZERS — 10 PRODUCTS
  // ============================================================
  {
    id: 'fert-001',
    name: 'NPK 19:19:19 Water Soluble Fertilizer',
    description: 'Water-soluble NPK fertilizer suitable for fertigation.',
    category: 'Fertilizers',
    price: 1290,
    images: [],
    brand: 'AgriGrow',
    seller: 'FarmCare India',
    sellerVerified: true,
    rating: 4.8,
    reviewCount: 246,
    stock: 27,
    unit: '25 kg',
    originalPrice: 1550,
    discount: 17,
    deliveryDays: '2-3 days',
    location: 'Karnataka',
    tags: ['NPK', 'Fertigation', 'Water Soluble'],
    featured: true,
  },
  {
    id: 'fert-002',
    name: 'Urea Fertilizer',
    description: 'Nitrogen fertilizer commonly used for crop nutrition.',
    category: 'Fertilizers',
    price: 310,
    images: [],
    brand: 'IFFCO',
    seller: 'Kisan Fertilizer Store',
    sellerVerified: true,
    rating: 4.6,
    reviewCount: 318,
    stock: 80,
    unit: '45 kg',
    originalPrice: 350,
    discount: 11,
    deliveryDays: '2-4 days',
    location: 'Karnataka',
    tags: ['Urea', 'Nitrogen', 'Fertilizer'],
    popular: true,
  },
  {
    id: 'fert-003',
    name: 'DAP 18:46:0 Fertilizer',
    description: 'Phosphorus-rich fertilizer suitable for various field crops.',
    category: 'Fertilizers',
    price: 1350,
    images: [],
    brand: 'IFFCO',
    seller: 'Bharat Agro Center',
    sellerVerified: true,
    rating: 4.7,
    reviewCount: 274,
    stock: 46,
    unit: '50 kg',
    originalPrice: 1500,
    discount: 10,
    deliveryDays: '2-4 days',
    location: 'Karnataka',
    tags: ['DAP', 'Phosphorus', 'Field Crops'],
  },
  {
    id: 'fert-004',
    name: 'MOP Potassium Fertilizer',
    description: 'Potassium fertilizer for supporting crop development.',
    category: 'Fertilizers',
    price: 1180,
    images: [],
    brand: 'Coromandel',
    seller: 'South Fertilizer Hub',
    sellerVerified: true,
    rating: 4.5,
    reviewCount: 156,
    stock: 38,
    unit: '50 kg',
    originalPrice: 1320,
    discount: 11,
    deliveryDays: '3-5 days',
    location: 'Karnataka',
    tags: ['MOP', 'Potassium', 'Fertilizer'],
  },
  {
    id: 'fert-005',
    name: 'Zinc Sulphate Fertilizer',
    description: 'Micronutrient fertilizer for zinc-deficient soils.',
    category: 'Fertilizers',
    price: 680,
    images: [],
    brand: 'AgroChem',
    seller: 'Farm Input Store',
    sellerVerified: true,
    rating: 4.6,
    reviewCount: 91,
    stock: 52,
    unit: '25 kg',
    originalPrice: 760,
    discount: 11,
    deliveryDays: '2-5 days',
    location: 'Karnataka',
    tags: ['Zinc', 'Micronutrient', 'Soil'],
  },
  {
    id: 'fert-006',
    name: 'Calcium Nitrate Fertilizer',
    description: 'Water-soluble calcium and nitrogen fertilizer.',
    category: 'Fertilizers',
    price: 920,
    images: [],
    brand: 'CropCare',
    seller: 'Modern Agro',
    sellerVerified: true,
    rating: 4.5,
    reviewCount: 73,
    stock: 34,
    unit: '25 kg',
    originalPrice: 1050,
    discount: 12,
    deliveryDays: '3-5 days',
    location: 'Maharashtra',
    tags: ['Calcium', 'Nitrogen', 'Water Soluble'],
  },
  {
    id: 'fert-007',
    name: 'Magnesium Sulphate',
    description: 'Magnesium and sulphur fertilizer for crop nutrition.',
    category: 'Fertilizers',
    price: 560,
    images: [],
    brand: 'GreenLeaf',
    seller: 'Agro World',
    sellerVerified: true,
    rating: 4.4,
    reviewCount: 64,
    stock: 49,
    unit: '25 kg',
    originalPrice: 650,
    discount: 14,
    deliveryDays: '2-5 days',
    location: 'Telangana',
    tags: ['Magnesium', 'Sulphur', 'Micronutrient'],
  },
  {
    id: 'fert-008',
    name: 'Humic Acid Granules',
    description: 'Soil conditioner supporting root development and soil quality.',
    category: 'Fertilizers',
    price: 740,
    images: [],
    brand: 'HumicPlus',
    seller: 'Organic Farm Inputs',
    sellerVerified: true,
    rating: 4.7,
    reviewCount: 118,
    stock: 43,
    unit: '10 kg',
    originalPrice: 890,
    discount: 17,
    deliveryDays: '2-4 days',
    location: 'Karnataka',
    tags: ['Humic Acid', 'Soil Conditioner', 'Organic'],
  },
  {
    id: 'fert-009',
    name: 'Seaweed Extract Fertilizer',
    description: 'Plant-based biostimulant for crop growth support.',
    category: 'Fertilizers',
    price: 620,
    images: [],
    brand: 'OceanGrow',
    seller: 'Bio Agro Store',
    sellerVerified: true,
    rating: 4.6,
    reviewCount: 82,
    stock: 37,
    unit: '1 L',
    originalPrice: 750,
    discount: 17,
    deliveryDays: '2-5 days',
    location: 'Tamil Nadu',
    tags: ['Seaweed', 'Biostimulant', 'Organic'],
    organic: true,
  },
  {
    id: 'fert-010',
    name: 'Water Soluble NPK 13:40:13',
    description: 'Phosphorus-rich water-soluble fertilizer for crop stages requiring P.',
    category: 'Fertilizers',
    price: 1480,
    images: [],
    brand: 'AgriGrow',
    seller: 'Kisan Farm Store',
    sellerVerified: true,
    rating: 4.7,
    reviewCount: 134,
    stock: 31,
    unit: '25 kg',
    originalPrice: 1700,
    discount: 13,
    deliveryDays: '2-4 days',
    location: 'Karnataka',
    tags: ['NPK', 'Phosphorus', 'Fertigation'],
  },

  // ============================================================
  // 🐛 CROP PROTECTION — 10 PRODUCTS
  // ============================================================
  {
    id: 'pest-001',
    name: 'Neem Based Bio Pesticide',
    description: 'Plant-based crop protection product for integrated pest management.',
    category: 'Bio Products',
    price: 390,
    images: [],
    brand: 'BioShield',
    seller: 'Agro Natural',
    sellerVerified: true,
    rating: 4.4,
    reviewCount: 63,
    stock: 31,
    unit: '1 L',
    originalPrice: 480,
    discount: 19,
    deliveryDays: '2-4 days',
    location: 'Tamil Nadu',
    tags: ['Neem', 'Organic', 'Pest Control'],
    organic: true,
  },
  {
    id: 'pest-002',
    name: 'Trichoderma Bio Fungicide',
    description: 'Biological crop protection product for soil and plant health.',
    category: 'Crop Protection',
    price: 340,
    images: [],
    brand: 'BioFarm',
    seller: 'Natural Crop Care',
    sellerVerified: true,
    rating: 4.6,
    reviewCount: 104,
    stock: 46,
    unit: '1 kg',
    originalPrice: 410,
    discount: 17,
    deliveryDays: '2-5 days',
    location: 'Karnataka',
    tags: ['Trichoderma', 'Fungicide', 'Bio'],
    organic: true,
  },
  {
    id: 'pest-003',
    name: 'Pseudomonas Fluorescens',
    description: 'Biological product used in integrated crop disease management.',
    category: 'Crop Protection',
    price: 290,
    images: [],
    brand: 'BioGrow',
    seller: 'Agri Bio Solutions',
    sellerVerified: true,
    rating: 4.5,
    reviewCount: 77,
    stock: 52,
    unit: '1 kg',
    originalPrice: 350,
    discount: 17,
    deliveryDays: '2-4 days',
    location: 'Karnataka',
    tags: ['Pseudomonas', 'Bio Control', 'Disease'],
    organic: true,
  },
  {
    id: 'pest-004',
    name: 'Sticky Yellow Insect Traps',
    description: 'Non-chemical monitoring and trapping solution for flying insects.',
    category: 'Crop Protection',
    price: 180,
    images: [],
    brand: 'FarmSafe',
    seller: 'Smart Crop Store',
    sellerVerified: true,
    rating: 4.5,
    reviewCount: 92,
    stock: 120,
    unit: '20 traps',
    originalPrice: 230,
    discount: 22,
    deliveryDays: '2-4 days',
    location: 'Karnataka',
    tags: ['Insect Trap', 'Organic', 'Pest Monitoring'],
  },
  {
    id: 'pest-005',
    name: 'Blue Sticky Insect Traps',
    description: 'Blue adhesive traps for monitoring selected agricultural pests.',
    category: 'Crop Protection',
    price: 185,
    images: [],
    brand: 'FarmSafe',
    seller: 'Agro Protection Hub',
    sellerVerified: true,
    rating: 4.4,
    reviewCount: 61,
    stock: 85,
    unit: '20 traps',
    originalPrice: 240,
    discount: 23,
    deliveryDays: '2-4 days',
    location: 'Tamil Nadu',
    tags: ['Blue Trap', 'Pest Control', 'Monitoring'],
  },
  {
    id: 'pest-006',
    name: 'Bio Insecticide - Bacillus thuringiensis',
    description: 'Microbial crop protection product used in integrated pest management.',
    category: 'Crop Protection',
    price: 450,
    images: [],
    brand: 'BioShield',
    seller: 'Green Crop Care',
    sellerVerified: true,
    rating: 4.6,
    reviewCount: 88,
    stock: 28,
    unit: '500 g',
    originalPrice: 540,
    discount: 17,
    deliveryDays: '2-5 days',
    location: 'Maharashtra',
    tags: ['BT', 'Bio Insecticide', 'IPM'],
    organic: true,
  },
  {
    id: 'pest-007',
    name: 'Copper Oxychloride Fungicide',
    description: 'Copper-based fungicide for agricultural disease management.',
    category: 'Crop Protection',
    price: 580,
    images: [],
    brand: 'CropGuard',
    seller: 'Farm Protection Store',
    sellerVerified: true,
    rating: 4.5,
    reviewCount: 119,
    stock: 36,
    unit: '1 kg',
    originalPrice: 690,
    discount: 16,
    deliveryDays: '2-5 days',
    location: 'Karnataka',
    tags: ['Copper', 'Fungicide', 'Disease Control'],
  },
  {
    id: 'pest-008',
    name: 'Bio Larvicide',
    description: 'Biological crop protection solution for selected insect larvae.',
    category: 'Crop Protection',
    price: 510,
    images: [],
    brand: 'EcoCrop',
    seller: 'Natural Agro Care',
    sellerVerified: true,
    rating: 4.4,
    reviewCount: 54,
    stock: 25,
    unit: '500 g',
    originalPrice: 620,
    discount: 18,
    deliveryDays: '3-5 days',
    location: 'Andhra Pradesh',
    tags: ['Larvicide', 'Bio', 'Pest Control'],
    organic: true,
  },
  {
    id: 'pest-009',
    name: 'Neem Oil Cold Pressed',
    description: 'Cold-pressed neem oil for agricultural and horticultural use.',
    category: 'Bio Products',
    price: 320,
    images: [],
    brand: 'NatureFarm',
    seller: 'Organic Village',
    sellerVerified: true,
    rating: 4.7,
    reviewCount: 151,
    stock: 68,
    unit: '1 L',
    originalPrice: 390,
    discount: 18,
    deliveryDays: '2-4 days',
    location: 'Karnataka',
    tags: ['Neem Oil', 'Organic', 'Plant Care'],
    organic: true,
    popular: true,
  },
  {
    id: 'pest-010',
    name: 'Bio Fungicide Plant Protector',
    description: 'Biological plant protection product for integrated disease management.',
    category: 'Bio Products',
    price: 420,
    images: [],
    brand: 'GreenBio',
    seller: 'Organic Crop Solutions',
    sellerVerified: true,
    rating: 4.5,
    reviewCount: 69,
    stock: 33,
    unit: '1 L',
    originalPrice: 500,
    discount: 16,
    deliveryDays: '2-5 days',
    location: 'Kerala',
    tags: ['Bio Fungicide', 'Organic', 'Plant Health'],
    organic: true,
  },

  // ============================================================
  // 🛠️ FARM TOOLS — 10 PRODUCTS
  // ============================================================
  {
    id: 'tool-001',
    name: 'Battery Agricultural Sprayer',
    description: 'Rechargeable battery-powered sprayer for small and medium farms.',
    category: 'Farm Tools',
    price: 2850,
    images: [],
    brand: 'KisanPro',
    seller: 'Agri Tools Hub',
    sellerVerified: true,
    rating: 4.5,
    reviewCount: 143,
    stock: 18,
    unit: '1 unit',
    originalPrice: 3400,
    discount: 16,
    deliveryDays: '2-5 days',
    location: 'Bengaluru',
    tags: ['Sprayer', 'Battery', 'Farm Tool'],
    popular: true,
  },
  {
    id: 'tool-002',
    name: 'Manual Knapsack Sprayer',
    description: 'Durable manual sprayer for agricultural crop protection applications.',
    category: 'Farm Tools',
    price: 1250,
    images: [],
    brand: 'KisanPro',
    seller: 'Farm Equipment India',
    sellerVerified: true,
    rating: 4.4,
    reviewCount: 102,
    stock: 35,
    unit: '16 L',
    originalPrice: 1500,
    discount: 17,
    deliveryDays: '2-4 days',
    location: 'Karnataka',
    tags: ['Sprayer', 'Manual', 'Knapsack'],
  },
  {
    id: 'tool-003',
    name: 'Agricultural Hand Hoe',
    description: 'Strong steel hand hoe for weeding and soil preparation.',
    category: 'Farm Tools',
    price: 420,
    images: [],
    brand: 'Kisan Tools',
    seller: 'Rural Tools Store',
    sellerVerified: true,
    rating: 4.6,
    reviewCount: 73,
    stock: 92,
    unit: '1 unit',
    originalPrice: 500,
    discount: 16,
    deliveryDays: '2-4 days',
    location: 'Karnataka',
    tags: ['Hoe', 'Hand Tool', 'Weeding'],
  },
  {
    id: 'tool-004',
    name: 'Steel Garden Rake',
    description: 'Heavy-duty steel rake for soil leveling and field preparation.',
    category: 'Farm Tools',
    price: 550,
    images: [],
    brand: 'FarmMaster',
    seller: 'Agri Tools Hub',
    sellerVerified: true,
    rating: 4.5,
    reviewCount: 65,
    stock: 47,
    unit: '1 unit',
    originalPrice: 650,
    discount: 15,
    deliveryDays: '2-5 days',
    location: 'Karnataka',
    tags: ['Rake', 'Steel', 'Soil Preparation'],
  },
  {
    id: 'tool-005',
    name: 'Pruning Secateurs',
    description: 'Sharp pruning tool suitable for horticultural crops and gardens.',
    category: 'Farm Tools',
    price: 390,
    images: [],
    brand: 'HortiPro',
    seller: 'Garden Agro Store',
    sellerVerified: true,
    rating: 4.7,
    reviewCount: 124,
    stock: 56,
    unit: '1 unit',
    originalPrice: 480,
    discount: 19,
    deliveryDays: '2-4 days',
    location: 'Bengaluru',
    tags: ['Pruning', 'Horticulture', 'Garden Tool'],
  },
  {
    id: 'tool-006',
    name: 'Coconut Harvesting Tool',
    description: 'Long-reach harvesting tool designed for coconut cultivation.',
    category: 'Farm Tools',
    price: 980,
    images: [],
    brand: 'CocoMaster',
    seller: 'South Farm Tools',
    sellerVerified: true,
    rating: 4.4,
    reviewCount: 48,
    stock: 24,
    unit: '1 unit',
    originalPrice: 1150,
    discount: 15,
    deliveryDays: '3-6 days',
    location: 'Kerala',
    tags: ['Coconut', 'Harvesting', 'Tool'],
  },
  {
    id: 'tool-007',
    name: 'Manual Seed Sowing Tool',
    description: 'Hand-operated seed planter for vegetable and field crops.',
    category: 'Farm Tools',
    price: 1450,
    images: [],
    brand: 'SeedMaster',
    seller: 'Agri Implements',
    sellerVerified: true,
    rating: 4.5,
    reviewCount: 79,
    stock: 19,
    unit: '1 unit',
    originalPrice: 1700,
    discount: 15,
    deliveryDays: '3-5 days',
    location: 'Maharashtra',
    tags: ['Seeder', 'Planting', 'Manual'],
  },
  {
    id: 'tool-008',
    name: 'Weeding Wheel Hoe',
    description: 'Manual wheel hoe designed for inter-row weed management.',
    category: 'Farm Tools',
    price: 1850,
    images: [],
    brand: 'FarmMaster',
    seller: 'Kisan Implements',
    sellerVerified: true,
    rating: 4.6,
    reviewCount: 86,
    stock: 21,
    unit: '1 unit',
    originalPrice: 2200,
    discount: 16,
    deliveryDays: '3-6 days',
    location: 'Karnataka',
    tags: ['Weeder', 'Wheel Hoe', 'Manual'],
  },
  {
    id: 'tool-009',
    name: 'Digital Agricultural Weighing Scale',
    description: 'Digital scale suitable for produce weighing and farm operations.',
    category: 'Farm Tools',
    price: 1750,
    images: [],
    brand: 'AgriScale',
    seller: 'Farm Equipment Hub',
    sellerVerified: true,
    rating: 4.5,
    reviewCount: 91,
    stock: 26,
    unit: '1 unit',
    originalPrice: 2100,
    discount: 17,
    deliveryDays: '2-5 days',
    location: 'Bengaluru',
    tags: ['Scale', 'Weighing', 'Digital'],
  },
  {
    id: 'tool-010',
    name: 'Heavy Duty Agricultural Shovel',
    description: 'Strong steel shovel for soil, compost and farm material handling.',
    category: 'Farm Tools',
    price: 620,
    images: [],
    brand: 'Kisan Tools',
    seller: 'Rural Agro Store',
    sellerVerified: true,
    rating: 4.6,
    reviewCount: 112,
    stock: 74,
    unit: '1 unit',
    originalPrice: 750,
    discount: 17,
    deliveryDays: '2-4 days',
    location: 'Karnataka',
    tags: ['Shovel', 'Steel', 'Farm Tool'],
  },

  // ============================================================
  // 💧 IRRIGATION — 10 PRODUCTS
  // ============================================================
  {
    id: 'irrigation-001',
    name: 'Drip Irrigation Starter Kit',
    description: 'Starter drip irrigation kit for vegetable and horticultural crops.',
    category: 'Irrigation',
    price: 2190,
    images: [],
    brand: 'JalKisan',
    seller: 'Smart Irrigation India',
    sellerVerified: true,
    rating: 4.7,
    reviewCount: 76,
    stock: 24,
    unit: '1 kit',
    originalPrice: 2750,
    discount: 20,
    deliveryDays: '4-7 days',
    location: 'Andhra Pradesh',
    tags: ['Drip', 'Water Saving', 'Irrigation'],
    featured: true,
  },
  {
    id: 'irrigation-002',
    name: 'Micro Sprinkler Irrigation Kit',
    description: 'Micro sprinkler kit for efficient irrigation of horticultural crops.',
    category: 'Irrigation',
    price: 1850,
    images: [],
    brand: 'JalKisan',
    seller: 'WaterTech Agro',
    sellerVerified: true,
    rating: 4.6,
    reviewCount: 83,
    stock: 29,
    unit: '1 kit',
    originalPrice: 2250,
    discount: 18,
    deliveryDays: '3-6 days',
    location: 'Karnataka',
    tags: ['Sprinkler', 'Micro Irrigation', 'Water Saving'],
  },
  {
    id: 'irrigation-003',
    name: 'PVC Irrigation Pipe 1 Inch',
    description: 'Agricultural PVC pipe for water transportation and irrigation systems.',
    category: 'Irrigation',
    price: 680,
    images: [],
    brand: 'JalFlow',
    seller: 'Irrigation Mart',
    sellerVerified: true,
    rating: 4.4,
    reviewCount: 56,
    stock: 150,
    unit: '30 m',
    originalPrice: 800,
    discount: 15,
    deliveryDays: '3-6 days',
    location: 'Karnataka',
    tags: ['PVC', 'Pipe', 'Irrigation'],
  },
  {
    id: 'irrigation-004',
    name: 'Drip Lateral Pipe',
    description: 'Drip lateral pipe for precision irrigation applications.',
    category: 'Irrigation',
    price: 1250,
    images: [],
    brand: 'JalFlow',
    seller: 'Smart Farm Irrigation',
    sellerVerified: true,
    rating: 4.6,
    reviewCount: 71,
    stock: 82,
    unit: '100 m',
    originalPrice: 1500,
    discount: 17,
    deliveryDays: '3-5 days',
    location: 'Karnataka',
    tags: ['Drip', 'Lateral', 'Precision Irrigation'],
  },
  {
    id: 'irrigation-005',
    name: 'Drip Emitters 4 LPH',
    description: 'Pressure-compensating style emitters for drip irrigation systems.',
    category: 'Irrigation',
    price: 480,
    images: [],
    brand: 'AquaFarm',
    seller: 'Drip Solutions India',
    sellerVerified: true,
    rating: 4.5,
    reviewCount: 93,
    stock: 320,
    unit: '100 pieces',
    originalPrice: 580,
    discount: 17,
    deliveryDays: '2-5 days',
    location: 'Maharashtra',
    tags: ['Emitter', 'Drip', '4 LPH'],
  },
  {
    id: 'irrigation-006',
    name: 'Venturi Fertilizer Injector',
    description: 'Injector for introducing soluble fertilizers into irrigation systems.',
    category: 'Irrigation',
    price: 1450,
    images: [],
    brand: 'AquaFarm',
    seller: 'Agri Irrigation Hub',
    sellerVerified: true,
    rating: 4.7,
    reviewCount: 62,
    stock: 27,
    unit: '1 unit',
    originalPrice: 1750,
    discount: 17,
    deliveryDays: '3-5 days',
    location: 'Karnataka',
    tags: ['Venturi', 'Fertigation', 'Drip'],
  },
  {
    id: 'irrigation-007',
    name: 'Irrigation Water Filter',
    description: 'Agricultural filter for reducing sediment entering irrigation lines.',
    category: 'Irrigation',
    price: 2250,
    images: [],
    brand: 'AquaPure',
    seller: 'Water Management Store',
    sellerVerified: true,
    rating: 4.6,
    reviewCount: 57,
    stock: 18,
    unit: '1 unit',
    originalPrice: 2700,
    discount: 17,
    deliveryDays: '3-6 days',
    location: 'Tamil Nadu',
    tags: ['Filter', 'Water', 'Irrigation'],
  },
  {
    id: 'irrigation-008',
    name: 'Digital Irrigation Timer',
    description: 'Programmable irrigation timer for automated watering schedules.',
    category: 'Irrigation',
    price: 1650,
    images: [],
    brand: 'SmartFarm',
    seller: 'Agri Automation Store',
    sellerVerified: true,
    rating: 4.5,
    reviewCount: 84,
    stock: 33,
    unit: '1 unit',
    originalPrice: 1950,
    discount: 15,
    deliveryDays: '2-5 days',
    location: 'Bengaluru',
    tags: ['Timer', 'Automation', 'Smart Irrigation'],
  },
  {
    id: 'irrigation-009',
    name: 'Agricultural Water Pump',
    description: 'Electric pump suitable for farm water transfer applications.',
    category: 'Irrigation',
    price: 6850,
    images: [],
    brand: 'KisanPump',
    seller: 'Farm Machinery Hub',
    sellerVerified: true,
    rating: 4.5,
    reviewCount: 126,
    stock: 12,
    unit: '1 unit',
    originalPrice: 7800,
    discount: 12,
    deliveryDays: '4-8 days',
    location: 'Karnataka',
    tags: ['Water Pump', 'Electric', 'Irrigation'],
    popular: true,
  },
  {
    id: 'irrigation-010',
    name: 'Drip Connector Set',
    description: 'Connector accessories for assembling agricultural drip systems.',
    category: 'Irrigation',
    price: 360,
    images: [],
    brand: 'AquaFarm',
    seller: 'Drip Parts Store',
    sellerVerified: true,
    rating: 4.5,
    reviewCount: 49,
    stock: 180,
    unit: '50 pieces',
    originalPrice: 450,
    discount: 20,
    deliveryDays: '2-4 days',
    location: 'Karnataka',
    tags: ['Connector', 'Drip', 'Accessories'],
  },

  // ============================================================
  // 🌿 ORGANIC / BIO PRODUCTS — 10 PRODUCTS
  // ============================================================
  {
    id: 'bio-001',
    name: 'Organic Vermicompost',
    description: 'Organic compost for improving soil structure and microbial activity.',
    category: 'Bio Products',
    price: 420,
    images: [],
    brand: 'NatureFarm',
    seller: 'Organic Village',
    sellerVerified: true,
    rating: 4.6,
    reviewCount: 88,
    stock: 70,
    unit: '25 kg',
    originalPrice: 500,
    discount: 16,
    deliveryDays: '3-6 days',
    location: 'Karnataka',
    tags: ['Organic', 'Soil Health', 'Compost'],
    organic: true,
  },
  {
    id: 'bio-002',
    name: 'Farmyard Manure Compost',
    description: 'Well-decomposed organic manure for improving soil fertility.',
    category: 'Bio Products',
    price: 350,
    images: [],
    brand: 'NatureFarm',
    seller: 'Organic Farm Store',
    sellerVerified: true,
    rating: 4.5,
    reviewCount: 73,
    stock: 95,
    unit: '25 kg',
    originalPrice: 420,
    discount: 17,
    deliveryDays: '3-6 days',
    location: 'Karnataka',
    tags: ['FYM', 'Organic', 'Soil Fertility'],
    organic: true,
  },
  {
    id: 'bio-003',
    name: 'Azospirillum Bio Fertilizer',
    description: 'Microbial biofertilizer used as part of integrated nutrient management.',
    category: 'Bio Products',
    price: 280,
    images: [],
    brand: 'BioGrow',
    seller: 'Bio Agriculture India',
    sellerVerified: true,
    rating: 4.6,
    reviewCount: 81,
    stock: 48,
    unit: '1 L',
    originalPrice: 340,
    discount: 18,
    deliveryDays: '2-5 days',
    location: 'Tamil Nadu',
    tags: ['Azospirillum', 'Biofertilizer', 'Microbial'],
    organic: true,
  },
  {
    id: 'bio-004',
    name: 'Rhizobium Bio Fertilizer',
    description: 'Microbial inoculant commonly used with suitable legume crops.',
    category: 'Bio Products',
    price: 260,
    images: [],
    brand: 'BioGrow',
    seller: 'Green Bio Inputs',
    sellerVerified: true,
    rating: 4.5,
    reviewCount: 69,
    stock: 44,
    unit: '1 L',
    originalPrice: 320,
    discount: 19,
    deliveryDays: '2-5 days',
    location: 'Karnataka',
    tags: ['Rhizobium', 'Legumes', 'Biofertilizer'],
    organic: true,
  },
  {
    id: 'bio-005',
    name: 'Jeevamrut Organic Input',
    description: 'Traditional farm-made style organic input for soil management.',
    category: 'Bio Products',
    price: 290,
    images: [],
    brand: 'Desi Farm',
    seller: 'Natural Farming Store',
    sellerVerified: true,
    rating: 4.4,
    reviewCount: 58,
    stock: 37,
    unit: '5 L',
    originalPrice: 350,
    discount: 17,
    deliveryDays: '2-5 days',
    location: 'Karnataka',
    tags: ['Jeevamrut', 'Natural Farming', 'Organic'],
    organic: true,
  },
  {
    id: 'bio-006',
    name: 'Neem Cake Organic Manure',
    description: 'Neem-based organic soil input used in crop nutrient management.',
    category: 'Bio Products',
    price: 480,
    images: [],
    brand: 'NatureFarm',
    seller: 'Organic Input Mart',
    sellerVerified: true,
    rating: 4.7,
    reviewCount: 137,
    stock: 62,
    unit: '25 kg',
    originalPrice: 560,
    discount: 14,
    deliveryDays: '3-6 days',
    location: 'Karnataka',
    tags: ['Neem Cake', 'Organic', 'Soil'],
    organic: true,
  },
  {
    id: 'bio-007',
    name: 'Bone Meal Organic Fertilizer',
    description: 'Organic nutrient input used in selected crop production systems.',
    category: 'Bio Products',
    price: 620,
    images: [],
    brand: 'OrganicGrow',
    seller: 'Natural Farm Inputs',
    sellerVerified: true,
    rating: 4.4,
    reviewCount: 46,
    stock: 38,
    unit: '10 kg',
    originalPrice: 720,
    discount: 14,
    deliveryDays: '3-6 days',
    location: 'Maharashtra',
    tags: ['Bone Meal', 'Organic', 'Phosphorus'],
    organic: true,
  },
  {
    id: 'bio-008',
    name: 'Potash Mobilizing Biofertilizer',
    description: 'Microbial input intended to support nutrient availability in soil.',
    category: 'Bio Products',
    price: 340,
    images: [],
    brand: 'BioGrow',
    seller: 'Agri Bio World',
    sellerVerified: true,
    rating: 4.5,
    reviewCount: 63,
    stock: 42,
    unit: '1 L',
    originalPrice: 410,
    discount: 17,
    deliveryDays: '2-5 days',
    location: 'Karnataka',
    tags: ['Biofertilizer', 'Potash', 'Microbial'],
    organic: true,
  },
  {
    id: 'bio-009',
    name: 'Compost Activator',
    description: 'Microbial composting input designed to support organic waste decomposition.',
    category: 'Bio Products',
    price: 310,
    images: [],
    brand: 'EcoFarm',
    seller: 'Organic Solutions',
    sellerVerified: true,
    rating: 4.3,
    reviewCount: 41,
    stock: 55,
    unit: '1 kg',
    originalPrice: 380,
    discount: 18,
    deliveryDays: '2-5 days',
    location: 'Kerala',
    tags: ['Compost', 'Activator', 'Organic'],
    organic: true,
  },
  {
    id: 'bio-010',
    name: 'Organic Panchagavya',
    description: 'Traditional organic farm input used in natural farming practices.',
    category: 'Bio Products',
    price: 330,
    images: [],
    brand: 'Desi Farm',
    seller: 'Natural Farming Hub',
    sellerVerified: true,
    rating: 4.5,
    reviewCount: 71,
    stock: 33,
    unit: '5 L',
    originalPrice: 400,
    discount: 18,
    deliveryDays: '2-5 days',
    location: 'Karnataka',
    tags: ['Panchagavya', 'Organic', 'Natural Farming'],
    organic: true,
  },

  // ============================================================
  // 🚜 FARM EQUIPMENT — 10 PRODUCTS
  // ============================================================
  {
    id: 'equip-001',
    name: 'Mini Power Weeder',
    description: 'Compact power weeder for small and medium agricultural fields.',
    category: 'Equipment',
    price: 38500,
    images: [],
    brand: 'KisanMach',
    seller: 'Farm Machinery India',
    sellerVerified: true,
    rating: 4.6,
    reviewCount: 94,
    stock: 7,
    unit: '1 unit',
    originalPrice: 45000,
    discount: 14,
    deliveryDays: '5-10 days',
    location: 'Karnataka',
    tags: ['Power Weeder', 'Machinery', 'Farm Equipment'],
    featured: true,
  },
  {
    id: 'equip-002',
    name: 'Petrol Brush Cutter',
    description: 'Portable brush cutter for grass and weed management.',
    category: 'Equipment',
    price: 12900,
    images: [],
    brand: 'KisanMach',
    seller: 'Agri Machinery Hub',
    sellerVerified: true,
    rating: 4.5,
    reviewCount: 121,
    stock: 14,
    unit: '1 unit',
    originalPrice: 15000,
    discount: 14,
    deliveryDays: '4-7 days',
    location: 'Karnataka',
    tags: ['Brush Cutter', 'Petrol', 'Weeding'],
  },
  {
    id: 'equip-003',
    name: 'Electric Chaff Cutter',
    description: 'Electric machine for chopping fodder for livestock feeding.',
    category: 'Equipment',
    price: 18500,
    images: [],
    brand: 'FarmTech',
    seller: 'Rural Equipment Store',
    sellerVerified: true,
    rating: 4.6,
    reviewCount: 73,
    stock: 9,
    unit: '1 unit',
    originalPrice: 22000,
    discount: 16,
    deliveryDays: '5-9 days',
    location: 'Karnataka',
    tags: ['Chaff Cutter', 'Electric', 'Fodder'],
  },
  {
    id: 'equip-004',
    name: 'Mini Paddy Thresher',
    description: 'Compact thresher designed for small-scale paddy operations.',
    category: 'Equipment',
    price: 32500,
    images: [],
    brand: 'AgriTech',
    seller: 'Harvest Machinery',
    sellerVerified: true,
    rating: 4.5,
    reviewCount: 61,
    stock: 5,
    unit: '1 unit',
    originalPrice: 38000,
    discount: 14,
    deliveryDays: '6-12 days',
    location: 'Tamil Nadu',
    tags: ['Thresher', 'Paddy', 'Harvesting'],
  },
  {
    id: 'equip-005',
    name: 'Portable Grain Cleaner',
    description: 'Compact grain cleaning machine for farm-level post-harvest processing.',
    category: 'Equipment',
    price: 24500,
    images: [],
    brand: 'HarvestPro',
    seller: 'Agri Processing Hub',
    sellerVerified: true,
    rating: 4.4,
    reviewCount: 48,
    stock: 8,
    unit: '1 unit',
    originalPrice: 28000,
    discount: 13,
    deliveryDays: '5-10 days',
    location: 'Karnataka',
    tags: ['Grain Cleaner', 'Post Harvest', 'Machine'],
  },
  {
    id: 'equip-006',
    name: 'Solar Agricultural Water Pump',
    description: 'Solar-powered pump system for suitable farm irrigation applications.',
    category: 'Equipment',
    price: 48500,
    images: [],
    brand: 'SolarKisan',
    seller: 'Green Energy Agro',
    sellerVerified: true,
    rating: 4.7,
    reviewCount: 112,
    stock: 6,
    unit: '1 system',
    originalPrice: 55000,
    discount: 12,
    deliveryDays: '7-15 days',
    location: 'Rajasthan',
    tags: ['Solar', 'Water Pump', 'Irrigation'],
    popular: true,
  },
  {
    id: 'equip-007',
    name: 'Electric Fodder Cutter',
    description: 'Electric fodder cutting equipment for agricultural and dairy operations.',
    category: 'Equipment',
    price: 16200,
    images: [],
    brand: 'FarmTech',
    seller: 'Kisan Machinery Store',
    sellerVerified: true,
    rating: 4.5,
    reviewCount: 67,
    stock: 11,
    unit: '1 unit',
    originalPrice: 19000,
    discount: 15,
    deliveryDays: '5-9 days',
    location: 'Karnataka',
    tags: ['Fodder', 'Cutter', 'Electric'],
  },
  {
    id: 'equip-008',
    name: 'Agricultural Mini Cultivator',
    description: 'Compact cultivator for soil preparation in smaller farm plots.',
    category: 'Equipment',
    price: 42000,
    images: [],
    brand: 'AgriMach',
    seller: 'Modern Farm Machines',
    sellerVerified: true,
    rating: 4.6,
    reviewCount: 83,
    stock: 4,
    unit: '1 unit',
    originalPrice: 49000,
    discount: 14,
    deliveryDays: '7-12 days',
    location: 'Maharashtra',
    tags: ['Cultivator', 'Tillage', 'Machinery'],
  },
  {
    id: 'equip-009',
    name: 'Battery Power Sprayer 20L',
    description: 'Rechargeable agricultural sprayer with portable tank.',
    category: 'Equipment',
    price: 3650,
    images: [],
    brand: 'AgriPower',
    seller: 'Farm Equipment Hub',
    sellerVerified: true,
    rating: 4.6,
    reviewCount: 154,
    stock: 22,
    unit: '20 L',
    originalPrice: 4300,
    discount: 15,
    deliveryDays: '2-5 days',
    location: 'Karnataka',
    tags: ['Battery', 'Sprayer', '20L'],
    popular: true,
  },
  {
    id: 'equip-010',
    name: 'Manual Seed Drill',
    description: 'Hand-operated seed drill for row planting of selected crops.',
    category: 'Equipment',
    price: 3200,
    images: [],
    brand: 'KisanMach',
    seller: 'Agri Implements India',
    sellerVerified: true,
    rating: 4.5,
    reviewCount: 57,
    stock: 17,
    unit: '1 unit',
    originalPrice: 3800,
    discount: 16,
    deliveryDays: '3-6 days',
    location: 'Karnataka',
    tags: ['Seed Drill', 'Planting', 'Manual'],
  },

  // ============================================================
  // 🪴 NURSERY & PLANTING MATERIAL — 10 PRODUCTS
  // ============================================================
  {
    id: 'plant-001',
    name: 'Mango Grafted Plant - Alphonso',
    description: 'Grafted mango planting material suitable for orchard establishment.',
    category: 'Plants & Saplings',
    price: 450,
    images: [],
    brand: 'HortiFarm',
    seller: 'Green Nursery',
    sellerVerified: true,
    rating: 4.7,
    reviewCount: 145,
    stock: 75,
    unit: '1 plant',
    originalPrice: 550,
    discount: 18,
    deliveryDays: '3-7 days',
    location: 'Karnataka',
    tags: ['Mango', 'Alphonso', 'Grafted'],
    featured: true,
  },
  {
    id: 'plant-002',
    name: 'Guava Grafted Plant',
    description: 'Healthy grafted guava sapling for home gardens and orchards.',
    category: 'Plants & Saplings',
    price: 280,
    images: [],
    brand: 'Green Nursery',
    seller: 'Horti Plants India',
    sellerVerified: true,
    rating: 4.6,
    reviewCount: 91,
    stock: 82,
    unit: '1 plant',
    originalPrice: 340,
    discount: 18,
    deliveryDays: '3-6 days',
    location: 'Karnataka',
    tags: ['Guava', 'Grafted', 'Fruit Plant'],
  },
  {
    id: 'plant-003',
    name: 'Papaya Red Lady Sapling',
    description: 'Popular papaya planting material suitable for commercial cultivation.',
    category: 'Plants & Saplings',
    price: 160,
    images: [],
    brand: 'HortiGrow',
    seller: 'South India Nursery',
    sellerVerified: true,
    rating: 4.5,
    reviewCount: 74,
    stock: 120,
    unit: '1 plant',
    originalPrice: 200,
    discount: 20,
    deliveryDays: '2-5 days',
    location: 'Karnataka',
    tags: ['Papaya', 'Red Lady', 'Fruit'],
  },
  {
    id: 'plant-004',
    name: 'Drumstick Plant Sapling',
    description: 'Fast-growing moringa planting material for farm and garden use.',
    category: 'Plants & Saplings',
    price: 120,
    images: [],
    brand: 'GreenFarm',
    seller: 'Organic Nursery',
    sellerVerified: true,
    rating: 4.6,
    reviewCount: 83,
    stock: 145,
    unit: '1 plant',
    originalPrice: 150,
    discount: 20,
    deliveryDays: '2-5 days',
    location: 'Tamil Nadu',
    tags: ['Moringa', 'Drumstick', 'Sapling'],
  },
  {
    id: 'plant-005',
    name: 'Coconut Seedling',
    description: 'Healthy coconut planting material for suitable tropical regions.',
    category: 'Plants & Saplings',
    price: 260,
    images: [],
    brand: 'CocoFarm',
    seller: 'Coastal Nursery',
    sellerVerified: true,
    rating: 4.5,
    reviewCount: 68,
    stock: 65,
    unit: '1 plant',
    originalPrice: 320,
    discount: 19,
    deliveryDays: '4-8 days',
    location: 'Kerala',
    tags: ['Coconut', 'Seedling', 'Plantation'],
  },
  {
    id: 'plant-006',
    name: 'Lemon Grafted Plant',
    description: 'Grafted lemon plant suitable for gardens and commercial orchards.',
    category: 'Plants & Saplings',
    price: 220,
    images: [],
    brand: 'HortiFarm',
    seller: 'Green Nursery',
    sellerVerified: true,
    rating: 4.6,
    reviewCount: 102,
    stock: 88,
    unit: '1 plant',
    originalPrice: 280,
    discount: 21,
    deliveryDays: '3-6 days',
    location: 'Karnataka',
    tags: ['Lemon', 'Grafted', 'Citrus'],
  },
  {
    id: 'plant-007',
    name: 'Pomegranate Grafted Plant',
    description: 'Grafted pomegranate planting material for orchard development.',
    category: 'Plants & Saplings',
    price: 390,
    images: [],
    brand: 'FruitGrow',
    seller: 'Premium Nursery',
    sellerVerified: true,
    rating: 4.7,
    reviewCount: 119,
    stock: 54,
    unit: '1 plant',
    originalPrice: 480,
    discount: 19,
    deliveryDays: '3-7 days',
    location: 'Maharashtra',
    tags: ['Pomegranate', 'Grafted', 'Fruit'],
  },
  {
    id: 'plant-008',
    name: 'Banana Tissue Culture Plant',
    description: 'Tissue-culture banana planting material for commercial plantations.',
    category: 'Plants & Saplings',
    price: 85,
    images: [],
    brand: 'BananaTech',
    seller: 'Horti Plant Hub',
    sellerVerified: true,
    rating: 4.6,
    reviewCount: 137,
    stock: 300,
    unit: '1 plant',
    originalPrice: 110,
    discount: 23,
    deliveryDays: '2-5 days',
    location: 'Karnataka',
    tags: ['Banana', 'Tissue Culture', 'Plantation'],
  },
  {
    id: 'plant-009',
    name: 'Papaya Seedling Tray',
    description: 'Nursery-ready papaya seedlings for transplanting.',
    category: 'Plants & Saplings',
    price: 350,
    images: [],
    brand: 'NurseryPro',
    seller: 'Seedling Center',
    sellerVerified: true,
    rating: 4.4,
    reviewCount: 46,
    stock: 35,
    unit: '50 seedlings',
    originalPrice: 420,
    discount: 17,
    deliveryDays: '2-4 days',
    location: 'Karnataka',
    tags: ['Seedlings', 'Papaya', 'Nursery'],
  },
  {
    id: 'plant-010',
    name: 'Vegetable Nursery Seedling Pack',
    description: 'Mixed vegetable seedlings suitable for kitchen gardens and small farms.',
    category: 'Plants & Saplings',
    price: 290,
    images: [],
    brand: 'UrbanFarm',
    seller: 'Green Nursery',
    sellerVerified: true,
    rating: 4.5,
    reviewCount: 64,
    stock: 50,
    unit: '30 seedlings',
    originalPrice: 360,
    discount: 19,
    deliveryDays: '2-5 days',
    location: 'Bengaluru',
    tags: ['Vegetables', 'Seedlings', 'Nursery'],
  },

  // ============================================================
  // 🌾 CROP-SPECIFIC INPUTS — 10 PRODUCTS
  // ============================================================
  {
    id: 'crop-001',
    name: 'Tomato Crop Nutrition Kit',
    description: 'Crop input bundle designed for tomato cultivation.',
    category: 'Crop Inputs',
    price: 1450,
    images: [],
    brand: 'CropCare',
    seller: 'Tomato Farming Store',
    sellerVerified: true,
    rating: 4.7,
    reviewCount: 88,
    stock: 32,
    unit: '1 kit',
    originalPrice: 1750,
    discount: 17,
    deliveryDays: '3-6 days',
    location: 'Karnataka',
    tags: ['Tomato', 'Crop Kit', 'Nutrition'],
  },
  {
    id: 'crop-002',
    name: 'Paddy Crop Nutrition Kit',
    description: 'Agricultural input kit designed for paddy crop nutrition management.',
    category: 'Crop Inputs',
    price: 1680,
    images: [],
    brand: 'RiceGrow',
    seller: 'Paddy Farm Store',
    sellerVerified: true,
    rating: 4.6,
    reviewCount: 79,
    stock: 26,
    unit: '1 kit',
    originalPrice: 2000,
    discount: 16,
    deliveryDays: '3-6 days',
    location: 'Karnataka',
    tags: ['Paddy', 'Rice', 'Crop Kit'],
  },
  {
    id: 'crop-003',
    name: 'Cotton Crop Input Kit',
    description: 'Crop management input bundle for cotton cultivation.',
    category: 'Crop Inputs',
    price: 1890,
    images: [],
    brand: 'CottonCare',
    seller: 'Deccan Cotton Store',
    sellerVerified: true,
    rating: 4.5,
    reviewCount: 61,
    stock: 21,
    unit: '1 kit',
    originalPrice: 2250,
    discount: 16,
    deliveryDays: '3-6 days',
    location: 'Maharashtra',
    tags: ['Cotton', 'Crop Kit', 'Kharif'],
  },
  {
    id: 'crop-004',
    name: 'Chilli Crop Care Kit',
    description: 'Crop input bundle for chilli cultivation and plant nutrition.',
    category: 'Crop Inputs',
    price: 1320,
    images: [],
    brand: 'ChilliGrow',
    seller: 'South Agro Store',
    sellerVerified: true,
    rating: 4.6,
    reviewCount: 73,
    stock: 28,
    unit: '1 kit',
    originalPrice: 1580,
    discount: 16,
    deliveryDays: '3-6 days',
    location: 'Karnataka',
    tags: ['Chilli', 'Crop Care', 'Nutrition'],
  },
  {
    id: 'crop-005',
    name: 'Maize Crop Nutrition Kit',
    description: 'Input bundle designed for maize crop nutrient management.',
    category: 'Crop Inputs',
    price: 1280,
    images: [],
    brand: 'MaizeGrow',
    seller: 'Green Field Agro',
    sellerVerified: true,
    rating: 4.5,
    reviewCount: 57,
    stock: 34,
    unit: '1 kit',
    originalPrice: 1500,
    discount: 15,
    deliveryDays: '3-5 days',
    location: 'Maharashtra',
    tags: ['Maize', 'Nutrition', 'Crop Kit'],
  },
  {
    id: 'crop-006',
    name: 'Grapes Crop Nutrition Pack',
    description: 'Specialized crop input pack for vineyard nutrient management.',
    category: 'Crop Inputs',
    price: 2450,
    images: [],
    brand: 'VineGrow',
    seller: 'Horti Crop Store',
    sellerVerified: true,
    rating: 4.7,
    reviewCount: 48,
    stock: 18,
    unit: '1 pack',
    originalPrice: 2900,
    discount: 16,
    deliveryDays: '3-7 days',
    location: 'Maharashtra',
    tags: ['Grapes', 'Vineyard', 'Nutrition'],
  },
  {
    id: 'crop-007',
    name: 'Sugarcane Crop Nutrition Kit',
    description: 'Agricultural input package designed for sugarcane crop nutrition.',
    category: 'Crop Inputs',
    price: 2150,
    images: [],
    brand: 'CaneGrow',
    seller: 'Sugarcane Agro Center',
    sellerVerified: true,
    rating: 4.5,
    reviewCount: 69,
    stock: 22,
    unit: '1 kit',
    originalPrice: 2550,
    discount: 16,
    deliveryDays: '4-7 days',
    location: 'Karnataka',
    tags: ['Sugarcane', 'Crop Kit', 'Nutrition'],
  },
  {
    id: 'crop-008',
    name: 'Groundnut Crop Care Kit',
    description: 'Input bundle for groundnut crop nutrition and management.',
    category: 'Crop Inputs',
    price: 1180,
    images: [],
    brand: 'GroundGrow',
    seller: 'Oilseed Farm Store',
    sellerVerified: true,
    rating: 4.5,
    reviewCount: 51,
    stock: 30,
    unit: '1 kit',
    originalPrice: 1400,
    discount: 16,
    deliveryDays: '3-6 days',
    location: 'Andhra Pradesh',
    tags: ['Groundnut', 'Oilseed', 'Crop Care'],
  },
  {
    id: 'crop-009',
    name: 'Banana Crop Nutrition Kit',
    description: 'Crop nutrition package for banana cultivation.',
    category: 'Crop Inputs',
    price: 1750,
    images: [],
    brand: 'BananaGrow',
    seller: 'Horti Input Center',
    sellerVerified: true,
    rating: 4.6,
    reviewCount: 86,
    stock: 25,
    unit: '1 kit',
    originalPrice: 2100,
    discount: 17,
    deliveryDays: '3-6 days',
    location: 'Karnataka',
    tags: ['Banana', 'Nutrition', 'Horticulture'],
  },
  {
    id: 'crop-010',
    name: 'Onion Crop Management Kit',
    description: 'Input package for onion crop nutrition and field management.',
    category: 'Crop Inputs',
    price: 1360,
    images: [],
    brand: 'OnionCare',
    seller: 'Deccan Agro Store',
    sellerVerified: true,
    rating: 4.5,
    reviewCount: 62,
    stock: 27,
    unit: '1 kit',
    originalPrice: 1600,
    discount: 15,
    deliveryDays: '3-6 days',
    location: 'Karnataka',
    tags: ['Onion', 'Crop Care', 'Vegetable'],
  },
];

const getCategoryIcon = (category: string) => {
  const normalized = category?.toLowerCase?.() ?? '';

  switch (normalized) {
    case 'all':
      return <ShoppingBag className="w-5 h-5" />;
    case 'seeds':
      return <Sprout className="w-5 h-5" />;
    case 'fertilizers':
      return <FlaskConical className="w-5 h-5" />;
    case 'pesticides':
      return <Bug className="w-5 h-5" />;
    case 'bio products':
    case 'organic':
      return <Leaf className="w-5 h-5" />;
    case 'farm tools':
      return <Wrench className="w-5 h-5" />;
    case 'irrigation':
      return <Sprout className="w-5 h-5" />;
    case 'crop protection':
      return <ShieldCheck className="w-5 h-5" />;
    case 'equipment':
      return <Package className="w-5 h-5" />;
    default:
      return <Leaf className="w-5 h-5" />;
  }
};

const getProductGradient = (category: string) => {
  const normalized = category?.toLowerCase?.() ?? '';

  switch (normalized) {
    case 'seeds':
      return 'from-emerald-100 via-green-50 to-lime-50';
    case 'fertilizers':
      return 'from-yellow-100 via-amber-50 to-orange-50';
    case 'pesticides':
      return 'from-red-100 via-orange-50 to-rose-50';
    case 'bio products':
    case 'organic':
      return 'from-lime-100 via-green-50 to-emerald-50';
    case 'farm tools':
      return 'from-sky-100 via-cyan-50 to-blue-50';
    case 'irrigation':
      return 'from-cyan-100 via-sky-50 to-teal-50';
    case 'crop protection':
      return 'from-violet-100 via-indigo-50 to-purple-50';
    case 'equipment':
      return 'from-stone-200 via-stone-100 to-zinc-50';
    default:
      return 'from-emerald-100 via-green-50 to-lime-50';
  }
};

const normalizeProduct = (item: any): ProductView => {
  const price = Number(item?.price ?? 0);
  const originalPrice = Number(item?.originalPrice ?? item?.price ?? price);
  const stock = Number(item?.stock ?? 0);
  const discountValue = Number(item?.discount ?? 0);

  const computedDiscount =
    Number.isFinite(discountValue) && discountValue > 0
      ? discountValue
      : originalPrice > 0 && price > 0 && originalPrice > price
        ? Math.max(0, Math.round(((originalPrice - price) / originalPrice) * 100))
        : 0;

  return {
    id: String(item?.id ?? `prod_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`),
    name: String(item?.name ?? 'Agri Product'),
    description: String(item?.description ?? 'Agricultural product available in the marketplace.'),
    category: String(item?.category ?? 'Seeds'),
    price,
    images: Array.isArray(item?.images) ? item.images.filter(Boolean) : [],
    brand: String(item?.brand ?? item?.seller ?? 'AgriVision'),
    seller: String(item?.seller ?? item?.createdBy ?? 'Verified Seller'),
    sellerVerified: Boolean(item?.sellerVerified ?? true),
    rating: Number(item?.rating ?? 4.5),
    reviewCount: Number(item?.reviewCount ?? 0),
    stock,
    unit: String(item?.unit ?? 'unit'),
    originalPrice: originalPrice > 0 ? originalPrice : price,
    discount: computedDiscount,
    deliveryDays: String(item?.deliveryDays ?? '2-5 days'),
    location: String(item?.location ?? 'Karnataka'),
    tags: Array.isArray(item?.tags) && item.tags.length > 0 ? item.tags.map(String) : [String(item?.category ?? 'Product')],
    featured: Boolean(item?.featured),
    organic: Boolean(item?.organic),
    popular: Boolean(item?.popular),
  };
};

/* -------------------------------------------------------------------------- */
/* PRODUCT DETAILS MODAL                                                      */
/* -------------------------------------------------------------------------- */

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  onAdd,
}) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-stone-200 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-stone-900">
              Product Details
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 p-6">
          <div
            className={`h-80 rounded-3xl bg-linear-to-br ${getProductGradient(
              product.category
            )} flex items-center justify-center overflow-hidden`}
          >
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-4 text-emerald-700">
                {getCategoryIcon(product.category)}
                <span className="text-sm font-semibold">
                  Agriculture Product
                </span>
              </div>
            )}
          </div>

          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                {product.category}
              </span>

              {product.organic && (
                <span className="px-3 py-1 rounded-full bg-lime-50 text-lime-700 text-xs font-bold flex items-center gap-1">
                  <Leaf className="w-3 h-3" />
                  Organic
                </span>
              )}

              {product.sellerVerified && (
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold flex items-center gap-1">
                  <BadgeCheck className="w-3 h-3" />
                  Verified Seller
                </span>
              )}
            </div>

            <h2 className="text-2xl font-extrabold text-stone-900">
              {product.name}
            </h2>

            <p className="text-sm text-stone-500 mt-2">
              Brand: <strong className="text-stone-700">{product.brand}</strong>
            </p>

            <div className="flex items-center gap-2 mt-4">
              <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold">{product.rating}</span>
              </div>

              <span className="text-sm text-stone-500">
                {product.reviewCount} verified reviews
              </span>
            </div>

            <p className="text-stone-600 leading-6 mt-5">
              {product.description}
            </p>

            <div className="mt-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
              <div className="flex items-end gap-3">
                <span className="text-3xl font-extrabold text-emerald-700">
                  ₹{product.price}
                </span>
                <span className="text-sm text-stone-400 line-through mb-1">
                  ₹{product.originalPrice}
                </span>
                <span className="text-sm font-bold text-emerald-600 mb-1">
                  {product.discount}% OFF
                </span>
              </div>

              <p className="text-xs text-stone-500 mt-1">
                Price for {product.unit}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 rounded-xl border border-stone-200">
                <span className="text-xs text-stone-400 block">
                  Stock
                </span>
                <strong
                  className={
                    product.stock <= 5
                      ? 'text-rose-600'
                      : 'text-emerald-700'
                  }
                >
                  {product.stock} available
                </strong>
              </div>

              <div className="p-3 rounded-xl border border-stone-200">
                <span className="text-xs text-stone-400 block">
                  Delivery
                </span>
                <strong className="text-stone-800">
                  {product.deliveryDays}
                </strong>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 text-sm text-stone-600">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Seller location: {product.location}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  onAdd(product);
                  onClose();
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>

              <button className="px-5 py-3 border border-stone-200 rounded-xl hover:bg-stone-50 font-semibold">
                Buy Now
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-200 p-6">
          <h3 className="font-bold text-lg text-stone-900 mb-4">
            Why buy from our marketplace?
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              ['Verified Sellers', ShieldCheck],
              ['Secure Payments', CreditCard],
              ['Tracked Delivery', Truck],
              ['Farmer Support', MessageCircle],
            ].map(([label, Icon]: any) => (
              <div
                key={label}
                className="p-4 rounded-2xl bg-stone-50 border border-stone-100"
              >
                <Icon className="w-5 h-5 text-emerald-600 mb-2" />
                <span className="text-xs font-semibold text-stone-700">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* MAIN PAGE                                                                  */
/* -------------------------------------------------------------------------- */

export const MarketplacePage: React.FC = () => {
  const { role } = useAuth();
  const canManageMarketplace = role === 'ADMIN' || role === 'OFFICER';
  const canPurchase = role === 'FARMER';

  const [products, setProducts] = useState<ProductView[]>([]);
  const [loading, setLoading] = useState(true);
  const [showManagerForm, setShowManagerForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Seeds',
    description: '',
    price: '0',
    stock: '0',
    unit: 'kg',
    brand: 'AgriVision',
    location: 'Karnataka',
    deliveryDays: '2-5 days',
  });

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category>('All');
  const [sort, setSort] = useState<SortOption>('recommended');

  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [onlyOrganic, setOnlyOrganic] = useState(false);

  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [showFilters, setShowFilters] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductView | null>(null);

  const [toast, setToast] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(''), 2500);

    return () => clearTimeout(timer);
  }, [toast]);

  const loadProducts = async () => {
    setLoading(true);

    try {
      const data = await api.getMarketplaceProducts();

      if (Array.isArray(data) && data.length > 0) {
        setProducts(data.map(normalizeProduct));
      } else {
        setProducts(FALLBACK_PRODUCTS);
      }
    } catch (err) {
      console.error('Failed to load marketplace products:', err);
      setProducts(FALLBACK_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async () => {
    if (!canManageMarketplace) {
      setToast('Only admins and officers can add products.');
      return;
    }

    const payload = {
      name: newProduct.name.trim(),
      category: newProduct.category,
      description: newProduct.description.trim(),
      price: Number(newProduct.price),
      stock: Number(newProduct.stock),
      unit: newProduct.unit,
      brand: newProduct.brand,
      location: newProduct.location,
      deliveryDays: newProduct.deliveryDays,
      images: [],
      tags: [newProduct.category, 'verified'],
    };

    if (!payload.name || !payload.description || !Number.isFinite(payload.price) || payload.price <= 0) {
      setToast('Please enter a valid product name, description, and price.');
      return;
    }

    try {
      await api.createMarketplaceProduct(payload);
      setNewProduct({
        name: '',
        category: 'Seeds',
        description: '',
        price: '0',
        stock: '0',
        unit: 'kg',
        brand: 'AgriVision',
        location: 'Karnataka',
        deliveryDays: '2-5 days',
      });
      setShowManagerForm(false);
      setToast('Product added successfully.');
      await loadProducts();
    } catch (error: any) {
      setToast(error.message || 'Unable to add product.');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!canManageMarketplace) {
      setToast('Only admins and officers can delete products.');
      return;
    }

    try {
      await api.deleteMarketplaceProduct(productId);
      setToast('Product deleted.');
      await loadProducts();
    } catch (error: any) {
      setToast(error.message || 'Unable to delete product.');
    }
  };

  const categories: Category[] = [
    'All',
    'Seeds',
    'Fertilizers',
    'Pesticides',
    'Bio Products',
    'Farm Tools',
    'Irrigation',
    'Crop Protection',
    'Equipment',
  ];

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    let result = products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.tags.some((tag) =>
          tag.toLowerCase().includes(query)
        );

      const matchesCategory =
        category === 'All' || product.category === category;

      const matchesMin =
        !minPrice || product.price >= Number(minPrice);

      const matchesMax =
        !maxPrice || product.price <= Number(maxPrice);

      const matchesAvailable =
        !onlyAvailable || product.stock > 0;

      const matchesVerified =
        !onlyVerified || product.sellerVerified;

      const matchesOrganic =
        !onlyOrganic || product.organic;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesMin &&
        matchesMax &&
        matchesAvailable &&
        matchesVerified &&
        matchesOrganic
      );
    });

    result = [...result].sort((a, b) => {
      switch (sort) {
        case 'price-low':
          return a.price - b.price;

        case 'price-high':
          return b.price - a.price;

        case 'rating':
          return b.rating - a.rating;

        case 'discount':
          return b.discount - a.discount;

        case 'newest':
          return Number(b.id > a.id) - Number(a.id > b.id);

        default:
          return (
            Number(Boolean(b.featured)) -
            Number(Boolean(a.featured))
          );
      }
    });

    return result;
  }, [
    products,
    search,
    category,
    sort,
    minPrice,
    maxPrice,
    onlyAvailable,
    onlyVerified,
    onlyOrganic,
  ]);

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const addToCart = (product: ProductView) => {
    if (!canPurchase) {
      setToast('Only farmers can add products to cart.');
      return;
    }

    if (product.stock <= 0) {
      setToast('This product is currently out of stock.');
      return;
    }

    setCart((current) => {
      const existing = current.find(
        (item) => item.product.id === product.id
      );

      if (existing) {
        return current.map((item) =>
          item.product.id === product.id
            ? {
              ...item,
              quantity: Math.min(
                item.quantity + 1,
                product.stock
              ),
            }
            : item
        );
      }

      return [...current, { product, quantity: 1 }];
    });

    setToast(`${product.name} added to cart`);
  };

  const removeFromCart = (id: string) => {
    setCart((current) =>
      current.filter((item) => item.product.id !== id)
    );
  };

  const updateCartQuantity = (
    id: string,
    change: number
  ) => {
    setCart((current) =>
      current
        .map((item) => {
          if (item.product.id !== id) return item;

          const next = item.quantity + change;

          return {
            ...item,
            quantity: Math.max(
              1,
              Math.min(next, item.product.stock)
            ),
          };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const toggleWishlist = (id: string) => {
    setWishlist((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('All');
    setSort('recommended');
    setMinPrice('');
    setMaxPrice('');
    setOnlyAvailable(false);
    setOnlyVerified(false);
    setOnlyOrganic(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-emerald-50/50 via-white to-stone-50 pb-16">
      {/* ------------------------------------------------------------------ */}
      {/* TOAST                                                              */}
      {/* ------------------------------------------------------------------ */}

      {toast && (
        <div className="fixed top-5 right-5 z-[120] bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold">{toast}</span>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* HERO                                                               */}
      {/* ------------------------------------------------------------------ */}

      <section className="relative overflow-hidden rounded-b-[2.5rem] bg-linear-to-br from-emerald-900 via-teal-800 to-green-900 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full border-[60px] border-white" />
          <div className="absolute -bottom-40 -left-20 w-96 h-96 rounded-full border-[70px] border-white" />
        </div>

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-10 lg:py-14">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-xs font-bold mb-4">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              Verified Agriculture Marketplace
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
              Everything Your Farm Needs,
              <span className="text-emerald-300">
                {' '}
                In One Place.
              </span>
            </h1>

            <p className="text-emerald-100 mt-4 text-sm sm:text-base max-w-2xl leading-7">
              Buy certified seeds, fertilizers, crop protection
              products, irrigation equipment and farm tools from
              verified agricultural sellers.
            </p>

            {/* HERO SEARCH */}
            <div className="mt-7 relative max-w-2xl">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search seeds, fertilizer, sprayer, irrigation..."
                className="w-full bg-white text-stone-900 rounded-2xl pl-13 pr-28 py-4 outline-none shadow-2xl placeholder:text-stone-400 focus:ring-4 focus:ring-emerald-300/30"
              />

              <button
                onClick={() => setShowFilters(true)}
                className="absolute right-2 top-2 bottom-2 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-2 transition"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>
          </div>

          {/* HERO STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-9">
            {[
              ['10,000+', 'Products'],
              ['2,500+', 'Verified Sellers'],
              ['28 States', 'Pan-India Delivery'],
              ['24/7', 'Farmer Support'],
            ].map(([value, label]) => (
              <div
                key={label}
                className="bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-4"
              >
                <strong className="block text-xl font-black">
                  {value}
                </strong>
                <span className="text-xs text-emerald-100">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ---------------------------------------------------------------- */}
        {/* TRUST STRIP                                                      */}
        {/* ---------------------------------------------------------------- */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 -mt-5 relative z-10">
          {[
            {
              icon: ShieldCheck,
              title: 'Verified Products',
              text: 'Trusted sellers',
            },
            {
              icon: Truck,
              title: 'Farm Delivery',
              text: 'Doorstep service',
            },
            {
              icon: CreditCard,
              title: 'Secure Payment',
              text: 'Multiple options',
            },
            {
              icon: MessageCircle,
              title: 'Farmer Support',
              text: 'Quick assistance',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-2xl border border-stone-200 p-4 shadow-lg flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5" />
              </div>

              <div>
                <strong className="block text-xs sm:text-sm text-stone-800">
                  {item.title}
                </strong>
                <span className="text-[10px] sm:text-xs text-stone-400">
                  {item.text}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* CATEGORY SCROLLER                                                 */}
        {/* ---------------------------------------------------------------- */}

        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-black text-stone-900">
                Shop by Category
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Find agricultural products quickly
              </p>
            </div>

            <button
              onClick={clearFilters}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              Reset
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((item) => {
              const active = category === item;

              return (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`shrink-0 px-4 py-3 rounded-2xl border flex items-center gap-2 text-sm font-bold transition ${active
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-emerald-300 hover:text-emerald-700'
                    }`}
                >
                  {getCategoryIcon(item)}
                  {item}
                </button>
              );
            })}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* TOOLBAR                                                          */}
        {/* ---------------------------------------------------------------- */}

        <section className="mt-7 bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="font-black text-stone-900">
                Agriculture Products
              </h2>

              <p className="text-xs text-stone-500 mt-1">
                Showing{' '}
                <strong className="text-stone-800">
                  {filteredProducts.length}
                </strong>{' '}
                products
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {canManageMarketplace && (
                <button
                  onClick={() => setShowManagerForm(true)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-700 text-white text-sm font-bold flex items-center gap-2 hover:bg-emerald-800"
                >
                  <Plus className="w-4 h-4" />
                  Add Product
                </button>
              )}

              <button
                onClick={() => setShowFilters(true)}
                className="px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-700 text-sm font-bold flex items-center gap-2 hover:bg-stone-100"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>

              <div className="relative">
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />

                <select
                  value={sort}
                  onChange={(e) =>
                    setSort(e.target.value as SortOption)
                  }
                  className="appearance-none pl-9 pr-9 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm font-bold text-stone-700 outline-none"
                >
                  <option value="recommended">
                    Recommended
                  </option>
                  <option value="price-low">
                    Price: Low to High
                  </option>
                  <option value="price-high">
                    Price: High to Low
                  </option>
                  <option value="rating">
                    Highest Rated
                  </option>
                  <option value="discount">
                    Biggest Discount
                  </option>
                  <option value="newest">
                    Newest
                  </option>
                </select>
              </div>

              <button
                onClick={() => setShowCart(true)}
                className="relative px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Cart

                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* ACTIVE FILTERS                                                    */}
        {/* ---------------------------------------------------------------- */}

        {(search ||
          category !== 'All' ||
          minPrice ||
          maxPrice ||
          onlyAvailable ||
          onlyVerified ||
          onlyOrganic) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold flex items-center gap-1"
                >
                  Search: {search}
                  <X className="w-3 h-3" />
                </button>
              )}

              {category !== 'All' && (
                <button
                  onClick={() => setCategory('All')}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1"
                >
                  {category}
                  <X className="w-3 h-3" />
                </button>
              )}

              {onlyVerified && (
                <button
                  onClick={() => setOnlyVerified(false)}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold"
                >
                  Verified Sellers
                </button>
              )}

              {onlyOrganic && (
                <button
                  onClick={() => setOnlyOrganic(false)}
                  className="px-3 py-1.5 bg-lime-50 text-lime-700 rounded-full text-xs font-bold"
                >
                  Organic
                </button>
              )}
            </div>
          )}

        {/* ---------------------------------------------------------------- */}
        {/* PRODUCTS                                                          */}
        {/* ---------------------------------------------------------------- */}

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-7">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl border border-stone-200 overflow-hidden animate-pulse"
              >
                <div className="h-52 bg-stone-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-stone-200 rounded" />
                  <div className="h-3 bg-stone-100 rounded w-2/3" />
                  <div className="h-10 bg-stone-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 mt-7">
            {filteredProducts.map((product) => {
              const wished = wishlist.includes(product.id);

              return (
                <article
                  key={product.id}
                  className="group bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 hover:border-emerald-300 transition-all duration-300"
                >
                  {/* IMAGE */}
                  <div
                    className={`h-48 sm:h-56 relative bg-linear-to-br ${getProductGradient(
                      product.category
                    )}`}
                  >
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-emerald-700">
                        <div className="w-16 h-16 rounded-2xl bg-white/60 backdrop-blur flex items-center justify-center">
                          {getCategoryIcon(product.category)}
                        </div>

                        <span className="text-[10px] font-bold mt-3 uppercase tracking-wider opacity-70">
                          {product.category}
                        </span>
                      </div>
                    )}

                    {/* DISCOUNT */}
                    {product.discount > 0 && (
                      <span className="absolute top-3 left-3 bg-orange-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-black shadow">
                        {product.discount}% OFF
                      </span>
                    )}

                    {/* WISHLIST */}
                    <button
                      onClick={() =>
                        toggleWishlist(product.id)
                      }
                      className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center shadow hover:scale-105 transition"
                    >
                      {wished ? (
                        <Heart className="w-4 h-4 text-rose-500 fill-current" />
                      ) : (
                        <Heart className="w-4 h-4 text-stone-500" />
                      )}
                    </button>

                    {/* FEATURED */}
                    {product.featured && (
                      <span className="absolute bottom-3 left-3 bg-emerald-700 text-white px-2 py-1 rounded-lg text-[9px] font-black flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        FEATURED
                      </span>
                    )}

                    {/* QUICK VIEW */}
                    <button
                      onClick={() =>
                        setSelectedProduct(product)
                      }
                      className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 bg-white/95 text-stone-800 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Quick View
                    </button>

                    {canManageMarketplace && (
                      <div className="absolute bottom-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="bg-rose-600 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        {product.category}
                      </span>

                      {product.sellerVerified && (
                        <BadgeCheck className="w-4 h-4 text-blue-600" />
                      )}
                    </div>

                    <h3 className="font-extrabold text-stone-900 mt-2 line-clamp-2 min-h-10 text-sm sm:text-base">
                      {product.name}
                    </h3>

                    <div className="flex items-center gap-1 mt-2">
                      <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-md text-xs font-bold">
                        <Star className="w-3 h-3 fill-current" />
                        {product.rating}
                      </span>

                      <span className="text-[10px] text-stone-400">
                        ({product.reviewCount})
                      </span>
                    </div>

                    <p className="text-xs text-stone-500 mt-2 line-clamp-2 min-h-8">
                      {product.description}
                    </p>

                    <div className="flex items-center gap-1 mt-3 text-[10px] text-stone-400">
                      <Store className="w-3.5 h-3.5" />
                      <span className="truncate">
                        {product.seller}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 mt-1 text-[10px] text-stone-400">
                      <MapPin className="w-3.5 h-3.5" />
                      {product.location}
                    </div>

                    {/* PRICE */}
                    <div className="border-t border-stone-100 mt-4 pt-4">
                      <div className="flex items-end justify-between gap-2">
                        <div>
                          <span className="text-[10px] text-stone-400 line-through block">
                            ₹{product.originalPrice}
                          </span>

                          <span className="text-xl font-black text-emerald-700">
                            ₹{product.price}
                          </span>

                          <span className="text-[10px] text-stone-400 ml-1">
                            / {product.unit}
                          </span>
                        </div>

                        <button
                          onClick={() => addToCart(product)}
                          disabled={product.stock <= 0 || !canPurchase}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${product.stock > 0 && canPurchase
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200'
                              : 'bg-stone-100 text-stone-300 cursor-not-allowed'
                            }`}
                          title={canPurchase ? 'Add to cart' : 'Only farmers can purchase'}
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold flex items-center gap-1 ${product.stock <= 5
                              ? 'text-rose-600'
                              : 'text-emerald-600'
                            }`}
                        >
                          <PackageCheck className="w-3 h-3" />
                          {product.stock <= 5
                            ? `Only ${product.stock} left`
                            : 'In Stock'}
                        </span>

                        <span className="text-[10px] text-stone-400 flex items-center gap-1">
                          <Truck className="w-3 h-3" />
                          {product.deliveryDays}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-10 bg-white rounded-3xl border border-stone-200 p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-stone-100 mx-auto flex items-center justify-center">
              <SearchX className="w-7 h-7 text-stone-400" />
            </div>

            <h3 className="font-black text-stone-900 mt-5">
              No products found
            </h3>

            <p className="text-sm text-stone-500 mt-2">
              Try another crop, category, brand or price range.
            </p>

            <button
              onClick={clearFilters}
              className="mt-5 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* FARMER SERVICE SECTION                                            */}
        {/* ---------------------------------------------------------------- */}

        <section className="mt-12 rounded-3xl bg-linear-to-r from-stone-900 to-emerald-950 text-white overflow-hidden">
          <div className="p-7 sm:p-9">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-7">
              <div>
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest">
                  Farmer First
                </span>

                <h2 className="text-2xl font-black mt-2">
                  Need help choosing the right product?
                </h2>

                <p className="text-stone-300 text-sm mt-2 max-w-xl">
                  Compare products, check crop suitability and
                  connect with agriculture support before purchasing.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button className="px-5 py-3 rounded-xl bg-white text-stone-900 font-bold text-sm flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Talk to Expert
                </button>

                <button className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Ask Agriculture AI
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ------------------------------------------------------------------ */}
      {/* FILTER DRAWER                                                       */}
      {/* ------------------------------------------------------------------ */}

      {showFilters && (
        <div className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm">
          <div className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-stone-200 p-5 flex items-center justify-between z-10">
              <div>
                <h2 className="font-black text-lg text-stone-900">
                  Filter Products
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  Find products matching your farm needs
                </p>
              </div>

              <button
                onClick={() => setShowFilters(false)}
                className="p-2 rounded-xl hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-7">
              {/* SEARCH */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-2">
                  Search
                </label>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* CATEGORY */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-2">
                  Category
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {categories.map((item) => (
                    <button
                      key={item}
                      onClick={() => setCategory(item)}
                      className={`p-3 rounded-xl border text-xs font-bold text-left ${category === item
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-stone-200 text-stone-600'
                        }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* PRICE */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-2">
                  Price Range
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Min ₹"
                    value={minPrice}
                    onChange={(e) =>
                      setMinPrice(e.target.value)
                    }
                    className="px-3 py-3 rounded-xl border border-stone-200 bg-stone-50 outline-none"
                  />

                  <input
                    type="number"
                    placeholder="Max ₹"
                    value={maxPrice}
                    onChange={(e) =>
                      setMaxPrice(e.target.value)
                    }
                    className="px-3 py-3 rounded-xl border border-stone-200 bg-stone-50 outline-none"
                  />
                </div>
              </div>

              {/* CHECKBOXES */}
              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 rounded-xl border border-stone-200 cursor-pointer">
                  <span className="flex items-center gap-2 text-sm font-bold text-stone-700">
                    <PackageCheck className="w-4 h-4 text-emerald-600" />
                    In Stock Only
                  </span>

                  <input
                    type="checkbox"
                    checked={onlyAvailable}
                    onChange={(e) =>
                      setOnlyAvailable(e.target.checked)
                    }
                    className="w-4 h-4 accent-emerald-600"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-xl border border-stone-200 cursor-pointer">
                  <span className="flex items-center gap-2 text-sm font-bold text-stone-700">
                    <BadgeCheck className="w-4 h-4 text-blue-600" />
                    Verified Sellers
                  </span>

                  <input
                    type="checkbox"
                    checked={onlyVerified}
                    onChange={(e) =>
                      setOnlyVerified(e.target.checked)
                    }
                    className="w-4 h-4 accent-emerald-600"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-xl border border-stone-200 cursor-pointer">
                  <span className="flex items-center gap-2 text-sm font-bold text-stone-700">
                    <Leaf className="w-4 h-4 text-lime-600" />
                    Organic Products
                  </span>

                  <input
                    type="checkbox"
                    checked={onlyOrganic}
                    onChange={(e) =>
                      setOnlyOrganic(e.target.checked)
                    }
                    className="w-4 h-4 accent-emerald-600"
                  />
                </label>
              </div>

              <button
                onClick={() => {
                  clearFilters();
                  setShowFilters(false);
                }}
                className="w-full py-3 rounded-xl border border-stone-200 text-stone-700 font-bold"
              >
                Clear All Filters
              </button>

              <button
                onClick={() => setShowFilters(false)}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Show {filteredProducts.length} Products
              </button>
            </div>
          </div>
        </div>
      )}

      {showManagerForm && canManageMarketplace && (
        <div className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-black text-stone-900">Add marketplace product</h2>
                <p className="text-xs text-stone-500 mt-1">Admins and officers can publish new listings.</p>
              </div>
              <button onClick={() => setShowManagerForm(false)} className="p-2 rounded-xl hover:bg-stone-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <input value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="Product name" className="col-span-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50" />
              <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className="px-4 py-3 rounded-xl border border-stone-200 bg-stone-50">
                {categories.filter((item) => item !== 'All').map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              <input value={newProduct.brand} onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })} placeholder="Brand" className="px-4 py-3 rounded-xl border border-stone-200 bg-stone-50" />
              <input value={newProduct.price} type="number" min="1" onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} placeholder="Price" className="px-4 py-3 rounded-xl border border-stone-200 bg-stone-50" />
              <input value={newProduct.stock} type="number" min="0" onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} placeholder="Stock" className="px-4 py-3 rounded-xl border border-stone-200 bg-stone-50" />
              <input value={newProduct.unit} onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })} placeholder="Unit (kg, pack, etc.)" className="px-4 py-3 rounded-xl border border-stone-200 bg-stone-50" />
              <input value={newProduct.location} onChange={(e) => setNewProduct({ ...newProduct, location: e.target.value })} placeholder="Location" className="col-span-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50" />
              <input value={newProduct.deliveryDays} onChange={(e) => setNewProduct({ ...newProduct, deliveryDays: e.target.value })} placeholder="Delivery days" className="col-span-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50" />
              <textarea value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} placeholder="Description" rows={4} className="col-span-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50" />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowManagerForm(false)} className="px-4 py-3 rounded-xl border border-stone-200 text-stone-700 font-bold">Cancel</button>
              <button onClick={handleCreateProduct} className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-bold">Publish Product</button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* CART DRAWER                                                         */}
      {/* ------------------------------------------------------------------ */}

      {showCart && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm">
          <div className="absolute right-0 top-0 h-full w-full sm:w-[460px] bg-white shadow-2xl flex flex-col">
            <div className="p-5 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h2 className="font-black text-xl">
                  Your Cart
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  {cartCount} item{cartCount !== 1 ? 's' : ''}
                </p>
              </div>

              <button
                onClick={() => setShowCart(false)}
                className="p-2 rounded-xl hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 rounded-3xl bg-emerald-50 flex items-center justify-center">
                    <ShoppingCart className="w-9 h-9 text-emerald-600" />
                  </div>

                  <h3 className="font-black text-lg mt-5">
                    Your cart is empty
                  </h3>

                  <p className="text-sm text-stone-500 mt-2">
                    Add seeds, fertilizers or farm tools to
                    continue.
                  </p>

                  <button
                    onClick={() => setShowCart(false)}
                    className="mt-5 px-5 py-3 rounded-xl bg-emerald-600 text-white font-bold"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-4 rounded-2xl border border-stone-200"
                    >
                      <div className="flex gap-3">
                        <div
                          className={`w-20 h-20 rounded-xl bg-linear-to-br ${getProductGradient(
                            item.product.category
                          )} flex items-center justify-center shrink-0`}
                        >
                          {getCategoryIcon(
                            item.product.category
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm text-stone-900 line-clamp-2">
                            {item.product.name}
                          </h3>

                          <p className="text-xs text-stone-400 mt-1">
                            ₹{item.product.price} /{' '}
                            {item.product.unit}
                          </p>

                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden">
                              <button
                                onClick={() =>
                                  updateCartQuantity(
                                    item.product.id,
                                    -1
                                  )
                                }
                                className="p-2 hover:bg-stone-100"
                              >
                                <Minus className="w-3 h-3" />
                              </button>

                              <span className="px-3 text-xs font-bold">
                                {item.quantity}
                              </span>

                              <button
                                onClick={() =>
                                  updateCartQuantity(
                                    item.product.id,
                                    1
                                  )
                                }
                                className="p-2 hover:bg-stone-100"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <strong className="text-emerald-700">
                              ₹
                              {item.product.price *
                                item.quantity}
                            </strong>
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            removeFromCart(item.product.id)
                          }
                          className="self-start text-stone-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-stone-200 p-5 bg-stone-50">
                <div className="flex justify-between text-sm text-stone-600">
                  <span>Subtotal</span>
                  <strong>₹{cartTotal}</strong>
                </div>

                <div className="flex justify-between text-sm text-stone-600 mt-2">
                  <span>Delivery</span>
                  <strong className="text-emerald-600">
                    FREE
                  </strong>
                </div>

                <div className="border-t border-stone-200 mt-4 pt-4 flex justify-between">
                  <span className="font-black">
                    Total
                  </span>

                  <span className="text-xl font-black text-emerald-700">
                    ₹{cartTotal}
                  </span>
                </div>

                <button
                  onClick={() => setShowPayment(true)}
                  className="w-full mt-4 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  Proceed to Checkout
                </button>

                <p className="text-[10px] text-center text-stone-400 mt-3">
                  Secure checkout • UPI • Cards • Net Banking
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* PRODUCT DETAILS                                                     */}
      {/* ------------------------------------------------------------------ */}

      <ProductDetailsModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAdd={addToCart}
      />

      {showPayment && (
        <PaymentMethodModal
          title="Marketplace order"
          amount={cartTotal}
          onClose={() => setShowPayment(false)}
          onSuccess={() => {
            setShowPayment(false);
            setShowCart(false);
            setCart([]);
            setToast('Order placed successfully.');
          }}
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* FLOATING CART                                                       */}
      {/* ------------------------------------------------------------------ */}

      {cartCount > 0 && !showCart && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 z-50 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 font-black"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-3 -right-3 w-5 h-5 bg-orange-500 rounded-full text-[9px] flex items-center justify-center border-2 border-emerald-600">
              {cartCount}
            </span>
          </div>

          <span>View Cart</span>

          <span className="border-l border-white/30 pl-3">
            ₹{cartTotal}
          </span>
        </button>
      )}
    </div>
  );
};

export default MarketplacePage;