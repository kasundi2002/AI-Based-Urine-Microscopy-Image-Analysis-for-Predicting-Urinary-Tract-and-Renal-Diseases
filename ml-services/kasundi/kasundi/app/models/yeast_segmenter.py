import torch
import numpy as np
import os
from PIL import Image
from io import BytesIO
from transformers import (
    SegformerForSemanticSegmentation,
    SegformerImageProcessor
)
import torch.nn.functional as F

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# -----------------------------
# Paths
# -----------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
MODEL_PATH = os.path.join(
    BASE_DIR, "models", "yeast", "yeast_segformer_b2.pt"
)

# -----------------------------
# Load processor + model
# -----------------------------
processor = SegformerImageProcessor(do_reduce_labels=False)

model = SegformerForSemanticSegmentation.from_pretrained(
    "nvidia/segformer-b2-finetuned-cityscapes-1024-1024",
    num_labels=2,
    ignore_mismatched_sizes=True
)

state_dict = torch.load(MODEL_PATH, map_location=DEVICE)
model.load_state_dict(state_dict)
model.to(DEVICE)
model.eval()


# -----------------------------
# Inference
# -----------------------------
def segment_yeast(image_bytes: bytes):
    """
    Returns:
    - mask_area (int)
    - mask (H,W) numpy
    - success (bool)
    """

    try:
        image = Image.open(BytesIO(image_bytes)).convert("RGB")

        inputs = processor(
            images=image,
            return_tensors="pt"
        ).to(DEVICE)

        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits  # [1, 2, h, w]

        # Upsample to original image size
        logits = F.interpolate(
            logits,
            size=image.size[::-1],
            mode="bilinear",
            align_corners=False
        )

        probs = torch.sigmoid(logits[:, 1])  # foreground
        mask = (probs > 0.5).cpu().numpy()[0].astype(np.uint8)

        mask_area = int(mask.sum())

        return mask_area, mask, True

    except Exception as e:
        print("Yeast segmentation error:", e)
        return 0, None, False
