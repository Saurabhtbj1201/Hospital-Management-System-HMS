const express = require('express');
const router = express.Router();
const PublicAppointment = require('../models/PublicAppointment');
const Department = require('../models/Department');
const { sendEmail } = require('../services/awsSesService');
const { captchaMiddleware } = require('../services/captchaService');

// Create appointment
router.post('/', captchaMiddleware, async (req, res) => {
    try {
        const appointmentData = req.body;

        // Validate required fields
        const requiredFields = [
            'fullName', 'gender',
            'emailAddress', 'appointmentDate', 'appointmentTime', 'visitType'
        ];

        for (const field of requiredFields) {
            if (!appointmentData[field]) {
                return res.status(400).json({
                    success: false,
                    message: `${field} is required`
                });
            }
        }

        // Create appointment
        const appointment = new PublicAppointment(appointmentData);

        await appointment.save();

        // Send confirmation email
        try {
            const subject = 'Appointment Confirmation';
            const body = `Your appointment has been booked successfully/nAppointment ID: ${appointment.appointmentId}/nDate: ${new Date(appointment.appointmentDate).toLocaleDateString()}/nTime: ${appointment.appointmentTime}`;
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
            await sendEmail(appointment.emailAddress, subject, body, htmlBody);
        } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
            // Continue even if email fails
        }

        console.log(`Appointment created: ${appointment.appointmentId}`);

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully',
            data: {
                appointmentId: appointment.appointmentId,
                patientId: appointment.patientId,
                appointmentDate: appointment.appointmentDate,
                appointmentTime: appointment.appointmentTime
            }
        });
    } catch (error) {
        console.error('Create appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create appointment',
            error: error.message
        });
    }
});

// Get available time slots
router.get('/time-slots', async (req, res) => {
    try {
        const { date, department } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date is required'
            });
        }

        // TODO: Implement logic to fetch available slots based on doctor availability
        // For now, return default slots
        const defaultSlots = [
            '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
            '12:00 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM',
            '04:30 PM', '05:00 PM'
        ];

        res.json({
            success: true,
            timeSlots: defaultSlots
        });
    } catch (error) {
        console.error('Get time slots error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch time slots'
        });
    }
});

// Lookup patient by mobile number (for follow-up)
router.get('/lookup-patient', async (req, res) => {
    try {
        const { mobile } = req.query;
        if (!mobile) {
            return res.status(400).json({ success: false, message: 'Mobile number is required' });
        }

        // Find the most recent appointment by this mobile number
        const appointment = await PublicAppointment.findOne({ mobileNumber: mobile })
            .sort({ createdAt: -1 });

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'No patient found with this mobile number' });
        }

        res.json({
            success: true,
            data: {
                fullName: appointment.fullName,
                gender: appointment.gender,
                dateOfBirth: appointment.dateOfBirth,
                age: appointment.age,
                ageMonths: appointment.ageMonths,
                emailAddress: appointment.emailAddress,
                mobileNumber: appointment.mobileNumber,
                knownAllergies: appointment.knownAllergies,
                allergiesDetails: appointment.allergiesDetails,
                existingConditions: appointment.existingConditions,
                address: appointment.address,
                emergencyContactName: appointment.emergencyContactName,
                emergencyContactNumber: appointment.emergencyContactNumber,
                patientId: appointment.patientId,
            }
        });
    } catch (error) {
        console.error('Patient lookup error:', error);
        res.status(500).json({ success: false, message: 'Failed to lookup patient' });
    }
});

module.exports = router;
