const express = require('express');
const router = express.Router();
const multer = require('multer');
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
    getAvailableDoctors,
    uploadDepartmentImage,
    deleteDepartmentImage
} = require('../controllers/departmentController');
const { protect, admin, authorize } = require('../middleware/authMiddleware');

// Multer memory storage for S3 uploads (10MB limit for department images)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only PNG, JPG, and WebP images are allowed'), false);
        }
    }
});

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
router.post('/:id/upload-image', protect, admin, upload.single('image'), uploadDepartmentImage);
router.delete('/:id/image', protect, admin, deleteDepartmentImage);
router.patch('/:id/toggle-status', protect, admin, toggleDepartmentStatus);
router.delete('/:id', protect, admin, deleteDepartment);

module.exports = router;
