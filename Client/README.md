# HMS Client Portal - Public Website

Professional public-facing website for the Hospital Management System with online appointment booking.

## Features

### 🏠 Home Page
- Modern, responsive design with gradient backgrounds
- Hero section with call-to-action
- Feature showcase
- Contact information
- Professional footer

### 📅 Appointment Booking System
- **Multi-step form** with progress indicator
- **OTP Verification** for mobile and email
- **Comprehensive data collection**:
  - Personal information
  - Appointment details
  - Medical information
  - Emergency contacts
- **Real-time validation**
- **Success confirmation** page

## Tech Stack

- **Frontend**: React 18 + Vite
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **Icons**: React Icons
- **Styling**: Vanilla CSS with modern design system

## Installation

```bash
cd Client
npm install
```

## Development

```bash
npm run dev
```

The application will run on `http://localhost:3001`

## Build

```bash
npm run build
```

## Appointment Booking Flow

### Step 1: Personal Details
1. User fills in basic information
2. Provides mobile number (required)
3. Optionally provides email address
4. Clicks "Send OTP"
5. Enters OTP received via SMS/Email
6. Verifies OTP
7. Proceeds to next step

### Step 2: Appointment Details
1. Selects department (optional)
2. Chooses appointment date
3. Selects time slot
4. Specifies visit type (New/Follow-up)
5. Proceeds to next step

### Step 3: Additional Information
1. Provides address (optional)
2. Describes primary concern
3. Mentions allergies and conditions
4. Adds emergency contact
5. Submits appointment

### Step 4: Confirmation
- Success message displayed
- Appointment ID shown
- Confirmation sent via SMS/Email
- Auto-redirect to home page

## Data Fields

### Required Fields
- Full Name
- Gender
- Date of Birth
- Age (auto-calculated)
- Relationship
- Mobile Number *
- Appointment Date
- Appointment Time
- Visit Type

### Optional Fields
- Email Address
- Department
- City, State, Pincode
- Primary Concern
- Known Allergies
- Existing Conditions
- Emergency Contact Details

## OTP Verification

### Security Features
- **Rate Limiting**: Max 3 OTP requests per minute
- **Expiry**: OTPs expire after 5 minutes
- **One-time Use**: OTPs are deleted after verification
- **Backend Generation**: OTPs generated on server
- **Dual Verification**: Mobile + Email (if provided)

### OTP Services (Production)
- **SMS**: Fast2SMS (India-compliant)
- **Email**: AWS SES (Reliable, scalable)
- **Storage**: Redis (Fast, auto-expire)

### Current Implementation
- In-memory storage (development)
- Console logging (replace with actual services)
- Debug mode (shows OTP in response)

## API Endpoints

### Public Appointments
- `POST /api/public-appointments/send-otp` - Send OTP
- `POST /api/public-appointments/verify-otp` - Verify OTP
- `POST /api/public-appointments` - Create appointment
- `GET /api/public-appointments/time-slots` - Get available slots

### Departments
- `GET /api/departments` - Get all departments

## Environment Variables

Create `.env` file in Client directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## Design System

### Colors
- **Primary**: #7c3aed (Purple)
- **Secondary**: #10b981 (Green)
- **Danger**: #ef4444 (Red)
- **Dark**: #1f2937
- **Gray**: #6b7280
- **Light Gray**: #f3f4f6

### Typography
- System fonts for optimal performance
- Responsive font sizes
- Clear hierarchy

### Components
- Reusable button styles
- Form components with validation
- Loading spinners
- Success/Error states

## Responsive Design

- **Desktop**: Full layout with all features
- **Tablet**: Optimized grid layouts
- **Mobile**: Single-column, touch-friendly

## Best Practices

### ✅ Implemented
- OTP verification for security
- Rate limiting to prevent abuse
- Form validation (client + server)
- Auto-generated IDs
- Responsive design
- Loading states
- Error handling
- Success feedback

### ❌ Avoided
- Storing OTP in MongoDB
- Generating OTP on frontend
- Reusing OTPs
- Sending OTP without rate limiting
- Exposing sensitive data

## Future Enhancements

1. **CAPTCHA Integration**
   - Add reCAPTCHA before OTP
   - Prevent bot submissions

2. **SMS/Email Integration**
   - Integrate Fast2SMS for SMS
   - Integrate AWS SES for Email
   - Add email templates

3. **Redis Integration**
   - Replace in-memory OTP storage
   - Implement proper expiry
   - Scale across servers

4. **Payment Integration**
   - Online payment for appointments
   - Payment confirmation

5. **Appointment Management**
   - View appointments
   - Reschedule/Cancel
   - Download receipt

6. **Doctor Profiles**
   - View doctor information
   - Check availability
   - Read reviews

## Security Considerations

- All user inputs are validated
- OTPs are time-limited
- Rate limiting prevents abuse
- HTTPS required in production
- CORS configured properly
- No sensitive data in frontend

## Support

For issues or questions, contact the development team.

## License

Proprietary - All rights reserved
