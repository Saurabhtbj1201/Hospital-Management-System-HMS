const Service = require('../models/Service');

exports.getServices = async (req, res) => {
    try {
        const services = await Service.find({ isActive: true }).populate('department', 'name');
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createService = async (req, res) => {
    const { name, description, department, price } = req.body;
    try {
        const service = await Service.create({
            name,
            description,
            department,
            price
        });
        res.status(201).json(service);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateService = async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(service);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteService = async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        res.json({ message: 'Service deactivated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
