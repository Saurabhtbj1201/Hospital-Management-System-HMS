const express = require('express');
const router = express.Router();
const {
    getActiveBanner,
    getAllBanners,
    getBanner,
    createBanner,
    updateBanner,
    deleteBanner,
    toggleBannerStatus
} = require('../controllers/siteUpdateController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public route - get active banner
router.get('/active', getActiveBanner);

// Protected routes - Admin only
router.use(protect);
router.use(admin);

router.route('/')
    .get(getAllBanners)
    .post(createBanner);

router.route('/:id')
    .get(getBanner)
    .put(updateBanner)
    .delete(deleteBanner);

router.put('/:id/toggle', toggleBannerStatus);

module.exports = router;
