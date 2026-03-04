"""Utility module for UTI rule-based decisions."""


def decide_uti(wbc_count: int, yeast_count: int, ecoli_present: bool) -> bool:
    """Simple provisional UTI decision rule."""
    if wbc_count >= 5:
        return True
    if ecoli_present:
        return True
    if yeast_count >= 3:
        return True
    return False


class UTIRulesPredictor:
    @staticmethod
    def decide(wbc_count: int, yeast_count: int, ecoli_present: bool) -> bool:
        return decide_uti(wbc_count, yeast_count, ecoli_present)
