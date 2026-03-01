const PublicAppointment = require('../models/PublicAppointment');
const Doctor = require('../models/Doctor');
const Department = require('../models/Department');

// Get all public appointments (Admin/Receptionist)
exports.getAllPublicAppointments = async (req, res) => {
    try {
        const { status, date, dateFrom, dateTo, department, doctor, search, page = 1, limit = 10 } = req.query;

        let query = {};

        // Filter by status
        if (status) {
            query.appointmentStatus = status;
        }

        // Filter by date range (dateFrom/dateTo) or single date
        if (dateFrom || dateTo) {
            query.appointmentDate = {};
            if (dateFrom) query.appointmentDate.$gte = new Date(dateFrom);
            if (dateTo) query.appointmentDate.$lte = new Date(dateTo);
        } else if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            query.appointmentDate = { $gte: startDate, $lt: endDate };
        }

        // Filter by department
        if (department) {
            query.department = department;
        }

        // Filter by assigned doctor
        if (doctor) {
            query.doctorAssigned = doctor;
        }

        // Search by name, email, or ID
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { emailAddress: { $regex: search, $options: 'i' } },
                { patientId: { $regex: search, $options: 'i' } },
                { appointmentId: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const appointments = await PublicAppointment.find(query)
            .populate({ path: 'doctorAssigned', populate: { path: 'user', select: 'name email' } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await PublicAppointment.countDocuments(query);

        res.json({
            success: true,
            data: appointments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch appointments',
            error: error.message
        });
    }
};

// Get single appointment by ID
exports.getPublicAppointmentById = async (req, res) => {
    try {
        const appointment = await PublicAppointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        res.json({
            success: true,
            data: appointment
        });
    } catch (error) {
        console.error('Get appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch appointment',
            error: error.message
        });
    }
};

// Update appointment (Admin/Receptionist)
exports.updatePublicAppointment = async (req, res) => {
    try {
        const updateData = { ...req.body };

        // If department changed, reset assigned doctor and revert status
        if (updateData.department) {
            const current = await PublicAppointment.findById(req.params.id);
            if (current && current.department !== updateData.department) {
                updateData.doctorAssigned = null;
                if (current.appointmentStatus === 'Confirmed') {
                    updateData.appointmentStatus = 'Pending';
                }
            }
        }

        const appointment = await PublicAppointment.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        res.json({
            success: true,
            message: 'Appointment updated successfully',
            data: appointment
        });
    } catch (error) {
        console.error('Update appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update appointment',
            error: error.message
        });
    }
};

// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['Pending', 'Confirmed', 'Cancelled', 'Completed'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const updateData = { appointmentStatus: status };
        if (status === 'Cancelled' && req.body.reason) {
            updateData.cancelReason = req.body.reason;
        }

        const appointment = await PublicAppointment.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        res.json({
            success: true,
            message: 'Status updated successfully',
            data: appointment
        });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update status',
            error: error.message
        });
    }
};

// Assign doctor to appointment
exports.assignDoctor = async (req, res) => {
    try {
        const { doctorId } = req.body;

        // Verify doctor exists
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        const appointment = await PublicAppointment.findByIdAndUpdate(
            req.params.id,
            { doctorAssigned: doctorId, appointmentStatus: 'Confirmed' },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        res.json({
            success: true,
            message: 'Doctor assigned successfully',
            data: appointment
        });
    } catch (error) {
        console.error('Assign doctor error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to assign doctor',
            error: error.message
        });
    }
};

// Get appointment statistics
exports.getAppointmentStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const stats = await PublicAppointment.aggregate([
            {
                $facet: {
                    total: [{ $count: 'count' }],
                    pending: [
                        { $match: { appointmentStatus: 'Pending' } },
                        { $count: 'count' }
                    ],
                    confirmed: [
                        { $match: { appointmentStatus: 'Confirmed' } },
                        { $count: 'count' }
                    ],
                    completed: [
                        { $match: { appointmentStatus: 'Completed' } },
                        { $count: 'count' }
                    ],
                    today: [
                        { $match: { appointmentDate: { $gte: today } } },
                        { $count: 'count' }
                    ]
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                total: stats[0].total[0]?.count || 0,
                pending: stats[0].pending[0]?.count || 0,
                confirmed: stats[0].confirmed[0]?.count || 0,
                completed: stats[0].completed[0]?.count || 0,
                today: stats[0].today[0]?.count || 0
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics',
            error: error.message
        });
    }
};

module.exports = exports;

