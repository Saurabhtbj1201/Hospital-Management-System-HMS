# Hospital Management System - Role-Based Login

A comprehensive Hospital Management System with role-based authentication and separate dashboards for Admin, Receptionist, and Doctor roles.

## Features

### Authentication
- **Login by Email or Phone Number** - Users can log in using either their email address or phone number
- **Role-Based Access Control** - Automatic redirection to appropriate dashboard based on user role
- **Protected Routes** - Secure routes that require authentication and proper role permissions

### User Roles

#### 1. Admin Portal
**Full system control and management**
- User Management (Create, Edit, Manage users)
- Doctor & Department Management
- Appointment Control
- Billing & Finance
- CMS Management
- System Configuration
- Complete access to all features

#### 2. Receptionist Portal
**Operational and billing control**
- Dashboard with today's appointments, pending confirmations, billing alerts
- Appointment Management (Create, Confirm, Cancel, Modify)
- Patient Management (Create, Update records, Upload documents)
- Billing & Invoicing (Generate bills, Apply taxes/discounts, Send invoices)
- Reports (Daily collection, Appointment summary, Pending payments)

#### 3. Doctor Portal
**Clinical and appointment management**
- Dashboard with today's appointments, upcoming schedule, pending reports
- Appointment Handling (View assigned appointments, Patient history, Consultation notes)
- Profile Management (Update details, Manage availability, Upload signature)
- Prescription Generation
- Billing Visibility (Read-only)

## Test Credentials

### Admin
- **Email:** admin@hospital.com
- **Phone:** 1234567890
- **Password:** admin123

### Receptionist
- **Email:** receptionist@hospital.com
- **Phone:** 1234567891
- **Password:** receptionist123

### Doctor
- **Email:** doctor@hospital.com
- **Phone:** 1234567892
- **Password:** doctor123

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (Local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hospital-management-system
   ```

2. **Install Server Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install Admin Panel Dependencies**
   ```bash
   cd ../Admin
   npm install
   ```

4. **Configure Environment Variables**
   
   Server (.env):
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

   Admin (.env):
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

5. **Seed the Database (Create Test Users)**
   ```bash
   cd server
   node seed.js
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd server
   npm run dev
   ```
   Server will run on http://localhost:5000

2. **Start the Frontend (Admin Panel)**
   ```bash
   cd Admin
   npm run dev
   ```
   Admin panel will run on http://localhost:5173

3. **Access the Application**
   - Open your browser and navigate to http://localhost:5173
   - You'll be redirected to the login page
   - Use any of the test credentials above to log in
   - You'll be automatically redirected to the appropriate dashboard based on your role

## Project Structure

```
hospital-management-system/
├── server/                 # Backend API
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Authentication middleware
│   │   ├── models/        # Mongoose models
│   │   └── routes/        # API routes
│   └── seed.js           # Database seeding script
│
└── Admin/                 # Frontend Application
    ├── src/
    │   ├── components/    # Reusable components
    │   ├── context/       # React context (Auth)
    │   ├── layouts/       # Layout components
    │   ├── pages/         # Page components
    │   │   ├── Login.jsx              # Login page
    │   │   ├── Dashboard.jsx          # Admin dashboard
    │   │   ├── ReceptionistDashboard.jsx
    │   │   └── DoctorDashboard.jsx
    │   └── services/      # API services
    └── public/
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/phone and password
- `POST /api/auth/register` - Register new user
- `GET /api/auth/profile` - Get user profile (Protected)

### Users (Admin only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Doctors
- `GET /api/doctors` - Get all doctors
- `POST /api/doctors` - Create doctor
- `PUT /api/doctors/:id` - Update doctor
- `DELETE /api/doctors/:id` - Delete doctor

### Appointments
- `GET /api/appointments` - Get all appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

### Patients
- `GET /api/patients` - Get all patients
- `POST /api/patients` - Create patient
- `PUT /api/patients/:id` - Update patient

### Billing
- `GET /api/bills` - Get all bills
- `POST /api/bills` - Create bill
- `PUT /api/bills/:id` - Update bill

## Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

### Frontend
- React 19
- React Router DOM v7
- Tailwind CSS
- Axios for API calls
- Lucide React for icons
- React Icons
- Recharts for data visualization

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Protected routes with role-based access control
- Secure HTTP-only cookie support
- Input validation and sanitization

## Future Enhancements

- Email notifications
- SMS integration
- Document upload to AWS S3
- Advanced reporting and analytics
- Appointment reminders
- Payment gateway integration
- Multi-language support

## License

This project is licensed under the MIT License.

## Support

For support, email support@hospital.com or create an issue in the repository.
