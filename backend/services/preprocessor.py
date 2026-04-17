import io
import torch
from PIL import Image
from torchvision import transforms

INPUT_SIZE = 224

_transform = transforms.Compose([
    transforms.Resize((INPUT_SIZE, INPUT_SIZE)),
    transforms.ToTensor(),
    # ImageNet normalization — standard for MobileNetV3 pretrained on ImageNet
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])


def preprocess(image_bytes: bytes) -> torch.Tensor:
    """Return a (1, 3, 224, 224) float tensor ready for inference."""
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    tensor = _transform(image)
    return tensor.unsqueeze(0)
