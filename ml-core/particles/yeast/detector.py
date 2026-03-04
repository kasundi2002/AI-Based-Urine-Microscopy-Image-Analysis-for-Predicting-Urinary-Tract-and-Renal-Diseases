import os
import cv2
import numpy as np
from ultralytics import YOLO

# ensure base detector available on import path
from core.base_detector import BaseDetector


class YeastDetector(BaseDetector):
    def __init__(self):
        super().__init__()
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        # model lives in models/yeast/yeast_yolov11.pt
        model_path = os.path.join(base_dir, "models", "yeast", "yeast_yolov11.pt")

        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Yeast YOLO model not found at: {model_path}")

        self.model = YOLO(model_path)

    def detect(self, image_bytes: bytes) -> dict:
        # decode image bytes into numpy array (BGR)
        image_np = cv2.imdecode(
            np.frombuffer(image_bytes, np.uint8),
            cv2.IMREAD_COLOR
        )
        if image_np is None:
            raise ValueError("Could not decode image bytes")

        # convert to RGB because ultralytics expects RGB images
        image_rgb = cv2.cvtColor(image_np, cv2.COLOR_BGR2RGB)

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
        return {"count": count, "boxes": boxes_out}
