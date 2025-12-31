import torch
from torchvision import models, transforms
from PIL import Image

# -------------------------------
# Load EfficientNet-B0 (SAME as training)
# -------------------------------
cnn_model = models.efficientnet_b0(weights=None)

# Replace classifier for 2 classes (cast / no_cast)
cnn_model.classifier[1] = torch.nn.Linear(
    cnn_model.classifier[1].in_features, 2
)

# Load trained weights
cnn_model.load_state_dict(
    torch.load("models/efficientnet_b0_best.pth", map_location="cpu")
)

cnn_model.eval()

# Image preprocessing (must match training)
cnn_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor()
])

def classify_crop(crop: Image.Image) -> bool:
    """
    Returns True if cast, False if no_cast
    """
    input_tensor = cnn_transform(crop).unsqueeze(0)

    with torch.no_grad():
        output = cnn_model(input_tensor)
        pred = torch.argmax(output, dim=1).item()

    return pred == 1  # 1 = cast
