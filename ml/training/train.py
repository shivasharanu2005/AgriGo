from __future__ import annotations

import argparse
import json
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import torch
from PIL import Image
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, precision_score, recall_score
from torch import nn
from torch.optim import AdamW
from torch.utils.data import DataLoader, Dataset
from torchvision import datasets, transforms
from torchvision.models import ResNet50_Weights, resnet50

from ml.preprocessing.preprocess import copy_split


DEFAULT_DATA_ROOT = Path(__file__).resolve().parents[1] / "dataset"
DEFAULT_OUTPUT_DIR = Path(__file__).resolve().parents[1] / "outputs"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train a ResNet-50 crop disease classifier for AgriGo.")
    parser.add_argument("--data-root", type=str, default=str(DEFAULT_DATA_ROOT), help="Path to the prepared dataset root with train/validation/test folders.")
    parser.add_argument("--output-dir", type=str, default=str(DEFAULT_OUTPUT_DIR), help="Directory where model and metrics are stored.")
    parser.add_argument("--batch-size", type=int, default=32, help="Training batch size.")
    parser.add_argument("--epochs", type=int, default=12, help="Number of epochs for the initial frozen backbone stage.")
    parser.add_argument("--fine-tune-epochs", type=int, default=5, help="Optional epochs for fine-tuning the last ResNet layers.")
    parser.add_argument("--learning-rate", type=float, default=1e-3, help="Initial learning rate for the new classifier layer.")
    parser.add_argument("--device", type=str, default="cuda" if torch.cuda.is_available() else "cpu", help="Training device (cpu or cuda).")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility.")
    return parser.parse_args()


def set_seed(seed: int) -> None:
    torch.manual_seed(seed)
    np.random.seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


def build_transforms() -> tuple[transforms.Compose, transforms.Compose, transforms.Compose]:
    train_transform = transforms.Compose(
        [
            transforms.Resize((224, 224)),
            transforms.RandomHorizontalFlip(),
            transforms.RandomRotation(15, resample=Image.Resampling.BILINEAR),
            transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.05),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ]
    )
    val_transform = transforms.Compose(
        [
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ]
    )
    test_transform = val_transform
    return train_transform, val_transform, test_transform


def build_dataloaders(data_root: Path, batch_size: int) -> tuple[DataLoader, DataLoader, DataLoader, list[str]]:
    train_transform, val_transform, test_transform = build_transforms()
    train_dataset = datasets.ImageFolder(root=str(data_root / "train"), transform=train_transform)
    val_dataset = datasets.ImageFolder(root=str(data_root / "validation"), transform=val_transform)
    test_dataset = datasets.ImageFolder(root=str(data_root / "test"), transform=test_transform)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=2, pin_memory=torch.cuda.is_available())
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=2, pin_memory=torch.cuda.is_available())
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False, num_workers=2, pin_memory=torch.cuda.is_available())
    return train_loader, val_loader, test_loader, train_dataset.classes


def build_model(num_classes: int, device: torch.device) -> nn.Module:
    model = resnet50(weights=ResNet50_Weights.DEFAULT)
    model.fc = nn.Linear(model.fc.in_features, num_classes)
    for param in model.parameters():
        param.requires_grad = False
    model.fc.weight.requires_grad = True
    model.fc.bias.requires_grad = True
    model.to(device)
    return model


