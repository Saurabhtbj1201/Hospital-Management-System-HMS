const express = require('express');
const router = express.Router();
const {
    getActiveAnnouncements,
    getAllAnnouncements,
    getAnnouncement,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    toggleAnnouncementStatus
} = require('../controllers/announcementController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public route - get active announcements
router.get('/active', getActiveAnnouncements);

// Protected routes - Admin only
router.get('/', protect, admin, getAllAnnouncements);
router.get('/:id', protect, admin, getAnnouncement);
router.post('/', protect, admin, createAnnouncement);
router.put('/:id', protect, admin, updateAnnouncement);
router.delete('/:id', protect, admin, deleteAnnouncement);
router.patch('/:id/toggle', protect, admin, toggleAnnouncementStatus);

module.exports = router;
