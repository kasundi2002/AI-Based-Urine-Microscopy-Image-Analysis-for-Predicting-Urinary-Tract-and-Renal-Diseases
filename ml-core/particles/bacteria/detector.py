import os
import numpy as np
import cv2
from ultralytics import YOLO
from PIL import Image
from io import BytesIO
import torch
import timm
from torchvision import transforms

from core.base_detector import BaseDetector


class BacteriaDetector(BaseDetector):
    """Detects bacteria particles in microscopic images using YOLO"""
    def __init__(self):
        super().__init__()
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        yolo_path = os.path.join(base_dir, "models", "bacteria", "best_bacteria_detect_yolov9s.pt")
        
        if not os.path.exists(yolo_path):
            raise FileNotFoundError(f"YOLO bacteria detector model not found at {yolo_path}")
        
        self.yolo_model = YOLO(yolo_path)

    def detect(self, image_bytes: bytes) -> dict:
        """Detect bacteria particles in image and return bounding boxes"""
        image_np = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)
        
        if image is None:
            raise ValueError("Could not decode image bytes")
        
        results = self.yolo_model(image, conf=0.25)
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
    """Classifies individual bacteria particles as E. coli or not using EfficientNet"""
    def __init__(self):
        super().__init__()
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        model_path = os.path.join(base_dir, "models", "bacteria", "ecoli_efficientnet_b0.pth")

        if not os.path.exists(model_path):
            raise FileNotFoundError(f"E.coli classifier model not found at {model_path}")

        # recreate architecture
        self.model = timm.create_model(
            "efficientnet_b0",
            pretrained=False,
            num_classes=2
        )

        try:
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
        except Exception as e:
            raise RuntimeError(f"Failed to load E.coli classifier: {e}")

        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor()
        ])

    def classify(self, image: Image.Image) -> dict:
        """Classify a single bacteria particle as E.coli or not
        
        Args:
            image: PIL Image of a bacteria particle
            
        Returns:
            dict with 'is_ecoli' (bool), 'confidence' (float), and 'class' (str)
        """
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


class BacteriaDetector(BaseDetector):
    """YOLO-based bacteria detector"""
    def __init__(self):
        super().__init__()
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        model_path = os.path.join(base_dir, "models", "bacteria", "best_bacteria_detect_yolov9s.pt")
        self.model = YOLO(model_path)

    def detect(self, image_bytes: bytes) -> dict:
        image_np = np.frombuffer(image_bytes, np.uint8)
        import cv2
        image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)
        
        if image is None:
            raise ValueError("Could not decode image bytes")
        
        results = self.model(image, conf=0.25)
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
