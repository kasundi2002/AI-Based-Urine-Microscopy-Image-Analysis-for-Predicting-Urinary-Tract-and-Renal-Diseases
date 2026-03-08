import mongoose from 'mongoose';

const clinicalVerificationSchema = new mongoose.Schema({
    reportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Report',
        required: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    clinicianId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    agreement: {
        type: String,
        enum: ['agree', 'modify', 'reject'],
        required: true
    },
    clinicalNotes: {
        type: String,
        default: ''
    },
    prescription: {
        type: String,
        default: ''
    },
    verifiedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const ClinicalVerification = mongoose.model('ClinicalVerification', clinicalVerificationSchema);
export default ClinicalVerification;
