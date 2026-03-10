import Report from '../models/Report.js';
import Patient from '../models/Patient.js';
import ClinicalVerification from '../models/ClinicalVerification.js';
import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import {
    calculateFinalRisk,
    calculateDiagnosisRisk,
    getQuestionsForDiagnosis,
    generateRiskExplanation,
    shouldRunUTIML,
    mapUTIMLToRisk
} from '../services/clinicalRiskEngine.js';
import { getDiagnosisCategories } from '../config/diagnosisCategories.js';
const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const toBinaryYesNo = (value) => {
    if (typeof value === 'number') return value > 0 ? 1 : 0;
    const normalized = String(value || '').trim().toLowerCase();
    return ['yes', 'y', 'true', '1', 'female', 'f', 'present'].includes(normalized) ? 1 : 0;
};

const getParticles = (analysis = {}) => {
    if (analysis && typeof analysis === 'object' && analysis.particles && typeof analysis.particles === 'object') {
        return analysis.particles;
    }
    return analysis || {};
};

const getCount = (particles, key) => {
    const node = particles?.[key] || {};
    if (Number.isFinite(Number(node.total_count))) return Number(node.total_count);
    if (Number.isFinite(Number(node.total_particles_detected))) return Number(node.total_particles_detected);
    if (Number.isFinite(Number(node.count))) return Number(node.count);
    if (Array.isArray(node.boxes)) return node.boxes.length;
    return 0;
};

const detectImageBasedUTI = (analysis = {}) => {
    const diagnoses = analysis?.diagnosis?.diagnoses;
    if (Array.isArray(diagnoses)) {
        return diagnoses.some((d) =>
            String(d?.name || '').toLowerCase().includes('urinary tract infection') ||
            String(d?.name || '').toLowerCase().includes('uti')
        );
    }
    return false;
};

const buildClinicalPayload = (questionnaireData = {}) => {
    const genderRaw = questionnaireData.gender ?? questionnaireData.q2;
    const gender = (() => {
        const normalized = String(genderRaw || '').trim().toLowerCase();
        if (['female', 'f', '1'].includes(normalized)) return 1;
        if (['male', 'm', '0'].includes(normalized)) return 0;
        return toNumber(genderRaw);
    })();

    const temperatureRaw = questionnaireData.temperature ?? questionnaireData.temp;
    const temperature = Number.isFinite(Number(temperatureRaw)) ? Number(temperatureRaw) : undefined;

    const payload = {
        age: toNumber(questionnaireData.age ?? questionnaireData.q1),
        gender,
        dysuria: toBinaryYesNo(questionnaireData.dysuria ?? questionnaireData.q4),
        abd_pain: toBinaryYesNo(questionnaireData.abd_pain ?? questionnaireData.abdPain ?? questionnaireData.q10),
        fever: toBinaryYesNo(questionnaireData.fever ?? questionnaireData.q14),
        polyuria: toBinaryYesNo(questionnaireData.polyuria ?? questionnaireData.q5),
        nausea: toBinaryYesNo(questionnaireData.nausea ?? questionnaireData.q13),
        lumbar_pain: toBinaryYesNo(questionnaireData.lumbar_pain ?? questionnaireData.lumbarPain ?? questionnaireData.q11),
        urine_pushing: toBinaryYesNo(questionnaireData.urine_pushing ?? questionnaireData.urinaryUrgency ?? questionnaireData.q6),
        micturition_pain: toBinaryYesNo(questionnaireData.micturition_pain ?? questionnaireData.micturitionPain ?? questionnaireData.q4),
        urethral_burning: toBinaryYesNo(questionnaireData.urethral_burning ?? questionnaireData.urethralBurning ?? questionnaireData.q4),
    };

    if (temperature !== undefined) {
        payload.temperature = temperature;
    }

    return payload;
};

