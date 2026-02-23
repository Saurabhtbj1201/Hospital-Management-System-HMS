const User = require('../models/User');
const Doctor = require('../models/Doctor');
const bcrypt = require('bcryptjs');

// Get all users by role
exports.getUsersByRole = async (req, res) => {
    try {
        const { role } = req.params;

        if (!['Admin', 'Doctor', 'Receptionist'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const users = await User.find({ role }).select('-password').sort({ createdAt: -1 });

        // If fetching doctors, populate their department information
        if (role === 'Doctor') {
            const usersWithDepartments = await Promise.all(
                users.map(async (user) => {
                    const doctor = await Doctor.findOne({ user: user._id })
                        .populate('department', 'name')
                        .populate('departments', 'name');
                    
                    return {
                        ...user.toObject(),
                        doctorInfo: doctor ? {
                            primaryDepartment: doctor.department,
                            allDepartments: doctor.departments
                        } : null
                    };
                })
            );
            return res.json(usersWithDepartments);
        }
        
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new user (Doctor, Receptionist, or Admin)
exports.createUser = async (req, res) => {
    try {
        const { name, email, phone, role } = req.body;

        // Validate role
        if (!['Admin', 'Doctor', 'Receptionist'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // Check if user already exists
        const userExists = await User.findOne({ $or: [{ email }, { phone }] });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email or phone already exists' });
        }

        // Set default password based on role
        let defaultPassword;
        switch (role) {
            case 'Doctor':
                defaultPassword = 'hms@doctor';
                break;
            case 'Receptionist':
                defaultPassword = 'hms@receptionist';
                break;
            case 'Admin':
                defaultPassword = 'hms@admin';
                break;
            default:
                defaultPassword = 'hms@default';
        }

        const user = await User.create({
            name,
            email,
            phone,
            role,
            password: defaultPassword
        });

        // Auto-create Doctor profile for Doctor role
        if (role === 'Doctor') {
            await Doctor.create({
                user: user._id,
                department: null,
                departments: [],
                qualifications: '',
                experience: 0,
                fees: 0
            });
        }

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update user details
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, isActive } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if email or phone is taken by another user
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email, _id: { $ne: id } });
            if (emailExists) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        if (phone && phone !== user.phone) {
            const phoneExists = await User.findOne({ phone, _id: { $ne: id } });
            if (phoneExists) {
                return res.status(400).json({ message: 'Phone already in use' });
            }
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        if (isActive !== undefined) user.isActive = isActive;

        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Deactivate/Activate user
exports.toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent self-deactivation
        if (id === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot deactivate your own account' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.json({
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
            isActive: user.isActive
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Reset user password
exports.resetUserPassword = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Set password based on role
        let newPassword;
        switch (user.role) {
            case 'Doctor':
                newPassword = 'hms@doctor';
                break;
            case 'Receptionist':
                newPassword = 'hms@receptionist';
                break;
            case 'Admin':
                newPassword = 'hms@admin';
                break;
            default:
                newPassword = 'hms@default';
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent self-deletion
        if (id === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot delete your own account' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Also delete Doctor profile if role is Doctor
        if (user.role === 'Doctor') {
            await Doctor.findOneAndDelete({ user: id });
        }

        await User.findByIdAndDelete(id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
