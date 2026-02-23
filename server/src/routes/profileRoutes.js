const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
    getMyProfile,
    updateMyProfile,
    changePassword,
    uploadProfilePhoto,
    uploadDigitalSignature,
    deleteProfilePhoto,
    deleteSignature,
    updatePublicWebsite,
    uploadIdDocument,
    deleteIdDocument
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

// Multer memory storage for S3 uploads
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.use(protect);

router.get('/me', getMyProfile);
router.put('/me', updateMyProfile);
router.put('/change-password', changePassword);
router.post('/upload-photo', upload.single('photo'), uploadProfilePhoto);
router.post('/upload-signature', upload.single('signature'), uploadDigitalSignature);
router.post('/upload-id-document', upload.single('idDocument'), uploadIdDocument);
router.delete('/photo', deleteProfilePhoto);
router.delete('/signature', deleteSignature);
router.delete('/id-document', deleteIdDocument);
router.put('/public-website', updatePublicWebsite);

module.exports = router;
