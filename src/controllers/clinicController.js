const clinicService = require('../services/clinicService');

const getServicesByClinic = async (req, res) => {
    const clinicId = req.params.clinicId;
  
    try {
      const services = await clinicService.getServicesByClinic(clinicId);
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch services by clinic' });
    }
  };

  module.exports = {
    getServicesByClinic
  }