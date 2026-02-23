const Bill = require('../models/Bill');
const Appointment = require('../models/Appointment');

exports.createBill = async (req, res) => {
    const { appointmentId, services, totalAmount } = req.body;
    try {
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        const bill = await Bill.create({
            appointment: appointmentId,
            patient: appointment.patient,
            services,
            totalAmount,
            paymentStatus: 'Pending'
        });
        res.status(201).json(bill);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getBillById = async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id)
            .populate('patient', 'name email')
            .populate('appointment');
        if (bill) {
            res.json(bill);
        } else {
            res.status(404).json({ message: 'Bill not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateBillStatus = async (req, res) => {
    const { paymentStatus, paymentMethod, transactionId } = req.body;
    try {
        const bill = await Bill.findByIdAndUpdate(
            req.params.id,
            { paymentStatus, paymentMethod, transactionId },
            { new: true }
        );
        res.json(bill);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
