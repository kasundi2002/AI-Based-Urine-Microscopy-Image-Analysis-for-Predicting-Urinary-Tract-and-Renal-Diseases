import os
import io
import numpy as np
from PIL import Image
from ultralytics import YOLO

from app.detection_services.cnn_service import classify_crop

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
    "best.pt"   # use your locked best model
)

# -------------------------------------------------
# Load YOLO model ONCE (important for performance)
# -------------------------------------------------
model = YOLO(MODEL_PATH)

# -------------------------------------------------
# YOLO inference function
# -------------------------------------------------
def run_yolo(image_bytes: bytes):
    # Load image
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img_np = np.array(image)

    # Run YOLO (set confidence threshold explicitly)
    results = model(img_np, conf=0.25)[0]

    detections = []

    for box in results.boxes:
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        conf = float(box.conf[0])

        # Crop detected region
        crop = image.crop((x1, y1, x2, y2))

        # CNN verification (cast / no_cast)
        is_cast = classify_crop(crop)

        if is_cast:
            detections.append({
                "bbox": [x1, y1, x2, y2],
                "confidence": round(conf, 3)
            })

    return {
        "cast_detected": len(detections) > 0,
        "cast_count": len(detections),
        "detections": detections
    }
