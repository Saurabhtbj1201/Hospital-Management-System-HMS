import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';
import {
    LayoutDashboard,
    Users,
    Calendar,
    FileText,
    DollarSign,
    Settings,
    Stethoscope,
    Building2,
    Bell,
    Search,
    Menu,
    X,
    LogOut,
    User,
    ChevronDown,
    Headphones,
    Megaphone,
    ShieldCheck,
    CalendarClock,
    FileCheck
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const location = useLocation();
    const { user, logout, profilePhoto } = useAuth();
    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    // Define menu items based on role
    const getMenuItems = () => {
        const basePrefix = user?.role === 'Admin' ? '/admin' :
            user?.role === 'Receptionist' ? '/receptionist' :
                '/doctor';

        if (user?.role === 'Admin') {
            return [
                { icon: LayoutDashboard, label: 'Dashboard', path: `${basePrefix}/dashboard` },
                { icon: Calendar, label: 'Appointments', path: `${basePrefix}/appointments` },
                { icon: FileText, label: 'Patients', path: `${basePrefix}/patients` },
                { icon: DollarSign, label: 'Billing', path: `${basePrefix}/billing` },
                { icon: ShieldCheck, label: 'Admin', path: `${basePrefix}/admin-management` },
                { icon: Stethoscope, label: 'Doctors', path: `${basePrefix}/doctor-management` },
                { icon: Users, label: 'Receptionist', path: `${basePrefix}/receptionist-management` },
                { icon: Building2, label: 'Departments', path: `${basePrefix}/departments` },
                { icon: CalendarClock, label: 'Slot Settings', path: `${basePrefix}/slot-settings` },
                { icon: FileCheck, label: 'Template', path: `${basePrefix}/invoice-template` },
                { icon: Megaphone, label: 'Announcements', path: `${basePrefix}/announcements` },
                { icon: Bell, label: 'Site Updates', path: `${basePrefix}/site-updates` },
                { icon: Headphones, label: 'Support', path: `${basePrefix}/support` },
                { icon: User, label: 'My Profile', path: `${basePrefix}/profile` },
                { icon: Settings, label: 'Settings', path: `${basePrefix}/settings` },
            ];
        } else if (user?.role === 'Receptionist') {
            return [
                { icon: LayoutDashboard, label: 'Dashboard', path: `${basePrefix}/dashboard` },
                { icon: Calendar, label: 'Appointments', path: `${basePrefix}/appointments` },
                { icon: FileText, label: 'Patients', path: `${basePrefix}/patients` },
                { icon: DollarSign, label: 'Billing', path: `${basePrefix}/billing` },
                { icon: CalendarClock, label: 'Slot Management', path: `${basePrefix}/slot-management` },
                { icon: User, label: 'My Profile', path: `${basePrefix}/profile` },
                { icon: Settings, label: 'Settings', path: `${basePrefix}/settings` },
            ];
        } else { // This covers Doctor role and any other default
            return [
                { icon: LayoutDashboard, label: 'Dashboard', path: `${basePrefix}/dashboard` },
                { icon: Calendar, label: 'Appointments', path: `${basePrefix}/appointments` },
                { icon: FileText, label: 'Patients', path: `${basePrefix}/patients` },
                { icon: User, label: 'My Profile', path: `${basePrefix}/profile` },
            ];
        }
    };

    const menuItems = getMenuItems();

    const getRoleLabel = () => {
        if (user?.role === 'Admin') return 'HMS Admin';
        if (user?.role === 'Receptionist') return 'HMS Reception';
        if (user?.role === 'Doctor') return 'HMS Doctor';
        return 'HMS Portal';
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleViewProfile = () => {
        const basePrefix = user?.role === 'Admin' ? '/admin' :
            user?.role === 'Receptionist' ? '/receptionist' :
                '/doctor';
        navigate(`${basePrefix}/profile`);
        setShowProfileMenu(false);
    };

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-30 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0 w-64`}
            >
                <div className="flex flex-col h-full bg-white border-r border-gray-200">
                    {/* Logo */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                                <Stethoscope className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">{getRoleLabel()}</span>
                        </div>
                        <button onClick={toggleSidebar} className="lg:hidden">
                            <X className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search"
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                            <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-0.5 text-xs text-gray-500 bg-white border border-gray-200 rounded">
                                ⌘K
                            </kbd>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-2 overflow-y-auto">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={isActive ? 'sidebar-item-active' : 'sidebar-item'}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="text-sm font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile */}
                    <div className="p-4 border-t border-gray-200">
                        <div
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                        >
                            {profilePhoto ? (
                                <img src={profilePhoto} alt={user?.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                            ) : (
                                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-primary-600" />
                                </div>
                            )}
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                                <p className="text-xs text-gray-500">{user?.email || 'user@hospital.com'}</p>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                        </div>

                        {/* Expandable Menu Options */}
                        <div
                            className={`overflow-hidden transition-all duration-300 ${showProfileMenu ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}
                        >
                            <div className="mt-2 space-y-1">
                                <button
                                    onClick={handleViewProfile}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 rounded-lg transition-colors text-left"
                                >
                                    <User className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700">View Profile</span>
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 rounded-lg transition-colors text-left"
                                >
                                    <LogOut className="w-4 h-4 text-red-500" />
                                    <span className="text-sm font-medium text-red-600">Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

const Header = ({ toggleSidebar }) => {
    const { user, logout, profilePhoto } = useAuth();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleViewProfile = () => {
        const basePrefix = user?.role === 'Admin' ? '/admin' :
            user?.role === 'Receptionist' ? '/receptionist' :
                '/doctor';
        navigate(`${basePrefix}/profile`);
        setShowUserMenu(false);
    };

    const handleHelp = () => {
        const basePrefix = user?.role === 'Admin' ? '/admin' :
            user?.role === 'Receptionist' ? '/receptionist' :
                '/doctor';
        navigate(`${basePrefix}/support`);
        setShowUserMenu(false);
    };

    // Get user initials for avatar
    const getUserInitials = () => {
        if (!user?.name) return 'U';
        const names = user.name.split(' ');
        if (names.length >= 2) {
            return `${names[0][0]}${names[1][0]}`.toUpperCase();
        }
        return user.name.substring(0, 2).toUpperCase();
    };

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <Menu className="w-6 h-6 text-gray-600" />
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                        <Bell className="w-5 h-5 text-gray-600" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* User Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            {profilePhoto ? (
                                <img src={profilePhoto} alt={user?.name} className="w-9 h-9 rounded-full object-cover border border-gray-200" />
                            ) : (
                                <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-semibold text-white">{getUserInitials()}</span>
                                </div>
                            )}
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                                <p className="text-xs text-gray-500">{user?.role || 'Role'}</p>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {showUserMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowUserMenu(false)}
                                ></div>
                                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-20">
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                                        <p className="text-xs text-gray-500 truncate">{user?.email || 'user@hospital.com'}</p>
                                    </div>
                                    <div className="py-1">
                                        <button
                                            onClick={handleViewProfile}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                                        >
                                            <User className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm text-gray-700">View Profile</span>
                                        </button>
                                        <button
                                            onClick={handleHelp}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                                        >
                                            <Headphones className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm text-gray-700">Help</span>
                                        </button>
                                        <a
                                            href="https://help.hmsportal.com/faq"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            <Bell className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm text-gray-700">FAQ</span>
                                        </a>
                                    </div>
                                    <div className="border-t border-gray-100">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-left"
                                        >
                                            <LogOut className="w-4 h-4 text-red-500" />
                                            <span className="text-sm text-red-600">Logout</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, setProfilePhoto } = useAuth();
    const location = useLocation();

    // Dynamic page title based on role & current page
    useEffect(() => {
        const pageTitleMap = {
            'dashboard': 'Dashboard',
            'appointments': 'Appointments',
            'patients': 'Patients',
            'billing': 'Billing',
            'admin-management': 'Admin Management',
            'doctor-management': 'Doctors',
            'receptionist-management': 'Receptionist',
            'departments': 'Departments',
            'slot-settings': 'Slot Settings',
            'slot-management': 'Slot Management',
            'invoice-template': 'Template',
            'announcements': 'Announcements',
            'site-updates': 'Site Updates',
            'support': 'Support',
            'profile': 'My Profile',
            'settings': 'Settings',
        };

        const segments = location.pathname.split('/').filter(Boolean);
        const pageSegment = segments[segments.length - 1] || 'dashboard';
        const pageTitle = pageTitleMap[pageSegment] || 'Dashboard';

        const roleLabel = user?.role === 'Admin' ? 'Admin' :
            user?.role === 'Receptionist' ? 'Receptionist' :
                user?.role === 'Doctor' ? 'Doctor' : 'HMS';

        document.title = `${pageTitle} | ${roleLabel} - HMS`;
    }, [location.pathname, user?.role]);

    useEffect(() => {
        const fetchPhoto = async () => {
            try {
                const data = await profileAPI.getMyProfile();
                const photo = data.adminProfile?.profilePhoto || data.doctorProfile?.profilePhoto || data.receptionistProfile?.profilePhoto || '';
                setProfilePhoto(photo);
            } catch {
                // silently fail
            }
        };
        if (user) fetchPhoto();
    }, [user?._id]);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="flex-1 flex flex-col lg:ml-64">
                <Header toggleSidebar={toggleSidebar} />
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
