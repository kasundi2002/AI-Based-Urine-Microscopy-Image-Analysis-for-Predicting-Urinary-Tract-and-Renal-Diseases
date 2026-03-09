from diagnosis.diagnosis_rules import DIAGNOSIS_RULES
from diagnosis.feature_builder import FeatureBuilder

class DiagnosisEngine:
    def __init__(self):
        self.feature_builder = FeatureBuilder()
        self.rules = DIAGNOSIS_RULES

    def evaluate_condition(self, feature_val, op, target_val):
        if op == ">": return feature_val > target_val
        if op == ">=": return feature_val >= target_val
        if op == "<": return feature_val < target_val
        if op == "<=": return feature_val <= target_val
        if op == "==": return feature_val == target_val
        if op == "!=": return feature_val != target_val
        return False

    def evaluate_level(self, conditions, features):
        if not conditions:
            return False
        for cond in conditions:
            f_val = features.get(cond["feature"], 0)
            if not self.evaluate_condition(f_val, cond["op"], cond["value"]):
                return False
        return True

    def process(self, particle_results):
        features = self.feature_builder.build_features(particle_results)
        
        diagnoses = []
        for rule in self.rules:
            detected_level = None
            # Evaluate in order: High, Moderate, Low to match highest severity
            for level in ["High", "Moderate", "Low"]:
                if level in rule["levels"]:
                    conditions = rule["levels"][level]
                    if self.evaluate_level(conditions, features):
                        detected_level = level
                        break
            
            if detected_level:
                diagnoses.append({
                    "name": rule["name"],
                    "probability": detected_level
                })
        
        return {
            "diagnoses": diagnoses
        }
