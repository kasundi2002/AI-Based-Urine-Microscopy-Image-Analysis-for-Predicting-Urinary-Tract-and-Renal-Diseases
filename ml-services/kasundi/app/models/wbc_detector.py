# app/models/wbc_detector.py

from ultralytics import YOLO
from PIL import Image
from io import BytesIO
import numpy as np

# Load model ONCE
WBC_MODEL_PATH = "ml-services/kasundi/models/wbc/wbc_yolov11n.pt"
wbc_model = YOLO(WBC_MODEL_PATH)

def detect_wbc(image_bytes: bytes) -> int:
    """
    Detect WBCs and return count
    """
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    image_np = np.array(image)

    results = wbc_model(image_np, conf=0.25)

    wbc_count = 0
    for r in results:
        if r.boxes is not None:
            wbc_count += len(r.boxes)

    return int(wbc_count)
