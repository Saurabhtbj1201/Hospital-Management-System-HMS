// ============================================================
// Lifebridge Medical Center — Global Constants & Mock Data
// ============================================================

// ──────────────────────────────────────────────
// Hospital Information
// ──────────────────────────────────────────────
export const HOSPITAL = {
  name: 'Lifebridge Medical Center',
  tagline: 'Your Health, Our Priority',
  shortName: 'Lifebridge',
  founded: 2001,
  phone: '+91-9876543210',
  emergencyPhone: '108',
  emergencyDirect: '+91-9876500108',
  email: 'info@lifebridgemedical.com',
  appointmentEmail: 'appointments@lifebridgemedical.com',
  website: 'https://lifebridgemedical.com',
  address: {
    line1: '123 Healthcare Avenue',
    line2: 'Medical District',
    city: 'New Delhi',
    state: 'Delhi',
    zip: '110001',
    country: 'India',
    full: '123 Healthcare Avenue, Medical District, New Delhi, Delhi 110001',
    mapUrl: 'https://maps.google.com/?q=28.6139,77.2090',
    embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.3!2d77.209!3d28.6139!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDM2JzUwLjAiTiA3N8KwMTInMzIuNCJF!5e0!3m2!1sen!2sin!4v1',
  },
  workingHours: {
    opd: { days: 'Mon – Sat', time: '8:00 AM – 8:00 PM' },
    emergency: { days: 'All Days', time: '24/7' },
    pharmacy: { days: 'All Days', time: '24/7' },
    lab: { days: 'Mon – Sat', time: '7:00 AM – 9:00 PM' },
    visiting: { days: 'All Days', time: '4:00 PM – 7:00 PM' },
  },
  social: {
    facebook: 'https://facebook.com/lifebridgemedical',
    twitter: 'https://twitter.com/lifebridgemed',
    instagram: 'https://instagram.com/lifebridgemedical',
    linkedin: 'https://linkedin.com/company/lifebridge-medical',
    youtube: 'https://youtube.com/@lifebridgemedical',
  },
};

// ──────────────────────────────────────────────
// Stats
// ──────────────────────────────────────────────
export const STATS = [
  { label: 'Happy Patients', value: 50000, suffix: '+', icon: 'Heart' },
  { label: 'Expert Doctors', value: 500, suffix: '+', icon: 'Stethoscope' },
  { label: 'Departments', value: 30, suffix: '+', icon: 'Building2' },
  { label: 'Years of Trust', value: 25, suffix: '+', icon: 'Award' },
];

// ──────────────────────────────────────────────
// Navigation Links
// ──────────────────────────────────────────────
export const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'About Us', path: '/about' },
  { label: 'Departments', path: '/departments' },
  { label: 'Our Doctors', path: '/doctors' },
  { label: 'Services', path: '/services' },
  { label: 'Contact', path: '/contact' },
];

export const NAV_MORE_LINKS = [
  { label: 'Patient Services', path: '/patient-services' },
  { label: 'Health Blog', path: '/blog' },
  { label: 'Announcements', path: '/announcements' },
  { label: 'FAQs', path: '/faqs' },
  { label: 'AI Symptom Checker', path: '/symptom-checker' },
  { label: 'Emergency', path: '/emergency' },
];

// ──────────────────────────────────────────────
// Footer Quick Links
// ──────────────────────────────────────────────
export const FOOTER_LINKS = {
  quickLinks: [
    { label: 'About Us', path: '/about' },
    { label: 'Our Doctors', path: '/doctors' },
    { label: 'Departments', path: '/departments' },
    { label: 'Book Appointment', path: '/book-appointment' },
    { label: 'Patient Services', path: '/patient-services' },
    { label: 'Contact Us', path: '/contact' },
  ],
  services: [
    { label: 'Emergency Care', path: '/emergency' },
    { label: 'Diagnostics', path: '/services' },
    { label: 'Surgery', path: '/services' },
    { label: 'Health Checkup', path: '/patient-services' },
    { label: 'Pharmacy', path: '/services' },
    { label: 'Lab Services', path: '/services' },
  ],
  support: [
    { label: 'FAQs', path: '/faqs' },
    { label: 'Health Blog', path: '/blog' },
    { label: 'Announcements', path: '/announcements' },
    { label: 'Symptom Checker', path: '/symptom-checker' },
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms of Service', path: '/terms' },
  ],
};

