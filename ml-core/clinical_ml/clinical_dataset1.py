import joblib
import numpy as np
import os


class ClinicalDataset1Model:
    def __init__(self):
        base_dir = os.path.dirname(os.path.dirname(__file__))
        model_path = os.path.join(base_dir, "models", "clinical", "dataset1_lr.pkl")
        self.model = joblib.load(model_path)
        self.feature_order = ["age", "gender", "dysuria", "abd_pain", "fever", "polyuria"]

    def predict(self, metadata: dict) -> float:
        x = np.array([[metadata.get(f, 0) for f in self.feature_order]])
        prob = self.model.predict_proba(x)[0][1]
        return float(prob)
