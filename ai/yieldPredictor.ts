import { YieldPredictionInput, YieldPredictionResult } from '../backend/server/types.ts';

interface CropYieldBaseline {
  nationalAverageTonnesPerHa: number;
  stateAverageTonnesPerHa: number;
  potentialMaximumTonnesPerHa: number;
  optimalRainfallMm: number;
  optimalFertilizerKgPerAcre: number;
  unitName: string;
}

const CROP_YIELD_BASELINES: Record<string, CropYieldBaseline> = {
  'Rice': { nationalAverageTonnesPerHa: 2.8, stateAverageTonnesPerHa: 3.2, potentialMaximumTonnesPerHa: 5.5, optimalRainfallMm: 1200, optimalFertilizerKgPerAcre: 100, unitName: 'tonnes' },
  'Rice (Paddy)': { nationalAverageTonnesPerHa: 2.8, stateAverageTonnesPerHa: 3.2, potentialMaximumTonnesPerHa: 5.5, optimalRainfallMm: 1200, optimalFertilizerKgPerAcre: 100, unitName: 'tonnes' },
  'Wheat': { nationalAverageTonnesPerHa: 3.5, stateAverageTonnesPerHa: 4.1, potentialMaximumTonnesPerHa: 5.8, optimalRainfallMm: 500, optimalFertilizerKgPerAcre: 90, unitName: 'tonnes' },
  'Tomato': { nationalAverageTonnesPerHa: 24.0, stateAverageTonnesPerHa: 28.5, potentialMaximumTonnesPerHa: 45.0, optimalRainfallMm: 600, optimalFertilizerKgPerAcre: 140, unitName: 'tonnes' },
  'Potato': { nationalAverageTonnesPerHa: 22.0, stateAverageTonnesPerHa: 25.0, potentialMaximumTonnesPerHa: 38.0, optimalRainfallMm: 500, optimalFertilizerKgPerAcre: 130, unitName: 'tonnes' },
  'Maize': { nationalAverageTonnesPerHa: 3.1, stateAverageTonnesPerHa: 3.6, potentialMaximumTonnesPerHa: 6.2, optimalRainfallMm: 700, optimalFertilizerKgPerAcre: 85, unitName: 'tonnes' },
  'Maize (Corn)': { nationalAverageTonnesPerHa: 3.1, stateAverageTonnesPerHa: 3.6, potentialMaximumTonnesPerHa: 6.2, optimalRainfallMm: 700, optimalFertilizerKgPerAcre: 85, unitName: 'tonnes' },
  'Cotton': { nationalAverageTonnesPerHa: 1.6, stateAverageTonnesPerHa: 1.9, potentialMaximumTonnesPerHa: 3.2, optimalRainfallMm: 750, optimalFertilizerKgPerAcre: 80, unitName: 'tonnes' },
  'Chilli': { nationalAverageTonnesPerHa: 2.2, stateAverageTonnesPerHa: 2.7, potentialMaximumTonnesPerHa: 4.5, optimalRainfallMm: 650, optimalFertilizerKgPerAcre: 95, unitName: 'tonnes' },
  'Groundnut': { nationalAverageTonnesPerHa: 1.8, stateAverageTonnesPerHa: 2.1, potentialMaximumTonnesPerHa: 3.4, optimalRainfallMm: 600, optimalFertilizerKgPerAcre: 50, unitName: 'tonnes' },
  'Chickpea': { nationalAverageTonnesPerHa: 1.1, stateAverageTonnesPerHa: 1.3, potentialMaximumTonnesPerHa: 2.2, optimalRainfallMm: 400, optimalFertilizerKgPerAcre: 40, unitName: 'tonnes' },
  'Sugarcane': { nationalAverageTonnesPerHa: 75.0, stateAverageTonnesPerHa: 88.0, potentialMaximumTonnesPerHa: 135.0, optimalRainfallMm: 1500, optimalFertilizerKgPerAcre: 200, unitName: 'tonnes' },
  'Soybean': { nationalAverageTonnesPerHa: 1.2, stateAverageTonnesPerHa: 1.5, potentialMaximumTonnesPerHa: 2.6, optimalRainfallMm: 750, optimalFertilizerKgPerAcre: 45, unitName: 'tonnes' },
  'Mustard': { nationalAverageTonnesPerHa: 1.4, stateAverageTonnesPerHa: 1.7, potentialMaximumTonnesPerHa: 2.8, optimalRainfallMm: 350, optimalFertilizerKgPerAcre: 60, unitName: 'tonnes' }
};

