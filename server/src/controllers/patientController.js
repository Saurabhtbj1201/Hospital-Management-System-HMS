const Patient = require('../models/Patient');
const User = require('../models/User');

exports.createPatientProfile = async (req, res) => {
    const { dateOfBirth, gender, bloodGroup, address, medicalHistory } = req.body;
    // Assuming req.user is set (Patient creates own profile)
    try {
        const existingProfile = await Patient.findOne({ user: req.user._id });
        if (existingProfile) {
            return res.status(400).json({ message: 'Patient profile already exists' });
        }

        const patient = await Patient.create({
            user: req.user._id,
            dateOfBirth,
            gender,
            bloodGroup,
            address,
            medicalHistory
        });
        res.status(201).json(patient);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getPatientProfile = async (req, res) => {
    try {
        // Can be accessed by Patient (own) or Doctor/Receptionist/Admin (by id)
        // For simplicity, let's assume /me for own and /:id for others
        const patient = await Patient.findOne({ user: req.user._id }).populate('user', 'name email phone');
        if (patient) {
            res.json(patient);
        } else {
            res.status(404).json({ message: 'Patient profile not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllPatients = async (req, res) => {
    // Admin/Receptionist/Doctor only
    try {
        const patients = await Patient.find().populate('user', 'name email phone');
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updatePatientProfile = async (req, res) => {
    try {
        // If patient, only update own. If admin/recep/doc, update any?
        // Logic: Patient updates own demographics. Doctor updates medical history?
        // For now, allow patient to update details.

        const patient = await Patient.findOneAndUpdate(
            { user: req.user._id },
            req.body,
            { new: true }
        );
        res.json(patient);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
