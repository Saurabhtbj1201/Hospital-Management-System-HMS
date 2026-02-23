const Announcement = require('../models/Announcement');

// Get all active announcements (public)
exports.getActiveAnnouncements = async (req, res) => {
    try {
        const now = new Date();
        const announcements = await Announcement.find({
            isActive: true,
            startDate: { $lte: now },
            $or: [
                { endDate: { $exists: false } },
                { endDate: { $gte: now } }
            ]
        })
            .populate('createdBy', 'name email')
            .sort({ priority: -1, createdAt: -1 });

        res.status(200).json({
            success: true,
            count: announcements.length,
            announcements
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all announcements (Admin only)
exports.getAllAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find()
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: announcements.length,
            announcements
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get single announcement
exports.getAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id)
            .populate('createdBy', 'name email');

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found'
            });
        }

        res.status(200).json({
            success: true,
            announcement
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create announcement (Admin only)
exports.createAnnouncement = async (req, res) => {
    try {
        const { title, message, type, priority, startDate, endDate, targetAudience, icon } = req.body;

        const announcement = await Announcement.create({
            title,
            message,
            type,
            priority,
            startDate,
            endDate,
            targetAudience,
            icon,
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            message: 'Announcement created successfully',
            announcement
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update announcement (Admin only)
exports.updateAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('createdBy', 'name email');

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Announcement updated successfully',
            announcement
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete announcement (Admin only)
exports.deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndDelete(req.params.id);

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Announcement deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Toggle announcement status (Admin only)
exports.toggleAnnouncementStatus = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found'
            });
        }

        announcement.isActive = !announcement.isActive;
        await announcement.save();

        res.status(200).json({
            success: true,
            message: `Announcement ${announcement.isActive ? 'activated' : 'deactivated'} successfully`,
            announcement
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