// ──────────────────────────────────────────────
// Why Choose Us Features
// ──────────────────────────────────────────────
export const WHY_CHOOSE_US = [
  {
    icon: 'Cpu',
    title: 'Advanced Technology',
    description: 'State-of-the-art medical equipment and cutting-edge diagnostic technology for accurate results.',
  },
  {
    icon: 'Users',
    title: 'Expert Medical Team',
    description: 'Board-certified doctors and experienced medical professionals dedicated to your care.',
  },
  {
    icon: 'IndianRupee',
    title: 'Affordable Care',
    description: 'Quality healthcare that is accessible and affordable, with transparent pricing and insurance support.',
  },
  {
    icon: 'Clock',
    title: '24/7 Emergency',
    description: 'Round-the-clock emergency services with fully equipped ambulances and trauma care.',
  },
  {
    icon: 'HeartHandshake',
    title: 'Patient-First Approach',
    description: 'Compassionate, patient-centric care where your comfort and wellbeing come first.',
  },
  {
    icon: 'Building',
    title: 'Modern Infrastructure',
    description: 'World-class hospital facilities with spacious rooms, clean environment, and modern amenities.',
  },
];

// ──────────────────────────────────────────────
// Testimonials (Mock)
// ──────────────────────────────────────────────
export const TESTIMONIALS = [
  {
    id: 1,
    name: 'Priya Sharma',
    role: 'Heart Surgery Patient',
    avatar: null,
    rating: 5,
    text: 'The cardiac care team at Lifebridge saved my life. Their expertise and compassion throughout my bypass surgery and recovery were exceptional. I am forever grateful.',
  },
  {
    id: 2,
    name: 'Rajesh Kumar',
    role: 'Orthopedic Patient',
    avatar: null,
    rating: 5,
    text: 'After my knee replacement surgery, the rehabilitation team ensured a smooth recovery. The modern facilities and caring staff made all the difference.',
  },
  {
    id: 3,
    name: 'Anita Desai',
    role: 'Maternity Patient',
    avatar: null,
    rating: 5,
    text: 'The maternity ward is phenomenal. From prenatal care to delivery, every step was handled with such professionalism and warmth. Highly recommend!',
  },
  {
    id: 4,
    name: 'Mohammed Ali',
    role: 'General Checkup',
    avatar: null,
    rating: 4,
    text: 'The annual health checkup packages are comprehensive and well-organized. The online booking system and timely reminders make the process hassle-free.',
  },
  {
    id: 5,
    name: 'Sunita Patel',
    role: 'Neurology Patient',
    avatar: null,
    rating: 5,
    text: 'Dr. Mehra and the neurology department provided outstanding care during my treatment. The advanced diagnostic facilities helped in accurate and early diagnosis.',
  },
  {
    id: 6,
    name: 'Vikram Singh',
    role: 'Emergency Care',
    avatar: null,
    rating: 5,
    text: 'The emergency response was incredibly swift. Within minutes of arrival, I was being treated by a team of specialists. Lifebridge truly delivers in critical moments.',
  },
];

// ──────────────────────────────────────────────
// Leadership Team (Mock)
// ──────────────────────────────────────────────
export const LEADERSHIP = [
  {
    name: 'Dr. Arun Kapoor',
    title: 'Chairman & Founder',
    image: null,
    bio: 'A visionary in healthcare with 35+ years of experience. Founded Lifebridge Medical Center with a mission to provide world-class healthcare accessible to all.',
  },
  {
    name: 'Dr. Meena Reddy',
    title: 'Medical Director',
    image: null,
    bio: 'Board-certified in Internal Medicine with 25+ years of clinical leadership. Oversees all medical operations and quality assurance protocols.',
  },
  {
    name: 'Dr. Sanjay Gupta',
    title: 'Chief of Surgery',
    image: null,
    bio: 'Internationally acclaimed surgeon with expertise in minimally invasive procedures. Over 10,000 successful surgeries performed.',
  },
  {
    name: 'Kavita Nair',
    title: 'Chief Operating Officer',
    image: null,
    bio: 'MBA from IIM with 20+ years in hospital management. Drives operational excellence and patient satisfaction across all departments.',
  },
];