export function predictYield(input: YieldPredictionInput): YieldPredictionResult {
  const cleanCrop = Object.keys(CROP_YIELD_BASELINES).find(c => 
    input.crop.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(input.crop.toLowerCase())
  ) || 'Wheat';

  const baseline = CROP_YIELD_BASELINES[cleanCrop] || CROP_YIELD_BASELINES['Wheat'];

  let yieldFactor = 1.0;
  const influencingFactors: {
    factor: string;
    impact: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
    description: string;
  }[] = [];

  // 1. Irrigation impact
  if (input.irrigationType === 'Drip') {
    yieldFactor += 0.18;
    influencingFactors.push({
      factor: 'Micro-Irrigation (Drip)',
      impact: 'POSITIVE',
      description: 'Precision drip fertigation improves moisture stability and root uptake by +18%.'
    });
  } else if (input.irrigationType === 'Sprinkler') {
    yieldFactor += 0.10;
    influencingFactors.push({
      factor: 'Sprinkler Irrigation',
      impact: 'POSITIVE',
      description: 'Even distribution across canopy supports steady vegetative expansion (+10%).'
    });
  } else if (input.irrigationType === 'Rainfed') {
    yieldFactor -= 0.14;
    influencingFactors.push({
      factor: 'Rainfed Moisture Dependency',
      impact: 'NEGATIVE',
      description: 'High reliance on erratic monsoon rainfall introduces potential dry-spell stress (-14%).'
    });
  } else {
    yieldFactor += 0.04;
    influencingFactors.push({
      factor: 'Surface / Flood Irrigation',
      impact: 'NEUTRAL',
      description: 'Adequate bulk water volume, though susceptible to tail-end percolation losses.'
    });
  }

  // 2. Soil pH and NPK health
  if (input.ph >= 6.2 && input.ph <= 7.5) {
    yieldFactor += 0.08;
    influencingFactors.push({
      factor: 'Optimal Soil pH (6.2 - 7.5)',
      impact: 'POSITIVE',
      description: 'Macronutrients (N, P, K) and micronutrients have maximum bio-availability in this range.'
    });
  } else if (input.ph < 5.5 || input.ph > 8.2) {
    yieldFactor -= 0.12;
    influencingFactors.push({
      factor: 'Soil Acidity / Alkalinity Stress',
      impact: 'NEGATIVE',
      description: `Current pH of ${input.ph} restricts phosphorus and zinc absorption (-12%).`
    });
  }

  // 3. Nitrogen balance
  if (input.nitrogen >= 80 && input.nitrogen <= 130) {
    yieldFactor += 0.06;
  } else if (input.nitrogen < 50) {
    yieldFactor -= 0.10;
    influencingFactors.push({
      factor: 'Low Available Soil Nitrogen',
      impact: 'NEGATIVE',
      description: `Nitrogen level (${input.nitrogen} kg/ha) is deficient; will curtail tiller count and leaf chlorophyll.`
    });
  }

  // 4. Rainfall suitability
  const rainfallRatio = input.rainfallMm / baseline.optimalRainfallMm;
  if (rainfallRatio >= 0.8 && rainfallRatio <= 1.25) {
    yieldFactor += 0.07;
    influencingFactors.push({
      factor: 'Adequate Seasonal Rainfall',
      impact: 'POSITIVE',
      description: `Current precipitation (${input.rainfallMm} mm) aligns with critical water requirements.`
    });
  } else if (rainfallRatio < 0.6) {
    yieldFactor -= 0.15;
    influencingFactors.push({
      factor: 'Deficit Moisture Window',
      impact: 'NEGATIVE',
      description: `Rainfall is ${(100 - rainfallRatio * 100).toFixed(0)}% below historical crop average; supplementary irrigation required.`
    });
  }

  // Calculate estimated yield per hectare
  const rawYieldPerHa = baseline.stateAverageTonnesPerHa * yieldFactor;
  const estimatedYieldPerHa = Math.max(
    baseline.nationalAverageTonnesPerHa * 0.5,
    Math.min(baseline.potentialMaximumTonnesPerHa, Number(rawYieldPerHa.toFixed(2)))
  );

  // Convert acres to hectares (1 acre = 0.404686 hectares)
  const farmHectares = input.farmAreaAcres * 0.404686;
  const estimatedTotalYield = Number((estimatedYieldPerHa * farmHectares).toFixed(2));

  // Range calculation with 90% confidence uncertainty spread
  const varianceRatio = input.irrigationType === 'Rainfed' ? 0.15 : 0.09;
  const yieldRangeMin = Number((estimatedYieldPerHa * (1 - varianceRatio)).toFixed(2));
  const yieldRangeMax = Number((estimatedYieldPerHa * (1 + varianceRatio)).toFixed(2));

  return {
    crop: input.crop,
    estimatedYieldTonnesPerHectare: estimatedYieldPerHa,
    estimatedTotalYieldTonnes: estimatedTotalYield,
    yieldRangeMin,
    yieldRangeMax,
    confidenceScore: input.irrigationType === 'Rainfed' ? 0.82 : 0.91,
    influencingFactors,
    benchmarks: {
      stateAverageTonnesPerHa: baseline.stateAverageTonnesPerHa,
      nationalAverageTonnesPerHa: baseline.nationalAverageTonnesPerHa,
      potentialMaximumTonnesPerHa: baseline.potentialMaximumTonnesPerHa,
    },
  };
}
