const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Department = require('../models/Department');
const PublicAppointment = require('../models/PublicAppointment');
const Bill = require('../models/Bill');

// Helper: get Doctor document for logged-in user
const getDoctorDoc = async (userId) => {
    return Doctor.findOne({ user: userId });
};

// @desc    Get doctor dashboard stats
// @route   GET /api/doctor-dashboard/stats
const getDoctorDashboardStats = async (req, res) => {
    try {
        const doctor = await getDoctorDoc(req.user._id);
        if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });

        const doctorId = doctor._id;
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

        const baseFilter = { doctorAssigned: doctorId };

        const [
            todayTotal,
            todayCompleted,
            todayPending,
            todayConfirmed,
            upcomingCount,
            totalCompleted,
            totalCancelled,
            totalAppointments,
            weekConsultations,
            monthConsultations,
            lastMonthConsultations,
            uniquePatients,
            newPatients,
            followUpPatients,
            pendingCount,
            confirmedCount,
            completedCount,
            cancelledCount,
            revenueData,
            monthRevenue,
        ] = await Promise.all([
            // Today
            PublicAppointment.countDocuments({ ...baseFilter, appointmentDate: { $gte: startOfToday, $lte: endOfToday }, appointmentStatus: { $in: ['Pending', 'Confirmed', 'Completed'] } }),
            PublicAppointment.countDocuments({ ...baseFilter, appointmentDate: { $gte: startOfToday, $lte: endOfToday }, appointmentStatus: 'Completed' }),
            PublicAppointment.countDocuments({ ...baseFilter, appointmentDate: { $gte: startOfToday, $lte: endOfToday }, appointmentStatus: 'Pending' }),
            PublicAppointment.countDocuments({ ...baseFilter, appointmentDate: { $gte: startOfToday, $lte: endOfToday }, appointmentStatus: 'Confirmed' }),
            // Upcoming (future, not today)
            PublicAppointment.countDocuments({ ...baseFilter, appointmentDate: { $gt: endOfToday }, appointmentStatus: { $in: ['Pending', 'Confirmed'] } }),
            // All time
            PublicAppointment.countDocuments({ ...baseFilter, appointmentStatus: 'Completed' }),
            PublicAppointment.countDocuments({ ...baseFilter, appointmentStatus: 'Cancelled' }),
            PublicAppointment.countDocuments(baseFilter),
            // This week
            PublicAppointment.countDocuments({ ...baseFilter, appointmentDate: { $gte: startOfWeek }, appointmentStatus: { $in: ['Completed', 'Confirmed', 'Pending'] } }),
            // This month
            PublicAppointment.countDocuments({ ...baseFilter, createdAt: { $gte: startOfMonth } }),
            PublicAppointment.countDocuments({ ...baseFilter, createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
            // Unique patients
            PublicAppointment.distinct('patientId', baseFilter).then(ids => ids.length),
            // Visit types
            PublicAppointment.countDocuments({ ...baseFilter, visitType: 'New Patient' }),
            PublicAppointment.countDocuments({ ...baseFilter, visitType: 'Follow-up' }),
            // Status counts (all time)
            PublicAppointment.countDocuments({ ...baseFilter, appointmentStatus: 'Pending' }),
            PublicAppointment.countDocuments({ ...baseFilter, appointmentStatus: 'Confirmed' }),
            PublicAppointment.countDocuments({ ...baseFilter, appointmentStatus: 'Completed' }),
            PublicAppointment.countDocuments({ ...baseFilter, appointmentStatus: 'Cancelled' }),
            // Revenue
            Bill.aggregate([
                { $match: { doctor: doctorId } },
                { $group: { _id: null, total: { $sum: '$totalAmount' }, paid: { $sum: '$paidAmount' } } },
            ]).catch(() => []),
            Bill.aggregate([
                { $match: { doctor: doctorId, createdAt: { $gte: startOfMonth } } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } },
            ]).catch(() => []),
        ]);

        const calcChange = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };

        res.json({
            cards: {
                todayAppointments: todayTotal,
                todayCompleted,
                todayPending,
                todayConfirmed,
                upcomingAppointments: upcomingCount,
                totalCompleted,
                totalAppointments,
                totalCancelled,
                weekConsultations,
                monthConsultations,
                monthChange: calcChange(monthConsultations, lastMonthConsultations),
                uniquePatients,
                newPatients,
                followUpPatients,
            },
            statusDistribution: {
                pending: pendingCount,
                confirmed: confirmedCount,
                completed: completedCount,
                cancelled: cancelledCount,
                total: totalAppointments,
            },
            revenue: {
                total: revenueData[0]?.total || 0,
                paid: revenueData[0]?.paid || 0,
                thisMonth: monthRevenue[0]?.total || 0,
            },
        });
    } catch (error) {
        console.error('Doctor dashboard stats error:', error);
        res.status(500).json({ message: 'Failed to fetch doctor dashboard stats' });
    }
};

