const { SlotConfig, SlotDefaults } = require('../models/SlotConfig');

// ─── Receptionist: Get shared slot config ───
exports.getMySlotConfig = async (req, res) => {
    try {
        let config = await SlotConfig.findOne({ key: 'shared' });

        // Auto-create with defaults if not exists
        if (!config) {
            const defaults = await SlotDefaults.findOne({ key: 'global' });
            const defaultStart = defaults?.defaultWorkingHoursStart || '09:00';
            const defaultEnd = defaults?.defaultWorkingHoursEnd || '17:00';
            const defaultBreakStart = defaults?.defaultBreakStart || '13:00';
            const defaultBreakEnd = defaults?.defaultBreakEnd || '14:00';

            config = await SlotConfig.create({
                key: 'shared',
                lastModifiedBy: req.user._id,
                workingDays: [
                    { day: 'monday', enabled: true, startTime: defaultStart, endTime: defaultEnd, breakStart: defaultBreakStart, breakEnd: defaultBreakEnd },
                    { day: 'tuesday', enabled: true, startTime: defaultStart, endTime: defaultEnd, breakStart: defaultBreakStart, breakEnd: defaultBreakEnd },
                    { day: 'wednesday', enabled: true, startTime: defaultStart, endTime: defaultEnd, breakStart: defaultBreakStart, breakEnd: defaultBreakEnd },
                    { day: 'thursday', enabled: true, startTime: defaultStart, endTime: defaultEnd, breakStart: defaultBreakStart, breakEnd: defaultBreakEnd },
                    { day: 'friday', enabled: true, startTime: defaultStart, endTime: defaultEnd, breakStart: defaultBreakStart, breakEnd: defaultBreakEnd },
                    { day: 'saturday', enabled: false, startTime: defaultStart, endTime: '13:00', breakStart: '', breakEnd: '' },
                    { day: 'sunday', enabled: false, startTime: '', endTime: '', breakStart: '', breakEnd: '' }
                ]
            });
        }

        // Attach maxBookingWindowDays from global defaults
        const globalDefaults = await SlotDefaults.findOne({ key: 'global' });
        const configObj = config.toObject();
        configObj.maxBookingWindowDays = globalDefaults?.maxBookingWindowDays || 20;

        res.json(configObj);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── Receptionist: Update working days ───
exports.updateWorkingDays = async (req, res) => {
    try {
        const { workingDays } = req.body;

        let config = await SlotConfig.findOne({ key: 'shared' });
        if (!config) {
            config = await SlotConfig.create({ key: 'shared', lastModifiedBy: req.user._id, workingDays });
        } else {
            config.workingDays = workingDays;
            config.lastModifiedBy = req.user._id;
            await config.save();
        }

        res.json(config);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── Receptionist: Update booking rules ───
exports.updateBookingRules = async (req, res) => {
    try {
        const { minAdvanceBookingMinutes, sameDayCutoffTime } = req.body;

        let config = await SlotConfig.findOne({ key: 'shared' });
        if (!config) {
            config = await SlotConfig.create({
                key: 'shared',
                lastModifiedBy: req.user._id,
                minAdvanceBookingMinutes,
                sameDayCutoffTime
            });
        } else {
            if (minAdvanceBookingMinutes !== undefined) config.minAdvanceBookingMinutes = minAdvanceBookingMinutes;
            if (sameDayCutoffTime !== undefined) config.sameDayCutoffTime = sameDayCutoffTime;
            config.lastModifiedBy = req.user._id;
            await config.save();
        }

        res.json(config);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── Receptionist: Add/Update date override ───
exports.upsertDateOverride = async (req, res) => {
    try {
        const { date, isHoliday, reason, customStartTime, customEndTime } = req.body;
        if (!date) return res.status(400).json({ message: 'Date is required' });

        let config = await SlotConfig.findOne({ key: 'shared' });
        if (!config) {
            config = await SlotConfig.create({ key: 'shared', lastModifiedBy: req.user._id });
        }

        // Normalize to start-of-day for comparison
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        const existingIdx = config.dateOverrides.findIndex(o => {
            const d = new Date(o.date);
            d.setHours(0, 0, 0, 0);
            return d.getTime() === targetDate.getTime();
        });

        const override = { date: targetDate, isHoliday: !!isHoliday, reason: reason || '', customStartTime: customStartTime || '', customEndTime: customEndTime || '' };

        if (existingIdx >= 0) {
            config.dateOverrides[existingIdx] = { ...config.dateOverrides[existingIdx].toObject(), ...override };
        } else {
            config.dateOverrides.push(override);
        }

        // Sort by date
        config.dateOverrides.sort((a, b) => new Date(a.date) - new Date(b.date));

        config.lastModifiedBy = req.user._id;
        await config.save();
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── Receptionist: Remove date override ───
exports.removeDateOverride = async (req, res) => {
    try {
        const { overrideId } = req.params;

        const config = await SlotConfig.findOne({ key: 'shared' });
        if (!config) return res.status(404).json({ message: 'Slot config not found' });

        config.dateOverrides = config.dateOverrides.filter(o => o._id.toString() !== overrideId);
        config.lastModifiedBy = req.user._id;
        await config.save();

        res.json(config);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── Admin: Get global defaults ───
exports.getSlotDefaults = async (req, res) => {
    try {
        let defaults = await SlotDefaults.findOne({ key: 'global' });
        if (!defaults) {
            defaults = await SlotDefaults.create({ key: 'global' });
        }
        res.json(defaults);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── Admin: Update global defaults ───
exports.updateSlotDefaults = async (req, res) => {
    try {
        const {
            maxBookingWindowDays,
            defaultSlotDurationMinutes,
            defaultWorkingHoursStart,
            defaultWorkingHoursEnd,
            defaultBreakStart,
            defaultBreakEnd,
            defaultDailyCapacity
        } = req.body;

        let defaults = await SlotDefaults.findOne({ key: 'global' });
        if (!defaults) {
            defaults = await SlotDefaults.create({ key: 'global' });
        }

        if (maxBookingWindowDays !== undefined) defaults.maxBookingWindowDays = maxBookingWindowDays;
        if (defaultSlotDurationMinutes !== undefined) defaults.defaultSlotDurationMinutes = defaultSlotDurationMinutes;
        if (defaultWorkingHoursStart !== undefined) defaults.defaultWorkingHoursStart = defaultWorkingHoursStart;
        if (defaultWorkingHoursEnd !== undefined) defaults.defaultWorkingHoursEnd = defaultWorkingHoursEnd;
        if (defaultBreakStart !== undefined) defaults.defaultBreakStart = defaultBreakStart;
        if (defaultBreakEnd !== undefined) defaults.defaultBreakEnd = defaultBreakEnd;
        if (defaultDailyCapacity !== undefined) defaults.defaultDailyCapacity = defaultDailyCapacity;

        await defaults.save();
        res.json(defaults);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── Admin: Get all slot configs (now returns the single shared config) ───
exports.getAllSlotConfigs = async (req, res) => {
    try {
        const configs = await SlotConfig.find()
            .populate('lastModifiedBy', 'name email phone')
            .sort({ updatedAt: -1 });
        res.json(configs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── Admin: Get single slot config ───
exports.getSlotConfigById = async (req, res) => {
    try {
        const config = await SlotConfig.findById(req.params.id)
            .populate('lastModifiedBy', 'name email phone');
        if (!config) return res.status(404).json({ message: 'Slot config not found' });
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── Admin: Update slot config ───
exports.updateSlotConfigById = async (req, res) => {
    try {
        const config = await SlotConfig.findById(req.params.id);
        if (!config) return res.status(404).json({ message: 'Slot config not found' });

        const { workingDays, dateOverrides, minAdvanceBookingMinutes, sameDayCutoffTime } = req.body;

        if (workingDays !== undefined) config.workingDays = workingDays;
        if (dateOverrides !== undefined) config.dateOverrides = dateOverrides;
        if (minAdvanceBookingMinutes !== undefined) config.minAdvanceBookingMinutes = minAdvanceBookingMinutes;
        if (sameDayCutoffTime !== undefined) config.sameDayCutoffTime = sameDayCutoffTime;

        await config.save();

        const updatedConfig = await SlotConfig.findById(config._id)
            .populate('lastModifiedBy', 'name email phone');
        res.json(updatedConfig);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
