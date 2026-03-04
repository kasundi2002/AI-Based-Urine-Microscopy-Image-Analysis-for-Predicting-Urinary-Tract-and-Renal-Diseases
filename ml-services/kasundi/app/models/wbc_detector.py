import os
from ultralytics import YOLO
from PIL import Image
from io import BytesIO
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
WBC_MODEL_PATH = os.path.join(BASE_DIR, "models", "wbc", "wbc_yolov11n.pt")

wbc_model = YOLO(WBC_MODEL_PATH)

from typing import Tuple, List


def detect_wbc(image_bytes: bytes) -> Tuple[int, List[List[float]]]:
    """Run the WBC detector and return both count and bounding box coordinates.

    Args:
        image_bytes: JPEG/PNG bytes of the input image.

    Returns:
        A tuple containing the number of detected boxes and a list of
        [x1, y1, x2, y2] coordinates for each box.
    """
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    image_np = np.array(image)

    results = wbc_model(image_np, conf=0.25)
    boxes: List[List[float]] = []
    for r in results:
        if r.boxes is not None:
            # xyxy is an (N,4) tensor of [x1, y1, x2, y2]
            coords = r.boxes.xyxy.cpu().numpy().tolist()
            boxes.extend(coords)

    return len(boxes), boxes
