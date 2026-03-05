import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import About from './pages/About';
import Departments from './pages/Departments';
import DepartmentDetail from './components/departments/DepartmentDetail';
import Doctors from './pages/Doctors';
import DoctorProfile from './components/doctors/DoctorProfile';
import Services from './pages/Services';
import PatientServices from './pages/PatientServices';
import Blog from './pages/Blog';
import BlogArticle from './components/blog/BlogArticle';
import Announcements from './pages/Announcements';
import Contact from './pages/Contact';
import Emergency from './pages/Emergency';
import FAQs from './pages/FAQs';
import SymptomChecker from './components/ai/SymptomChecker';
import AppointmentBooking from './pages/AppointmentBooking';
import AppointmentConfirmation from './pages/AppointmentConfirmation';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';

function App() {
    return (
        <Router>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/departments" element={<Departments />} />
                    <Route path="/departments/:id" element={<DepartmentDetail />} />
                    <Route path="/doctors" element={<Doctors />} />
                    <Route path="/doctors/:id" element={<DoctorProfile />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/patient-services" element={<PatientServices />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:slug" element={<BlogArticle />} />
                    <Route path="/announcements" element={<Announcements />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/emergency" element={<Emergency />} />
                    <Route path="/faqs" element={<FAQs />} />
                    <Route path="/symptom-checker" element={<SymptomChecker />} />
                    <Route path="/book-appointment" element={<AppointmentBooking />} />
                    <Route path="/appointment-confirmation" element={<AppointmentConfirmation />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
