const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        default: null
    },
    departments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    }],
    qualifications: {
        type: String,
        default: ''
    },
    experience: {
        type: Number,
        default: 0
    },
    fees: {
        type: Number,
        default: 0
    },
    availableSlots: [{
        day: String,
        startTime: String,
        endTime: String
    }],
    isActive: {
        type: Boolean,
        default: true
    },

    // Personal details
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other', ''],
        default: ''
    },
    dateOfBirth: {
        type: Date,
        default: null
    },
    medicalCouncilId: {
        type: String,
        default: ''
    },
    profilePhoto: {
        type: String,
        default: ''
    },
    digitalSignature: {
        type: String,
        default: ''
    },

    // Public website content
    shortBio: {
        type: String,
        default: '',
        maxlength: 1000
    },
    detailedBiography: {
        type: String,
        default: ''
    },
    specialInterests: [{
        type: String
    }],
    featuredTreatments: [{
        type: String
    }],
    patientTestimonials: [{
        patientName: { type: String, default: '' },
        testimonial: { type: String, default: '' },
        rating: { type: Number, default: 5, min: 1, max: 5 }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
