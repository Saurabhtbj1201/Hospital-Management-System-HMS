const mongoose = require('mongoose');

const siteUpdateSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    linkText: {
        type: String,
        default: ''
    },
    linkUrl: {
        type: String,
        default: ''
    },
    backgroundColor: {
        type: String,
        default: '#7c3aed' // Purple
    },
    textColor: {
        type: String,
        default: '#ffffff' // White
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
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Index for efficient querying of active banners
siteUpdateSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('SiteUpdate', siteUpdateSchema);
