class YeastPredictor:
    def decide_risk(self, yeast_count: int) -> str | None:
        if yeast_count >= 3:
            return "Possible Yeast Infection"
        elif yeast_count > 0:
            return "Low Yeast Presence"
        else:
            return None
