import os
import io
import numpy as np
from PIL import Image
from ultralytics import YOLO

import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from core.base_detector import BaseDetector

class CastDetector(BaseDetector):
    def __init__(self):
        # Resolve path to ml-core/models/cast/cast_best.pt
        # __file__ is ml-core/particles/cast/detector.py
        # Need to go up 3 levels to ml-core
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        model_path = os.path.join(base_dir, "models", "cast", "cast_best.pt")
        
        # Load YOLO model ONCE
        self.model = YOLO(model_path)

    def detect(self, image_bytes: bytes):
        # Load image
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img_np = np.array(image)

        # Run YOLO
        results = self.model(img_np, conf=0.25)[0]

        detections = []
        for box in results.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            det_conf = float(box.conf[0])

            # Safety check
            if x2 <= x1 or y2 <= y1:
                continue

            detections.append({
                "bbox": [x1, y1, x2, y2],
                "confidence": round(det_conf, 3)
            })

        return {
            "count": len(detections),
            "boxes": detections
        }