def save_class_names(class_names: list[str], output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    class_names_path = output_dir / "class_names.json"
    class_names_path.write_text(json.dumps(class_names, indent=2), encoding="utf-8")
    print(f"Saved class names to {class_names_path}")


def save_metrics_json(metrics: dict, output_path: Path) -> None:
    output_path.write_text(json.dumps(metrics, indent=2), encoding="utf-8")


def plot_metric(history: dict[str, list[float]], output_dir: Path) -> None:
    figure, axes = plt.subplots(2, 2, figsize=(12, 8))
    axes[0, 0].plot(history["train_loss"], label="Train loss")
    axes[0, 0].plot(history["val_loss"], label="Validation loss")
    axes[0, 0].set_title("Loss")
    axes[0, 0].legend()

    axes[0, 1].plot(history["train_accuracy"], label="Train accuracy")
    axes[0, 1].plot(history["val_accuracy"], label="Validation accuracy")
    axes[0, 1].set_title("Accuracy")
    axes[0, 1].legend()

    axes[1, 0].plot(history["train_precision"], label="Train precision")
    axes[1, 0].plot(history["val_precision"], label="Validation precision")
    axes[1, 0].set_title("Precision")
    axes[1, 0].legend()

    axes[1, 1].plot(history["train_recall"], label="Train recall")
    axes[1, 1].plot(history["val_recall"], label="Validation recall")
    axes[1, 1].set_title("Recall")
    axes[1, 1].legend()

    figure.tight_layout()
    figure.savefig(output_dir / "training_history.png", dpi=200)
    plt.close(figure)


def evaluate_model(model: nn.Module, data_loader: DataLoader, device: torch.device) -> tuple[float, float, float, float, np.ndarray]:
    model.eval()
    all_predictions: list[int] = []
    all_targets: list[int] = []
    with torch.no_grad():
        for images, labels in data_loader:
            images = images.to(device)
            labels = labels.to(device)
            logits = model(images)
            predictions = logits.argmax(dim=1)
            all_predictions.extend(predictions.cpu().tolist())
            all_targets.extend(labels.cpu().tolist())

    targets = np.asarray(all_targets)
    predictions = np.asarray(all_predictions)
    accuracy = accuracy_score(targets, predictions)
    precision = precision_score(targets, predictions, average="macro", zero_division=0)
    recall = recall_score(targets, predictions, average="macro", zero_division=0)
    f1 = f1_score(targets, predictions, average="macro", zero_division=0)
    cm = confusion_matrix(targets, predictions)
    return accuracy, precision, recall, f1, cm


def train_epoch(model: nn.Module, loader: DataLoader, optimizer: torch.optim.Optimizer, criterion: nn.Module, device: torch.device) -> tuple[float, float, float, float]:
    model.train()
    total_loss = 0.0
    total_correct = 0
    total_samples = 0
    all_predictions: list[int] = []
    all_targets: list[int] = []

    for images, labels in loader:
        images = images.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()
        logits = model(images)
        loss = criterion(logits, labels)
        loss.backward()
        optimizer.step()

        total_loss += loss.item() * images.size(0)
        predictions = logits.argmax(dim=1)
        total_correct += (predictions == labels).sum().item()
        total_samples += labels.size(0)
        all_predictions.extend(predictions.cpu().tolist())
        all_targets.extend(labels.cpu().tolist())

    accuracy = total_correct / total_samples
    precision = precision_score(all_targets, all_predictions, average="macro", zero_division=0)
    recall = recall_score(all_targets, all_predictions, average="macro", zero_division=0)
    loss = total_loss / total_samples
    return loss, accuracy, precision, recall


def evaluate_epoch(model: nn.Module, loader: DataLoader, criterion: nn.Module, device: torch.device) -> tuple[float, float, float, float]:
    model.eval()
    total_loss = 0.0
    total_correct = 0
    total_samples = 0
    all_predictions: list[int] = []
    all_targets: list[int] = []

    with torch.no_grad():
        for images, labels in loader:
            images = images.to(device)
            labels = labels.to(device)
            logits = model(images)
            loss = criterion(logits, labels)
            total_loss += loss.item() * images.size(0)
            predictions = logits.argmax(dim=1)
            total_correct += (predictions == labels).sum().item()
            total_samples += labels.size(0)
            all_predictions.extend(predictions.cpu().tolist())
            all_targets.extend(labels.cpu().tolist())

    accuracy = total_correct / total_samples
    precision = precision_score(all_targets, all_predictions, average="macro", zero_division=0)
    recall = recall_score(all_targets, all_predictions, average="macro", zero_division=0)
    loss = total_loss / total_samples
    return loss, accuracy, precision, recall


def train_model(data_root: Path, output_dir: Path, batch_size: int, epochs: int, fine_tune_epochs: int, learning_rate: float, device_name: str, seed: int) -> dict:
    set_seed(seed)
    device = torch.device(device_name)
    output_dir.mkdir(parents=True, exist_ok=True)

    train_loader, val_loader, test_loader, class_names = build_dataloaders(data_root, batch_size)
    num_classes = len(class_names)
    if num_classes < 2:
        raise ValueError("At least two classes are required. Check the dataset structure.")

    model = build_model(num_classes, device)
    criterion = nn.CrossEntropyLoss()
    optimizer = AdamW(model.fc.parameters(), lr=learning_rate)

    history: dict[str, list[float]] = {
        "train_loss": [],
        "val_loss": [],
        "train_accuracy": [],
        "val_accuracy": [],
        "train_precision": [],
        "val_precision": [],
        "train_recall": [],
        "val_recall": [],
    }

    for epoch in range(epochs):
        train_loss, train_accuracy, train_precision, train_recall = train_epoch(model, train_loader, optimizer, criterion, device)
        val_loss, val_accuracy, val_precision, val_recall = evaluate_epoch(model, val_loader, criterion, device)
        history["train_loss"].append(train_loss)
        history["val_loss"].append(val_loss)
        history["train_accuracy"].append(train_accuracy)
        history["val_accuracy"].append(val_accuracy)
        history["train_precision"].append(train_precision)
        history["val_precision"].append(val_precision)
        history["train_recall"].append(train_recall)
        history["val_recall"].append(val_recall)
        print(
            f"Epoch {epoch + 1}/{epochs} | "
            f"train_loss={train_loss:.4f} val_loss={val_loss:.4f} | "
            f"train_acc={train_accuracy:.4f} val_acc={val_accuracy:.4f}"
        )

    if fine_tune_epochs > 0:
        for name, param in model.named_parameters():
            if "layer4" in name or "fc" in name:
                param.requires_grad = True
        optimizer = AdamW(filter(lambda p: p.requires_grad, model.parameters()), lr=learning_rate / 10.0)
        for epoch in range(fine_tune_epochs):
            train_loss, train_accuracy, train_precision, train_recall = train_epoch(model, train_loader, optimizer, criterion, device)
            val_loss, val_accuracy, val_precision, val_recall = evaluate_epoch(model, val_loader, criterion, device)
            history["train_loss"].append(train_loss)
            history["val_loss"].append(val_loss)
            history["train_accuracy"].append(train_accuracy)
            history["val_accuracy"].append(val_accuracy)
            history["train_precision"].append(train_precision)
            history["val_precision"].append(val_precision)
            history["train_recall"].append(train_recall)
            history["val_recall"].append(val_recall)
            print(
                f"Fine-tune epoch {epoch + 1}/{fine_tune_epochs} | "
                f"train_loss={train_loss:.4f} val_loss={val_loss:.4f} | "
                f"train_acc={train_accuracy:.4f} val_acc={val_accuracy:.4f}"
            )

    save_class_names(class_names, output_dir)
    model_output_path = output_dir / "agrigo_disease_resnet50.pth"
    torch.save(
        {
            "model_state_dict": model.state_dict(),
            "num_classes": num_classes,
            "class_names": class_names,
            "model_architecture": "resnet50",
        },
        model_output_path,
    )

    save_metrics_json(history, output_dir / "training_metrics.json")
    plot_metric(history, output_dir)

    accuracy, precision, recall, f1, cm = evaluate_model(model, test_loader, device)
    test_metrics = {
        "accuracy": float(accuracy),
        "precision_macro": float(precision),
        "recall_macro": float(recall),
        "f1_macro": float(f1),
        "confusion_matrix": cm.tolist(),
        "class_names": class_names,
    }
    save_metrics_json(test_metrics, output_dir / "test_metrics.json")
    np.savetxt(output_dir / "confusion_matrix.csv", cm, delimiter=",", fmt="%d")

    print(f"Training complete. Model saved to: {model_output_path}")
    print(f"Test accuracy: {accuracy:.4f}")
    print(f"Test precision: {precision:.4f}")
    print(f"Test recall: {recall:.4f}")
    print(f"Test F1: {f1:.4f}")
    print(f"Confusion matrix saved to: {output_dir / 'confusion_matrix.csv'}")
    return test_metrics


def main() -> None:
    args = parse_args()
    data_root = Path(args.data_root).resolve()
    output_dir = Path(args.output_dir).resolve()

    if not (data_root / "train").exists() or not (data_root / "validation").exists() or not (data_root / "test").exists():
        has_raw_crops = any(
            child.is_dir() and child.name not in {"train", "validation", "test"}
            for child in data_root.iterdir()
        )
        if has_raw_crops:
            print("No prepared train/validation/test folders found. Auto-generating dataset splits from crop folders...")
            copy_split(data_root, data_root)
        else:
            raise FileNotFoundError(
                "Dataset split folders are missing. Run the preprocessing script first to create: "
                "train/, validation/, and test/"
            )

    train_model(
        data_root=data_root,
        output_dir=output_dir,
        batch_size=args.batch_size,
        epochs=args.epochs,
        fine_tune_epochs=args.fine_tune_epochs,
        learning_rate=args.learning_rate,
        device_name=args.device,
        seed=args.seed,
    )


if __name__ == "__main__":
    main()
