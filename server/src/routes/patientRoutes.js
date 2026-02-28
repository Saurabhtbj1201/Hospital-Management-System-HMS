const express = require('express');
const router = express.Router();
const { createPatientProfile, getPatientProfile, getAllPatients, updatePatientProfile } = require('../controllers/patientController');
const { protect, admin, authorize } = require('../middleware/authMiddleware');
const PublicAppointment = require('../models/PublicAppointment');
const Doctor = require('../models/Doctor');

router.route('/')
    .post(protect, createPatientProfile)
    .get(protect, getAllPatients); // Needs role check (Admin/Doc/Recep)

router.route('/me')
    .get(protect, getPatientProfile)
    .put(protect, updatePatientProfile);

// Public appointment patients routes
// Get all patients from public appointments
router.get('/public-appointments/list', protect, authorize('Admin', 'Receptionist', 'Doctor'), async (req, res) => {
    try {
        const { search, page = 1, limit = 20 } = req.query;
        let matchQuery = {};

        // Doctor: only see patients assigned to them
        if (req.user.role === 'Doctor') {
            const doctor = await Doctor.findOne({ user: req.user._id });
            if (!doctor) {
                return res.status(404).json({ success: false, message: 'Doctor profile not found' });
            }
            // Find all patient IDs from appointments assigned to this doctor
            const assignedPatientIds = await PublicAppointment.distinct('patientId', {
                doctorAssigned: doctor._id
            });
            matchQuery.patientId = { $in: assignedPatientIds };
        }

        if (search) {
            const searchFilter = {
                $or: [
                    { fullName: { $regex: search, $options: 'i' } },
                    { emailAddress: { $regex: search, $options: 'i' } },
                    { patientId: { $regex: search, $options: 'i' } },
                    { mobileNumber: { $regex: search, $options: 'i' } }
                ]
            };
            if (Object.keys(matchQuery).length > 0) {
                matchQuery = { $and: [matchQuery, searchFilter] };
            } else {
                matchQuery = searchFilter;
            }
        }

        const skip = (page - 1) * limit;

        const patients = await PublicAppointment.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$patientId',
                    patientId: { $first: '$patientId' },
                    fullName: { $last: '$fullName' },
                    emailAddress: { $last: '$emailAddress' },
                    mobileNumber: { $last: '$mobileNumber' },
                    gender: { $last: '$gender' },
                    dateOfBirth: { $last: '$dateOfBirth' },
                    age: { $last: '$age' },
                    lastVisit: { $max: '$appointmentDate' },
                    totalAppointments: { $sum: 1 },
                    knownAllergies: { $last: '$knownAllergies' },
                    existingConditions: { $last: '$existingConditions' }
                }
            },
            { $sort: { lastVisit: -1 } },
            { $skip: skip },
            { $limit: parseInt(limit) }
        ]);

        const totalCount = await PublicAppointment.aggregate([
            { $match: matchQuery },
            { $group: { _id: '$patientId' } },
            { $count: 'total' }
        ]);

        res.json({
            success: true,
            data: patients,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount[0]?.total || 0,
                pages: Math.ceil((totalCount[0]?.total || 0) / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Download patients with filters (MUST be before :patientId route)
router.get('/public-appointments/download', protect, authorize('Admin', 'Receptionist'), async (req, res) => {
    try {
        const { gender, ageMin, ageMax, visitType } = req.query;

        let matchQuery = {};

        if (gender) {
            matchQuery.gender = gender;
        }

        // Age filtering
        if (ageMin || ageMax) {
            matchQuery.age = {};
            if (ageMin) matchQuery.age.$gte = parseInt(ageMin);
            if (ageMax) matchQuery.age.$lte = parseInt(ageMax);
        }

        // Visit type filtering
        if (visitType) {
            matchQuery.visitType = visitType;
        }

        const patients = await PublicAppointment.aggregate([
            { $match: matchQuery },
            { $sort: { appointmentDate: -1 } },
            {
                $group: {
                    _id: '$patientId',
                    patientId: { $first: '$patientId' },
                    fullName: { $last: '$fullName' },
                    emailAddress: { $last: '$emailAddress' },
                    mobileNumber: { $last: '$mobileNumber' },
                    gender: { $last: '$gender' },
                    age: { $last: '$age' },
                    totalAppointments: { $sum: 1 },
                    appointments: {
                        $push: {
                            appointmentId: '$appointmentId',
                            appointmentDate: '$appointmentDate',
                            appointmentTime: '$appointmentTime',
                            appointmentStatus: '$appointmentStatus',
                            department: '$department',
                            visitType: '$visitType',
                            doctorAssigned: '$doctorAssigned',
                            reasonForVisit: '$reasonForVisit',
                            primaryConcern: '$primaryConcern',
                            cancelReason: '$cancelReason',
                        }
                    }
                }
            },
            { $sort: { 'appointments.0.appointmentDate': -1 } }
        ]);

        // Populate doctor names
        const doctorIds = [];
        patients.forEach(p => {
            p.appointments.forEach(a => {
                if (a.doctorAssigned) doctorIds.push(a.doctorAssigned);
            });
        });
        const doctors = await Doctor.find({ _id: { $in: doctorIds } }).populate('user', 'name');
        const doctorMap = {};
        doctors.forEach(d => {
            doctorMap[d._id.toString()] = d.user?.name || 'Unknown';
        });

        // Attach doctor names
        patients.forEach(p => {
            p.appointments.forEach(a => {
                a.doctorName = a.doctorAssigned ? (doctorMap[a.doctorAssigned.toString()] || 'Unknown') : 'Not Assigned';
            });
        });

        res.json({
            success: true,
            data: patients,
            total: patients.length
        });
    } catch (error) {
        console.error('Download patients error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get patient details by ID (with all appointments)
router.get('/public-appointments/:patientId', protect, authorize('Admin', 'Receptionist', 'Doctor'), async (req, res) => {
    try {
        const appointments = await PublicAppointment.find({ patientId: req.params.patientId })
            .populate({ path: 'doctorAssigned', populate: { path: 'user', select: 'name email' } })
            .sort({ appointmentDate: -1 });

        if (!appointments.length) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        const latest = appointments[0];
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const allAppointments = appointments.map(apt => ({
            _id: apt._id,
            appointmentId: apt.appointmentId,
            appointmentDate: apt.appointmentDate,
            appointmentTime: apt.appointmentTime,
            department: apt.department,
            appointmentStatus: apt.appointmentStatus,
            visitType: apt.visitType,
            doctorAssigned: apt.doctorAssigned,
            reasonForVisit: apt.reasonForVisit,
            primaryConcern: apt.primaryConcern,
            createdAt: apt.createdAt,
            cancelReason: apt.cancelReason,
        }));

        res.json({
            success: true,
            data: {
                patientId: latest.patientId,
                fullName: latest.fullName,
                emailAddress: latest.emailAddress,
                mobileNumber: latest.mobileNumber,
                gender: latest.gender,
                dateOfBirth: latest.dateOfBirth,
                age: latest.age,
                knownAllergies: latest.knownAllergies,
                allergiesDetails: latest.allergiesDetails,
                existingConditions: latest.existingConditions,
                address: latest.address,
                emergencyContactName: latest.emergencyContactName,
                emergencyContactNumber: latest.emergencyContactNumber,
                totalAppointments: appointments.length,
                appointments: allAppointments,
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update patient medical info
router.put('/public-appointments/:patientId/medical', protect, authorize('Admin', 'Receptionist'), async (req, res) => {
    try {
        const { knownAllergies, allergiesDetails, existingConditions } = req.body;

        const result = await PublicAppointment.updateMany(
            { patientId: req.params.patientId },
            { $set: { knownAllergies, allergiesDetails, existingConditions } }
        );

        res.json({
            success: true,
            message: 'Medical information updated',
            data: { modifiedCount: result.modifiedCount }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
