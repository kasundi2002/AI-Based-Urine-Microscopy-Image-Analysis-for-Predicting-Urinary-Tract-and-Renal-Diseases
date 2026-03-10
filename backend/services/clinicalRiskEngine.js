import { getDiagnosisCategories } from '../config/diagnosisCategories.js';

// ── Diagnosis Router ──────────────────────────────────────────────────
// Infection-related diagnoses that should route to the UTI ML pipeline
const UTI_DIAGNOSES = [
    "Urinary Tract Infection",
    "Severe Bacterial Infection",
    "Pyelonephritis",
    "Fungal Infection",
    "Candiduria",
    "Infection with Hematuria"
];

/**
 * Returns TRUE when at least one diagnosis is infection-related,
 * meaning the UTI ML pipeline should run instead of the rule engine.
 */
export const shouldRunUTIML = (diagnoses = []) => {
    return diagnoses.some(d =>
        UTI_DIAGNOSES.includes(typeof d === "string" ? d : d.name)
    );
};

/**
 * Converts UTI ML pipeline output (fusion confidence, uti_type, etc.)
 * into the same { finalScore, riskLevel, baseDiagnosisScore, questionnaireScore }
 * shape the rule engine returns so the rest of the system remains consistent.
 */
export const mapUTIMLToRisk = (utiMLResult, baseDiagnosisScore = 0) => {
    const fusion = utiMLResult?.fusion || {};
    const confidence = fusion.confidence_score ?? 0;
    const finalUti = fusion.final_uti ?? false;

    // Map ML confidence (0-1) into a 0-100 risk score
    let finalScore;
    if (!finalUti) {
        // ML says no UTI — keep the base diagnosis score only
        finalScore = Math.max(baseDiagnosisScore, Math.round(confidence * 30));
    } else {
        // ML says UTI — scale confidence into the 40-100 range
        finalScore = Math.round(40 + confidence * 60);
    }
    finalScore = Math.min(finalScore, 100);

    let riskLevel = 'Normal';
    if (finalScore >= 81) riskLevel = 'Critical';
    else if (finalScore >= 61) riskLevel = 'High';
    else if (finalScore >= 41) riskLevel = 'Moderate';
    else if (finalScore >= 21) riskLevel = 'Low';

    return {
        baseDiagnosisScore,
        questionnaireScore: null,    // not applicable for ML path
        finalScore,
        riskLevel,
        predicted_risk_level: riskLevel // convenience alias
    };
};

export const DIAGNOSIS_QUESTION_MAP = {
    infection: [1, 2, 4, 5, 6, 14, 15, 18, 19, 26, 28, 32],
    hematuria: [1, 2, 4, 7, 8, 10, 24, 25, 32, 33],
    stone: [1, 2, 10, 11, 12, 13, 24, 28, 29, 30, 31],
    renal: [1, 2, 9, 16, 17, 20, 21, 22, 23, 25, 27]
};

export const getQuestionsForDiagnosis = (diagnoses) => {
    const categories = getDiagnosisCategories(diagnoses);

    console.log("Detected diagnoses:", diagnoses);
    console.log("Detected categories:", categories);

    if (categories.includes('contamination') || categories.includes('normal') || categories.length === 0) {
        console.log("Questions returned:", []);
        return [];
    }

    const questionSet = new Set();

    // Always include demographics if we are asking questions
    questionSet.add(1);
    questionSet.add(2);

    categories.forEach(category => {
        if (DIAGNOSIS_QUESTION_MAP[category]) {
            DIAGNOSIS_QUESTION_MAP[category].forEach(q => questionSet.add(q));
        }
    });

    const finalQuestions = Array.from(questionSet).sort((a, b) => a - b);
    console.log("Questions returned:", finalQuestions);
    return finalQuestions;
};

export const calculateDiagnosisRisk = (diagnoses) => {
    if (!diagnoses || !Array.isArray(diagnoses) || diagnoses.length === 0) return 0;

    const nonNormal = diagnoses.filter(d => d.name !== 'Normal Urine Sediment');
    if (nonNormal.length === 0) return 0;

    const hasHigh = nonNormal.some(d => d.probability === 'High');
    if (hasHigh) return 75;

    const hasMod = nonNormal.some(d => d.probability === 'Moderate');
    if (hasMod) return 50;

    const hasLow = nonNormal.some(d => d.probability === 'Low');
    if (hasLow) return 25;

    return 0;
};

