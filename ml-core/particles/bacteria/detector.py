import os
import numpy as np
import cv2
from ultralytics import YOLO
from PIL import Image
import torch
import timm
from torchvision import transforms
from core.base_detector import BaseDetector


def _resolve_model_path(base_dir: str, candidates):
    for rel_path in candidates:
        candidate = os.path.normpath(os.path.join(base_dir, rel_path))
        if os.path.exists(candidate):
            return candidate
    return None


class BacteriaDetector(BaseDetector):
    """Detects bacteria particles in microscopic images using YOLO."""

    def __init__(self):
        super().__init__()
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        model_path = _resolve_model_path(base_dir, [
            os.path.join("models", "bacteria", "best_bacteria_detect_yolov9s.pt"),
            os.path.join("models", "bacteria", "bacteria_yolov9s.pt"),
            os.path.join("models", "bacteria_yolov9s.pt"),
            os.path.join("..", "ml-services", "kasundi", "kasundi", "models", "bacteria", "best_bacteria_detect_yolov9s.pt"),
            os.path.join("..", "ml-services", "kasundi", "kasundi", "models", "bacteria", "bacteria_yolov9s.pt"),
        ])

        if not model_path:
            raise FileNotFoundError(
                "YOLO bacteria detector model not found in supported locations under ml-core/models or ml-services/kasundi"
            )

        self.model = YOLO(model_path)

    def detect(self, image_bytes: bytes) -> dict:
        image_np = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)

        if image is None:
            raise ValueError("Could not decode image bytes")

        results = self.model(image, conf=0.50)
        detections = {"boxes": [], "count": 0}

        if results and len(results) > 0:
            result = results[0]
            if result.boxes is not None and len(result.boxes) > 0:
                detections["count"] = len(result.boxes)
                for box in result.boxes:
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().astype(int).tolist()
                    detections["boxes"].append({
                        "bbox": [x1, y1, x2, y2],
                        "confidence": float(box.conf[0].cpu().numpy())
                    })

        return detections


class EcoliClassifier(BaseDetector):
    """Classifies detected bacteria particles as E. coli or other bacteria."""

    def __init__(self):
        super().__init__()
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        model_path = _resolve_model_path(base_dir, [
            os.path.join("models", "bacteria", "ecoli_efficientnet_b0.pth"),
            os.path.join("models", "ecoli_efficientnet_b0.pth"),
            os.path.join("..", "ml-services", "kasundi", "kasundi", "models", "bacteria", "ecoli_efficientnet_b0.pth"),
        ])

        if not model_path:
            print("Warning: E.coli classifier model not found. Defaulting to generic bacteria classification.")
            self.model = None
        else:
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
            state_dict = checkpoint.get("model", checkpoint)
            self.model.load_state_dict(state_dict)
            self.model.to(self.device)
            self.model.eval()

        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor()
        ])

    def classify(self, image: Image.Image) -> dict:
        if self.model is None:
            return {
                "is_ecoli": False,
                "confidence": 1.0,
                "class": "Other bacteria"
            }

        image_tensor = self.transform(image.convert("RGB")).unsqueeze(0).to(self.device)

        with torch.no_grad():
            logits = self.model(image_tensor)
            probs = torch.softmax(logits, dim=1)
            pred = torch.argmax(logits, dim=1).item()
            confidence = float(probs[0, pred].cpu().numpy())

        is_ecoli = (pred == 1)
        return {
            "is_ecoli": is_ecoli,
            "confidence": confidence,
            "class": "E. coli" if is_ecoli else "Other bacteria"
        }
