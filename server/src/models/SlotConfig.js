const mongoose = require('mongoose');

const dateOverrideSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    isHoliday: {
        type: Boolean,
        default: false
    },
    reason: {
        type: String,
        default: ''
    },
    customStartTime: {
        type: String,
        default: ''
    },
    customEndTime: {
        type: String,
        default: ''
    }
}, { _id: true });

const workingDaySchema = new mongoose.Schema({
    day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        required: true
    },
    enabled: {
        type: Boolean,
        default: false
    },
    startTime: {
        type: String,
        default: '09:00'
    },
    endTime: {
        type: String,
        default: '17:00'
    },
    breakStart: {
        type: String,
        default: '13:00'
    },
    breakEnd: {
        type: String,
        default: '14:00'
    }
}, { _id: false });

const slotConfigSchema = new mongoose.Schema({
    // Shared config — single document for all receptionists
    key: {
        type: String,
        default: 'shared',
        unique: true,
        immutable: true
    },

    // Track who last modified
    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // Working days schedule
    workingDays: {
        type: [workingDaySchema],
        default: [
            { day: 'monday', enabled: true, startTime: '09:00', endTime: '17:00', breakStart: '13:00', breakEnd: '14:00' },
            { day: 'tuesday', enabled: true, startTime: '09:00', endTime: '17:00', breakStart: '13:00', breakEnd: '14:00' },
            { day: 'wednesday', enabled: true, startTime: '09:00', endTime: '17:00', breakStart: '13:00', breakEnd: '14:00' },
            { day: 'thursday', enabled: true, startTime: '09:00', endTime: '17:00', breakStart: '13:00', breakEnd: '14:00' },
            { day: 'friday', enabled: true, startTime: '09:00', endTime: '17:00', breakStart: '13:00', breakEnd: '14:00' },
            { day: 'saturday', enabled: false, startTime: '09:00', endTime: '13:00', breakStart: '', breakEnd: '' },
            { day: 'sunday', enabled: false, startTime: '', endTime: '', breakStart: '', breakEnd: '' }
        ]
    },

    // Date-specific overrides (holidays, custom hours)
    dateOverrides: [dateOverrideSchema],

    // Booking rules
    minAdvanceBookingMinutes: {
        type: Number,
        default: 120 // 2 hours
    },
    sameDayCutoffTime: {
        type: String,
        default: '17:00' // no same-day booking after 5 PM
    }

}, { timestamps: true });

// Admin-level global defaults
const slotDefaultsSchema = new mongoose.Schema({
    // Singleton — only one doc
    key: {
        type: String,
        default: 'global',
        unique: true,
        immutable: true
    },

    maxBookingWindowDays: {
        type: Number,
        default: 20
    },
    defaultSlotDurationMinutes: {
        type: Number,
        default: 30
    },
    defaultWorkingHoursStart: {
        type: String,
        default: '09:00'
    },
    defaultWorkingHoursEnd: {
        type: String,
        default: '17:00'
    },
    defaultBreakStart: {
        type: String,
        default: '13:00'
    },
    defaultBreakEnd: {
        type: String,
        default: '14:00'
    },
    defaultDailyCapacity: {
        type: Number,
        default: 30
    }
}, { timestamps: true });

const SlotConfig = mongoose.model('SlotConfig', slotConfigSchema);
const SlotDefaults = mongoose.model('SlotDefaults', slotDefaultsSchema);

// One-time migration: drop old per-receptionist unique index
SlotConfig.collection.dropIndex('receptionist_1').catch(() => {
    // Index may not exist — safe to ignore
});

module.exports = { SlotConfig, SlotDefaults };
