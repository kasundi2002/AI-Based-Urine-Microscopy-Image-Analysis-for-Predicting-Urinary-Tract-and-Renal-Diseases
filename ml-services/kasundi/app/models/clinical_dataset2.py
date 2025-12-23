# import joblib
# import numpy as np

# BLADDER_MODEL_PATH = "models/clinical/bladder_lr.pkl"
# RENAL_MODEL_PATH   = "models/clinical/renal_lr.pkl"

# bladder_model = joblib.load(BLADDER_MODEL_PATH)
# renal_model   = joblib.load(RENAL_MODEL_PATH)

# FEATURE_ORDER = [
#     "temperature",
#     "nausea",
#     "lumbar_pain",
#     "urine_pushing",
#     "micturition_pain",
#     "urethral_burning"
# ]

# def predict_dataset2(metadata: dict):
#     """
#     Returns probabilities for:
#     - Lower UTI (bladder inflammation)
#     - Upper UTI (renal pelvis nephritis)
#     """

#     x = np.array([[
#         metadata["temperature"],
#         metadata["nausea"],
#         metadata["lumbar_pain"],
#         metadata["urine_pushing"],
#         metadata["micturition_pain"],
#         metadata["urethral_burning"]
#     ]])

#     bladder_prob = bladder_model.predict_proba(x)[0][1]
#     renal_prob   = renal_model.predict_proba(x)[0][1]

#     return float(bladder_prob), float(renal_prob)

import joblib
import numpy as np
import os

# -----------------------------
# Resolve base directory safely
# -----------------------------
BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(__file__)
    )
)

BLADDER_MODEL_PATH = os.path.join(
    BASE_DIR, "models", "clinical", "bladder_lr.pkl"
)
RENAL_MODEL_PATH = os.path.join(
    BASE_DIR, "models", "clinical", "renal_lr.pkl"
)

bladder_model = joblib.load(BLADDER_MODEL_PATH)
renal_model   = joblib.load(RENAL_MODEL_PATH)

# -----------------------------
# Feature order (CRITICAL)
# -----------------------------
FEATURE_ORDER = [
    "temperature",
    "nausea",
    "lumbar_pain",
    "urine_pushing",
    "micturition_pain",
    "urethral_burning"
]

# -----------------------------
# Prediction function
# -----------------------------
def predict_dataset2(metadata: dict):
    """
    Predicts:
    - Bladder inflammation (Lower UTI)
    - Renal nephritis (Upper UTI)

    Returns:
    (bladder_probability, renal_probability)
    """

    x = np.array([[metadata[f] for f in FEATURE_ORDER]])

    bladder_prob = bladder_model.predict_proba(x)[0][1]
    renal_prob   = renal_model.predict_proba(x)[0][1]

    return float(bladder_prob), float(renal_prob)
