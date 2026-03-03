import os
import io
import numpy as np
from PIL import Image
from ultralytics import YOLO

from app.detection_services.subtype_service import predict_subtype

# -------------------------------------------------
# Resolve BASE directory safely
# app/detection_services/yolo_service.py → app/
# -------------------------------------------------
BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.dirname(__file__))
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "best.pt"   # YOLO cast detector
)

# -------------------------------------------------
# Load YOLO model ONCE (important for performance)
# -------------------------------------------------
model = YOLO(MODEL_PATH)

# -------------------------------------------------
# YOLO inference + subtype classification
# -------------------------------------------------
def run_yolo(image_bytes: bytes):
    # Load image
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img_np = np.array(image)

    # Run YOLO
    results = model(img_np, conf=0.25)[0]

    detections = []

    for box in results.boxes:
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        det_conf = float(box.conf[0])

        # Safety check
        if x2 <= x1 or y2 <= y1:
            continue

        # Crop detected region
        crop = image.crop((x1, y1, x2, y2))
        crop_np = np.array(crop)

        # -------------------------------
        # SUBTYPE CLASSIFICATION (CNN)
        # -------------------------------
        subtype_result = predict_subtype(crop_np)

        detections.append({
            "bbox": [x1, y1, x2, y2],
            "confidence": round(det_conf, 3),
            "subtype": subtype_result["subtype"],
            "subtype_confidence": subtype_result["confidence"]
        })

    return {
        "cast_detected": len(detections) > 0,
        "cast_count": len(detections),
        "detections": detections
    }
