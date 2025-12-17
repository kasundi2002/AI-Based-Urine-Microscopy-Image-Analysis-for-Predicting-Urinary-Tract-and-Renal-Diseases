# app/models/yeast_detector.py

from ultralytics import YOLO
from PIL import Image
from io import BytesIO
import numpy as np

YEAST_MODEL_PATH = "ml-services/kasundi/models/yeast/yeast_yolov11.pt"
yeast_model = YOLO(YEAST_MODEL_PATH)

def detect_yeast(image_bytes: bytes) -> int:
    """
    Detect yeast cells and return count
    """
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    image_np = np.array(image)

    results = yeast_model(image_np, conf=0.25)

    yeast_count = 0
    for r in results:
        if r.boxes is not None:
            yeast_count += len(r.boxes)

    return int(yeast_count)
