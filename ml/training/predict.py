from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import torch
from PIL import Image
from torchvision import transforms
from torchvision.models import ResNet50_Weights, resnet50


def load_class_names(model_dir: str | Path):
    model_dir = Path(model_dir)
    for file_name in ("class_names.json", "labels.json"):
        labels_path = model_dir / file_name
        if labels_path.exists():
            labels = json.loads(labels_path.read_text(encoding="utf-8"))
            if labels:
                return labels
    raise FileNotFoundError(f"No class names file found in {model_dir}")


def build_model(num_classes: int, device: torch.device) -> torch.nn.Module:
    model = resnet50(weights=ResNet50_Weights.DEFAULT)
    model.fc = torch.nn.Linear(model.fc.in_features, num_classes)
    model.to(device)
    model.eval()
    return model


def preprocess_image(image_path: str | Path) -> torch.Tensor:
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


def infer_pytorch(image_path: str, model_dir: str, threshold: float = 0.7):
    model_dir = Path(model_dir)
    checkpoint_path = model_dir / 'agrigo_disease_resnet50.pth'
    if not checkpoint_path.exists():
        raise FileNotFoundError(f'Model checkpoint not found: {checkpoint_path}')

    class_names = load_class_names(model_dir)
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    checkpoint = torch.load(checkpoint_path, map_location=device)
    num_classes = checkpoint.get('num_classes', len(class_names))
    model = build_model(num_classes, device)
    model.load_state_dict(checkpoint['model_state_dict'])

    image_tensor = preprocess_image(image_path).to(device)
    with torch.no_grad():
        logits = model(image_tensor)
        probabilities = torch.softmax(logits, dim=1).cpu().numpy()[0]

    best_idx = int(np.argmax(probabilities))
    predicted_label = class_names[best_idx]
    crop, disease = label_to_crop_and_disease(predicted_label)
    confidence = float(probabilities[best_idx])

    if confidence < threshold:
        return {
            'crop': crop,
            'disease': 'Unknown',
            'confidence': round(confidence, 4),
            'healthy': False,
            'message': 'Image could not be classified confidently. Please upload a clearer leaf image.',
            'model_version': checkpoint.get('model_version', 'unversioned'),
        }

    return {
        'crop': crop,
        'disease': disease,
        'confidence': round(confidence, 4),
        'healthy': disease.lower() == 'healthy',
        'model_version': checkpoint.get('model_version', 'unversioned'),
    }


def infer_keras(image_path: str, model_dir: str, threshold: float = 0.7):
    import tensorflow as tf

    model_dir = Path(model_dir)
    model_path = model_dir / 'model.keras'
    labels_path = model_dir / 'labels.json'
    metadata_path = model_dir / 'metadata.json'

    if not model_path.exists():
        raise FileNotFoundError(f'Model file not found: {model_path}')
    if not labels_path.exists():
        raise FileNotFoundError(f'Labels file not found: {labels_path}')

    model = tf.keras.models.load_model(str(model_path))
    labels = json.loads(labels_path.read_text(encoding='utf-8'))
    metadata = json.loads(metadata_path.read_text(encoding='utf-8')) if metadata_path.exists() else {}

    img = Image.open(image_path).convert('RGB').resize((224, 224))
    arr = np.asarray(img, dtype=np.float32) / 255.0
    arr = np.expand_dims(arr, axis=0)
    probabilities = model.predict(arr, verbose=0)[0]
    predicted_idx = int(np.argmax(probabilities))
    predicted_label = labels[predicted_idx]
    confidence = float(probabilities[predicted_idx])

    crop, disease = predicted_label.split('__', 1) if '__' in predicted_label else (predicted_label, 'Healthy')
    crop = crop.replace('_', ' ')
    disease = disease.replace('_', ' ')

    if confidence < threshold:
        return {
            'crop': crop,
            'disease': 'Unknown',
            'confidence': round(float(confidence), 4),
            'healthy': False,
            'message': 'Image could not be classified confidently. Please upload a clearer leaf image.',
            'model_version': metadata.get('model_version', 'unversioned'),
        }

    return {
        'crop': crop,
        'disease': disease,
        'confidence': round(float(confidence), 4),
        'healthy': disease.lower() == 'healthy',
        'model_version': metadata.get('model_version', 'unversioned'),
    }


def infer(image_path: str, model_dir: str, threshold: float = 0.7):
    model_dir = Path(model_dir)
    if (model_dir / 'model.keras').exists():
        return infer_keras(image_path, model_dir, threshold=threshold)
    if (model_dir / 'agrigo_disease_resnet50.pth').exists():
        return infer_pytorch(image_path, model_dir, threshold=threshold)
    raise FileNotFoundError(f'No supported model found in {model_dir}')


def main():
    parser = argparse.ArgumentParser(description='Predict crop disease from a leaf image')
    parser.add_argument('--image-path', required=True, help='Path to the uploaded image file')
    parser.add_argument('--model-dir', required=True, help='Directory containing the trained model and class labels')
    parser.add_argument('--threshold', type=float, default=0.7, help='Minimum confidence to accept a disease prediction')
    args = parser.parse_args()

    result = infer(args.image_path, args.model_dir, threshold=args.threshold)
    print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    main()
