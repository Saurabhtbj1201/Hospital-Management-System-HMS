const express = require('express');
const router = express.Router();
const { 
    getDepartments, 
    getAllDepartments,
    getDepartmentById,
    createDepartment, 
    updateDepartment, 
    toggleDepartmentStatus,
    deleteDepartment,
    assignDoctor,
    removeDoctorFromDepartment,
    setPrimaryDepartment,
    getAvailableDoctors
} = require('../controllers/departmentController');
const { protect, admin, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getDepartments);

// Admin routes (must be before /:id to avoid catch-all)
router.get('/admin/all', protect, admin, getAllDepartments);
router.get('/admin/:departmentId/available-doctors', protect, admin, getAvailableDoctors);
router.post('/admin/assign-doctor', protect, admin, assignDoctor);
router.post('/admin/remove-doctor', protect, admin, removeDoctorFromDepartment);
router.post('/admin/set-primary-department', protect, admin, setPrimaryDepartment);

router.get('/:id', getDepartmentById);
router.post('/', protect, admin, createDepartment);
router.put('/:id', protect, admin, updateDepartment);
router.patch('/:id/toggle-status', protect, admin, toggleDepartmentStatus);
router.delete('/:id', protect, admin, deleteDepartment);

module.exports = router;
