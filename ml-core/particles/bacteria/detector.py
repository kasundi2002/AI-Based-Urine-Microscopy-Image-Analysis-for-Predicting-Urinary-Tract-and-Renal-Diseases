import os
import cv2
import numpy as np
from ultralytics import YOLO
from core.base_detector import BaseDetector

class BacteriaDetector(BaseDetector):
    def __init__(self):
        super().__init__()
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        model_path = os.path.join(base_dir, "models", "bacteria_yolov9s.pt")
        self.model = YOLO(model_path)

    def detect(self, image_bytes: bytes) -> dict:
        image_np = cv2.imdecode(
            np.frombuffer(image_bytes, np.uint8),
            cv2.IMREAD_COLOR
        )
        image_rgb = cv2.cvtColor(image_np, cv2.COLOR_BGR2RGB)

        results = self.model(image_rgb, conf=0.20)
        
        boxes_out = []
        count = 0
        
        for r in results:
            if r.boxes is not None:
                for box in r.boxes:
                    count += 1
                    bbox = box.xyxy[0].cpu().numpy().tolist()
                    conf = float(box.conf[0].cpu().item())
                    
                    boxes_out.append({
                        "bbox": bbox,
                        "confidence": round(conf, 4)
                    })
                    
        return {
            "count": count,
            "boxes": boxes_out
        }
