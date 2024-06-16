const transValidation = {
    email_incorrect: "Invalid email",
    gender_incorrect: "Invalid gender",
    password_incorrect: "Password must have at least 6 characters",
    password_confirmation_incorrect: "The confirm password is not correct",
};

const transMailBookingNew = {
    subject: "Email notification of booking progress at Doctors Care",
    template: (data) => {
        return `<h3>Thank you for booking an appointment at Doctors Care's system </h3>
        <h4>Information for booked appointment:</h4>
        <div>Doctor's name: ${data.doctor} </div>
        <div>Time: ${data.time}</div>
        <div>Date: ${data.date}</div>
        <div>Status: <b> Pending - A new appointment is waiting for confirmation</b></div>
        <h4>Doctors Care system will automatically send email notification when confirmed appointment is complete. Thank you !</h4>`;
    },
};

const transMailBookingFailed = {
    subject: "Email notification of booking progress at Doctors Care",
    template: (data) => {
        return `<h3>Thank you for booking an appointment at Doctors Care's system  </h3>
        <h4>Information for booked appointment:</h4>
        <div>Doctor's name: ${data.doctor} </div>
        <div>Time: ${data.time}</div>
        <div>Date: ${data.date}</div>
        <div>Status: <b>Cancel - ${data.reason}</b></div>
        <h4>If you notice errors from this email, please contact the support operator: <b> 911 911 </b>. Thank you !</h4>`;
    },
};

const transMailBookingSuccess = {
    subject: "Email notification of booking progress at Doctors Care",
    template: (data) => {
        return `<h3>Thank you for booking an appointment at Doctors Care's system </h3>
        <h4>Information for booked appointment:</h4>
        <div>Doctor's name: ${data.doctor} </div>
        <div>Time: ${data.time}</div>
        <div>Date: ${data.date}</div>
        <div>Status: <b>Succeed</b></div>
        <h4>Thank you very much !</h4>`;
    },
};

const tranForgotPassword = {
    subject: "Password Reset Request",
    template: (data) => {
        return `<h3>Password Reset Request</h3>
        <p>You have requested to reset your password. Please click the link below to set a new password:</p>
        <a href="${data.linkVerify}">Reset Password</a>
        <p>If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
        <br>
        <p>Thank you,</p>
        <p>Your Company Team</p>`;
    },
};

module.exports = {
    transValidation,
    transMailBookingNew,
    transMailBookingFailed,
    transMailBookingSuccess,
    tranForgotPassword,
};