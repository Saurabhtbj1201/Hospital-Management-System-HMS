const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    publicAppointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PublicAppointment',
        required: true
    },
    billNumber: {
        type: String,
        unique: true
    },
    services: [{
        name: {
            type: String,
            required: true
        },
        description: String,
        amount: {
            type: Number,
            required: true
        }
    }],
    subtotal: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        default: 0
    },
    roundOff: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paidAmount: {
        type: Number,
        default: 0
    },
    dueAmount: {
        type: Number,
        default: 0
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Due', 'Partial'],
        default: 'Pending'
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Card', 'UPI', 'Online', 'Insurance', ''],
        default: ''
    },
    transactionId: {
        type: String
    },
    notes: {
        type: String
    },
    generatedBy: {
        name: { type: String },
        role: { type: String }
    },
    generatedBySignature: {
        type: String,
        default: ''
    }
}, { timestamps: true });

// Generate bill number before saving
billSchema.pre('save', async function () {
    if (!this.billNumber) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');

        const count = await this.constructor.countDocuments();
        const sequence = (count + 1).toString().padStart(5, '0');

        this.billNumber = `INV${year}${month}${sequence}`;
    }
});

module.exports = mongoose.model('Bill', billSchema);
