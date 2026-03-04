import os
import cv2
import torch
import torch.nn as nn
import numpy as np
from torchvision.models import efficientnet_b2, EfficientNet_B2_Weights

import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from particles.cast.predictor import CastPredictor

class CastPipeline:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.class_names = ["hyaline", "granular", "wbc", "rbc", "waxy"]
        self.num_classes = len(self.class_names)
        
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        model_path = os.path.join(base_dir, "models", "efficientnet_b2_best.pth")
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model not found at: {model_path}")
            
        weights = EfficientNet_B2_Weights.IMAGENET1K_V1
        self.model = efficientnet_b2(weights=weights)

        in_features = self.model.classifier[1].in_features
        self.model.classifier = nn.Sequential(
            nn.Dropout(p=0.4, inplace=True),
            nn.Sequential(
                nn.Identity(),
                nn.Linear(in_features, self.num_classes)
            )
        )

        state_dict = torch.load(model_path, map_location=self.device)
        self.model.load_state_dict(state_dict, strict=True)
        self.model.to(self.device)
        self.model.eval()
        
        self.predictor = CastPredictor()

    def predict_subtype(self, crop_np: np.ndarray):
        image = cv2.resize(crop_np, (260, 260))
        image = image.astype(np.float32) / 255.0
        mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
        std  = np.array([0.229, 0.224, 0.225], dtype=np.float32)
        image = (image - mean) / std
        image = torch.from_numpy(image).permute(2, 0, 1).unsqueeze(0).to(self.device)

        with torch.no_grad():
            logits = self.model(image)
            probs = torch.softmax(logits, dim=1)[0]

        pred_idx = torch.argmax(probs).item()
        confidence = float(probs[pred_idx])

        return {
            "subtype": self.class_names[pred_idx],
            "confidence": round(confidence, 4)
        }

    def process(self, image_np: np.ndarray, detections: dict):
        subtypes_counts = {name: 0 for name in self.class_names}
        enriched_boxes = []
        
        for det in detections.get("boxes", []):
            x1, y1, x2, y2 = det["bbox"]
            crop_np = image_np[y1:y2, x1:x2]
            
            if crop_np.size == 0:
                enriched_boxes.append(det)
                continue
                
            prediction = self.predict_subtype(crop_np)
            subtype = prediction["subtype"]
            
            if subtype in subtypes_counts:
                subtypes_counts[subtype] += 1
            else:
                subtypes_counts[subtype] = 1
                
            enriched_box = dict(det)
            enriched_box["subtype"] = subtype
            enriched_boxes.append(enriched_box)
                
        total_count = detections.get("count", 0)
        
        if total_count == 0:
            return {
                "detected": False,
                "total_count": 0,
                "boxes": []
            }
            
        disease_risk = self.predictor.predict_disease_risk(total_count)
        
        return {
            "detected": True,
            "total_count": total_count,
            "boxes": enriched_boxes,
            "subtype_summary": subtypes_counts,
            "risk_assessment": {
                "level": disease_risk
            }
        }
