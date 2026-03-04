def decide_uti(wbc_count, yeast_count, ecoli_present, bacteria_count=0):
    """
    Simple provisional UTI decision rule

    The rule considers white blood cells, detected E. coli presence,
    yeast cells, and now explicitly any detected bacteria particles.

    Args:
        wbc_count: number of white blood cells detected
        yeast_count: number of yeast detections
        ecoli_present: boolean flag from E. coli classifier
        bacteria_count: number of bacteria detections (optional)
    Returns:
        Boolean indicating image-based UTI suspicion.
    """
    if wbc_count >= 5:
        return True
    if ecoli_present:
        return True
    if yeast_count >= 3:
        return True
    if bacteria_count >= 1:
        # any bacteria seen is suspicious
        return True
    return False
