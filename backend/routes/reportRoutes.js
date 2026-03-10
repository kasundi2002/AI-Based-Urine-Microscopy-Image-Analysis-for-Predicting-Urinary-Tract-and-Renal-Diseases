import express from 'express';
import multer from 'multer';
import path from 'path';
import { getReports, uploadImage, getReport, verifyReport, submitReport, submitQuestionnaire } from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'public/uploads/'); // Needs public/uploads directory created
    },
    filename(req, file, cb) {
        cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Images only (jpg/png/webp)'));
    }
}

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

router.route('/')
    .get(protect, getReports);

// Using single 'image' to match possible frontend implementation
router.route('/upload')
    .post(protect, authorize('MLT'), upload.single('image'), uploadImage);

router.route('/submit')
    .post(protect, authorize('MLT'), submitReport);

router.route('/questionnaire')
    .post(submitQuestionnaire);

router.route('/:id')
    .get(protect, getReport);

router.route('/:id/verify')
    .put(protect, authorize('CLINICIAN'), verifyReport);

export default router;
