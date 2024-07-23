const appointmentService = require('../services/appointmentService');

const createAppointment = async (req, res) => {
    const customerId = req.user.userId;
    const { clinicId, dentistId, serviceId, slotId, appointmentDate } = req.body;
    console.log(customerId, clinicId, dentistId, serviceId, slotId, appointmentDate);

    try {
        const appointment = await appointmentService.createAppointment(customerId, clinicId, dentistId, serviceId, slotId, appointmentDate);
        res.status(201).json({ message: 'Appointment created successfully', appointment });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
};

const confirmAppointment = async (req, res) => {
    const appointmentId = req.params.appointmentId;

    try {
        const appointment = await appointmentService.confirmAppointment(appointmentId);
        res.json({ message: 'Appointment confirmed successfully', appointment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error confirming appointment' });
    }
};

const createReappointment = async (req, res) => {
    const { type, appointmentId, periodicInterval, reappointmentCount } = req.body;
    try {
        const reappointment = await appointmentService.createReappointment(type, appointmentId, periodicInterval, reappointmentCount);
        res.status(201).json({ reappointment });
    } catch (error) {
        console.error('Error creating reappointment:', error);
        res.status(500).json({ error: 'Failed to create reappointment' });
    }
};

const cancelAppointment = async (req, res) => {
    const appointmentId = req.params.appointmentId;

    try {
        const appointment = await appointmentService.cancelAppointment(appointmentId);
        res.json({ message: 'Appointment cancelled successfully', appointment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error cancelling appointment' });
    }
};

module.exports = {
    createAppointment,
    confirmAppointment,
    createReappointment,
    cancelAppointment
};
