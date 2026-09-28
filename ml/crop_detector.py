#!/usr/bin/env python3
"""
AgriGo Crop Detector (ml/crop_detector.py)
==========================================
Uses MobileNetV2 (pre-trained on ImageNet) to identify the most likely crop 
from an uploaded image.  Since MobileNetV2 is trained on ImageNet classes 
(not a specialised crop dataset), we map the top ImageNet predictions to the 
nearest crop/plant category, then augment the result with agronomic advice.

Usage:
    python ml/crop_detector.py <path_to_image>

Output:
    A single JSON object printed to stdout, ready to be consumed by the 
    Node.js /api/ml/detect-crop endpoint.

Requirements:
    pip install tensorflow pillow numpy
"""

import sys
import os
import json
import traceback

# ---------------------------------------------------------------------------
# IMAGENET CLASS → CROP MAPPING
# Maps ImageNet label tokens to AgriGo crop names + basic agronomic data.
# We keep this lightweight so it runs quickly on CPU.
# ---------------------------------------------------------------------------
IMAGENET_TO_CROP = {
    # Vegetables / Fruits
    "fig": ("Fig", "Fruit", 0.82),
    "banana": ("Banana", "Fruit", 0.90),
    "pineapple": ("Pineapple", "Fruit", 0.88),
    "pomegranate": ("Pomegranate", "Fruit", 0.85),
    "lemon": ("Lemon / Citrus", "Fruit", 0.83),
    "orange": ("Orange", "Fruit", 0.84),
    "mango": ("Mango", "Fruit", 0.87),
    "strawberry": ("Strawberry", "Fruit", 0.86),
    "cucumber": ("Cucumber", "Vegetable", 0.83),
    "bell_pepper": ("Capsicum / Bell Pepper", "Vegetable", 0.85),
    "head_cabbage": ("Cabbage", "Vegetable", 0.84),
    "artichoke": ("Artichoke", "Vegetable", 0.80),
    "broccoli": ("Broccoli", "Vegetable", 0.82),
    "cardoon": ("Artichoke / Cardoon", "Vegetable", 0.78),
    "rapeseed": ("Mustard / Rapeseed", "Oilseed", 0.82),
    "corn": ("Maize / Corn", "Cereal", 0.88),
    "ear": ("Wheat / Paddy", "Cereal", 0.81),
    "hip": ("Rose Hip", "Fruit", 0.76),
    "mushroom": ("Mushroom", "Fungi", 0.85),
    "acorn": ("Acorn / Oak", "Tree", 0.79),
    "pea": ("Pea", "Legume", 0.83),
    "pot": ("Potted Plant", "Unknown", 0.60),
    "leaf": ("Leafy Crop", "Vegetable", 0.65),
    "plant": ("Unknown Crop", "Unknown", 0.60),
    # Field textures
    "plowed_field": ("Field Crop (Undetected)", "Unknown", 0.55),
    "thatch": ("Paddy / Thatched Crop", "Cereal", 0.65),
    "haystack": ("Paddy / Wheat", "Cereal", 0.70),
    "web_worm": ("Pest-affected Crop", "Unknown", 0.50),
    "caterpillar": ("Pest-affected Crop", "Unknown", 0.50),
    "snail": ("Snail-affected Crop", "Unknown", 0.50),
    "earthworm": ("Earthworm – Healthy Soil Indicator", "Soil", 0.60),
}

