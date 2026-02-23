const express = require('express');
const router = express.Router();
const { getAllDoctors, getDoctorById, createDoctorProfile, updateDoctorProfile } = require('../controllers/doctorController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getAllDoctors)
    .post(protect, admin, createDoctorProfile);

router.route('/:id')
    .get(getDoctorById)
    .put(protect, updateDoctorProfile); // Admin or Doctor himself (check logic needed in controller or middleware)

module.exports = router;
