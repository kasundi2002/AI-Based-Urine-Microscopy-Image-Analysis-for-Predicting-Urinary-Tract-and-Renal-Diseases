import express from 'express';
import { getPatients, getPatient, createPatient, deletePatient } from '../controllers/patientController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, authorize('MLT', 'CLINICIAN'), getPatients)
    .post(protect, authorize('MLT'), createPatient);

router.route('/:id')
    .get(protect, authorize('MLT', 'CLINICIAN'), getPatient)
    .delete(protect, authorize('MLT'), deletePatient);

export default router;