// ──────────────────────────────────────────────
// Blog Articles (Mock)
// ──────────────────────────────────────────────
export const BLOG_ARTICLES = [
  {
    id: 1,
    slug: 'heart-health-tips-for-healthy-living',
    title: '10 Heart Health Tips for a Longer, Healthier Life',
    excerpt: 'Discover essential tips from our cardiologists to keep your heart strong and reduce the risk of cardiovascular disease.',
    category: 'Heart Health',
    author: 'Dr. Arun Kapoor',
    date: '2026-02-28',
    readTime: '5 min read',
    featured: true,
    image: null,
    content: `
      <h2>1. Eat a Heart-Healthy Diet</h2>
      <p>Focus on fruits, vegetables, whole grains, lean proteins, and healthy fats. Limit sodium, sugar, and saturated fats.</p>
      <h2>2. Exercise Regularly</h2>
      <p>Aim for at least 150 minutes of moderate aerobic activity per week. Even a daily 30-minute walk makes a huge difference.</p>
      <h2>3. Maintain a Healthy Weight</h2>
      <p>Excess weight increases the risk of heart disease. Work with your doctor to achieve and maintain a healthy BMI.</p>
      <h2>4. Quit Smoking</h2>
      <p>Smoking damages blood vessels and increases the risk of heart attack. Seek professional help if needed.</p>
      <h2>5. Manage Stress</h2>
      <p>Chronic stress contributes to heart disease. Practice relaxation techniques like meditation, yoga, or deep breathing.</p>
      <h2>6. Get Quality Sleep</h2>
      <p>Poor sleep is linked to higher risk of obesity, high blood pressure, and heart attack. Aim for 7-9 hours per night.</p>
      <h2>7. Monitor Blood Pressure</h2>
      <p>Hypertension is a silent killer. Have your blood pressure checked regularly and follow your doctor's recommendations.</p>
      <h2>8. Control Cholesterol</h2>
      <p>High LDL cholesterol leads to plaque buildup in arteries. Get regular lipid profile tests and take prescribed medications.</p>
      <h2>9. Manage Diabetes</h2>
      <p>Uncontrolled diabetes significantly increases heart risk. Monitor blood sugar levels and maintain a diabetes-friendly diet.</p>
      <h2>10. Schedule Regular Checkups</h2>
      <p>Annual health screenings can detect problems early. Don't wait for symptoms—prevention is always better than cure.</p>
    `,
  },
  {
    id: 2,
    slug: 'understanding-diabetes-management',
    title: 'Understanding Diabetes: A Complete Guide to Management',
    excerpt: 'Learn about different types of diabetes, their symptoms, and the latest management strategies from our endocrinology team.',
    category: 'Diabetes',
    author: 'Dr. Meena Reddy',
    date: '2026-02-20',
    readTime: '7 min read',
    featured: false,
    image: null,
    content: '<p>Comprehensive guide to understanding and managing diabetes effectively...</p>',
  },
  {
    id: 3,
    slug: 'importance-of-mental-health',
    title: 'Why Mental Health Matters: Breaking the Stigma',
    excerpt: 'Mental health is just as important as physical health. Our psychiatry experts share insights on recognizing and addressing mental health concerns.',
    category: 'Mental Health',
    author: 'Dr. Nisha Verma',
    date: '2026-02-15',
    readTime: '6 min read',
    featured: false,
    image: null,
    content: '<p>Understanding the importance of mental health and how to seek help...</p>',
  },
  {
    id: 4,
    slug: 'nutrition-tips-for-stronger-immunity',
    title: 'Nutrition Tips for Building Stronger Immunity',
    excerpt: 'Boost your immune system naturally with these scientifically-backed nutrition recommendations from our dieticians.',
    category: 'Nutrition',
    author: 'Dr. Priya Mehta',
    date: '2026-02-10',
    readTime: '4 min read',
    featured: false,
    image: null,
    content: '<p>Evidence-based nutrition advice for strengthening your immune system...</p>',
  },
  {
    id: 5,
    slug: 'womens-health-essential-screenings',
    title: "Women's Health: Essential Screenings at Every Age",
    excerpt: 'From mammograms to bone density tests, know which health screenings are crucial for women at different life stages.',
    category: "Women's Health",
    author: 'Dr. Sunita Das',
    date: '2026-02-05',
    readTime: '5 min read',
    featured: false,
    image: null,
    content: '<p>A comprehensive guide to essential health screenings for women...</p>',
  },
  {
    id: 6,
    slug: 'joint-pain-causes-and-treatments',
    title: 'Joint Pain: Common Causes and Modern Treatment Options',
    excerpt: 'Our orthopedic specialists explain the common causes of joint pain and the latest surgical and non-surgical treatment options.',
    category: 'Orthopedics',
    author: 'Dr. Sanjay Gupta',
    date: '2026-01-28',
    readTime: '6 min read',
    featured: false,
    image: null,
    content: '<p>Exploring the causes of joint pain and available treatment options...</p>',
  },
];

