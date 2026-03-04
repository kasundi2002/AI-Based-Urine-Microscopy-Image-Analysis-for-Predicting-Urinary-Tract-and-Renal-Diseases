import Report from '../models/Report.js';
import Patient from '../models/Patient.js';
import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';

// @desc    Get all reports (with patient and uploader details)
// @route   GET /api/reports
// @access  Private
export const getReports = async (req, res, next) => {
    try {
        const reports = await Report.find()
            .populate('patientId', 'name patientId')
            .populate('uploadedBy', 'name');

        res.status(200).json({ success: true, count: reports.length, data: reports });
    } catch (error) {
        next(error);
    }
};

// @desc    Upload an image & Create report analyzing findings
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

        // Update patient status to Ready for Review
        await Patient.findByIdAndUpdate(patientId, { status: 'Ready for Review' });

        const report = await Report.create({
            patientId,
            uploadedBy: req.user.id,
            imageUrl: `/uploads/${req.file.filename}`, // From multer
            analysis: mlResponse.data,
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
        const { comments, status } = req.body;

        let report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ success: false, error: 'Report not found' });
        }

        report = await Report.findByIdAndUpdate(req.params.id, {
            status: status || 'Verified',
            comments,
            clinicianId: req.user.id,
            verifiedAt: Date.now()
        }, {
            new: true,
            runValidators: true
        });

        // Update the associated patient based on report analysis
        await Patient.findByIdAndUpdate(report.patientId, {
            status: 'Completed',
            riskAssessment: report.riskScore > 75 ? 'High' : 'Normal'
        });

        res.status(200).json({ success: true, data: report });
    } catch (error) {
        next(error);
    }
};
