import os
from ultralytics import YOLO
from PIL import Image
from io import BytesIO
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
YEAST_MODEL_PATH = os.path.join(BASE_DIR, "models", "yeast", "yeast_yolov11.pt")

yeast_model = YOLO(YEAST_MODEL_PATH)

from typing import Tuple, List


def detect_yeast(image_bytes: bytes) -> Tuple[int, List[List[float]]]:
    """Run the yeast detector and return count plus bounding boxes.

    Args:
        image_bytes: Raw image bytes.
    Returns:
        (count, boxes) where boxes is list of [x1,y1,x2,y2].
    """
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    image_np = np.array(image)

    results = yeast_model(image_np, conf=0.25)
    boxes: List[List[float]] = []
    for r in results:
        if r.boxes is not None:
            coords = r.boxes.xyxy.cpu().numpy().tolist()
            boxes.extend(coords)

    return len(boxes), boxes
