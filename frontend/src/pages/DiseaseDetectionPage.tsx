import React, { useEffect, useRef, useState } from 'react';
import {
  UploadCloud,
  Camera,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  UserCheck,
  Info,
  BrainCircuit,
  Leaf,
  RefreshCw,
  X,
  CircleHelp,
} from 'lucide-react';

import { useLanguage } from '../i18n/LanguageContext.tsx';
import { DiseaseDetectionResult } from '../types/index.ts';
import { api } from '../services/api.ts';

/* =========================================================
   CROP / VARIETY DATA
   ========================================================= */

const CROP_VARIETIES: Record<string, string[]> = {
  Rice: [
    'IR-8',
    'IR-20',
    'IR-36',
    'IR-64',
    'IR-72',
    'Swarna',
    'Swarna Sub1',
    'Samba Mahsuri',
    'Jaya',
    'Ratna',
    'MTU-1010',
    'MTU-7029',
    'MTU-1001',
    'BPT-5204',
    'Naveen',
    'NDR-97',
    'NDR-359',
    'Sahbhagi Dhan',
    'DRR Dhan 42',
    'DRR Dhan 44',
    'DRR Dhan 45',
    'DRR Dhan 46',
    'DRR Dhan 47',
    'DRR Dhan 48',
    'CR Dhan 101',
    'CR Dhan 102',
    'CR Dhan 103',
    'CR Dhan 104',
    'CR Dhan 105',
    'Pusa Basmati 1121',
    'Pusa Basmati 1509',
    'Pusa Basmati 1718',
    'Pusa Basmati 1847',
    'Pusa Basmati 1885',
    'Pusa Basmati 1979',
    'CSR 30',
    'Azad Basmati',
    'Kala Namak',
    'Kalanamak Kiran',
    'Gobindobhog',
    'HMT Rice',
    'Katarni',
    'Basmati 370',
    'Pusa Sugandh 3',
    'Pusa Sugandh 4',
    'Pusa Sugandh 5',
  ],

  Wheat: [
    'HD-2967',
    'HD-3086',
    'HD-3226',
    'HD-3410',
    'HD-3406',
    'HD-2733',
    'HD-2851',
    'HD-3059',
    'HD-3271',
    'HD-3321',
    'DBW-17',
    'DBW-88',
    'DBW-90',
    'DBW-187',
    'DBW-222',
    'DBW-303',
    'DBW-371',
    'DBW-372',
    'PBW-343',
    'PBW-550',
    'PBW-725',
    'PBW-824',
    'PBW-826',
    'PBW-752',
    'WH-1105',
    'WH-1124',
    'WH-1184',
    'WH-1270',
    'KRL-1-4',
    'KRL-19',
    'KRL-283',
    'VL-804',
    'VL-907',
    'VL-967',
    'VL-953',
    'HS-542',
    'Golden Halna',
  ],

  Maize: [
    'DeKalb 9108',
    'Pusa Vivek QPM 9 Improved',
    'DMRH-1308',
    'Pusa HM4',
    'HQPM-1',
    'HQPM-5',
    'HQPM-7',
    'HQPM-9',
    'Vivek Hybrid 9',
    'Vivek Hybrid 27',
    'PMH-1',
    'PMH-3',
    'PMH-4',
    'PMH-5',
    'Ganga Safed-2',
    'Kanchan',
    'Prakash',
    'Shaktiman-1',
    'Shaktiman-2',
    'Shaktiman-3',
    'Shaktiman-4',
    'Megha Maize 1',
    'Megha Maize 2',
  ],

  Sorghum: [
    'CSH-1',
    'CSH-5',
    'CSH-9',
    'CSH-14',
    'CSH-16',
    'CSH-17',
    'CSH-18',
    'CSV-15',
    'CSV-17',
    'CSV-20',
    'CSV-21',
    'CSV-23',
    'Maldandi',
    'Parbhani Moti',
  ],

  'Pearl Millet': [
    'HHB-67 Improved',
    'HHB-67',
    'HHB-1467',
    'HHB-1972',
    'HHB-299',
    'ICMH-356',
    'ICTP-8203',
    'GHB-558',
    'GHB-732',
    'GHB-744',
    'RHB-173',
    'RHB-177',
  ],

  'Finger Millet': [
    'GPU-28',
    'GPU-45',
    'GPU-48',
    'MR-1',
    'MR-6',
    'VL-149',
    'VL-315',
    'Indaf-5',
    'Indaf-8',
    'KMR-301',
  ],

  Barley: [
    'RD-2035',
    'RD-2552',
    'RD-2668',
    'DWRUB-52',
    'DWRB-92',
    'DWRB-101',
    'BH-902',
    'BH-946',
  ],

  Chickpea: [
    'JG-11',
    'JG-14',
    'JG-16',
    'JG-315',
    'JG-130',
    'JG-218',
    'JG-74',
    'Pusa 372',
    'Pusa 391',
    'Pusa 362',
    'Pusa 5023',
    'Pusa 1103',
    'BG-256',
    'BG-362',
    'BG-400',
    'BG-5',
    'Vijay',
    'Vishal',
    'KAK-2',
  ],

  'Pigeon Pea': [
    'Asha',
    'Maruti',
    'BDN-2',
    'BDN-711',
    'BSMR-736',
    'BSMR-853',
    'ICPL-87',
    'ICPL-88039',
    'ICPL-87119',
    'PRG-176',
    'WRGE-4',
  ],

  'Green Gram': [
    'Pusa Vishal',
    'Pusa Ratna',
    'Pusa 9531',
    'Pusa Baisakhi',
    'SML-668',
    'SML-832',
    'IPM-02-3',
    'IPM-02-14',
    'IPM-205-7',
    'Meha',
    'Tripura Moong',
  ],

  'Black Gram': [
    'PU-31',
    'PU-35',
    'PU-40',
    'LBG-20',
    'LBG-752',
    'VBN-1',
    'VBN-2',
    'VBN-3',
    'VBN-4',
    'T-9',
    'Uttara',
    'Tripura Mashkolai',
  ],

  Lentil: [
    'PL-406',
    'PL-639',
    'PL-7',
    'IPL-316',
    'IPL-321',
    'Pusa Vaibhav',
    'Pusa Masoor-5',
    'KLS-218',
  ],

  'Field Pea': [
    'Rachna',
    'Aparna',
    'HFP-4',
    'HFP-529',
    'KPMR-522',
    'IPFD-10-12',
    'TRCP-9',
  ],

  Groundnut: [
    'JL-24',
    'TAG-24',
    'TG-37A',
    'GG-2',
    'GG-5',
    'GG-7',
    'GG-20',
    'GJG-9',
    'TMV-2',
    'TMV-7',
    'Kadiri-6',
    'Kadiri-9',
    'Dharani',
    'K-6',
    'ICGV-91114',
  ],

  Soybean: [
    'JS-335',
    'JS-9305',
    'JS-9560',
    'JS-9752',
    'JS-2098',
    'JS-20-29',
    'JS-20-34',
    'JS-20-69',
    'MAUS-71',
    'MAUS-81',
    'MAUS-158',
    'NRC-37',
    'NRC-86',
    'NRC-127',
    'Umiam Soybean 1',
  ],

  Mustard: [
    'Pusa Bold',
    'Pusa Jai Kisan',
    'Pusa Mustard 21',
    'Pusa Mustard 25',
    'Pusa Mustard 26',
    'Pusa Mustard 27',
    'Pusa Mustard 28',
    'Pusa Mustard 29',
    'Varuna',
    'Kranti',
    'Pusa Karishma',
    'Giriraj',
    'NRCHB-506',
    'RH-30',
    'RH-749',
    'RGN-48',
  ],

  Sunflower: [
    'KBSH-1',
    'KBSH-44',
    'KBSH-53',
    'KBSH-78',
    'DRSF-108',
    'DRSH-1',
    'Morden',
    'EC-68414',
  ],

  Sesame: [
    'TKG-22',
    'RT-46',
    'RT-54',
    'RT-125',
    'T-78',
    'Gujarat Til-2',
    'Gujarat Til-3',
    'Phule Til-1',
    'JLT-7',
  ],

  Safflower: [
    'A-1',
    'A-2',
    'A-300',
    'Bhima',
    'Phule Kusuma',
    'NARI-6',
    'NARI-H-15',
    'DSH-185',
  ],

  Cotton: [
    'Bt RCH-2',
    'Bt RCH-134',
    'Bt RCH-138',
    'Bt RCH-659',
    'Bunny Bt',
    'Brahma Bt',
    'Mallika Bt',
    'NCS-145',
    'NCS-207',
    'H-4',
    'H-6',
    'LRA-5166',
    'DCH-32',
    'DHH-11',
  ],

  Sugarcane: [
    'Co-0238',
    'Co-0118',
    'Co-86032',
    'Co-99004',
    'Co-8014',
    'Co-92005',
    'Co-0239',
    'Co-05011',
    'Co-0218',
    'Co-06022',
    'CoC-671',
    'CoJ-64',
  ],

  Tomato: [
    'Arka Rakshak',
    'Arka Samrat',
    'Arka Abha',
    'Arka Vikas',
    'Arka Saurabh',
    'Arka Meghali',
    'Pusa Ruby',
    'Pusa Hybrid-4',
    'Pusa Hybrid-8',
    'Pusa Rohini',
    'Pusa Early Dwarf',
    'Punjab Kesari',
    'Pant Bahar',
    'Azad T-6',
    'Kashi Anupam',
    'Kashi Vishesh',
    'Kashi Aman',
    'Kashi Adarsh',
  ],

  Potato: [
    'Kufri Jyoti',
    'Kufri Bahar',
    'Kufri Chandramukhi',
    'Kufri Ashoka',
    'Kufri Pukhraj',
    'Kufri Surya',
    'Kufri Badshah',
    'Kufri Sindhuri',
    'Kufri Chipsona-1',
    'Kufri Chipsona-2',
    'Kufri Chipsona-3',
    'Kufri Ratan',
    'Kufri Tejas',
    'Kufri Chipbharat-1',
    'Kufri Chipbharat-2',
    'Kufri FryoM',
  ],

  Chilli: [
    'Guntur S17',
    'Byadgi',
    'Byadgi Kaddi',
    'Pusa Jwala',
    'Pusa Sadabahar',
    'Kashi Anmol',
    'Kashi Early',
    'Kashi Surkh',
    'Arka Lohit',
    'Arka Meghana',
    'Arka Harita',
    'Pant C-1',
    'Pant C-2',
    'LCA-235',
  ],

  Brinjal: [
    'Pusa Purple Long',
    'Pusa Purple Cluster',
    'Pusa Hybrid-5',
    'Arka Neelkanth',
    'Arka Keshav',
    'Arka Nidhi',
    'Arka Kusumakar',
    'Pant Samrat',
    'Punjab Sadabahar',
    'Kashi Taru',
    'Kashi Sandesh',
    'Goa Brinjal 1',
    'Goa Brinjal 2',
    'Goa Brinjal 3',
  ],

  Okra: [
    'Arka Anamika',
    'Arka Abhay',
    'Pusa Sawani',
    'Pusa A-4',
    'Parbhani Kranti',
    'Punjab-7',
    'Varsha Uphar',
    'Kashi Pragati',
    'Kashi Kranti',
    'Kashi Satdhari',
    'Goa Bhendi 1',
  ],

  Onion: [
    'Bhima Kiran',
    'Bhima Shakti',
    'Bhima Super',
    'Bhima Red',
    'Bhima Dark Red',
    'Pusa Red',
    'Pusa Ratnar',
    'Pusa Madhavi',
    'N-53',
    'Agrifound Dark Red',
    'Agrifound Light Red',
    'Agrifound White',
  ],

  Cabbage: [
    'Pusa Drum Head',
    'Pusa Mukta',
    'Pusa Hybrid-1',
    'Pusa Hybrid-3',
    'Golden Acre',
    'September Early',
    'Kranti',
  ],

  Cauliflower: [
    'Pusa Deepali',
    'Pusa Snowball K-1',
    'Pusa Snowball-1',
    'Pusa Snowball-16',
    'Pusa Meghna',
    'Pusa Himjyoti',
    'Pusa Sharad',
    'Early Kunwari',
  ],

  Carrot: [
    'Pusa Kesar',
    'Pusa Rudhira',
    'Pusa Meghali',
    'New Kuroda',
    'Punjab Black Beauty',
    'Hisar Gairic',
  ],

  Radish: [
    'Pusa Chetki',
    'Pusa Reshmi',
    'Pusa Desi',
    'Japanese White',
    'Punjab Safed',
  ],

  Cucumber: [
    'Pusa Uday',
    'Pusa Barkha',
    'Pusa Hybrid Cucumber-1',
    'Pant Khira-1',
    'Arka Sheetal',
    'Kashi Aishwarya',
  ],

  'Bottle Gourd': [
    'Pusa Naveen',
    'Pusa Summer Prolific Long',
    'Pusa Meghdoot',
    'Pusa Hybrid-3',
    'Arka Bahar',
    'Kashi Ganga',
  ],

  'Bitter Gourd': [
    'Pusa Do Mausami',
    'Pusa Vishesh',
    'Arka Harit',
    'Priya',
    'Kashi Mayuri',
  ],

  'Ridge Gourd': [
    'Pusa Nasdar',
    'Arka Sujat',
    'Co-1',
    'Kashi Shivani',
  ],

  Pumpkin: [
    'Pusa Vishwas',
    'Pusa Hybrid-6',
    'Arka Chandan',
    'Arka Suryamukhi',
    'Kashi Harit',
  ],

  'French Bean': [
    'Arka Komal',
    'Arka Suvidha',
    'Contender',
    'Pusa Parvati',
    'Pant Anupama',
  ],

  Watermelon: [
    'Arka Manik',
    'Sugar Baby',
    'Asahi Yamato',
    'Pusa Bedana',
    'Pusa Rasbhari',
    'Kashi Madhu',
  ],

  Muskmelon: [
    'Pusa Madhuras',
    'Pusa Sharbati',
    'Hara Madhu',
    'Arka Rajhans',
    'Kashi Madhu',
  ],

  Banana: [
    'Grand Naine',
    'Robusta',
    'Dwarf Cavendish',
    'Rasthali',
    'Poovan',
    'Nendran',
    'Monthan',
    'Red Banana',
    'Ney Poovan',
    'Karpuravalli',
  ],

  Mango: [
    'Alphonso',
    'Dashehari',
    'Langra',
    'Kesar',
    'Banganapalli',
    'Totapuri',
    'Amrapali',
    'Mallika',
    'Ratna',
    'Sindhu',
    'Neelam',
    'Chausa',
    'Himsagar',
    'Raspuri',
  ],

  Guava: [
    'Allahabad Safeda',
    'Lucknow-49',
    'Lalit',
    'Shweta',
    'Arka Mridula',
    'Arka Amulya',
    'Megha Supreme',
    'Megha Magenta',
    'Megha Seedless',
    'Megha Wonder',
  ],

  Papaya: [
    'Pusa Delicious',
    'Pusa Dwarf',
    'Pusa Nanha',
    'Arka Prabhath',
    'Arka Surya',
    'CO-2',
    'CO-7',
    'Red Lady',
    'Tripura Papita',
  ],

  Pomegranate: [
    'Bhagwa',
    'Ganesh',
    'Arakta',
    'Mridula',
    'Ruby',
    'G-137',
  ],

  Grapes: [
    'Thompson Seedless',
    'Sonaka',
    'Tas-A-Ganesh',
    'Sharad Seedless',
    'Flame Seedless',
    'Manik Chaman',
    'Anab-e-Shahi',
  ],

  Orange: [
    'Nagpur Mandarin',
    'Kinnow',
    'Coorg Mandarin',
    'Mosambi',
    'Valencia',
    'Blood Red',
  ],

  Lemon: [
    'Kagzi Lime',
    'Pant Lemon-1',
    'Pramalini',
    'Vikram',
    'Sai Sharbati',
  ],

  Coconut: [
    'West Coast Tall',
    'East Coast Tall',
    'Chowghat Orange Dwarf',
    'Chowghat Green Dwarf',
    'Chandra Kalpa',
    'Kalpa Sree',
    'Kalpa Dhenu',
  ],

  Turmeric: [
    'IISR Prathibha',
    'IISR Alleppey Supreme',
    'IISR Kedaram',
    'IISR Megha',
    'Suguna',
    'Suvarna',
    'Prabha',
    'Rajendra Sonia',
    'Megha Turmeric 1',
  ],

  Ginger: [
    'IISR Rejatha',
    'IISR Mahima',
    'IISR Varada',
    'Nadia',
    'Rio-de-Janeiro',
    'Maran',
    'Himachal',
  ],

  Cardamom: [
    'IISR Vijetha',
    'IISR Avinash',
    'IISR Kaveri',
    'PV-1',
    'Njallani',
  ],

  Coriander: [
    'CO-1',
    'CO-2',
    'CO-3',
    'Gujarat Coriander-1',
    'Gujarat Coriander-2',
    'RCR-41',
    'Pant Haritma',
  ],

  Cumin: [
    'GC-1',
    'GC-2',
    'GC-3',
    'RZ-19',
    'RZ-209',
    'Gujarat Cumin-4',
  ],

  Fenugreek: [
    'Pusa Early Bunching',
    'Pusa Kasuri',
    'CO-1',
    'Rajendra Kranti',
    'RMT-1',
    'RMT-143',
  ],

  'Black Pepper': [
    'Panniyur-1',
    'Panniyur-2',
    'Panniyur-3',
    'Panniyur-4',
    'Panniyur-5',
    'Panniyur-6',
    'Panniyur-7',
    'IISR Malabar Excel',
  ],

  Coffee: [
    'S.795',
    'Sln.9',
    'Cauvery',
    'Chandragiri',
    'Selection-3',
  ],

  Tea: [
    'TV-1',
    'TV-2',
    'TV-9',
    'TV-20',
    'TV-23',
    'TV-25',
  ],

  'Fodder Maize': [
    'African Tall',
    'J-1006',
  ],

  'Fodder Sorghum': [
    'COFS-29',
    'CSH-24MF',
  ],

  'Fodder Bajra': [
    'Giant Bajra',
  ],

  Fodder: [
    'Napier CO-3',
    'Napier CO-4',
    'Super Napier',
  ],

  Amaranth: [
    'Pusa Lal Chaulai',
    'Pusa Kiran',
  ],

  Quinoa: [
    'KVL-Q-1',
    'EC-507747',
  ],

  Buckwheat: [
    'VL-7',
    'Himpriya',
  ],

  'Little Millet': [
    'OLM-203',
    'JK-8',
  ],

  'Kodo Millet': [
    'JK-41',
    'GPUK-3',
  ],

  'Barnyard Millet': [
    'VL-172',
    'VL-207',
  ],
};

