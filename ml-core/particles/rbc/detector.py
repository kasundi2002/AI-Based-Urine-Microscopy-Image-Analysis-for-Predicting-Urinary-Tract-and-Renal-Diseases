import os
import io
import numpy as np
from PIL import Image
from ultralytics import YOLO
from core.base_detector import BaseDetector

class RBCDetector(BaseDetector):
    def __init__(self):
        super().__init__()
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        model_path = os.path.join(base_dir, "models", "yolo_rbc_only_best.pt")
        self.model = YOLO(model_path)

    def detect(self, image_bytes: bytes) -> dict:
        # Deserialize bytes using PIL mapping matching original configuration natively
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image_rgb = np.array(image)

        # Process inference lowering native conf threshold to boost sensitivity for microscopic dots
        results = self.model.predict(image_rgb, conf=0.35, verbose=False)
        
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
