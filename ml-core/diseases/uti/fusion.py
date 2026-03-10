def fuse_decisions(
    image_uti: bool,
    dataset2_lower_prob: float,
    dataset2_upper_prob: float,
    dataset1_prob: float,
    wbc_severity_score: float = 0.0,
    yeast_severity_score: float = 0.0,
):
    final_uti = False

    if image_uti:
        final_uti = True
    elif dataset2_lower_prob >= 0.7 or dataset2_upper_prob >= 0.7:
        final_uti = True
    elif dataset1_prob >= 0.8:
        final_uti = True

    if wbc_severity_score >= 0.7 or yeast_severity_score >= 0.7:
        final_uti = True

    if dataset2_upper_prob >= 0.7:
        uti_type = "Upper UTI"
    elif dataset2_lower_prob >= 0.7:
        uti_type = "Lower UTI"
    else:
        uti_type = "Uncertain / Not classified"

    return final_uti, uti_type


def compute_confidence(
    image_uti: bool,
    dataset1_prob: float,
    dataset2_lower_prob: float,
    dataset2_upper_prob: float,
    wbc_severity_score: float,
    yeast_severity_score: float,
):
    score = 0.0
    score += 0.3 if image_uti else 0.0
    score += 0.2 * dataset1_prob
    score += 0.2 * max(dataset2_lower_prob, dataset2_upper_prob)
    score += 0.15 * wbc_severity_score
    score += 0.15 * yeast_severity_score

    return round(min(score, 1.0), 3)
