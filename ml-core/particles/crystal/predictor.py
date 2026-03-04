class CrystalPredictor:
    def __init__(self):
        # Rule-based predictor, no model needed
        pass

    def predict(self, subtype_counts: dict, total_crystals: int):
        # Determine Risk
        if total_crystals >= 5:
            stone_risk_level = "High"
        elif total_crystals >= 3:
            stone_risk_level = "Moderate"
        else:
            stone_risk_level = "Low"

        # Clinical Suggestion
        if total_crystals == 0:
            clinical_suggestion = "No crystals detected. Maintain normal hydration."
        else:
            # Find dominant type
            dominant_type = max(subtype_counts, key=subtype_counts.get)
            
            if dominant_type == "calcium_oxalate":
                clinical_suggestion = "Increased risk of calcium oxalate stone formation. Consider increasing fluid intake and reducing dietary oxalate."
            elif dominant_type == "uric_acid":
                clinical_suggestion = "Signs of acidic urine. Suggest hydration and alkalization therapy."
            elif dominant_type == "calcium_phosphate":
                clinical_suggestion = "Associated with alkaline urine. Check for underlying metabolic causes."
            elif dominant_type == "struvite":
                clinical_suggestion = "Strong association with urinary tract infections. Antibiotic treatment may be required."
            elif dominant_type == "cystine":
                clinical_suggestion = "Cystine crystals detected. Check for cystinuria and increase fluid intake."
            else:
                clinical_suggestion = "Crystals detected. Consult a nephrologist for further analysis."

        return {
            "stone_risk_level": stone_risk_level,
            "clinical_suggestion": clinical_suggestion
        }
