const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
    name: {
        type: String,
        default: 'Anonymous User'
    },
    email: {
        type: String,
        default: 'no-email@provided.com'
    },
    phone: {
        type: String
    },
    issueType: {
        type: String,
        required: true,
        enum: ['Forgot Password', 'Invalid Email', 'Invalid Phone', 'Login Error', 'Account Locked', 'Other']
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
        default: 'Open'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    resolvedAt: {
        type: Date
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
