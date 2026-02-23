import { useState } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Users,
    Calendar,
    Activity,
    DollarSign,
    MoreVertical,
    Filter,
    Download,
    Plus,
    Search,
    Edit,
    Trash2,
    Eye
} from 'lucide-react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

// Sample data for charts
const totalPatientsData = [
    { name: 'Jan', value: 2100 },
    { name: 'Feb', value: 2200 },
    { name: 'Mar', value: 2150 },
    { name: 'Apr', value: 2300 },
    { name: 'May', value: 2350 },
    { name: 'Jun', value: 2420 },
];

const appointmentsData = [
    { name: 'Jan', value: 1300 },
    { name: 'Feb', value: 1250 },
    { name: 'Mar', value: 1180 },
    { name: 'Apr', value: 1150 },
    { name: 'May', value: 1190 },
    { name: 'Jun', value: 1210 },
];

const activeNowData = [
    { name: 'Jan', value: 280 },
    { name: 'Feb', value: 290 },
    { name: 'Mar', value: 295 },
    { name: 'Apr', value: 305 },
    { name: 'May', value: 310 },
    { name: 'Jun', value: 316 },
];

const recentAppointments = [
    {
        id: 1,
        patient: 'John Doe',
        doctor: 'Dr. Smith',
        department: 'Cardiology',
        time: '10:00 AM',
        status: 'Confirmed',
        avatar: 'JD'
    },
    {
        id: 2,
        patient: 'Jane Smith',
        doctor: 'Dr. Johnson',
        department: 'Neurology',
        time: '11:30 AM',
        status: 'Pending',
        avatar: 'JS'
    },
    {
        id: 3,
        patient: 'Mike Wilson',
        doctor: 'Dr. Brown',
        department: 'Orthopedics',
        time: '02:00 PM',
        status: 'Confirmed',
        avatar: 'MW'
    },
    {
        id: 4,
        patient: 'Sarah Davis',
        doctor: 'Dr. Taylor',
        department: 'Pediatrics',
        time: '03:30 PM',
        status: 'Confirmed',
        avatar: 'SD'
    },
    {
        id: 5,
        patient: 'Robert Brown',
        doctor: 'Dr. Anderson',
        department: 'General Medicine',
        time: '04:00 PM',
        status: 'Cancelled',
        avatar: 'RB'
    },
];

const StatCard = ({ title, value, change, trend, data, color }) => {
    const isPositive = trend === 'up';
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;

    return (
        <div className="card p-6">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-sm text-gray-600 mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</h3>
                </div>
                <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                </button>
            </div>

            <div className="flex items-center gap-2 mb-4">
                <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${isPositive
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                >
                    <TrendIcon className="w-3 h-3" />
                    {change}%
                </div>
                <span className="text-xs text-gray-500">vs last month</span>
            </div>

            <div className="h-20">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={2}
                            fill={`url(#gradient-${color})`}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const [selectedFilter, setSelectedFilter] = useState('All time');

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                        Welcome back, Admin
                    </h1>
                    <p className="text-gray-600">
                        Track, manage and forecast your hospital operations.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn-secondary flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button className="btn-primary flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add Appointment
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                    title="Total Patients"
                    value={2420}
                    change={40}
                    trend="up"
                    data={totalPatientsData}
                    color="#10b981"
                />
                <StatCard
                    title="Appointments"
                    value={1210}
                    change={10}
                    trend="down"
                    data={appointmentsData}
                    color="#ef4444"
                />
                <StatCard
                    title="Active Now"
                    value={316}
                    change={20}
                    trend="up"
                    data={activeNowData}
                    color="#10b981"
                />
            </div>

            {/* Appointments Table */}
            <div className="card">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Recent Appointments
                        </h2>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search"
                                    className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-0.5 text-xs text-gray-500 bg-white border border-gray-200 rounded">
                                    ⌘K
                                </kbd>
                            </div>
                            <button className="btn-secondary flex items-center gap-2">
                                <Filter className="w-4 h-4" />
                                More filters
                            </button>
                        </div>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1.5 bg-gray-900 text-white text-sm rounded-full">
                            All time
                        </button>
                        <button className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200">
                            US, AU, +4
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left">
                                    <input type="checkbox" className="rounded" />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Patient
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Doctor
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Department
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Time
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {recentAppointments.map((appointment) => (
                                <tr key={appointment.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <input type="checkbox" className="rounded" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-sm">
                                                {appointment.avatar}
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">
                                                {appointment.patient}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {appointment.doctor}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {appointment.department}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {appointment.time}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${appointment.status === 'Confirmed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : appointment.status === 'Pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {appointment.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button className="p-1.5 hover:bg-gray-100 rounded">
                                                <Eye className="w-4 h-4 text-gray-500" />
                                            </button>
                                            <button className="p-1.5 hover:bg-gray-100 rounded">
                                                <Edit className="w-4 h-4 text-gray-500" />
                                            </button>
                                            <button className="p-1.5 hover:bg-gray-100 rounded">
                                                <Trash2 className="w-4 h-4 text-gray-500" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
