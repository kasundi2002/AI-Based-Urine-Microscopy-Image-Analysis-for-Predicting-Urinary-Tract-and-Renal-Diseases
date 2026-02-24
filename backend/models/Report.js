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
    findings: {
        wbc: { type: Number, default: 0 },
        rbc: { type: Number, default: 0 },
        crystals: { type: String, default: 'Absent' },
        bacteria: { type: String, default: 'None' }
    },
    riskScore: {
        type: Number,
        min: 0,
        max: 100
    },
    riskLabel: {
        type: String,
        default: 'Pending Analysis'
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
