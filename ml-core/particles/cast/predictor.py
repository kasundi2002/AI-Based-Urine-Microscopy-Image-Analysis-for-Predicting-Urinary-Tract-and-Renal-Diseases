class CastPredictor:
    def __init__(self):
        # Rule-based prediction, no model needed
        pass

    def predict_disease_risk(self, cast_count: int):
        if cast_count >= 3:
            return {
                "risk_level": "HIGH",
                "possible_diseases": [
                    {
                        "name": "Glomerulonephritis",
                        "reason": "High number of urinary casts suggests glomerular inflammation"
                    },
                    {
                        "name": "Acute Kidney Injury (AKI)",
                        "reason": "Multiple casts indicate acute tubular damage"
                    },
                    {
                        "name": "Chronic Kidney Disease (CKD)",
                        "reason": "Persistent cast formation is associated with chronic renal damage"
                    }
                ]
            }
        elif cast_count == 1 or cast_count == 2:
            return {
                "risk_level": "MODERATE",
                "possible_diseases": [
                    {
                        "name": "Early Renal Abnormality",
                        "reason": "Low number of casts may indicate early-stage kidney involvement"
                    }
                ]
            }
        else:
            return {
                "risk_level": "LOW",
                "possible_diseases": []
            }