export const BLOG_CATEGORIES = [
  'All',
  'Heart Health',
  'Diabetes',
  'Mental Health',
  'Nutrition',
  "Women's Health",
  'Orthopedics',
  'Pediatrics',
  'Neurology',
];

// ──────────────────────────────────────────────
// FAQs (Mock)
// ──────────────────────────────────────────────
export const FAQ_CATEGORIES = [
  'General',
  'Appointments',
  'Billing & Insurance',
  'Medical Records',
  'Visiting Hours',
  'Emergency',
  'Services',
];

export const FAQS = [
  // General
  { id: 1, category: 'General', question: 'What are the hospital visiting hours?', answer: 'Visiting hours are from 4:00 PM to 7:00 PM, every day including weekends and holidays. ICU patients have restricted visiting — please check with the nursing station.' },
  { id: 2, category: 'General', question: 'Where is Lifebridge Medical Center located?', answer: 'We are located at 123 Healthcare Avenue, Medical District, New Delhi, Delhi 110001. We are easily accessible by metro (nearest station: Medical Hub) and have ample parking.' },
  { id: 3, category: 'General', question: 'Does the hospital have parking facilities?', answer: 'Yes, we have a multi-level parking facility with spaces for over 500 vehicles. Valet parking is also available at the main entrance.' },
  { id: 4, category: 'General', question: 'Is Wi-Fi available for patients and visitors?', answer: 'Yes, complimentary Wi-Fi is available throughout the hospital. Connect to "Lifebridge-Guest" and accept the terms to use it.' },
  // Appointments
  { id: 5, category: 'Appointments', question: 'How can I book an appointment?', answer: 'You can book an appointment online through our website, call us at +91-9876543210, or visit the reception desk. Online booking is available 24/7 and confirms instantly.' },
  { id: 6, category: 'Appointments', question: 'Can I reschedule or cancel my appointment?', answer: 'Yes, you can reschedule or cancel up to 4 hours before your appointment time. Please contact our appointment desk at +91-9876543210 or email appointments@lifebridgemedical.com.' },
  { id: 7, category: 'Appointments', question: 'How early should I arrive for my appointment?', answer: 'Please arrive at least 15 minutes before your scheduled appointment to complete any necessary registration or paperwork.' },
  { id: 8, category: 'Appointments', question: 'Do I need a referral to see a specialist?', answer: 'A referral is not mandatory but is recommended. You can directly book an appointment with any specialist through our website.' },
  // Billing & Insurance
  { id: 9, category: 'Billing & Insurance', question: 'Which insurance providers do you accept?', answer: 'We accept all major insurance providers including Star Health, ICICI Lombard, Max Bupa, HDFC Ergo, New India Assurance, and many more. Contact our billing desk for a full list.' },
  { id: 10, category: 'Billing & Insurance', question: 'Do you offer cashless treatment?', answer: 'Yes, cashless treatment is available for patients covered under insurance policies from our partner companies. Please present your insurance card at the time of admission.' },
  { id: 11, category: 'Billing & Insurance', question: 'What payment methods are accepted?', answer: 'We accept cash, credit/debit cards, UPI (Google Pay, PhonePe, Paytm), net banking, and EMI options for major procedures.' },
  { id: 12, category: 'Billing & Insurance', question: 'Can I get an estimate before a procedure?', answer: 'Absolutely. Our billing team provides detailed cost estimates for all planned procedures. Please request an estimate at the billing counter or call us.' },
  // Medical Records
  { id: 13, category: 'Medical Records', question: 'How can I access my medical records?', answer: 'You can request your medical records from our Medical Records department. Bring a valid photo ID. Digital records can be sent to your registered email upon request.' },
  { id: 14, category: 'Medical Records', question: 'Are my medical records kept confidential?', answer: 'Yes, all patient records are strictly confidential and protected under applicable privacy laws. Access is limited to authorized medical personnel only.' },
  // Visiting Hours
  { id: 15, category: 'Visiting Hours', question: 'Can children visit patients?', answer: 'Children above 12 years are permitted during regular visiting hours. For younger children, special arrangements can be made through the nursing staff.' },
  { id: 16, category: 'Visiting Hours', question: 'How many visitors are allowed at a time?', answer: 'Up to 2 visitors per patient at a time during visiting hours. ICU patients are allowed 1 visitor for a limited duration as advised by the attending doctor.' },
  // Emergency
  { id: 17, category: 'Emergency', question: 'What should I do in a medical emergency?', answer: 'Call our emergency number 108 or +91-9876500108 immediately. Our ambulance service is available 24/7. You can also come directly to our Emergency Department — no appointment needed.' },
  { id: 18, category: 'Emergency', question: 'Does the hospital have an ambulance service?', answer: 'Yes, we have a fleet of 15+ advanced life-support ambulances with trained paramedics. Call 108 for immediate dispatch.' },
  { id: 19, category: 'Emergency', question: 'Is the emergency department open 24/7?', answer: 'Yes, our Emergency Department operates 24 hours a day, 7 days a week, 365 days a year with specialized emergency physicians always on duty.' },
  // Services
  { id: 20, category: 'Services', question: 'Do you offer health checkup packages?', answer: 'Yes, we offer comprehensive health checkup packages — Basic, Executive, and Premium — tailored for different age groups and health needs. Book online or call us for details.' },
  { id: 21, category: 'Services', question: 'Is telemedicine/online consultation available?', answer: 'Yes, we offer video consultations with our doctors through our online portal. Book a teleconsultation the same way you would book an in-person appointment.' },
  { id: 22, category: 'Services', question: 'Do you have a pharmacy on-site?', answer: 'Yes, our 24/7 in-house pharmacy stocks all prescribed medications. We also offer home delivery of medicines within the city.' },
  { id: 23, category: 'Services', question: 'Is there a cafeteria for patients and visitors?', answer: 'Yes, our cafeteria on the ground floor serves nutritious meals from 7 AM to 10 PM. Dietary-specific meals are available for inpatients as prescribed by the dietician.' },
];

