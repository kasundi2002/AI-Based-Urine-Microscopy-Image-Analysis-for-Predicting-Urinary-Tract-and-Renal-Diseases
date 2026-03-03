import cv2
import numpy as np

def detect_rbc(image):
    """
    Input: PIL image
    Output: list of bounding boxes [(x, y, w, h), ...]
    """
    img = np.array(image)
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)

    # Smooth image
    blur = cv2.GaussianBlur(gray, (5, 5), 0)

    # Binary threshold
    _, thresh = cv2.threshold(
        blur, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU
    )

    # Remove small noise
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    opening = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=2)

    # Find contours
    contours, _ = cv2.findContours(
        opening, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )

    boxes = []

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

        boxes.append((x, y, w, h))

    return boxes
