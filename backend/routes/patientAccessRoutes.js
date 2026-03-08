import express from 'express';
import { sendAccessLink, verifyIdentity, verifyOTP, getPatientMe, getMyReport } from '../controllers/patientAccessController.js';
import { protectPatient } from '../middleware/patientAuthMiddleware.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// MLT sends the email link to the patient (requires MLT staff login)
router.post('/send-link', protect, authorize('MLT'), sendAccessLink);

// Public: patient verifies their identity (token + patientId + mobile)
router.post('/verify-identity', verifyIdentity);

// Public: patient submits OTP to receive their patient JWT
router.post('/verify-otp', verifyOTP);

// Private (patient JWT): get current patient info
router.get('/me', protectPatient, getPatientMe);

// Private (patient JWT): get patient's own report(s)
router.get('/my-report', protectPatient, getMyReport);

export default router;
