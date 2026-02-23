const SiteUpdate = require('../models/SiteUpdate');

// Get active site update banner (public)
exports.getActiveBanner = async (req, res) => {
    try {
        const now = new Date();
        const banner = await SiteUpdate.findOne({
            isActive: true,
            startDate: { $lte: now },
            $or: [
                { endDate: { $exists: false } },
                { endDate: { $gte: now } }
            ]
        })
            .sort({ createdAt: -1 })
            .populate('createdBy', 'name email');

        res.status(200).json({
            success: true,
            banner
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all site update banners (Admin only)
exports.getAllBanners = async (req, res) => {
    try {
        const banners = await SiteUpdate.find()
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: banners.length,
            banners
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get single site update banner (Admin only)
exports.getBanner = async (req, res) => {
    try {
        const banner = await SiteUpdate.findById(req.params.id)
            .populate('createdBy', 'name email');

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: 'Banner not found'
            });
        }

        res.status(200).json({
            success: true,
            banner
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create site update banner (Admin only)
exports.createBanner = async (req, res) => {
    try {
        const { message, linkText, linkUrl, backgroundColor, textColor, startDate, endDate } = req.body;

        const banner = await SiteUpdate.create({
            message,
            linkText,
            linkUrl,
            backgroundColor,
            textColor,
            startDate,
            endDate,
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            message: 'Site update banner created successfully',
            banner
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update site update banner (Admin only)
exports.updateBanner = async (req, res) => {
    try {
        const { message, linkText, linkUrl, backgroundColor, textColor, startDate, endDate, isActive } = req.body;

        const banner = await SiteUpdate.findByIdAndUpdate(
            req.params.id,
            {
                message,
                linkText,
                linkUrl,
                backgroundColor,
                textColor,
                startDate,
                endDate,
                isActive
            },
            { new: true, runValidators: true }
        );

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: 'Banner not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Site update banner updated successfully',
            banner
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete site update banner (Admin only)
exports.deleteBanner = async (req, res) => {
    try {
        const banner = await SiteUpdate.findByIdAndDelete(req.params.id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: 'Banner not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Site update banner deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Toggle banner active status (Admin only)
exports.toggleBannerStatus = async (req, res) => {
    try {
        const banner = await SiteUpdate.findById(req.params.id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: 'Banner not found'
            });
        }

        banner.isActive = !banner.isActive;
        await banner.save();

        res.status(200).json({
            success: true,
            message: `Banner ${banner.isActive ? 'activated' : 'deactivated'} successfully`,
            banner
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
