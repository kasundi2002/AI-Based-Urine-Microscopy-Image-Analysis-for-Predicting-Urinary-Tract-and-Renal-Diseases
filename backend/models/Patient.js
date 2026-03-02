import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
    patientId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    age: {
        type: Number,
        required: true,
        min: 0,
        max: 150
    },
    status: {
        type: String,
        enum: ['Awaiting Analysis', 'Ready for Review', 'Completed'],
        default: 'Awaiting Analysis'
    },
    riskAssessment: {
        type: String,
        enum: ['Normal', 'Pending', 'High', 'Low', 'Critical'],
        default: 'Pending'
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    mobile: {
        type: String,
        trim: true
    },
    // Secure email link fields
    accessToken: {
        type: String
    },
    accessTokenExpiry: {
        type: Date
    },
    // OTP fields
    otp: {
        type: String
    },
    otpExpiry: {
        type: Date
    },
    dateAssigned: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;
