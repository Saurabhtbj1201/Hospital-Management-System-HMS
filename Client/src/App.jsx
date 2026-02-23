import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AppointmentBooking from './pages/AppointmentBooking';
import AppointmentConfirmation from './pages/AppointmentConfirmation';
import './App.css';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/book-appointment" element={<AppointmentBooking />} />
                <Route path="/appointment-confirmation" element={<AppointmentConfirmation />} />
            </Routes>
        </Router>
    );
}

export default App;
