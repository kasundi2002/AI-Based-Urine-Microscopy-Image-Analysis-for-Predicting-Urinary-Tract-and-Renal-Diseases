"""Severity scoring utilities."""


def compute_severity(mask_area: int, image_area: int):
    if image_area == 0:
        return "Unknown", 0.0
    area_ratio = mask_area / image_area
    if area_ratio < 0.01:
        return "Mild", area_ratio
    elif area_ratio < 0.05:
        return "Moderate", area_ratio
    else:
        return "Severe", area_ratio


def normalize_severity(mask_area: int, max_area: int = 20000):
    if mask_area is None or mask_area <= 0:
        return 0.0
    score = mask_area / max_area
    return round(min(score, 1.0), 3)


class SeverityPredictor:
    def compute(self, mask_area: int, image_area: int):
        return compute_severity(mask_area, image_area)

    def normalize(self, mask_area: int, max_area: int = 20000):
        return normalize_severity(mask_area, max_area)
