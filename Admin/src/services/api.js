import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        if (error.response) {
            // Handle specific error codes
            switch (error.response.status) {
                case 401:
                    // Unauthorized - redirect to login
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                    break;
                case 403:
                    // Forbidden
                    console.error('Access forbidden');
                    break;
                case 404:
                    // Not found
                    console.error('Resource not found');
                    break;
                case 500:
                    // Server error
                    console.error('Server error');
                    break;
                default:
                    console.error('An error occurred');
            }
        }
        return Promise.reject(error);
    }
);

// API Methods

// Authentication
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    logout: () => api.post('/auth/logout'),
    register: (userData) => api.post('/auth/register', userData),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

// Users
export const usersAPI = {
    getAll: (params) => api.get('/users', { params }),
    getById: (id) => api.get(`/users/${id}`),
    create: (userData) => api.post('/users', userData),
    update: (id, userData) => api.put(`/users/${id}`, userData),
    delete: (id) => api.delete(`/users/${id}`),
};

// Doctors
export const doctorsAPI = {
    getAll: (params) => api.get('/doctors', { params }),
    getById: (id) => api.get(`/doctors/${id}`),
    create: (doctorData) => api.post('/doctors', doctorData),
    update: (id, doctorData) => api.put(`/doctors/${id}`, doctorData),
    delete: (id) => api.delete(`/doctors/${id}`),
    getSchedule: (id) => api.get(`/doctors/${id}/schedule`),
    updateSchedule: (id, schedule) => api.put(`/doctors/${id}/schedule`, schedule),
};

// Departments
export const departmentsAPI = {
    getAll: (params) => api.get('/departments', { params }),
    getById: (id) => api.get(`/departments/${id}`),
    create: (deptData) => api.post('/departments', deptData),
    update: (id, deptData) => api.put(`/departments/${id}`, deptData),
    delete: (id) => api.delete(`/departments/${id}`),
    uploadImage: (id, formData) => api.post(`/departments/${id}/upload-image`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    deleteImage: (id) => api.delete(`/departments/${id}/image`),
};

// Appointments
export const appointmentsAPI = {
    getAll: (params) => api.get('/admin/appointments', { params }),
    getById: (id) => api.get(`/admin/appointments/${id}`),
    create: (appointmentData) => api.post('/appointments', appointmentData),
    update: (id, appointmentData) => api.put(`/admin/appointments/${id}`, appointmentData),
    updateStatus: (id, status, reason) => api.patch(`/admin/appointments/${id}/status`, { status, reason }),
    assignDoctor: (id, doctorId) => api.patch(`/admin/appointments/${id}/assign-doctor`, { doctorId }),
    getStats: () => api.get('/admin/appointments/stats'),
    delete: (id) => api.delete(`/appointments/${id}`),
    confirm: (id) => api.patch(`/appointments/${id}/confirm`),
    cancel: (id) => api.patch(`/appointments/${id}/cancel`),
    complete: (id) => api.patch(`/appointments/${id}/complete`),
    // Doctor-specific
    getMyAppointments: (params) => api.get('/admin/appointments/my-appointments', { params }),
    doctorComplete: (id) => api.patch(`/admin/appointments/${id}/doctor-complete`),
    doctorRemove: (id, reason) => api.patch(`/admin/appointments/${id}/doctor-remove`, { reason }),
};

// Patients
export const patientsAPI = {
    getAll: (params) => api.get('/patients/public-appointments/list', { params }),
    getById: (patientId) => api.get(`/patients/public-appointments/${patientId}`),
    create: (patientData) => api.post('/patients', patientData),
    update: (id, patientData) => api.put(`/patients/${id}`, patientData),
    updateMedicalInfo: (patientId, medicalData) => api.put(`/patients/public-appointments/${patientId}/medical`, medicalData),
    delete: (id) => api.delete(`/patients/${id}`),
    getHistory: (id) => api.get(`/patients/${id}/history`),
};

// Billing
export const billingAPI = {
    getAppointmentsBilling: (params) => api.get('/bills/appointments-billing', { params }),
    getDoctorFee: (appointmentId) => api.get(`/bills/doctor-fee/${appointmentId}`),
    generateInvoice: (appointmentId, data) => api.post(`/bills/generate/${appointmentId}`, data),
    getBillById: (id) => api.get(`/bills/${id}`),
    updateBill: (id, data) => api.put(`/bills/${id}`, data),
};

// Dashboard
export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),
    getRecentAppointments: () => api.get('/dashboard/appointments'),
    getChartData: (type) => api.get(`/dashboard/charts/${type}`),
    getActivityFeed: () => api.get('/dashboard/activity'),
};

// Settings
export const settingsAPI = {
    get: () => api.get('/settings'),
    update: (settings) => api.put('/settings', settings),
};

// Profile
export const profileAPI = {
    getMyProfile: () => api.get('/profile/me'),
    updateMyProfile: (data) => api.put('/profile/me', data),
    changePassword: (data) => api.put('/profile/change-password', data),
    uploadPhoto: (formData) => api.post('/profile/upload-photo', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    uploadSignature: (formData) => api.post('/profile/upload-signature', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    uploadIdDocument: (formData) => api.post('/profile/upload-id-document', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    deletePhoto: () => api.delete('/profile/photo'),
    deleteSignature: () => api.delete('/profile/signature'),
    deleteIdDocument: () => api.delete('/profile/id-document'),
    updatePublicWebsite: (data) => api.put('/profile/public-website', data),
};

// Slot Config — Receptionist
export const slotConfigAPI = {
    getMyConfig: () => api.get('/slot-config/my-config'),
    updateWorkingDays: (data) => api.put('/slot-config/working-days', data),
    updateBookingRules: (data) => api.put('/slot-config/booking-rules', data),
    upsertDateOverride: (data) => api.post('/slot-config/date-override', data),
    removeDateOverride: (id) => api.delete(`/slot-config/date-override/${id}`),
};

// Slot Config — Admin
export const slotDefaultsAPI = {
    getDefaults: () => api.get('/slot-config/defaults'),
    updateDefaults: (data) => api.put('/slot-config/defaults', data),
    getAllConfigs: () => api.get('/slot-config/all'),
    getConfigById: (id) => api.get(`/slot-config/${id}`),
    updateConfigById: (id, data) => api.put(`/slot-config/${id}`, data),
};

// Invoice Template
export const invoiceTemplateAPI = {
    get: () => api.get('/invoice-template'),
    update: (data) => api.put('/invoice-template', data),
    uploadLogo: (formData) => api.post('/invoice-template/upload-logo', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    deleteLogo: () => api.delete('/invoice-template/logo'),
};

export default api;
