class WBCPredictor:
    def decide_uti(self, wbc_count: int) -> str:
        if wbc_count >= 5:
            return "UTI Positive"
        else:
            return "UTI Negative"
