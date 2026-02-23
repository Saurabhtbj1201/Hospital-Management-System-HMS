const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    image: {
        type: String
    },
    defaultConsultationFee: {
        type: Number,
        default: 0
    },
    services: [{
        serviceName: {
            type: String,
            required: true
        },
        fee: {
            type: Number,
            required: true
        },
        description: String
    }],
    contact: {
        phone: String,
        email: String,
        location: String,
        workingHours: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
