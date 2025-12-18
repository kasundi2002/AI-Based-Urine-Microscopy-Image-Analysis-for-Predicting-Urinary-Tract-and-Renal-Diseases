import joblib
import numpy as np

MODEL_PATH = "models/clinical/dataset1_lr.pkl"
SCALER_PATH = "models/clinical/dataset1_age_scaler.pkl"

# Load model + scaler ONCE at startup
clinical_model = joblib.load(MODEL_PATH)
age_scaler = joblib.load(SCALER_PATH)

FEATURE_ORDER = [
    "age",
    "gender",
    "dysuria",
    "abd_pain",
    "fever",
    "polyuria"
]

def predict_dataset1(metadata: dict) -> float:
    """
    Returns probability of UTI based on Dataset-1 symptoms
    """

    # Scale age
    age_scaled = age_scaler.transform([[metadata["age"]]])[0][0]

    x = np.array([[
        age_scaled,
        metadata["gender"],
        metadata["dysuria"],
        metadata["abd_pain"],
        metadata["fever"],
        metadata["polyuria"]
    ]])

    prob = clinical_model.predict_proba(x)[0][1]
    return float(prob)
