"""Wrapper for the dataset2 clinical models."""

import os
import joblib
import numpy as np


class ClinicalDataset2Model:
    def __init__(self):
        # base_dir points to ml-core (three levels up: uti -> diseases -> ml-core)
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        bladder_path = os.path.join(base_dir, "models", "clinical", "bladder_lr.pkl")
        renal_path = os.path.join(base_dir, "models", "clinical", "renal_lr.pkl")
        if not os.path.exists(bladder_path) or not os.path.exists(renal_path):
            raise FileNotFoundError("Clinical dataset2 models not found")
        self.bladder_model = joblib.load(bladder_path)
        self.renal_model = joblib.load(renal_path)
        self.feature_order = [
            "temperature",
            "nausea",
            "lumbar_pain",
            "urine_pushing",
            "micturition_pain",
            "urethral_burning"
        ]

    def predict(self, metadata: dict):
        x = np.array([[metadata[f] for f in self.feature_order]])
        bladder_prob = self.bladder_model.predict_proba(x)[0][1]
        renal_prob = self.renal_model.predict_proba(x)[0][1]
        return float(bladder_prob), float(renal_prob)
