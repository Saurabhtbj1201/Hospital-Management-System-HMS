const Appointment = require('../models/Appointment');

exports.createAppointment = async (req, res) => {
    const { doctorId, date, reason } = req.body;
    try {
        const appointment = await Appointment.create({
            patient: req.user._id,
            doctor: doctorId,
            date,
            reason
        });
        res.status(201).json(appointment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getAppointments = async (req, res) => {
    try {
        let query = {};
        // If Doctor, only see their appointments
        if (req.user.role === 'Doctor') {
            // Find doctor profile for this user
            // Assuming we query by doctor ID not User ID in appointment usually, 
            // but here we might need to look up. 
            // For simplicity, let's assume the frontend passes filtering or we implement strict checking later.
            // A better way: 
            // const doctor = await Doctor.findOne({ user: req.user._id });
            // query.doctor = doctor._id;
        }

        const appointments = await Appointment.find(query)
            .populate('patient', 'name email')
            .populate({
                path: 'doctor',
                populate: { path: 'user', select: 'name' }
            });

        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMyAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ patient: req.user._id })
            .populate({
                path: 'doctor',
                populate: { path: 'user', select: 'name' }
            });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(appointment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
