import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    FaCalendarCheck,
    FaUserInjured,
    FaFileAlt,
    FaClock,
    FaCheckCircle,
    FaHourglassHalf,
    FaChartLine,
    FaStethoscope
} from 'react-icons/fa';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
    const { user } = useAuth();
    const [stats] = useState({
        todayAppointments: 12,
        upcomingAppointments: 18,
        pendingReports: 5,
        completedToday: 8
    });

    const [todayAppointments] = useState([
        {
            id: 1,
            time: '09:00 AM',
            patient: 'John Doe',
            age: 45,
            type: 'Follow-up',
            status: 'Completed',
            complaint: 'Chest pain follow-up'
        },
        {
            id: 2,
            time: '10:00 AM',
            patient: 'Jane Smith',
            age: 32,
            type: 'New Consultation',
            status: 'In Progress',
            complaint: 'Persistent headache'
        },
        {
            id: 3,
            time: '11:00 AM',
            patient: 'Mike Wilson',
            age: 58,
            type: 'Regular Checkup',
            status: 'Scheduled',
            complaint: 'Annual health checkup'
        },
        {
            id: 4,
            time: '02:00 PM',
            patient: 'Sarah Davis',
            age: 28,
            type: 'Emergency',
            status: 'Scheduled',
            complaint: 'Severe abdominal pain'
        },
    ]);

    const [upcomingSchedule] = useState([
        { date: 'Tomorrow', count: 10, time: '9:00 AM - 5:00 PM' },
        { date: 'Feb 1', count: 8, time: '9:00 AM - 3:00 PM' },
        { date: 'Feb 2', count: 12, time: '9:00 AM - 6:00 PM' },
    ]);

    return (
        <div className="doctor-dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>Welcome, Dr. {user?.name}!</h1>
                    <p className="dashboard-subtitle">Doctor Portal - Clinical and Appointment Management</p>
                </div>
                <div className="header-actions">
                    <button className="btn-outline">
                        <FaStethoscope /> Start Consultation
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card stat-blue">
                    <div className="stat-icon">
                        <FaCalendarCheck />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.todayAppointments}</h3>
                        <p>Today's Appointments</p>
                    </div>
                </div>

                <div className="stat-card stat-purple">
                    <div className="stat-icon">
                        <FaClock />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.upcomingAppointments}</h3>
                        <p>Upcoming Schedule</p>
                    </div>
                </div>

                <div className="stat-card stat-orange">
                    <div className="stat-icon">
                        <FaFileAlt />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.pendingReports}</h3>
                        <p>Pending Reports</p>
                    </div>
                </div>

                <div className="stat-card stat-green">
                    <div className="stat-icon">
                        <FaCheckCircle />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.completedToday}</h3>
                        <p>Completed Today</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="dashboard-content">
                {/* Today's Appointments */}
                <div className="content-card appointments-card">
                    <div className="card-header">
                        <h2>Today's Appointments</h2>
                        <button className="btn-secondary">View All</button>
                    </div>
                    <div className="appointments-list">
                        {todayAppointments.map(appointment => (
                            <div key={appointment.id} className="appointment-item">
                                <div className="appointment-time-badge">
                                    <FaClock />
                                    <span>{appointment.time}</span>
                                </div>
                                <div className="appointment-info">
                                    <div className="patient-info">
                                        <h4>{appointment.patient}</h4>
                                        <span className="patient-meta">{appointment.age} years • {appointment.type}</span>
                                    </div>
                                    <p className="complaint">{appointment.complaint}</p>
                                </div>
                                <div className={`status-badge status-${appointment.status.toLowerCase().replace(' ', '-')}`}>
                                    {appointment.status === 'Completed' && <FaCheckCircle />}
                                    {appointment.status === 'In Progress' && <FaHourglassHalf />}
                                    {appointment.status === 'Scheduled' && <FaClock />}
                                    {appointment.status}
                                </div>
                                <div className="appointment-actions">
                                    <button className="btn-action btn-view">View History</button>
                                    {appointment.status !== 'Completed' && (
                                        <button className="btn-action btn-start">Start Consultation</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="sidebar-content">
                    {/* Upcoming Schedule */}
                    <div className="content-card">
                        <div className="card-header">
                            <h2>Upcoming Schedule</h2>
                        </div>
                        <div className="schedule-list">
                            {upcomingSchedule.map((schedule, index) => (
                                <div key={index} className="schedule-item">
                                    <div className="schedule-date">
                                        <strong>{schedule.date}</strong>
                                        <span>{schedule.time}</span>
                                    </div>
                                    <div className="schedule-count">
                                        <span className="count-badge">{schedule.count}</span>
                                        <span className="count-label">appointments</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="content-card">
                        <div className="card-header">
                            <h2>This Week</h2>
                        </div>
                        <div className="quick-stats">
                            <div className="quick-stat-item">
                                <FaChartLine className="stat-icon-small" />
                                <div>
                                    <h4>42</h4>
                                    <p>Total Consultations</p>
                                </div>
                            </div>
                            <div className="quick-stat-item">
                                <FaUserInjured className="stat-icon-small" />
                                <div>
                                    <h4>38</h4>
                                    <p>Unique Patients</p>
                                </div>
                            </div>
                            <div className="quick-stat-item">
                                <FaFileAlt className="stat-icon-small" />
                                <div>
                                    <h4>15</h4>
                                    <p>Reports Generated</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pending Reports */}
                    <div className="content-card">
                        <div className="card-header">
                            <h2>Pending Reports</h2>
                        </div>
                        <div className="pending-reports">
                            <div className="report-item">
                                <div>
                                    <h4>Robert Taylor</h4>
                                    <p>Blood Test Results</p>
                                </div>
                                <button className="btn-small">Review</button>
                            </div>
                            <div className="report-item">
                                <div>
                                    <h4>Emily Brown</h4>
                                    <p>X-Ray Analysis</p>
                                </div>
                                <button className="btn-small">Review</button>
                            </div>
                            <div className="report-item">
                                <div>
                                    <h4>Michael Chen</h4>
                                    <p>ECG Report</p>
                                </div>
                                <button className="btn-small">Review</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;
