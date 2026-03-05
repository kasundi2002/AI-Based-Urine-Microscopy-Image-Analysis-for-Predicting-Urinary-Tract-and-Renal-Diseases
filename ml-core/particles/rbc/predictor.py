class RBCPredictor:
    def compute_summary(self, predictions):
        total_count = len(predictions)
        
        iso_count = sum([1 for label, prob in predictions if label == "iso"])
        dys_count = sum([1 for label, prob in predictions if label == "dys"])
        
        dys_percentage = (dys_count / total_count) * 100 if total_count > 0 else 0.0

        if dys_percentage >= 40:
            level = "High Dysmorphic Presence"
        elif dys_percentage >= 20:
            level = "Moderate Dysmorphic Presence"
        else:
            level = "Low Dysmorphic Presence"

        return {
            "level": level,
            "dys_percentage": round(dys_percentage, 2)
        }
