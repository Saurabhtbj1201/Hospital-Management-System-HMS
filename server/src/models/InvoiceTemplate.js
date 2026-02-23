const mongoose = require('mongoose');

const invoiceTemplateSchema = new mongoose.Schema({
    key: {
        type: String,
        default: 'default',
        unique: true,
        immutable: true
    },
    hospitalLogo: {
        type: String,
        default: ''  // S3 key
    },
    hospitalName: {
        type: String,
        default: ''
    },
    hospitalAddress: {
        type: String,
        default: ''
    },
    contactNumber: {
        type: String,
        default: ''
    },
    emailAddress: {
        type: String,
        default: ''
    },
    gstNumber: {
        type: String,
        default: ''
    },
    cinNumber: {
        type: String,
        default: ''
    },
    websiteUrl: {
        type: String,
        default: ''
    },
    footerNote: {
        type: String,
        default: 'This is a computer-generated invoice.'
    },
    termsAndConditions: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('InvoiceTemplate', invoiceTemplateSchema);
