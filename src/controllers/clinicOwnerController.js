const clinicService = require('./../services/clinicService');
const dentistService = require('../services/dentistService');
const homeService = require('./../services/homeService');
const db = require("./../models");


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
        let { email, password, name, phonenumber, degree, description, image } = req.body;
        const clinic_id = req.user.clinicId;
        const dentistData = { email, password, name, phonenumber, degree, description, clinic_id, image };
        const result = await dentistService.addDentist(dentistData);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


const updateDentist = async (req, res) => {
    try {
        const dentistId = req.params.id;
        const { email, name, phonenumber, degree, description, status, image } = req.body;
        const dentistData = { email, name, phonenumber, degree, description, status, image };
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

const getAllSlots = async (req, res) => {
    try {
      const slots = await db.slot.findAll();
      res.json(slots);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};

const createDentistScheduleByDate = async (req, res) => {
    const { dentist_id, slot_ids, date } = req.body;
  
    // Log the received data
    console.log("Received data:", { dentist_id, slot_ids, date });
  
    // Parse slot_ids if it's a string
    let parsedSlotIds = slot_ids;
    if (typeof slot_ids === 'string') {
      try {
        parsedSlotIds = JSON.parse(slot_ids);
      } catch (error) {
        return res.status(400).json({ error: "Invalid slot_ids format. Must be a valid JSON array." });
      }
    }
  
    // Validate input
    if (!Array.isArray(parsedSlotIds)) {
      return res.status(400).json({ error: "slot_ids must be an array" });
    }
  
    try {
      const dentistSlots = await Promise.all(
        parsedSlotIds.map(async (slot_id) => {
          // Check if the slot already exists for the dentist on the given date
          const existingSlot = await db.dentist_slot.findOne({
            where: {
              dentist_id,
              slot_id,
              date
            }
          });
  
          // If the slot already exists, return it instead of creating a new one
          if (existingSlot) {
            return existingSlot;
          }
  
          // If the slot does not exist, create a new one
          return db.dentist_slot.create({
            dentist_id,
            slot_id,
            date,
            current_patients: 0
          });
        })
      );
  
      res.status(201).json(dentistSlots);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
   const getAppointmentsAndReappointmentsByClinic =  async (req, res) => {
    try {
        let { clinicId } = req.params;
        if (clinicId === undefined) clinicId = req.user.clinicId;
  
      if (!clinicId) {
        return res.status(400).json({ error: "Clinic ID is required" });
      }

      console.log(clinicId);
  
      const data = await clinicService.getAppointmentsAndReappointmentsByClinic(clinicId);
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  const getFilteredAppointmentsAndReappointments = async (req, res) => {
    try {
      const { status, dentistId, type, date } = req.query;
      const clinicId = req.user.clinicId;
      console.log(clinicId);
  
      const filters = { status, dentistId, clinicId, type, date };
  
      const data = await clinicService.getFilteredAppointmentsAndReappointments(filters);
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  const updateDentistSlotsByDate = async (req, res) => {
    const { dentist_id, slot_ids, date } = req.body;

    try {
        const updatedSlots = await clinicService.updateDentistSlotsByDate(dentist_id, slot_ids, date);
        res.status(201).json(updatedSlots);
    } catch (error) {
        res.status(500).json({ error: error.message });
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
    getDetailClinicByClinicOwner,
    getAllSlots,
    createDentistScheduleByDate,
    getAppointmentsAndReappointmentsByClinic,
    getFilteredAppointmentsAndReappointments,
    updateDentistSlotsByDate
};
