import os
import cv2
import numpy as np
from ultralytics import YOLO

import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from core.base_detector import BaseDetector

class CrystalDetector(BaseDetector):
    def __init__(self):
        # Resolve path to ml-core/models/crystal_best.pt
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        model_path = os.path.join(base_dir, "models", "crystal_best.pt")
        
        # Load YOLO model ONCE
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"YOLO model not found at: {model_path}")
        self.model = YOLO(model_path)
        print("Crystal Model Classes:", self.model.names)

    def detect(self, image_bytes: bytes):
        # Convert image_bytes -> NumPy array using np.frombuffer + cv2.imdecode
        img_np = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(img_np, cv2.IMREAD_COLOR)

        if img is None:
            raise ValueError("Could not decode image bytes")

        # Run inference
        results = self.model(img, conf=0.35)

        detections = []
        # Process results
        for result in results:
            boxes = result.boxes
            for box in boxes:
                # Bounding box coordinates
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                
                # Confidence
                conf = box.conf[0].item()
                
                # Class
                cls = int(box.cls[0].item())
                if result.names:
                    class_name = result.names[cls]
                else:
                    class_name = str(cls)

                detections.append({
                    "bbox": [int(x1), int(y1), int(x2), int(y2)],
                    "confidence": round(float(conf), 3),
                    "class_name": class_name
                })

        return {
            "count": len(detections),
            "boxes": detections
        }