const cropNames = Object.keys(CROP_VARIETIES);

/* =========================================================
   COMPONENT
   ========================================================= */

export const DiseaseDetectionPage: React.FC = () => {
  const { t } = useLanguage();

  /*
   * IMPORTANT:
   * We store the complete value as:
   * Crop|Variety
   *
   * Example:
   * Tomato|Arka Rakshak
   */
  const [selectedCrop, setSelectedCrop] =
    useState<string>('Tomato|Arka Rakshak');

  const [imagePreview, setImagePreview] =
    useState<string | null>(null);

  const [analyzing, setAnalyzing] =
    useState(false);

  const [result, setResult] =
    useState<DiseaseDetectionResult | null>(null);

  const [errorMsg, setErrorMsg] =
    useState<string | null>(null);

  const [cameraOpen, setCameraOpen] =
    useState(false);

  const [cameraError, setCameraError] =
    useState<string | null>(null);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const videoRef =
    useRef<HTMLVideoElement>(null);

  const cameraStreamRef =
    useRef<MediaStream | null>(null);

  const lastSelectedFileRef =
    useRef<File | null>(null);

  /* =========================================================
     IMAGE SELECTION
     ========================================================= */

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    /*
     * Basic image validation
     */
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg('Image size must be less than 25 MB.');
      return;
    }

    /*
     * IMPORTANT:
     * Do NOT run inference here.
     *
     * User must click "Run Disease Detection".
     */
    lastSelectedFileRef.current = file;

    setImagePreview(URL.createObjectURL(file));

    /*
     * Remove old diagnosis because a new image
     * has been selected.
     */
    setResult(null);
    setErrorMsg(null);
  };

  /* =========================================================
     CAMERA
     ========================================================= */

  const closeCamera = () => {
    cameraStreamRef.current
      ?.getTracks()
      .forEach(track => track.stop());

    cameraStreamRef.current = null;

    setCameraOpen(false);
    setCameraError(null);
  };

  const openCamera = async () => {
    setCameraError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        'Camera access is not supported in this browser. Please use Upload Photo.'
      );

      setCameraOpen(true);
      return;
    }

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: {
              ideal: 'environment',
            },
            width: {
              ideal: 1920,
            },
            height: {
              ideal: 1080,
            },
          },
          audio: false,
        });

      cameraStreamRef.current = stream;

      setCameraOpen(true);

      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      });
    } catch {
      setCameraError(
        'Camera permission was not granted. Allow camera access or use Upload Photo instead.'
      );

      setCameraOpen(true);
    }
  };

  const captureCameraImage = () => {
    const video = videoRef.current;

    if (
      !video ||
      video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
      return;
    }

    const canvas =
      document.createElement('canvas');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context =
      canvas.getContext('2d');

    if (!context) return;

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      blob => {
        if (!blob) return;

        const file = new File(
          [blob],
          'leaf_capture.jpg',
          {
            type: 'image/jpeg',
          }
        );

        lastSelectedFileRef.current = file;

        setImagePreview(
          URL.createObjectURL(file)
        );

        /*
         * Camera only captures.
         *
         * It DOES NOT diagnose automatically.
         */
        setResult(null);
        setErrorMsg(null);

        closeCamera();
      },
      'image/jpeg',
      0.92
    );
  };

  /* =========================================================
     RUN DISEASE DETECTION
     ========================================================= */

  const runInference = async () => {
    const file =
      lastSelectedFileRef.current;

    if (!file) {
      setErrorMsg(
        'Please upload or capture a crop leaf image first.'
      );

      return;
    }

    setAnalyzing(true);
    setResult(null);
    setErrorMsg(null);

    try {
      /*
       * selectedCrop is:
       * Crop|Variety
       *
       * Your backend can receive the complete value.
       */
      const diagnosis =
        await api.uploadDiseaseImage(
          file,
          selectedCrop
        );

      setResult(diagnosis);
    } catch (err: any) {
      setErrorMsg(
        err?.message ||
        'Failed to process the leaf image. Please try again.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  /* =========================================================
     RESET
     ========================================================= */

  const resetScanner = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview(null);
    setResult(null);
    setErrorMsg(null);

    lastSelectedFileRef.current = null;

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /* =========================================================
     CLEANUP
     ========================================================= */

  useEffect(() => {
    return () => {
      cameraStreamRef.current
        ?.getTracks()
        .forEach(track => track.stop());

      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  /* =========================================================
     RESULT STATES
     ========================================================= */

  const isLowConfidence =
    result &&
    (
      result.confidence < 0.6 ||
      result.disease
        .toLowerCase()
        .includes('inconclusive')
    );

  /*
   * Crop and variety for display.
   */
  const [cropName, varietyName] =
    selectedCrop.split('|');

  /* =========================================================
     JSX
     ========================================================= */

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-14 px-2 sm:px-0">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/50 to-lime-50/60 p-6 sm:p-7">

        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-100/50 blur-3xl" />

        <div className="relative">

          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700 mb-2">
            <Sparkles className="w-4 h-4" />
            Computer Vision Disease Detection
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            AI Crop Disease Diagnosis
          </h1>

          <p className="text-sm text-stone-600 mt-2 max-w-3xl leading-relaxed">
            Upload or photograph an infected crop leaf.
            AgriGo AI analyzes visible symptoms and provides
            an AI-assisted disease prediction with recommended
            Integrated Pest Management guidance.
          </p>

          <div className="flex flex-wrap gap-2 mt-4">

            <div className="inline-flex items-center gap-1.5 rounded-full bg-white border border-stone-200 px-3 py-1.5 text-[11px] font-semibold text-stone-600">
              <BrainCircuit className="w-3.5 h-3.5 text-emerald-600" />
              AI Vision Analysis
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-white border border-stone-200 px-3 py-1.5 text-[11px] font-semibold text-stone-600">
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              Crop-Aware Detection
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-white border border-stone-200 px-3 py-1.5 text-[11px] font-semibold text-stone-600">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              IPM Guidance
            </div>

          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN GRID
          ===================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ===================================================
            LEFT PANEL
            =================================================== */}

        <div className="lg:col-span-5">

          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5 space-y-5">

            {/* Crop selector */}

            <div>

              <label className="block text-[11px] font-black text-stone-700 uppercase tracking-wider mb-2">
                Crop & Variety
              </label>

              <select
                value={selectedCrop}
                onChange={e => {
                  setSelectedCrop(e.target.value);

                  /*
                   * Changing crop means the previous diagnosis
                   * should not remain visible.
                   */
                  setResult(null);
                  setErrorMsg(null);
                }}
                disabled={analyzing}
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-sm text-stone-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:opacity-60"
              >

                <option value="Other|Auto-Detect">
                  Auto-Detect Any Crop
                </option>

                {cropNames.map(crop => (

                  <optgroup
                    key={crop}
                    label={crop}
                  >

                    {CROP_VARIETIES[crop].map(
                      variety => (

                        <option
                          key={`${crop}|${variety}`}
                          value={`${crop}|${variety}`}
                        >
                          {crop} — {variety}
                        </option>

                      )
                    )}

                  </optgroup>

                ))}

              </select>

              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-stone-500">
                <CircleHelp className="w-3 h-3" />

                Selected:
                <strong className="text-stone-700">
                  {cropName}
                  {varietyName &&
                    varietyName !== 'Auto-Detect' &&
                    ` • ${varietyName}`}
                </strong>
              </div>

            </div>

            {/* =================================================
                IMAGE PREVIEW / UPLOAD
                ================================================= */}

            <div
              onClick={() =>
                !analyzing &&
                fileInputRef.current?.click()
              }
              className={`relative overflow-hidden border-2 border-dashed rounded-3xl min-h-[270px] flex items-center justify-center text-center cursor-pointer transition-all ${
                imagePreview
                  ? 'border-emerald-400 bg-emerald-50/30'
                  : 'border-stone-300 bg-stone-50/50 hover:border-emerald-400 hover:bg-emerald-50/30'
              }`}
            >

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleFileUpload}
                className="hidden"
              />

              {imagePreview ? (

                <div className="w-full p-4">

                  <div className="relative">

                    <img
                      src={imagePreview}
                      alt="Selected crop leaf"
                      className="mx-auto max-h-[230px] max-w-full rounded-2xl object-contain border border-stone-200 shadow-sm bg-white"
                    />

                    {!analyzing && (
                      <div className="absolute right-2 top-2 rounded-xl bg-white/95 backdrop-blur-sm px-3 py-1.5 text-[10px] font-bold text-emerald-700 shadow-sm border border-emerald-100">
                        Click to change
                      </div>
                    )}

                  </div>

                  <div className="flex items-center justify-center gap-2 mt-3">

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1.5 text-[10px] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Leaf image ready
                    </span>

                  </div>

                  <p className="text-[10px] text-stone-500 mt-2">
                    Review the image and click
                    <strong className="text-emerald-700">
                      {' '}Run Disease Detection
                    </strong>
                    {' '}below.
                  </p>

                </div>

              ) : (

                <div className="space-y-4 px-6">

                  <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <UploadCloud className="w-7 h-7" />
                  </div>

                  <div>

                    <p className="text-sm font-black text-stone-900">
                      Upload Leaf Photo
                    </p>

                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      Drag & drop a clear crop leaf image
                      or click to browse.
                    </p>

                  </div>

                  <div className="flex justify-center gap-2 text-[10px] text-stone-400">
                    <span>JPEG</span>
                    <span>•</span>
                    <span>PNG</span>
                    <span>•</span>
                    <span>WEBP</span>
                    <span>•</span>
                    <span>Max 25MB</span>
                  </div>

                </div>

              )}

            </div>

            {/* =================================================
                UPLOAD / CAMERA BUTTONS
                ================================================= */}

            <div className="grid grid-cols-2 gap-2">

              <button
                type="button"
                disabled={analyzing}
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-xs font-black text-stone-700 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-800 transition-all disabled:opacity-50"
              >
                <UploadCloud className="w-4 h-4" />
                Upload Photo
              </button>

              <button
                type="button"
                disabled={analyzing}
                onClick={openCamera}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-4 py-3 text-xs font-black text-white hover:bg-emerald-800 transition-all disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
                Open Camera
              </button>

            </div>

            {/* =================================================
                ERROR
                ================================================= */}

            {errorMsg && (

              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">

                <div className="flex items-start gap-2">

                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />

                  <div>

                    <p className="text-xs font-black text-rose-900">
                      Unable to analyze image
                    </p>

                    <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                      {errorMsg}
                    </p>

                  </div>

                </div>

              </div>

            )}

            {/* =================================================
                ACTION AREA
                ================================================= */}

            {imagePreview && (

              <div className="border-t border-stone-100 pt-4 space-y-2">

                <button
                  type="button"
                  onClick={runInference}
                  disabled={analyzing}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-3.5 text-sm font-black shadow-sm transition-all disabled:bg-stone-300 disabled:cursor-not-allowed"
                >

                  {analyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Analyzing Leaf...
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="w-4 h-4" />
                      Run Disease Detection
                    </>
                  )}

                </button>

                <button
                  type="button"
                  onClick={resetScanner}
                  disabled={analyzing}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold text-stone-500 hover:text-stone-800 hover:bg-stone-50 transition-all disabled:opacity-40"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear & Reset
                </button>

              </div>

            )}

          </div>

        </div>

        {/* ===================================================
            RIGHT PANEL
            =================================================== */}

        <div className="lg:col-span-7">

          {/* =================================================
              ANALYZING
              ================================================= */}

          {analyzing ? (

            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm min-h-[520px] flex flex-col items-center justify-center text-center p-8">

              <div className="relative mb-6">

                <div className="absolute inset-0 rounded-3xl bg-emerald-200 blur-xl opacity-50 animate-pulse" />

                <div className="relative w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <BrainCircuit className="w-10 h-10 animate-pulse" />
                </div>

              </div>

              <h3 className="text-lg font-black text-stone-900">
                AI Neural Network Analyzing Leaf...
              </h3>

              <p className="text-xs text-stone-500 mt-2 max-w-md leading-relaxed">
                The system is examining the uploaded image,
                identifying visible leaf symptoms and comparing
                the image with the configured disease detection
                model.
              </p>

              <div className="w-64 bg-stone-100 rounded-full h-2 mt-7 overflow-hidden">

                <div className="bg-emerald-600 h-2 rounded-full w-2/3 animate-pulse" />

              </div>

              <div className="flex items-center gap-2 mt-4 text-[10px] text-stone-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Processing image
              </div>

            </div>

          ) : result ? (

            <div className="space-y-4">

              {/* =================================================
                  RESULT CARD
                  ================================================= */}

              <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">

                {/* Result header */}

                <div
                  className={`p-5 sm:p-6 text-white ${
                    isLowConfidence
                      ? 'bg-amber-600'
                      : result.severity === 'Severe'
                        ? 'bg-rose-700'
                        : result.severity === 'Moderate'
                          ? 'bg-amber-700'
                          : 'bg-emerald-700'
                  }`}
                >

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                    <div>

                      <div className="flex flex-wrap items-center gap-2">

                        <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-lg">
                          {result.crop} Leaf Diagnosis
                        </span>

                        <span className="text-[10px] font-black bg-black/20 px-2.5 py-1 rounded-lg">
                          Confidence:
                          {' '}
                          {Math.round(
                            result.confidence * 100
                          )}
                          %
                        </span>

                      </div>

                      <h2 className="text-xl sm:text-2xl font-black mt-2 tracking-tight">
                        {result.disease}
                      </h2>

                    </div>

                    <div className="sm:text-right">

                      <div className="text-[10px] uppercase tracking-wider text-white/75 font-bold">
                        Severity Level
                      </div>

                      <div className="text-base font-black mt-0.5">
                        {result.severity}
                      </div>

                    </div>

                  </div>

                </div>

                {/* =================================================
                    RESULT BODY
                    ================================================= */}

                <div className="p-5 sm:p-6 space-y-6">

                  {/* Low confidence */}

                  {isLowConfidence ? (

                    <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 space-y-3">

                      <div className="flex items-center gap-2">

                        <AlertTriangle className="w-5 h-5 text-amber-600" />

                        <span className="font-black text-amber-950 text-sm">
                          Low Confidence / Inconclusive Image
                        </span>

                      </div>

                      <p className="text-xs text-amber-900 leading-relaxed">
                        {result.explanation}
                      </p>

                      <div className="pt-3 border-t border-amber-200">

                        <strong className="text-xs text-amber-950">
                          For a more reliable result:
                        </strong>

                        <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-amber-900">

                          <li>
                            Use a clear image of an actual crop leaf.
                          </li>

                          <li>
                            Avoid blurry or distant photographs.
                          </li>

                          <li>
                            Use natural lighting where possible.
                          </li>

                          <li>
                            Keep the infected portion visible.
                          </li>

                          <li>
                            Avoid leaves heavily covered by soil or water.
                          </li>

                        </ul>

                      </div>

                    </div>

                  ) : (

                    <>

                      {/* =================================================
                          PATHOLOGICAL ASSESSMENT
                          ================================================= */}

                      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4">

                        <div className="flex items-center gap-2 mb-2">

                          <Info className="w-4 h-4 text-emerald-600" />

                          <strong className="text-xs font-black text-stone-900 uppercase tracking-wide">
                            Pathological Assessment
                          </strong>

                        </div>

                        <p className="text-sm text-stone-700 leading-relaxed">
                          {result.explanation}
                        </p>

                      </div>

                      {/* =================================================
                          SYMPTOMS
                          ================================================= */}

                      {result.symptoms &&
                        result.symptoms.length > 0 && (

                          <div>

                            <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider mb-3 flex items-center gap-2">

                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />

                              Identified Symptoms

                            </h4>

                            <div className="grid gap-2">

                              {result.symptoms.map(
                                (sym, i) => (

                                  <div
                                    key={i}
                                    className="flex items-start gap-2.5 bg-emerald-50/60 border border-emerald-100 rounded-xl p-3"
                                  >

                                    <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-[10px] font-black">
                                      {i + 1}
                                    </span>

                                    <span className="text-xs text-stone-700 leading-relaxed">
                                      {sym}
                                    </span>

                                  </div>

                                )
                              )}

                            </div>

                          </div>

                        )}

                      {/* =================================================
                          IPM ACTIONS
                          ================================================= */}

                      {result.recommendedActions &&
                        result.recommendedActions.length > 0 && (

                          <div>

                            <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider mb-3 flex items-center gap-2">

                              <ShieldCheck className="w-4 h-4 text-emerald-600" />

                              Recommended IPM Actions

                            </h4>

                            <div className="space-y-2">

                              {result.recommendedActions.map(
                                (act, i) => (

                                  <div
                                    key={i}
                                    className="text-xs text-stone-800 bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-start gap-3"
                                  >

                                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-[10px] font-black">
                                      {i + 1}
                                    </span>

                                    <span className="leading-relaxed">
                                      {act}
                                    </span>

                                  </div>

                                )
                              )}

                            </div>

                          </div>

                        )}

                      {/* =================================================
                          PREVENTION
                          ================================================= */}

                      {result.prevention &&
                        result.prevention.length > 0 && (

                          <div>

                            <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider mb-3 flex items-center gap-2">

                              <Leaf className="w-4 h-4 text-blue-600" />

                              Preventive Cultural Practices

                            </h4>

                            <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4">

                              <ul className="space-y-2 text-xs text-stone-700">

                                {result.prevention.map(
                                  (prev, i) => (

                                    <li
                                      key={i}
                                      className="flex items-start gap-2"
                                    >

                                      <span className="text-blue-600 font-black">
                                        •
                                      </span>

                                      <span className="leading-relaxed">
                                        {prev}
                                      </span>

                                    </li>

                                  )
                                )}

                              </ul>

                            </div>

                          </div>

                        )}

                      {/* =================================================
                          OFFICER CONSULTATION
                          ================================================= */}

                      {result.officerConsultationNeeded && (

                        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">

                          <UserCheck className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />

                          <div>

                            <p className="font-black text-rose-950 text-xs sm:text-sm">
                              Agriculture Officer Consultation Recommended
                            </p>

                            <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                              Because the predicted condition may require
                              field-level verification, consider consulting
                              your local Agriculture Officer before taking
                              major treatment decisions.
                            </p>

                          </div>

                        </div>

                      )}

                    </>

                  )}

                </div>

              </div>

              {/* =========================================================
                  AI PREDICTION DISCLAIMER
                  
                  IMPORTANT:
                  This component is INSIDE {result ? ...}
                  therefore it will ONLY appear after Run Disease
                  Detection successfully returns a result.
                  ========================================================= */}

              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">

                <div className="flex items-start gap-3">

                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">

                    <BrainCircuit className="w-5 h-5" />

                  </div>

                  <div>

                    <p className="text-xs sm:text-sm font-black text-blue-950">
                      AI Prediction Notice
                    </p>

                    <p className="text-xs text-blue-800 mt-1.5 leading-relaxed">
                      This result is an AI-based prediction and is
                      intended to provide preliminary guidance.
                      The system is designed to provide approximately
                      <strong> 80–90% prediction accuracy </strong>
                      under suitable image conditions, but the result
                      is not a guaranteed diagnosis.
                    </p>

                    <p className="text-[10px] text-blue-700 mt-2 leading-relaxed">
                      For severe infections, unusual symptoms, or
                      large-scale crop damage, verify the condition
                      with an Agriculture Officer or qualified
                      agricultural expert before applying treatment.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          ) : (

            /* =====================================================
               EMPTY STATE
               ===================================================== */

            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm min-h-[520px] flex flex-col items-center justify-center text-center p-8">

              <div className="w-20 h-20 rounded-3xl bg-stone-100 text-stone-300 flex items-center justify-center mb-5">

                <Camera className="w-10 h-10" />

              </div>

              <h3 className="font-black text-stone-800 text-lg">
                No Leaf Scan Yet
              </h3>

              <p className="text-xs text-stone-500 mt-2 max-w-md leading-relaxed">
                Upload or capture a clear crop leaf image.
                After reviewing the image, click
                <strong className="text-emerald-700">
                  {' '}Run Disease Detection
                </strong>
                {' '}to start AI analysis.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-6 w-full max-w-lg">

                <div className="rounded-2xl bg-stone-50 border border-stone-100 p-3">

                  <UploadCloud className="w-5 h-5 text-emerald-600 mx-auto" />

                  <p className="text-[10px] font-bold text-stone-600 mt-2">
                    Upload
                  </p>

                </div>

                <div className="rounded-2xl bg-stone-50 border border-stone-100 p-3">

                  <Camera className="w-5 h-5 text-emerald-600 mx-auto" />

                  <p className="text-[10px] font-bold text-stone-600 mt-2">
                    Capture
                  </p>

                </div>

                <div className="rounded-2xl bg-stone-50 border border-stone-100 p-3">

                  <BrainCircuit className="w-5 h-5 text-emerald-600 mx-auto" />

                  <p className="text-[10px] font-bold text-stone-600 mt-2">
                    Diagnose
                  </p>

                </div>

              </div>

            </div>

          )}

        </div>

      </div>

      {/* =========================================================
          CAMERA MODAL
          ========================================================= */}

      {cameraOpen && (

        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-stone-950/80 p-4 backdrop-blur-sm">

          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">

            {/* Header */}

            <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">

              <div>

                <h2 className="text-base font-black text-stone-900">
                  Capture Leaf Photo
                </h2>

                <p className="mt-1 text-xs text-stone-500">
                  Keep the leaf centered, close and well lit.
                </p>

              </div>

              <button
                type="button"
                onClick={closeCamera}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-stone-500 hover:bg-stone-100 hover:text-stone-800"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            {/* Camera */}

            <div className="bg-stone-950 p-4">

              {cameraError ? (

                <div className="min-h-[350px] flex flex-col items-center justify-center text-center p-6">

                  <AlertTriangle className="w-10 h-10 text-amber-400 mb-4" />

                  <p className="text-sm font-bold text-amber-100">
                    Camera unavailable
                  </p>

                  <p className="text-xs text-amber-200/80 mt-2 max-w-sm">
                    {cameraError}
                  </p>

                </div>

              ) : (

                <div className="relative">

                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="max-h-[60vh] min-h-[300px] w-full rounded-2xl object-contain bg-black"
                  />

                  {/* Camera guide */}

                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">

                    <div className="w-[65%] h-[70%] border-2 border-white/60 border-dashed rounded-3xl" />

                  </div>

                </div>

              )}

            </div>

            {/* Footer */}

            <div className="flex justify-end gap-2 px-5 py-4">

              <button
                type="button"
                onClick={closeCamera}
                className="rounded-xl border border-stone-200 px-4 py-2.5 text-xs font-black text-stone-700 hover:bg-stone-50"
              >
                Cancel
              </button>

              {!cameraError && (

                <button
                  type="button"
                  onClick={captureCameraImage}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-black text-white hover:bg-emerald-800"
                >
                  <Camera className="w-4 h-4" />
                  Capture Photo
                </button>

              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default DiseaseDetectionPage;