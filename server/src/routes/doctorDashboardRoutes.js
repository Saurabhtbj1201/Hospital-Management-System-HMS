const express = require('express');
const router = express.Router();
const {
    getDoctorDashboardStats,
    getDoctorRecentAppointments,
    getDoctorTodayAppointments,
    getDoctorChartData,
    getDoctorDashboardProfile,
    getDoctorActivity,
} = require('../controllers/doctorDashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('Doctor'));

router.get('/stats', getDoctorDashboardStats);
router.get('/appointments', getDoctorRecentAppointments);
router.get('/today', getDoctorTodayAppointments);
router.get('/charts/:type', getDoctorChartData);
router.get('/profile', getDoctorDashboardProfile);
router.get('/activity', getDoctorActivity);

module.exports = router;
