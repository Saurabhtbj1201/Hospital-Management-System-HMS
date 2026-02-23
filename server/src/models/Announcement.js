const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['info', 'warning', 'success', 'error'],
        default: 'info'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date
    },
    targetAudience: {
        type: String,
        enum: ['all', 'admin', 'doctor', 'receptionist', 'patient'],
        default: 'all'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    icon: {
        type: String,
        default: 'bell'
    }
}, {
    timestamps: true
});

// Index for efficient querying
announcementSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);
