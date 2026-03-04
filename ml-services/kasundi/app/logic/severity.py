def compute_severity(mask_area: int, image_area: int):
    """
    Computes severity level from segmentation mask area.

    Returns:
    - severity_label (str)
    - severity_score (float in [0,1])
    """

    if image_area == 0:
        return "Unknown", 0.0

    area_ratio = mask_area / image_area  # normalized severity

    if area_ratio < 0.01:
        return "Mild", area_ratio
    elif area_ratio < 0.05:
        return "Moderate", area_ratio
    else:
        return "Severe", area_ratio


def normalize_severity(mask_area: int, max_area: int = 20000):
    """
    Converts segmentation area to severity score [0–1]

    max_area is empirically chosen from dataset statistics
    """

    if mask_area is None or mask_area <= 0:
        return 0.0

    score = mask_area / max_area
    return round(min(score, 1.0), 3)
