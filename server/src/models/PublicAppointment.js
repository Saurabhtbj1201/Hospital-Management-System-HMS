const mongoose = require('mongoose');

const publicAppointmentSchema = new mongoose.Schema({
    // Required fields
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    gender: {
        type: String,
        required: true,
        enum: ['Male', 'Female', 'Other']
    },
    dateOfBirth: {
        type: Date
    },
    age: {
        type: Number
    },
    ageMonths: {
        type: Number,
        min: 0,
        max: 12
    },
    relationship: {
        type: String,
        enum: {
            values: ['Self', 'Spouse', 'Parent', 'Child', 'Sibling', 'Other', ''],
            message: '{VALUE} is not a valid relationship'
        }
    },
    reasonForVisit: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    mobileNumber: {
        type: String,
        required: false,
        match: /^[6-9]\d{9}$/
    },
    emailAddress: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    appointmentDate: {
        type: Date,
        required: true
    },
    appointmentTime: {
        type: String,
        required: true
    },
    visitType: {
        type: String,
        required: true,
        enum: ['New Patient', 'Follow-up'],
        default: 'New Patient'
    },

    // Optional fields
    department: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        trim: true
    },
    state: {
        type: String,
        trim: true
    },
    pincode: {
        type: String,
        match: /^\d{6}$/
    },
    primaryConcern: {
        type: String,
        maxlength: 250
    },
    knownAllergies: {
        type: String,
        enum: ['Yes', 'No'],
        default: 'No'
    },
    allergiesDetails: {
        type: String
    },
    existingConditions: {
        type: String
    },
    emergencyContactName: {
        type: String,
        trim: true
    },
    emergencyContactNumber: {
        type: String,
        trim: true
    },
    emergencyRelationship: {
        type: String,
        enum: {
            values: ['Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Other', ''],
            message: '{VALUE} is not a valid relationship'
        }
    },

    // Doctor Assignment
    doctorAssigned: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    },

    // Cancel / Removal reasons
    cancelReason: {
        type: String,
        trim: true
    },
    doctorRemovalReason: {
        type: String,
        trim: true
    },
    doctorRemovedAt: {
        type: Date
    },

    // Profile Completion Status
    profileCompleted: {
        type: Boolean,
        default: false
    },

    // System-generated fields
    patientId: {
        type: String,
        index: true
    },
    appointmentId: {
        type: String,
        unique: true
    },
    appointmentStatus: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
        default: 'Pending'
    },
    source: {
        type: String,
        enum: ['Website', 'Walk-in', 'Admin'],
        default: 'Website'
    },
    bookedBy: {
        type: String,
        enum: ['Website', 'Admin Desk', 'Reception Desk'],
        default: 'Website'
    }
}, {
    timestamps: true
});

// Generate appointment ID before saving
publicAppointmentSchema.pre('save', async function () {
    if (!this.appointmentId) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');

        // Count appointments today
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));

        const count = await this.constructor.countDocuments({
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });

        const sequence = (count + 1).toString().padStart(4, '0');
        this.appointmentId = `APT${year}${month}${day}${sequence}`;
    }

    // Reuse patient ID for same mobile number, or generate a new one
    if (!this.patientId) {
        if (this.mobileNumber) {
            const existing = await this.constructor.findOne(
                { mobileNumber: this.mobileNumber, patientId: { $ne: null } },
                { patientId: 1 }
            ).sort({ createdAt: -1 });
            if (existing) {
                this.patientId = existing.patientId;
                return;
            }
        }
        // Generate new patient ID using highest existing sequence
        const lastPatient = await this.constructor.findOne(
            { patientId: { $ne: null } },
            { patientId: 1 }
        ).sort({ patientId: -1 });
        let nextNum = 1;
        if (lastPatient && lastPatient.patientId) {
            const num = parseInt(lastPatient.patientId.replace('PAT', ''));
            if (!isNaN(num)) nextNum = num + 1;
        }
        this.patientId = `PAT${nextNum.toString().padStart(6, '0')}`;
    }
});

module.exports = mongoose.model('PublicAppointment', publicAppointmentSchema);