// @desc    Get all reports (with patient and uploader details)
// @route   GET /api/reports
// @access  Private
export const getReports = async (req, res, next) => {
    try {
        let query = {};
        if (req.query.patientId) {
            query.patientId = req.query.patientId;
        }

        const reports = await Report.find(query)
            .sort({ createdAt: -1 })
            .populate('patientId', 'name patientId age status riskAssessment dateAssigned')
            .populate('uploadedBy', 'name');

        res.status(200).json({ success: true, count: reports.length, data: reports });
    } catch (error) {
        next(error);
    }
};

// @desc    Upload an image & get analysis
// @route   POST /api/reports/upload
// @access  Private (MLT)
export const uploadImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Please upload an image file' });
        }

        // Call ML Core Service
        const formData = new FormData();
        formData.append('file', fs.createReadStream(req.file.path));

        let mlResponse;
        try {
            mlResponse = await axios.post('http://localhost:8000/analyze-image', formData, {
                headers: {
                    ...formData.getHeaders()
                }
            });
        } catch (error) {
            console.error('ML Service Error:', error.message);
            return res.status(500).json({ success: false, error: 'ML Core server not reachable' });
        }

        const utiDetectedFromImage = detectImageBasedUTI(mlResponse.data);

        res.status(200).json({
            success: true,
            data: {
                imageUrl: `/uploads/${req.file.filename}`,
                analysis: mlResponse.data,
                utiDetectedFromImage
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Submit final report and save to DB
// @route   POST /api/reports/submit
// @access  Private (MLT)
export const submitReport = async (req, res, next) => {
    try {
        const { patientId, imageUrl, analysis, riskLevel, chemicalParameters, utiDetectedFromImage } = req.body;

        if (!patientId || (!imageUrl && !analysis && !chemicalParameters)) {
            return res.status(400).json({ success: false, error: 'Missing required report data' });
        }

        let mappedRisk = 'Pending';
        if (riskLevel === 'High Risk') mappedRisk = 'High';
        else if (riskLevel === 'Moderate Risk') mappedRisk = 'Moderate';
        else if (riskLevel === 'Low Risk') mappedRisk = 'Low';

        await Patient.findByIdAndUpdate(patientId, {
            status: 'Ready for Review',
            riskAssessment: mappedRisk
        });

        const report = await Report.create({
            patientId,
            uploadedBy: req.user.id,
            imageUrl,
            analysis,
            chemicalParameters,
            utiDetectedFromImage: typeof utiDetectedFromImage === 'boolean' ? utiDetectedFromImage : detectImageBasedUTI(analysis),
            status: 'Pending Verification'
        });

        res.status(201).json({ success: true, data: report });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single report
// @route   GET /api/reports/:id
// @access  Private
export const getReport = async (req, res, next) => {
    try {
        const report = await Report.findById(req.params.id)
            .populate('patientId', 'name age patientId riskAssessment status dateAssigned')
            .populate('uploadedBy', 'name');

        if (!report) {
            return res.status(404).json({ success: false, error: 'Report not found' });
        }

        // Fetch latest verification if verified
        let verification = null;
        if (report.status === 'Verified') {
            verification = await ClinicalVerification.findOne({ reportId: report._id }).sort({ createdAt: -1 });
        }

        // Add routing info
        const diagnoses = report.analysis?.diagnosis?.diagnoses || [];
        const questionsRequired = getQuestionsForDiagnosis(diagnoses);
        const categories = getDiagnosisCategories(diagnoses);

        // Map diagnosis categories to frontend question block component names
        const CATEGORY_BLOCK_MAP = {
            infection: 'InfectionQuestions',
            stone: 'StoneQuestions',
            hematuria: 'HematuriaQuestions',
            renal: 'RenalQuestions'
        };

        const blocks = ['BaseQuestions'];
        categories.forEach(cat => {
            if (CATEGORY_BLOCK_MAP[cat] && !blocks.includes(CATEGORY_BLOCK_MAP[cat])) {
                blocks.push(CATEGORY_BLOCK_MAP[cat]);
            }
        });

        const routing = {
            action: questionsRequired.length > 0 ? "PROCEED_TO_QUESTIONNAIRE" : "NORMAL",
            categories: categories,
            requiresUTIPipeline: categories.includes('infection'),
            questions: questionsRequired,
            blocks: blocks
        };

        res.status(200).json({ success: true, data: { ...report._doc, verification, routing } });
    } catch (error) {
        next(error);
    }
};

// @desc    Submit Clinician Verification
// @route   PUT /api/reports/:id/verify
// @access  Private (CLINICIAN)
export const verifyReport = async (req, res, next) => {
    try {
        const { agreement, notes, prescription } = req.body;

        const report = await Report.findById(req.params.id).populate('patientId');

        if (!report) {
            return res.status(404).json({ success: false, error: 'Report not found' });
        }

        // 1. Update or Create ClinicalVerification document
        let verification = await ClinicalVerification.findOne({ reportId: report._id });

        if (verification) {
            verification.agreement = agreement || 'agree';
            verification.clinicalNotes = notes || '';
            verification.prescription = prescription || '';
            verification.verifiedAt = Date.now();
            await verification.save();
        } else {
            verification = await ClinicalVerification.create({
                reportId: report._id,
                patientId: report.patientId?._id || report.patientId,
                clinicianId: req.user.id,
                agreement: agreement || 'agree',
                clinicalNotes: notes || '',
                prescription: prescription || '',
                verifiedAt: Date.now()
            });
        }

        // 2. Update the Report status
        await Report.findByIdAndUpdate(req.params.id, {
            status: 'Verified',
            clinicianId: req.user.id,
            verifiedAt: Date.now(),
            comments: notes || ''
        });

        // 3. Update the Patient status to Completed
        if (report.patientId) {
            await Patient.findByIdAndUpdate(report.patientId._id, {
                status: 'Completed'
            });
        }

        res.status(200).json({ success: true, data: verification });
    } catch (error) {
        next(error);
    }
};

// @desc    Submit patient questionnaire & run UTI clinical analysis if needed
// @route   POST /api/reports/:id/submit-questionnaire
// @access  Private (PATIENT)
export const submitQuestionnaire = async (req, res, next) => {
    try {
        const reportId = req.params.id;
        const questionnaireData = req.body || {};

        let report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({ success: false, error: 'Report not found' });
        }

        const diagnoses = report.analysis?.diagnosis?.diagnoses || [];
        const categories = getDiagnosisCategories(diagnoses);
        const clinicalPayload = buildClinicalPayload(questionnaireData);
        let updatedAnalysis = report.analysis || {};
        let utiMLResult = null;

        // ── DIAGNOSIS ROUTER ─────────────────────────────────────────
        const runUTI = shouldRunUTIML(diagnoses);
        let finalRiskScore, riskLevel, riskSource;
        let baseDiagnosisScore = calculateDiagnosisRisk(diagnoses);
        let questionnaireScore = null;

        if (runUTI) {
            // ── PATHWAY 1 — UTI ML ──────────────────────────────────
            console.log('[DiagnosisRouter] Routing to UTI ML Pipeline');
            riskSource = 'UTI_ML';

            try {
                // STEP 4: Send ONLY questionnaire metadata — no particle counts
                const utiPayload = {
                    particle_features: {},   // empty – ML uses questionnaire only
                    questionnaire_answers: clinicalPayload
                };

                const utiAnalysis = await axios.post(
                    'http://localhost:8000/analyze-uti',
                    utiPayload,
                    { headers: { 'Content-Type': 'application/json' } }
                );

                utiMLResult = {
                    clinical_dataset1: utiAnalysis.data?.clinical_dataset1 || null,
                    clinical_dataset2: utiAnalysis.data?.clinical_dataset2 || null,
                    fusion: utiAnalysis.data?.fusion || null,
                    uti_rules: utiAnalysis.data?.uti_rules || null
                };

                updatedAnalysis = { ...updatedAnalysis, ...utiMLResult };

                // Map ML output → standardised risk score
                const utiRisk = mapUTIMLToRisk(utiMLResult, baseDiagnosisScore);
                finalRiskScore = utiRisk.finalScore;
                riskLevel = utiRisk.riskLevel;

                console.log('[DiagnosisRouter] UTI ML finalScore:', finalRiskScore);
                console.log('[DiagnosisRouter] UTI ML riskLevel:', riskLevel);
            } catch (error) {
                console.error('[DiagnosisRouter] UTI ML Pipeline Error:', error.message);
                // Fallback to rule engine if ML service is unreachable
                console.log('[DiagnosisRouter] Falling back to Rule Engine');
                riskSource = 'RULE_ENGINE';
                const ruleRisk = calculateFinalRisk(diagnoses, questionnaireData);
                finalRiskScore = ruleRisk.finalScore;
                riskLevel = ruleRisk.riskLevel;
                questionnaireScore = ruleRisk.questionnaireScore;
                baseDiagnosisScore = ruleRisk.baseDiagnosisScore;
            }
        } else {
            // ── PATHWAY 2 — RULE ENGINE ─────────────────────────────
            console.log('[DiagnosisRouter] Routing to Rule-Based Engine');
            riskSource = 'RULE_ENGINE';

            const ruleRisk = calculateFinalRisk(diagnoses, questionnaireData);
            finalRiskScore = ruleRisk.finalScore;
            riskLevel = ruleRisk.riskLevel;
            questionnaireScore = ruleRisk.questionnaireScore;
            baseDiagnosisScore = ruleRisk.baseDiagnosisScore;

            console.log('[DiagnosisRouter] Rule Engine finalScore:', finalRiskScore);
            console.log('[DiagnosisRouter] Rule Engine riskLevel:', riskLevel);
        }
        // ── END ROUTER ───────────────────────────────────────────────

        const explanations = [
            riskSource === 'UTI_ML'
                ? 'Risk computed by the AI Infection (UTI) Machine Learning model.'
                : 'Centralized risk engine computed combined medical history and laboratory state.'
        ];
        const riskExplanation = generateRiskExplanation(diagnoses, report.analysis?.particles, questionnaireData);

        const finalReportResult = {
            patientId: report.patientId,
            detectedCategories: categories,
            derivedRisks: {
                combinedRisk: {
                    riskLevel,
                    score: finalRiskScore,
                    baseDiagnosisScore,
                    questionnaireScore
                }
            },
            // STEP 5 — required fields
            finalRiskScore,
            riskLevel,
            riskSource,
            baseDiagnosisScore,
            questionnaireScore,
            utiMLResult,
            explanations,
            riskExplanation,
            disclaimer: "This system provides risk analysis based on urine microscopy findings and questionnaire responses. It is not a medical diagnosis and should not replace professional medical consultation.",
            timestamp: new Date()
        };

        report = await Report.findByIdAndUpdate(
            reportId,
            {
                clinicalData: {
                    raw: questionnaireData,
                    mappedForUti: clinicalPayload,
                },
                analysis: updatedAnalysis,
                riskPrediction: finalReportResult,
                status: 'Pending Verification'
            },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: report,
            report: finalReportResult
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update chemical parameters for the latest report of a patient
// @route   PUT /api/reports/patient/:patientId/chemical
// @access  Private (MLT)
export const updateChemicalParametersByPatient = async (req, res, next) => {
    try {
        const { patientId } = req.params;
        const { chemicalParameters } = req.body;

        if (!chemicalParameters) {
            return res.status(400).json({ success: false, error: 'Missing chemical parameters' });
        }

        const report = await Report.findOne({ patientId }).sort({ createdAt: -1 });

        if (!report) {
            return res.status(404).json({ success: false, error: 'No report found for this patient' });
        }

        report.chemicalParameters = chemicalParameters;
        await report.save();

        res.status(200).json({ success: true, data: report });
    } catch (error) {
        next(error);
    }
};