// Get appointments assigned to logged-in doctor
exports.getMyAssignedAppointments = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ user: req.user._id });
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor profile not found' });
        }

        const { status, date, dateFrom, dateTo, search, page = 1, limit = 10 } = req.query;
        let query = { doctorAssigned: doctor._id };

        if (status) query.appointmentStatus = status;

        // Filter by date range (dateFrom/dateTo) or single date
        if (dateFrom || dateTo) {
            query.appointmentDate = {};
            if (dateFrom) query.appointmentDate.$gte = new Date(dateFrom);
            if (dateTo) query.appointmentDate.$lte = new Date(dateTo);
        } else if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            query.appointmentDate = { $gte: startDate, $lt: endDate };
        }

        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { emailAddress: { $regex: search, $options: 'i' } },
                { appointmentId: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;
        const appointments = await PublicAppointment.find(query)
            .populate({ path: 'doctorAssigned', populate: { path: 'user', select: 'name email' } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        const total = await PublicAppointment.countDocuments(query);

        res.json({
            success: true,
            data: appointments,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error('Get my appointments error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch appointments', error: error.message });
    }
};

// Doctor marks appointment as Completed
exports.doctorCompleteAppointment = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ user: req.user._id });
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor profile not found' });
        }

        const appointment = await PublicAppointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }
        if (String(appointment.doctorAssigned) !== String(doctor._id)) {
            return res.status(403).json({ success: false, message: 'Not your assigned appointment' });
        }

        appointment.appointmentStatus = 'Completed';
        await appointment.save();

        res.json({ success: true, message: 'Appointment marked as completed', data: appointment });
    } catch (error) {
        console.error('Doctor complete error:', error);
        res.status(500).json({ success: false, message: 'Failed to complete appointment', error: error.message });
    }
};

// Create appointment by Admin/Receptionist
exports.createAppointmentByAdmin = async (req, res) => {
    try {
        const appointmentData = { ...req.body };

        // Validate required fields
        const requiredFields = ['fullName', 'gender', 'emailAddress', 'appointmentDate', 'appointmentTime', 'visitType'];
        for (const field of requiredFields) {
            if (!appointmentData[field]) {
                return res.status(400).json({ success: false, message: `${field} is required` });
            }
        }

        // Set source and bookedBy based on user role
        appointmentData.source = req.user.role === 'Admin' ? 'Admin' : 'Walk-in';
        appointmentData.bookedBy = req.user.role === 'Admin' ? 'Admin Desk' : 'Reception Desk';

        // If doctor is assigned directly, auto-confirm
        if (appointmentData.doctorAssigned) {
            appointmentData.appointmentStatus = 'Confirmed';
        }

        const appointment = new PublicAppointment(appointmentData);
        await appointment.save();

        // Send confirmation email
        try {
            const { sendEmail } = require('../services/awsSesService');
            const subject = 'Appointment Confirmation';
            const htmlBody = `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2>Appointment Confirmed</h2>
                    <p>Dear ${appointment.fullName},</p>
                    <p>Your appointment has been successfully booked.</p>
                    <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Appointment ID:</strong> ${appointment.appointmentId}</p>
                        <p><strong>Date:</strong> ${new Date(appointment.appointmentDate).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> ${appointment.appointmentTime}</p>
                        <p><strong>Department:</strong> ${appointment.department || 'General'}</p>
                    </div>
                    <p>Please arrive 15 minutes before your scheduled time.</p>
                </div>
            `;
            const body = `Appointment booked. ID: ${appointment.appointmentId}, Date: ${new Date(appointment.appointmentDate).toLocaleDateString()}, Time: ${appointment.appointmentTime}`;
            await sendEmail(appointment.emailAddress, subject, body, htmlBody);
        } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
        }

        console.log(`Appointment created by ${appointmentData.bookedBy}: ${appointment.appointmentId}`);

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully',
            data: {
                appointmentId: appointment.appointmentId,
                patientId: appointment.patientId,
                appointmentDate: appointment.appointmentDate,
                appointmentTime: appointment.appointmentTime,
                bookedBy: appointment.bookedBy
            }
        });
    } catch (error) {
        console.error('Create appointment by admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create appointment',
            error: error.message
        });
    }
};

// Doctor removes self from appointment
exports.doctorRemoveSelf = async (req, res) => {
    try {
        const { reason } = req.body;
        if (!reason || !reason.trim()) {
            return res.status(400).json({ success: false, message: 'Reason is required' });
        }

        const doctor = await Doctor.findOne({ user: req.user._id });
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor profile not found' });
        }

        const appointment = await PublicAppointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }
        if (String(appointment.doctorAssigned) !== String(doctor._id)) {
            return res.status(403).json({ success: false, message: 'Not your assigned appointment' });
        }

        appointment.doctorAssigned = null;
        appointment.appointmentStatus = 'Pending';
        appointment.doctorRemovalReason = reason.trim();
        appointment.doctorRemovedAt = new Date();
        await appointment.save();

        res.json({ success: true, message: 'Removed from appointment', data: appointment });
    } catch (error) {
        console.error('Doctor remove self error:', error);
        res.status(500).json({ success: false, message: 'Failed to remove from appointment', error: error.message });
    }
};
