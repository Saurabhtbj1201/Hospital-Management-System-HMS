const express = require('express');
const router = express.Router();
const {
    getAllPublicAppointments,
    getPublicAppointmentById,
    updatePublicAppointment,
    updateAppointmentStatus,
    assignDoctor,
    getAppointmentStats,
    getMyAssignedAppointments,
    doctorCompleteAppointment,
    doctorRemoveSelf,
    createAppointmentByAdmin
} = require('../controllers/publicAppointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { captchaMiddleware } = require('../services/captchaService');

// All routes require authentication
router.use(protect);

// Create appointment (Admin/Receptionist) - with captcha
router.post('/', authorize('Admin', 'Receptionist'), captchaMiddleware, createAppointmentByAdmin);

// Doctor routes (must be before /:id routes)
router.get('/my-appointments', authorize('Doctor'), getMyAssignedAppointments);
router.patch('/:id/doctor-complete', authorize('Doctor'), doctorCompleteAppointment);
router.patch('/:id/doctor-remove', authorize('Doctor'), doctorRemoveSelf);

// Stats (Admin/Receptionist only)
router.get('/stats', authorize('Admin', 'Receptionist'), getAppointmentStats);

// Get all appointments (Admin/Receptionist)
router.get('/', authorize('Admin', 'Receptionist'), getAllPublicAppointments);

// Get single appointment (Admin/Receptionist)
router.get('/:id', authorize('Admin', 'Receptionist'), getPublicAppointmentById);

// Update appointment (Admin/Receptionist)
router.put('/:id', authorize('Admin', 'Receptionist'), updatePublicAppointment);

// Update status (Admin/Receptionist)
router.patch('/:id/status', authorize('Admin', 'Receptionist'), updateAppointmentStatus);

// Assign doctor (Admin/Receptionist)
router.patch('/:id/assign-doctor', authorize('Admin', 'Receptionist'), assignDoctor);

module.exports = router;
