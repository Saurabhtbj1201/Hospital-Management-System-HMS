const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Receptionist = require('../models/Receptionist');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const { uploadToS3, deleteFromS3, getPresignedUrl } = require('../services/s3Service');

// Helper: get the role-specific profile model/doc
const getRoleProfile = async (user) => {
    if (user.role === 'Doctor') {
        return { model: 'Doctor', doc: await Doctor.findOne({ user: user._id }).populate('department', 'name').populate('departments', 'name') };
    }
    if (user.role === 'Receptionist') {
        return { model: 'Receptionist', doc: await Receptionist.findOne({ user: user._id }) };
    }
    if (user.role === 'Admin') {
        return { model: 'Admin', doc: await Admin.findOne({ user: user._id }) };
    }
    return { model: null, doc: null };
};

// Helper: build full profile response
const buildProfileResponse = async (userId) => {
    const user = await User.findById(userId).select('-password');
    if (!user) return null;

    const profileData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };

    if (user.role === 'Doctor') {
        const doctor = await Doctor.findOne({ user: user._id })
            .populate('department', 'name')
            .populate('departments', 'name');

        if (doctor) {
            const [profilePhotoUrl, digitalSignatureUrl] = await Promise.all([
                getPresignedUrl(doctor.profilePhoto),
                getPresignedUrl(doctor.digitalSignature),
            ]);

            profileData.doctorProfile = {
                _id: doctor._id,
                qualifications: doctor.qualifications,
                experience: doctor.experience,
                fees: doctor.fees,
                primaryDepartment: doctor.department,
                departments: doctor.departments,
                availableSlots: doctor.availableSlots,
                isActive: doctor.isActive,
                gender: doctor.gender,
                dateOfBirth: doctor.dateOfBirth,
                medicalCouncilId: doctor.medicalCouncilId,
                profilePhoto: profilePhotoUrl || '',
                digitalSignature: digitalSignatureUrl || '',
                profilePhotoKey: doctor.profilePhoto || '',
                digitalSignatureKey: doctor.digitalSignature || '',
                shortBio: doctor.shortBio,
                detailedBiography: doctor.detailedBiography,
                specialInterests: doctor.specialInterests,
                featuredTreatments: doctor.featuredTreatments,
                patientTestimonials: doctor.patientTestimonials,
            };
        }
    }

    if (user.role === 'Receptionist') {
        let receptionist = await Receptionist.findOne({ user: user._id });
        if (!receptionist) {
            receptionist = await Receptionist.create({ user: user._id });
        }

        const [profilePhotoUrl, idProofDocUrl, digitalSignatureUrl] = await Promise.all([
            getPresignedUrl(receptionist.profilePhoto),
            getPresignedUrl(receptionist.idProofDocument),
            getPresignedUrl(receptionist.digitalSignature),
        ]);

        profileData.receptionistProfile = {
            _id: receptionist._id,
            profilePhoto: profilePhotoUrl || '',
            profilePhotoKey: receptionist.profilePhoto || '',
            gender: receptionist.gender,
            dateOfBirth: receptionist.dateOfBirth,
            shift: receptionist.shift,
            joiningDate: receptionist.joiningDate,
            experience: receptionist.experience,
            educationLevel: receptionist.educationLevel,
            idProofType: receptionist.idProofType,
            idProofNumber: receptionist.idProofNumber,
            idProofDocument: idProofDocUrl || '',
            idProofDocumentKey: receptionist.idProofDocument || '',
            digitalSignature: digitalSignatureUrl || '',
            digitalSignatureKey: receptionist.digitalSignature || '',
            isActive: receptionist.isActive,
        };
    }

    if (user.role === 'Admin') {
        let admin = await Admin.findOne({ user: user._id });
        if (!admin) {
            admin = await Admin.create({ user: user._id });
        }

        const [profilePhotoUrl, digitalSignatureUrl] = await Promise.all([
            getPresignedUrl(admin.profilePhoto),
            getPresignedUrl(admin.digitalSignature),
        ]);

        profileData.adminProfile = {
            _id: admin._id,
            profilePhoto: profilePhotoUrl || '',
            profilePhotoKey: admin.profilePhoto || '',
            digitalSignature: digitalSignatureUrl || '',
            digitalSignatureKey: admin.digitalSignature || '',
            gender: admin.gender,
            dateOfBirth: admin.dateOfBirth,
            joiningDate: admin.joiningDate,
            isActive: admin.isActive,
        };
    }

    return profileData;
};

