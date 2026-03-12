const StudentCouncil = require('../models/StudentCouncil');

// Get all student council members
exports.getAllMembers = async (req, res) => {
    try {
        const members = await StudentCouncil.find({ isActive: true }).sort({ order: 1 });
        res.json({
            success: true,
            data: members
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get single member
exports.getMember = async (req, res) => {
    try {
        const member = await StudentCouncil.findById(req.params.id);
        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }
        res.json({
            success: true,
            data: member
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Add new member
exports.addMember = async (req, res) => {
    try {
        const { name, position, department, pledge, email, phone, order } = req.body;

        if (!name || !position || !department) {
            return res.status(400).json({
                success: false,
                message: 'Name, position, and department are required'
            });
        }

        // Photo: prefer uploaded file, fall back to URL in body
        let photo = req.body.photo || '';
        if (req.file) {
            photo = `/uploads/${req.file.filename}`;
        }

        const member = new StudentCouncil({
            name,
            position,
            department,
            photo,
            pledge,
            email,
            phone,
            order: order || 0,
            isActive: true
        });

        await member.save();

        res.status(201).json({
            success: true,
            data: member,
            message: 'Member added successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update member
exports.updateMember = async (req, res) => {
    try {
        const { name, position, department, pledge, email, phone, order, isActive } = req.body;

        // Photo: prefer uploaded file, fall back to URL in body, or keep existing
        const updates = { name, position, department, pledge, email, phone, order, isActive };
        if (req.file) {
            updates.photo = `/uploads/${req.file.filename}`;
        } else if (req.body.photo !== undefined) {
            updates.photo = req.body.photo;
        }

        const member = await StudentCouncil.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        );

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }

        res.json({
            success: true,
            data: member,
            message: 'Member updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete member
exports.deleteMember = async (req, res) => {
    try {
        const member = await StudentCouncil.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }

        res.json({
            success: true,
            message: 'Member deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
