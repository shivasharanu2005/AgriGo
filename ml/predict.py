from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import torch
from PIL import Image
from torchvision import transforms
from torchvision.models import ResNet50_Weights, resnet50


MODEL_FALLBACK = "agrigo_disease_resnet50.pth"
CLASS_FALLBACK = "class_names.json"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Predict leaf disease using the AgriGo ResNet-50 model.")
    parser.add_argument("--image", type=str, required=True, help="Path to a single leaf image file.")
    parser.add_argument("--model", type=str, default=str(Path(__file__).resolve().parent / "outputs" / MODEL_FALLBACK), help="Path to the trained model checkpoint.")
    parser.add_argument("--class-names", type=str, default=str(Path(__file__).resolve().parent / "outputs" / CLASS_FALLBACK), help="Path to class_names.json.")
    parser.add_argument("--device", type=str, default="cuda" if torch.cuda.is_available() else "cpu", help="Device to use for inference.")
    return parser.parse_args()


def load_class_names(class_names_path: Path) -> list[str]:
    with class_names_path.open("r", encoding="utf-8") as file:
        labels = json.load(file)
    if not labels:
        raise ValueError(f"No class names found in {class_names_path}")
    return labels


def build_model(num_classes: int, device: torch.device) -> torch.nn.Module:
    model = resnet50(weights=ResNet50_Weights.DEFAULT)
    in_features = model.fc.in_features
    model.fc = torch.nn.Linear(in_features, num_classes)
    model.to(device)
    model.eval()
    return model


def preprocess_image(image_path: Path) -> torch.Tensor:
    image = Image.open(image_path).convert("RGB")
    transform = transforms.Compose(
        [
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ]
    )
    return transform(image).unsqueeze(0)


def label_to_crop_and_disease(class_name: str) -> tuple[str, str]:
    if "__" in class_name:
        crop, disease = class_name.split("__", 1)
    elif "_" in class_name:
        parts = class_name.split("_", 1)
        crop, disease = parts[0], parts[1] if len(parts) > 1 else "Healthy"
    else:
        crop, disease = "Unknown Crop", class_name
    crop = crop.replace("_", " ").title()
    disease = disease.replace("_", " ").title()
    return crop, disease


def predict(image_path: str, model_path: str, class_names_path: str, device_name: str) -> dict:
    device = torch.device(device_name)
    model_path = Path(model_path)
    class_names_path = Path(class_names_path)
    if not model_path.exists():
        raise FileNotFoundError(f"Model not found at {model_path}. Train the model first.")
    if not class_names_path.exists():
        raise FileNotFoundError(f"Class names file not found at {class_names_path}. Train the model first.")

    class_names = load_class_names(class_names_path)
    checkpoint = torch.load(model_path, map_location=device)
    num_classes = checkpoint.get("num_classes", len(class_names))
    model = build_model(num_classes, device)
    model.load_state_dict(checkpoint["model_state_dict"])

    image_tensor = preprocess_image(Path(image_path)).to(device)
    with torch.no_grad():
        logits = model(image_tensor)
        probabilities = torch.softmax(logits, dim=1).cpu().numpy()[0]

    top_indices = np.argsort(probabilities)[::-1][:3]
    top_predictions = []
    for idx in top_indices:
        class_name = class_names[int(idx)]
        crop, disease = label_to_crop_and_disease(class_name)
        top_predictions.append(
            {
                "class_name": class_name,
                "crop": crop,
                "disease": disease,
                "confidence": round(float(probabilities[int(idx)]) * 100.0, 2),
            }
        )

    best_index = int(top_indices[0])
    best_crop, best_disease = label_to_crop_and_disease(class_names[best_index])
    return {
        "crop": best_crop,
        "predicted_disease": best_disease,
        "confidence_percentage": round(float(probabilities[best_index]) * 100.0, 2),
        "top_3_predictions": top_predictions,
    }


def main() -> None:
    args = parse_args()
    result = predict(
        image_path=args.image,
        model_path=args.model,
        class_names_path=args.class_names,
        device_name=args.device,
    )
    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
