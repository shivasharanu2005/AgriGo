export interface DiseaseKnowledgeEntry {
  crop: string;
  disease: string;
  explanation: string;
  symptoms: string[];
  prevention: string[];
  recommendedActions: string[];
  whenToConsult: string;
}

export const DISEASE_KNOWLEDGE: Record<string, DiseaseKnowledgeEntry> = {
  'tomato__early_blight': {
    crop: 'Tomato',
    disease: 'Early Blight',
    explanation: 'Early blight is a common foliar fungal disease that appears as concentric dark lesions on older tomato leaves. It spreads under warm, humid conditions and often begins on the lower canopy.',
    symptoms: ['Target-like concentric brown lesions on older leaves', 'Yellowing around the spots and premature defoliation', 'Symptoms usually start from the lower canopy'],
    prevention: ['Avoid overhead irrigation and keep leaves dry', 'Remove infected lower leaves and do not compost diseased residues', 'Rotate with non-solanaceous crops and use resistant varieties'],
    recommendedActions: ['Prune infected leaves and dispose of them safely', 'Apply a registered fungicide according to local agronomy guidance', 'Maintain proper spacing for airflow and plant health'],
    whenToConsult: 'Consult an agriculture expert if the disease spreads quickly across the field or the infected area exceeds 15% of the canopy.'
  },
  'tomato__late_blight': {
    crop: 'Tomato',
    disease: 'Late Blight',
    explanation: 'Late blight is a destructive fungal-like disease that spreads rapidly under cool and humid conditions, often causing complete crop collapse in a short period.',
    symptoms: ['Water-soaked irregular lesions on leaves and stems', 'Rapid leaf collapse under humid conditions', 'Dark stem and fruit rot in severe cases'],
    prevention: ['Avoid overcrowding and improve ventilation in the field', 'Schedule irrigation to avoid long leaf wetness periods', 'Use disease-free seedlings and rotate fields'],
    recommendedActions: ['Remove affected foliage immediately and isolate infected plants', 'Apply a crop-protection spray recommended by local agricultural extension guidance', 'Monitor neighboring plants closely for spread'],
    whenToConsult: 'Seek agricultural expert support immediately if the disease is spreading across multiple rows or fruit symptoms appear.'
  },
  'potato__late_blight': {
    crop: 'Potato',
    disease: 'Late Blight',
    explanation: 'Potato late blight is a fast-spreading foliar disease that thrives in cool, wet weather and can severely reduce tuber quality and yield.',
    symptoms: ['Dark water-soaked lesions on leaves', 'White fuzz or sporulation under humid mornings', 'Rapid spread to nearby plants'],
    prevention: ['Use certified seed potatoes', 'Avoid excessive evening irrigation', 'Remove volunteer potato plants around the field'],
    recommendedActions: ['Apply protective fungicide treatments based on local field risk', 'Earthen up ridges and reduce excess moisture', 'Inspect surrounding plots for infection spread'],
    whenToConsult: 'Consult an agriculture expert if lesions appear on more than a few leaves or on stems.'
  },
  'rice__bacterial_leaf_blight': {
    crop: 'Rice',
    disease: 'Bacterial Leaf Blight',
    explanation: 'Bacterial leaf blight causes yellow, watersoaked lesions that usually begin from leaf tips and can quickly spread under prolonged humidity and standing water.',
    symptoms: ['Yellow or translucent lesions with wavy margins', 'Whitening and drying of leaf tissues', 'Symptoms often start at leaf tips'],
    prevention: ['Avoid excessive nitrogen application', 'Drain stagnant water quickly when possible', 'Choose resistant paddy varieties'],
    recommendedActions: ['Reduce standing water when the disease is active', 'Follow local plant-protection recommendations before spraying', 'Inspect nearby fields to check spread patterns'],
    whenToConsult: 'Consult an agriculture officer if symptoms are widespread across the field or if seedlings show severe wilting.'
  },
  'rice__brown_spot': {
    crop: 'Rice',
    disease: 'Brown Spot',
    explanation: 'Brown spot is a common rice disease expressed as small brown lesions with yellow halos, usually spreading under stress and moderate moisture conditions.',
    symptoms: ['Brown oval lesions with dark centers', 'Yellow halos and chlorotic leaf tissue', 'Reduced vigor in affected tillers'],
    prevention: ['Balance nutrient application to avoid stress', 'Use healthy seed and maintain field hygiene', 'Avoid water stress periods during early growth'],
    recommendedActions: ['Monitor heavily stressed areas of the field', 'Use locally recommended fungicide only when risk is high', 'Support crop vigor with proper nutrient management'],
    whenToConsult: 'Seek an expert recommendation if the disease is expanding in several patches across the field.'
  },
  'rice__leaf_blast': {
    crop: 'Rice',
    disease: 'Leaf Blast',
    explanation: 'Rice blast is a fungal disease known for spindle-shaped lesions with dark borders and can reduce crop productivity when conditions are humid and cool.',
    symptoms: ['Diamond-shaped lesions with gray centers', 'Dark brown borders on leaf blades', 'Possible neck blast in severe cases'],
    prevention: ['Avoid over-dense planting and excess nitrogen', 'Use seed treatment and resistant varieties', 'Maintain proper field hydration'],
    recommendedActions: ['Apply a registered fungicide according to local instructions', 'Scout newly emerged leaves and panicles', 'Remove severely infected patches if required'],
    whenToConsult: 'Consult an expert if neck blast or panicle damage becomes visible.'
  },
  'maize__gray_leaf_spot': {
    crop: 'Maize',
    disease: 'Gray Leaf Spot',
    explanation: 'Gray leaf spot causes grayish lesions on maize leaves, often developing during humid weather and reducing the plant’s photosynthetic area.',
    symptoms: ['Gray to tan leaf lesions with narrow rectangular shapes', 'Leaf discoloration and reduced green area', 'Symptoms may spread upward from lower leaves'],
    prevention: ['Maintain proper plant spacing', 'Rotate with non-host crops when possible', 'Use disease-free seed stock'],
    recommendedActions: ['Monitor lower leaves first and remove heavily affected tissues', 'Use crop protection products only when local recommendations justify it', 'Improve canopy airflow'],
    whenToConsult: 'Consult a local crop advisor if lesions cover many lower leaves and the crop is heading into grain fill.'
  },
  'maize__northern_leaf_blight': {
    crop: 'Maize',
    disease: 'Northern Leaf Blight',
    explanation: 'Northern leaf blight produces long, cigar-shaped lesions on maize leaves and can significantly reduce assimilate production if many leaves become infected.',
    symptoms: ['Long elliptical gray-green lesions', 'Lesions running along leaf length', 'Coalescing infected areas on mature leaves'],
    prevention: ['Use resistant hybrids', 'Manage crop residues and avoid excessive humidity in the canopy', 'Maintain balanced plant nutrition'],
    recommendedActions: ['Inspect lower and middle leaves regularly', 'Apply protective fungicide where necessary under local extension guidance', 'Manage residues to reduce inoculum'],
    whenToConsult: 'Consult an agriculture expert if symptoms appear across most of the crop before grain filling.'
  },
  'maize__common_rust': {
    crop: 'Maize',
    disease: 'Common Rust',
    explanation: 'Common rust is a maize foliar disease characterized by small reddish-brown pustules that may merge and limit plant productivity.',
    symptoms: ['Small reddish-brown rust pustules on leaves', 'Pustules gradually spread and darken', 'Leaf tissue can become chlorotic and dry'],
    prevention: ['Use resistant hybrids and healthy seed', 'Reduce canopy excess moisture', 'Practice crop rotation'],
    recommendedActions: ['Assess severity to decide whether plant-protection treatment is justified', 'Avoid unnecessary sprays in low-risk stages', 'Maintain crop vigor with balanced nutrition'],
    whenToConsult: 'Consult a crop specialist if many leaves show rust pustules and plant vigor is declining.'
  },
  'cotton__bacterial_blight': {
    crop: 'Cotton',
    disease: 'Bacterial Blight',
    explanation: 'Cotton bacterial blight causes angular leaf lesions and can spread quickly under humid conditions, affecting the photosynthetic area and boll formation.',
    symptoms: ['Angular leaf spots with darkened borders', 'Leaf tissue becomes water-logged before drying', 'Possible spread to stems and bracts'],
    prevention: ['Use clean seed and field sanitation', 'Avoid excessive moisture and nutrient stress', 'Scout early and isolate infected patches'],
    recommendedActions: ['Remove heavily infected leaves and control spread in the field', 'Use plant protection measures strictly according to local agronomy advice', 'Monitor for new lesions after rainfall'],
    whenToConsult: 'Consult an agronomist if lesions are spreading rapidly or bolls begin to show infection symptoms.'
  },
  'chilli__leaf_curl': {
    crop: 'Chilli',
    disease: 'Leaf Curl',
    explanation: 'Leaf curl in chilli is a viral disease often associated with insect vectors such as whiteflies. It stunts growth and causes leaf distortion.',
    symptoms: ['Leaf curling and puckering', 'Reduced growth and shortened internodes', 'Poor fruit development and yellowing'],
    prevention: ['Control whitefly vectors with integrated management', 'Use healthy seedlings and keep field borders clean', 'Destroy severely infected plants when necessary'],
    recommendedActions: ['Control insect vectors and remove severely infected plants', 'Monitor nearby chili plots for symptom spread', 'Use resistant varieties when available'],
    whenToConsult: 'Consult an agriculture expert if vector pressure is high or the crop is stunted across large patches.'
  },
  'chilli__anthracnose': {
    crop: 'Chilli',
    disease: 'Anthracnose',
    explanation: 'Anthracnose is a fruit and leaf disease favored by high humidity and frequent rainfall, often causing sunken lesions and fruit loss.',
    symptoms: ['Dark sunken lesions on fruits and leaves', 'Leaf drop in severe cases', 'Fruit decay with poor market quality'],
    prevention: ['Avoid overhead watering and improve field drainage', 'Use disease-free seed and remove infected plant debris', 'Practice crop rotation'],
    recommendedActions: ['Sanitize dropped fruits and infected residues', 'Follow local crop-protection recommendations for fungicide use', 'Reduce leaf wetness periods after rain'],
    whenToConsult: 'Consult an expert if fruit damage is increasing rapidly and fruit quality is declining.'
  },
  'potato__early_blight': {
    crop: 'Potato',
    disease: 'Early Blight',
    explanation: 'Early blight is a common potato disease that produces circular brown lesions with concentric rings, particularly on older leaves.',
    symptoms: ['Target-like brown lesions on lower leaves', 'Leaf yellowing around dead patches', 'Premature defoliation under stress'],
    prevention: ['Use disease-free tubers and remove old crop debris', 'Avoid excessive moisture and improve airflow', 'Rotate with non-solanaceous crops'],
    recommendedActions: ['Remove infected lower leaves as needed', 'Use registered fungicide under crop advisory guidance', 'Monitor the lower canopy for progression'],
    whenToConsult: 'Consult an expert if lesions are spreading rapidly and defoliation begins to affect canopy closure.'
  },
  'healthy': {
    crop: 'General crop',
    disease: 'Healthy',
    explanation: 'The leaf appearance suggests a healthy crop with no conclusive signs of fungal, bacterial, or viral disease in the uploaded image.',
    symptoms: ['Uniform green tissue', 'No necrotic or chlorotic lesions', 'Strong leaf structure with no obvious disease symptoms'],
    prevention: ['Continue routine field monitoring', 'Maintain nutrient balance and irrigation timing', 'Inspect plants regularly for emerging stress symptoms'],
    recommendedActions: ['Keep current agronomic practices in place', 'Continue periodic scouting every few days', 'Maintain a healthy canopy with balanced nutrition'],
    whenToConsult: 'Consult an agriculture expert only if new symptoms appear or crop vigor drops unexpectedly.'
  }
};

