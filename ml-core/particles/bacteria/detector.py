import os
from io import BytesIO
from PIL import Image
import torch
import timm
from torchvision import transforms

from core.base_detector import BaseDetector


class EcoliDetector(BaseDetector):
    def __init__(self):
        super().__init__()
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        model_path = os.path.join(base_dir, "models", "bacteria", "ecoli_efficientnet_b0.pth")

        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Ecoli classifier checkpoint not found at {model_path}")

        # recreate architecture
        self.model = timm.create_model(
            "efficientnet_b0",
            pretrained=False,
            num_classes=2
        )

        checkpoint = torch.load(
            model_path,
            map_location=self.device,
            weights_only=False
        )
        # checkpoint may wrap weights under "model" key
        state_dict = checkpoint.get("model", checkpoint)
        self.model.load_state_dict(state_dict)
        self.model.to(self.device)
        self.model.eval()

        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor()
        ])

    def detect(self, image_bytes: bytes) -> dict:
        # classification is treated as a detection
        image = Image.open(BytesIO(image_bytes)).convert("RGB")
        image = self.transform(image).unsqueeze(0).to(self.device)
        with torch.no_grad():
            logits = self.model(image)
            pred = torch.argmax(logits, dim=1).item()
        present = (pred == 1)
        return {"ecoli_present": present}
