import joblib
import numpy as np

BLADDER_MODEL_PATH = "models/clinical/bladder_lr.pkl"
RENAL_MODEL_PATH   = "models/clinical/renal_lr.pkl"

bladder_model = joblib.load(BLADDER_MODEL_PATH)
renal_model   = joblib.load(RENAL_MODEL_PATH)

FEATURE_ORDER = [
    "temperature",
    "nausea",
    "lumbar_pain",
    "urine_pushing",
    "micturition_pain",
    "urethral_burning"
]

def predict_dataset2(metadata: dict):
    """
    Returns probabilities for:
    - Lower UTI (bladder inflammation)
    - Upper UTI (renal pelvis nephritis)
    """

    x = np.array([[
        metadata["temperature"],
        metadata["nausea"],
        metadata["lumbar_pain"],
        metadata["urine_pushing"],
        metadata["micturition_pain"],
        metadata["urethral_burning"]
    ]])

    bladder_prob = bladder_model.predict_proba(x)[0][1]
    renal_prob   = renal_model.predict_proba(x)[0][1]

    return float(bladder_prob), float(renal_prob)
