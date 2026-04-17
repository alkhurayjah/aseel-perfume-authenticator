import zipfile
import os
import torch
import torch.nn as nn
import torchvision.models as models
from pathlib import Path
from zipfile import ZipInfo

MODEL_DIR = Path(__file__).parent.parent.parent / "mobilenetv3_perfume_model"
_TEMP_PT = Path(__file__).parent / "_model_temp.pt"

# Class index → Arabic label
LABELS = {0: "أصلي", 1: "مقلد"}

_model: nn.Module | None = None


def _zip_model_dir() -> Path:
    """Package the unzipped PyTorch model directory into a loadable .pt file."""
    print(f"[MODEL] Packaging model directory: {MODEL_DIR}")
    fallback_date = (2020, 1, 1, 0, 0, 0)
    with zipfile.ZipFile(_TEMP_PT, "w", zipfile.ZIP_STORED) as zf:
        for root, _, files in os.walk(MODEL_DIR):
            for fname in files:
                fpath = Path(root) / fname
                arcname = "archive/" + str(fpath.relative_to(MODEL_DIR))
                zi = ZipInfo(arcname, fallback_date)
                zf.writestr(zi, fpath.read_bytes())
    print(f"[MODEL] Packaged into: {_TEMP_PT}")
    return _TEMP_PT


def _build_model(num_classes: int) -> nn.Module:
    """Reconstruct MobileNetV3-Large with the custom 3-layer classifier used during training."""
    base = models.mobilenet_v3_large(weights=None)
    # Replace classifier to match saved state_dict exactly
    base.classifier = nn.Sequential(
        nn.Linear(960, 512),
        nn.Hardswish(),
        nn.Dropout(p=0.2),
        nn.Linear(512, 256),
        nn.Hardswish(),
        nn.Dropout(p=0.2),
        nn.Linear(256, num_classes),
    )
    return base


def load_model() -> nn.Module:
    global _model
    if _model is not None:
        return _model

    print(f"[MODEL] Loading from disk: {MODEL_DIR}")
    pt_path = _zip_model_dir()
    checkpoint = torch.load(pt_path, map_location="cpu", weights_only=False)

    num_classes: int = checkpoint["num_classes"]
    state_dict = checkpoint["model_state_dict"]
    print(f"[MODEL] Checkpoint loaded — num_classes={num_classes}, state_dict keys={len(state_dict)}")

    model = _build_model(num_classes)
    model.load_state_dict(state_dict)
    model.eval()
    print(f"[MODEL] ✅ MobileNetV3-Large loaded and set to eval mode")

    _model = model
    return _model


def get_model() -> nn.Module:
    if _model is None:
        raise RuntimeError("Model not loaded. Call load_model() during app startup.")
    return _model
