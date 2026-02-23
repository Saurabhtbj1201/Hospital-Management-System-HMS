const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    profilePhoto: { type: String, default: '' },
    digitalSignature: { type: String, default: '' },
    gender: { type: String, enum: ['Male', 'Female', 'Other', ''], default: '' },
    dateOfBirth: { type: Date, default: null },
    joiningDate: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);
