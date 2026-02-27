const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getRecentAppointments,
    getChartData,
    getActivityFeed,
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All dashboard routes require authentication
router.use(protect);
router.use(authorize('Admin', 'Receptionist', 'Doctor'));

router.get('/stats', getDashboardStats);
router.get('/appointments', getRecentAppointments);
router.get('/activity', getActivityFeed);
router.get('/charts/:type', getChartData);

module.exports = router;
