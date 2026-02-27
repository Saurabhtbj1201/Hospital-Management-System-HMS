const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Department = require('../models/Department');
const PublicAppointment = require('../models/PublicAppointment');
const Bill = require('../models/Bill');
const SupportTicket = require('../models/SupportTicket');
const Announcement = require('../models/Announcement');

// @desc    Get dashboard stats overview
// @route   GET /api/dashboard/stats
const getDashboardStats = async (req, res) => {
    try {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        // Parallel aggregation
        const [
            totalPatients,
            totalDoctors,
            totalDepartments,
            totalAppointments,
            todayAppointments,
            monthAppointments,
            lastMonthAppointments,
            pendingAppointments,
            confirmedAppointments,
            completedAppointments,
            cancelledAppointments,
            totalRevenue,
            monthRevenue,
            lastMonthRevenue,
            pendingBills,
            openTickets,
            activeAnnouncements,
            newPatientsThisMonth,
            newPatientsLastMonth,
        ] = await Promise.all([
            // Counts
            PublicAppointment.countDocuments(),
            Doctor.countDocuments({ isActive: true }),
            Department.countDocuments({ isActive: true }),
            PublicAppointment.countDocuments(),
            PublicAppointment.countDocuments({
                appointmentDate: { $gte: startOfToday },
                appointmentStatus: { $in: ['Pending', 'Confirmed'] }
            }),
            PublicAppointment.countDocuments({
                createdAt: { $gte: startOfMonth }
            }),
            PublicAppointment.countDocuments({
                createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
            }),
            // Status counts
            PublicAppointment.countDocuments({ appointmentStatus: 'Pending' }),
            PublicAppointment.countDocuments({ appointmentStatus: 'Confirmed' }),
            PublicAppointment.countDocuments({ appointmentStatus: 'Completed' }),
            PublicAppointment.countDocuments({ appointmentStatus: 'Cancelled' }),
            // Revenue
            Bill.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
            Bill.aggregate([
                { $match: { createdAt: { $gte: startOfMonth } } },
                { $group: { _id: null, total: { $sum: '$totalAmount' }, paid: { $sum: '$paidAmount' } } }
            ]),
            Bill.aggregate([
                { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            Bill.countDocuments({ paymentStatus: { $in: ['Pending', 'Due', 'Partial'] } }),
            // Support
            SupportTicket.countDocuments({ status: { $in: ['Open', 'In Progress'] } }),
            Announcement.countDocuments({ isActive: true }),
            // New patients
            PublicAppointment.countDocuments({
                visitType: 'New Patient',
                createdAt: { $gte: startOfMonth }
            }),
            PublicAppointment.countDocuments({
                visitType: 'New Patient',
                createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
            }),
        ]);

        const totalRevenueVal = totalRevenue[0]?.total || 0;
        const monthRevenueVal = monthRevenue[0]?.total || 0;
        const monthPaidVal = monthRevenue[0]?.paid || 0;
        const lastMonthRevenueVal = lastMonthRevenue[0]?.total || 0;

        // Calculate percentage changes
        const calcChange = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };

        res.json({
            cards: {
                totalPatients: {
                    value: totalPatients,
                    change: calcChange(monthAppointments, lastMonthAppointments),
                },
                todayAppointments: {
                    value: todayAppointments,
                    total: totalAppointments,
                },
                totalDoctors: {
                    value: totalDoctors,
                    departments: totalDepartments,
                },
                monthRevenue: {
                    value: monthRevenueVal,
                    change: calcChange(monthRevenueVal, lastMonthRevenueVal),
                    totalRevenue: totalRevenueVal,
                    paid: monthPaidVal,
                },
                newPatients: {
                    value: newPatientsThisMonth,
                    change: calcChange(newPatientsThisMonth, newPatientsLastMonth),
                },
                pendingBills: {
                    value: pendingBills,
                },
                openTickets: {
                    value: openTickets,
                },
                activeAnnouncements: {
                    value: activeAnnouncements,
                },
            },
            appointmentStatus: {
                pending: pendingAppointments,
                confirmed: confirmedAppointments,
                completed: completedAppointments,
                cancelled: cancelledAppointments,
                total: totalAppointments,
            },
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ message: 'Failed to fetch dashboard stats' });
    }
};

// @desc    Get recent appointments
// @route   GET /api/dashboard/appointments
const getRecentAppointments = async (req, res) => {
    try {
        const appointments = await PublicAppointment.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('doctorAssigned', 'user')
            .lean();

        // Get doctor user info
        const doctorIds = [...new Set(appointments.filter(a => a.doctorAssigned?.user).map(a => a.doctorAssigned.user))];
        const doctorUsers = await User.find({ _id: { $in: doctorIds } }).select('name').lean();
        const doctorMap = {};
        doctorUsers.forEach(u => { doctorMap[u._id.toString()] = u.name; });

        const result = appointments.map(apt => ({
            _id: apt._id,
            patientName: apt.fullName,
            patientId: apt.patientId,
            appointmentId: apt.appointmentId,
            department: apt.department || 'General',
            doctorName: apt.doctorAssigned?.user ? (doctorMap[apt.doctorAssigned.user.toString()] || 'Unassigned') : 'Unassigned',
            appointmentDate: apt.appointmentDate,
            appointmentTime: apt.appointmentTime,
            status: apt.appointmentStatus,
            visitType: apt.visitType,
            source: apt.source || 'Website',
            createdAt: apt.createdAt,
        }));

        res.json(result);
    } catch (error) {
        console.error('Recent appointments error:', error);
        res.status(500).json({ message: 'Failed to fetch recent appointments' });
    }
};

// @desc    Get chart data
// @route   GET /api/dashboard/charts/:type
const getChartData = async (req, res) => {
    try {
        const { type } = req.params;
        const now = new Date();

        if (type === 'monthly-appointments') {
            // Last 12 months appointment trend
            const months = [];
            for (let i = 11; i >= 0; i--) {
                const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
                months.push({ start, end, label: start.toLocaleString('en', { month: 'short' }) });
            }

            const data = await Promise.all(months.map(async (m) => {
                const [total, completed, cancelled] = await Promise.all([
                    PublicAppointment.countDocuments({ createdAt: { $gte: m.start, $lte: m.end } }),
                    PublicAppointment.countDocuments({ createdAt: { $gte: m.start, $lte: m.end }, appointmentStatus: 'Completed' }),
                    PublicAppointment.countDocuments({ createdAt: { $gte: m.start, $lte: m.end }, appointmentStatus: 'Cancelled' }),
                ]);
                return { name: m.label, total, completed, cancelled };
            }));

            return res.json(data);
        }

        if (type === 'monthly-revenue') {
            const months = [];
            for (let i = 11; i >= 0; i--) {
                const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
                months.push({ start, end, label: start.toLocaleString('en', { month: 'short' }) });
            }

            const data = await Promise.all(months.map(async (m) => {
                const result = await Bill.aggregate([
                    { $match: { createdAt: { $gte: m.start, $lte: m.end } } },
                    { $group: { _id: null, revenue: { $sum: '$totalAmount' }, collected: { $sum: '$paidAmount' } } }
                ]);
                return { name: m.label, revenue: result[0]?.revenue || 0, collected: result[0]?.collected || 0 };
            }));

            return res.json(data);
        }

        if (type === 'department-distribution') {
            const departments = await Department.find({ isActive: true }).select('name').lean();
            const data = await Promise.all(departments.map(async (dept) => {
                const count = await PublicAppointment.countDocuments({ department: dept.name });
                return { name: dept.name, value: count };
            }));
            // Sort by value descending, take top 8
            data.sort((a, b) => b.value - a.value);
            return res.json(data.slice(0, 8));
        }

        if (type === 'daily-appointments') {
            // Last 7 days
            const data = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
                const nextDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1);
                const count = await PublicAppointment.countDocuments({
                    appointmentDate: { $gte: date, $lt: nextDate }
                });
                data.push({
                    name: date.toLocaleString('en', { weekday: 'short' }),
                    value: count,
                });
            }
            return res.json(data);
        }

        if (type === 'appointment-sources') {
            const sources = await PublicAppointment.aggregate([
                { $group: { _id: '$source', count: { $sum: 1 } } },
            ]);
            const data = sources.map(s => ({
                name: s._id || 'Website',
                value: s.count,
            }));
            return res.json(data);
        }

        if (type === 'departments') {
            const departments = await Department.find({ isActive: true })
                .select('name description image defaultConsultationFee services isActive')
                .lean();

            // Count doctors per department
            const data = await Promise.all(departments.map(async (dept) => {
                const doctorCount = await Doctor.countDocuments({
                    $or: [{ department: dept._id }, { departments: dept._id }],
                    isActive: true,
                });
                const appointmentCount = await PublicAppointment.countDocuments({ department: dept.name });
                return {
                    _id: dept._id,
                    name: dept.name,
                    description: dept.description,
                    image: dept.image,
                    consultationFee: dept.defaultConsultationFee,
                    servicesCount: dept.services?.length || 0,
                    doctorCount,
                    appointmentCount,
                };
            }));

            return res.json(data);
        }

        res.status(400).json({ message: 'Invalid chart type' });
    } catch (error) {
        console.error('Chart data error:', error);
        res.status(500).json({ message: 'Failed to fetch chart data' });
    }
};

