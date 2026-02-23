import { Users as UsersIcon, Plus, Search, Filter, MoreVertical } from 'lucide-react';

const Users = () => {
    return (
        <div className="p-6">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">User Management</h1>
                    <p className="text-gray-600">Manage system users and their roles</p>
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add User
                </button>
            </div>

            <div className="card p-6">
                <p className="text-gray-500">User management interface coming soon...</p>
            </div>
        </div>
    );
};

export default Users;
