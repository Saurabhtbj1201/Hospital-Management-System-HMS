const express = require('express');
const router = express.Router();
const {
    getUsersByRole,
    createUser,
    updateUser,
    toggleUserStatus,
    resetUserPassword,
    deleteUser,
    getUserProfile
} = require('../controllers/userManagementController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

router.get('/profile/:id', getUserProfile);
router.get('/:role', getUsersByRole);
router.post('/', createUser);
router.put('/:id', updateUser);
router.patch('/:id/toggle-status', toggleUserStatus);
router.patch('/:id/reset-password', resetUserPassword);
router.delete('/:id', deleteUser);

module.exports = router;
