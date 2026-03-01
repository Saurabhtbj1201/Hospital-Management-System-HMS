import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../services/api';
import {
    Users, Calendar, Stethoscope, IndianRupee, UserPlus, FileWarning,
    Headphones, Megaphone, TrendingUp, TrendingDown, ChevronLeft,
    ChevronRight, Activity, RefreshCw, CalendarDays,
    Building2, CircleDollarSign, AlertCircle
} from 'lucide-react';
import {
    BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import './Dashboard.css';

// ── Color palette ──
const PIE_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'];
const BAR_COLORS = { total: '#6366f1', completed: '#22c55e', cancelled: '#f87171' };

// ── Time-ago helper ──
const timeAgo = (date) => {
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

// ── Format currency ──
const formatCurrency = (val) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val?.toLocaleString('en-IN') || 0}`;
};

// ── Custom Tooltip ──
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white px-3 py-2 border border-gray-200 rounded-lg shadow-lg text-xs">
            <p className="font-semibold text-gray-700 mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
                    {p.name}: <span className="font-semibold">{typeof p.value === 'number' && p.value > 999 ? `₹${p.value.toLocaleString('en-IN')}` : p.value}</span>
                </p>
            ))}
        </div>
    );
};

const Dashboard = () => {
    const { user } = useAuth();

    // ── Data state ──
    const [stats, setStats] = useState(null);
    const [recentAppointments, setRecentAppointments] = useState([]);
    const [activityFeed, setActivityFeed] = useState([]);
    const [monthlyAppointments, setMonthlyAppointments] = useState([]);
    const [monthlyRevenue, setMonthlyRevenue] = useState([]);
    const [deptDistribution, setDeptDistribution] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [appointmentSources, setAppointmentSources] = useState([]);
    const [dailyAppointments, setDailyAppointments] = useState([]);

    // ── UI state ──
    const [loading, setLoading] = useState(true);
    const [chartTab, setChartTab] = useState('12m');
    const [refreshing, setRefreshing] = useState(false);

    // Carousel state
    const [carouselIndex, setCarouselIndex] = useState(0);
    const carouselTimer = useRef(null);

    const fetchAll = useCallback(async () => {
        try {
            const [
                statsData,
                appointmentsData,
                activityData,
                monthlyAptData,
                revenueData,
                deptData,
                departmentsData,
                sourcesData,
                dailyData,
            ] = await Promise.all([
                dashboardAPI.getStats(),
                dashboardAPI.getRecentAppointments(),
                dashboardAPI.getActivityFeed(),
                dashboardAPI.getChartData('monthly-appointments'),
                dashboardAPI.getChartData('monthly-revenue'),
                dashboardAPI.getChartData('department-distribution'),
                dashboardAPI.getChartData('departments'),
                dashboardAPI.getChartData('appointment-sources'),
                dashboardAPI.getChartData('daily-appointments'),
            ]);

            setStats(statsData);
            setRecentAppointments(appointmentsData);
            setActivityFeed(activityData);
            setMonthlyAppointments(monthlyAptData);
            setMonthlyRevenue(revenueData);
            setDeptDistribution(deptData);
            setDepartments(departmentsData);
            setAppointmentSources(sourcesData);
            setDailyAppointments(dailyData);
        } catch (error) {
            console.error('Dashboard fetch error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchAll();
    };

    // Auto-transition carousel
    useEffect(() => {
        if (departments.length <= 1) return;
        if (carouselTimer.current) clearInterval(carouselTimer.current);
        carouselTimer.current = setInterval(() => {
            setCarouselIndex(prev => (prev + 1) % departments.length);
        }, 4000);
        return () => clearInterval(carouselTimer.current);
    }, [departments.length]);

    const scrollCarousel = (dir) => {
        if (departments.length === 0) return;
        setCarouselIndex(prev => {
            const next = prev + dir;
            if (next < 0) return departments.length - 1;
            if (next >= departments.length) return 0;
            return next;
        });
        // Reset auto-timer on manual click
        if (carouselTimer.current) clearInterval(carouselTimer.current);
        carouselTimer.current = setInterval(() => {
            setCarouselIndex(prev => (prev + 1) % departments.length);
        }, 4000);
    };

    // ── Stat cards config ──
    const statCards = stats ? [
        {
            label: 'Total Patients',
            value: stats.cards.totalPatients.value,
            change: stats.cards.totalPatients.change,
            sub: 'All time registrations',
            icon: Users,
            color: 'blue',
        },
        {
            label: "Today's Appointments",
            value: stats.cards.todayAppointments.value,
            sub: `${stats.cards.todayAppointments.total.toLocaleString()} total`,
            icon: Calendar,
            color: 'violet',
        },
        {
            label: 'Active Doctors',
            value: stats.cards.totalDoctors.value,
            sub: `${stats.cards.totalDoctors.departments} departments`,
            icon: Stethoscope,
            color: 'emerald',
        },
        {
            label: 'Monthly Revenue',
            value: formatCurrency(stats.cards.monthRevenue.value),
            change: stats.cards.monthRevenue.change,
            sub: `${formatCurrency(stats.cards.monthRevenue.totalRevenue)} total`,
            icon: IndianRupee,
            color: 'amber',
        },
        {
            label: 'New Patients',
            value: stats.cards.newPatients.value,
            change: stats.cards.newPatients.change,
            sub: 'This month',
            icon: UserPlus,
            color: 'cyan',
        },
        {
            label: 'Pending Bills',
            value: stats.cards.pendingBills.value,
            sub: 'Awaiting payment',
            icon: FileWarning,
            color: 'rose',
        },
        {
            label: 'Open Tickets',
            value: stats.cards.openTickets.value,
            sub: 'Support requests',
            icon: Headphones,
            color: 'orange',
        },
        {
            label: 'Announcements',
            value: stats.cards.activeAnnouncements.value,
            sub: 'Active now',
            icon: Megaphone,
            color: 'green',
        },
    ] : [];

    // Appointment status pie data
    const statusPieData = stats ? [
        { name: 'Completed', value: stats.appointmentStatus.completed },
        { name: 'Confirmed', value: stats.appointmentStatus.confirmed },
        { name: 'Pending', value: stats.appointmentStatus.pending },
        { name: 'Cancelled', value: stats.appointmentStatus.cancelled },
    ].filter(d => d.value > 0) : [];

    const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    // ── Loading State ──
    if (loading) {
        return (
            <div className="dashboard p-4">
                <div className="dashboard-header">
                    <div>
                        <div className="skeleton" style={{ width: 260, height: 26, marginBottom: 8 }} />
                        <div className="skeleton" style={{ width: 200, height: 16 }} />
                    </div>
                </div>
                <div className="admin-stats-grid">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="skeleton skeleton-card" />
                    ))}
                </div>
                <div className="charts-row">
                    <div className="skeleton skeleton-chart" />
                    <div className="skeleton skeleton-chart" />
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            {/* ── Header ── */}
            <div className="admin-dashboard-header">
                <div>
                    <h1>Welcome back, {user?.name?.split(' ')[0] || 'Admin'}</h1>
                    <p>Track, manage and monitor your hospital operations.</p>
                </div>
                <div className="dashboard-header-actions">
                    <span className="dashboard-date-badge">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {today}
                    </span>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* ── Stat Cards ── */}
            <div className="admin-stats-grid">
                {statCards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <div key={i} className={`dsb-stat-card ${card.color}`}>
                            <div className="stat-card-header">
                                <div className={`stat-card-icon ${card.color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                {card.change !== undefined && (
                                    <span className={`stat-card-change ${card.change >= 0 ? 'up' : 'down'}`}>
                                        {card.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                        {Math.abs(card.change)}%
                                    </span>
                                )}
                            </div>
                            <div className="stat-card-value">{typeof card.value === 'number' ? card.value.toLocaleString() : card.value}</div>
                            <div className="stat-card-label">{card.label}</div>
                            {card.sub && <div className="stat-card-sub">{card.sub}</div>}
                        </div>
                    );
                })}
            </div>

            {/* ── Row 1: Appointments Bar Chart + Appointment Status Pie ── */}
            <div className="charts-row">
                {/* Appointments Trend */}
                <div className="chart-card">
                    <div className="chart-card-header">
                        <div>
                            <div className="chart-card-title">Appointments Overview</div>
                            <div className="chart-card-subtitle">Monthly appointments trend</div>
                        </div>
                        <div className="chart-tabs">
                            {['12m', '7d'].map(tab => (
                                <button
                                    key={tab}
                                    className={`chart-tab ${chartTab === tab ? 'active' : ''}`}
                                    onClick={() => setChartTab(tab)}
                                >
                                    {tab === '12m' ? '12 months' : '7 days'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div style={{ height: 280 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            {chartTab === '12m' ? (
                                <BarChart data={monthlyAppointments} barGap={2}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        iconType="circle"
                                        iconSize={8}
                                        wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                                    />
                                    <Bar dataKey="total" name="Total" fill={BAR_COLORS.total} radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="completed" name="Completed" fill={BAR_COLORS.completed} radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="cancelled" name="Cancelled" fill={BAR_COLORS.cancelled} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            ) : (
                                <BarChart data={dailyAppointments}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="value" name="Appointments" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Appointment Status Gauge / Pie */}
                <div className="chart-card">
                    <div className="chart-card-header">
                        <div>
                            <div className="chart-card-title">Appointment Status</div>
                            <div className="chart-card-subtitle">Overall distribution</div>
                        </div>
                    </div>
                    <div style={{ height: 220 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusPieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={85}
                                    paddingAngle={3}
                                    dataKey="value"
                                    strokeWidth={0}
                                >
                                    {statusPieData.map((_, index) => (
                                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(val, name) => [`${val}`, name]}
                                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                                />
                                {/* Center text */}
                                <text x="50%" y="47%" textAnchor="middle" className="gauge-center-text">
                                    {stats?.appointmentStatus.total || 0}
                                </text>
                                <text x="50%" y="57%" textAnchor="middle" className="gauge-center-label">
                                    Total
                                </text>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="gauge-legend">
                        {statusPieData.map((d, i) => (
                            <div key={i} className="gauge-legend-item">
                                <span className="gauge-legend-dot" style={{ background: PIE_COLORS[i] }} />
                                {d.name} ({d.value})
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Row 2: Revenue Area Chart + Sources Pie ── */}
            <div className="charts-row">
                <div className="chart-card">
                    <div className="chart-card-header">
                        <div>
                            <div className="chart-card-title">Revenue Trend</div>
                            <div className="chart-card-subtitle">Monthly billing & collection</div>
                        </div>
                    </div>
                    <div style={{ height: 260 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyRevenue}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${v / 1000}K` : v} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                                <Area type="monotone" dataKey="revenue" name="Billed" stroke="#6366f1" strokeWidth={2} fill="url(#colorRevenue)" />
                                <Area type="monotone" dataKey="collected" name="Collected" stroke="#22c55e" strokeWidth={2} fill="url(#colorCollected)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sources Pie */}
                <div className="chart-card">
                    <div className="chart-card-header">
                        <div>
                            <div className="chart-card-title">Appointment Sources</div>
                            <div className="chart-card-subtitle">Where patients come from</div>
                        </div>
                    </div>
                    {appointmentSources.length > 0 ? (
                        <>
                            <div style={{ height: 220 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={appointmentSources}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={85}
                                            dataKey="value"
                                            strokeWidth={2}
                                            stroke="#fff"
                                        >
                                            {appointmentSources.map((_, i) => (
                                                <Cell key={i} fill={['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(val, name) => [`${val}`, name]}
                                            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="gauge-legend">
                                {appointmentSources.map((d, i) => (
                                    <div key={i} className="gauge-legend-item">
                                        <span className="gauge-legend-dot" style={{ background: ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5] }} />
                                        {d.name} ({d.value})
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="dash-empty">
                            <AlertCircle className="w-8 h-8" />
                            <p>No source data available</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Row 3: Department Distribution Bar + Department Carousel ── */}
            <div className="charts-row-equal" style={{ marginBottom: 0 }}>
                {/* Department Distribution */}
                <div className="chart-card">
                    <div className="chart-card-header">
                        <div>
                            <div className="chart-card-title">Department Distribution</div>
                            <div className="chart-card-subtitle">Appointments per department</div>
                        </div>
                    </div>
                    <div style={{ height: 280 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={deptDistribution} layout="vertical" margin={{ left: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    tick={{ fontSize: 11, fill: '#6b7280' }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={110}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" name="Appointments" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={22} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Department Carousel */}
                <div className="chart-card">
                    <div className="chart-card-header">
                        <div>
                            <div className="chart-card-title">Departments</div>
                            <div className="chart-card-subtitle">{departments.length} active departments</div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button className="dept-carousel-btn" onClick={() => scrollCarousel(-1)} style={{ position: 'static', transform: 'none' }}>
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button className="dept-carousel-btn" onClick={() => scrollCarousel(1)} style={{ position: 'static', transform: 'none' }}>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="dept-carousel">
                        <div className="dept-carousel-viewport">
                            {departments.length > 0 ? departments.map((dept, i) => (
                                <div
                                    key={dept._id || i}
                                    className={`dept-card-slide ${i === carouselIndex ? 'active' : ''}`}
                                >
                                    <div className="flex items-center gap-2.5 mb-3">
                                        <div className="stat-card-icon violet" style={{ width: 34, height: 34, borderRadius: 9 }}>
                                            <Building2 className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="dept-card-name">{dept.name}</div>
                                            <div className="dept-card-fee">₹{dept.consultationFee || 0} consultation</div>
                                        </div>
                                    </div>
                                    <div className="dept-card-desc">
                                        {dept.description || 'No description available'}
                                    </div>
                                    <div className="dept-card-stats">
                                        <div className="dept-stat">
                                            <div className="dept-stat-val">{dept.doctorCount}</div>
                                            <div className="dept-stat-label">Doctors</div>
                                        </div>
                                        <div className="dept-stat">
                                            <div className="dept-stat-val">{dept.appointmentCount}</div>
                                            <div className="dept-stat-label">Appointments</div>
                                        </div>
                                        <div className="dept-stat">
                                            <div className="dept-stat-val">{dept.servicesCount}</div>
                                            <div className="dept-stat-label">Services</div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="dash-empty" style={{ width: '100%' }}>
                                    <Building2 className="w-8 h-8" />
                                    <p>No departments found</p>
                                </div>
                            )}
                        </div>
                        {/* Dot indicators */}
                        {departments.length > 1 && (
                            <div className="dept-carousel-dots">
                                {departments.map((_, i) => (
                                    <button
                                        key={i}
                                        className={`dept-dot ${i === carouselIndex ? 'active' : ''}`}
                                        onClick={() => {
                                            setCarouselIndex(i);
                                            if (carouselTimer.current) clearInterval(carouselTimer.current);
                                            carouselTimer.current = setInterval(() => {
                                                setCarouselIndex(prev => (prev + 1) % departments.length);
                                            }, 4000);
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Row 4: Recent Appointments + Activity Feed ── */}
            <div className="bottom-grid" style={{ marginTop: 18 }}>
                {/* Recent Appointments Table */}
                <div className="chart-card">
                    <div className="chart-card-header">
                        <div>
                            <div className="chart-card-title">Recent Appointments</div>
                            <div className="chart-card-subtitle">Latest {recentAppointments.length} appointments</div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-xs text-gray-400">Live</span>
                        </div>
                    </div>
                    <div className="dash-table-wrap">
                        <table className="dash-table">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Department</th>
                                    <th>Doctor</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Source</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentAppointments.length > 0 ? recentAppointments.map((apt) => (
                                    <tr key={apt._id}>
                                        <td>
                                            <div className="patient-cell">
                                                <div>
                                                    <div className="patient-info-name">{apt.patientName}</div>
                                                    <div className="patient-info-id">{apt.patientId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{apt.department}</td>
                                        <td>{apt.doctorName}</td>
                                        <td>
                                            <div>{new Date(apt.appointmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                                            <div className="text-[11px] text-gray-400">{apt.appointmentTime}</div>
                                        </td>
                                        <td>
                                            <span className={`status-pill ${apt.status?.toLowerCase()}`}>
                                                {apt.status}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="source-badge">{apt.source}</span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6}>
                                            <div className="dash-empty">
                                                <Calendar className="w-6 h-6" />
                                                <p>No recent appointments</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="chart-card">
                    <div className="chart-card-header">
                        <div>
                            <div className="chart-card-title">Activity Feed</div>
                            <div className="chart-card-subtitle">Recent system activity</div>
                        </div>
                        <Activity className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="activity-feed" style={{ maxHeight: 420, overflowY: 'auto' }}>
                        {activityFeed.length > 0 ? activityFeed.map((item, i) => {
                            const iconMap = {
                                appointment: Calendar,
                                bill: CircleDollarSign,
                                support: Headphones,
                                announcement: Megaphone,
                            };
                            const Icon = iconMap[item.type] || Activity;
                            return (
                                <div key={i} className="activity-item">
                                    <div className={`activity-icon ${item.type}`}>
                                        <Icon className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="activity-content">
                                        <div className="activity-title">{item.title}</div>
                                        <div className="activity-desc">{item.description}</div>
                                    </div>
                                    <div className="activity-time">{timeAgo(item.time)}</div>
                                </div>
                            );
                        }) : (
                            <div className="dash-empty">
                                <Activity className="w-6 h-6" />
                                <p>No recent activity</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
