const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Bill = require('../models/Bill');
const PublicAppointment = require('../models/PublicAppointment');
const Department = require('../models/Department');
const Admin = require('../models/Admin');
const Receptionist = require('../models/Receptionist');
const { getPresignedUrl } = require('../services/s3Service');

// ─── GET /bills/appointments-billing ────────────────────────────────────────
// Returns ALL public appointments merged with their bill data (left-join style)
router.get('/appointments-billing', protect, authorize('Admin', 'Receptionist'), async (req, res) => {
    try {
        const { status, search, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Fetch all appointments with doctor info
        const appointments = await PublicAppointment.find({})
            .populate({
                path: 'doctorAssigned',
                populate: { path: 'user', select: 'name' },
                select: 'fees user'
            })
            .sort({ createdAt: -1 });

        // Fetch all bills and create lookup map
        const bills = await Bill.find({});
        const billMap = {};
        bills.forEach(bill => {
            if (bill.publicAppointment) {
                billMap[bill.publicAppointment.toString()] = bill;
            }
        });

        // Merge appointments with bill data
        let merged = appointments.map(apt => {
            const bill = billMap[apt._id.toString()];
            return {
                _id: apt._id,
                fullName: apt.fullName,
                patientId: apt.patientId,
                appointmentId: apt.appointmentId,
                appointmentDate: apt.appointmentDate,
                appointmentTime: apt.appointmentTime,
                department: apt.department,
                mobileNumber: apt.mobileNumber,
                emailAddress: apt.emailAddress,
                gender: apt.gender,
                age: apt.age,
                doctorName: apt.doctorAssigned?.user?.name || null,
                doctorFees: apt.doctorAssigned?.fees || 0,
                appointmentStatus: apt.appointmentStatus,
                visitType: apt.visitType,
                bill: bill ? {
                    _id: bill._id,
                    billNumber: bill.billNumber,
                    services: bill.services,
                    subtotal: bill.subtotal,
                    discount: bill.discount,
                    roundOff: bill.roundOff || 0,
                    totalAmount: bill.totalAmount,
                    paidAmount: bill.paidAmount || 0,
                    dueAmount: bill.dueAmount || 0,
                    paymentStatus: bill.paymentStatus,
                    paymentMethod: bill.paymentMethod,
                    transactionId: bill.transactionId,
                    generatedBy: bill.generatedBy,
                    createdAt: bill.createdAt
                } : null
            };
        });

        // Filter by bill status
        if (status && status !== 'all') {
            if (status === 'not-generated') {
                merged = merged.filter(item => !item.bill);
            } else {
                merged = merged.filter(item =>
                    item.bill && item.bill.paymentStatus.toLowerCase() === status.toLowerCase()
                );
            }
        }

        // Search
        if (search) {
            const s = search.toLowerCase();
            merged = merged.filter(item =>
                item.fullName?.toLowerCase().includes(s) ||
                item.appointmentId?.toLowerCase().includes(s) ||
                item.patientId?.toLowerCase().includes(s) ||
                item.bill?.billNumber?.toLowerCase().includes(s)
            );
        }

        const total = merged.length;
        const data = merged.slice(skip, skip + parseInt(limit));

        res.json({
            success: true,
            data,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ─── GET /bills/doctor-fee/:appointmentId ───────────────────────────────────
// Fetch doctor consultation fee for an appointment (used by Generate Invoice modal)
router.get('/doctor-fee/:appointmentId', protect, authorize('Admin', 'Receptionist'), async (req, res) => {
    try {
        const appointment = await PublicAppointment.findById(req.params.appointmentId)
            .populate({
                path: 'doctorAssigned',
                populate: { path: 'user', select: 'name' },
                select: 'fees user'
            });

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        // Fetch department data (defaultConsultationFee + services) by department name
        let departmentData = null;
        if (appointment.department) {
            const dept = await Department.findOne({ name: appointment.department, isActive: true });
            if (dept) {
                departmentData = {
                    _id: dept._id,
                    name: dept.name,
                    defaultConsultationFee: dept.defaultConsultationFee || 0,
                    services: (dept.services || []).map(s => ({
                        serviceName: s.serviceName,
                        fee: s.fee,
                        description: s.description || ''
                    }))
                };
            }
        }

        res.json({
            success: true,
            data: {
                doctorFee: appointment.doctorAssigned?.fees || 0,
                doctorName: appointment.doctorAssigned?.user?.name || 'Not Assigned',
                department: departmentData,
                appointment: {
                    appointmentId: appointment.appointmentId,
                    patientId: appointment.patientId,
                    fullName: appointment.fullName,
                    department: appointment.department,
                    mobileNumber: appointment.mobileNumber,
                    emailAddress: appointment.emailAddress
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ─── POST /bills/generate/:appointmentId ────────────────────────────────────
// Generate a new invoice for an appointment
router.post('/generate/:appointmentId', protect, authorize('Admin', 'Receptionist'), async (req, res) => {
    try {
        const { services = [], discount = 0, roundOff = 0 } = req.body;
        const appointmentId = req.params.appointmentId;

        // Check if bill already exists
        const existingBill = await Bill.findOne({ publicAppointment: appointmentId });
        if (existingBill) {
            return res.status(400).json({ success: false, message: 'Invoice already generated for this appointment' });
        }

        const appointment = await PublicAppointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        const subtotal = services.reduce((sum, s) => sum + Number(s.amount), 0);
        const totalAmount = Math.max(0, subtotal - Number(discount) + Number(roundOff));

        // Fetch signature of the person generating the invoice
        let signatureKey = '';
        if (req.user.role === 'Admin') {
            const admin = await Admin.findOne({ user: req.user._id });
            signatureKey = admin?.digitalSignature || '';
        } else if (req.user.role === 'Receptionist') {
            const receptionist = await Receptionist.findOne({ user: req.user._id });
            signatureKey = receptionist?.digitalSignature || '';
        }

        const bill = await Bill.create({
            publicAppointment: appointmentId,
            services,
            subtotal,
            discount: Number(discount),
            roundOff: Number(roundOff),
            totalAmount,
            paidAmount: 0,
            dueAmount: totalAmount,
            paymentStatus: 'Pending',
            generatedBy: {
                name: req.user.name,
                role: req.user.role
            },
            generatedBySignature: signatureKey
        });

        res.status(201).json({ success: true, data: bill });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// ─── GET /bills/:id ────────────────────────────────────────────────────────
// Get full bill details with appointment info
router.get('/:id', protect, async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id)
            .populate({
                path: 'publicAppointment',
                populate: {
                    path: 'doctorAssigned',
                    populate: { path: 'user', select: 'name' },
                    select: 'fees user qualifications'
                }
            });

        if (!bill) {
            return res.status(404).json({ success: false, message: 'Bill not found' });
        }

        // Generate presigned URL for signature
        const signatureUrl = await getPresignedUrl(bill.generatedBySignature);

        res.json({
            success: true,
            data: {
                ...bill.toObject(),
                generatedBySignatureUrl: signatureUrl || ''
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ─── PUT /bills/:id ────────────────────────────────────────────────────────
// Update bill (services, discount, roundOff, payment info)
router.put('/:id', protect, authorize('Admin', 'Receptionist'), async (req, res) => {
    try {
        const { services, discount, roundOff, paidAmount, paymentMethod, transactionId, notes } = req.body;

        const bill = await Bill.findById(req.params.id);
        if (!bill) {
            return res.status(404).json({ success: false, message: 'Bill not found' });
        }

        if (services !== undefined) {
            bill.services = services;
            bill.subtotal = services.reduce((sum, s) => sum + Number(s.amount), 0);
        }
        if (discount !== undefined) bill.discount = Number(discount);
        if (roundOff !== undefined) bill.roundOff = Number(roundOff);
        if (paymentMethod !== undefined) bill.paymentMethod = paymentMethod;
        if (transactionId !== undefined) bill.transactionId = transactionId;
        if (notes !== undefined) bill.notes = notes;

        // Recalculate total
        bill.totalAmount = Math.max(0, bill.subtotal - bill.discount + bill.roundOff);

        // Handle paid amount and auto-compute payment status
        if (paidAmount !== undefined) {
            const paid = Math.max(0, Number(paidAmount));
            bill.paidAmount = paid;
            bill.dueAmount = Math.max(0, bill.totalAmount - paid);

            if (paid <= 0) {
                bill.paymentStatus = 'Pending';
            } else if (paid >= bill.totalAmount) {
                bill.paymentStatus = 'Paid';
                bill.dueAmount = 0;
                bill.paidAmount = bill.totalAmount;
            } else {
                bill.paymentStatus = 'Partial';
            }
        } else {
            // Recalc due if total changed but paidAmount wasn't sent
            bill.dueAmount = Math.max(0, bill.totalAmount - (bill.paidAmount || 0));
            if (bill.paidAmount > 0 && bill.paidAmount >= bill.totalAmount) {
                bill.paymentStatus = 'Paid';
                bill.dueAmount = 0;
            } else if (bill.paidAmount > 0) {
                bill.paymentStatus = 'Partial';
            }
        }

        await bill.save();

        res.json({ success: true, data: bill });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

module.exports = router;
