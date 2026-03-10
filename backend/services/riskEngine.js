export const getDiagnosisScore = (diagnoses) => {
    if (!diagnoses || !Array.isArray(diagnoses) || diagnoses.length === 0) return 0;

    // Use the diagnosis with the highest probability
    // Order of probability: High > Moderate > Low
    const hasHigh = diagnoses.some(d => d.probability === 'High' && d.name !== 'Normal Urine Sediment');
    if (hasHigh) return 75;

    const hasMod = diagnoses.some(d => d.probability === 'Moderate' && d.name !== 'Normal Urine Sediment');
    if (hasMod) return 50;

    const hasLow = diagnoses.some(d => d.probability === 'Low' && d.name !== 'Normal Urine Sediment');
    if (hasLow) return 25;

    return 25; // Default/Normal Urine Sediment base probability
};

export const calculateQuestionnaireScore = (answers) => {
    if (!answers) return 0;

    // Helper to evaluate Yes answers
    const isYes = (key) => answers[key] === 'Yes';
    let score = 0;

    // Definition based on requirements
    // Critical symptoms (5 points): Visible blood (q7), Dark urine (q8), Flank pain (q11), Fever (q14), Previous kidney issues (q19, q20)
    // Major symptoms (3 points): Painurination (q4), Strong urge (q6), Lower back pain (q12), Nausea (q13), Swelling (q16)
    // Medical history (2 points): High BP (q21), Diabetes (q22), Family history (q24), NSAIDs (q25)
    // Lifestyle (1 point): Smoke (q32), Alcohol (q33), High salt (q29), Oxalate (q30)

    const critical = ['q7', 'q8', 'q11', 'q14', 'q19', 'q20'];
    const major = ['q4', 'q6', 'q12', 'q13', 'q16'];
    const history = ['q21', 'q22', 'q24', 'q25'];
    const lifestyle = ['q32', 'q33', 'q29', 'q30'];

    critical.forEach(q => { if (isYes(q)) score += 5; });
    major.forEach(q => { if (isYes(q)) score += 3; });
    history.forEach(q => { if (isYes(q)) score += 2; });
    lifestyle.forEach(q => { if (isYes(q)) score += 1; });

    // The questionnaire score must never exceed 25
    return Math.min(score, 25);
};

export const calculateFinalRisk = (diagnoses, answers) => {
    const diagnosisScore = getDiagnosisScore(diagnoses);
    const questionnaireScore = calculateQuestionnaireScore(answers);
    const finalScore = diagnosisScore + questionnaireScore;

    let riskLevel = 'Very Low';
    if (finalScore >= 81) riskLevel = 'Critical';
    else if (finalScore >= 61) riskLevel = 'High';
    else if (finalScore >= 41) riskLevel = 'Moderate';
    else if (finalScore >= 21) riskLevel = 'Low';

    return {
        diagnosisScore,
        questionnaireScore,
        finalScore,
        riskLevel
    };
};
