import os
import torch
import numpy as np
import cv2
import segmentation_models_pytorch as smp

# --------------------------------------------------
# Device
# --------------------------------------------------
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# --------------------------------------------------
# Base directory
# --------------------------------------------------
BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(__file__)
    )
)

MODEL_PATH = os.path.join(
    BASE_DIR, "models", "wbc", "wbc_unetpp_b2.pth"
)

# --------------------------------------------------
# RECREATE TRAINING ARCHITECTURE (THIS IS THE FIX)
# --------------------------------------------------
model = smp.UnetPlusPlus(
    encoder_name="efficientnet-b4",   
    encoder_weights=None,                  # already trained
    in_channels=3,
    classes=1,
    activation=None
)

# --------------------------------------------------
# Load weights
# --------------------------------------------------
state_dict = torch.load(MODEL_PATH, map_location=DEVICE)
model.load_state_dict(state_dict, strict=True)

model.to(DEVICE)
model.eval()

# --------------------------------------------------
# Inference
# --------------------------------------------------
def segment_wbc(image_bytes: bytes):
    """
    Returns:
        mask_area (int)
        binary_mask (np.ndarray)
    """

    try:
        image = cv2.imdecode(
            np.frombuffer(image_bytes, np.uint8),
            cv2.IMREAD_COLOR
        )

        if image is None:
            return 0, None

        # Match training resolution
        image = cv2.resize(image, (512, 512))
        image = image.astype(np.float32) / 255.0
        image = np.transpose(image, (2, 0, 1))  # HWC → CHW
        image = torch.tensor(image).unsqueeze(0).to(DEVICE)

        with torch.no_grad():
            logits = model(image)
            probs = torch.sigmoid(logits)

        mask = probs.squeeze().cpu().numpy()
        binary_mask = (mask > 0.5).astype(np.uint8)

        mask_area = int(binary_mask.sum())

        return mask_area, binary_mask

    except Exception as e:
        print("WBC segmentation error:", e)
        return 0, None
