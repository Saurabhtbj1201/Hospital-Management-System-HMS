import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    FaCalendarAlt,
    FaUserInjured,
    FaMoneyBillWave,
    FaUserMd,
    FaClock,
    FaCheckCircle,
    FaExclamationCircle,
    FaPlus
} from 'react-icons/fa';
import './ReceptionistDashboard.css';

const ReceptionistDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        todayAppointments: 24,
        pendingConfirmations: 8,
        billingAlerts: 3,
        availableDoctors: 12
    });

    const [todayAppointments] = useState([
        { id: 1, time: '09:00 AM', patient: 'John Doe', doctor: 'Dr. Smith', department: 'Cardiology', status: 'Confirmed' },
        { id: 2, time: '10:30 AM', patient: 'Jane Smith', doctor: 'Dr. Johnson', department: 'Neurology', status: 'Pending' },
        { id: 3, time: '11:00 AM', patient: 'Mike Wilson', doctor: 'Dr. Brown', department: 'Orthopedics', status: 'Confirmed' },
        { id: 4, time: '02:00 PM', patient: 'Sarah Davis', doctor: 'Dr. Lee', department: 'Pediatrics', status: 'Pending' },
    ]);

    return (
        <div className="receptionist-dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>Welcome back, {user?.name}!</h1>
                    <p className="dashboard-subtitle">Receptionist Portal - Manage appointments and billing</p>
                </div>
                <button className="btn-primary">
                    <FaPlus /> New Appointment
                </button>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card stat-primary">
                    <div className="stat-icon">
                        <FaCalendarAlt />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.todayAppointments}</h3>
                        <p>Today's Appointments</p>
                    </div>
                </div>

                <div className="stat-card stat-warning">
                    <div className="stat-icon">
                        <FaClock />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.pendingConfirmations}</h3>
                        <p>Pending Confirmations</p>
                    </div>
                </div>

                <div className="stat-card stat-danger">
                    <div className="stat-icon">
                        <FaMoneyBillWave />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.billingAlerts}</h3>
                        <p>Billing Alerts</p>
                    </div>
                </div>

                <div className="stat-card stat-success">
                    <div className="stat-icon">
                        <FaUserMd />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.availableDoctors}</h3>
                        <p>Available Doctors</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="dashboard-content">
                {/* Today's Appointments */}
                <div className="content-card">
                    <div className="card-header">
                        <h2>Today's Appointments</h2>
                        <button className="btn-secondary">View All</button>
                    </div>
                    <div className="appointments-list">
                        {todayAppointments.map(appointment => (
                            <div key={appointment.id} className="appointment-item">
                                <div className="appointment-time">
                                    <FaClock />
                                    <span>{appointment.time}</span>
                                </div>
                                <div className="appointment-details">
                                    <h4>{appointment.patient}</h4>
                                    <p>{appointment.doctor} • {appointment.department}</p>
                                </div>
                                <div className={`appointment-status status-${appointment.status.toLowerCase()}`}>
                                    {appointment.status === 'Confirmed' ? <FaCheckCircle /> : <FaExclamationCircle />}
                                    {appointment.status}
                                </div>
                                <div className="appointment-actions">
                                    <button className="btn-icon" title="Confirm">
                                        <FaCheckCircle />
                                    </button>
                                    <button className="btn-icon" title="Edit">
                                        <FaCalendarAlt />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="content-card">
                    <div className="card-header">
                        <h2>Quick Actions</h2>
                    </div>
                    <div className="quick-actions">
                        <button className="action-btn">
                            <FaUserInjured />
                            <span>Register Walk-in Patient</span>
                        </button>
                        <button className="action-btn">
                            <FaCalendarAlt />
                            <span>Create Appointment</span>
                        </button>
                        <button className="action-btn">
                            <FaMoneyBillWave />
                            <span>Generate Bill</span>
                        </button>
                        <button className="action-btn">
                            <FaUserMd />
                            <span>View Doctor Availability</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Pending Confirmations & Billing Alerts */}
            <div className="dashboard-grid">
                <div className="content-card">
                    <div className="card-header">
                        <h2>Pending Confirmations</h2>
                    </div>
                    <div className="pending-list">
                        <div className="pending-item">
                            <div>
                                <h4>Emily Brown</h4>
                                <p>Dermatology - Dr. Williams</p>
                            </div>
                            <button className="btn-confirm">Confirm</button>
                        </div>
                        <div className="pending-item">
                            <div>
                                <h4>Robert Taylor</h4>
                                <p>General Medicine - Dr. Anderson</p>
                            </div>
                            <button className="btn-confirm">Confirm</button>
                        </div>
                    </div>
                </div>

                <div className="content-card">
                    <div className="card-header">
                        <h2>Billing Alerts</h2>
                    </div>
                    <div className="billing-alerts">
                        <div className="alert-item alert-warning">
                            <FaExclamationCircle />
                            <div>
                                <h4>Pending Payment</h4>
                                <p>Invoice #1234 - $250.00</p>
                            </div>
                        </div>
                        <div className="alert-item alert-danger">
                            <FaExclamationCircle />
                            <div>
                                <h4>Overdue Payment</h4>
                                <p>Invoice #1189 - $180.00</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceptionistDashboard;
