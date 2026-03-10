import Report from '../models/Report.js';
import Patient from '../models/Patient.js';
import ClinicalVerification from '../models/ClinicalVerification.js';
import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import { calculateFinalRisk } from '../services/riskEngine.js';

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

        const { patientId } = req.body;

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

        res.status(200).json({
            success: true,
            data: {
                imageUrl: `/uploads/${req.file.filename}`,
                analysis: mlResponse.data
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
        const { patientId, imageUrl, analysis, riskLevel, chemicalParameters } = req.body;

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

        res.status(200).json({ success: true, data: { ...report._doc, verification } });
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

// @desc    Submit questionnaire and generate risk prediction
// @route   POST /api/reports/questionnaire
// @access  Public or Patient (Depending on implementation)
export const submitQuestionnaire = async (req, res, next) => {
    try {
        const { reportId, answers } = req.body;

        if (!reportId || !answers) {
            return res.status(400).json({ success: false, error: 'reportId and answers are required' });
        }

        const report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({ success: false, error: 'Report not found' });
        }

        // Extract diagnoses from ML analysis
        const diagnoses = report.analysis?.diagnosis?.diagnoses || [];

        // Run Risk Engine
        const prediction = calculateFinalRisk(diagnoses, answers);

        // Update Report with answers and new risk prediction
        report.questionnaireAnswers = answers;
        report.riskPrediction = prediction;
        await report.save();

        res.status(200).json({ success: true, data: prediction });
    } catch (error) {
        next(error);
    }
};
