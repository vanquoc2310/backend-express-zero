const transValidation = {
    email_incorrect: "Invalid email",
    gender_incorrect: "Invalid gender",
    password_incorrect: "Password must have at least 6 characters",
    password_confirmation_incorrect: "The confirm password is not correct",
};


const transMailBookingSuccess = {
    subject: "Thông báo email về tiến trình đặt lịch tại hệ thống Doctors Care",
    template: (data) => {
        return `
            <html>
            <head>
                <style>
                    /* CSS styles */
                    body {
                        font-family: Arial, sans-serif;
                    }
                    .email-container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                    }
                    .email-header {
                        background-color: #f0f0f0;
                        padding: 10px;
                        text-align: center;
                    }
                    .email-content {
                        margin-top: 20px;
                    }
                    .email-content p {
                        margin-bottom: 10px;
                    }
                    .email-signature {
                        margin-top: 20px;
                        font-style: italic;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="email-header">
                        <h3>Cảm ơn bạn đã đặt lịch hẹn tại hệ thống SmileDentalCare</h3>
                    </div>
                    <div class="email-content">
                        <p>Chào bạn <strong>${data.customerName}</strong>,</p>
                        <p>Bạn có cuộc hẹn với:</p>
                        <p>- Bác sĩ <strong>${data.dentistName}</strong>,</p>
                        <p>- Vào lúc: <strong>${data.time}</strong>, ngày: <strong>${data.date}</strong></p>
                        <p>đã được xác nhận thành công.Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
                    </div>
                    <div class="email-signature">
                        <p>Trân trọng,</p>
                        <p>Đội ngũ phòng khám <strong>${data.clinicName}</strong></p>
                    </div>
                </div>
            </body>
            </html>
        `;
    },
};

const transMailBookingFailed = {
    subject: "Thông báo email về tiến trình đặt lịch tại hệ thống Doctors Care",
    template: (data) => {
        return `
            <html>
            <head>
                <style>
                    /* CSS styles */
                    body {
                        font-family: Arial, sans-serif;
                    }
                    .email-container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                    }
                    .email-header {
                        background-color: #f0f0f0;
                        padding: 10px;
                        text-align: center;
                    }
                    .email-content {
                        margin-top: 20px;
                    }
                    .email-content p {
                        margin-bottom: 10px;
                    }
                    .email-signature {
                        margin-top: 20px;
                        font-style: italic;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="email-header">
                        <h3>Cảm ơn bạn đã đặt lịch hẹn tại hệ thống SmileDentalCare</h3>
                    </div>
                    <div class="email-content">
                        <p>Chào bạn <strong>${data.customerName}</strong>,</p>
                        <p>Cuộc hẹn với:</p>
                        <p>- Bác sĩ <strong>${data.dentistName}</strong>,</p>
                        <p>- Vào lúc: <strong>${data.time}</strong>, ngày: <strong>${data.date}</strong></p>
                        <p>của bạn đã bị hủy. Lý do hủy: <strong>${data.reason}</strong></p>
                        <p>Chúng tôi rất tiếc về sự bất tiện này và mong rằng bạn sẽ sớm đặt lại lịch hẹn khác.</p>
                    </div>
                    <div class="email-signature">
                        <p>Trân trọng,</p>
                        <p>Đội ngũ phòng khám <strong>${data.clinicName}</strong></p>
                    </div>
                </div>
            </body>
            </html>
        `;
    },
};


const tranForgotPassword = {
    subject: "Password Reset Request",
    template: (linkVerify) => {
        return `<h3>Password Reset Request</h3>
        <p>You have requested to reset your password. Please click the link below to set a new password:</p>
        <a href="${linkVerify}">Reset Password</a>
        <p>If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
        <br>
        <p>Thank you,</p>
        <p>Your Company Team</p>`;
    },
};

module.exports = {
    transValidation,
    transMailBookingFailed,
    transMailBookingSuccess,
    tranForgotPassword,
};