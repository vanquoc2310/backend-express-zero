const userService = require('../services/userService');
const db = require("./../models");


const getHistoryResult = async (req, res) => {
    const customerId  = req.user.userId;
  
    try {
        const history = await userService.getHistoryResult(customerId);
        res.json(history);
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  };

  const updateExistingFeedback = async (req, res) => {
    try {
        const { rating, feedback_text } = req.body;
        const customer_id = req.user.userId;
        const examination_result_id = req.params.id;

        // Kiểm tra xem người dùng đã gửi feedback cho kết quả khám này chưa
        const existingFeedback = await db.feedback.findOne({
            where: { customer_id, examination_result_id }
        });

        if (existingFeedback) {
            // Nếu đã tồn tại feedback, cập nhật feedback mới
            existingFeedback.rating = rating;
            existingFeedback.feedback_text = feedback_text;
            await existingFeedback.save();

            // Cập nhật trạng thái đã feedback trong examination_result
            await updateExaminationResult(examination_result_id, rating, feedback_text);

            return res.status(200).json(existingFeedback);
        } else {
            throw new Error("Feedback does not exist");
        }
    } catch (error) {
        console.error("Error updating existing feedback:", error);
        res.status(500).json({ message: "Failed to update existing feedback", error });
    }
};

// Hàm cập nhật trạng thái của examination_result
const updateExaminationResult = async (examination_result_id, rating, feedback_text) => {
    try {
        await db.examination_result.update(
            { hasFeedback: true, feedback_text, rating },
            { where: { id: examination_result_id } }
        );
    } catch (error) {
        console.error("Error updating examination_result:", error);
        throw new Error("Failed to update examination_result");
    }
};

const createNewFeedback = async (req, res) => {
  try {
      const { rating, feedback_text } = req.body;
      const customer_id = req.user.userId;
      const examination_result_id = req.params.id;

      // Tạo feedback mới nếu chưa tồn tại
      const feedbackData = { customer_id, rating, feedback_text, examination_result_id };
      const newFeedback = await userService.createFeedback(feedbackData);

      // Cập nhật trạng thái đã feedback trong examination_result
      await updateExaminationResult(examination_result_id, rating, feedback_text);

      return res.status(201).json(newFeedback);
  } catch (error) {
      console.error("Error creating new feedback:", error);
      res.status(500).json({ message: "Failed to create new feedback", error });
  }
};

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
    createNewFeedback,
    getPatientAppointments,
    updateExistingFeedback
  }