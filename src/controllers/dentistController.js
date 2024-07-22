const dentistService = require('../services/dentistService')

const getSlotsForDate = async (req, res) => {
  try {
    const { dentistId, date } = req.query; 

    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const slots = await dentistService.getSlotsForDate(dentistId, date);
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAvailableSlotsForDate = async (req, res) => {
  const { dentistId } = req.params;
  const { date } = req.query;

  try {
    const slots = await dentistService.getAvailableSlots(dentistId, date);
    res.json(slots);
  } catch (error) {
    res.status(500).send('Error fetching available slots');
  }
};

const getDentistWeeklySchedule = async (req, res) => {
  try {
    const dentistId = req.user.userId;
    console.log(dentistId);
    const selectedDate = req.query.date; // sử dụng query parameters
    const schedule = await dentistService.getDentistWeeklySchedule(dentistId, selectedDate);

    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDentistPatients = async (req, res) => {
  const dentistId = req.user.userId; // assuming the logged-in dentist ID is in req.user.userId

  try {
      const patients = await dentistService.getDentistPatients(dentistId);
      res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDentistPatientHistory = async (req, res) => {
  const { customerId } = req.params;

  try {
      const history = await dentistService.getDentistPatientHistory(customerId);
      res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
};

const createExaminationResult = async (req, res) => {
  try {
    const { appointmentId, result, type } = req.body;
    console.log(appointmentId, result, type);

    // Call the service method to handle business logic
    const examinationResult = await dentistService.createExaminationResult(appointmentId, result, type);

    res.json(examinationResult);
  } catch (error) {
    console.error('Error creating examination result:', error);
    res.status(500).json({ error: 'An error occurred while creating examination result.' });
  }
};


module.exports = {
  getSlotsForDate,
  getAvailableSlotsForDate,
  getDentistWeeklySchedule,
  getDentistPatients,
  getDentistPatientHistory,
  createExaminationResult
}