// @desc    Get activity feed
// @route   GET /api/dashboard/activity
const getActivityFeed = async (req, res) => {
    try {
        // Get recent items from multiple collections
        const [recentAppointments, recentBills, recentTickets, recentAnnouncements] = await Promise.all([
            PublicAppointment.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select('fullName appointmentStatus appointmentId createdAt department')
                .lean(),
            Bill.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select('billNumber totalAmount paymentStatus createdAt')
                .lean(),
            SupportTicket.find()
                .sort({ createdAt: -1 })
                .limit(3)
                .select('name issueType status createdAt')
                .lean(),
            Announcement.find()
                .sort({ createdAt: -1 })
                .limit(3)
                .select('title type priority createdAt')
                .lean(),
        ]);

        // Merge into activity feed
        const feed = [];

        recentAppointments.forEach(a => {
            feed.push({
                type: 'appointment',
                title: `New appointment ${a.appointmentId}`,
                description: `${a.fullName} — ${a.department || 'General'}`,
                status: a.appointmentStatus,
                time: a.createdAt,
            });
        });

        recentBills.forEach(b => {
            feed.push({
                type: 'bill',
                title: `Invoice ${b.billNumber}`,
                description: `₹${b.totalAmount?.toLocaleString('en-IN')} — ${b.paymentStatus}`,
                status: b.paymentStatus,
                time: b.createdAt,
            });
        });

        recentTickets.forEach(t => {
            feed.push({
                type: 'support',
                title: `Ticket: ${t.issueType}`,
                description: `From ${t.name} — ${t.status}`,
                status: t.status,
                time: t.createdAt,
            });
        });

        recentAnnouncements.forEach(a => {
            feed.push({
                type: 'announcement',
                title: a.title,
                description: `${a.type} — ${a.priority} priority`,
                status: a.type,
                time: a.createdAt,
            });
        });

        // Sort by time descending
        feed.sort((a, b) => new Date(b.time) - new Date(a.time));

        res.json(feed.slice(0, 15));
    } catch (error) {
        console.error('Activity feed error:', error);
        res.status(500).json({ message: 'Failed to fetch activity feed' });
    }
};

module.exports = {
    getDashboardStats,
    getRecentAppointments,
    getChartData,
    getActivityFeed,
};
