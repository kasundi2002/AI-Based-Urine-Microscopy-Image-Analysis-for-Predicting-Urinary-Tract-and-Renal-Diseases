class BacteriaPredictor:
    """Very simple predictor that converts presence boolean to a risk message."""

    def assess(self, ecoli_present: bool) -> str:
        return "UTI Positive" if ecoli_present else "UTI Negative"
