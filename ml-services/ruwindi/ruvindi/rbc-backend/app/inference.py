import torch
from app.utils import preprocess_image

def predict_rbc(model, image):
    x = preprocess_image(image)
    with torch.no_grad():
        logits = model(x)
        prob = torch.sigmoid(logits).item()

    label = "iso" if prob >= 0.5 else "dys"
    return label, prob
