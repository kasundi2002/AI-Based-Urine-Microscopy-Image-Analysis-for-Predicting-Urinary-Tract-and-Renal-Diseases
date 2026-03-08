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
        // Generate a new patientId like "P01", "P02", etc.
        const count = await Patient.countDocuments();
        const paddedCount = String(count + 1).padStart(2, '0');
        const patientIdStr = `P${paddedCount}`;

        const patientData = {
            ...req.body,
            patientId: patientIdStr
        };

        const patient = await Patient.create(patientData);

        res.status(201).json({
            success: true,
            data: patient
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private (MLT)
export const deletePatient = async (req, res, next) => {
    try {
        const patient = await Patient.findByIdAndDelete(req.params.id);

        if (!patient) {
            return res.status(404).json({ success: false, error: 'Patient not found' });
        }

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private (MLT, CLINICIAN)
export const updatePatient = async (req, res, next) => {
    try {
        let patient = await Patient.findById(req.params.id);

        if (!patient) {
            return res.status(404).json({ success: false, error: 'Patient not found' });
        }

        // Only allow updating certain unprivileged fields
        const { name, age, gender, email, mobile, notes } = req.body;
        
        patient = await Patient.findByIdAndUpdate(req.params.id, {
            name, age, gender, email, mobile, notes
        }, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: patient });
    } catch (error) {
        next(error);
    }
};
