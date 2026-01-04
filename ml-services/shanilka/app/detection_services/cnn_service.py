import os
import torch
from torchvision import models, transforms
from PIL import Image

# -------------------------------------------------
# Resolve BASE directory safely
# app/detection_services/cnn_service.py → app/
# -------------------------------------------------
BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.dirname(__file__))
)


MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "efficientnet_b0_best.pth"
)

# -------------------------------------------------
# Load EfficientNet-B0 (SAME architecture as training)
# -------------------------------------------------
cnn_model = models.efficientnet_b0(weights=None)

# Replace classifier for binary classification
cnn_model.classifier[1] = torch.nn.Linear(
    cnn_model.classifier[1].in_features,
    2
)

# Load trained weights
cnn_model.load_state_dict(
    torch.load(MODEL_PATH, map_location="cpu")
)

cnn_model.eval()

# -------------------------------------------------
# Image preprocessing (MATCH TRAINING)
# -------------------------------------------------
cnn_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# -------------------------------------------------
# Classification function
# -------------------------------------------------
def classify_crop(crop: Image.Image) -> bool:
    """
    Returns:
        True  → cast
        False → no_cast
    """
    input_tensor = cnn_transform(crop).unsqueeze(0)

    with torch.no_grad():
        output = cnn_model(input_tensor)
        pred = torch.argmax(output, dim=1).item()

    return pred == 1  # 1 = cast
