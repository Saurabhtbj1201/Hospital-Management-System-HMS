const mongoose = require('mongoose');

const receptionistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    profilePhoto: { type: String, default: '' },
    gender: { type: String, enum: ['Male', 'Female', 'Other', ''], default: '' },
    dateOfBirth: { type: Date, default: null },
    shift: { type: String, enum: ['Morning', 'Afternoon', 'Night', 'Rotational', ''], default: '' },
    joiningDate: { type: Date, default: null },
    idProofType: {
        type: String,
        enum: ['Aadhar', 'Voter ID', 'PAN', 'Passport', ''],
        default: ''
    },
    idProofNumber: { type: String, default: '' },
    idProofDocument: { type: String, default: '' },
    digitalSignature: { type: String, default: '' },
    experience: { type: Number, default: 0 },
    educationLevel: {
        type: String,
        enum: ['Below Matriculation', 'Matriculation', 'Intermediate', 'Graduate', 'Post Graduate', 'Diploma', 'Other', ''],
        default: ''
    },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Receptionist', receptionistSchema);
