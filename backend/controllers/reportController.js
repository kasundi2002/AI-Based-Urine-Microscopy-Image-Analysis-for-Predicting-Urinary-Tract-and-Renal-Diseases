import Report from '../models/Report.js';
import Patient from '../models/Patient.js';
import ClinicalVerification from '../models/ClinicalVerification.js';
import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';

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

        // Call ML Core Service - Image analysis only (particle detection)
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

        // Determine if UTI is detected from image
        const wbcCount = mlResponse.data?.wbc?.total_count || 0;
        const yeastCount = mlResponse.data?.yeast?.total_count || 0;
        const bacteriaDetected = mlResponse.data?.bacteria?.detected || false;

        const utiDetectedFromImage = (wbcCount >= 5 || bacteriaDetected || yeastCount >= 3);

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
            imageUrl: `/uploads/${req.file.filename}`,
            analysis: mlResponse.data,
            utiDetectedFromImage: utiDetectedFromImage,
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
        const questionnaireData = req.body;

        // Get the existing report with image analysis
        let report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({ success: false, error: 'Report not found' });
        }

        // If UTI was detected from image AND patient provided clinical data, run ML models
        let updatedAnalysis = report.analysis;
        
        if (report.utiDetectedFromImage && questionnaireData) {
            try {
                // Prepare clinical data for UTI models (convert yes/no to 1/0)
                const clinicalData = {
                    age: parseInt(questionnaireData.age) || 0,
                    gender: questionnaireData.gender === 'female' ? 1 : 0,
                    dysuria: questionnaireData.dysuria === 'yes' ? 1 : 0,
                    abd_pain: parseInt(questionnaireData.abd_pain) || 0,
                    fever: questionnaireData.fever === 'yes' ? 1 : 0,
                    polyuria: questionnaireData.polyuria === 'yes' ? 1 : 0,
                    temperature: parseFloat(questionnaireData.temperature) || 0,
                    nausea: questionnaireData.nausea === 'yes' ? 1 : 0,
                    lumbar_pain: questionnaireData.lumbar_pain === 'yes' ? 1 : 0,
                    urine_pushing: questionnaireData.urine_pushing === 'yes' ? 1 : 0,
                    micturition_pain: questionnaireData.micturition_pain === 'yes' ? 1 : 0,
                    urethral_burning: questionnaireData.urethral_burning === 'yes' ? 1 : 0
                };

                // Get the image file from storage to re-analyze with metadata
                const imageUrl = report.imageUrl; // e.g. /uploads/filename.jpg
                const imagePath = `./public${imageUrl}`;

                // Call ML Core with image + clinical data
                const metadataFormData = new FormData();
                metadataFormData.append('file', fs.createReadStream(imagePath));
                
                // Add clinical fields as form parameters
                Object.keys(clinicalData).forEach(key => {
                    metadataFormData.append(key, clinicalData[key]);
                });

                const utiAnalysis = await axios.post('http://localhost:8000/analyze-with-metadata', metadataFormData, {
                    headers: {
                        ...metadataFormData.getHeaders()
                    }
                });

                // Merge UTI clinical analysis with existing image analysis
                updatedAnalysis = {
                    ...report.analysis,
                    clinical_dataset1: utiAnalysis.data?.clinical_dataset1 || null,
                    clinical_dataset2: utiAnalysis.data?.clinical_dataset2 || null,
                    fusion: utiAnalysis.data?.fusion || null
                };

            } catch (error) {
                console.error('UTI Clinical Analysis Error:', error.message);
                // Log the error but don't fail - use image analysis only
                console.warn('UTI clinical models unavailable, using image analysis only');
            }
        }

        // Update report with questionnaire data and clinical analysis
        report = await Report.findByIdAndUpdate(reportId, {
            clinicalData: questionnaireData,
            analysis: updatedAnalysis,
            status: 'Pending Verification'
        }, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: report });
    } catch (error) {
        next(error);
    }
};
