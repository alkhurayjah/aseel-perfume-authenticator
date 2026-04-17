import torch
import torch.nn.functional as F
from fastapi import APIRouter, UploadFile, File, HTTPException

from services.model_loader import get_model, LABELS
from services.preprocessor import preprocess
from schemas.prediction import PredictionResponse

router = APIRouter()

LABEL_EN = {0: "Original", 1: "Fake"}


@router.post("/predict", response_model=PredictionResponse)
async def predict(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="يرجى رفع ملف صورة صالح")

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="الملف المرفوع فارغ")

    tensor = preprocess(image_bytes)
    print(f"[INFERENCE] Input tensor shape: {tensor.shape}, dtype: {tensor.dtype}")
    print(f"[INFERENCE] Pixel range after normalization — min: {tensor.min():.4f}, max: {tensor.max():.4f}")

    model = get_model()
    print(f"[INFERENCE] Running forward pass through {type(model).__name__}")

    with torch.no_grad():
        logits = model(tensor)
        print(f"[INFERENCE] Raw logits: {logits.tolist()}")
        probs = F.softmax(logits, dim=1)
        print(f"[INFERENCE] Softmax probabilities: {probs.tolist()}")
        confidence, pred_idx = torch.max(probs, dim=1)

    idx = pred_idx.item()
    print(f"[INFERENCE] Predicted class index: {idx} → {LABEL_EN[idx]} ({LABELS[idx]}) — confidence: {round(float(confidence.item()) * 100, 1)}%")

    return PredictionResponse(
        result=LABELS[idx],
        confidence=round(float(confidence.item()) * 100, 1),
        label_en=LABEL_EN[idx],
    )
