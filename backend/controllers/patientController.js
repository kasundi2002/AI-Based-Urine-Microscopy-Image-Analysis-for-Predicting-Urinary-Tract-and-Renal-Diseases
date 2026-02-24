import Patient from '../models/Patient.js';

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private (MLT, CLINICIAN)
export const getPatients = async (req, res, next) => {
    try {
        // Optionally add pagination or filtering logic here
        const patients = await Patient.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: patients.length,
            data: patients
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Private (MLT, CLINICIAN)
export const getPatient = async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.params.id);

        if (!patient) {
            return res.status(404).json({ success: false, error: 'Patient not found' });
        }

        res.status(200).json({ success: true, data: patient });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new patient
// @route   POST /api/patients
// @access  Private (MLT)
export const createPatient = async (req, res, next) => {
    try {
        const patient = await Patient.create(req.body);

        res.status(201).json({
            success: true,
            data: patient
        });
    } catch (error) {
        next(error);
    }
};
