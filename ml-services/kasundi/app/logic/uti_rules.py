def decide_uti(wbc_count, yeast_count, ecoli_present):
    """
    Simple provisional UTI decision rule
    """
    if wbc_count >= 5:
        return True
    if ecoli_present:
        return True
    if yeast_count >= 3:
        return True
    return False
