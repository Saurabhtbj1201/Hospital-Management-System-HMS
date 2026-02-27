const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/user-management', require('./routes/userManagementRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/bills', require('./routes/billRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/support', require('./routes/supportRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/site-updates', require('./routes/siteUpdateRoutes'));
app.use('/api/public-appointments', require('./routes/publicAppointmentRoutes'));
app.use('/api/admin/appointments', require('./routes/adminAppointmentRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/slot-config', require('./routes/slotConfigRoutes'));
app.use('/api/invoice-template', require('./routes/invoiceTemplateRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

module.exports = app;
