const clinicService = require('./../services/clinicService');
const dentistService = require('../services/dentistService');
const homeService = require('./../services/homeService');



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

const searchDentistsByName = async (req, res) => {
    try {
        const dentists = await dentistService.searchDentistsByName(req.query.name);
        res.json(dentists);
    } catch (err) {
        console.error('Error searching dentists:', err);
        res.status(500).json({ error: 'Failed to search dentists' });
    }
};

const addDentist = async (req, res) => {
    try {
        let { email, password, name, phonenumber, degree, description } = req.body;
        const clinic_id = req.user.clinicId;
        const dentistData = { email, password, name, phonenumber, degree, description, clinic_id };
        const result = await dentistService.addDentist(dentistData);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


const updateDentist = async (req, res) => {
    try {
        const dentistId = req.params.id;
        const { email, name, phonenumber, status, degree, description } = req.body;
        const dentistData = { email, name, phonenumber, status, degree, description };
        const result = await dentistService.updateDentist(dentistId, dentistData);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const deleteDentist = async (req, res) => {
    try {
        const dentistId = req.params.id;
        const result = await dentistService.deleteDentist(dentistId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getDentistsByClinicClinicOwner = async (req, res) => {
    try {
        let { clinicId } = req.params;

        if (clinicId === undefined) clinicId = req.user.clinicId;
        
        const clinic = await dentistService.getDentistsByClinicOwner(clinicId)
        if (!clinic) {
            return res.status(404).json({ error: 'Dentists of this clinic not found.' });
        }

        // Logic to fetch additional data or process as needed

        return res.status(200).json({ clinic });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getDetailClinicByClinicOwner = async (req, res) => {
    try {
        let { id } = req.params;
        if (id === undefined) id = req.user.clinicId;
        const clinic = await homeService.getClinicByIdDetail(id);
        if (!clinic) {
            return res.status(404).json({ error: 'Clinic not found.' });
        }


        return res.status(200).json({ clinic });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    putUpdateClinic,
    postCreateClinic,
    deleteClinicById,
    searchDentistsByName,
    addDentist,
    updateDentist,
    deleteDentist,
    getDentistsByClinicClinicOwner,
    getDetailClinicByClinicOwner
};