CROP_ADVICE = {
    "Maize / Corn": {
        "condition": "Healthy",
        "suggestedAction": "Monitor for Fall Armyworm (FAW). Apply neem-based spray as a preventive measure at early vegetative stage.",
        "nutritionTip": "Top-dress with Urea at knee-high stage (V5–V6). Ensure adequate Zinc supply.",
        "diseases": ["Fall Armyworm", "Northern Corn Leaf Blight", "Gray Leaf Spot"],
    },
    "Paddy": {
        "condition": "Healthy",
        "suggestedAction": "Maintain 2–3 cm flood water at tillering. Watch for Brown Plant Hopper (BPH) symptoms.",
        "nutritionTip": "Split Nitrogen into 3 doses: basal, tillering, panicle initiation.",
        "diseases": ["Blast", "Sheath Blight", "Brown Plant Hopper"],
    },
    "Wheat / Paddy": {
        "condition": "Healthy",
        "suggestedAction": "Irrigate at crown root initiation (CRI) and flowering stages. Scout for Rust weekly.",
        "nutritionTip": "Apply Potash and Phosphorus as basal dose. Top-dress Urea at tillering.",
        "diseases": ["Yellow Rust", "Brown Rust", "Powdery Mildew"],
    },
    "Tomato": {
        "condition": "Monitor Required",
        "suggestedAction": "Inspect undersides of leaves for white flies, spider mites, and early blight lesions.",
        "nutritionTip": "Foliar spray of micronutrients (Ca, Mg, B) at fruiting stage improves fruit quality.",
        "diseases": ["Early Blight", "Late Blight", "Leaf Curl Virus"],
    },
    "Banana": {
        "condition": "Healthy",
        "suggestedAction": "Remove dried outer leaves (decelerating). Check pseudostem for Banana Weevil damage.",
        "nutritionTip": "Fertigation with N:P:K (200:60:300 g/plant/year). Boron application improves bunch development.",
        "diseases": ["Panama Wilt", "Sigatoka", "Banana Bunchy Top Virus"],
    },
    "Mango": {
        "condition": "Healthy",
        "suggestedAction": "Spray Carbendazim at panicle emergence to prevent Powdery Mildew. Monitor for Hoppers.",
        "nutritionTip": "Apply NPK + micronutrients post-harvest and pre-flowering.",
        "diseases": ["Powdery Mildew", "Anthracnose", "Mango Hopper"],
    },
    "Cotton": {
        "condition": "Healthy",
        "suggestedAction": "Scout for Bollworm 3×/week during boll development. Use pheromone traps.",
        "nutritionTip": "Apply 80:40:40 N:P:K kg/ha. Foliar boron at squaring improves boll retention.",
        "diseases": ["Bollworm", "Alternaria Leaf Spot", "Bacterial Blight"],
    },
    "Capsicum / Bell Pepper": {
        "condition": "Healthy",
        "suggestedAction": "Stake plants to prevent lodging. Monitor Thrips – they transmit TSWV virus.",
        "nutritionTip": "High Potassium requirement; fertigation K at fruit development improves colour.",
        "diseases": ["Bacterial Wilt", "Phytophthora Blight", "Thrips/TSWV"],
    },
    "Unknown Crop": {
        "condition": "Unknown",
        "suggestedAction": "Please upload a clearer, well-lit image of the crop leaf or plant for accurate detection.",
        "nutritionTip": "Consult your local Krishi Vigyan Kendra (KVK) for soil and crop recommendations.",
        "diseases": [],
    },
}

DEFAULT_ADVICE = {
    "condition": "Likely Healthy",
    "suggestedAction": "Monitor regularly for pest and disease symptoms. Maintain proper water and nutrient management.",
    "nutritionTip": "Conduct a soil test to fine-tune nutrient recommendations for this crop.",
    "diseases": ["Verify crop-specific diseases with your local agriculture officer."],
}


def get_advice(crop_name: str) -> dict:
    """Return the best matching advice dict for a given crop name."""
    if crop_name in CROP_ADVICE:
        return CROP_ADVICE[crop_name]
    # Fuzzy match
    for key in CROP_ADVICE:
        if key.lower() in crop_name.lower() or crop_name.lower() in key.lower():
            return CROP_ADVICE[key]
    return DEFAULT_ADVICE


