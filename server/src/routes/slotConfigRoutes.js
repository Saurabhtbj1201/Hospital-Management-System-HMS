const express = require('express');
const router = express.Router();
const { protect, admin, authorize } = require('../middleware/authMiddleware');
const {
    getMySlotConfig,
    updateWorkingDays,
    updateBookingRules,
    upsertDateOverride,
    removeDateOverride,
    getSlotDefaults,
    updateSlotDefaults,
    getAllSlotConfigs,
    getSlotConfigById,
    updateSlotConfigById
} = require('../controllers/slotConfigController');

// All routes require authentication
router.use(protect);

// ─── Receptionist routes ───
router.get('/my-config', authorize('Receptionist'), getMySlotConfig);
router.put('/working-days', authorize('Receptionist'), updateWorkingDays);
router.put('/booking-rules', authorize('Receptionist'), updateBookingRules);
router.post('/date-override', authorize('Receptionist'), upsertDateOverride);
router.delete('/date-override/:overrideId', authorize('Receptionist'), removeDateOverride);

// ─── Admin routes ───
router.get('/defaults', admin, getSlotDefaults);
router.put('/defaults', admin, updateSlotDefaults);
router.get('/all', admin, getAllSlotConfigs);
router.get('/:id', admin, getSlotConfigById);
router.put('/:id', admin, updateSlotConfigById);

module.exports = router;
