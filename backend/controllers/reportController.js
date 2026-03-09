import Report from '../models/Report.js';
import Patient from '../models/Patient.js';
import ClinicalVerification from '../models/ClinicalVerification.js';
import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';

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
    const particles = getParticles(analysis);
    const wbcCount = getCount(particles, 'wbc');
    const yeastCount = getCount(particles, 'yeast');

    const bacteria = particles?.bacteria || {};
    const bacteriaCount = getCount(particles, 'bacteria');
    const ecoliCount = toNumber(bacteria.ecoli_count);
    const bacteriaRisk = String(bacteria?.risk_assessment?.level || '').toLowerCase();
    const bacteriaDetected = bacteriaCount > 0 || ecoliCount > 0 || bacteriaRisk.includes('positive');

    const diagnoses = analysis?.diagnosis?.diagnoses;
    const diagnosisUti = Array.isArray(diagnoses)
        ? diagnoses.some((d) => String(d?.name || '').toLowerCase().includes('urinary tract infection'))
        : false;

    return (wbcCount >= 5 || bacteriaDetected || yeastCount >= 3 || diagnosisUti);
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
            .populate('uploadedBy', 'name')
            .populate('clinicianId', 'name');

        if (!report) {
            return res.status(404).json({ success: false, error: 'Report not found' });
        }

        res.status(200).json({ success: true, data: report });
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

        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ success: false, error: 'Report not found' });
        }

        // 1. Create a separate ClinicalVerification document
        const verification = await ClinicalVerification.create({
            reportId: report._id,
            patientId: report.patientId,
            clinicianId: req.user.id,
            agreement: agreement || 'agree',
            clinicalNotes: notes || '',
            prescription: prescription || '',
            verifiedAt: Date.now()
        });

        // 2. Update the Report status
        await Report.findByIdAndUpdate(req.params.id, {
            status: 'Verified',
            clinicianId: req.user.id,
            verifiedAt: Date.now(),
            comments: notes || ''
        });

        // 3. Update the Patient status to Completed
        await Patient.findByIdAndUpdate(report.patientId, {
            status: 'Completed'
        });

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

        const clinicalPayload = buildClinicalPayload(questionnaireData);
        let updatedAnalysis = report.analysis || {};

        if (report.utiDetectedFromImage && report.imageUrl) {
            try {
                const imagePath = `./public${report.imageUrl}`;
                if (fs.existsSync(imagePath)) {
                    const metadataFormData = new FormData();
                    metadataFormData.append('file', fs.createReadStream(imagePath));

                    Object.entries(clinicalPayload).forEach(([key, value]) => {
                        if (value !== undefined && value !== null) {
                            metadataFormData.append(key, value);
                        }
                    });

                    const utiAnalysis = await axios.post('http://localhost:8000/analyze-with-metadata', metadataFormData, {
                        headers: {
                            ...metadataFormData.getHeaders()
                        }
                    });

                    updatedAnalysis = {
                        ...(report.analysis || {}),
                        clinical_dataset1: utiAnalysis.data?.clinical_dataset1 || null,
                        clinical_dataset2: utiAnalysis.data?.clinical_dataset2 || null,
                        fusion: utiAnalysis.data?.fusion || null,
                        uti_rules: utiAnalysis.data?.uti_rules || null
                    };
                }
            } catch (error) {
                console.error('UTI Clinical Analysis Error:', error.message);
            }
        }

        report = await Report.findByIdAndUpdate(
            reportId,
            {
                clinicalData: {
                    raw: questionnaireData,
                    mappedForUti: clinicalPayload,
                },
                analysis: updatedAnalysis,
                status: 'Pending Verification'
            },
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({ success: true, data: report });
    } catch (error) {
        next(error);
    }
};