def detect_crop_tensorflow(image_path: str) -> dict:
    """Use MobileNetV2 for crop detection."""
    import numpy as np
    import tensorflow as tf
    from tensorflow.keras.applications import MobileNetV2
    from tensorflow.keras.applications.mobilenet_v2 import preprocess_input, decode_predictions
    from tensorflow.keras.preprocessing import image as keras_image

    # Load model (downloaded automatically on first run)
    model = MobileNetV2(weights='imagenet', include_top=True)

    img = keras_image.load_img(image_path, target_size=(224, 224))
    x = keras_image.img_to_array(img)
    x = np.expand_dims(x, axis=0)
    x = preprocess_input(x)

    preds = model.predict(x, verbose=0)
    top_preds = decode_predictions(preds, top=5)[0]  # [(class_id, label, prob), ...]

    # Map to crop
    detected_crop = "Unknown Crop"
    detected_confidence = 0.5
    detected_type = "Unknown"

    for (_, label, prob) in top_preds:
        label_lower = label.lower().replace(",", "").replace(" ", "_")
        for key, (crop, crop_type, boost) in IMAGENET_TO_CROP.items():
            if key in label_lower or label_lower in key:
                detected_crop = crop
                detected_confidence = min(0.97, float(prob) * boost + 0.15)
                detected_type = crop_type
                break
        if detected_crop != "Unknown Crop":
            break

    advice = get_advice(detected_crop)
    
    # Build suggestions list (top 3 possible crops)
    suggestions = []
    for i, (_, label, prob) in enumerate(top_preds[:3]):
        label_lower = label.lower().replace(",", "").replace(" ", "_")
        mapped_crop = "Unknown Crop"
        for key, (crop, _, boost) in IMAGENET_TO_CROP.items():
            if key in label_lower:
                mapped_crop = crop
                break
        if mapped_crop == "Unknown Crop" and i == 0:
            mapped_crop = detected_crop
        adv = get_advice(mapped_crop)
        suggestions.append({
            "cropName": mapped_crop,
            "confidence": round(min(0.97, float(prob) * 1.5 + 0.1), 2),
            "condition": adv.get("condition", "Healthy"),
            "suggestedAction": adv.get("suggestedAction", DEFAULT_ADVICE["suggestedAction"]),
            "nutritionTip": adv.get("nutritionTip", DEFAULT_ADVICE["nutritionTip"]),
        })

    return {
        "detected": detected_crop,
        "cropType": detected_type,
        "confidence": round(detected_confidence, 2),
        "condition": advice["condition"],
        "suggestedAction": advice["suggestedAction"],
        "nutritionTip": advice["nutritionTip"],
        "potentialDiseases": advice.get("diseases", []),
        "suggestions": suggestions,
        "source": "tensorflow-mobilenetv2",
    }


def detect_crop_fallback(image_path: str) -> dict:
    """
    Lightweight fallback: analyse average colour channels of the image to 
    make a rough crop-type guess.  Uses only PIL/Pillow.
    """
    from PIL import Image
    import struct

    img = Image.open(image_path).convert("RGB").resize((64, 64))
    pixels = list(img.getdata())
    n = len(pixels)
    r_avg = sum(p[0] for p in pixels) / n
    g_avg = sum(p[1] for p in pixels) / n
    b_avg = sum(p[2] for p in pixels) / n

    # Very simple heuristic based on dominant colour
    if g_avg > r_avg and g_avg > b_avg:
        # Green dominant → leafy / vegetative crop
        if r_avg > 120:
            crop, conf = "Tomato", 0.58
        else:
            crop, conf = "Paddy", 0.62
    elif r_avg > g_avg and r_avg > b_avg:
        # Red dominant → fruit / ripe crop
        crop, conf = "Tomato", 0.60
    elif b_avg > r_avg and b_avg > g_avg:
        # Blue/dark → soil visible
        crop, conf = "Maize / Corn", 0.52
    else:
        crop, conf = "Unknown Crop", 0.45

    advice = get_advice(crop)
    return {
        "detected": crop,
        "confidence": conf,
        "condition": advice["condition"],
        "suggestedAction": advice["suggestedAction"],
        "nutritionTip": advice["nutritionTip"],
        "potentialDiseases": advice.get("diseases", []),
        "suggestions": [
            {"cropName": crop, "confidence": conf, "condition": advice["condition"],
             "suggestedAction": advice["suggestedAction"], "nutritionTip": advice["nutritionTip"]},
        ],
        "source": "color-heuristic",
        "message": "TensorFlow not available; colour-based heuristic used.",
    }


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python crop_detector.py <image_path>"}))
        sys.exit(1)

    image_path = sys.argv[1]
    if not os.path.isfile(image_path):
        print(json.dumps({"error": f"Image file not found: {image_path}"}))
        sys.exit(1)

    try:
        result = detect_crop_tensorflow(image_path)
    except ImportError:
        # TensorFlow not installed – use PIL-only fallback
        try:
            result = detect_crop_fallback(image_path)
        except Exception as e:
            result = {
                "detected": "Unknown Crop",
                "confidence": 0.0,
                "condition": "Unknown",
                "suggestedAction": "Please install TensorFlow and Pillow to enable crop detection.",
                "nutritionTip": "",
                "potentialDiseases": [],
                "suggestions": [],
                "source": "error",
                "error": str(e),
            }
    except Exception as e:
        result = {
            "detected": "Unknown Crop",
            "confidence": 0.0,
            "condition": "Unknown",
            "suggestedAction": "Detection failed. Please try again with a clearer image.",
            "nutritionTip": "",
            "potentialDiseases": [],
            "suggestions": [],
            "source": "error",
            "error": str(e),
            "traceback": traceback.format_exc(),
        }

    print(json.dumps(result))


if __name__ == "__main__":
    main()
