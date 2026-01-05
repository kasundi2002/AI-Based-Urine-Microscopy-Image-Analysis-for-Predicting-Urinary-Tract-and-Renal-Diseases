def generate_advice(prediction, answers):
    dys_pct = prediction["dys_percentage"]
    hematuria = prediction["hematuria_origin"]

    risk_score = 0

    # Questionnaire-based scoring
    for ans in answers.values():
        if ans == "yes":
            risk_score += 1

    advice = []

    # Image-based logic
    if hematuria == "Glomerular":
        advice.append("Findings suggest possible glomerular origin of hematuria.")
    else:
        advice.append("Findings suggest non-glomerular origin of hematuria.")

    # Combined logic
    if dys_pct > 40 and risk_score >= 4:
        advice.append("Moderate to high risk. Clinical evaluation is recommended.")
    elif dys_pct > 20:
        advice.append("Mild abnormalities detected. Monitoring is advised.")
    else:
        advice.append("Low risk based on current findings.")

    # Safety disclaimer
    advice.append("This result is not a medical diagnosis.")

    return {
        "risk_score": risk_score,
        "advice": advice
    }
