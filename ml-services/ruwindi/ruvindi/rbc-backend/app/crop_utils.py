import numpy as np
from PIL import Image

def crop_rbc_regions(image, boxes, padding=5):
    """
    image: PIL Image
    boxes: [(x,y,w,h), ...]
    returns: list of PIL cropped images
    """
    img = np.array(image)
    crops = []

    h_img, w_img, _ = img.shape

    for (x, y, w, h) in boxes:
        x1 = max(0, x - padding)
        y1 = max(0, y - padding)
        x2 = min(w_img, x + w + padding)
        y2 = min(h_img, y + h + padding)

        crop = img[y1:y2, x1:x2]
        crop_pil = Image.fromarray(crop)
        crops.append(crop_pil)

    return crops
