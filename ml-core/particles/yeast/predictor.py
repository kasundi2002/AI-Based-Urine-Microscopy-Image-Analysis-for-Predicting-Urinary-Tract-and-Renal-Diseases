class YeastPredictor:
    """Simple rule-based predictor for yeast counts."""

    def decide_uti(self, yeast_count: int) -> str:
        # same rule as kasundi/uti_rules: yeast_count >=3 triggers UTI
        if yeast_count >= 3:
            return "UTI Positive"
        else:
            return "UTI Negative"