// ──────────────────────────────────────────────
// Health Packages (Mock)
// ──────────────────────────────────────────────
export const HEALTH_PACKAGES = [
  {
    id: 1,
    name: 'Basic Health Checkup',
    price: '₹1,499',
    originalPrice: '₹2,500',
    tests: ['Complete Blood Count', 'Blood Sugar (Fasting)', 'Lipid Profile', 'Liver Function Test', 'Kidney Function Test', 'Urine Analysis', 'BMI Assessment', 'Doctor Consultation'],
    recommended: false,
    badge: null,
  },
  {
    id: 2,
    name: 'Executive Health Checkup',
    price: '₹3,999',
    originalPrice: '₹6,000',
    tests: ['All Basic Tests', 'Thyroid Profile', 'Vitamin D & B12', 'HbA1c', 'ECG', 'Chest X-Ray', 'Ultrasound Abdomen', 'Eye Checkup', 'Dental Checkup', 'Diet Consultation'],
    recommended: true,
    badge: 'Most Popular',
  },
  {
    id: 3,
    name: 'Premium Health Checkup',
    price: '₹7,999',
    originalPrice: '₹12,000',
    tests: ['All Executive Tests', 'Cardiac Stress Test (TMT)', 'Echocardiography', 'Pulmonary Function Test', 'Bone Density (DEXA)', 'CT Calcium Score', 'Cancer Markers (PSA/CA-125)', 'Full Body MRI Screening', 'Specialist Consultations (3)', 'Personalized Health Report'],
    recommended: false,
    badge: 'Comprehensive',
  },
];