// GET /api/profile/me
exports.getMyProfile = async (req, res) => {
    try {
        const profileData = await buildProfileResponse(req.user._id);
        if (!profileData) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(profileData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/profile/me
exports.updateMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { email, phone, qualifications, experience, fees, gender, dateOfBirth, medicalCouncilId } = req.body;

        // Check email uniqueness
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email, _id: { $ne: user._id } });
            if (emailExists) {
                return res.status(400).json({ message: 'Email already in use by another account' });
            }
            user.email = email;
        }

        // Check phone uniqueness
        if (phone && phone !== user.phone) {
            const phoneExists = await User.findOne({ phone, _id: { $ne: user._id } });
            if (phoneExists) {
                return res.status(400).json({ message: 'Phone number already in use by another account' });
            }
            user.phone = phone;
        }

        await user.save();

        // Update doctor profile fields if applicable
        if (user.role === 'Doctor') {
            const doctor = await Doctor.findOne({ user: user._id });
            if (doctor) {
                if (qualifications !== undefined) doctor.qualifications = qualifications;
                if (experience !== undefined) doctor.experience = experience;
                if (fees !== undefined) doctor.fees = fees;
                if (gender !== undefined) doctor.gender = gender;
                if (dateOfBirth !== undefined) doctor.dateOfBirth = dateOfBirth || null;
                if (medicalCouncilId !== undefined) doctor.medicalCouncilId = medicalCouncilId;
                await doctor.save();
            }
        }

        // Update receptionist profile fields if applicable
        if (user.role === 'Receptionist') {
            let receptionist = await Receptionist.findOne({ user: user._id });
            if (!receptionist) receptionist = await Receptionist.create({ user: user._id });

            const { gender, dateOfBirth, shift, joiningDate, idProofType, idProofNumber, experience, educationLevel } = req.body;
            if (gender !== undefined) receptionist.gender = gender;
            if (dateOfBirth !== undefined) receptionist.dateOfBirth = dateOfBirth || null;
            if (shift !== undefined) receptionist.shift = shift;
            if (joiningDate !== undefined) receptionist.joiningDate = joiningDate || null;
            if (idProofType !== undefined) receptionist.idProofType = idProofType;
            if (idProofNumber !== undefined) receptionist.idProofNumber = idProofNumber;
            if (experience !== undefined) receptionist.experience = experience;
            if (educationLevel !== undefined) receptionist.educationLevel = educationLevel;
            await receptionist.save();
        }

        // Update admin profile fields if applicable
        if (user.role === 'Admin') {
            let admin = await Admin.findOne({ user: user._id });
            if (!admin) admin = await Admin.create({ user: user._id });

            const { gender, dateOfBirth, joiningDate } = req.body;
            if (gender !== undefined) admin.gender = gender;
            if (dateOfBirth !== undefined) admin.dateOfBirth = dateOfBirth || null;
            if (joiningDate !== undefined) admin.joiningDate = joiningDate || null;
            await admin.save();
        }

        const profileData = await buildProfileResponse(user._id);
        res.json(profileData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/profile/change-password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'New password must be at least 8 characters long' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'New password and confirm password do not match' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        const isSame = await user.matchPassword(newPassword);
        if (isSame) {
            return res.status(400).json({ message: 'New password must be different from current password' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/profile/upload-photo (Doctor + Receptionist)
exports.uploadProfilePhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({ message: 'Only JPEG, PNG, and WebP images are allowed' });
        }

        if (req.file.size > 5 * 1024 * 1024) {
            return res.status(400).json({ message: 'File size must be under 5MB' });
        }

        const { doc } = await getRoleProfile(req.user);
        if (!doc) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        if (doc.profilePhoto) {
            await deleteFromS3(doc.profilePhoto);
        }

        const key = await uploadToS3(req.file.buffer, req.file.originalname, 'profile-photos', req.file.mimetype);
        doc.profilePhoto = key;
        await doc.save();

        const signedUrl = await getPresignedUrl(key);
        res.json({ url: signedUrl, key, message: 'Profile photo uploaded successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/profile/upload-signature (Doctor + Receptionist)
exports.uploadDigitalSignature = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({ message: 'Only JPEG, PNG, WebP, and SVG images are allowed' });
        }

        if (req.file.size > 2 * 1024 * 1024) {
            return res.status(400).json({ message: 'File size must be under 2MB' });
        }

        const { doc } = await getRoleProfile(req.user);
        if (!doc) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        if (doc.digitalSignature) {
            await deleteFromS3(doc.digitalSignature);
        }

        const key = await uploadToS3(req.file.buffer, req.file.originalname, 'signatures', req.file.mimetype);
        doc.digitalSignature = key;
        await doc.save();

        const signedUrl = await getPresignedUrl(key);
        res.json({ url: signedUrl, key, message: 'Digital signature uploaded successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/profile/photo (Doctor + Receptionist)
exports.deleteProfilePhoto = async (req, res) => {
    try {
        const { doc } = await getRoleProfile(req.user);
        if (!doc) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        if (doc.profilePhoto) {
            await deleteFromS3(doc.profilePhoto);
            doc.profilePhoto = '';
            await doc.save();
        }

        res.json({ message: 'Profile photo removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/profile/signature (Doctor + Receptionist)
exports.deleteSignature = async (req, res) => {
    try {
        const { doc } = await getRoleProfile(req.user);
        if (!doc) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        if (doc.digitalSignature) {
            await deleteFromS3(doc.digitalSignature);
            doc.digitalSignature = '';
            await doc.save();
        }

        res.json({ message: 'Digital signature removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/profile/upload-id-document (Receptionist)
exports.uploadIdDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({ message: 'Only JPEG, PNG, WebP images and PDF files are allowed' });
        }

        if (req.file.size > 5 * 1024 * 1024) {
            return res.status(400).json({ message: 'File size must be under 5MB' });
        }

        const receptionist = await Receptionist.findOne({ user: req.user._id });
        if (!receptionist) {
            return res.status(404).json({ message: 'Receptionist profile not found' });
        }

        if (receptionist.idProofDocument) {
            await deleteFromS3(receptionist.idProofDocument);
        }

        const key = await uploadToS3(req.file.buffer, req.file.originalname, 'id-documents', req.file.mimetype);
        receptionist.idProofDocument = key;
        await receptionist.save();

        const signedUrl = await getPresignedUrl(key);
        res.json({ url: signedUrl, key, message: 'ID document uploaded successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/profile/id-document (Receptionist)
exports.deleteIdDocument = async (req, res) => {
    try {
        const receptionist = await Receptionist.findOne({ user: req.user._id });
        if (!receptionist) {
            return res.status(404).json({ message: 'Receptionist profile not found' });
        }

        if (receptionist.idProofDocument) {
            await deleteFromS3(receptionist.idProofDocument);
            receptionist.idProofDocument = '';
            await receptionist.save();
        }

        res.json({ message: 'ID document removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/profile/public-website
exports.updatePublicWebsite = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ user: req.user._id });
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor profile not found' });
        }

        const { shortBio, detailedBiography, specialInterests, featuredTreatments, patientTestimonials } = req.body;

        if (shortBio !== undefined) doctor.shortBio = shortBio;
        if (detailedBiography !== undefined) doctor.detailedBiography = detailedBiography;
        if (specialInterests !== undefined) doctor.specialInterests = specialInterests;
        if (featuredTreatments !== undefined) doctor.featuredTreatments = featuredTreatments;
        if (patientTestimonials !== undefined) doctor.patientTestimonials = patientTestimonials;

        await doctor.save();

        const profileData = await buildProfileResponse(req.user._id);
        res.json(profileData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
