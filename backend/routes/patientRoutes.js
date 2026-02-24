import express from 'express';
import { getPatients, getPatient, createPatient } from '../controllers/patientController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, authorize('MLT', 'CLINICIAN'), getPatients)
    .post(protect, authorize('MLT'), createPatient);

router.route('/:id')
    .get(protect, authorize('MLT', 'CLINICIAN'), getPatient);

export default router;