// ──────────────────────────────────────────────
// Insurance Partners (Mock)
// ──────────────────────────────────────────────
export const INSURANCE_PARTNERS = [
  'Star Health Insurance',
  'ICICI Lombard',
  'Max Bupa Health',
  'HDFC Ergo',
  'New India Assurance',
  'Bajaj Allianz',
  'Tata AIG',
  'Care Health Insurance',
  'Niva Bupa',
  'Aditya Birla Health',
  'SBI General Insurance',
  'Manipal Cigna',
];

// ──────────────────────────────────────────────
// Emergency Services (Mock)
// ──────────────────────────────────────────────
export const EMERGENCY_SERVICES = [
  {
    icon: 'Siren',
    title: 'Trauma Care',
    description: 'Level-I trauma center with specialized surgeons, fully equipped operation theaters, and round-the-clock trauma response team.',
  },
  {
    icon: 'HeartPulse',
    title: 'Cardiac Emergency',
    description: 'Dedicated cardiac catheterization lab with door-to-balloon time under 60 minutes for heart attack patients.',
  },
  {
    icon: 'Brain',
    title: 'Stroke Unit',
    description: 'Comprehensive stroke center with thrombolysis and thrombectomy capabilities, available 24/7.',
  },
  {
    icon: 'Baby',
    title: 'Pediatric Emergency',
    description: 'Child-friendly emergency department with pediatric specialists and age-appropriate medical equipment.',
  },
  {
    icon: 'Flame',
    title: 'Burn Unit',
    description: 'Specialized burn care unit with advanced wound management, skin grafting, and rehabilitation services.',
  },
  {
    icon: 'FlaskConical',
    title: 'Poison Control',
    description: '24/7 poison information and treatment center with toxicology experts and advanced decontamination protocols.',
  },
];

// ──────────────────────────────────────────────
// First Aid Guides (Mock)
// ──────────────────────────────────────────────
export const FIRST_AID_GUIDES = [
  {
    title: 'CPR (Cardiopulmonary Resuscitation)',
    steps: [
      'Call emergency services (108) immediately.',
      'Check if the person is responsive — tap shoulders and ask loudly.',
      'Place the person on a firm, flat surface on their back.',
      'Place the heel of one hand on the center of the chest, interlock fingers.',
      'Push hard and fast — at least 2 inches deep, 100-120 compressions per minute.',
      'After 30 compressions, give 2 rescue breaths (if trained).',
      'Continue until help arrives or the person starts breathing.',
    ],
  },
  {
    title: 'Choking',
    steps: [
      'Ask the person "Are you choking?" — if they cannot speak or cough, act immediately.',
      'Stand behind the person and wrap your arms around their waist.',
      'Make a fist with one hand and place it just above the navel.',
      'Grasp the fist with the other hand and perform quick upward thrusts (Heimlich maneuver).',
      'Repeat until the object is expelled or the person can breathe.',
      'If the person becomes unconscious, begin CPR and call 108.',
    ],
  },
  {
    title: 'Severe Bleeding',
    steps: [
      'Call emergency services (108) for serious bleeding.',
      'Apply firm, direct pressure to the wound using a clean cloth.',
      'If possible, elevate the injured area above the heart.',
      'Do NOT remove the cloth if blood soaks through — add more layers.',
      'Apply a tourniquet only if bleeding is life-threatening and cannot be controlled by pressure.',
      'Keep the person calm and warm until help arrives.',
    ],
  },
  {
    title: 'Burns',
    steps: [
      'Remove the person from the source of the burn immediately.',
      'Cool the burn under cool (not cold) running water for at least 10 minutes.',
      'Do NOT use ice, butter, or toothpaste on the burn.',
      'Remove jewelry or tight clothing near the burn before swelling starts.',
      'Cover the burn loosely with a sterile, non-stick bandage.',
      'Seek medical attention for burns larger than 3 inches or on face/hands/joints.',
    ],
  },
];

