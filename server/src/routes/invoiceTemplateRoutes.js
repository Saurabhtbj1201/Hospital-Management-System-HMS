const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, authorize } = require('../middleware/authMiddleware');
const InvoiceTemplate = require('../models/InvoiceTemplate');
const { uploadToS3, deleteFromS3, getPresignedUrl } = require('../services/s3Service');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Helper: get or create singleton template
const getOrCreateTemplate = async () => {
    let template = await InvoiceTemplate.findOne({ key: 'default' });
    if (!template) {
        template = await InvoiceTemplate.create({ key: 'default' });
    }
    return template;
};

// ─── GET /api/invoice-template ──────────────────────────────────────────────
// Get invoice template (any authenticated user)
router.get('/', protect, async (req, res) => {
    try {
        const template = await getOrCreateTemplate();
        const logoUrl = await getPresignedUrl(template.hospitalLogo);

        res.json({
            success: true,
            data: {
                ...template.toObject(),
                hospitalLogoUrl: logoUrl || ''
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ─── PUT /api/invoice-template ──────────────────────────────────────────────
// Update invoice template (Admin only)
router.put('/', protect, authorize('Admin'), async (req, res) => {
    try {
        const template = await getOrCreateTemplate();
        const {
            hospitalName, hospitalAddress, contactNumber,
            emailAddress, gstNumber, cinNumber, websiteUrl,
            footerNote, termsAndConditions
        } = req.body;

        if (hospitalName !== undefined) template.hospitalName = hospitalName;
        if (hospitalAddress !== undefined) template.hospitalAddress = hospitalAddress;
        if (contactNumber !== undefined) template.contactNumber = contactNumber;
        if (emailAddress !== undefined) template.emailAddress = emailAddress;
        if (gstNumber !== undefined) template.gstNumber = gstNumber;
        if (cinNumber !== undefined) template.cinNumber = cinNumber;
        if (websiteUrl !== undefined) template.websiteUrl = websiteUrl;
        if (footerNote !== undefined) template.footerNote = footerNote;
        if (termsAndConditions !== undefined) template.termsAndConditions = termsAndConditions;

        await template.save();

        const logoUrl = await getPresignedUrl(template.hospitalLogo);

        res.json({
            success: true,
            data: {
                ...template.toObject(),
                hospitalLogoUrl: logoUrl || ''
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// ─── POST /api/invoice-template/upload-logo ─────────────────────────────────
// Upload hospital logo (Admin only)
router.post('/upload-logo', protect, authorize('Admin'), upload.single('logo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({ success: false, message: 'Only JPEG, PNG, WebP, and SVG are allowed' });
        }

        const template = await getOrCreateTemplate();

        // Delete old logo if exists
        if (template.hospitalLogo) {
            await deleteFromS3(template.hospitalLogo);
        }

        const key = await uploadToS3(req.file.buffer, req.file.originalname, 'invoice-logos', req.file.mimetype);
        template.hospitalLogo = key;
        await template.save();

        const signedUrl = await getPresignedUrl(key);

        res.json({
            success: true,
            data: { url: signedUrl, key },
            message: 'Hospital logo uploaded successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ─── DELETE /api/invoice-template/logo ──────────────────────────────────────
// Remove hospital logo (Admin only)
router.delete('/logo', protect, authorize('Admin'), async (req, res) => {
    try {
        const template = await getOrCreateTemplate();

        if (template.hospitalLogo) {
            await deleteFromS3(template.hospitalLogo);
            template.hospitalLogo = '';
            await template.save();
        }

        res.json({ success: true, message: 'Hospital logo removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
