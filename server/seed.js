const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const seedUsers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hms_db');
        console.log('MongoDB Connected');

        // Clear existing users (optional - comment out if you want to keep existing users)
        // await User.deleteMany({});
        // console.log('Cleared existing users');

        // Create test users
        const users = [
            {
                name: 'Mr. Admin',
                email: 'admin@hospital.com',
                phone: '1234567890',
                password: 'admin123',
                role: 'Admin'
            },
            {
                name: 'Mr. Receptionist',
                email: 'receptionist@hospital.com',
                phone: '1234567891',
                password: 'receptionist123',
                role: 'Receptionist'
            },
            {
                name: 'Dr. Doctor',
                email: 'doctor@hospital.com',
                phone: '1234567892',
                password: 'doctor123',
                role: 'Doctor'
            }
        ];

        for (const userData of users) {
            // Check if user already exists
            const existingUser = await User.findOne({
                $or: [{ email: userData.email }, { phone: userData.phone }]
            });

            if (existingUser) {
                console.log(`User ${userData.email} already exists, skipping...`);
                continue;
            }

            const user = await User.create(userData);
            console.log(`Created user: ${user.name} (${user.role})`);
        }

        console.log('\n✅ Seed completed successfully!');
        console.log('\nTest Credentials:');
        console.log('─────────────────────────────────────────');
        console.log('Admin:');
        console.log('  Email: admin@hospital.com');
        console.log('  Phone: 1234567890');
        console.log('  Password: admin123');
        console.log('\nReceptionist:');
        console.log('  Email: receptionist@hospital.com');
        console.log('  Phone: 1234567891');
        console.log('  Password: receptionist123');
        console.log('\nDoctor:');
        console.log('  Email: doctor@hospital.com');
        console.log('  Phone: 1234567892');
        console.log('  Password: doctor123');
        console.log('─────────────────────────────────────────\n');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedUsers();
