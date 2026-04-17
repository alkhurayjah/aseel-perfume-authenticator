# أصيل — Perfume Authenticator

An Arabic AI-powered web application that detects whether a perfume is **Original (أصلي)** or **Fake (مقلد)** using a pre-trained MobileNetV3 computer vision model.

---

## Features

- Upload a perfume image or use the camera
- Real-time AI inference via MobileNetV3
- Confidence score with each prediction
- Elegant Arabic UI with dark purple/gold theme
- Interactive 3D perfume bottle viewer

---

## Run Locally

### Prerequisites
- Python 3.12+
- pip

### Steps

```bash
# 1. Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate        # macOS/Linux
venv\Scripts\activate           # Windows

# 2. Install dependencies
pip install -r backend/requirements.txt

# 3. Start the server
cd backend
uvicorn main:app --reload --port 8000

# 4. Open in browser
# http://localhost:8000
```

---

## Run with Docker

```bash
# Build the image
docker build -t aseel .

# Run the container
docker run -p 8000:8000 aseel

# Or with docker-compose (local testing)
docker-compose up --build
```

Open **http://localhost:8000**

---

## API

**POST** `/api/predict`

| Field | Type | Description |
|---|---|---|
| `file` | `image/*` | Perfume image (multipart/form-data) |

**Response:**
```json
{
  "result": "أصلي",
  "confidence": 94.3,
  "label_en": "Original"
}
```

---

## Project Structure

```
aseel/
├── backend/
│   ├── main.py                  # FastAPI app
│   ├── router/predict.py        # POST /api/predict
│   ├── services/
│   │   ├── model_loader.py      # Loads MobileNetV3 weights
│   │   └── preprocessor.py      # Image preprocessing
│   ├── schemas/prediction.py    # Response schema
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   └── assets/
│       ├── css/styles.css
│       └── js/
│           ├── main.js
│           └── three_scene.js
├── mobilenetv3_perfume_model/   # Pre-trained model weights
├── Dockerfile
├── docker-compose.yml
└── .gitignore
```

---

## Deployment on Render

1. Push this repository to GitHub
2. Go to [Render](https://render.com) → **New Web Service**
3. Connect your GitHub repository
4. Set **Environment** to `Docker`
5. Render automatically injects `$PORT` — no extra configuration needed
6. Click **Deploy**
