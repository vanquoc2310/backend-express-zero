const userService = require('../services/userService');

const getHistoryResult = async (req, res) => {
    const customerId  = req.user.userId;
  
    try {
        const history = await userService.getHistoryResult(customerId);
        res.json(history);
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  };

const createFeedback = async (req, res) => {
    try {
        const { rating, feedback_text } = req.body;
        const customer_id = req.user.userId; // Lấy customer_id từ người dùng đăng nhập
        const examination_result_id = req.params.id; // Lấy id của examination_result từ req.params

        const feedbackData = { customer_id, rating, feedback_text, examination_result_id };
        const result = await userService.createFeedback(feedbackData);

        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getPatientAppointments = async (req, res) => {
  const customerId = req.user.userId; // Lấy customerId từ req.user hoặc từ nơi bạn lưu trữ thông tin user đã đăng nhập

  try {
      const appointments = await userService.getPatientAppointments(customerId);

      res.json(appointments);
  } catch (error) {
      console.error('Error fetching customer appointments:', error);
      res.status(500).json({ error: 'Failed to fetch customer appointments' });
  }
};

  
  module.exports = {
    getHistoryResult,
    createFeedback,
    getPatientAppointments
  }