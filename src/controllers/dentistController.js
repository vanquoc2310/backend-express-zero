const dentistService = require('../services/dentistService')

const getSlotsForDate = async (req, res) => {
  try {
    const dentistId = req.user.userId; // Lấy dentistId từ thông tin user đã được xác thực
    const { date } = req.query; // Ngày được chọn từ query parameter

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
    // Call service to fetch dentist's weekly schedule
    const schedule = await dentistService.getDentistWeeklySchedule(dentistId);

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
  const dentistId = req.user.userId; // assuming the logged-in dentist ID is in req.user.userId
  const { customerId } = req.params;

  try {
      const history = await dentistService.getDentistPatientHistory(dentistId, customerId);
      res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
};

const createExaminationResult = async (req, res) => {
  try {
    const { appointmentId, result } = req.body;

    // Call the service method to handle business logic
    const examinationResult = await dentistService.createExaminationResult(appointmentId, result);

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