# AgriGo Crop Disease Detection with ResNet-50

This project implements a production-oriented crop disease detection pipeline for Indian crops using PyTorch and transfer learning with ResNet-50.

## Project structure

```text
ml/
├── README.md
├── requirements.txt
├── predict.py
├── preprocessing/
│   └── preprocess.py
├── training/
│   └── train.py
├── dataset/
│   ├── train/
│   ├── validation/
│   └── test/
├── outputs/
│   ├── agrigo_disease_resnet50.pth
│   ├── class_names.json
│   ├── training_metrics.json
│   └── test_metrics.json
└── raw_dataset/
    └── (your source class folders)
```

## Supported classes

The model automatically detects all classes from your dataset folders instead of using a hardcoded class count. The expected leaf disease classes include:

- Wheat Healthy
- Wheat Rust
- Rice Healthy
- Rice Brown Spot
- Rice Leaf Blast
- Tomato Healthy
- Tomato Early Blight
- Tomato Late Blight
- Potato Healthy
- Potato Early Blight
- Potato Late Blight
- Cotton Healthy
- Cotton Leaf Disease
- Maize Healthy
- Maize Leaf Disease
- Chilli Healthy
- Chilli Leaf Disease

## 1) Install dependencies

### Local machine

```bash
cd "C:/Users/DELL/Desktop/AgriGo"
python -m venv .venv
.venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r ml/requirements.txt
```

### Google Colab GPU

```python
!python -m pip install --upgrade pip
!pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
!pip install scikit-learn pillow numpy matplotlib seaborn tqdm
```

If you want to keep the environment identical to the project file:

```python
!pip install -r /content/AgriGo/ml/requirements.txt
```

## 2) Prepare the dataset

Create your raw dataset on your local machine or Google Drive in this structure:

```text
raw_dataset/
├── Wheat/
│   ├── Healthy/
│   │   ├── img_001.jpg
│   │   └── ...
│   └── Rust/
│       ├── img_002.jpg
│       └── ...
├── Rice/
│   ├── Healthy/
│   ├── Brown_Spot/
│   └── Leaf_Blast/
├── Tomato/
│   ├── Healthy/
│   ├── Early_Blight/
│   └── Late_Blight/
├── Potato/
│   ├── Healthy/
│   ├── Early_Blight/
│   └── Late_Blight/
├── Cotton/
│   ├── Healthy/
│   └── Leaf_Disease/
├── Maize/
│   ├── Healthy/
│   └── Leaf_Disease/
├── Chilli/
│   ├── Healthy/
│   └── Leaf_Disease/
```

### Important dataset rule

Only keep valid images. Corrupted files are automatically skipped by the preprocessing script. The script validates each image with PIL before copying it into the final dataset.

## 3) Upload dataset to Google Colab

### Option A: Upload directly from your computer

```python
from google.colab import files
uploaded = files.upload()
```

Then move everything into a folder such as:

```python
!mkdir -p /content/AgriGo/raw_dataset
!mv /content/*.zip /content/AgriGo/
```

If you uploaded a ZIP archive:

```python
!cd /content/AgriGo && unzip raw_dataset.zip -d .
```

### Option B: Mount Google Drive and place the data there

```python
from google.colab import drive

drive.mount('/content/drive')
```

Then upload your raw dataset to Drive, for example:

```text
MyDrive/AgriGo/raw_dataset/
```

Then access it with:

```python
RAW_DATASET = "/content/drive/MyDrive/AgriGo/raw_dataset"
```

## 4) Create train, validation, test splits

From the project root:

```bash
python ml/preprocessing/preprocess.py --source-root /path/to/raw_dataset --output-root /path/to/AgriGo/ml/dataset
```

On Colab:

```python
!python /content/AgriGo/ml/preprocessing/preprocess.py \
  --source-root /content/drive/MyDrive/AgriGo/raw_dataset \
  --output-root /content/drive/MyDrive/AgriGo/ml/dataset
```

This creates:

```text
ml/dataset/
├── train/
├── validation/
└── test/
```

The script will:

- read all crop and disease folders automatically
- detect the number of classes automatically
- validate each image
- skip corrupted or invalid files safely
- split into train/validation/test using a reproducible seed
- copy valid files into the final dataset

## 5) Start training

### Local machine

```bash
cd "C:/Users/DELL/Desktop/AgriGo"
python ml/training/train.py --data-root ml/dataset --output-dir ml/outputs
```

### Google Colab GPU

```python
!cd /content/AgriGo && python ml/training/train.py \
  --data-root /content/drive/MyDrive/AgriGo/ml/dataset \
  --output-dir /content/drive/MyDrive/AgriGo/ml/outputs
```

The training script:

- loads the dataset from the train/validation/test folders
- builds a ResNet-50 model with pretrained ImageNet weights
- freezes the backbone initially
- trains the classification head
- optionally unfreezes the last ResNet block for fine-tuning
- logs loss and accuracy curves
- evaluates on the test split
- saves metrics and a confusion matrix

## 6) What gets generated after training

The following files are generated in the output directory you pass to the training script:

```text
output_dir/
├── agrigo_disease_resnet50.pth
├── class_names.json
├── training_metrics.json
├── test_metrics.json
└── confusion_matrix.png
```

### Exact local output path

For the default local setup, the files are saved here:

```text
C:/Users/DELL/Desktop/AgriGo/ml/outputs/
```

### Exact Colab output path

If you run the training with Drive:

```text
/content/drive/MyDrive/AgriGo/ml/outputs/
```

Then the generated files will be:

```text
/content/drive/MyDrive/AgriGo/ml/outputs/agrigo_disease_resnet50.pth
/content/drive/MyDrive/AgriGo/ml/outputs/class_names.json
```

## 7) Run prediction on a single image

### Local machine

```bash
python ml/predict.py --image "C:/path/to/leaf.jpg" --model "ml/outputs/agrigo_disease_resnet50.pth" --class-names "ml/outputs/class_names.json"
```

### Google Colab

```python
!python /content/AgriGo/ml/predict.py \
  --image /content/drive/MyDrive/AgriGo/sample_images/rice_leaf.jpg \
  --model /content/drive/MyDrive/AgriGo/ml/outputs/agrigo_disease_resnet50.pth \
  --class-names /content/drive/MyDrive/AgriGo/ml/outputs/class_names.json
```

Example output:

```json
{
  "crop": "Rice",
  "predicted_disease": "Brown Spot",
  "confidence_percentage": 94.21,
  "top_3_predictions": [
    {"class_name": "Rice__Brown_Spot", "crop": "Rice", "disease": "Brown Spot", "confidence": 94.21},
    {"class_name": "Rice__Leaf_Blast", "crop": "Rice", "disease": "Leaf Blast", "confidence": 3.87},
    {"class_name": "Rice__Healthy", "crop": "Rice", "disease": "Healthy", "confidence": 1.92}
  ]
}
```

## 8) How to integrate with the AgriGo Django backend

The final production architecture should look like this:

```text
React
  ↓
Django REST API
  ↓
Disease Detection Service
  ↓
ResNet-50 model
  ↓
Prediction
  ↓
DiseaseDetection database record
```

### Recommended backend flow

1. React sends the image to the Django REST API.
2. Django stores the uploaded file and creates a `DiseaseDetection` record.
3. The Django service loads the trained model from the backend model directory.
4. The service runs inference and returns:
   - crop
   - disease
   - confidence
   - top 3 predictions
5. The result is saved to the database and returned to the frontend.

### Recommended folder in your Django project

```text
backend/
├── api/
├── disease_service/
│   ├── __init__.py
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── services.py
│   └── inference.py
├── models/
│   ├── agrigo_disease_resnet50.pth
│   └── class_names.json
└── settings.py
```

### Copy the model into Django

From your local machine after training:

```bash
cp "C:/Users/DELL/Desktop/AgriGo/ml/outputs/agrigo_disease_resnet50.pth" "C:/Users/DELL/Desktop/AgriGo/backend/models/"
cp "C:/Users/DELL/Desktop/AgriGo/ml/outputs/class_names.json" "C:/Users/DELL/Desktop/AgriGo/backend/models/"
```

Make sure the backend loads the file from a stable location and never from a temporary or session directory.

## 9) Training quality and ethics

- No fake accuracy is generated.
- No placeholder predictions are used.
- Model metrics are computed from the actual test set.
- Invalid images are skipped safely and logged.
- Use the same image preprocessing pipeline for training and inference.

## 10) Training command summary

```bash
cd "C:/Users/DELL/Desktop/AgriGo"
python ml/preprocessing/preprocess.py --source-root "C:/path/to/raw_dataset" --output-root "C:/Users/DELL/Desktop/AgriGo/ml/dataset"
python ml/training/train.py --data-root "C:/Users/DELL/Desktop/AgriGo/ml/dataset" --output-dir "C:/Users/DELL/Desktop/AgriGo/ml/outputs"
python ml/predict.py --image "C:/path/to/leaf.jpg" --model "C:/Users/DELL/Desktop/AgriGo/ml/outputs/agrigo_disease_resnet50.pth" --class-names "C:/Users/DELL/Desktop/AgriGo/ml/outputs/class_names.json"
```

This project is ready for real-world SIH crop disease detection with an actual training pipeline and model export for deployment.