export function getDiseaseKnowledge(crop?: string, disease?: string): DiseaseKnowledgeEntry {
  const cropKey = (crop || '').trim().toLowerCase();
  const diseaseKey = (disease || '').trim().toLowerCase();

  const lookupKey = `${cropKey}__${diseaseKey}`.replace(/\s+/g, '_');
  if (DISEASE_KNOWLEDGE[lookupKey]) return DISEASE_KNOWLEDGE[lookupKey];

  const fallback = `${cropKey ? cropKey : 'general'}__${diseaseKey && diseaseKey.includes('healthy') ? 'healthy' : diseaseKey || 'unknown'}`;
  if (DISEASE_KNOWLEDGE[fallback]) return DISEASE_KNOWLEDGE[fallback];

  return {
    crop: crop || 'Crop',
    disease: disease || 'Unknown',
    explanation: 'The uploaded image was analyzed by the model, but the disease details require a clearer close-up of the leaf for expert confirmation.',
    symptoms: ['Symptoms are not yet confirmed from this image'],
    prevention: ['Use a clearer leaf image with visible disease symptoms for a more reliable diagnosis'],
    recommendedActions: ['Re-capture the affected leaf in good lighting and with the lesion in focus'],
    whenToConsult: 'Consult an agriculture expert if the crop is declining rapidly or multiple plants show similar symptoms.'
  };
}
