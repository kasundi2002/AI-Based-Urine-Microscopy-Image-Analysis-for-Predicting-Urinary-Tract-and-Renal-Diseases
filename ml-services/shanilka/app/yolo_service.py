from ultralytics import YOLO
import numpy as np
from PIL import Image
import io

# Load YOLO model ONCE
model = YOLO("models/best.pt")

def run_yolo(image_bytes):
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img_np = np.array(image)

    results = model(img_np)[0]

    detections = []

    for box in results.boxes:
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        conf = float(box.conf[0])

        detections.append({
            "bbox": [x1, y1, x2, y2],
            "confidence": conf
        })

    return {
        "cast_detected": len(detections) > 0,
        "cast_count": len(detections),
        "detections": detections
    }
