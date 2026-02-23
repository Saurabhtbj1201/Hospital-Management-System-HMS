const SupportTicket = require('../models/SupportTicket');

// Create a new support ticket
exports.createTicket = async (req, res) => {
    try {
        const { name, email, phone, issueType, description } = req.body;

        const ticket = await SupportTicket.create({
            name,
            email,
            phone,
            issueType,
            description
        });

        res.status(201).json({
            success: true,
            message: 'Support ticket created successfully',
            ticket
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all support tickets (Admin only)
exports.getAllTickets = async (req, res) => {
    try {
        const { status, priority, issueType } = req.query;

        let filter = {};
        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        if (issueType) filter.issueType = issueType;

        const tickets = await SupportTicket.find(filter)
            .populate('resolvedBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: tickets.length,
            tickets
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get single ticket
exports.getTicket = async (req, res) => {
    try {
        const ticket = await SupportTicket.findById(req.params.id)
            .populate('resolvedBy', 'name email');

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        res.status(200).json({
            success: true,
            ticket
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update ticket status
exports.updateTicket = async (req, res) => {
    try {
        const { status, priority, notes, resolvedBy } = req.body;

        const updateData = {};
        if (status) updateData.status = status;
        if (priority) updateData.priority = priority;
        if (notes) updateData.notes = notes;

        if (status === 'Resolved' || status === 'Closed') {
            updateData.resolvedAt = Date.now();
            if (resolvedBy) updateData.resolvedBy = resolvedBy;
        }

        const ticket = await SupportTicket.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('resolvedBy', 'name email');

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Ticket updated successfully',
            ticket
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete ticket
exports.deleteTicket = async (req, res) => {
    try {
        const ticket = await SupportTicket.findByIdAndDelete(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Ticket deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get ticket statistics
exports.getTicketStats = async (req, res) => {
    try {
        const totalTickets = await SupportTicket.countDocuments();
        const openTickets = await SupportTicket.countDocuments({ status: 'Open' });
        const inProgressTickets = await SupportTicket.countDocuments({ status: 'In Progress' });
        const resolvedTickets = await SupportTicket.countDocuments({ status: 'Resolved' });
        const closedTickets = await SupportTicket.countDocuments({ status: 'Closed' });

        const issueTypeStats = await SupportTicket.aggregate([
            {
                $group: {
                    _id: '$issueType',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            stats: {
                total: totalTickets,
                open: openTickets,
                inProgress: inProgressTickets,
                resolved: resolvedTickets,
                closed: closedTickets,
                byIssueType: issueTypeStats
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
