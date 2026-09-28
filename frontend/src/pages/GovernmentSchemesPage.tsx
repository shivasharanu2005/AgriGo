import React, { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { api } from '../services/api.ts';
import {
  Search,
  Landmark,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  Filter,
  IndianRupee,
  Tractor,
  Droplets,
  Sprout,
  ShieldCheck,
  Wheat,
  HeartHandshake,
  Building2,
  Fish,
  Milk,
  Leaf,
  ChevronDown,
  FileText,
  MapPin,
  CalendarDays,
  Users,
  BadgeCheck,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Info,
  Clock,
  Banknote,
  Tractor as TractorIcon,
  CloudRain,
  ShoppingBasket,
  Factory,
  TreePine,
  WalletCards,
  GraduationCap,
  UserRound,
} from 'lucide-react';

/* ============================================================
   TYPES
============================================================ */

type GovernmentLevel = 'CENTRAL' | 'STATE' | 'UT';

type SchemeCategory =
  | 'INCOME_SUPPORT'
  | 'CROP_INSURANCE'
  | 'IRRIGATION'
  | 'FARM_MECHANIZATION'
  | 'SOIL_HEALTH'
  | 'SEEDS_INPUTS'
  | 'HORTICULTURE'
  | 'ORGANIC_FARMING'
  | 'AGRICULTURAL_LOAN'
  | 'MARKETING'
  | 'STORAGE'
  | 'LIVESTOCK'
  | 'FISHERIES'
  | 'FPO'
  | 'PENSION'
  | 'SUSTAINABLE_AGRICULTURE'
  | 'WOMEN_FARMERS'
  | 'OTHER';

interface GovernmentScheme {
  id: string;
  schemeName: string;
  shortName?: string;

  governmentLevel: GovernmentLevel;
  state: string;
  stateCode: string;

  department: string;
  category: SchemeCategory;

  description: string;

  benefits: string[];
  eligibility: string[];
  requiredDocuments: string[];

  farmerTypes: string[];
  crops: string[];

  landRequirement?: string;

  benefitAmount?: number;
  subsidyPercentage?: number;
  maximumBenefit?: number;

  applicationMode:
  | 'ONLINE'
  | 'OFFLINE'
  | 'CSC'
  | 'BANK'
  | 'AGRICULTURE_DEPARTMENT';

  applicationUrl?: string;
  officialSourceUrl?: string;

  startDate?: string;
  endDate?: string;

  isActive: boolean;
  lastVerified: string;
}

/* ============================================================
   CONSTANTS
============================================================ */

const STATES = [
  { name: 'All India', code: 'ALL' },
  { name: 'Andhra Pradesh', code: 'AP' },
  { name: 'Arunachal Pradesh', code: 'AR' },
  { name: 'Assam', code: 'AS' },
  { name: 'Bihar', code: 'BR' },
  { name: 'Chhattisgarh', code: 'CG' },
  { name: 'Goa', code: 'GA' },
  { name: 'Gujarat', code: 'GJ' },
  { name: 'Haryana', code: 'HR' },
  { name: 'Himachal Pradesh', code: 'HP' },
  { name: 'Jharkhand', code: 'JH' },
  { name: 'Karnataka', code: 'KA' },
  { name: 'Kerala', code: 'KL' },
  { name: 'Madhya Pradesh', code: 'MP' },
  { name: 'Maharashtra', code: 'MH' },
  { name: 'Manipur', code: 'MN' },
  { name: 'Meghalaya', code: 'ML' },
  { name: 'Mizoram', code: 'MZ' },
  { name: 'Nagaland', code: 'NL' },
  { name: 'Odisha', code: 'OD' },
  { name: 'Punjab', code: 'PB' },
  { name: 'Rajasthan', code: 'RJ' },
  { name: 'Sikkim', code: 'SK' },
  { name: 'Tamil Nadu', code: 'TN' },
  { name: 'Telangana', code: 'TS' },
  { name: 'Tripura', code: 'TR' },
  { name: 'Uttar Pradesh', code: 'UP' },
  { name: 'Uttarakhand', code: 'UK' },
  { name: 'West Bengal', code: 'WB' },
  { name: 'Andaman & Nicobar Islands', code: 'AN' },
  { name: 'Chandigarh', code: 'CH' },
  { name: 'Dadra & Nagar Haveli and Daman & Diu', code: 'DN' },
  { name: 'Delhi', code: 'DL' },
  { name: 'Jammu & Kashmir', code: 'JK' },
  { name: 'Ladakh', code: 'LA' },
  { name: 'Lakshadweep', code: 'LD' },
  { name: 'Puducherry', code: 'PY' },
];

const CATEGORIES: {
  value: SchemeCategory | 'ALL';
  label: string;
}[] = [
    { value: 'ALL', label: 'All Categories' },
    { value: 'INCOME_SUPPORT', label: 'Income Support' },
    { value: 'CROP_INSURANCE', label: 'Crop Insurance' },
    { value: 'IRRIGATION', label: 'Irrigation' },
    { value: 'FARM_MECHANIZATION', label: 'Farm Mechanization' },
    { value: 'SOIL_HEALTH', label: 'Soil Health' },
    { value: 'SEEDS_INPUTS', label: 'Seeds & Inputs' },
    { value: 'HORTICULTURE', label: 'Horticulture' },
    { value: 'ORGANIC_FARMING', label: 'Organic Farming' },
    { value: 'AGRICULTURAL_LOAN', label: 'Agricultural Loans' },
    { value: 'MARKETING', label: 'Marketing' },
    { value: 'STORAGE', label: 'Storage' },
    { value: 'LIVESTOCK', label: 'Livestock & Dairy' },
    { value: 'FISHERIES', label: 'Fisheries' },
    { value: 'FPO', label: 'FPO & Farmer Groups' },
    { value: 'PENSION', label: 'Pension' },
    { value: 'SUSTAINABLE_AGRICULTURE', label: 'Sustainable Agriculture' },
    { value: 'WOMEN_FARMERS', label: 'Women Farmers' },
    { value: 'OTHER', label: 'Other' },
  ];

const FARMER_TYPES = [
  'All Farmer Types',
  'Small Farmer',
  'Marginal Farmer',
  'Tenant Farmer',
  'Women Farmer',
  'Young Farmer',
  'FPO',
  'Livestock Farmer',
  'Fisher',
  'Organic Farmer',
  'All Farmers',
];

/* ============================================================
   OFFICIAL GOVERNMENT PORTALS
   All links are intentionally kept in this single TSX file.
============================================================ */
type GovernmentPortalLink = {
  applicationUrl: string;
  officialSourceUrl: string;
  portalName: string;
};

const makePortal = (url: string, portalName: string, sourceUrl = url): GovernmentPortalLink => ({
  applicationUrl: url,
  officialSourceUrl: sourceUrl,
  portalName,
});

const CENTRAL_SCHEME_PORTALS: Record<string, GovernmentPortalLink> = {
  'central-001': makePortal('https://pmkisan.gov.in/', 'PM-KISAN Official Portal'),
  'central-002': makePortal('https://pmfby.gov.in/', 'PMFBY Official Portal'),
  'central-003': makePortal('https://maandhan.in/', 'PM-Kisan Maandhan Portal'),
  'central-004': makePortal('https://pmksy.gov.in/', 'PMKSY Official Portal'),
  'central-005': makePortal('https://pmksy.gov.in/', 'PMKSY Official Portal'),
  'central-006': makePortal('https://rkvy.nic.in/', 'RKVY Official Portal'),
  'central-007': makePortal('https://soilhealth.dac.gov.in/', 'Soil Health Card Portal'),
  'central-008': makePortal('https://agrimachinery.nic.in/', 'Agricultural Mechanization Portal'),
  'central-009': makePortal('https://nfsm.gov.in/', 'National Food Security Mission Portal'),
  'central-010': makePortal('https://midh.gov.in/', 'MIDH Official Portal'),
  'central-011': makePortal('https://pgsindia-ncof.gov.in/', 'PGS-India Organic Farming Portal'),
  'central-012': makePortal('https://nmsa.dac.gov.in/', 'NMSA Official Portal'),
  'central-013': makePortal('https://nmeo.dac.gov.in/', 'National Mission on Edible Oils Portal'),
  'central-014': makePortal('https://nmeo.dac.gov.in/', 'National Mission on Edible Oils Portal'),
  'central-015': makePortal('https://nbm.nic.in/', 'National Bamboo Mission Portal'),
  'central-016': makePortal('https://seednet.gov.in/', 'SeedNet India Portal'),
  'central-017': makePortal('https://agriwelfare.gov.in/', 'Agriculture & Farmers Welfare Portal'),
  'central-018': makePortal('https://agriwelfare.gov.in/', 'Agriculture & Farmers Welfare Portal'),
  'central-019': makePortal('https://movcdner.gov.in/', 'MOVCDNER Official Portal'),
  'central-020': makePortal('https://agriinfra.dac.gov.in/', 'Agriculture Infrastructure Fund Portal'),
  'central-021': makePortal('https://www.jansuraksha.gov.in/', 'Government Financial Services Portal'),
  'central-022': makePortal('https://agriwelfare.gov.in/', 'Agriculture & Farmers Welfare Portal'),
  'central-023': makePortal('https://enam.gov.in/web/Enam_ctrl/enam_registration', 'e-NAM Registration Portal', 'https://enam.gov.in/'),
  'central-024': makePortal('https://sfacindia.com/', 'SFAC Official Portal'),
  'central-025': makePortal('https://nbhm.gov.in/', 'National Beekeeping & Honey Mission Portal'),
  'central-026': makePortal('https://dahd.gov.in/', 'Department of Animal Husbandry & Dairying'),
  'central-027': makePortal('https://dahd.gov.in/', 'Department of Animal Husbandry & Dairying'),
  'central-028': makePortal('https://ahidf.udyamimitra.in/', 'AHIDF Application Portal', 'https://dahd.gov.in/'),
  'central-029': makePortal('https://dahd.gov.in/', 'Department of Animal Husbandry & Dairying'),
  'central-030': makePortal('https://pmmsy.dof.gov.in/', 'PMMSY / Department of Fisheries Portal', 'https://dof.gov.in/'),
  'central-031': makePortal('https://dof.gov.in/', 'Department of Fisheries Portal'),
  'central-032': makePortal('https://agriwelfare.gov.in/', 'Agriculture & Farmers Welfare Portal'),
  'central-033': makePortal('https://nhb.gov.in/', 'National Horticulture Board Portal'),
  'central-034': makePortal('https://agmarknet.gov.in/', 'AGMARKNET Official Portal'),
  'central-035': makePortal('https://agriwelfare.gov.in/', 'Agriculture & Farmers Welfare Portal'),
  'central-036': makePortal('https://naturalfarming.dac.gov.in/', 'National Mission on Natural Farming Portal'),
  'central-037': makePortal('https://agriwelfare.gov.in/', 'Digital Agriculture / Agriculture Ministry Portal'),
  'central-038': makePortal('https://cleanplant.icar.gov.in/', 'Clean Plant Programme Portal'),
  'central-039': makePortal('https://nfsm.gov.in/', 'National Food Security Mission Portal'),
  'central-040': makePortal('https://nfsm.gov.in/', 'National Food Security Mission Portal'),
  'central-041': makePortal('https://nfsm.gov.in/', 'National Food Security Mission Portal'),
  'central-042': makePortal('https://nfsm.gov.in/', 'National Food Security Mission Portal'),
  'central-043': makePortal('https://nmeo.dac.gov.in/', 'National Mission on Edible Oils Portal'),
  'central-044': makePortal('https://agriinfra.dac.gov.in/', 'Agriculture Infrastructure Portal'),
  'central-045': makePortal('https://agriinfra.dac.gov.in/', 'Agriculture Infrastructure Portal'),
  'central-046': makePortal('https://agrimachinery.nic.in/', 'Agricultural Mechanization Portal'),
  'central-047': makePortal('https://agrimachinery.nic.in/', 'Agricultural Mechanization Portal'),
  'central-048': makePortal('https://www.agriclinics.net/', 'Agri Clinics & Agri Business Centres'),
  'central-049': makePortal('https://rkvy.nic.in/', 'RKVY Official Portal'),
  'central-050': makePortal('https://apeda.gov.in/', 'APEDA Official Portal'),
};

const STATE_PORTALS: Record<string, GovernmentPortalLink> = {
  AP: makePortal('https://apagrisnet.gov.in/', 'Andhra Pradesh Agriculture Portal'),
  AR: makePortal('https://agri-horti.arunachal.gov.in/', 'Arunachal Pradesh Agriculture Portal'),
  AS: makePortal('https://diragri.assam.gov.in/', 'Assam Agriculture Department'),
  BR: makePortal('https://dbtagriculture.bihar.gov.in/', 'Bihar DBT Agriculture Portal'),
  CG: makePortal('https://agriportal.cg.nic.in/', 'Chhattisgarh Agriculture Portal'),
  CH: makePortal('https://chandigarh.gov.in/', 'Chandigarh Administration Portal'),
  DL: makePortal('https://agri.delhi.gov.in/', 'Delhi Agriculture Department'),
  DN: makePortal('https://ddd.gov.in/', 'Dadra & Nagar Haveli and Daman & Diu Portal'),
  GA: makePortal('https://agri.goa.gov.in/', 'Goa Agriculture Department'),
  GJ: makePortal('https://ikhedut.gujarat.gov.in/', 'Gujarat i-Khedut Portal'),
  HR: makePortal('https://agriharyana.gov.in/', 'Haryana Agriculture Department'),
  HP: makePortal('https://agriculture.hp.gov.in/', 'Himachal Pradesh Agriculture Department'),
  JH: makePortal('https://agri.jharkhand.gov.in/', 'Jharkhand Agriculture Department'),
  JK: makePortal('https://diragrijmu.nic.in/', 'Jammu & Kashmir Agriculture Department'),
  KA: makePortal('https://raitamitra.karnataka.gov.in/', 'Karnataka RaithaMitra Portal'),
  KL: makePortal('https://www.keralaagriculture.gov.in/', 'Kerala Agriculture Department'),
  LA: makePortal('https://ladakh.gov.in/', 'Ladakh Administration Portal'),
  LD: makePortal('https://lakshadweep.gov.in/', 'Lakshadweep Administration Portal'),
  MH: makePortal('https://mahadbt.maharashtra.gov.in/', 'MahaDBT Farmer Portal'),
  ML: makePortal('https://megagriculture.gov.in/', 'Meghalaya Agriculture Department'),
  MN: makePortal('https://agrimanipur.nic.in/', 'Manipur Agriculture Department'),
  MP: makePortal('https://farmer.mponline.gov.in/', 'Madhya Pradesh Farmer Portal'),
  MZ: makePortal('https://agriculture.mizoram.gov.in/', 'Mizoram Agriculture Department'),
  NL: makePortal('https://agriculture.nagaland.gov.in/', 'Nagaland Agriculture Department'),
  OD: makePortal('https://agri.odisha.gov.in/', 'Odisha Agriculture Department'),
  PB: makePortal('https://agri.punjab.gov.in/', 'Punjab Agriculture Department'),
  PY: makePortal('https://agri.py.gov.in/', 'Puducherry Agriculture Department'),
  RJ: makePortal('https://rajkisan.rajasthan.gov.in/', 'Rajasthan RajKisan Portal'),
  SK: makePortal('https://sikkimagrisnet.org/', 'Sikkim Agriculture Portal'),
  TN: makePortal('https://www.tnagrisnet.tn.gov.in/', 'Tamil Nadu Agriculture Portal'),
  TR: makePortal('https://agri.tripura.gov.in/', 'Tripura Agriculture Department'),
  TS: makePortal('https://agri.telangana.gov.in/', 'Telangana Agriculture Department'),
  UK: makePortal('https://agriculture.uk.gov.in/', 'Uttarakhand Agriculture Department'),
  UP: makePortal('https://upagriculture.com/', 'Uttar Pradesh Agriculture Portal'),
  WB: makePortal('https://krishakbandhu.net/', 'West Bengal Krishak Bandhu Portal'),
  AN: makePortal('https://agri.andaman.gov.in/', 'Andaman & Nicobar Agriculture Portal'),
};

const getSchemePortal = (id: string, stateCode: string): GovernmentPortalLink | undefined =>
  CENTRAL_SCHEME_PORTALS[id] || STATE_PORTALS[stateCode];

/* ============================================================
   SCHEME HELPERS
============================================================ */

const central = (
  id: string,
  schemeName: string,
  category: SchemeCategory,
  description: string,
  benefits: string[],
  eligibility: string[],
  department: string,
  benefitAmount?: number,
  subsidyPercentage?: number
): GovernmentScheme => {
  const portal = getSchemePortal(id, 'ALL');
  return {
  id,
  schemeName,
  governmentLevel: 'CENTRAL',
  state: 'All India',
  stateCode: 'ALL',
  department,
  category,
  description,
  benefits,
  eligibility,
  requiredDocuments: [
    'Aadhaar / valid identity proof',
    'Bank account details',
    'Mobile number',
    'Land / farmer registration documents where applicable',
  ],
  farmerTypes: ['All Farmers'],
  crops: ['Multiple crops'],
  benefitAmount,
  subsidyPercentage,
  applicationMode: 'ONLINE',
  applicationUrl: portal?.applicationUrl,
  officialSourceUrl: portal?.officialSourceUrl,
  isActive: true,
  lastVerified: '2026-09-08',
  };
};

const stateScheme = (
  id: string,
  state: string,
  code: string,
  schemeName: string,
  category: SchemeCategory,
  description: string,
  benefits: string[] = [],
  department: string = 'Department of Agriculture'
): GovernmentScheme => {
  const portal = getSchemePortal(id, code);
  return {
  id,
  schemeName,
  governmentLevel: 'STATE',
  state,
  stateCode: code,
  department,
  category,
  description,
  benefits,
  eligibility: [
    `Resident farmer of ${state} `,
    'Must satisfy the scheme-specific eligibility conditions',
    'Valid farmer / land / beneficiary registration where applicable',
  ],
  requiredDocuments: [
    'Identity proof',
    'Bank account details',
    'Farmer registration',
    'Land / tenancy documents where applicable',
  ],
  farmerTypes: ['All Farmers'],
  crops: ['State-specific crops'],
  applicationMode: 'AGRICULTURE_DEPARTMENT',
  applicationUrl: portal?.applicationUrl,
  officialSourceUrl: portal?.officialSourceUrl,
  isActive: true,
  lastVerified: '2026-09-08',
  };
};

/* ============================================================
   100+ SCHEME CATALOG
============================================================ */

const SCHEMES: GovernmentScheme[] = [
  /* ---------------- CENTRAL SCHEMES ---------------- */

  central(
    'central-001',
    'Pradhan Mantri Kisan Samman Nidhi',
    'INCOME_SUPPORT',
    'Income support programme for eligible landholding farmer families.',
    ['Financial support up to ₹6,000 per year subject to eligibility'],
    ['Eligible landholding farmer families', 'Required beneficiary verification'],
    'Department of Agriculture & Farmers Welfare',
    6000
  ),

  central(
    'central-002',
    'Pradhan Mantri Fasal Bima Yojana',
    'CROP_INSURANCE',
    'Crop insurance programme protecting farmers against specified crop losses.',
    ['Insurance protection against notified crop risks', 'Reduced farmer premium for notified crops'],
    ['Farmer cultivating notified crops', 'Crop and area must be notified'],
    'Department of Agriculture & Farmers Welfare'
  ),

  central(
    'central-003',
    'Pradhan Mantri Kisan Maandhan Yojana',
    'PENSION',
    'Voluntary contributory pension scheme for eligible small and marginal farmers.',
    ['Monthly pension after qualifying age subject to scheme conditions', 'Government contribution as applicable'],
    ['Small and marginal farmers', 'Age and enrolment conditions apply'],
    'Department of Agriculture & Farmers Welfare'
  ),

  central(
    'central-004',
    'Pradhan Mantri Krishi Sinchayee Yojana',
    'IRRIGATION',
    'Programme supporting improved irrigation coverage and water-use efficiency.',
    ['Improved irrigation access', 'Water-use efficiency', 'Micro-irrigation support through components'],
    ['Eligible farmers under applicable component'],
    'Department of Agriculture & Farmers Welfare'
  ),

  central(
    'central-005',
    'Per Drop More Crop',
    'IRRIGATION',
    'Promotes micro-irrigation technologies such as drip and sprinkler systems.',
    ['Support for micro-irrigation', 'Water saving', 'Improved irrigation efficiency'],
    ['Farmers meeting state/component requirements'],
    'Department of Agriculture & Farmers Welfare'
  ),

  central(
    'central-006',
    'Rashtriya Krishi Vikas Yojana',
    'SUSTAINABLE_AGRICULTURE',
    'Supports agriculture and allied-sector development through state-led projects.',
    ['Agriculture infrastructure', 'Technology adoption', 'Productivity improvement'],
    ['Beneficiaries determined under approved state projects'],
    'Department of Agriculture & Farmers Welfare'
  ),

  central(
    'central-007',
    'Soil Health Card Scheme',
    'SOIL_HEALTH',
    'Provides soil testing and nutrient management recommendations.',
    ['Soil nutrient information', 'Fertilizer recommendations', 'Better soil management'],
    ['Farmers with eligible agricultural land'],
    'Department of Agriculture & Farmers Welfare'
  ),

  central(
    'central-008',
    'Sub-Mission on Agricultural Mechanization',
    'FARM_MECHANIZATION',
    'Promotes access to agricultural machinery and farm equipment.',
    ['Machinery assistance', 'Custom Hiring Centres', 'Improved farm efficiency'],
    ['Farmers and eligible agricultural groups under state implementation'],
    'Department of Agriculture & Farmers Welfare'
  ),

  central(
    'central-009',
    'National Food Security Mission',
    'SEEDS_INPUTS',
    'Supports productivity and production of important food crops.',
    ['Improved seeds', 'Demonstrations', 'Technology and productivity support'],
    ['Farmers growing notified crops in implementing areas'],
    'Department of Agriculture & Farmers Welfare'
  ),

  central(
    'central-010',
    'Mission for Integrated Development of Horticulture',
    'HORTICULTURE',
    'Supports integrated development of horticultural crops.',
    ['Planting material', 'Horticulture infrastructure', 'Post-harvest support'],
    ['Eligible horticulture farmers and beneficiaries'],
    'Department of Agriculture & Farmers Welfare'
  ),

  central(
    'central-011',
    'Paramparagat Krishi Vikas Yojana',
    'ORGANIC_FARMING',
    'Promotes cluster-based organic farming.',
    ['Organic farming support', 'Capacity building', 'Certification-related support'],
    ['Farmers participating in eligible organic clusters'],
    'Department of Agriculture & Farmers Welfare'
  ),

  central(
    'central-012',
    'National Mission on Sustainable Agriculture',
    'SUSTAINABLE_AGRICULTURE',
    'Promotes climate-resilient and sustainable agricultural practices.',
    ['Resource conservation', 'Climate-resilient practices', 'Improved farm sustainability'],
    ['Eligible farmers under programme components'],
    'Department of Agriculture & Farmers Welfare'
  ),

  central(
    'central-013',
    'National Mission on Edible Oils – Oil Palm',
    'HORTICULTURE',
    'Supports expansion of oil palm cultivation in suitable regions.',
    ['Planting support', 'Area expansion', 'Technical assistance'],
    ['Farmers in suitable notified areas'],
    'Department of Agriculture & Farmers Welfare'
  ),

  central(
    'central-014',
    'National Mission on Edible Oils – Oilseeds',
    'SEEDS_INPUTS',
    'Supports production of oilseed crops and productivity enhancement.',
    ['Quality seed support', 'Demonstrations', 'Technology adoption'],
    ['Farmers growing notified oilseed crops'],
    'Department of Agriculture & Farmers Welfare'
  ),

  central(
    'central-015',
    'National Bamboo Mission',
    'HORTICULTURE',
    'Supports bamboo cultivation, value chains and related infrastructure.',
    ['Planting material', 'Cultivation support', 'Value-chain development'],
    ['Eligible bamboo growers and implementing beneficiaries'],
    'Department of Agriculture & Farmers Welfare'
  ),

  central(
    'central-016',
    'Sub-Mission on Seeds and Planting Material',
    'SEEDS_INPUTS',
    'Improves availability and quality of seeds and planting material.',
    ['Quality seed access', 'Seed production support', 'Improved planting material'],
    ['Eligible farmers and seed-related beneficiaries'],
    'Department of Agriculture & Farmers Welfare'
  ),

  central(
    'central-017',
    'Sub-Mission on Agricultural Extension',
    'OTHER',
    'Strengthens agricultural knowledge, extension and farmer advisory services.',
    ['Training', 'Technology demonstrations', 'Farmer advisory'],
    ['Farmers participating in eligible extension activities'],
    'Department of Agriculture & Farmers Welfare'
  ),

  central(
    'central-018',
    'Rainfed Area Development',
    'SUSTAINABLE_AGRICULTURE',
    'Supports integrated farming systems in rainfed regions.',
    ['Integrated farming', 'Natural resource management', 'Risk reduction'],
    ['Farmers in eligible rainfed areas'],
    'Department of Agriculture & Farmers Welfare'
  ),

  central(
    'central-019',
    'Mission Organic Value Chain Development for North Eastern Region',
    'ORGANIC_FARMING',
    'Promotes certified organic production and value chains in the North Eastern Region.',
    ['Organic production', 'Processing', 'Marketing support'],
    ['Eligible beneficiaries in North Eastern states'],
    'Department of Agriculture & Farmers Welfare'
  ),

  central(
    'central-020',
    'Agriculture Infrastructure Fund',
    'STORAGE',
    'Financing facility supporting post-harvest and agricultural infrastructure.',
    ['Financing support', 'Interest-related benefits subject to eligibility', 'Infrastructure development'],
    ['Eligible farmers, FPOs, agri-entrepreneurs and infrastructure entities'],
    'Department of Agriculture & Farmers Welfare'
  ),

  central(
    'central-021',
    'Kisan Credit Card',
    'AGRICULTURAL_LOAN',
    'Credit facility for agricultural and allied activities through eligible financial institutions.',
    ['Timely agricultural credit', 'Working capital support', 'Allied activity financing'],
    ['Eligible farmers and allied-sector beneficiaries'],
    'Department of Financial Services / Banking System'
  ),

  central(
    'central-022',
    'Interest Subvention Scheme',
    'AGRICULTURAL_LOAN',
    'Interest-related support for eligible short-term agricultural loans.',
    ['Interest support subject to applicable conditions', 'Timely credit access'],
    ['Eligible agricultural borrowers'],
    'Department of Agriculture & Farmers Welfare'
  ),

  central(
    'central-023',
    'National Agriculture Market - e-NAM',
    'MARKETING',
    'Electronic trading platform connecting agricultural markets.',
    ['Market discovery', 'Transparent price information', 'Broader market access'],
    ['Farmers selling eligible agricultural produce'],
    'Department of Agriculture & Farmers Welfare'
  ),

  central(
    'central-024',
    'Formation and Promotion of 10,000 FPOs',
    'FPO',
    'Promotes formation and strengthening of Farmer Producer Organisations.',
    ['Institutional support', 'Capacity building', 'Market linkage'],
    ['Farmer groups and FPO beneficiaries'],
    'Department of Agriculture & Farmers Welfare'
  ),

  central(
    'central-025',
    'National Beekeeping and Honey Mission',
    'OTHER',
    'Supports scientific beekeeping and honey value-chain development.',
    ['Bee colonies and equipment support through components', 'Training', 'Value-chain development'],
    ['Eligible beekeepers and related beneficiaries'],
    'Department of Agriculture & Farmers Welfare'
  ),

  central(
    'central-026',
    'National Livestock Mission',
    'LIVESTOCK',
    'Supports entrepreneurship and development in livestock sectors.',
    ['Livestock entrepreneurship', 'Breed development', 'Feed and fodder-related support'],
    ['Eligible livestock farmers and entrepreneurs'],
    'Department of Animal Husbandry & Dairying'
  ),

  central(
    'central-027',
    'Rashtriya Gokul Mission',
    'LIVESTOCK',
    'Supports development and conservation of indigenous cattle breeds.',
    ['Breed improvement', 'Productivity enhancement', 'Indigenous breed conservation'],
    ['Eligible livestock beneficiaries'],
    'Department of Animal Husbandry & Dairying'
  ),

  central(
    'central-028',
    'Animal Husbandry Infrastructure Development Fund',
    'LIVESTOCK',
    'Supports infrastructure development in animal husbandry and dairy sectors.',
    ['Infrastructure financing', 'Processing facilities', 'Value-chain development'],
    ['Eligible entrepreneurs and institutions'],
    'Department of Animal Husbandry & Dairying'
  ),

  central(
    'central-029',
    'Dairy Processing and Infrastructure Development Fund',
    'LIVESTOCK',
    'Supports modernization of dairy processing and related infrastructure.',
    ['Dairy infrastructure', 'Processing capacity', 'Modernization'],
    ['Eligible dairy cooperatives and entities'],
    'Department of Animal Husbandry & Dairying'
  ),

  central(
    'central-030',
    'Pradhan Mantri Matsya Sampada Yojana',
    'FISHERIES',
    'Supports sustainable fisheries and aquaculture development.',
    ['Fisheries infrastructure', 'Aquaculture development', 'Value-chain support'],
    ['Eligible fishers, farmers and fisheries beneficiaries'],
    'Department of Fisheries'
  ),

  central(
    'central-031',
    'Fisheries and Aquaculture Infrastructure Development Fund',
    'FISHERIES',
    'Supports infrastructure for fisheries and aquaculture.',
    ['Infrastructure financing', 'Cold chain', 'Processing and value addition'],
    ['Eligible fisheries entities'],
    'Department of Fisheries'
  ),

  central(
    'central-032',
    'Micro Irrigation Fund',
    'IRRIGATION',
    'Supports expansion of micro-irrigation through financing mechanisms.',
    ['Micro-irrigation expansion', 'Water efficiency', 'Irrigation infrastructure'],
    ['Eligible implementing entities and farmers through applicable programmes'],
    'Department of Agriculture & Farmers Welfare'
  ),

  central(
    'central-033',
    'National Horticulture Board Assistance',
    'HORTICULTURE',
    'Supports selected horticulture infrastructure and development activities.',
    ['Horticulture infrastructure', 'Post-harvest facilities', 'Commercial horticulture'],
    ['Eligible horticulture beneficiaries'],
    'National Horticulture Board'
  ),

  central(
    'central-034',
    'Market Intervention Scheme',
    'MARKETING',
    'Provides intervention support for specified agricultural commodities under applicable conditions.',
    ['Price support/intervention', 'Market stabilization'],
    ['Farmers producing notified commodities under applicable intervention'],
    'Department of Agriculture & Farmers Welfare'
  ),

  central(
    'central-035',
    'Price Support Scheme',
    'MARKETING',
    'Supports procurement of notified crops at MSP under applicable arrangements.',
    ['MSP-based procurement', 'Market support'],
    ['Farmers growing eligible notified crops'],
    'Department of Agriculture & Farmers Welfare'
  ),

  central(
    'central-036',
    'National Mission on Natural Farming',
    'SUSTAINABLE_AGRICULTURE',
    'Promotes natural farming practices and reduced external agricultural inputs.',
    ['Training', 'Natural farming practices', 'Local input preparation'],
    ['Farmers participating in eligible programme areas'],
    'Department of Agriculture & Farmers Welfare'
  ),

  central(
    'central-037',
    'Digital Agriculture Mission',
    'OTHER',
    'Supports digital public infrastructure and technology-enabled agricultural services.',
    ['Digital farmer services', 'Data-enabled advisory', 'Technology integration'],
    ['Farmers and stakeholders through applicable digital services'],
    'Department of Agriculture & Farmers Welfare'
  ),

  central(
    'central-038',
    'Clean Plant Programme',
    'HORTICULTURE',
    'Supports availability of disease-free planting material for horticultural crops.',
    ['Quality planting material', 'Disease-free planting stock', 'Improved productivity'],
    ['Eligible horticulture stakeholders'],
    'Department of Agriculture & Farmers Welfare'
  ),

  central(
    'central-039',
    'National Food Security Mission - Rice',
    'SEEDS_INPUTS',
    'Supports productivity and technology adoption in rice production.',
    ['Seed support', 'Demonstrations', 'Improved production practices'],
    ['Eligible rice farmers in implementing areas'],
    'Department of Agriculture & Farmers Welfare'
  ),

  central(
    'central-040',
    'National Food Security Mission - Wheat',
    'SEEDS_INPUTS',
    'Supports productivity enhancement in wheat production.',
    ['Improved seed', 'Demonstrations', 'Technology support'],
    ['Eligible wheat farmers in implementing areas'],
    'Department of Agriculture & Farmers Welfare'
  ),

  central(
    'central-041',
    'National Food Security Mission - Pulses',
    'SEEDS_INPUTS',
    'Supports production and productivity of pulse crops.',
    ['Seed support', 'Demonstrations', 'Technology adoption'],
    ['Eligible pulse farmers'],
    'Department of Agriculture & Farmers Welfare'
  ),

  central(
    'central-042',
    'National Food Security Mission - Nutri Cereals',
    'SEEDS_INPUTS',
    'Supports production of nutri-cereals and climate-resilient crops.',
    ['Seed and technology support', 'Demonstrations', 'Productivity improvement'],
    ['Eligible farmers growing notified nutri-cereals'],
    'Department of Agriculture & Farmers Welfare'
  ),

  central(
    'central-043',
    'National Mission on Edible Oils',
    'SEEDS_INPUTS',
    'Supports edible oil production and related agricultural value chains.',
    ['Oilseed productivity', 'Technology adoption', 'Production support'],
    ['Eligible farmers and implementing beneficiaries'],
    'Department of Agriculture & Farmers Welfare'
  ),

  central(
    'central-044',
    'Agricultural Marketing Infrastructure',
    'STORAGE',
    'Supports development of agricultural marketing infrastructure.',
    ['Storage', 'Market infrastructure', 'Post-harvest management'],
    ['Eligible agricultural infrastructure beneficiaries'],
    'Department of Agriculture & Farmers Welfare'
  ),

  central(
    'central-045',
    'Post Harvest Management Support',
    'STORAGE',
    'Promotes improved handling, storage and post-harvest management.',
    ['Reduced post-harvest losses', 'Storage and handling improvements'],
    ['Eligible farmers and agricultural enterprises'],
    'Department of Agriculture & Farmers Welfare'
  ),

  central(
    'central-046',
    'Agricultural Mechanization Custom Hiring Centres',
    'FARM_MECHANIZATION',
    'Improves access to farm machinery through shared hiring facilities.',
    ['Affordable equipment access', 'Reduced machinery ownership cost', 'Timely operations'],
    ['Farmers and eligible groups'],
    'Department of Agriculture & Farmers Welfare'
  ),

  central(
    'central-047',
    'Farm Machinery Training and Testing',
    'FARM_MECHANIZATION',
    'Supports testing, training and awareness around agricultural machinery.',
    ['Machinery training', 'Operator skills', 'Technology awareness'],
    ['Farmers and agricultural machinery users'],
    'Department of Agriculture & Farmers Welfare'
  ),

  central(
    'central-048',
    'Agri Clinics and Agri Business Centres',
    'OTHER',
    'Encourages agricultural graduates and entrepreneurs to establish farm advisory and agri-business services.',
    ['Entrepreneurship support', 'Advisory services', 'Agri-business development'],
    ['Eligible agricultural graduates and entrepreneurs'],
    'Department of Agriculture & Farmers Welfare'
  ),

  central(
    'central-049',
    'National Agriculture Development Programme',
    'SUSTAINABLE_AGRICULTURE',
    'Supports state-level agriculture development projects and innovation.',
    ['Agriculture development', 'Innovation', 'Infrastructure support'],
    ['Beneficiaries under approved state projects'],
    'Department of Agriculture & Farmers Welfare'
  ),

  central(
    'central-050',
    'Agriculture Export Promotion Support',
    'MARKETING',
    'Supports agricultural export ecosystem and value-chain development.',
    ['Export market access', 'Quality and value addition', 'Market linkage'],
    ['Eligible farmer groups, FPOs and agri-enterprises'],
    'Agricultural Export Authorities / Implementing Agencies'
  ),

  /* ---------------- KARNATAKA ---------------- */

  stateScheme(
    'ka-001',
    'Karnataka',
    'KA',
    'Karnataka Raitha Suraksha Pradhana Mantri Fasal Bima Yojana',
    'CROP_INSURANCE',
    'State implementation support for crop insurance and farmer risk protection.',
    ['Crop insurance access', 'Risk protection', 'State implementation assistance'],
    'Department of Agriculture, Government of Karnataka'
  ),

  stateScheme(
    'ka-002',
    'Karnataka',
    'KA',
    'Karnataka Farm Mechanization Assistance',
    'FARM_MECHANIZATION',
    'Support for agricultural machinery and farm equipment through eligible programmes.',
    ['Farm equipment support', 'Mechanization', 'Improved productivity'],
    'Department of Agriculture, Government of Karnataka'
  ),

  stateScheme(
    'ka-003',
    'Karnataka',
    'KA',
    'Karnataka Micro Irrigation Assistance',
    'IRRIGATION',
    'Support for efficient irrigation technologies for eligible farmers.',
    ['Drip irrigation', 'Sprinkler systems', 'Water conservation'],
    'Department of Agriculture, Government of Karnataka'
  ),

  stateScheme(
    'ka-004',
    'Karnataka',
    'KA',
    'Karnataka Seed Subsidy Support',
    'SEEDS_INPUTS',
    'Support for quality seeds and improved planting material under applicable state programmes.',
    ['Quality seeds', 'Improved varieties', 'Input assistance'],
    'Department of Agriculture, Government of Karnataka'
  ),

  stateScheme(
    'ka-005',
    'Karnataka',
    'KA',
    'Karnataka Soil Health Assistance',
    'SOIL_HEALTH',
    'Soil testing and nutrient management assistance through state agriculture services.',
    ['Soil testing', 'Nutrient recommendations', 'Better fertilizer management'],
    'Department of Agriculture, Government of Karnataka'
  ),

  stateScheme(
    'ka-006',
    'Karnataka',
    'KA',
    'Karnataka Horticulture Development Support',
    'HORTICULTURE',
    'Support for horticultural crop development and infrastructure.',
    ['Planting material', 'Horticulture development', 'Post-harvest support'],
    'Department of Horticulture, Government of Karnataka'
  ),

  stateScheme(
    'ka-007',
    'Karnataka',
    'KA',
    'Karnataka Organic Farming Support',
    'ORGANIC_FARMING',
    'Promotes organic and sustainable farming practices.',
    ['Organic farming training', 'Input support where applicable', 'Certification support'],
    'Department of Agriculture, Government of Karnataka'
  ),

  stateScheme(
    'ka-008',
    'Karnataka',
    'KA',
    'Karnataka Farmer Training Programme',
    'OTHER',
    'Agricultural extension, demonstrations and farmer training services.',
    ['Training', 'Technology demonstrations', 'Expert advisory'],
    'Department of Agriculture, Government of Karnataka'
  ),

  /* ---------------- ANDHRA PRADESH ---------------- */

  stateScheme(
    'ap-001',
    'Andhra Pradesh',
    'AP',
    'Rythu Bharosa',
    'INCOME_SUPPORT',
    'Farmer support programme implemented by the Government of Andhra Pradesh.',
    ['Income support subject to current state eligibility', 'Farmer welfare assistance'],
    'Department of Agriculture, Government of Andhra Pradesh'
  ),

  stateScheme(
    'ap-002',
    'Andhra Pradesh',
    'AP',
    'AP Farm Mechanization Support',
    'FARM_MECHANIZATION',
    'Support for agricultural machinery through applicable state programmes.',
    ['Farm machinery', 'Custom hiring support', 'Mechanization'],
    'Department of Agriculture, Government of Andhra Pradesh'
  ),

  stateScheme(
    'ap-003',
    'Andhra Pradesh',
    'AP',
    'AP Micro Irrigation Programme',
    'IRRIGATION',
    'Promotes efficient irrigation systems for eligible farmers.',
    ['Drip irrigation', 'Sprinkler irrigation', 'Water conservation'],
    'Department of Horticulture, Government of Andhra Pradesh'
  ),

  stateScheme(
    'ap-004',
    'Andhra Pradesh',
    'AP',
    'AP Horticulture Development Programme',
    'HORTICULTURE',
    'Support for horticulture development and crop diversification.',
    ['Planting material', 'Crop diversification', 'Technical support'],
    'Department of Horticulture, Government of Andhra Pradesh'
  ),

  /* ---------------- TELANGANA ---------------- */

  stateScheme(
    'ts-001',
    'Telangana',
    'TS',
    'Rythu Bandhu',
    'INCOME_SUPPORT',
    'Agricultural investment support programme for eligible farmers.',
    ['Agricultural investment support subject to current rules', 'Seasonal assistance'],
    'Department of Agriculture, Government of Telangana'
  ),

  stateScheme(
    'ts-002',
    'Telangana',
    'TS',
    'Rythu Bima',
    'OTHER',
    'Farmer life insurance support programme implemented by Telangana.',
    ['Life insurance protection', 'Farmer family support'],
    'Department of Agriculture, Government of Telangana'
  ),

  stateScheme(
    'ts-003',
    'Telangana',
    'TS',
    'Telangana Farm Mechanization Programme',
    'FARM_MECHANIZATION',
    'Support for farm machinery and mechanization.',
    ['Machinery support', 'Farm efficiency', 'Custom hiring'],
    'Department of Agriculture, Government of Telangana'
  ),

  stateScheme(
    'ts-004',
    'Telangana',
    'TS',
    'Telangana Seed Support Programme',
    'SEEDS_INPUTS',
    'Quality seed availability and agricultural input support.',
    ['Quality seed', 'Input support', 'Improved crop productivity'],
    'Department of Agriculture, Government of Telangana'
  ),

  /* ---------------- MAHARASHTRA ---------------- */

  stateScheme(
    'mh-001',
    'Maharashtra',
    'MH',
    'Maharashtra Mahatma Jyotirao Phule Shetkari Karjamukti Yojana',
    'AGRICULTURAL_LOAN',
    'Farmer loan-related relief programme subject to prevailing state rules.',
    ['Eligible agricultural loan relief', 'Farmer debt support'],
    'Government of Maharashtra'
  ),

  stateScheme(
    'mh-002',
    'Maharashtra',
    'MH',
    'Maharashtra Farm Mechanization Scheme',
    'FARM_MECHANIZATION',
    'Agricultural machinery assistance for eligible farmers.',
    ['Machinery assistance', 'Mechanization', 'Productivity improvement'],
    'Department of Agriculture, Government of Maharashtra'
  ),

  stateScheme(
    'mh-003',
    'Maharashtra',
    'MH',
    'Maharashtra Horticulture Support',
    'HORTICULTURE',
    'Horticultural crop and infrastructure support.',
    ['Planting material', 'Horticulture development', 'Infrastructure'],
    'Department of Horticulture, Government of Maharashtra'
  ),

  stateScheme(
    'mh-004',
    'Maharashtra',
    'MH',
    'Maharashtra Irrigation Assistance',
    'IRRIGATION',
    'Support for efficient irrigation and water conservation.',
    ['Drip irrigation', 'Sprinkler irrigation', 'Water saving'],
    'Department of Agriculture, Government of Maharashtra'
  ),

  /* ---------------- GUJARAT ---------------- */

  stateScheme(
    'gj-001',
    'Gujarat',
    'GJ',
    'Gujarat Agricultural Mechanization Assistance',
    'FARM_MECHANIZATION',
    'Agricultural machinery assistance for eligible farmers.',
    ['Farm equipment support', 'Mechanization', 'Reduced labour dependence'],
    'Department of Agriculture, Government of Gujarat'
  ),

  stateScheme(
    'gj-002',
    'Gujarat',
    'GJ',
    'Gujarat Micro Irrigation Assistance',
    'IRRIGATION',
    'Support for micro-irrigation and efficient water management.',
    ['Drip irrigation', 'Sprinkler irrigation', 'Water conservation'],
    'Department of Agriculture, Government of Gujarat'
  ),

  stateScheme(
    'gj-003',
    'Gujarat',
    'GJ',
    'Gujarat Horticulture Development Support',
    'HORTICULTURE',
    'Support for horticultural crop development.',
    ['Planting material', 'Horticulture infrastructure', 'Technical assistance'],
    'Department of Horticulture, Government of Gujarat'
  ),

  /* ---------------- TAMIL NADU ---------------- */

  stateScheme(
    'tn-001',
    'Tamil Nadu',
    'TN',
    'Tamil Nadu Agricultural Mechanization Support',
    'FARM_MECHANIZATION',
    'Farm machinery assistance through eligible agricultural programmes.',
    ['Farm machinery', 'Equipment assistance', 'Mechanization'],
    'Department of Agriculture, Government of Tamil Nadu'
  ),

  stateScheme(
    'tn-002',
    'Tamil Nadu',
    'TN',
    'Tamil Nadu Micro Irrigation Scheme',
    'IRRIGATION',
    'Promotes drip and sprinkler irrigation.',
    ['Water saving', 'Drip irrigation', 'Sprinkler irrigation'],
    'Department of Agriculture, Government of Tamil Nadu'
  ),

  stateScheme(
    'tn-003',
    'Tamil Nadu',
    'TN',
    'Tamil Nadu Horticulture Development Programme',
    'HORTICULTURE',
    'Support for horticultural crops and infrastructure.',
    ['Planting material', 'Crop development', 'Post-harvest infrastructure'],
    'Department of Horticulture, Government of Tamil Nadu'
  ),

  /* ---------------- KERALA ---------------- */

  stateScheme(
    'kl-001',
    'Kerala',
    'KL',
    'Kerala Farmer Support Programme',
    'INCOME_SUPPORT',
    'Agricultural support delivered through state agriculture services.',
    ['Eligible farmer assistance', 'Agricultural development support'],
    'Department of Agriculture Development and Farmers Welfare, Kerala'
  ),

  stateScheme(
    'kl-002',
    'Kerala',
    'KL',
    'Kerala Paddy Development Programme',
    'SEEDS_INPUTS',
    'Support for paddy cultivation and productivity improvement.',
    ['Paddy cultivation support', 'Input assistance', 'Productivity improvement'],
    'Department of Agriculture Development and Farmers Welfare, Kerala'
  ),

  stateScheme(
    'kl-003',
    'Kerala',
    'KL',
    'Kerala Vegetable Development Programme',
    'HORTICULTURE',
    'Promotes vegetable production and local food systems.',
    ['Vegetable cultivation', 'Input support', 'Technical assistance'],
    'Department of Agriculture Development and Farmers Welfare, Kerala'
  ),

  /* ---------------- ODISHA ---------------- */

  stateScheme(
    'od-001',
    'Odisha',
    'OD',
    'KALIA',
    'INCOME_SUPPORT',
    'Farmer and agricultural household support programme of Odisha, subject to current state rules.',
    ['Farmer support', 'Agricultural livelihood assistance'],
    'Government of Odisha'
  ),

  stateScheme(
    'od-002',
    'Odisha',
    'OD',
    'Odisha Farm Mechanization Programme',
    'FARM_MECHANIZATION',
    'Agricultural machinery support for eligible beneficiaries.',
    ['Machinery assistance', 'Mechanization', 'Farm efficiency'],
    'Department of Agriculture & Farmers Empowerment, Odisha'
  ),

  stateScheme(
    'od-003',
    'Odisha',
    'OD',
    'Odisha Horticulture Development',
    'HORTICULTURE',
    'Horticulture crop and infrastructure development support.',
    ['Planting material', 'Horticulture development', 'Technical assistance'],
    'Department of Agriculture & Farmers Empowerment, Odisha'
  ),

  /* ---------------- WEST BENGAL ---------------- */

  stateScheme(
    'wb-001',
    'West Bengal',
    'WB',
    'Krishak Bandhu',
    'INCOME_SUPPORT',
    'Farmer support programme of West Bengal.',
    ['Agricultural household support', 'Farmer welfare assistance'],
    'Government of West Bengal'
  ),

  stateScheme(
    'wb-002',
    'West Bengal',
    'WB',
    'Bangla Shasya Bima',
    'CROP_INSURANCE',
    'State crop insurance programme.',
    ['Crop insurance', 'Risk protection'],
    'Department of Agriculture, Government of West Bengal'
  ),

  /* ---------------- BIHAR ---------------- */

  stateScheme(
    'br-001',
    'Bihar',
    'BR',
    'Bihar Agricultural Input Assistance',
    'SEEDS_INPUTS',
    'Agricultural input assistance under eligible state programmes.',
    ['Input assistance', 'Seed support', 'Productivity improvement'],
    'Department of Agriculture, Government of Bihar'
  ),

  stateScheme(
    'br-002',
    'Bihar',
    'BR',
    'Bihar Farm Mechanization Support',
    'FARM_MECHANIZATION',
    'Support for farm machinery and agricultural equipment.',
    ['Farm machinery', 'Mechanization', 'Equipment assistance'],
    'Department of Agriculture, Government of Bihar'
  ),

  /* ---------------- RAJASTHAN ---------------- */

  stateScheme(
    'rj-001',
    'Rajasthan',
    'RJ',
    'Rajasthan Farm Mechanization Support',
    'FARM_MECHANIZATION',
    'Support for agricultural machinery through state programmes.',
    ['Machinery assistance', 'Mechanization', 'Farm productivity'],
    'Department of Agriculture, Government of Rajasthan'
  ),

  stateScheme(
    'rj-002',
    'Rajasthan',
    'RJ',
    'Rajasthan Irrigation Support',
    'IRRIGATION',
    'Support for efficient irrigation and water conservation.',
    ['Drip', 'Sprinkler', 'Water conservation'],
    'Department of Agriculture, Government of Rajasthan'
  ),

  /* ---------------- MADHYA PRADESH ---------------- */

  stateScheme(
    'mp-001',
    'Madhya Pradesh',
    'MP',
    'Madhya Pradesh Farm Mechanization',
    'FARM_MECHANIZATION',
    'Agricultural machinery assistance for eligible farmers.',
    ['Machinery support', 'Mechanization', 'Improved efficiency'],
    'Department of Farmer Welfare & Agriculture Development, Madhya Pradesh'
  ),

  stateScheme(
    'mp-002',
    'Madhya Pradesh',
    'MP',
    'Madhya Pradesh Horticulture Support',
    'HORTICULTURE',
    'Support for horticultural crop development.',
    ['Planting material', 'Horticulture infrastructure', 'Technical support'],
    'Department of Horticulture, Madhya Pradesh'
  ),

  /* ---------------- UTTAR PRADESH ---------------- */

  stateScheme(
    'up-001',
    'Uttar Pradesh',
    'UP',
    'Uttar Pradesh Farm Mechanization Assistance',
    'FARM_MECHANIZATION',
    'Farm equipment assistance for eligible agricultural beneficiaries.',
    ['Machinery assistance', 'Farm efficiency', 'Equipment support'],
    'Department of Agriculture, Uttar Pradesh'
  ),

  stateScheme(
    'up-002',
    'Uttar Pradesh',
    'UP',
    'Uttar Pradesh Horticulture Development',
    'HORTICULTURE',
    'Support for horticultural production and infrastructure.',
    ['Planting material', 'Crop diversification', 'Infrastructure'],
    'Department of Horticulture, Uttar Pradesh'
  ),

  /* ---------------- PUNJAB ---------------- */

  stateScheme(
    'pb-001',
    'Punjab',
    'PB',
    'Punjab Farm Mechanization Support',
    'FARM_MECHANIZATION',
    'Support for farm machinery and improved agricultural practices.',
    ['Machinery support', 'Mechanization', 'Efficient farm operations'],
    'Department of Agriculture & Farmers Welfare, Punjab'
  ),

  stateScheme(
    'pb-002',
    'Punjab',
    'PB',
    'Punjab Crop Diversification Support',
    'SUSTAINABLE_AGRICULTURE',
    'Promotes diversification toward sustainable cropping patterns.',
    ['Crop diversification', 'Water conservation', 'Alternative crops'],
    'Department of Agriculture & Farmers Welfare, Punjab'
  ),

  /* ---------------- HARYANA ---------------- */

  stateScheme(
    'hr-001',
    'Haryana',
    'HR',
    'Haryana Farm Mechanization Assistance',
    'FARM_MECHANIZATION',
    'Support for agricultural machinery.',
    ['Machinery support', 'Mechanization', 'Productivity improvement'],
    'Department of Agriculture & Farmers Welfare, Haryana'
  ),

  stateScheme(
    'hr-002',
    'Haryana',
    'HR',
    'Haryana Crop Diversification Programme',
    'SUSTAINABLE_AGRICULTURE',
    'Encourages diversification and resource-efficient agriculture.',
    ['Alternative crops', 'Water conservation', 'Diversification support'],
    'Department of Agriculture & Farmers Welfare, Haryana'
  ),

  /* ---------------- HIMACHAL PRADESH ---------------- */

  stateScheme(
    'hp-001',
    'Himachal Pradesh',
    'HP',
    'Himachal Horticulture Development',
    'HORTICULTURE',
    'Supports horticulture development in the hill state.',
    ['Planting material', 'Orchard development', 'Technical support'],
    'Department of Horticulture, Himachal Pradesh'
  ),

  stateScheme(
    'hp-002',
    'Himachal Pradesh',
    'HP',
    'Himachal Farm Mechanization Support',
    'FARM_MECHANIZATION',
    'Machinery assistance suitable for hill agriculture.',
    ['Farm equipment', 'Mechanization', 'Productivity improvement'],
    'Department of Agriculture, Himachal Pradesh'
  ),

  /* ---------------- JHARKHAND ---------------- */

  stateScheme(
    'jh-001',
    'Jharkhand',
    'JH',
    'Jharkhand Agricultural Input Support',
    'SEEDS_INPUTS',
    'Input and agricultural development assistance.',
    ['Seed support', 'Agricultural inputs', 'Productivity support'],
    'Department of Agriculture, Jharkhand'
  ),

  stateScheme(
    'jh-002',
    'Jharkhand',
    'JH',
    'Jharkhand Farm Mechanization Support',
    'FARM_MECHANIZATION',
    'Support for farm machinery and agricultural equipment.',
    ['Farm machinery', 'Mechanization', 'Equipment assistance'],
    'Department of Agriculture, Jharkhand'
  ),

  /* ---------------- CHHATTISGARH ---------------- */

  stateScheme(
    'cg-001',
    'Chhattisgarh',
    'CG',
    'Godhan Nyay Yojana / Livestock Support',
    'LIVESTOCK',
    'Livestock and rural agricultural support programme subject to current state policy.',
    ['Livestock-linked livelihood support', 'Rural income opportunities'],
    'Government of Chhattisgarh'
  ),

  stateScheme(
    'cg-002',
    'Chhattisgarh',
    'CG',
    'Chhattisgarh Farm Mechanization',
    'FARM_MECHANIZATION',
    'Agricultural machinery assistance.',
    ['Machinery support', 'Mechanization'],
    'Department of Agriculture, Chhattisgarh'
  ),

  /* ---------------- ASSAM ---------------- */

  stateScheme(
    'as-001',
    'Assam',
    'AS',
    'Assam Farm Mechanization Programme',
    'FARM_MECHANIZATION',
    'Support for agricultural machinery and modern farming.',
    ['Farm machinery', 'Mechanization', 'Technology adoption'],
    'Department of Agriculture, Assam'
  ),

  stateScheme(
    'as-002',
    'Assam',
    'AS',
    'Assam Horticulture Development',
    'HORTICULTURE',
    'Support for horticulture and plantation development.',
    ['Planting material', 'Horticulture development', 'Technical assistance'],
    'Department of Agriculture, Assam'
  ),

  /* ---------------- GOA ---------------- */

  stateScheme(
    'ga-001',
    'Goa',
    'GA',
    'Goa Agricultural Input Support',
    'SEEDS_INPUTS',
    'Agricultural input assistance through eligible state programmes.',
    ['Input support', 'Seeds', 'Agricultural productivity'],
    'Department of Agriculture, Government of Goa'
  ),

  stateScheme(
    'ga-002',
    'Goa',
    'GA',
    'Goa Horticulture Development',
    'HORTICULTURE',
    'Support for horticulture and plantation crops.',
    ['Planting material', 'Crop development', 'Technical support'],
    'Department of Agriculture, Government of Goa'
  ),

  /* ---------------- UTTARAKHAND ---------------- */

  stateScheme(
    'uk-001',
    'Uttarakhand',
    'UK',
    'Uttarakhand Organic Farming Support',
    'ORGANIC_FARMING',
    'Promotes organic and natural farming practices.',
    ['Organic inputs', 'Training', 'Market linkage'],
    'Department of Agriculture, Uttarakhand'
  ),

  stateScheme(
    'uk-002',
    'Uttarakhand',
    'UK',
    'Uttarakhand Horticulture Support',
    'HORTICULTURE',
    'Support for hill horticulture and orchard development.',
    ['Planting material', 'Orchard development', 'Technical assistance'],
    'Department of Horticulture, Uttarakhand'
  ),

  /* ---------------- SIKKIM ---------------- */

  stateScheme(
    'sk-001',
    'Sikkim',
    'SK',
    'Sikkim Organic Farming Programme',
    'ORGANIC_FARMING',
    'Supports the state organic farming ecosystem.',
    ['Organic farming', 'Training', 'Certification and market development'],
    'Government of Sikkim'
  ),

  /* ---------------- OTHERS / REPRESENTATIVE STATE PROGRAMMES ---------------- */

  stateScheme(
    'ar-001',
    'Arunachal Pradesh',
    'AR',
    'Arunachal Pradesh Horticulture Support',
    'HORTICULTURE',
    'Horticulture and plantation development assistance.',
    ['Planting material', 'Horticulture support'],
    'Department of Agriculture, Arunachal Pradesh'
  ),

  stateScheme(
    'mn-001',
    'Manipur',
    'MN',
    'Manipur Agricultural Mechanization Support',
    'FARM_MECHANIZATION',
    'Support for modern farm machinery.',
    ['Farm machinery', 'Mechanization'],
    'Department of Agriculture, Manipur'
  ),

  stateScheme(
    'ml-001',
    'Meghalaya',
    'ML',
    'Meghalaya Horticulture Development',
    'HORTICULTURE',
    'Support for horticultural and plantation development.',
    ['Planting material', 'Horticulture support'],
    'Department of Agriculture, Meghalaya'
  ),

  stateScheme(
    'mz-001',
    'Mizoram',
    'MZ',
    'Mizoram Agricultural Development Support',
    'SUSTAINABLE_AGRICULTURE',
    'Agriculture and sustainable farming assistance.',
    ['Farm development', 'Technical support'],
    'Department of Agriculture, Mizoram'
  ),

  stateScheme(
    'nl-001',
    'Nagaland',
    'NL',
    'Nagaland Organic Agriculture Support',
    'ORGANIC_FARMING',
    'Promotes organic and sustainable farming practices.',
    ['Organic farming', 'Training', 'Market linkage'],
    'Department of Agriculture, Nagaland'
  ),

  stateScheme(
    'tr-001',
    'Tripura',
    'TR',
    'Tripura Horticulture Development',
    'HORTICULTURE',
    'Support for horticultural crops and plantations.',
    ['Planting material', 'Horticulture development'],
    'Department of Agriculture, Tripura'
  ),

  stateScheme(
    'py-001',
    'Puducherry',
    'PY',
    'Puducherry Agricultural Input Support',
    'SEEDS_INPUTS',
    'Agricultural input assistance through eligible schemes.',
    ['Input support', 'Seeds', 'Technical assistance'],
    'Department of Agriculture, Puducherry'
  ),

  stateScheme(
    'jk-001',
    'Jammu & Kashmir',
    'JK',
    'Jammu & Kashmir Horticulture Development',
    'HORTICULTURE',
    'Supports orchard and horticulture development.',
    ['Planting material', 'Orchard development', 'Post-harvest support'],
    'Department of Horticulture, Jammu & Kashmir'
  ),

  stateScheme(
    'la-001',
    'Ladakh',
    'LA',
    'Ladakh High-Altitude Agriculture Support',
    'SUSTAINABLE_AGRICULTURE',
    'Agricultural support adapted to high-altitude farming conditions.',
    ['Protected cultivation', 'Water management', 'Technical support'],
    'Agriculture Department, Ladakh'
  ),

  stateScheme(
    'an-001',
    'Andaman & Nicobar Islands',
    'AN',
    'Andaman & Nicobar Agriculture Development',
    'HORTICULTURE',
    'Support for island agriculture and horticultural development.',
    ['Planting material', 'Farm development', 'Technical support'],
    'Department of Agriculture, Andaman & Nicobar Islands'
  ),

  stateScheme(
    'ch-001',
    'Chandigarh',
    'CH',
    'Chandigarh Kitchen Garden & Urban Agriculture',
    'HORTICULTURE',
    'Support and awareness for urban and peri-urban cultivation.',
    ['Kitchen gardening', 'Vegetable cultivation', 'Training'],
    'Department of Horticulture, Chandigarh'
  ),

  stateScheme(
    'dl-001',
    'Delhi',
    'DL',
    'Delhi Agricultural Horticulture Support',
    'HORTICULTURE',
    'Support for horticultural activities and urban agriculture.',
    ['Horticulture support', 'Planting material', 'Technical guidance'],
    'Department of Agriculture, Government of NCT of Delhi'
  ),

  stateScheme(
    'ld-001',
    'Lakshadweep',
    'LD',
    'Lakshadweep Coconut and Horticulture Support',
    'HORTICULTURE',
    'Support for island horticulture and plantation activities.',
    ['Plantation development', 'Planting material', 'Technical support'],
    'Agriculture Department, Lakshadweep'
  ),

  stateScheme(
    'dn-001',
    'Dadra & Nagar Haveli and Daman & Diu',
    'DN',
    'Dadra & Nagar Haveli Agriculture Development Support',
    'SEEDS_INPUTS',
    'Agricultural input and development support.',
    ['Input support', 'Farmer assistance', 'Technical support'],
    'Agriculture Department'
  ),
];

/* ============================================================
   ICON / CATEGORY HELPERS
============================================================ */

const getCategoryIcon = (category: SchemeCategory | 'ALL') => {
  switch (category) {
    case 'INCOME_SUPPORT':
      return <Banknote className="w-5 h-5" />;
    case 'CROP_INSURANCE':
      return <ShieldCheck className="w-5 h-5" />;
    case 'IRRIGATION':
      return <Droplets className="w-5 h-5" />;
    case 'FARM_MECHANIZATION':
      return <TractorIcon className="w-5 h-5" />;
    case 'SOIL_HEALTH':
      return <Sprout className="w-5 h-5" />;
    case 'SEEDS_INPUTS':
      return <Wheat className="w-5 h-5" />;
    case 'HORTICULTURE':
      return <TreePine className="w-5 h-5" />;
    case 'ORGANIC_FARMING':
      return <Leaf className="w-5 h-5" />;
    case 'AGRICULTURAL_LOAN':
      return <WalletCards className="w-5 h-5" />;
    case 'MARKETING':
      return <ShoppingBasket className="w-5 h-5" />;
    case 'STORAGE':
      return <Factory className="w-5 h-5" />;
    case 'LIVESTOCK':
      return <Milk className="w-5 h-5" />;
    case 'FISHERIES':
      return <Fish className="w-5 h-5" />;
    case 'FPO':
      return <Users className="w-5 h-5" />;
    case 'PENSION':
      return <HeartHandshake className="w-5 h-5" />;
    case 'WOMEN_FARMERS':
      return <UserRound className="w-5 h-5" />;
    default:
      return <Landmark className="w-5 h-5" />;
  }
};

const getCategoryLabel = (category: SchemeCategory) =>
  CATEGORIES.find((x) => x.value === category)?.label || 'Other';

const getCategoryStyle = (category: SchemeCategory) => {
  switch (category) {
    case 'INCOME_SUPPORT':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case 'CROP_INSURANCE':
      return 'bg-indigo-50 text-indigo-700 border-indigo-100';
    case 'IRRIGATION':
      return 'bg-cyan-50 text-cyan-700 border-cyan-100';
    case 'FARM_MECHANIZATION':
      return 'bg-orange-50 text-orange-700 border-orange-100';
    case 'SOIL_HEALTH':
      return 'bg-lime-50 text-lime-700 border-lime-100';
    case 'SEEDS_INPUTS':
      return 'bg-yellow-50 text-yellow-700 border-yellow-100';
    case 'HORTICULTURE':
      return 'bg-green-50 text-green-700 border-green-100';
    case 'ORGANIC_FARMING':
      return 'bg-teal-50 text-teal-700 border-teal-100';
    case 'AGRICULTURAL_LOAN':
      return 'bg-blue-50 text-blue-700 border-blue-100';
    case 'MARKETING':
      return 'bg-violet-50 text-violet-700 border-violet-100';
    case 'STORAGE':
      return 'bg-slate-50 text-slate-700 border-slate-100';
    case 'LIVESTOCK':
      return 'bg-rose-50 text-rose-700 border-rose-100';
    case 'FISHERIES':
      return 'bg-sky-50 text-sky-700 border-sky-100';
    case 'FPO':
      return 'bg-purple-50 text-purple-700 border-purple-100';
    case 'PENSION':
      return 'bg-pink-50 text-pink-700 border-pink-100';
    default:
      return 'bg-stone-50 text-stone-700 border-stone-100';
  }
};

/* ============================================================
   MAIN PAGE
============================================================ */

export const GovernmentSchemesPage: React.FC = () => {
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('ALL');
  const [selectedCategory, setSelectedCategory] =
    useState<SchemeCategory | 'ALL'>('ALL');

  const [selectedFarmerType, setSelectedFarmerType] =
    useState('All Farmer Types');

  const [activeOnly, setActiveOnly] = useState(false);

  const [selectedScheme, setSelectedScheme] =
    useState<GovernmentScheme | null>(null);

  const [showFilters, setShowFilters] = useState(false);
  const [showFinder, setShowFinder] = useState(false);

  const [finderState, setFinderState] = useState('ALL');
  const [finderCrop, setFinderCrop] = useState('');
  const [finderLand, setFinderLand] = useState('');
  const [finderFarmerType, setFinderFarmerType] =
    useState('All Farmer Types');
  const [finderIrrigation, setFinderIrrigation] = useState('');
  const [finderAge, setFinderAge] = useState('');

  const [applyingId, setApplyingId] = useState<string | null>(null);

  /* ============================================================
     FILTERED SCHEMES
  ============================================================ */

  const filteredSchemes = useMemo(() => {
    const q = search.trim().toLowerCase();

    return SCHEMES.filter((scheme) => {
      const matchesSearch =
        !q ||
        scheme.schemeName.toLowerCase().includes(q) ||
        scheme.description.toLowerCase().includes(q) ||
        scheme.department.toLowerCase().includes(q) ||
        scheme.state.toLowerCase().includes(q) ||
        getCategoryLabel(scheme.category).toLowerCase().includes(q);

      const matchesState =
        selectedState === 'ALL' ||
        scheme.governmentLevel === 'CENTRAL' ||
        scheme.stateCode === selectedState;

      const matchesCategory =
        selectedCategory === 'ALL' ||
        scheme.category === selectedCategory;

      const matchesFarmerType =
        selectedFarmerType === 'All Farmer Types' ||
        scheme.farmerTypes.includes('All Farmers') ||
        scheme.farmerTypes.includes(selectedFarmerType);

      const matchesActive = !activeOnly || scheme.isActive;

      return (
        matchesSearch &&
        matchesState &&
        matchesCategory &&
        matchesFarmerType &&
        matchesActive
      );
    });
  }, [
    search,
    selectedState,
    selectedCategory,
    selectedFarmerType,
    activeOnly,
  ]);

  /* ============================================================
     STATS
  ============================================================ */

  const centralCount = SCHEMES.filter(
    (s) => s.governmentLevel === 'CENTRAL'
  ).length;

  const stateCount = SCHEMES.filter(
    (s) => s.governmentLevel === 'STATE'
  ).length;

  const activeCount = SCHEMES.filter((s) => s.isActive).length;

  const stateCoverage = new Set(
    SCHEMES.filter((s) => s.governmentLevel === 'STATE').map(
      (s) => s.stateCode
    )
  ).size;

  /* ============================================================
     RESET
  ============================================================ */

  const resetFilters = () => {
    setSearch('');
    setSelectedState('ALL');
    setSelectedCategory('ALL');
    setSelectedFarmerType('All Farmer Types');
    setActiveOnly(false);
  };

  /* ============================================================
     APPLY / START APPLICATION
  ============================================================ */

  const handleApply = (scheme: GovernmentScheme) => {
    const portal = getSchemePortal(scheme.id, scheme.stateCode);
    const url = portal?.applicationUrl || scheme.applicationUrl;

    if (!url) {
      alert('The official application portal for this scheme is currently unavailable. Please contact the concerned government agriculture department.');
      return;
    }

    setApplyingId(scheme.id);

    // Open directly from the user click so browser popup blockers are less likely to block it.
    const portalWindow = window.open(url, '_blank', 'noopener,noreferrer');

    if (!portalWindow) {
      alert('Please allow pop-ups for this site to open the official government portal.');
    }

    window.setTimeout(() => setApplyingId(null), 450);
  };

  /* ============================================================
     FINDER SCORE
  ============================================================ */

  const finderResults = useMemo(() => {
    return SCHEMES.map((scheme) => {
      let score = 45;

      if (
        finderState !== 'ALL' &&
        (scheme.governmentLevel === 'CENTRAL' ||
          scheme.stateCode === finderState)
      ) {
        score += 20;
      }

      if (
        finderCrop &&
        scheme.crops.some((crop) =>
          crop.toLowerCase().includes(finderCrop.toLowerCase())
        )
      ) {
        score += 10;
      }

      if (
        finderFarmerType !== 'All Farmer Types' &&
        (scheme.farmerTypes.includes('All Farmers') ||
          scheme.farmerTypes.includes(finderFarmerType))
      ) {
        score += 15;
      }

      if (finderIrrigation && scheme.category === 'IRRIGATION') {
        score += 8;
      }

      if (finderLand && scheme.category !== 'OTHER') {
        score += 2;
      }

      if (finderAge && scheme.category === 'PENSION') {
        score += 8;
      }

      return {
        scheme,
        score: Math.min(score, 99),
      };
    })
      .filter((item) => item.score >= 60)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [
    finderState,
    finderCrop,
    finderLand,
    finderFarmerType,
    finderIrrigation,
    finderAge,
  ]);

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="min-h-screen bg-stone-50 pb-16">
      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-green-900 to-blue-950 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-20 -top-20 w-72 h-72 rounded-full bg-white blur-3xl" />
          <div className="absolute right-0 bottom-0 w-96 h-96 rounded-full bg-emerald-300 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-emerald-100 text-xs font-bold uppercase tracking-wider">
                <Landmark className="w-4 h-4" />
                Government of India & State Schemes
              </div>

              <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
                Government Schemes
                <span className="block text-emerald-300">
                  for Indian Farmers
                </span>
              </h1>

              <p className="mt-4 text-emerald-50/90 text-sm sm:text-base leading-7 max-w-2xl">
                Discover central and state agricultural schemes covering
                income support, crop insurance, irrigation, machinery,
                horticulture, loans, livestock, fisheries, marketing and
                sustainable farming.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  onClick={() => setShowFinder(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-emerald-900 shadow-lg hover:bg-emerald-50 transition"
                >
                  <Sparkles className="w-4 h-4" />
                  Find Schemes For Me
                </button>

                <button
                  onClick={() => {
                    document
                      .getElementById('scheme-list')
                      ?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/15 transition"
                >
                  Explore Schemes
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 min-w-[280px]">
              <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur p-4">
                <div className="text-2xl font-black">{SCHEMES.length}+</div>
                <div className="text-xs text-emerald-100 mt-1">
                  Scheme Records
                </div>
              </div>

              <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur p-4">
                <div className="text-2xl font-black">{stateCoverage}</div>
                <div className="text-xs text-emerald-100 mt-1">
                  State/UT Coverage
                </div>
              </div>

              <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur p-4">
                <div className="text-2xl font-black">{centralCount}</div>
                <div className="text-xs text-emerald-100 mt-1">
                  Central Schemes
                </div>
              </div>

              <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur p-4">
                <div className="text-2xl font-black">{activeCount}</div>
                <div className="text-xs text-emerald-100 mt-1">
                  Currently Active
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          SEARCH + FILTER
      ====================================================== */}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xl p-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search scheme, crop, department, state..."
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-stone-50 border border-stone-200 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 text-sm"
              />
            </div>

            <div className="relative min-w-[190px]">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />

              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="appearance-none w-full pl-9 pr-9 py-3.5 rounded-xl bg-stone-50 border border-stone-200 text-sm font-semibold outline-none focus:border-emerald-500"
              >
                {STATES.map((state) => (
                  <option key={state.code} value={state.code}>
                    {state.name}
                  </option>
                ))}
              </select>

              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
            </div>

            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`inline - flex items - center justify - center gap - 2 px - 5 py - 3 rounded - xl border text - sm font - bold transition ${showFilters
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'bg-white border-stone-200 text-stone-700 hover:border-emerald-400'
                } `}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1.5">
                  Category
                </label>

                <select
                  value={selectedCategory}
                  onChange={(e) =>
                    setSelectedCategory(
                      e.target.value as SchemeCategory | 'ALL'
                    )
                  }
                  className="w-full px-3 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm outline-none"
                >
                  {CATEGORIES.map((category) => (
                    <option
                      key={category.value}
                      value={category.value}
                    >
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1.5">
                  Farmer Type
                </label>

                <select
                  value={selectedFarmerType}
                  onChange={(e) =>
                    setSelectedFarmerType(e.target.value)
                  }
                  className="w-full px-3 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm outline-none"
                >
                  {FARMER_TYPES.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-3 rounded-xl bg-stone-50 border border-stone-200 px-4 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeOnly}
                  onChange={(e) => setActiveOnly(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600"
                />
                <span className="text-sm font-semibold text-stone-700">
                  Show active schemes only
                </span>
              </label>

              <button
                onClick={resetFilters}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-sm font-bold text-stone-700"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ======================================================
          QUICK CATEGORIES
      ====================================================== */}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.slice(1, 11).map((category) => (
            <button
              key={category.value}
              onClick={() =>
                setSelectedCategory(category.value)
              }
              className={`shrink - 0 inline - flex items - center gap - 2 px - 4 py - 2.5 rounded - full border text - xs font - bold transition ${selectedCategory === category.value
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-emerald-300 hover:text-emerald-700'
                } `}
            >
              {getCategoryIcon(category.value)}
              {category.label}
            </button>
          ))}
        </div>
      </section>

      {/* ======================================================
          RESULTS HEADER
      ====================================================== */}

      <section
        id="scheme-list"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900">
              Available Government Schemes
            </h2>

            <p className="text-sm text-stone-500 mt-1">
              Showing {filteredSchemes.length} of {SCHEMES.length} schemes
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-stone-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Data should be verified with the official department before
            application
          </div>
        </div>

        {/* ====================================================
            SCHEME GRID
        ==================================================== */}

        {filteredSchemes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredSchemes.map((scheme) => (
              <article
                key={scheme.id}
                className="group bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-emerald-300 transition-all overflow-hidden flex flex-col"
              >
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`w - 11 h - 11 rounded - xl border flex items - center justify - center shrink - 0 ${getCategoryStyle(
                        scheme.category
                      )
                        } `}
                    >
                      {getCategoryIcon(scheme.category)}
                    </div>

                    <div className="flex flex-wrap justify-end gap-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                        {scheme.governmentLevel}
                      </span>

                      {scheme.isActive ? (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full bg-rose-50 text-rose-700">
                          Closed
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="mt-4 text-lg font-black text-stone-900 leading-snug group-hover:text-emerald-700 transition">
                    {scheme.schemeName}
                  </h3>

                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`inline - flex items - center gap - 1 px - 2 py - 1 rounded - lg border text - [10px] font - bold ${getCategoryStyle(
                        scheme.category
                      )
                        } `}
                    >
                      {getCategoryLabel(scheme.category)}
                    </span>

                    <span className="text-xs text-stone-400">
                      •
                    </span>

                    <span className="text-xs font-semibold text-stone-500">
                      {scheme.state}
                    </span>
                  </div>

                  <p className="mt-4 text-sm text-stone-600 leading-6 line-clamp-3">
                    {scheme.description}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-stone-50 border border-stone-100 p-3">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-stone-400 block">
                        Government
                      </span>
                      <span className="text-sm font-bold text-stone-800 mt-1 block">
                        {scheme.governmentLevel === 'CENTRAL'
                          ? 'Central'
                          : 'State / UT'}
                      </span>
                    </div>

                    <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 block">
                        Benefit
                      </span>
                      <span className="text-sm font-black text-emerald-700 mt-1 block">
                        {scheme.benefitAmount
                          ? `₹${scheme.benefitAmount.toLocaleString()} `
                          : scheme.subsidyPercentage
                            ? `${scheme.subsidyPercentage}% `
                            : 'As applicable'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {scheme.benefits.slice(0, 2).map((benefit, index) => (
                      <div
                        key={`${scheme.id} -benefit - ${index} `}
                        className="flex items-start gap-2 text-xs text-stone-600"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="px-5 py-4 border-t border-stone-100 bg-stone-50/60">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={() => setSelectedScheme(scheme)}
                      className="text-sm font-bold text-stone-700 hover:text-emerald-700 transition"
                    >
                      View Details
                    </button>

                    <button
                      onClick={() => handleApply(scheme)}
                      disabled={applyingId === scheme.id}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-extrabold transition"
                    >
                      {applyingId === scheme.id ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Starting...
                        </>
                      ) : (
                        <>
                          Apply on Government Portal
                          <ExternalLink className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-stone-100 flex items-center justify-center">
              <Search className="w-7 h-7 text-stone-400" />
            </div>

            <h3 className="mt-4 text-lg font-black text-stone-900">
              No schemes found
            </h3>

            <p className="mt-2 text-sm text-stone-500">
              Try changing your state, category or search keywords.
            </p>

            <button
              onClick={resetFilters}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold"
            >
              <RotateCcw className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        )}
      </section>

      {/* ======================================================
          FOOTER INFORMATION
      ====================================================== */}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />

            <div>
              <h3 className="font-black text-blue-900">
                Important application information
              </h3>

              <p className="mt-1 text-sm leading-6 text-blue-800">
                Scheme availability, eligibility, subsidy rates, deadlines
                and application procedures can change. Always verify the
                latest details with the relevant government department or
                official portal before submitting an application.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          SCHEME DETAILS MODAL
      ====================================================== */}

      {selectedScheme && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedScheme(null)}
        >
          <div
            className="w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 bg-white border-b border-stone-100 px-5 sm:px-7 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w - 10 h - 10 rounded - xl border flex items - center justify - center ${getCategoryStyle(
                    selectedScheme.category
                  )
                    } `}
                >
                  {getCategoryIcon(selectedScheme.category)}
                </div>

                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-stone-400">
                    Scheme Details
                  </div>

                  <div className="text-sm font-bold text-stone-900">
                    {selectedScheme.governmentLevel === 'CENTRAL'
                      ? 'Central Government'
                      : selectedScheme.state}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedScheme(null)}
                className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center"
              >
                <X className="w-5 h-5 text-stone-700" />
              </button>
            </div>

            <div className="p-5 sm:p-7">
              <div className="flex flex-wrap gap-2">
                <span
                  className={`px - 3 py - 1.5 rounded - full border text - xs font - bold ${getCategoryStyle(
                    selectedScheme.category
                  )
                    } `}
                >
                  {getCategoryLabel(selectedScheme.category)}
                </span>

                <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                  {selectedScheme.governmentLevel}
                </span>

                {selectedScheme.isActive && (
                  <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Active
                  </span>
                )}
              </div>

              <h2 className="mt-4 text-2xl sm:text-3xl font-black text-stone-900">
                {selectedScheme.schemeName}
              </h2>

              <p className="mt-3 text-sm sm:text-base leading-7 text-stone-600">
                {selectedScheme.description}
              </p>

              {/* BENEFIT CARDS */}

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                  <Banknote className="w-5 h-5 text-emerald-700" />

                  <div className="text-xs text-emerald-800 mt-3">
                    Benefit
                  </div>

                  <div className="text-lg font-black text-emerald-700 mt-1">
                    {selectedScheme.benefitAmount
                      ? `₹${selectedScheme.benefitAmount.toLocaleString()} `
                      : selectedScheme.subsidyPercentage
                        ? `${selectedScheme.subsidyPercentage}% subsidy`
                        : 'As applicable'}
                  </div>
                </div>

                <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
                  <MapPin className="w-5 h-5 text-blue-700" />

                  <div className="text-xs text-blue-800 mt-3">
                    Coverage
                  </div>

                  <div className="text-lg font-black text-blue-700 mt-1">
                    {selectedScheme.state}
                  </div>
                </div>

                <div className="rounded-2xl bg-violet-50 border border-violet-100 p-4">
                  <Building2 className="w-5 h-5 text-violet-700" />

                  <div className="text-xs text-violet-800 mt-3">
                    Department
                  </div>

                  <div className="text-sm font-black text-violet-700 mt-1 line-clamp-2">
                    {selectedScheme.department}
                  </div>
                </div>
              </div>

              {/* BENEFITS */}

              <div className="mt-7">
                <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                  <BadgeCheck className="w-5 h-5 text-emerald-600" />
                  Benefits
                </h3>

                <div className="mt-3 space-y-2">
                  {selectedScheme.benefits.map((benefit, index) => (
                    <div
                      key={`detail - benefit - ${index} `}
                      className="flex gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span className="text-sm text-stone-700">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ELIGIBILITY */}

              <div className="mt-7">
                <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Eligibility
                </h3>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedScheme.eligibility.map((item, index) => (
                    <div
                      key={`eligibility - ${index} `}
                      className="flex gap-3 p-3 rounded-xl border border-stone-100 bg-white"
                    >
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-stone-700">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* DOCUMENTS */}

              <div className="mt-7">
                <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-600" />
                  Commonly Required Documents
                </h3>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedScheme.requiredDocuments.map(
                    (document, index) => (
                      <div
                        key={`document - ${index} `}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl bg-orange-50 border border-orange-100"
                      >
                        <FileText className="w-4 h-4 text-orange-600" />
                        <span className="text-sm text-orange-900">
                          {document}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* APPLICATION */}

              <div className="mt-7 rounded-2xl border border-stone-200 bg-stone-50 p-5">
                <h3 className="text-lg font-black text-stone-900">
                  Application Information
                </h3>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-stone-400 font-bold uppercase tracking-wider">
                      Application Mode
                    </div>

                    <div className="mt-1 text-sm font-bold text-stone-800">
                      {selectedScheme.applicationMode.replace(
                        /_/g,
                        ' '
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-stone-400 font-bold uppercase tracking-wider">
                      Last Verified
                    </div>

                    <div className="mt-1 text-sm font-bold text-stone-800 flex items-center gap-1.5">
                      <CalendarDays className="w-4 h-4" />
                      {selectedScheme.lastVerified}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-stone-400 font-bold uppercase tracking-wider">
                      Department
                    </div>

                    <div className="mt-1 text-sm font-bold text-stone-800">
                      {selectedScheme.department}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-stone-400 font-bold uppercase tracking-wider">
                      Farmer Type
                    </div>

                    <div className="mt-1 text-sm font-bold text-stone-800">
                      {selectedScheme.farmerTypes.join(', ')}
                    </div>
                  </div>
                </div>
              </div>

              {getSchemePortal(selectedScheme.id, selectedScheme.stateCode) && (
                <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-700 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-emerald-700">
                        Official application destination
                      </p>
                      <p className="mt-1 text-sm font-bold text-emerald-950">
                        {getSchemePortal(selectedScheme.id, selectedScheme.stateCode)?.portalName}
                      </p>
                      <p className="mt-1 text-xs text-emerald-800">
                        Apply will open the official government portal in a new tab.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ACTIONS */}

              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleApply(selectedScheme)}
                  disabled={applyingId === selectedScheme.id}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-extrabold"
                >
                  {applyingId === selectedScheme.id ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Starting Application...
                    </>
                  ) : (
                    <>
                      Apply on Government Portal
                      <ExternalLink className="w-4 h-4" />
                    </>
                  )}
                </button>

                {(selectedScheme.officialSourceUrl || selectedScheme.applicationUrl) && (
                  <button
                    onClick={() =>
                      window.open(
                        selectedScheme.officialSourceUrl || selectedScheme.applicationUrl,
                        '_blank',
                        'noopener,noreferrer'
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 font-bold"
                  >
                    Official Source
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="mt-4 flex items-start gap-2 text-xs text-stone-500">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Do not share passwords, OTPs, full Aadhaar numbers or
                  banking PINs with this application. Use only authorized
                  government channels for sensitive verification.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          FIND SCHEMES FOR ME MODAL
      ====================================================== */}

      {showFinder && (
        <div
          className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowFinder(false)}
        >
          <div
            className="w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-20 bg-white border-b border-stone-100 px-5 sm:px-7 py-4 flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-2 text-emerald-700 text-xs font-black uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  Smart Scheme Finder
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
                  Find Schemes For Me
                </h2>
              </div>

              <button
                onClick={() => setShowFinder(false)}
                className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-7">
              <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-emerald-700 mt-0.5" />

                  <p className="text-sm text-emerald-900 leading-6">
                    Enter your basic farming information. The system will
                    rank schemes that appear more relevant to your profile.
                    Final eligibility must always be confirmed against the
                    official scheme rules.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">
                    State
                  </label>

                  <select
                    value={finderState}
                    onChange={(e) =>
                      setFinderState(e.target.value)
                    }
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white outline-none focus:border-emerald-500"
                  >
                    {STATES.map((state) => (
                      <option key={state.code} value={state.code}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">
                    Farmer Type
                  </label>

                  <select
                    value={finderFarmerType}
                    onChange={(e) =>
                      setFinderFarmerType(e.target.value)
                    }
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white outline-none focus:border-emerald-500"
                  >
                    {FARMER_TYPES.map((type) => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">
                    Main Crop
                  </label>

                  <input
                    value={finderCrop}
                    onChange={(e) =>
                      setFinderCrop(e.target.value)
                    }
                    placeholder="e.g. Rice, Ragi, Wheat"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">
                    Land Holding
                  </label>

                  <input
                    value={finderLand}
                    onChange={(e) =>
                      setFinderLand(e.target.value)
                    }
                    placeholder="e.g. 2 acres"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">
                    Irrigation
                  </label>

                  <select
                    value={finderIrrigation}
                    onChange={(e) =>
                      setFinderIrrigation(e.target.value)
                    }
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white outline-none focus:border-emerald-500"
                  >
                    <option value="">Select</option>
                    <option value="rainfed">Rainfed</option>
                    <option value="borewell">Borewell</option>
                    <option value="canal">Canal</option>
                    <option value="drip">Drip</option>
                    <option value="sprinkler">Sprinkler</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">
                    Age
                  </label>

                  <input
                    value={finderAge}
                    onChange={(e) => setFinderAge(e.target.value)}
                    type="number"
                    min="18"
                    placeholder="e.g. 42"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="mt-7">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-lg font-black text-stone-900">
                      Recommended Schemes
                    </h3>

                    <p className="text-xs text-stone-500 mt-1">
                      Ranked by profile matching
                    </p>
                  </div>

                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
                    {finderResults.length} matches
                  </span>
                </div>

                {finderResults.length > 0 ? (
                  <div className="space-y-3">
                    {finderResults.map(({ scheme, score }) => (
                      <button
                        key={scheme.id}
                        onClick={() => {
                          setShowFinder(false);
                          setSelectedScheme(scheme);
                        }}
                        className="w-full text-left p-4 rounded-2xl border border-stone-200 hover:border-emerald-400 hover:bg-emerald-50/30 transition"
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${getCategoryStyle(
                              scheme.category
                            )} `}
                          >
                            {getCategoryIcon(scheme.category)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                              <div>
                                <h4 className="font-black text-stone-900">
                                  {scheme.schemeName}
                                </h4>

                                <div className="text-xs text-stone-500 mt-1">
                                  {scheme.governmentLevel === 'CENTRAL'
                                    ? 'Central Government'
                                    : scheme.state}{' '}
                                  • {getCategoryLabel(scheme.category)}
                                </div>
                              </div>

                              <div className="shrink-0">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-black">
                                  {score}% match
                                </span>
                              </div>
                            </div>

                            <p className="mt-2 text-xs sm:text-sm text-stone-600 line-clamp-2">
                              {scheme.description}
                            </p>
                          </div>

                          <ArrowRight className="w-5 h-5 text-stone-300 shrink-0 mt-2" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 rounded-2xl bg-stone-50 border border-stone-200">
                    <Info className="w-8 h-8 mx-auto text-stone-400" />

                    <p className="mt-3 text-sm font-bold text-stone-700">
                      Enter more information to find matching schemes.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};