from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from sklearn.metrics import classification_report, confusion_matrix


def evaluate_model(model, test_images: np.ndarray, test_labels: np.ndarray, class_names: list[str], output_dir: str | Path):
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    probabilities = model.predict(test_images, verbose=0)
    predicted = np.argmax(probabilities, axis=1)
    accuracy = float(np.mean(predicted == test_labels))

    report = classification_report(test_labels, predicted, target_names=class_names, output_dict=True)
    cm = confusion_matrix(test_labels, predicted, labels=np.arange(len(class_names)))

    results = {
        'test_accuracy': accuracy,
        'classification_report': report,
        'confusion_matrix': cm.tolist(),
        'class_names': class_names,
    }

    (output_dir / 'evaluation.json').write_text(json.dumps(results, indent=2), encoding='utf-8')
    print(f"Test accuracy: {accuracy:.4f}")
    print(classification_report(test_labels, predicted, target_names=class_names, digits=4))
    return accuracy
