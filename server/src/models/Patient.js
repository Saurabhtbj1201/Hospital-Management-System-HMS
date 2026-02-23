const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    bloodGroup: {
        type: String
    },
    address: {
        type: String
    },
    medicalHistory: [{
        condition: String,
        diagnosisDate: Date,
        notes: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
