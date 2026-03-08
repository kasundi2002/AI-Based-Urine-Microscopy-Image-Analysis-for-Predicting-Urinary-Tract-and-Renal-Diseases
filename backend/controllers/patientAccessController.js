import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import Patient from '../models/Patient.js';
import Report from '../models/Report.js';
import { sendAccessEmail } from '../utils/emailService.js';
import { generateOTP, sendOTP } from '../utils/otpService.js';

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Generate a short-lived patient JWT (different from the staff JWT) */
const generatePatientToken = (patient) => {
    return jwt.sign(
        { id: patient._id, patientId: patient.patientId, role: 'PATIENT' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.PATIENT_TOKEN_EXPIRE || '2h' }
    );
};

/** Hash token for storage (never store raw token in DB) */
const hashToken = (token) =>
    crypto.createHash('sha256').update(token).digest('hex');

// ─── Controllers ───────────────────────────────────────────────────────────

/**
 * @desc  Get the authenticated patient's latest report + patient info
 * @route GET /api/patient-access/my-report
 * @access Private (Patient JWT via protectPatient)
 */
export const getMyReport = async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.patientId)
            .select('-otp -otpExpiry -accessToken -accessTokenExpiry');

        if (!patient) {
            return res.status(404).json({ success: false, error: 'Patient not found' });
        }

        // Get the latest report for this patient
        const reports = await Report.find({ patientId: patient._id })
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            patient: {
                id: patient._id,
                patientId: patient.patientId,
                name: patient.name,
                age: patient.age,
                gender: patient.gender,
                status: patient.status,
            },
            reports: reports || []
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc  MLT triggers a secure access email to a registered patient
 * @route POST /api/patient-access/send-link
 * @access Private (MLT)
 */
export const sendAccessLink = async (req, res, next) => {
    try {
        const { patientId } = req.body;

        if (!patientId) {
            return res.status(400).json({ success: false, error: 'Patient ID is required' });
        }

        // Find patient by their display patientId string (e.g. "P01")
        const patient = await Patient.findOne({ patientId });

        if (!patient) {
            return res.status(404).json({ success: false, error: 'Patient not found' });
        }

        if (!patient.email) {
            return res.status(400).json({ success: false, error: 'Patient does not have an email address registered' });
        }

        // Generate a raw token, store hashed version
        const rawToken = crypto.randomBytes(32).toString('hex');
        const expireMinutes = 60; // 1 hour

        patient.accessToken = hashToken(rawToken);
        patient.accessTokenExpiry = new Date(Date.now() + expireMinutes * 60 * 1000);
        await patient.save();

        // Send email (non-blocking — don't crash if email fails)
        try {
            await sendAccessEmail(patient, rawToken);
            patient.emailSent = true;
            await patient.save();
        } catch (emailErr) {
            console.error('Email send failed:', emailErr.message);
        }

        res.status(200).json({
            success: true,
            message: `Secure access link sent to ${patient.email}`
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc  Validate token + PatientID + mobile; send OTP
 * @route POST /api/patient-access/verify-identity
 * @access Public
 */
export const verifyIdentity = async (req, res, next) => {
    try {
        const { token, patientId, mobile } = req.body;

        if (!token || !patientId || !mobile) {
            return res.status(400).json({ success: false, error: 'token, patientId, and mobile are required' });
        }

        const hashedToken = hashToken(token);

        const patient = await Patient.findOne({
            patientId,
            accessToken: hashedToken,
            accessTokenExpiry: { $gt: Date.now() }
        });

        if (!patient) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired access link. Please contact your laboratory.'
            });
        }

        // Validate mobile
        const normalizedInput = mobile.replace(/\s+/g, '').replace(/^\+/, '');
        const normalizedStored = (patient.mobile || '').replace(/\s+/g, '').replace(/^\+/, '');

        if (normalizedInput !== normalizedStored) {
            return res.status(401).json({
                success: false,
                error: 'Mobile number does not match our records.'
            });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpireMinutes = parseInt(process.env.OTP_EXPIRE_MINUTES) || 10;

        patient.otp = otp;
        patient.otpExpiry = new Date(Date.now() + otpExpireMinutes * 60 * 1000);
        await patient.save();

        // Mock send OTP via SMS
        await sendOTP(patient.mobile, otp);

        res.status(200).json({
            success: true,
            message: `OTP sent to your registered mobile number ending in ${patient.mobile.slice(-3)}`
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc  Validate OTP; return patient JWT
 * @route POST /api/patient-access/verify-otp
 * @access Public
 */
export const verifyOTP = async (req, res, next) => {
    try {
        const { token, otp } = req.body;

        if (!token || !otp) {
            return res.status(400).json({ success: false, error: 'token and otp are required' });
        }

        const hashedToken = hashToken(token);

        const patient = await Patient.findOne({
            accessToken: hashedToken,
            otp,
            otpExpiry: { $gt: Date.now() }
        });

        if (!patient) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired OTP. Please try again.'
            });
        }

        // Clear OTP and access token after successful verification (one-time use)
        patient.otp = undefined;
        patient.otpExpiry = undefined;
        patient.accessToken = undefined;
        patient.accessTokenExpiry = undefined;
        await patient.save();

        const jwtToken = generatePatientToken(patient);

        res.status(200).json({
            success: true,
            token: jwtToken,
            patient: {
                id: patient._id,
                patientId: patient.patientId,
                name: patient.name,
                age: patient.age,
                status: patient.status,
                riskAssessment: patient.riskAssessment
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc  Get current patient info (requires patient JWT)
 * @route GET /api/patient-access/me
 * @access Private (Patient JWT)
 */
export const getPatientMe = async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.patientId).select('-otp -otpExpiry -accessToken -accessTokenExpiry');

        if (!patient) {
            return res.status(404).json({ success: false, error: 'Patient not found' });
        }

        res.status(200).json({ success: true, data: patient });
    } catch (error) {
        next(error);
    }
};
