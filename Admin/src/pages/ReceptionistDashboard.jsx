import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../services/api';
import {
    Calendar, Users, Stethoscope, IndianRupee, UserPlus,
    FileWarning, TrendingUp, TrendingDown, RefreshCw, CalendarDays,
    Activity, AlertCircle,
    CircleDollarSign, Headphones, Megaphone
} from 'lucide-react';
import {
    BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import './ReceptionistDashboard.css';

/* ── Helpers ── */
const PIE_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'];
const BAR_COLORS = { total: '#6366f1', completed: '#22c55e', cancelled: '#f87171' };

const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const formatCurrency = (val) => {
    if (!val) return '₹0';
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val.toLocaleString('en-IN')}`;
};

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rd-tooltip">
            <p className="rd-tooltip-label">{label}</p>
            {payload.map((p, i) => (
                <p key={i} className="rd-tooltip-row" style={{ color: p.color }}>
                    <span className="rd-tooltip-dot" style={{ background: p.color }} />
                    {p.name}: <strong>{typeof p.value === 'number' && p.value > 999 ? `₹${p.value.toLocaleString('en-IN')}` : p.value}</strong>
                </p>
            ))}
        </div>
    );
};

/* ══════════════════════════════════════════════════════════
   Receptionist Dashboard
   ══════════════════════════════════════════════════════════ */
const ReceptionistDashboard = () => {
    const { user } = useAuth();

    /* ── data ── */
    const [stats, setStats] = useState(null);
    const [recentAppointments, setRecentAppointments] = useState([]);
    const [activityFeed, setActivityFeed] = useState([]);
    const [monthlyAppointments, setMonthlyAppointments] = useState([]);
    const [dailyAppointments, setDailyAppointments] = useState([]);
    const [appointmentSources, setAppointmentSources] = useState([]);

    /* ── ui ── */
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [chartTab, setChartTab] = useState('7d');

    /* ── fetch ── */
    const fetchAll = useCallback(async () => {
        try {
            const [
                statsRes, aptsRes, actRes,
                monthlyAptRes, dailyRes, srcRes
            ] = await Promise.all([
                dashboardAPI.getStats(),
                dashboardAPI.getRecentAppointments(),
                dashboardAPI.getActivityFeed(),
                dashboardAPI.getChartData('monthly-appointments'),
                dashboardAPI.getChartData('daily-appointments'),
                dashboardAPI.getChartData('appointment-sources'),
            ]);
            setStats(statsRes);
            setRecentAppointments(aptsRes);
            setActivityFeed(actRes);
            setMonthlyAppointments(monthlyAptRes);
            setDailyAppointments(dailyRes);
            setAppointmentSources(srcRes);
        } catch (err) {
            console.error('Dashboard fetch error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const handleRefresh = () => { setRefreshing(true); fetchAll(); };

    /* ── stat cards ── */
    const statCards = stats ? [
        {
            label: "Today's Appointments",
            value: stats.cards.todayAppointments.value,
            sub: `${stats.cards.todayAppointments.total?.toLocaleString() || 0} total`,
            icon: Calendar, color: 'violet',
        },
        {
            label: 'Total Patients',
            value: stats.cards.totalPatients.value,
            change: stats.cards.totalPatients.change,
            sub: 'All registrations',
            icon: Users, color: 'blue',
        },
        {
            label: 'Active Doctors',
            value: stats.cards.totalDoctors.value,
            sub: `${stats.cards.totalDoctors.departments} depts`,
            icon: Stethoscope, color: 'emerald',
        },
        {
            label: 'New Patients',
            value: stats.cards.newPatients.value,
            change: stats.cards.newPatients.change,
            sub: 'This month',
            icon: UserPlus, color: 'cyan',
        },
        {
            label: 'Monthly Revenue',
            value: formatCurrency(stats.cards.monthRevenue.value),
            change: stats.cards.monthRevenue.change,
            sub: `${formatCurrency(stats.cards.monthRevenue.totalRevenue)} total`,
            icon: IndianRupee, color: 'amber',
        },
        {
            label: 'Pending Bills',
            value: stats.cards.pendingBills.value,
            sub: 'Awaiting payment',
            icon: FileWarning, color: 'rose',
        },
    ] : [];

    /* pie */
    const statusPieData = stats ? [
        { name: 'Completed', value: stats.appointmentStatus.completed },
        { name: 'Confirmed', value: stats.appointmentStatus.confirmed },
        { name: 'Pending', value: stats.appointmentStatus.pending },
        { name: 'Cancelled', value: stats.appointmentStatus.cancelled },
    ].filter(d => d.value > 0) : [];

    const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    /* ════════════ SKELETON ════════════ */
    if (loading) {
        return (
            <div className="rd">
                <div className="rd-header">
                    <div>
                        <div className="rd-sk" style={{ width: 260, height: 24, marginBottom: 6 }} />
                        <div className="rd-sk" style={{ width: 180, height: 14 }} />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <div className="rd-sk" style={{ width: 180, height: 34 }} />
                        <div className="rd-sk" style={{ width: 90, height: 34 }} />
                    </div>
                </div>
                <div className="rd-stats">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="rd-sk rd-sk-card" />
                    ))}
                </div>
                <div className="rd-row-3">
                    <div className="rd-sk rd-sk-chart" />
                    <div className="rd-sk rd-sk-chart" />
                    <div className="rd-sk rd-sk-chart" />
                </div>
                <div className="rd-row-2-1">
                    <div className="rd-sk rd-sk-chart" style={{ height: 320 }} />
                    <div className="rd-sk rd-sk-chart" style={{ height: 320 }} />
                </div>
            </div>
        );
    }

    /* ════════════ MAIN ════════════ */
    return (
        <div className="rd">
            {/* ── Header ── */}
            <div className="rd-header">
                <div>
                    <h1 className="rd-title">Welcome back, {user?.name?.split(' ')[0] || 'Receptionist'}</h1>
                    <p className="rd-subtitle">Manage appointments, billing & patient operations</p>
                </div>
                <div className="rd-header-actions">
                    <span className="rd-date-badge">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {today}
                    </span>
                    <button onClick={handleRefresh} disabled={refreshing} className="rd-btn-refresh">
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'rd-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* ── Stat Cards ── */}
            <div className="rd-stats">
                {statCards.map((c, i) => {
                    const Icon = c.icon;
                    return (
                        <div key={i} className={`rd-stat ${c.color}`}>
                            <div className="rd-stat-top">
                                <div className={`rd-stat-icon ${c.color}`}><Icon className="w-[18px] h-[18px]" /></div>
                                {c.change !== undefined && (
                                    <span className={`rd-stat-change ${c.change >= 0 ? 'up' : 'down'}`}>
                                        {c.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                        {Math.abs(c.change)}%
                                    </span>
                                )}
                            </div>
                            <div className="rd-stat-val">{typeof c.value === 'number' ? c.value.toLocaleString() : c.value}</div>
                            <div className="rd-stat-label">{c.label}</div>
                            {c.sub && <div className="rd-stat-sub">{c.sub}</div>}
                        </div>
                    );
                })}
            </div>

            {/* ── Row 1: Appointments Overview + Status + Sources ── */}
            <div className="rd-row-3">
                <div className="rd-card">
                    <div className="rd-card-head">
                        <div>
                            <div className="rd-card-title">Appointments Overview</div>
                            <div className="rd-card-sub">Trend analysis</div>
                        </div>
                        <div className="rd-tabs">
                            {['7d', '12m'].map(t => (
                                <button key={t} className={`rd-tab ${chartTab === t ? 'active' : ''}`} onClick={() => setChartTab(t)}>
                                    {t === '7d' ? '7 days' : '12 months'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div style={{ height: 270 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            {chartTab === '12m' ? (
                                <BarChart data={monthlyAppointments} barGap={2}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
                                    <Bar dataKey="total" name="Total" fill={BAR_COLORS.total} radius={[3, 3, 0, 0]} />
                                    <Bar dataKey="completed" name="Completed" fill={BAR_COLORS.completed} radius={[3, 3, 0, 0]} />
                                    <Bar dataKey="cancelled" name="Cancelled" fill={BAR_COLORS.cancelled} radius={[3, 3, 0, 0]} />
                                </BarChart>
                            ) : (
                                <BarChart data={dailyAppointments}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="value" name="Appointments" fill="#6366f1" radius={[3, 3, 0, 0]} />
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Pie */}
                <div className="rd-card">
                    <div className="rd-card-head">
                        <div>
                            <div className="rd-card-title">Appointment Status</div>
                            <div className="rd-card-sub">Overall distribution</div>
                        </div>
                    </div>
                    {statusPieData.length > 0 ? (
                        <>
                            <div style={{ height: 200 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={3} dataKey="value" strokeWidth={0}>
                                            {statusPieData.map((_, idx) => (
                                                <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(val, name) => [`${val}`, name]} contentStyle={{ fontSize: 12, borderRadius: 4, border: '1px solid #e5e7eb' }} />
                                        <text x="50%" y="46%" textAnchor="middle" className="rd-pie-center-val">{stats?.appointmentStatus.total || 0}</text>
                                        <text x="50%" y="56%" textAnchor="middle" className="rd-pie-center-label">Total</text>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="rd-legend">
                                {statusPieData.map((d, i) => (
                                    <div key={i} className="rd-legend-item">
                                        <span className="rd-legend-dot" style={{ background: PIE_COLORS[i] }} />
                                        <span>{d.name}</span>
                                        <strong>{d.value}</strong>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="rd-empty"><AlertCircle className="w-7 h-7" /><p>No data</p></div>
                    )}
                </div>

                {/* Sources */}
                <div className="rd-card">
                    <div className="rd-card-head">
                        <div>
                            <div className="rd-card-title">Appointment Sources</div>
                            <div className="rd-card-sub">Where patients come from</div>
                        </div>
                    </div>
                    {appointmentSources.length > 0 ? (
                        <>
                            <div style={{ height: 200 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={appointmentSources} cx="50%" cy="50%" outerRadius={78} dataKey="value" strokeWidth={2} stroke="#fff">
                                            {appointmentSources.map((_, i) => (
                                                <Cell key={i} fill={['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(val, name) => [`${val}`, name]} contentStyle={{ fontSize: 12, borderRadius: 4, border: '1px solid #e5e7eb' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="rd-legend">
                                {appointmentSources.map((d, i) => (
                                    <div key={i} className="rd-legend-item">
                                        <span className="rd-legend-dot" style={{ background: ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5] }} />
                                        <span>{d.name}</span>
                                        <strong>{d.value}</strong>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="rd-empty"><AlertCircle className="w-7 h-7" /><p>No source data</p></div>
                    )}
                </div>
            </div>

            {/* ── Row 2: Recent Appointments Table + Activity Feed ── */}
            <div className="rd-row-2-1">
                <div className="rd-card">
                    <div className="rd-card-head">
                        <div>
                            <div className="rd-card-title">Recent Appointments</div>
                            <div className="rd-card-sub">Latest {recentAppointments.length} records</div>
                        </div>
                        <div className="rd-live-badge"><Calendar className="w-3 h-3" /> Live</div>
                    </div>
                    <div className="rd-table-wrap">
                        <table className="rd-table">
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
                                {recentAppointments.length > 0 ? recentAppointments.map(apt => (
                                    <tr key={apt._id}>
                                        <td>
                                            <div className="rd-patient-cell">
                                                <div className="rd-patient-name">{apt.patientName}</div>
                                                <div className="rd-patient-id">{apt.patientId}</div>
                                            </div>
                                        </td>
                                        <td>{apt.department}</td>
                                        <td>{apt.doctorName}</td>
                                        <td>
                                            <div>{new Date(apt.appointmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                                            <div className="rd-time-sub">{apt.appointmentTime}</div>
                                        </td>
                                        <td><span className={`rd-pill ${apt.status?.toLowerCase()}`}>{apt.status}</span></td>
                                        <td><span className="rd-source">{apt.source}</span></td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={6}><div className="rd-empty"><Calendar className="w-6 h-6" /><p>No recent appointments</p></div></td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="rd-card">
                    <div className="rd-card-head">
                        <div>
                            <div className="rd-card-title">Activity Feed</div>
                            <div className="rd-card-sub">Recent system activity</div>
                        </div>
                        <Activity className="w-4 h-4" style={{ color: '#9ca3af' }} />
                    </div>
                    <div className="rd-feed" style={{ maxHeight: 600, overflowY: 'auto' }}>
                        {activityFeed.length > 0 ? activityFeed.map((item, i) => {
                            const iconMap = { appointment: Calendar, bill: CircleDollarSign, support: Headphones, announcement: Megaphone };
                            const FeedIcon = iconMap[item.type] || Activity;
                            return (
                                <div key={i} className="rd-feed-item">
                                    <div className={`rd-feed-icon ${item.type}`}><FeedIcon className="w-3.5 h-3.5" /></div>
                                    <div className="rd-feed-body">
                                        <div className="rd-feed-title">{item.title}</div>
                                        <div className="rd-feed-desc">{item.description}</div>
                                    </div>
                                    <div className="rd-feed-time">{timeAgo(item.time)}</div>
                                </div>
                            );
                        }) : (
                            <div className="rd-empty"><Activity className="w-6 h-6" /><p>No recent activity</p></div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceptionistDashboard;
