def generate_final_prediction(rbc_result: dict, answers: dict):
    dys_percentage = rbc_result["dys_percentage"]
    origin = rbc_result["hematuria_origin"]

    risk_score = 0
    reasons = []

    if dys_percentage >= 40:
        risk_score += 2
        reasons.append("High dysmorphic RBC percentage")

    if origin == "Glomerular":
        risk_score += 2
        reasons.append("Glomerular hematuria pattern detected")

    if answers.get("3") == "Yes":
        risk_score += 1
        reasons.append("Urinary discomfort reported")

    if answers.get("8") == "Yes":
        risk_score += 1
        reasons.append("Smoking history")

    if answers.get("9") == "Yes":
        risk_score += 1
        reasons.append("Family history of urinary disease")

    if risk_score >= 4:
        risk = "High"
    elif risk_score >= 2:
        risk = "Moderate"
    else:
        risk = "Low"

    return {
        "risk_level": risk,
        "final_prediction": f"Likely {origin.lower()} hematuria",
        "clinical_reasons": reasons
    }
