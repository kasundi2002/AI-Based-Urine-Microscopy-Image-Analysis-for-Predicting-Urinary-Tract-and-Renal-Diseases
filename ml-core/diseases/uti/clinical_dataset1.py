"""Wrapper for the dataset1 logistic regression model."""

import os
import joblib
import numpy as np


class ClinicalDataset1Model:
    def __init__(self):
        # base_dir points to ml-core (three levels up: uti -> diseases -> ml-core)
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        model_path = os.path.join(base_dir, "models", "clinical", "dataset1_lr.pkl")
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Dataset1 model not found at {model_path}")
        self.model = joblib.load(model_path)
        self.feature_order = [
            "age",
            "gender",
            "dysuria",
            "abd_pain",
            "fever",
            "polyuria"
        ]

    def predict(self, metadata: dict) -> float:
        x = np.array([[metadata[f] for f in self.feature_order]])
        prob = self.model.predict_proba(x)[0][1]
        return float(prob)
