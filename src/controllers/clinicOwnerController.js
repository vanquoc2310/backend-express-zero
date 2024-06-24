const clinicService = require('./../services/clinicService');


let putUpdateClinic = async (req, res) => {
    try {
        let clinic = await clinicService.updateClinic(req.body);
        return res.status(200).json({
            message: 'Update success',
            clinic: clinic
        });
    } catch (error) {
        console.error('Error updating clinic:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


let postCreateClinic = async (req, res) => {
    try {
        let clinic = await clinicService.createNewClinic(req.body);
        return res.status(200).json({
            message: 'Create success',
            clinic: clinic
        });
    } catch (error) {
        console.error('Error creating clinic:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

let deleteClinicById = async (req, res) => {
    try {
        let clinic = await clinicService.deleteClinicById(req.body.id);
        return res.status(200).json({
            message: 'Delete success',
            clinic
        });
    } catch (error) {
        console.error('Error deleting clinic:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { 
    putUpdateClinic,
    postCreateClinic,
    deleteClinicById
};
