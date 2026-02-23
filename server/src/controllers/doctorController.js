const Doctor = require('../models/Doctor');
const User = require('../models/User');

exports.getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find()
            .populate('user', 'name email phone')
            .populate('department', 'name')
            .populate('departments', 'name');
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id)
            .populate('user', 'name email phone')
            .populate('department', 'name');
        if (doctor) {
            res.json(doctor);
        } else {
            res.status(404).json({ message: 'Doctor not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createDoctorProfile = async (req, res) => {
    const { userId, department, qualifications, experience, fees, availableSlots } = req.body;
    try {
        // Check if profile already exists
        const existingProfile = await Doctor.findOne({ user: userId });
        if (existingProfile) {
            return res.status(400).json({ message: 'Doctor profile already exists' });
        }

        const doctor = await Doctor.create({
            user: userId,
            department,
            qualifications,
            experience,
            fees,
            availableSlots
        });
        res.status(201).json(doctor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateDoctorProfile = async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(doctor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
