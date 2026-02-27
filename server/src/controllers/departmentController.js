const Department = require('../models/Department');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { getPresignedUrl, uploadToS3, deleteFromS3 } = require('../services/s3Service');

// Get all departments
exports.getDepartments = async (req, res) => {
    try {
        const departments = await Department.find({ isActive: true });

        // Generate presigned URLs for department images
        const departmentsWithImages = await Promise.all(
            departments.map(async (dept) => {
                const deptObj = dept.toObject();
                deptObj.imageUrl = await getPresignedUrl(dept.image);
                return deptObj;
            })
        );

        res.json(departmentsWithImages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all departments (including inactive) - Admin only
exports.getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.find().sort({ createdAt: -1 });
        
        // Add doctor count for each department
        const departmentsWithCounts = await Promise.all(
            departments.map(async (dept) => {
                const doctorCount = await Doctor.countDocuments({
                    $or: [
                        { department: dept._id },
                        { departments: dept._id }
                    ]
                });
                const imageUrl = await getPresignedUrl(dept.image);
                return {
                    ...dept.toObject(),
                    doctorCount,
                    imageUrl
                };
            })
        );
        
        res.json(departmentsWithCounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single department with doctors
exports.getDepartmentById = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        // Get all doctors in this department
        const doctors = await Doctor.find({ 
            $or: [
                { department: req.params.id },
                { departments: req.params.id }
            ]
        }).populate('user', 'name email phone');

        // Generate presigned URLs for doctor profile photos
        const doctorsWithPhotos = await Promise.all(
            doctors.map(async (doc) => {
                const doctorObj = doc.toObject();
                doctorObj.profilePhotoUrl = await getPresignedUrl(doc.profilePhoto);
                return doctorObj;
            })
        );

        const imageUrl = await getPresignedUrl(department.image);

        res.json({
            ...department.toObject(),
            imageUrl,
            doctors: doctorsWithPhotos
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create department
exports.createDepartment = async (req, res) => {
    const { name, description, image, defaultConsultationFee, services, contact } = req.body;
    try {
        const departmentExists = await Department.findOne({ name });
        if (departmentExists) {
            return res.status(400).json({ message: 'Department already exists' });
        }

        const department = await Department.create({
            name,
            description,
            image,
            defaultConsultationFee,
            services: services || [],
            contact: contact || {}
        });
        res.status(201).json(department);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update department
exports.updateDepartment = async (req, res) => {
    try {
        const { name, description, image, defaultConsultationFee, services, contact } = req.body;
        
        const department = await Department.findById(req.params.id);
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        // Check if name is being changed and already exists
        if (name && name !== department.name) {
            const nameExists = await Department.findOne({ name, _id: { $ne: req.params.id } });
            if (nameExists) {
                return res.status(400).json({ message: 'Department name already exists' });
            }
        }

        department.name = name || department.name;
        department.description = description !== undefined ? description : department.description;
        department.image = image !== undefined ? image : department.image;
        department.defaultConsultationFee = defaultConsultationFee !== undefined ? defaultConsultationFee : department.defaultConsultationFee;
        department.services = services !== undefined ? services : department.services;
        department.contact = contact !== undefined ? contact : department.contact;

        await department.save();
        res.json(department);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Toggle department status
exports.toggleDepartmentStatus = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        department.isActive = !department.isActive;
        await department.save();

        res.json({ 
            message: `Department ${department.isActive ? 'activated' : 'deactivated'} successfully`,
            isActive: department.isActive
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete department (soft delete)
exports.deleteDepartment = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        // Check if department has active doctors
        const doctorCount = await Doctor.countDocuments({ 
            department: req.params.id,
            isActive: true 
        });

        if (doctorCount > 0) {
            return res.status(400).json({ 
                message: `Cannot delete department. It has ${doctorCount} active doctor(s). Please reassign them first.` 
            });
        }

        department.isActive = false;
        await department.save();

        res.json({ message: 'Department deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Upload department image
exports.uploadDepartmentImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        const department = await Department.findById(req.params.id);
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        // Delete old image from S3 if exists
        if (department.image) {
            await deleteFromS3(department.image);
        }

        // Upload new image
        const key = await uploadToS3(
            req.file.buffer,
            req.file.originalname,
            'department-images',
            req.file.mimetype
        );

        department.image = key;
        await department.save();

        const imageUrl = await getPresignedUrl(key);

        res.json({
            message: 'Department image uploaded successfully',
            image: key,
            imageUrl
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete department image
exports.deleteDepartmentImage = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        if (department.image) {
            await deleteFromS3(department.image);
            department.image = '';
            await department.save();
        }

        res.json({ message: 'Department image deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Assign doctor to department
exports.assignDoctor = async (req, res) => {
    try {
        const { departmentId, userId, isPrimary } = req.body;

        const department = await Department.findById(departmentId);
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        const user = await User.findById(userId);
        if (!user || user.role !== 'Doctor') {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        let doctor = await Doctor.findOne({ user: userId });
        if (!doctor) {
            // Auto-create Doctor profile if it doesn't exist
            doctor = await Doctor.create({
                user: userId,
                department: null,
                departments: [],
                qualifications: '',
                experience: 0,
                fees: 0
            });
        }

        if (isPrimary) {
            // Set as primary department
            doctor.department = departmentId;
            // Add to departments array if not already there
            if (!doctor.departments.includes(departmentId)) {
                doctor.departments.push(departmentId);
            }
        } else {
            // Add to additional departments if not already there
            if (!doctor.departments.includes(departmentId)) {
                doctor.departments.push(departmentId);
            }
        }

        await doctor.save();
        
        const updatedDoctor = await Doctor.findById(doctor._id)
            .populate('user', 'name email phone')
            .populate('department', 'name')
            .populate('departments', 'name');

        res.json({ 
            message: 'Doctor assigned successfully',
            doctor: updatedDoctor
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Remove doctor from department
exports.removeDoctorFromDepartment = async (req, res) => {
    try {
        const { departmentId, doctorId } = req.body;

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Check if trying to remove primary department
        if (doctor.department.toString() === departmentId) {
            return res.status(400).json({ 
                message: 'Cannot remove primary department. Please set another department as primary first.' 
            });
        }

        // Remove from departments array
        doctor.departments = doctor.departments.filter(
            dept => dept.toString() !== departmentId
        );

        await doctor.save();

        res.json({ message: 'Doctor removed from department successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Set primary department for doctor
exports.setPrimaryDepartment = async (req, res) => {
    try {
        const { doctorId, departmentId } = req.body;

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        const department = await Department.findById(departmentId);
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        // Set as primary
        doctor.department = departmentId;
        
        // Ensure it's in the departments array
        if (!doctor.departments.includes(departmentId)) {
            doctor.departments.push(departmentId);
        }

        await doctor.save();

        const updatedDoctor = await Doctor.findById(doctor._id)
            .populate('user', 'name email phone')
            .populate('department', 'name');

        res.json({ 
            message: 'Primary department set successfully',
            doctor: updatedDoctor
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get available doctors (not assigned to department)
exports.getAvailableDoctors = async (req, res) => {
    try {
        const departmentId = req.params.departmentId;
        
        // Find all Doctor-role users who are active
        const doctorUsers = await User.find({ role: 'Doctor', isActive: true }).select('_id');
        const doctorUserIds = doctorUsers.map(u => u._id);

        // Auto-create Doctor profiles for any Doctor users that don't have one
        const existingProfiles = await Doctor.find({ user: { $in: doctorUserIds } }).select('user');
        const existingUserIds = existingProfiles.map(d => d.user.toString());
        
        const missingUserIds = doctorUserIds.filter(id => !existingUserIds.includes(id.toString()));
        if (missingUserIds.length > 0) {
            await Doctor.insertMany(
                missingUserIds.map(userId => ({
                    user: userId,
                    department: null,
                    departments: [],
                    qualifications: '',
                    experience: 0,
                    fees: 0
                }))
            );
        }
        
        // Get all doctor profiles with user data
        const doctors = await Doctor.find({ user: { $in: doctorUserIds }, isActive: true })
            .populate('user', 'name email phone')
            .populate('department', 'name');

        // Generate presigned URLs for doctor profile photos
        const doctorsWithPhotos = await Promise.all(
            doctors.map(async (doc) => {
                const doctorObj = doc.toObject();
                doctorObj.profilePhotoUrl = await getPresignedUrl(doc.profilePhoto);
                return doctorObj;
            })
        );

        res.json(doctorsWithPhotos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
