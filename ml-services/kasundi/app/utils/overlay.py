import cv2
import numpy as np
from PIL import Image
from io import BytesIO
import base64


def create_overlay(image_bytes: bytes, mask: np.ndarray, color=(255, 0, 0)):
    """
    Returns base64-encoded PNG overlay
    """

    image = cv2.imdecode(
        np.frombuffer(image_bytes, np.uint8),
        cv2.IMREAD_COLOR
    )

    overlay = image.copy()
    overlay[mask == 1] = color

    blended = cv2.addWeighted(image, 0.7, overlay, 0.3, 0)

    _, buffer = cv2.imencode(".png", blended)
    encoded = base64.b64encode(buffer).decode("utf-8")

    return encoded
