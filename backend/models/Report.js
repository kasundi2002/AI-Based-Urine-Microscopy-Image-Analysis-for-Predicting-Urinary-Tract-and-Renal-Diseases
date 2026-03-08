import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Usually an MLT
        required: true
    },
    clinicianId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Clinician handling the review
    },
    imageUrl: {
        type: String, // Path or URL to images
        required: true
    },
    analysis: {
        type: mongoose.Schema.Types.Mixed // Allows nested ML payload structure without strict validation
    },
    clinicalData: {
        type: mongoose.Schema.Types.Mixed // Questionnaire data submitted by patient
    },
    utiDetectedFromImage: {
        type: Boolean,
        default: false // True if particles (WBC/bacteria/yeast) detected in image
    },
    status: {
        type: String,
        enum: ['Pending Verification', 'Verified', 'Rejected'],
        default: 'Pending Verification'
    },
    verifiedAt: Date,
    comments: String
}, {
    timestamps: true
});

const Report = mongoose.model('Report', reportSchema);
export default Report;
