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


module.exports = {
  getSlotsForDate,
  getAvailableSlotsForDate,
  getDentistWeeklySchedule,
}