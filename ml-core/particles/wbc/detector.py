import os
import cv2
import numpy as np
from ultralytics import YOLO
from core.base_detector import BaseDetector

class WBCDetector(BaseDetector):
    def __init__(self):
        super().__init__()
        # Model path should resolve to: ml-core/models/wbc_yolov11n.pt
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        model_path = os.path.join(base_dir, "models", "wbc_yolov11n.pt")
        
        # Load YOLO model once
        self.model = YOLO(model_path)

    def detect(self, image_bytes: bytes) -> dict:
        # Convert image_bytes -> numpy array using cv2.imdecode
        image_np = cv2.imdecode(
            np.frombuffer(image_bytes, np.uint8),
            cv2.IMREAD_COLOR
        )
        
        # Match expected original format inside YOLO
        image_rgb = cv2.cvtColor(image_np, cv2.COLOR_BGR2RGB)

        # Run YOLO inference
        results = self.model(image_rgb, conf=0.25)
        
        count = 0
        boxes_out = []
        
        for r in results:
            if r.boxes is not None:
                for box in r.boxes:
                    count += 1
                    bbox = box.xyxy[0].cpu().numpy().tolist()
                    conf = float(box.conf[0].cpu().item())
                    boxes_out.append({
                        "bbox": bbox,
                        "confidence": conf
                    })
                    
        return {
            "count": count,
            "boxes": boxes_out
        }
