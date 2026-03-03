import torch
import timm
import torch.nn as nn
from torchvision import transforms

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ImageNet normalization
transform = transforms.Compose([
    transforms.Resize((260, 260)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

def load_model(weight_path):
    model = timm.create_model(
        "efficientnet_b3",
        pretrained=False,
        num_classes=1
    )
    model.load_state_dict(torch.load(weight_path, map_location=DEVICE))
    model.to(DEVICE)
    model.eval()
    return model

def predict_rbc(model, image):
    """
    image: PIL Image (cropped RBC)
    returns: (label, probability)
    """
    img = transform(image).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        logits = model(img)
        prob = torch.sigmoid(logits).item()

    label = "dys" if prob >= 0.5 else "iso"
    return label, round(prob, 4)
