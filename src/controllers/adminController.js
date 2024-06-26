const clinicService = require('../services/clinicService');
const dentistService = require('../services/dentistService');
const adminService = require('../services/adminService');
const clinicOwnerService = require('../services/clinicOwnerService');


exports.getAllClinics = async (req, res) => {
    try {
        const clinics = await clinicService.getAllClinics();
        res.json(clinics);
    } catch (err) {
        console.error('Error retrieving clinics:', err);
        res.status(500).json({ error: 'Failed to retrieve clinics' });
    }
};

exports.getAllDentists = async (req, res) => {
    try {
        const dentists = await dentistService.getAllDentists();
        res.json(dentists);
    } catch (err) {
        console.error('Error retrieving dentists:', err);
        res.status(500).json({ error: 'Failed to retrieve dentists' });
    }
};

exports.createUser = async (req, res) => {
    const { email, password, name, phonenumber, role_id, image, clinic_id } = req.body;
    try {
        const newUser = await adminService.createUser({ email, password, name, phonenumber, role_id, image, clinic_id });
        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ error: 'Failed to create user' });
    }
};

exports.updateUser = async (req, res) => {
    const { userId } = req.params;
    const { email, password, name, phonenumber, role_id, image, clinic_id } = req.body;
    try {
        const updatedUser = await adminService.updateUser({ userId, email, password, name, phonenumber, role_id, image, clinic_id });
        res.json(updatedUser);
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ error: 'Failed to update user' });
    }
};

exports.deleteUser = async (req, res) => {
    const { userId } = req.params;
    try {
        await adminService.deleteUser(userId);
        res.json({ message: 'User status updated to false successfully' });
    } catch (err) {
        console.error('Error updating user status:', err);
        res.status(500).json({ error: 'Failed to update user status' });
    }
};


exports.getCustomersAndClinicOwners = async (req, res) => {
    try {
        const users = await adminService.getCustomersAndClinicOwners();
        res.status(200).json(users);
    } catch (err) {
        console.error('Error retrieving users:', err);
        res.status(500).json({ error: 'Failed to retrieve users' });
    }
};

exports.searchClinicsByName = async (req, res) => {
    try {
        const clinics = await clinicService.searchClinicsByName(req.query.name);
        res.json(clinics);
    } catch (err) {
        console.error('Error searching clinics:', err);
        res.status(500).json({ error: 'Failed to search clinics' });
    }
};


exports.searchClinicOwnersByName = async (req, res) => {
    try {
        const clinicOwners = await clinicOwnerService.searchClinicOwnersByName(req.query.name);
        res.json(clinicOwners);
    } catch (err) {
        console.error('Error searching clinic owners:', err);
        res.status(500).json({ error: 'Failed to search clinic owners' });
    }
};
