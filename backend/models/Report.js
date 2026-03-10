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
        type: String // Path or URL to images
    },
    analysis: {
        type: mongoose.Schema.Types.Mixed // Allows nested ML payload structure without strict validation
    },
    chemicalParameters: {
        type: mongoose.Schema.Types.Mixed // Chemical urine test results entered by MLT
    },
    clinicalData: {
        type: mongoose.Schema.Types.Mixed // Questionnaire data submitted by patient
    },
    utiDetectedFromImage: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['Pending Verification', 'Verified', 'Rejected'],
        default: 'Pending Verification'
    },
    verifiedAt: Date,
    comments: String,
    questionnaireAnswers: {
        type: mongoose.Schema.Types.Mixed
    },
    riskPrediction: {
        diagnosisScore: Number,
        questionnaireScore: Number,
        finalScore: Number,
        riskLevel: String
    }
}, {
    timestamps: true
});

const Report = mongoose.model('Report', reportSchema);
export default Report;
