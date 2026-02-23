import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="spinner-large"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        switch (user.role) {
            case 'Admin':
                return <Navigate to="/admin/dashboard" replace />;
            case 'Receptionist':
                return <Navigate to="/receptionist/dashboard" replace />;
            case 'Doctor':
                return <Navigate to="/doctor/dashboard" replace />;
            default:
                return <Navigate to="/login" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
