import cv2
import numpy as np
from core.base_detector import BaseDetector

class RBCDetector(BaseDetector):
    def detect(self, image_bytes: bytes) -> dict:
        # 1. Convert bytes to np array using imdecode
        image_np = cv2.imdecode(
            np.frombuffer(image_bytes, np.uint8),
            cv2.IMREAD_COLOR
        )
        
        # 2. Extract grayscale correctly depending on input shape
        if len(image_np.shape) == 3:
            gray = cv2.cvtColor(image_np, cv2.COLOR_BGR2GRAY)
        else:
            gray = image_np

        # 3. Smooth image
        blur = cv2.GaussianBlur(gray, (5, 5), 0)

        # 4. Binary threshold
        _, thresh = cv2.threshold(
            blur, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU
        )

        # 5. Remove small noise
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        opening = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=2)

        # 6. Find contours
        contours, _ = cv2.findContours(
            opening, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )

        boxes_out = []
        count = 0

        for cnt in contours:
            area = cv2.contourArea(cnt)

            # Size filter (tune if needed)
            if area < 150 or area > 3000:
                continue

            perimeter = cv2.arcLength(cnt, True)
            if perimeter == 0:
                continue

            # Circularity measure
            circularity = 4 * np.pi * (area / (perimeter * perimeter))
            if circularity < 0.6:
                continue

            x, y, w, h = cv2.boundingRect(cnt)
            aspect_ratio = w / float(h)

            # Shape filter
            if aspect_ratio < 0.75 or aspect_ratio > 1.3:
                continue
                
            # Convert (x, y, w, h) to (x1, y1, x2, y2) mapping
            x1, y1 = x, y
            x2, y2 = x + w, y + h

            count += 1
            boxes_out.append({
                "bbox": [x1, y1, x2, y2]
            })

        return {
            "count": count,
            "boxes": boxes_out
        }