// @desc    Get doctor's recent appointments
// @route   GET /api/doctor-dashboard/appointments
const getDoctorRecentAppointments = async (req, res) => {
    try {
        const doctor = await getDoctorDoc(req.user._id);
        if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });

        const appointments = await PublicAppointment.find({ doctorAssigned: doctor._id })
            .sort({ appointmentDate: -1, appointmentTime: -1 })
            .limit(15)
            .lean();

        const result = appointments.map(apt => ({
            _id: apt._id,
            patientName: apt.fullName,
            patientId: apt.patientId,
            appointmentId: apt.appointmentId,
            gender: apt.gender,
            age: apt.age,
            department: apt.department || 'General',
            appointmentDate: apt.appointmentDate,
            appointmentTime: apt.appointmentTime,
            status: apt.appointmentStatus,
            visitType: apt.visitType,
            reasonForVisit: apt.reasonForVisit || apt.primaryConcern || '',
            source: apt.source || 'Website',
            createdAt: apt.createdAt,
        }));

        res.json(result);
    } catch (error) {
        console.error('Doctor recent appointments error:', error);
        res.status(500).json({ message: 'Failed to fetch appointments' });
    }
};

// @desc    Get doctor's today appointments
// @route   GET /api/doctor-dashboard/today
const getDoctorTodayAppointments = async (req, res) => {
    try {
        const doctor = await getDoctorDoc(req.user._id);
        if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        const appointments = await PublicAppointment.find({
            doctorAssigned: doctor._id,
            appointmentDate: { $gte: startOfToday, $lte: endOfToday },
        })
            .sort({ appointmentTime: 1 })
            .lean();

        const result = appointments.map(apt => ({
            _id: apt._id,
            patientName: apt.fullName,
            patientId: apt.patientId,
            appointmentId: apt.appointmentId,
            gender: apt.gender,
            age: apt.age,
            department: apt.department || 'General',
            appointmentDate: apt.appointmentDate,
            appointmentTime: apt.appointmentTime,
            status: apt.appointmentStatus,
            visitType: apt.visitType,
            reasonForVisit: apt.reasonForVisit || apt.primaryConcern || '',
            mobileNumber: apt.mobileNumber,
            source: apt.source || 'Website',
        }));

        res.json(result);
    } catch (error) {
        console.error('Doctor today appointments error:', error);
        res.status(500).json({ message: 'Failed to fetch today appointments' });
    }
};

