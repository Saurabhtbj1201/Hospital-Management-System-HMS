import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { doctorDashboardAPI } from '../services/api';
import {
    Calendar, CalendarCheck, CalendarClock, Users, UserCheck, TrendingUp, TrendingDown,
    CheckCircle2, XCircle, Clock, RefreshCw, CalendarDays, Building2,
    FileText, Heart, Stethoscope, Star, Quote, Activity, AlertCircle,
    Briefcase, GraduationCap, BadgeDollarSign, Award
} from 'lucide-react';
import {
    BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import './DoctorDashboard.css';

// Colors
const STATUS_COLORS = { Pending: '#f59e0b', Confirmed: '#3b82f6', Completed: '#22c55e', Cancelled: '#ef4444' };
const VISIT_COLORS = ['#6366f1', '#22c55e'];
const BAR_COLORS = { total: '#6366f1', completed: '#22c55e', cancelled: '#f87171' };

// Time ago
const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white px-3 py-2 border border-gray-200 rounded-lg shadow-lg text-xs">
            <p className="font-semibold text-gray-700 mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
                    {p.name}: <span className="font-semibold">{p.value}</span>
                </p>
            ))}
        </div>
    );
};

const DoctorDashboard = () => {
    const { user } = useAuth();

    // Data state
    const [stats, setStats] = useState(null);
    const [profile, setProfile] = useState(null);
    const [todayAppointments, setTodayAppointments] = useState([]);
    const [recentAppointments, setRecentAppointments] = useState([]);
    const [weeklyData, setWeeklyData] = useState([]);
    const [monthlyTrend, setMonthlyTrend] = useState([]);
    const [statusDist, setStatusDist] = useState([]);
    const [visitTypes, setVisitTypes] = useState([]);
    const [activity, setActivity] = useState([]);

    // UI state
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAll = useCallback(async () => {
        try {
            const [
                statsData,
                profileData,
                todayData,
                recentData,
                weeklyChart,
                monthlyChart,
                statusChart,
                visitChart,
                activityData,
            ] = await Promise.all([
                doctorDashboardAPI.getStats(),
                doctorDashboardAPI.getProfile(),
                doctorDashboardAPI.getTodayAppointments(),
                doctorDashboardAPI.getRecentAppointments(),
                doctorDashboardAPI.getChartData('weekly'),
                doctorDashboardAPI.getChartData('monthly-trend'),
                doctorDashboardAPI.getChartData('status-distribution'),
                doctorDashboardAPI.getChartData('visit-types'),
                doctorDashboardAPI.getActivity(),
            ]);

            setStats(statsData);
            setProfile(profileData);
            setTodayAppointments(todayData);
            setRecentAppointments(recentData);
            setWeeklyData(weeklyChart);
            setMonthlyTrend(monthlyChart);
            setStatusDist(statusChart);
            setVisitTypes(visitChart);
            setActivity(activityData);
        } catch (err) {
            console.error('Doctor dashboard fetch error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const handleRefresh = () => { setRefreshing(true); fetchAll(); };

    const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

    // Stat cards config
    const statCards = stats ? [
        { label: "Today's Appointments", value: stats.cards.todayAppointments, icon: Calendar, color: 'blue', sub: `${stats.cards.todayCompleted} completed, ${stats.cards.todayPending} pending` },
        { label: 'Upcoming', value: stats.cards.upcomingAppointments, icon: CalendarClock, color: 'violet' },
        { label: 'Completed', value: stats.cards.totalCompleted, icon: CheckCircle2, color: 'green', sub: `of ${stats.cards.totalAppointments} total` },
        { label: 'This Week', value: stats.cards.weekConsultations, icon: CalendarDays, color: 'cyan' },
        { label: 'This Month', value: stats.cards.monthConsultations, icon: TrendingUp, color: 'amber', change: stats.cards.monthChange },
        { label: 'My Patients', value: stats.cards.uniquePatients, icon: Users, color: 'emerald', sub: `${stats.cards.newPatients} new, ${stats.cards.followUpPatients} follow-up` },
        { label: 'Cancelled', value: stats.cards.totalCancelled, icon: XCircle, color: 'rose' },
    ] : [];

    // ── Skeleton Loading ──
    if (loading) {
        return (
            <div className="doc-dash">
                <div className="doc-dash-header">
                    <div>
                        <div className="doc-skeleton" style={{ width: 260, height: 24, marginBottom: 6 }} />
                        <div className="doc-skeleton" style={{ width: 180, height: 14 }} />
                    </div>
                </div>
                <div className="doc-stats-grid">
                    {[...Array(7)].map((_, i) => <div key={i} className="doc-skeleton doc-skeleton-card" />)}
                </div>
                <div className="doc-charts-row">
                    <div className="doc-skeleton doc-skeleton-chart" />
                    <div className="doc-skeleton doc-skeleton-chart" />
                </div>
                <div className="doc-charts-row-equal">
                    <div className="doc-skeleton doc-skeleton-chart" />
                    <div className="doc-skeleton doc-skeleton-chart" />
                </div>
                <div className="doc-dept-grid">
                    <div className="doc-skeleton doc-skeleton-web" />
                    <div className="doc-skeleton doc-skeleton-web" />
                </div>
                <div className="doc-web-preview">
                    {[...Array(4)].map((_, i) => <div key={i} className="doc-skeleton doc-skeleton-web" />)}
                </div>
                <div className="doc-bottom-grid">
                    <div className="doc-skeleton doc-skeleton-chart" />
                    <div className="doc-skeleton doc-skeleton-chart" />
                </div>
            </div>
        );
    }

    const allDepts = [
        ...(profile?.department ? [profile.department] : []),
        ...(profile?.departments || []).filter(d => d._id !== profile?.department?._id),
    ];

    return (
        <div className="doc-dash">
            {/* ── Header ── */}
            <div className="doc-dash-header">
                <div>
                    <h1>Welcome, Dr. {user?.name}</h1>
                    <p>Doctor Portal — Clinical & Appointment Overview</p>
                </div>
                <div className="doc-dash-header-actions">
                    <span className="doc-dash-date"><CalendarDays size={14} /> {today}</span>
                    <button className={`doc-dash-refresh ${refreshing ? 'spinning' : ''}`} onClick={handleRefresh} title="Refresh">
                        <RefreshCw size={15} />
                    </button>
                </div>
            </div>

            {/* ── Stat Cards ── */}
            <div className="doc-stats-grid">
                {statCards.map((c, i) => (
                    <div key={i} className={`doc-stat-card ${c.color}`}>
                        <div className="doc-stat-top">
                            <span className={`doc-stat-icon ${c.color}`}><c.icon size={18} /></span>
                            {c.change !== undefined && c.change !== 0 && (
                                <span className={`doc-stat-change ${c.change >= 0 ? 'up' : 'down'}`}>
                                    {c.change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                    {Math.abs(c.change)}%
                                </span>
                            )}
                        </div>
                        <div className="doc-stat-val">{c.value}</div>
                        <div className="doc-stat-label">{c.label}</div>
                        {c.sub && <div className="doc-stat-sub">{c.sub}</div>}
                    </div>
                ))}
            </div>

            {/* ── Charts: Weekly Bar + Status Donut ── */}
            <div className="doc-charts-row">
                <div className="doc-chart-card">
                    <div className="doc-chart-header">
                        <div>
                            <div className="doc-chart-title">Weekly Appointments</div>
                            <div className="doc-chart-subtitle">Last 7 days overview</div>
                        </div>
                    </div>
                    {weeklyData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={230}>
                            <BarChart data={weeklyData} barGap={2}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '0.72rem' }} />
                                <Bar dataKey="total" name="Total" fill={BAR_COLORS.total} radius={[3, 3, 0, 0]} barSize={18} />
                                <Bar dataKey="completed" name="Completed" fill={BAR_COLORS.completed} radius={[3, 3, 0, 0]} barSize={18} />
                                <Bar dataKey="cancelled" name="Cancelled" fill={BAR_COLORS.cancelled} radius={[3, 3, 0, 0]} barSize={18} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="doc-empty-state"><AlertCircle size={28} /><p>No data this week</p></div>
                    )}
                </div>

                <div className="doc-chart-card">
                    <div className="doc-chart-header">
                        <div>
                            <div className="doc-chart-title">Appointment Status</div>
                            <div className="doc-chart-subtitle">All-time distribution</div>
                        </div>
                    </div>
                    {statusDist.length > 0 && statusDist.some(d => d.value > 0) ? (
                        <>
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie
                                        data={statusDist}
                                        cx="50%" cy="50%"
                                        innerRadius={50} outerRadius={75}
                                        dataKey="value"
                                        paddingAngle={3}
                                        stroke="none"
                                    >
                                        {statusDist.map((entry, i) => (
                                            <Cell key={i} fill={STATUS_COLORS[entry.name] || '#d1d5db'} />
                                        ))}
                                    </Pie>
                                    <text x="50%" y="48%" textAnchor="middle" className="doc-gauge-center-text">
                                        {stats?.statusDistribution?.total || 0}
                                    </text>
                                    <text x="50%" y="58%" textAnchor="middle" className="doc-gauge-center-label">
                                        Total
                                    </text>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="doc-gauge-legend">
                                {statusDist.map((d, i) => (
                                    <span key={i} className="doc-gauge-legend-item">
                                        <span className="doc-gauge-legend-dot" style={{ background: STATUS_COLORS[d.name] }} />
                                        {d.name} ({d.value})
                                    </span>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="doc-empty-state"><AlertCircle size={28} /><p>No data yet</p></div>
                    )}
                </div>
            </div>

            {/* ── Charts: Monthly Trend + Visit Types ── */}
            <div className="doc-charts-row-equal">
                <div className="doc-chart-card">
                    <div className="doc-chart-header">
                        <div>
                            <div className="doc-chart-title">Monthly Trend</div>
                            <div className="doc-chart-subtitle">Last 6 months</div>
                        </div>
                    </div>
                    {monthlyTrend.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={monthlyTrend}>
                                <defs>
                                    <linearGradient id="docAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '0.72rem' }} />
                                <Area type="monotone" dataKey="total" name="Total" stroke="#6366f1" fill="url(#docAreaGrad)" strokeWidth={2} />
                                <Area type="monotone" dataKey="completed" name="Completed" stroke="#22c55e" fill="transparent" strokeWidth={2} strokeDasharray="4 4" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="doc-empty-state"><AlertCircle size={28} /><p>No monthly data</p></div>
                    )}
                </div>

                <div className="doc-chart-card">
                    <div className="doc-chart-header">
                        <div>
                            <div className="doc-chart-title">Visit Types</div>
                            <div className="doc-chart-subtitle">New vs Follow-up</div>
                        </div>
                    </div>
                    {visitTypes.length > 0 && visitTypes.some(d => d.value > 0) ? (
                        <>
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie
                                        data={visitTypes}
                                        cx="50%" cy="50%"
                                        innerRadius={50} outerRadius={75}
                                        dataKey="value"
                                        paddingAngle={4}
                                        stroke="none"
                                    >
                                        {visitTypes.map((_, i) => (
                                            <Cell key={i} fill={VISIT_COLORS[i % VISIT_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <text x="50%" y="48%" textAnchor="middle" className="doc-gauge-center-text">
                                        {visitTypes.reduce((sum, d) => sum + d.value, 0)}
                                    </text>
                                    <text x="50%" y="58%" textAnchor="middle" className="doc-gauge-center-label">
                                        Patients
                                    </text>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="doc-gauge-legend">
                                {visitTypes.map((d, i) => (
                                    <span key={i} className="doc-gauge-legend-item">
                                        <span className="doc-gauge-legend-dot" style={{ background: VISIT_COLORS[i % VISIT_COLORS.length] }} />
                                        {d.name} ({d.value})
                                    </span>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="doc-empty-state"><AlertCircle size={28} /><p>No data yet</p></div>
                    )}
                </div>
            </div>

            {/* ── Department Assigned + Profile Quick Info ── */}
            <div className="doc-dept-grid">
                <div className="doc-info-card">
                    <div className="doc-info-card-header">
                        <span className="doc-info-card-title">Departments Assigned</span>
                        <Building2 size={16} color="#6b7280" />
                    </div>
                    {allDepts.length > 0 ? (
                        <div className="doc-dept-list">
                            {allDepts.map((d, i) => (
                                <span key={i} className="doc-dept-tag">
                                    <Building2 size={13} />
                                    {d.name}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="doc-empty-text">No departments assigned yet</p>
                    )}
                </div>

                <div className="doc-info-card">
                    <div className="doc-info-card-header">
                        <span className="doc-info-card-title">Profile Summary</span>
                        <Stethoscope size={16} color="#6b7280" />
                    </div>
                    <div className="doc-profile-info">
                        <div className="doc-profile-item">
                            <span className="doc-profile-item-label">Qualification</span>
                            <span className="doc-profile-item-value">{profile?.qualifications || '—'}</span>
                        </div>
                        <div className="doc-profile-item">
                            <span className="doc-profile-item-label">Experience</span>
                            <span className="doc-profile-item-value">{profile?.experience ? `${profile.experience} yrs` : '—'}</span>
                        </div>
                        <div className="doc-profile-item">
                            <span className="doc-profile-item-label">Consultation Fee</span>
                            <span className="doc-profile-item-value">{profile?.fees ? `₹${profile.fees}` : '—'}</span>
                        </div>
                        <div className="doc-profile-item">
                            <span className="doc-profile-item-label">Council ID</span>
                            <span className="doc-profile-item-value">{profile?.medicalCouncilId || '—'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Public Website Content Preview ── */}
            <div style={{ marginBottom: '0.75rem' }}>
                <div className="doc-info-card-header" style={{ marginBottom: 8 }}>
                    <span className="doc-info-card-title" style={{ fontSize: '0.92rem' }}>Public Website Content Preview</span>
                </div>
            </div>
            <div className="doc-web-preview">
                {/* Short Bio */}
                <div className="doc-web-card">
                    <div className="doc-web-card-header">
                        <span className="doc-web-card-icon bio"><FileText size={14} /></span>
                        <span className="doc-web-card-title">Short Bio</span>
                    </div>
                    <div className="doc-web-card-body">
                        {profile?.shortBio ? <p>{profile.shortBio}</p> : <p className="doc-empty-text">No bio added yet</p>}
                    </div>
                </div>

                {/* Special Interests */}
                <div className="doc-web-card">
                    <div className="doc-web-card-header">
                        <span className="doc-web-card-icon interests"><Heart size={14} /></span>
                        <span className="doc-web-card-title">Special Interests</span>
                    </div>
                    <div className="doc-web-card-body">
                        {profile?.specialInterests?.length > 0 ? (
                            <div className="doc-tags-list">
                                {profile.specialInterests.map((s, i) => <span key={i} className="doc-tag">{s}</span>)}
                            </div>
                        ) : (
                            <p className="doc-empty-text">No special interests added</p>
                        )}
                    </div>
                </div>

                {/* Featured Treatments */}
                <div className="doc-web-card">
                    <div className="doc-web-card-header">
                        <span className="doc-web-card-icon treatments"><Award size={14} /></span>
                        <span className="doc-web-card-title">Featured Treatments</span>
                    </div>
                    <div className="doc-web-card-body">
                        {profile?.featuredTreatments?.length > 0 ? (
                            <div className="doc-tags-list">
                                {profile.featuredTreatments.map((t, i) => <span key={i} className="doc-tag">{t}</span>)}
                            </div>
                        ) : (
                            <p className="doc-empty-text">No treatments listed</p>
                        )}
                    </div>
                </div>

                {/* Patient Testimonials */}
                <div className="doc-web-card">
                    <div className="doc-web-card-header">
                        <span className="doc-web-card-icon testimonials"><Quote size={14} /></span>
                        <span className="doc-web-card-title">Patient Testimonials</span>
                    </div>
                    <div className="doc-web-card-body">
                        {profile?.patientTestimonials?.length > 0 ? (
                            profile.patientTestimonials.slice(0, 3).map((t, i) => (
                                <div key={i} className="doc-testimonial-item">
                                    <div className="doc-testimonial-name">{t.patientName || 'Anonymous'}</div>
                                    <div className="doc-testimonial-text">{t.testimonial}</div>
                                    <div className="doc-testimonial-stars">
                                        {[...Array(t.rating || 5)].map((_, j) => <Star key={j} size={11} fill="#f59e0b" />)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="doc-empty-text">No testimonials yet</p>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Today's Schedule + Activity ── */}
            <div className="doc-charts-row">
                <div className="doc-chart-card">
                    <div className="doc-chart-header">
                        <div>
                            <div className="doc-chart-title">Today's Schedule</div>
                            <div className="doc-chart-subtitle">{todayAppointments.length} appointment{todayAppointments.length !== 1 ? 's' : ''} today</div>
                        </div>
                    </div>
                    {todayAppointments.length > 0 ? (
                        <div>
                            {todayAppointments.map((apt, i) => (
                                <div key={i} className="doc-today-item">
                                    <span className="doc-today-time">{apt.appointmentTime}</span>
                                    <div className="doc-today-patient">
                                        <div className="doc-today-patient-name">{apt.patientName}</div>
                                        <div className="doc-today-patient-reason">{apt.reasonForVisit || apt.visitType}</div>
                                    </div>
                                    <span className={`doc-status-pill ${apt.status?.toLowerCase()}`}>{apt.status}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="doc-empty-state"><Calendar size={28} /><p>No appointments scheduled for today</p></div>
                    )}
                </div>

                <div className="doc-chart-card">
                    <div className="doc-chart-header">
                        <div>
                            <div className="doc-chart-title">My Activity</div>
                            <div className="doc-chart-subtitle">Recent updates</div>
                        </div>
                    </div>
                    {activity.length > 0 ? (
                        <div className="doc-activity-feed">
                            {activity.slice(0, 10).map((item, i) => (
                                <div key={i} className="doc-activity-item">
                                    <span className={`doc-activity-icon ${item.type}`}>
                                        {item.type === 'completed' && <CheckCircle2 size={14} />}
                                        {item.type === 'confirmed' && <CalendarCheck size={14} />}
                                        {item.type === 'cancelled' && <XCircle size={14} />}
                                        {item.type === 'appointment' && <Calendar size={14} />}
                                    </span>
                                    <div className="doc-activity-content">
                                        <div className="doc-activity-title">{item.title}</div>
                                        <div className="doc-activity-desc">{item.description}</div>
                                    </div>
                                    <span className="doc-activity-time">{timeAgo(item.time)}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="doc-empty-state"><Activity size={28} /><p>No recent activity</p></div>
                    )}
                </div>
            </div>

            {/* ── Recent Appointments Table ── */}
            <div className="doc-chart-card">
                <div className="doc-chart-header">
                    <div>
                        <div className="doc-chart-title">Recent Appointments</div>
                        <div className="doc-chart-subtitle">Your last {recentAppointments.length} appointments</div>
                    </div>
                </div>
                {recentAppointments.length > 0 ? (
                    <div className="doc-table-wrap">
                        <table className="doc-table">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Visit Type</th>
                                    <th>Department</th>
                                    <th>Status</th>
                                    <th>Reason</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentAppointments.map((apt, i) => {
                                    const initials = apt.patientName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
                                    return (
                                        <tr key={i}>
                                            <td>
                                                <div className="doc-patient-cell">
                                                    <span className="doc-patient-avatar">{initials}</span>
                                                    <div>
                                                        <div className="doc-patient-name">{apt.patientName}</div>
                                                        <div className="doc-patient-id">{apt.patientId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}</td>
                                            <td>{apt.appointmentTime || '—'}</td>
                                            <td>
                                                <span className={`doc-visit-badge ${apt.visitType === 'Follow-up' ? 'followup' : 'new'}`}>
                                                    {apt.visitType || '—'}
                                                </span>
                                            </td>
                                            <td>{apt.department || '—'}</td>
                                            <td>
                                                <span className={`doc-status-pill ${apt.status?.toLowerCase()}`}>{apt.status}</span>
                                            </td>
                                            <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}>{apt.reasonForVisit || '—'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="doc-empty-state"><Calendar size={28} /><p>No appointments found</p></div>
                )}
            </div>
        </div>
    );
};

export default DoctorDashboard;
