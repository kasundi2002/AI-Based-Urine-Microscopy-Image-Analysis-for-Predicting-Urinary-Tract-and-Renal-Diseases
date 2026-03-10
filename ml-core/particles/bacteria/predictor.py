class BacteriaPredictor:
    """Assesses UTI risk based on E.coli detection results."""

    def assess(self, ecoli_present: bool) -> str:
        return "UTI Positive" if ecoli_present else "UTI Negative"