export const calculateQuestionnaireScore = (answers) => {
    if (!answers) return 0;

    let score = 0;
    const isYes = (key) => answers[key] === 'Yes';

    // Critical symptoms (+5)
    ['q7', 'q8', 'q9', 'q11', 'q14'].forEach(q => { if (isYes(q)) score += 5; });

    // Major symptoms (+3)
    ['q4', 'q5', 'q6', 'q10', 'q12', 'q13', 'q15'].forEach(q => { if (isYes(q)) score += 3; });

    // Medical history (+2)
    ['q18', 'q21', 'q22', 'q23', 'q24', 'q25', 'q26', 'q27'].forEach(q => { if (isYes(q)) score += 2; });

    // Lifestyle risk (+1)
    ['q29', 'q30', 'q31', 'q32', 'q33'].forEach(q => { if (isYes(q)) score += 1; });

    if (answers['q28'] === 'Less than 1 liter') score += 1;

    console.log("[RiskEngine] Raw questionnaire score:", score);
    return Math.min(score, 25);
};

export const calculateFinalRisk = (diagnoses, answers) => {
    const baseDiagnosisScore = calculateDiagnosisRisk(diagnoses);
    const questionnaireScore = calculateQuestionnaireScore(answers);
    const finalScore = Math.min(baseDiagnosisScore + questionnaireScore, 100);

    console.log("[RiskEngine] baseDiagnosisScore:", baseDiagnosisScore);
    console.log("[RiskEngine] questionnaireScore:", questionnaireScore);
    console.log("[RiskEngine] finalScore:", finalScore);

    let riskLevel = 'Normal';
    if (finalScore >= 81) riskLevel = 'Critical';
    else if (finalScore >= 61) riskLevel = 'High';
    else if (finalScore >= 41) riskLevel = 'Moderate';
    else if (finalScore >= 21) riskLevel = 'Low';

    console.log("[RiskEngine] riskLevel:", riskLevel);

    return {
        baseDiagnosisScore,
        questionnaireScore,
        finalScore,
        riskLevel
    };
};

export const generateRiskExplanation = (diagnoses, particleCounts, answers) => {
    const causes = [];
    const supportingFactors = [];
    const patientSymptoms = [];

    // Analyze diagnoses
    if (!diagnoses || !Array.isArray(diagnoses) || diagnoses.length === 0 ||
        (diagnoses.length === 1 && diagnoses[0].name === 'Normal Urine Sediment')) {
        causes.push("No significant abnormalities detected in urine sediment.");
    } else {
        const sortedDiagnoses = [...diagnoses].sort((a, b) => {
            const val = { 'High': 3, 'Moderate': 2, 'Low': 1 };
            return (val[b.probability] || 0) - (val[a.probability] || 0);
        });

        const mainD = sortedDiagnoses[0];
        if (mainD.name !== 'Normal Urine Sediment') {
            let causeStr = `${mainD.name} detected`;
            if (particleCounts?.rbc?.count > 10 && mainD.name.includes('Hematuria')) causeStr += ' due to elevated RBC count';
            causes.push(causeStr);
        }
    }

    // Analyze particles
    if (particleCounts) {
        if (particleCounts.rbc?.subtype_summary?.dysmorphic > 0) supportingFactors.push("Dysmorphic RBC present");
        if (particleCounts.rbc?.subtype_summary?.isomorphic > 0) supportingFactors.push("Isomorphic RBC present");
        if (particleCounts.rbc?.count > 10) supportingFactors.push("Elevated RBC count");
        if (particleCounts.wbc?.count > 5) supportingFactors.push("Elevated WBC count");
        if (particleCounts.bacteria?.count > 0) supportingFactors.push("Bacteria present");
        if (particleCounts.yeast?.count > 0) supportingFactors.push("Yeast present");
        if (particleCounts.crystal?.count > 0) supportingFactors.push("Crystals present");
        if (particleCounts.cast?.count > 0) supportingFactors.push("Casts present");
    }

    // Patient Symptoms
    if (answers) {
        const isYes = (key) => answers[key] === 'Yes';
        if (isYes('q4')) patientSymptoms.push("Pain during urination");
        if (isYes('q5') || isYes('q6')) patientSymptoms.push("Frequent urination");
        if (isYes('q7') || isYes('q8')) patientSymptoms.push("Visible blood in urine");
        if (isYes('q10') || isYes('q12') || isYes('q15')) patientSymptoms.push("Back/Flank/Abdominal pain");
        if (isYes('q14')) patientSymptoms.push("Fever");
        if (answers['q28'] && (answers['q28'].includes('Less than 1 liter') || answers['q28'] === 'Less than 1 liter')) patientSymptoms.push("Low water intake");
        if (isYes('q21')) patientSymptoms.push("History of Hypertension");
        if (isYes('q22')) patientSymptoms.push("History of Diabetes");
    }

    return { causes, supportingFactors, patientSymptoms };
};
