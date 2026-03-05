import os
import numpy as np
from PIL import Image
import io
from ultralytics import YOLO
from core.base_detector import BaseDetector

class YeastDetector(BaseDetector):
    def __init__(self):
        super().__init__()
        # Ensure model naturally inherits from the ml-core payload
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        model_path = os.path.join(base_dir, "models", "yeast_yolov11.pt")
        
        # Load heavy YOLO weights safely once 
        self.model = YOLO(model_path)

    def detect(self, image_bytes: bytes) -> dict:
        # Deserialize bytes using PIL matching kasundi original logic exactly
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image_rgb = np.array(image)

        # Process inference lowering native conf threshold to boost sensitivity for microscopic dots
        results = self.model(image_rgb, conf=0.15)
        
        boxes_out = []
        count = 0
        
        # Loop over results parsing geometry precisely preserving boundaries
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
