import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        const message = error.response?.data?.message || 'An error occurred';
        return Promise.reject({ message, ...error.response?.data });
    }
);

// Appointment APIs
export const appointmentAPI = {
    // Create appointment
    createAppointment: (data) => api.post('/public-appointments', data),

    // Get available time slots
    getTimeSlots: (date, department) =>
        api.get(`/public-appointments/time-slots?date=${date}&department=${department || ''}`),

    // Get departments
    getDepartments: () => api.get('/departments'),

    // Lookup patient by mobile (for follow-up)
    lookupPatient: (mobile) => api.get(`/public-appointments/lookup-patient?mobile=${mobile}`),

    // Download appointment PDF
    downloadPDF: (appointmentId) => 
        `${API_BASE_URL}/public-appointments/${appointmentId}/download-pdf`,
};

// Template APIs (Admin)
export const templateAPI = {
    getAll: () => api.get('/appointment-templates'),
    getById: (id) => api.get(`/appointment-templates/${id}`),
    getDefault: () => api.get('/appointment-templates/default'),
    create: (data) => api.post('/appointment-templates', data),
    update: (id, data) => api.put(`/appointment-templates/${id}`, data),
    delete: (id) => api.delete(`/appointment-templates/${id}`),
    setDefault: (id) => api.patch(`/appointment-templates/${id}/set-default`),
    toggleStatus: (id) => api.patch(`/appointment-templates/${id}/toggle-status`),
    preview: (data) => api.post('/appointment-templates/preview', data),
};

// Verify CAPTCHA
export const verifyCaptcha = (token) => api.post('/verify-captcha', { token });

export default api;
