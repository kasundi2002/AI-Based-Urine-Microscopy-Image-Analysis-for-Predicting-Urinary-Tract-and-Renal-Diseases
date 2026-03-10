import joblib
import numpy as np
import os


class ClinicalDataset2Model:
    def __init__(self):
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        bladder_model_path = os.path.join(base_dir, "models", "clinical", "bladder_lr.pkl")
        renal_model_path = os.path.join(base_dir, "models", "clinical", "renal_lr.pkl")

        self.bladder_model = joblib.load(bladder_model_path)
        self.renal_model = joblib.load(renal_model_path)
        self.feature_order = [
            "temperature",
            "nausea",
            "lumbar_pain",
            "urine_pushing",
            "micturition_pain",
            "urethral_burning",
        ]

    def predict(self, metadata: dict):
        x = np.array([[metadata.get(f, 0) for f in self.feature_order]])
        bladder_prob = self.bladder_model.predict_proba(x)[0][1]
        renal_prob = self.renal_model.predict_proba(x)[0][1]
        return float(bladder_prob), float(renal_prob)
