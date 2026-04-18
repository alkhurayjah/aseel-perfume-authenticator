<div align="center">

# Aseel — Perfume Authenticity Detector


**Counterfeit Perfume Detection using Computer Vision · كشف العطور المقلدة باستخدام الرؤية الحاسوبية**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-aseel--perfume--authenticator.onrender.com-blue?style=for-the-badge)](https://aseel-perfume-authenticator.onrender.com/)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python&logoColor=white)
![PyTorch](https://img.shields.io/badge/PyTorch-EfficientNet--B4-EE4C2C?style=flat&logo=pytorch&logoColor=white)


</div>
## 🌐 Live Demo

Try the app live here:
**[https://aseel-perfume-authenticator.onrender.com](https://aseel-perfume-authenticator.onrender.com)**

Upload a perfume bottle image and get an instant **Original / Fake** prediction with a confidence score

---


---

##  Overview
Counterfeit products are a growing form of commercial fraud, causing significant harm to both manufacturers and consumers. Perfumes, in particular, are frequently imitated due to their high market value and brand recognition. Many customers struggle to distinguish between genuine and fake products.

**Aseel** is a smart detection system designed to identify counterfeit perfumes using advanced image analysis techniques. By analyzing a single image of a perfume bottle, the system determines whether the product is **Original** or **Fake**, along with a confidence score.

---
##  Problem Statement
- The proliferation of counterfeit perfumes in the market
- ​​Difficulty distinguishing between genuine and counterfeit products
- Financial losses for manufacturers and deception of consumers

## Our Solution
We developed an automated system that:
- Analyzes visual features such as **logo, text, color, and bottle shape**
- Detects subtle differences between original and counterfeit products
- Provides instant classification results with confidence levels

---

##  Technologies Used

Aseel is built on **MobileNetV3-Large** fine-tuned with a two-phase transfer learning strategy:

| Phase | What happens |
|---|---|
| **Phase 1 – Head warm-up** | Backbone frozen; only the new classifier head trains for 15 epochs |
| **Phase 2 – Full fine-tune** | Entire network unfrozen; trains with differential learning rates for up to 30 epochs |

The model learns to distinguish authentic packaging from counterfeits by focusing on **print quality, label typography, cap finish, and hologram details** — verified visually with Grad-CAM heatmaps.

---


##  Future Work

- [ ] Expand dataset with more perfume and other brands like Makeup and Cream brands
- [ ] Calibration layer (temperature scaling) for better probability estimates










