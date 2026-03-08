import express from 'express';
import { getPatients, getPatient, createPatient, deletePatient, updatePatient } from '../controllers/patientController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, authorize('MLT', 'CLINICIAN'), getPatients)
    .post(protect, authorize('MLT'), createPatient);

router.route('/:id')
    .get(protect, authorize('MLT', 'CLINICIAN'), getPatient)
    .put(protect, authorize('MLT', 'CLINICIAN'), updatePatient)
    .delete(protect, authorize('MLT'), deletePatient);

export default router;
