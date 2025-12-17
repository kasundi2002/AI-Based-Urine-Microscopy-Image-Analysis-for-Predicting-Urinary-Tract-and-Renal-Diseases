# app/models/ecoli_classifier.py

import torch
import timm
from torchvision import transforms
from PIL import Image
from io import BytesIO

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

MODEL_PATH = "ml-services/kasundi/models/bacteria/ecoli_efficientnet_b0.pth"

model = timm.create_model(
    "efficientnet_b0",
    pretrained=False,
    num_classes=2
)

model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
model.to(DEVICE)
model.eval()

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor()
])

def classify_ecoli(image_bytes: bytes) -> bool:
    """
    Returns True if E. coli is present
    """
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    image = transform(image).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        logits = model(image)
        pred = torch.argmax(logits, dim=1).item()

    return bool(pred == 1)
