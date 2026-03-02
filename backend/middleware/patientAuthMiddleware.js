import jwt from 'jsonwebtoken';
import Patient from '../models/Patient.js';

/**
 * Middleware to protect routes that require a valid patient JWT.
 * The patient JWT is separate from the staff (MLT/Clinician) JWT.
 * It should be sent as:  Authorization: Bearer <patient_jwt>
 */
export const protectPatient = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, error: 'Not authorised — patient token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== 'PATIENT') {
            return res.status(403).json({ success: false, error: 'This route is restricted to patients' });
        }

        // Attach patient DB id to request
        req.patientId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, error: 'Patient token is invalid or expired' });
    }
};
