def generate_final_prediction(rbc_result: dict, answers: dict):
    dys_percentage = rbc_result["dys_percentage"]
    origin = rbc_result["hematuria_origin"]

    risk_score = 0
    reasons = []
    warnings = []
    suggestions = []

    # -----------------------------
    # Image-based logic
    # -----------------------------
    if dys_percentage >= 40:
        risk_score += 2
        reasons.append("High dysmorphic RBC percentage")
        warnings.append("Abnormal RBC morphology detected")

    if origin == "Glomerular":
        risk_score += 2
        reasons.append("Glomerular hematuria pattern detected")
        warnings.append("Possible kidney-related cause of hematuria")

    # -----------------------------
    # Metadata-based logic
    # -----------------------------
    if answers.get("3") == "Yes":
        risk_score += 1
        reasons.append("Urinary discomfort reported")

    if answers.get("8") == "Yes":
        risk_score += 1
        reasons.append("Smoking history present")
        warnings.append("Smoking is a risk factor for urinary tract diseases")

    if answers.get("9") == "Yes":
        risk_score += 1
        reasons.append("Family history of urinary disease")

    # -----------------------------
    # Risk classification
    # -----------------------------
    if risk_score >= 4:
        risk = "High"
    elif risk_score >= 2:
        risk = "Moderate"
    else:
        risk = "Low"

    # -----------------------------
    # Suggestions (THIS IS NEW)
    # -----------------------------
    if risk == "High":
        suggestions.extend([
            "Consult a nephrologist as soon as possible",
            "Further renal investigations are recommended",
            "Repeat urine microscopy under clinical supervision",
            "Do not ignore persistent blood in urine"
        ])

    elif risk == "Moderate":
        suggestions.extend([
            "Consult a physician for further evaluation",
            "Repeat urine test within 1–2 weeks",
            "Maintain adequate hydration"
        ])

    else:  # Low risk
        suggestions.extend([
            "Maintain good hydration",
            "Monitor symptoms and repeat urine test if symptoms persist"
        ])

    # Female-specific note
    if answers.get("2") == "Female" and answers.get("10") == "Yes":
        suggestions.append(
            "Repeat urine test after menstruation to avoid contamination"
        )

    # -----------------------------
    # Final report
    # -----------------------------
    return {
        "risk_level": risk,
        "final_prediction": f"Likely {origin.lower()} hematuria",
        "clinical_reasons": reasons,
        "warnings": warnings,
        "suggestions": suggestions
    }