// ──────────────────────────────────────────────
// AI Chat Quick Replies
// ──────────────────────────────────────────────
export const AI_QUICK_REPLIES = [
  '📅 Book Appointment',
  '👨‍⚕️ Find a Doctor',
  '🏥 Departments',
  '🚨 Emergency Info',
  '⏰ Working Hours',
  '📍 Location & Directions',
];

// ──────────────────────────────────────────────
// AI Chat Mock Responses (keyword → response)
// ──────────────────────────────────────────────
export const AI_RESPONSES = {
  appointment: {
    text: "I'd be happy to help you book an appointment! You can book online right now through our easy appointment portal.",
    action: { label: 'Book Appointment', path: '/book-appointment' },
  },
  doctor: {
    text: 'We have over 500 expert doctors across 30+ specializations. You can browse all our doctors and filter by department or specialization.',
    action: { label: 'Find a Doctor', path: '/doctors' },
  },
  department: {
    text: 'Lifebridge Medical Center has 30+ departments including Cardiology, Orthopedics, Neurology, Oncology, Pediatrics, and more.',
    action: { label: 'View Departments', path: '/departments' },
  },
  emergency: {
    text: '🚨 For emergencies, please call 108 or our direct emergency line at +91-9876500108 immediately. Our emergency department is open 24/7.',
    action: { label: 'Emergency Info', path: '/emergency' },
  },
  hours: {
    text: '⏰ OPD Hours: Mon-Sat, 8:00 AM - 8:00 PM\n🚨 Emergency: 24/7, all days\n💊 Pharmacy: 24/7\n🔬 Lab: Mon-Sat, 7:00 AM - 9:00 PM\n🏥 Visiting: All days, 4:00 PM - 7:00 PM',
    action: null,
  },
  location: {
    text: '📍 We are located at 123 Healthcare Avenue, Medical District, New Delhi, Delhi 110001. Nearest metro: Medical Hub station.',
    action: { label: 'Get Directions', path: '/contact' },
  },
  insurance: {
    text: 'We accept all major insurance providers including Star Health, ICICI Lombard, Max Bupa, HDFC Ergo, and many more. Cashless treatment is available.',
    action: { label: 'Patient Services', path: '/patient-services' },
  },
  service: {
    text: 'We offer a wide range of services including diagnostics, surgical procedures, health checkups, telemedicine, rehabilitation, and more.',
    action: { label: 'Our Services', path: '/services' },
  },
  checkup: {
    text: 'We offer health checkup packages starting from ₹1,499. Choose from Basic, Executive, or Premium packages based on your needs.',
    action: { label: 'Health Packages', path: '/patient-services' },
  },
  symptom: {
    text: 'Try our AI Symptom Checker to get an initial assessment based on your symptoms. Remember, this is not a substitute for professional medical advice.',
    action: { label: 'Symptom Checker', path: '/symptom-checker' },
  },
  blog: {
    text: 'Stay informed with our health blog featuring articles from our expert doctors on heart health, diabetes, nutrition, mental health, and more.',
    action: { label: 'Health Blog', path: '/blog' },
  },
  default: {
    text: "Thank you for reaching out! I can help you with booking appointments, finding doctors, department info, emergency services, working hours, and more. How can I assist you?",
    action: null,
  },
};

