import os
from ultralytics import YOLO
from PIL import Image
from io import BytesIO
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
YEAST_MODEL_PATH = os.path.join(BASE_DIR, "models", "yeast", "yeast_yolov11.pt")

yeast_model = YOLO(YEAST_MODEL_PATH)

def detect_yeast(image_bytes: bytes) -> int:
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    image_np = np.array(image)

    results = yeast_model(image_np, conf=0.25)
    return sum(len(r.boxes) for r in results if r.boxes is not None)
