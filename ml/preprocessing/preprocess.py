from __future__ import annotations

import argparse
import shutil
from pathlib import Path

from PIL import Image
from sklearn.model_selection import train_test_split

SUPPORTED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".bmp"}


def is_valid_image(image_path: Path) -> bool:
    try:
        with Image.open(image_path) as image:
            image.verify()
        with Image.open(image_path) as image:
            image.convert("RGB")
        return True
    except Exception:
        return False


def collect_class_files(source_root: Path) -> dict[str, list[Path]]:
    classes: dict[str, list[Path]] = {}
    source_root = source_root.resolve()
    if not source_root.exists():
        raise FileNotFoundError(f"Source dataset root does not exist: {source_root}")

    for crop_dir in sorted(p for p in source_root.iterdir() if p.is_dir()):
        for label_dir in sorted(p for p in crop_dir.iterdir() if p.is_dir()):
            valid_files = []
            for file_path in sorted(label_dir.iterdir()):
                if not file_path.is_file():
                    continue
                if file_path.suffix.lower() not in SUPPORTED_EXTENSIONS:
                    continue
                if is_valid_image(file_path):
                    valid_files.append(file_path)
                else:
                    print(f"Skipping corrupted image: {file_path}")

            if valid_files:
                class_key = f"{crop_dir.name}__{label_dir.name}"
                classes[class_key] = valid_files

    if not classes:
        raise ValueError(
            "No valid labeled image files were found in the dataset. "
            "Expected folder structure like: source_root/Wheat/Healthy/*.jpg"
        )

    return classes


def split_files(files: list[Path]) -> tuple[list[Path], list[Path], list[Path]]:
    if len(files) < 3:
        raise ValueError(
            f"Each class must have at least 3 valid images for train/validation/test splits. "
            f"Found {len(files)} for class {files[0].parent.name}."
        )

    train_files, temp_files = train_test_split(files, test_size=0.4, random_state=42)
    validation_files, test_files = train_test_split(temp_files, test_size=0.5, random_state=42)
    return train_files, validation_files, test_files


def copy_split(source_root: Path, output_root: Path) -> list[str]:
    class_files = collect_class_files(source_root)
    output_root = output_root.resolve()

    for split_name in ["train", "validation", "test"]:
        split_dir = output_root / split_name
        if split_dir.exists():
            shutil.rmtree(split_dir)
        split_dir.mkdir(parents=True, exist_ok=True)

    class_names: list[str] = []
    for class_name in sorted(class_files):
        class_names.append(class_name)
        train_files, val_files, test_files = split_files(class_files[class_name])
        for split_name, split_files in {
            "train": train_files,
            "validation": val_files,
            "test": test_files,
        }.items():
            target_dir = output_root / split_name / class_name
            target_dir.mkdir(parents=True, exist_ok=True)
            for file_path in split_files:
                destination = target_dir / file_path.name
                shutil.copy2(file_path, destination)

    return class_names


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Create cleaned train/validation/test splits for the AgriGo crop disease dataset.")
    parser.add_argument(
        "--source-root",
        type=str,
        required=True,
        help="Root directory containing crops and disease class folders, e.g. raw_dataset/Wheat/Healthy/*.jpg",
    )
    parser.add_argument(
        "--output-root",
        type=str,
        default=str(Path(__file__).resolve().parents[1] / "dataset"),
        help="Directory where train/validation/test folders will be created.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    source_root = Path(args.source_root).resolve()
    output_root = Path(args.output_root).resolve()
    class_names = copy_split(source_root, output_root)
    print(f"Detected {len(class_names)} classes: {', '.join(class_names)}")
    print(f"Dataset saved to: {output_root}")
    for split_name in ["train", "validation", "test"]:
        split_path = output_root / split_name
        print(f"{split_name}: {len(list(split_path.glob('*')))} class folders created")


if __name__ == "__main__":
    main()