// ──────────────────────────────────────────────
// Mission / Vision / Values
// ──────────────────────────────────────────────
export const MISSION_VISION_VALUES = {
  mission: {
    icon: 'Target',
    title: 'Our Mission',
    text: 'To provide compassionate, accessible, and world-class healthcare to every individual, regardless of background or means, through innovation and dedicated medical excellence.',
  },
  vision: {
    icon: 'Eye',
    title: 'Our Vision',
    text: 'To be the most trusted healthcare institution in the nation, pioneering medical breakthroughs and setting the gold standard for patient care and outcomes.',
  },
  values: [
    { icon: 'Heart', title: 'Compassion', text: 'Treating every patient with empathy, dignity, and respect.' },
    { icon: 'ShieldCheck', title: 'Integrity', text: 'Upholding the highest ethical standards in all our practices.' },
    { icon: 'Lightbulb', title: 'Innovation', text: 'Embracing cutting-edge technology and medical advancements.' },
    { icon: 'Award', title: 'Excellence', text: 'Striving for the best outcomes in every aspect of healthcare.' },
    { icon: 'Users', title: 'Teamwork', text: 'Collaborating across disciplines for comprehensive patient care.' },
    { icon: 'Accessibility', title: 'Accessibility', text: 'Making quality healthcare available and affordable for all.' },
  ],
};

// ──────────────────────────────────────────────
// Timeline / Milestones
// ──────────────────────────────────────────────
export const MILESTONES = [
  { year: '2001', title: 'Founded', description: 'Lifebridge Medical Center established with 50 beds and a vision to transform healthcare.' },
  { year: '2005', title: 'First Expansion', description: 'Expanded to 200 beds with addition of Cardiology and Neurology departments.' },
  { year: '2010', title: 'Trauma Center', description: 'Designated as Level-I Trauma Center with 24/7 emergency services.' },
  { year: '2014', title: 'NABH Accreditation', description: 'Received prestigious NABH accreditation for quality and patient safety.' },
  { year: '2018', title: 'Super-Specialty Wing', description: 'Inaugurated the 300-bed super-specialty wing with robotic surgery capabilities.' },
  { year: '2022', title: 'Digital Health Initiative', description: 'Launched telemedicine, online booking, and AI-powered health tools.' },
  { year: '2025', title: '500+ Doctors', description: 'Crossed 500 specialist doctors and 30+ departments serving 50,000+ patients.' },
];

// ──────────────────────────────────────────────
// Patient Guide Tabs
// ──────────────────────────────────────────────
export const PATIENT_GUIDE = {
  'Before Your Visit': [
    'Book an appointment online or call +91-9876543210.',
    'Carry a valid photo ID (Aadhaar, PAN, Passport, or Driving License).',
    'Bring all previous medical records, prescriptions, and reports.',
    'If you have insurance, carry your insurance card and policy details.',
    'Arrive at least 15 minutes before your scheduled time.',
    'Wear comfortable clothing, especially if diagnostic tests are expected.',
  ],
  'During Your Stay': [
    'Our reception team will guide you through the admission process.',
    'Personal belongings can be stored in the provided safety locker.',
    'Meals will be served as per the dietician\'s recommendations.',
    'A nursing call button is available by your bedside for assistance.',
    'Visitors are allowed during visiting hours (4:00 PM – 7:00 PM).',
    'Feel free to ask questions — our staff is here to help.',
  ],
  'After Discharge': [
    'Collect your discharge summary and prescriptions from the nursing station.',
    'Follow-up appointments will be scheduled as recommended by your doctor.',
    'Take all prescribed medications as directed.',
    'Contact us immediately if you experience any complications.',
    'Online follow-up consultations are available through our portal.',
    'Feedback forms are available — your input helps us improve.',
  ],
  'Billing & Insurance': [
    'Billing is done at the time of discharge for inpatients.',
    'Insurance claims are processed by our dedicated TPA desk.',
    'We offer EMI options for major procedures through select banks.',
    'Detailed itemized bills are provided upon request.',
    'Online payment is available through our secure payment gateway.',
    'Contact our billing helpdesk for any queries: +91-9876543200.',
  ],
};
