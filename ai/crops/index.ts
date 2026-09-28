import { CropProfile } from './types.ts';
import { CEREALS_AND_MILLETS } from './cereals.ts';
import { PULSES_AND_LEGUMES } from './pulses.ts';
import { OILSEEDS } from './oilseeds.ts';
import { COMMERCIAL_AND_FIBRE } from './commercial.ts';
import { VEGETABLES_AND_TUBERS } from './vegetables.ts';
import { FRUITS_AND_PLANTATION } from './fruits.ts';
import { SPICES_AND_CONDIMENTS } from './spices.ts';
import { PLANTATION_BEVERAGES_AND_MEDICINAL } from './plantationBeverages.ts';
import { FODDER_AND_FLOWERS } from './fodderFlowers.ts';

export * from './types.ts';

export const ALL_INDIAN_CROPS: CropProfile[] = [
  ...CEREALS_AND_MILLETS,
  ...PULSES_AND_LEGUMES,
  ...OILSEEDS,
  ...COMMERCIAL_AND_FIBRE,
  ...VEGETABLES_AND_TUBERS,
  ...FRUITS_AND_PLANTATION,
  ...SPICES_AND_CONDIMENTS,
  ...PLANTATION_BEVERAGES_AND_MEDICINAL,
  ...FODDER_AND_FLOWERS
];

export const TOTAL_CROP_COUNT = ALL_INDIAN_CROPS.length;
