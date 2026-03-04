import os
from ultralytics import YOLO
from PIL import Image
from io import BytesIO
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
BACTERIA_MODEL_PATH = os.path.join(BASE_DIR, "models", "bacteria", "best_bacteria_detect_yolov9s.pt")

bacteria_model = YOLO(BACTERIA_MODEL_PATH)

from typing import Tuple, List


def detect_bacteria(image_bytes: bytes) -> Tuple[int, List[List[float]]]:
    """Run the bacteria detector and return count and bounding boxes.

    Args:
        image_bytes: Raw image bytes
    Returns:
        Tuple[count, boxes] where boxes is a list of [x1,y1,x2,y2]
    """
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    image_np = np.array(image)

    results = bacteria_model(image_np, conf=0.25)
    boxes: List[List[float]] = []
    for r in results:
        if r.boxes is not None:
            coords = r.boxes.xyxy.cpu().numpy().tolist()
            boxes.extend(coords)

    return len(boxes), boxes
