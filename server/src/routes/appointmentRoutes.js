const express = require('express');
const router = express.Router();
const { createAppointment, getAppointments, getMyAppointments, updateAppointment } = require('../controllers/appointmentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createAppointment)
    .get(protect, getAppointments);

router.get('/my', protect, getMyAppointments);

router.route('/:id')
    .put(protect, updateAppointment);

module.exports = router;
