import os
import torch
import timm
from torchvision import transforms
from PIL import Image
from io import BytesIO

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "bacteria",
    "ecoli_efficientnet_b0.pth"
)

# Recreate model architecture
model = timm.create_model(
    "efficientnet_b0",
    pretrained=False,
    num_classes=2
)

# ✅ LOAD CHECKPOINT (THIS IS THE KEY FIX)
checkpoint = torch.load(
    MODEL_PATH,
    map_location=DEVICE,
    weights_only=False   # trusted checkpoint
)

# 🔑 Extract actual model weights
state_dict = checkpoint["model"]

model.load_state_dict(state_dict)
model.to(DEVICE)
model.eval()

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor()
])

def classify_ecoli(image_bytes: bytes) -> bool:
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    image = transform(image).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        logits = model(image)
        pred = torch.argmax(logits, dim=1).item()

    return pred == 1