// @desc    Get doctor charts data
// @route   GET /api/doctor-dashboard/charts/:type
const getDoctorChartData = async (req, res) => {
    try {
        const doctor = await getDoctorDoc(req.user._id);
        if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });

        const { type } = req.params;
        const doctorId = doctor._id;
        const now = new Date();

        if (type === 'weekly') {
            // Last 7 days
            const days = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
                days.push(d);
            }

            const data = await Promise.all(days.map(async (d) => {
                const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
                const filter = { doctorAssigned: doctorId, appointmentDate: { $gte: start, $lte: end } };

                const [total, completed, cancelled] = await Promise.all([
                    PublicAppointment.countDocuments({ ...filter, appointmentStatus: { $ne: 'Cancelled' } }),
                    PublicAppointment.countDocuments({ ...filter, appointmentStatus: 'Completed' }),
                    PublicAppointment.countDocuments({ ...filter, appointmentStatus: 'Cancelled' }),
                ]);

                return {
                    label: d.toLocaleDateString('en', { weekday: 'short' }),
                    date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
                    total,
                    completed,
                    cancelled,
                };
            }));

            return res.json(data);
        }

        if (type === 'monthly-trend') {
            // Last 6 months
            const months = [];
            for (let i = 5; i >= 0; i--) {
                const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
                months.push({ start, end, label: start.toLocaleString('en', { month: 'short' }) });
            }

            const data = await Promise.all(months.map(async (m) => {
                const filter = { doctorAssigned: doctorId, appointmentDate: { $gte: m.start, $lte: m.end } };
                const [total, completed, cancelled] = await Promise.all([
                    PublicAppointment.countDocuments(filter),
                    PublicAppointment.countDocuments({ ...filter, appointmentStatus: 'Completed' }),
                    PublicAppointment.countDocuments({ ...filter, appointmentStatus: 'Cancelled' }),
                ]);
                return { label: m.label, total, completed, cancelled };
            }));

            return res.json(data);
        }

        if (type === 'visit-types') {
            const [newPatient, followUp] = await Promise.all([
                PublicAppointment.countDocuments({ doctorAssigned: doctorId, visitType: 'New Patient' }),
                PublicAppointment.countDocuments({ doctorAssigned: doctorId, visitType: 'Follow-up' }),
            ]);
            return res.json([
                { name: 'New Patient', value: newPatient },
                { name: 'Follow-up', value: followUp },
            ]);
        }

        if (type === 'status-distribution') {
            const statuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
            const data = await Promise.all(statuses.map(async (s) => ({
                name: s,
                value: await PublicAppointment.countDocuments({ doctorAssigned: doctorId, appointmentStatus: s }),
            })));
            return res.json(data);
        }

        res.status(400).json({ message: 'Invalid chart type' });
    } catch (error) {
        console.error('Doctor chart data error:', error);
        res.status(500).json({ message: 'Failed to fetch chart data' });
    }
};

// @desc    Get doctor profile & public content for dashboard
// @route   GET /api/doctor-dashboard/profile
const getDoctorDashboardProfile = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ user: req.user._id })
            .populate('user', 'name email phone')
            .populate('department', 'name description')
            .populate('departments', 'name description')
            .lean();

        if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });

        res.json({
            _id: doctor._id,
            name: doctor.user?.name || '',
            email: doctor.user?.email || '',
            phone: doctor.user?.phone || '',
            department: doctor.department,
            departments: doctor.departments || [],
            qualifications: doctor.qualifications || '',
            experience: doctor.experience || 0,
            fees: doctor.fees || 0,
            gender: doctor.gender || '',
            medicalCouncilId: doctor.medicalCouncilId || '',
            profilePhoto: doctor.profilePhoto || '',
            digitalSignature: doctor.digitalSignature || '',
            shortBio: doctor.shortBio || '',
            detailedBiography: doctor.detailedBiography || '',
            specialInterests: doctor.specialInterests || [],
            featuredTreatments: doctor.featuredTreatments || [],
            patientTestimonials: doctor.patientTestimonials || [],
            availableSlots: doctor.availableSlots || [],
            isActive: doctor.isActive,
        });
    } catch (error) {
        console.error('Doctor profile error:', error);
        res.status(500).json({ message: 'Failed to fetch doctor profile' });
    }
};

// @desc    Get doctor activity feed
// @route   GET /api/doctor-dashboard/activity
const getDoctorActivity = async (req, res) => {
    try {
        const doctor = await getDoctorDoc(req.user._id);
        if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });

        const recentAppointments = await PublicAppointment.find({ doctorAssigned: doctor._id })
            .sort({ updatedAt: -1 })
            .limit(20)
            .lean();

        const feed = recentAppointments.map(apt => {
            let action = 'Appointment booked';
            let type = 'appointment';
            if (apt.appointmentStatus === 'Completed') {
                action = 'Consultation completed';
                type = 'completed';
            } else if (apt.appointmentStatus === 'Confirmed') {
                action = 'Appointment confirmed';
                type = 'confirmed';
            } else if (apt.appointmentStatus === 'Cancelled') {
                action = 'Appointment cancelled';
                type = 'cancelled';
            }

            return {
                _id: apt._id,
                type,
                title: action,
                description: `${apt.fullName} — ${apt.department || 'General'} — ${apt.visitType || ''}`,
                time: apt.updatedAt || apt.createdAt,
                status: apt.appointmentStatus,
            };
        });

        res.json(feed);
    } catch (error) {
        console.error('Doctor activity error:', error);
        res.status(500).json({ message: 'Failed to fetch activity feed' });
    }
};

module.exports = {
    getDoctorDashboardStats,
    getDoctorRecentAppointments,
    getDoctorTodayAppointments,
    getDoctorChartData,
    getDoctorDashboardProfile,
    getDoctorActivity,
};
