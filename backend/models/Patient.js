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
    dateAssigned: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;
