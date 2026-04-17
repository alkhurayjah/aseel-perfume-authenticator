<div align="center">

# 🌸 Aseel — Perfume Authenticity Detector
### أصيل — كاشف أصالة العطور

**AI-powered counterfeit perfume detection · كشف العطور المقلدة بالذكاء الاصطناعي**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-aseel--perfume--authenticator.onrender.com-blue?style=for-the-badge)](https://aseel-perfume-authenticator.onrender.com/)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python&logoColor=white)
![PyTorch](https://img.shields.io/badge/PyTorch-EfficientNet--B4-EE4C2C?style=flat&logo=pytorch&logoColor=white)
![YOLOv8](https://img.shields.io/badge/YOLOv8-Detection-purple?style=flat)
![PaddleOCR](https://img.shields.io/badge/PaddleOCR-Arabic%20%2B%20English-0070f3?style=flat)

</div>

---

## 📖 Overview | نظرة عامة

**English:** Aseel is an AI system that detects whether a perfume is genuine or counterfeit from a single photo. Upload an image of any perfume bottle and the system returns an instant verdict — **Original** or **Fake** — along with a confidence score.

**العربية:** أصيل هو نظام ذكاء اصطناعي يكشف ما إذا كان العطر أصلياً أم مقلداً من صورة واحدة فقط. ارفع صورة أي زجاجة عطر وسيعطيك النظام حكمًا فوريًا — **أصلي** أم **مقلد** — مع نسبة الثقة.

---

## 🌐 Live App | التطبيق المباشر

👉 **[https://aseel-perfume-authenticator.onrender.com/](https://aseel-perfume-authenticator.onrender.com/)**

**How to use:**
1. Open the app
2. Upload a clear photo of the perfume bottle, or use your camera
3. Click **"Analyze"** — get your result in seconds

**طريقة الاستخدام:**
1. افتح التطبيق
2. ارفع صورة واضحة لزجاجة العطر، أو استخدم الكاميرا مباشرة
3. اضغط **"تحليل العطر"** — احصل على النتيجة في ثوانٍ

---

## How It Works 

The system combines two AI models in a unified pipeline:

### Model 1 — EfficientNet-B4 + PaddleOCR (Classification)

A deep learning classifier fused with OCR features:

| Component | Detail |
|---|---|
| **Backbone** | EfficientNet-B4 (ImageNet pre-trained) |
| **OCR Engine** | PaddleOCR — supports Arabic & English |
| **Fusion** | CNN visual features + OCR text features → joint classifier |
| **Training Strategy** | Progressive unfreezing in 3 phases |
| **Augmentation** | Albumentations — color jitter, blur, perspective, label smoothing |
| **Class Imbalance** | WeightedRandomSampler + focal loss |
| **Explainability** | Grad-CAM heatmaps showing what the model focuses on |

### Model 2 — YOLOv8s (Object Detection)

A YOLO detector trained to localize and classify perfume regions:

| Component | Detail |
|---|---|
| **Architecture** | YOLOv8s |
| **Input Size** | 800×800 |
| **Classes** | `fake-perfumes` · `original` |
| **Dataset** | 334 images, COCO format (Roboflow export) |
| **Augmentations** | Mosaic, MixUp, CopyPaste, perspective |

---

##  What the Models Detect

The AI learns to spot these fraud indicators:

- 🎨 **Wrong color saturation** in box artwork or label
- 🔤 **Bold, oversized, or blurry text** on the packaging
- 🏷️ **Missing or misspelled brand name** (detected via OCR)
- 📐 **Bottle shape / proportion inconsistencies**
- 🖼️ **Logo position or size differences**
- 🔍 **Low OCR confidence** — indicating irregular or printed-over text

---

## Dataset 

| Split | Images | fake-perfumes | original |
|---|---|---|---|
| Train (70%) | ~234 | ~155 | ~79 |
| Val (20%) | ~67 | ~44 | ~23 |
| Test (10%) | ~33 | ~22 | ~11 |
| **Total** | **334** | **221** | **129** |

- Annotated using **Roboflow** in COCO format
- Augmentations applied during training (not pre-processing)
- Perceptual deduplication and minimum-size filtering applied

---

## Project Structure | هيكل المشروع

```
aseel-perfume-authenticator/
│
├── perfume_detection.ipynb     # Full training pipeline (EfficientNet-B4 + OCR)
├── fake_perfume_yolov8.ipynb   # YOLOv8 training pipeline
│
├── models/
│   ├── best_model.pth          # EfficientNet-B4 best weights
│   └── inference_config.json   # OCR normalization stats + config
│
├── dataset/
│   ├── images/
│   │   ├── train/
│   │   ├── val/
│   │   └── test/
│   └── labels/                 # YOLO format labels
│
├── results/
│   ├── eda.png
│   ├── training_history.png
│   ├── test_evaluation.png
│   ├── gradcam_*.png
│   └── ocr_ablation.png
│
└── README.md
```

---

##  Training Pipeline 

The EfficientNet notebook (`perfume_detection.ipynb`) follows these steps:

1. **Dataset Extraction & HEIC Conversion** — standardize all images to JPEG
2. **Data Quality** — perceptual deduplication + minimum size filter
3. **Exploratory Data Analysis** — class distribution, brightness, color channels
4. **Advanced Augmentation** — color shifts, text blur, logo perturbation
5. **Transfer Learning** — EfficientNet-B4 with progressive unfreezing:
   - Phase 1 (5 epochs): Freeze backbone, train head only
   - Phase 2 (5 epochs): Unfreeze top 3 blocks
   - Phase 3 (10 epochs): Full fine-tuning
6. **OCR Branch** — PaddleOCR extracts text features per image
7. **Feature Fusion** — CNN features + OCR features → final classifier
8. **Evaluation** — Confusion matrix, ROC curve, Precision-Recall curve
9. **Grad-CAM** — Visual explanation of model decisions
10. **OCR Ablation Study** — measures OCR contribution to AUC
11. **Export** — `best_model.pth` + `inference_config.json`

---

## ⚙️ Running Locally

### Requirements

```bash
pip install torch torchvision timm albumentations
pip install paddlepaddle==2.6.1 paddleocr
pip install opencv-python-headless scikit-learn
pip install matplotlib seaborn pandas numpy tqdm
pip install grad-cam imagehash imutils ultralytics
```

### Load Model for Inference

```python
import json, torch
from pathlib import Path

with open('models/inference_config.json') as f:
    cfg = json.load(f)

model = CounterfeitDetector('efficientnet_b4', len(cfg['ocr_cols'])).to(device)
ckpt = torch.load('models/best_model.pth', map_location=device)
model.load_state_dict(ckpt['model_state'])
model.eval()

result = predict_image('path/to/perfume.jpg', model, ocr_engine,
                       ocr_means, ocr_stds, threshold=0.5)
print(result)
# → {'prediction': 'FAKE', 'fake_prob': 87.3, 'indicators': [...]}
```

### Run on Google Colab

Open either notebook in Colab, enable **GPU runtime (T4)**, and run all cells top to bottom. The notebooks handle dataset upload, training, and export automatically.

---

##  Model Performance

### YOLOv8s Results

| Metric | Validation | Test |
|---|---|---|
| mAP@50 | 0.534 | 0.542 |
| mAP@50-95 | 0.324 | 0.299 |
| Precision | 0.508 | 0.522 |
| Recall | 0.542 | 0.587 |

> Performance improves with more data — especially more `original` class images to balance the dataset.

---

## Tech Stack 

| Layer | Technology |
|---|---|
| Deep Learning | PyTorch, timm (EfficientNet-B4) |
| Detection | Ultralytics YOLOv8 |
| OCR | PaddleOCR (Arabic + English) |
| Augmentation | Albumentations |
| Explainability | pytorch-grad-cam |
| Data Annotation | Roboflow (COCO format) |
| Web App | Render.com |

---

## Author 

**Aseel** — Built using computer vision and deep learning.

---

## License

This project is for educational and research purposes.

---

<div align="center">
<sub>أصيل © 2025 — مدعوم بالذكاء الاصطناعي | Powered by AI</sub>
</div>

