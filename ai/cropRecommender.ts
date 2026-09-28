import { CropRecommendationInput, CropRecommendationItem } from '../backend/server/types.ts';
import { ALL_INDIAN_CROPS, CropProfile } from './crops/index.ts';

/**
 * Continuous smooth trapezoidal scoring function with optimal plateau.
 * Returns 0 - 100 based on value proximity to optimal envelope [min, opt, max].
 */
function scoreParam(value: number, min: number, max: number, opt: number): number {
  if (value < min) {
    const deficitRatio = Math.max(0, 1 - (min - value) / (min * 0.75 || 1));
    return deficitRatio * 45;
  }
  if (value > max) {
    const excessRatio = Math.max(0, 1 - (value - max) / (max * 0.75 || 1));
    return excessRatio * 45;
  }
  // Inside viable range: calculate proximity to optimal
  const span = Math.abs(value <= opt ? opt - min : max - opt) || 1;
  const dist = Math.abs(value - opt);
  return 70 + (1 - dist / span) * 30;
}

export function recommendCrops(input: CropRecommendationInput): CropRecommendationItem[] {
  const scoredCrops = ALL_INDIAN_CROPS.map((crop: CropProfile) => {
    let isBiologicallyFeasible = true;
    let criticalConstraint: string | undefined;

    // 1. Thermal viability check
    if (input.temperature > crop.maxTemp + 6) {
      isBiologicallyFeasible = false;
      criticalConstraint = `Extreme heat: ${input.temperature}°C exceeds maximum threshold (${crop.maxTemp}°C). Risk of floral scorching and pollen sterility.`;
    } else if (input.temperature < crop.minTemp - 4) {
      isBiologicallyFeasible = false;
      criticalConstraint = `Cold stress: ${input.temperature}°C is below minimum threshold (${crop.minTemp}°C). Risk of stunted vegetative dormancy and chilling injury.`;
    }

    // 2. Irrigation & Water Viability
    if (crop.waterRequirement === 'High' && input.irrigationAvailability === 'Scarse' && input.rainfall < crop.minRainfall * 0.7) {
      isBiologicallyFeasible = false;
      criticalConstraint = `Severe water deficit: ${crop.name} requires abundant water, but farm is rainfed dryland with only ${input.rainfall}mm rainfall.`;
    }

    // 3. Soil pH Viability
    if (input.ph < crop.minPh - 0.7 || input.ph > crop.maxPh + 0.8) {
      if (input.ph < 5.0 && crop.minPh >= 6.0) {
        criticalConstraint = `Acidic soil injury: pH ${input.ph} triggers aluminum & manganese toxicity, arresting phosphorus absorption.`;
      } else if (input.ph > 8.5 && crop.maxPh <= 7.5) {
        criticalConstraint = `Alkaline salinity: pH ${input.ph} restricts micronutrient (Zinc, Iron, Manganese) bio-availability.`;
      }
    }

    // --- Scoring components ---

    // A. NPK Scoring
    let nScore = scoreParam(input.nitrogen, crop.minN, crop.maxN, crop.optN);
    const pScore = scoreParam(input.phosphorus, crop.minP, crop.maxP, crop.optP);
    const kScore = scoreParam(input.potassium, crop.minK, crop.maxK, crop.optK);

    // Legume / Pulse bonus for low soil nitrogen
    if (crop.category === 'Pulses & Legumes' && input.nitrogen < 50) {
      // Pulses fix biological nitrogen; having low synthetic N in soil is actually beneficial!
      nScore = Math.max(nScore, 85);
    }

    const npkScore = (nScore * 0.4) + (pScore * 0.3) + (kScore * 0.3);

    // B. Soil pH Score
    const phScore = scoreParam(input.ph, crop.minPh, crop.maxPh, crop.optPh);

    // C. Climate Score (Temperature, Humidity, Rainfall)
    const tempScore = scoreParam(input.temperature, crop.minTemp, crop.maxTemp, crop.optTemp);
    const rainScore = scoreParam(input.rainfall, crop.minRainfall, crop.maxRainfall, crop.optRainfall);
    let humScore = 75;
    if (input.humidity >= crop.minHumidity && input.humidity <= crop.maxHumidity) {
      humScore = 100;
    } else {
      const distHum = Math.min(Math.abs(input.humidity - crop.minHumidity), Math.abs(input.humidity - crop.maxHumidity));
      humScore = Math.max(30, 90 - distHum * 2);
    }
    const climateScore = (tempScore * 0.35) + (humScore * 0.25) + (rainScore * 0.40);

    // D. Soil Type Compatibility
    let soilTypeScore = 60;
    const soilTypeMatches = crop.suitableSoils.some((s) => s.toLowerCase().includes(input.soilType.toLowerCase()));
    if (soilTypeMatches) {
      soilTypeScore = 100;
    } else if (input.soilType === 'Alluvial') {
      soilTypeScore = 85; // Alluvial is broadly adaptable
    } else if (input.soilType === 'Clay' && ['Rice (Paddy)', 'Sugarcane', 'Jute', 'Wheat'].includes(crop.name)) {
      soilTypeScore = 95;
    } else if (input.soilType === 'Sandy Loam' && (crop.category === 'Vegetables & Greens' || crop.category === 'Pulses & Legumes' || crop.category === 'Oilseeds')) {
      soilTypeScore = 80;
    }

    // E. Season Alignment
    let seasonScore = 70;
    const isPerennial = crop.seasons.includes('Perennial') || crop.seasons.includes('Annual');
    if (isPerennial) {
      seasonScore = 92; // Year-round viable
    } else if (input.season && crop.seasons.includes(input.season)) {
      seasonScore = 100; // Perfect match
    } else if (!input.season) {
      seasonScore = 80;
    } else {
      seasonScore = 40; // Off-season penalty
    }

    // F. Irrigation Water Fit
    let waterScore = 85;
    if (crop.waterRequirement === 'High') {
      if (input.irrigationAvailability === 'Abundant') waterScore = 100;
      else if (input.irrigationAvailability === 'Moderate') waterScore = 70;
      else waterScore = 30;
    } else if (crop.waterRequirement === 'Moderate') {
      if (input.irrigationAvailability === 'Abundant' || input.irrigationAvailability === 'Moderate') waterScore = 95;
      else waterScore = 65;
    } else {
      // Low water requirement (drought hardy crops)
      if (input.irrigationAvailability === 'Scarse') waterScore = 100;
      else waterScore = 90;
    }

    // Weighted composite calculation
    let compositeScore = Math.round(
      (npkScore * 0.22) +
      (phScore * 0.14) +
      (climateScore * 0.28) +
      (soilTypeScore * 0.16) +
      (seasonScore * 0.12) +
      (waterScore * 0.08)
    );

    // Apply biological feasibility dampener
    if (!isBiologicallyFeasible) {
      compositeScore = Math.min(compositeScore, 42);
    }

    // Reasons generation
    const reasons: string[] = [];
    if (soilTypeScore >= 95) {
      reasons.push(`Superior affinity with ${input.soilType} soil: physical drainage and aeration envelope perfectly suit root architecture.`);
    }
    if (tempScore >= 80 && rainScore >= 80) {
      reasons.push(`Thermal range (${input.temperature}°C) & rainfall (${input.rainfall}mm) match optimal photosynthetic and anthesis benchmarks.`);
    }
    if (phScore >= 85) {
      reasons.push(`Soil pH (${input.ph}) guarantees balanced cationic exchange capacity and nutrient bio-availability.`);
    }
    if (seasonScore === 100) {
      reasons.push(`Synchronizes directly with the ${input.season} agricultural window across primary Indian agro-zones.`);
    }
    if (waterScore >= 90) {
      reasons.push(`Farm irrigation infrastructure (${input.irrigationAvailability}) is in harmony with crop's ${crop.waterRequirement.toLowerCase()} water requirement.`);
    }
    if (crop.category === 'Pulses & Legumes' && input.nitrogen < 50) {
      reasons.push(`Biological Rhizobium nitrogen fixation enriches low-nitrogen soil, substantially reducing synthetic fertilizer expenditure.`);
    }

    if (reasons.length < 3) {
      reasons.push(crop.agronomicDescription);
    }

    return {
      cropName: crop.name,
      scientificName: crop.scientificName,
      hindiName: crop.hindiName,
      category: crop.category,
      popularVarieties: crop.popularVarieties,
      suitabilityScore: Math.min(98, Math.max(25, compositeScore)),
      expectedGrowingPeriod: crop.growingPeriodDays,
      durationDays: crop.durationDays,
      waterRequirement: crop.waterRequirement,
      soilSuitability: `${soilTypeScore >= 85 ? 'Optimal' : soilTypeScore >= 70 ? 'Suitable' : 'Marginal'} for ${input.soilType}`,
      climateSuitability: `${climateScore >= 80 ? 'Ideal' : climateScore >= 65 ? 'Favorable' : 'Challenging'} (${Math.round(climateScore)}% index)`,
      reasons: reasons.slice(0, 4),
      riskFactors: crop.riskFactors,
      marketProspect: crop.marketProspect,

      // Real-world farm economics
      mspOrBenchmarkPrice: crop.mspOrBenchmarkPrice,
      estimatedCostPerAcre: crop.estimatedCostPerAcre,
      estimatedGrossReturnPerAcre: crop.estimatedGrossReturnPerAcre,
      estimatedNetProfitPerAcre: crop.estimatedNetProfitPerAcre,
      expectedYieldPerAcre: crop.expectedYieldPerAcre,
      sowingWindow: crop.sowingWindow,
      harvestWindow: crop.harvestWindow,
      recommendedFertilizerDose: crop.recommendedFertilizerDose,
      irrigationScheduleHint: crop.irrigationScheduleHint,
      isBiologicallyFeasible,
      criticalConstraint
    };
  });

  // Sort descending by suitability score
  return scoredCrops.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
}

export function getAllCropsCatalog(): CropProfile[] {
  return ALL_INDIAN_CROPS;
}

export function getCropByName(name: string): CropProfile | undefined {
  const query = name.toLowerCase().trim();
  return ALL_INDIAN_CROPS.find(
    (c) => c.name.toLowerCase() === query ||
           c.name.toLowerCase().includes(query) ||
           (c.hindiName && c.hindiName.toLowerCase().includes(query)) ||
           (c.scientificName && c.scientificName.toLowerCase().includes(query))
  );
}
