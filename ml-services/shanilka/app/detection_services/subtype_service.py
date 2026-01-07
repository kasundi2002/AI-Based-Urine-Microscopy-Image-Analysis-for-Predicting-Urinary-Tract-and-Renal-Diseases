import os
import cv2
import torch
import torch.nn as nn
import numpy as np
from torchvision.models import efficientnet_b2, EfficientNet_B2_Weights

# -------------------------------------------------
# Device
# -------------------------------------------------
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# -------------------------------------------------
# Resolve BASE directory
# app/detection_services/subtype_service.py → shanilka/
# -------------------------------------------------
BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.dirname(__file__))
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "efficientnet_b2_best.pth"
)

# -------------------------------------------------
# Subtype classes (ORDER MUST MATCH TRAINING)
# -------------------------------------------------
CLASS_NAMES = ["hyaline", "granular", "wbc", "rbc", "waxy"]
NUM_CLASSES = len(CLASS_NAMES)

# -------------------------------------------------
# Load CNN model (ONCE)
# -------------------------------------------------
def load_subtype_model():
    weights = EfficientNet_B2_Weights.IMAGENET1K_V1
    model = efficientnet_b2(weights=weights)

    in_features = model.classifier[1].in_features

    # 🔒 EXACT classifier used during training
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.4, inplace=True),
        nn.Sequential(
            nn.Identity(),
            nn.Linear(in_features, NUM_CLASSES)
        )
    )

    state_dict = torch.load(MODEL_PATH, map_location=DEVICE)
    model.load_state_dict(state_dict, strict=True)

    model.to(DEVICE)
    model.eval()

    return model

SUBTYPE_MODEL = load_subtype_model()

# -------------------------------------------------
# Predict subtype
# -------------------------------------------------
def predict_subtype(crop_np: np.ndarray):
    # Resize
    image = cv2.resize(crop_np, (260, 260))

    # Convert to float32
    image = image.astype(np.float32) / 255.0

    # ImageNet normalization (float32-safe)
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std  = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    image = (image - mean) / std

    # To tensor (float32)
    image = torch.from_numpy(image).permute(2, 0, 1).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        logits = SUBTYPE_MODEL(image)
        probs = torch.softmax(logits, dim=1)[0]

    pred_idx = torch.argmax(probs).item()
    confidence = float(probs[pred_idx])

    return {
        "subtype": CLASS_NAMES[pred_idx],
        "confidence": round(confidence, 4)
    }
