from typing import Tuple

def decide_uti(
    wbc_count,
    yeast_count,
    ecoli_present,
    bacteria_count=0,
    rbc_count=0,
    wbc_casts=0,
) -> Tuple[bool, str]:
    """
    Provisional UTI decision rule with granular categories.

    Returns both a boolean flag and a string describing the inferred
    type of UTI.  The logic follows clinician-specified patterns; rules
    requiring RBCs or WBC casts are included but commented until those
    detectors exist.

    Logic summary:

    1. **Lower Bacterial UTI**: WBC + Bacteria
    2. **Upper Bacterial UTI**: WBC + Bacteria + WBC casts (commented)
    3. **Lower Fungal UTI**: WBC + Yeast
    4. **Upper Fungal UTI**: WBC + Yeast + RBC (commented)
    5. **No UTI / Normal Sample**: Few or no cells

    Args:
        wbc_count: detected white blood cells
        yeast_count: detected yeast cells
        ecoli_present: boolean from E.coli classifier (unused)
        bacteria_count: detected bacteria particles
        rbc_count: detected red blood cells (unused)
        wbc_casts: detected WBC casts (unused)
    Returns:
        (has_uti, uti_type)
            has_uti: bool
            uti_type: one of 'lower_bacterial', 'upper_bacterial',
                      'lower_fungal', 'upper_fungal', or 'none'.
    """
    # lower bacterial
    if wbc_count >= 1 and bacteria_count >= 1:
        return True, "lower_bacterial"

    # upper bacterial (requires cast detection)
    # if wbc_count >= 1 and bacteria_count >= 1 and wbc_casts >= 1:
    #     return True, "upper_bacterial"

    # lower fungal
    if wbc_count >= 1 and yeast_count >= 1:
        return True, "lower_fungal"

    # upper fungal (requires RBC detection)
    # if wbc_count >= 1 and yeast_count >= 1 and rbc_count >= 1:
    #     return True, "upper_fungal"

    # fallback to simple thresholds
    if wbc_count >= 5:
        return True, "unspecified"
    if ecoli_present:
        return True, "unspecified"
    if yeast_count >= 3:
        return True, "unspecified"
    if bacteria_count >= 1:
        return True, "unspecified"

    return False, "none"
