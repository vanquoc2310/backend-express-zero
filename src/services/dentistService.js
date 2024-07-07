const db = require('../models');
const { Op } = require('sequelize');
const moment = require('moment-timezone');


const getAllDentists = async () => {
    return db.user.findAll({
        where: { role_id: 3, status: true },
        include: [
            {
                model: db.dentist_info,
                as: 'dentist_info',
                include: [
                    {
                        model: db.clinic,
                        as: 'clinic'
                    }
                ]
            }
        ]
    });
};

const searchDentistsByName = async (name) => {
    return db.user.findAll({
        where: {
            role_id: 3,
            name: {
                [db.Sequelize.Op.like]: `%${name}%`
            },
            status: true
        },
        include: [
            {
                model: db.dentist_info,
                as: 'dentist_info',
                include: [
                    {
                        model: db.clinic,
                        as: 'clinic'
                    }
                ]
            }
        ]
    });
};

const getDentistsByClinic = async (clinicId) => {
    return db.clinic.findAll({
        where: { id: clinicId, status: true },
        include: [
            {
                model: db.dentist_info,
                as: 'dentist_infos',
                include: [
                    {
                        model: db.user,
                        as: 'dentist',
                    }
                ]
            }
        ]
    });
};

const getSlotsForDate = async (dentistId, date) => {
    try {
        console.log(`Fetching slots for dentistId: ${dentistId}, date: ${date}`);
        const slots = await db.dentist_slot.findAll({
            where: {
                dentist_id: dentistId,
                date: date
            },
            include: [
                {
                    model: db.slot,
                    as: 'slot'
                }
            ]
        });

        return slots.map(ds => {
            return {
                slotId: ds.slot.id,
                startTime: ds.slot.start_time, 
                endTime: ds.slot.end_time,     
                currentPatients: ds.current_patients,
            };
        });
    } catch (error) {
        throw new Error('Error fetching slots');
    }
};

const getAvailableSlots = async (dentistId, date) => {
    try {
        const availableSlots = await db.dentist_slot.findAll({
            where: {
                dentist_id: dentistId,
                date: date,
            },
            include: [
                {
                    model: db.slot,
                    as: 'slot',
                    where: {
                        [db.Sequelize.Op.and]: [
                            db.Sequelize.literal('dentist_slot.current_patients <= slot.max_patients')
                        ]
                    }
                }
            ]
        });

        return availableSlots;
    } catch (error) {
        console.error('Error fetching available slots:', error);
        throw new Error('Failed to fetch available slots');
    }
};

const getDentistWeeklySchedule = async (dentistId) => {
    try {
        // Get today's date
        const currentDate = new Date();

        // Calculate dates for the next 7 days (Monday to Sunday)
        const startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Monday
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // Sunday

        // Query to get slots and dentist slots within the date range
        const dentistSchedule = await db.dentist_slot.findAll({
            where: {
                dentist_id: dentistId,
                date: {
                    [Op.between]: [startDate, endDate],
                },
            },
            include: [
                {
                    model: db.slot,
                    as: 'slot',
                },
                {
                    model: db.user,
                    as: 'dentist',
                    attributes: ['id', 'name'],
                },
            ],
            order: [
                ['date', 'ASC'],
                [{ model: db.slot, as: 'slot' }, 'start_time', 'ASC'],
            ],
        });

        return dentistSchedule;
    } catch (error) {
        console.error('Error fetching dentist schedule:', error);
        throw new Error('Failed to fetch dentist schedule');
    }
};


const getDentistPatients = async (dentistId) => {
    try {
        // Fetch confirmed appointments with associated slots and users
        const appointments = await db.appointment.findAll({
            where: { dentist_id: dentistId, status: 'Confirmed' },
            include: [
                {
                    model: db.user,
                    as: 'customer',
                    attributes: ['id', 'name', 'email', 'phonenumber']
                },
                {
                    model: db.slot,
                    as: 'slot',
                    attributes: ['id', 'start_time', 'end_time']
                }
            ],
        });

        // Fetch confirmed reappointments with associated slots and users
        const reappointments = await db.reappointment.findAll({
            where: { dentist_id: dentistId, status: 'Confirmed' },
            include: [
                {
                    model: db.user,
                    as: 'customer',
                    attributes: ['id', 'name', 'email', 'phonenumber']
                },
                {
                    model: db.slot,
                    as: 'slot',
                    attributes: ['id', 'start_time', 'end_time']
                }
            ],
        });

        // Combine appointments and reappointments with relevant information
        const allPatients = [
            ...appointments.map(appointment => ({
                type: 'Appointment',
                customer: appointment.customer,
                date: appointment.slot.date,
                clinic_id: appointment.clinic_id,
                service_id: appointment.service_id,
                slot: {
                    id: appointment.slot.id,
                    start_time: appointment.slot.start_time,
                    end_time: appointment.slot.end_time
                }
            })),
            ...reappointments.map(reappointment => ({
                type: 'Reappointment',
                customer: reappointment.customer,
                date: reappointment.slot.date,
                clinic_id: reappointment.clinic_id,
                service_id: reappointment.service_id,
                slot: {
                    id: reappointment.slot.id,
                    start_time: reappointment.slot.start_time,
                    end_time: reappointment.slot.end_time
                }
            }))
        ];

        // Sort patients based on date and slot ID
        allPatients.sort((a, b) => {
            const dateComparison = new Date(a.date) - new Date(b.date);
            if (dateComparison !== 0) return dateComparison;

            return a.slot.id - b.slot.id;
        });

        // Use a Map to remove duplicate patients based on patient ID
        const uniquePatientsMap = new Map();
        allPatients.forEach(patient => {
            uniquePatientsMap.set(patient.customer.id, patient);
        });

        // Convert the Map back to an array of unique patients
        const uniquePatients = Array.from(uniquePatientsMap.values());

        return uniquePatients;
    } catch (error) {
        console.error('Error fetching dentist patients:', error);
        throw new Error('Failed to fetch dentist patients');
    }
};



const getDentistPatientHistory = async (dentistId, customerId) => {
    try {
        const history = await db.examination_result.findAll({
            where: { customer_id: customerId },
            include: [
                {
                    model: db.appointment,
                    as: 'appointment',
                    required: false
                },
                {
                    model: db.reappointment,
                    as: 'reappointment',
                    required: false
                },
            ],
            order: [['result_date', 'DESC']],
        });
        // Định dạng lại result_date trước khi trả về
        const formattedHistory = history.map(entry => ({
            ...entry.toJSON(),
            result_date: new Date(entry.result_date).toLocaleString('en-US', { timeZone: 'UTC' }) // Định dạng theo yêu cầu
        }));

        return formattedHistory;
    } catch (error) {
        console.error('Error fetching patient history:', error);
        throw new Error('Failed to fetch patient history');
    }
};

const createExaminationResult = async (appointmentId, result) => {
    try {
      let appointment = await db.appointment.findByPk(appointmentId);
      let reappointment = null;
  
      if (!appointment) {
        reappointment = await db.reappointment.findByPk(appointmentId);
        if (!reappointment) {
          throw new Error('Appointment or Reappointment not found.');
        }
      }

       // Lấy ngày giờ hiện tại theo múi giờ Việt Nam
       const resultDate = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss');

       const examinationResultData = {
           result,
           result_date: db.sequelize.literal(`CONVERT(datetime, '${resultDate}', 120)`), // Assuming SQL Server
           customer_id: appointment ? appointment.customer_id : reappointment.customer_id,
       };
  
      if (appointment) {
        examinationResultData.appointment_id = appointmentId;
        await appointment.update({ status: 'Completed' });
      } else {
        examinationResultData.reappointment_id = appointmentId;
        await reappointment.update({ status: 'Completed' });
      }
  
      const examinationResult = await db.examination_result.create(examinationResultData);
  
      return examinationResult;
    } catch (error) {
      console.error('Error in createExaminationResult service:', error);
      throw new Error('Failed to create examination result.');
    }
  };

  



module.exports = {
    getAllDentists,
    searchDentistsByName,
    getDentistsByClinic,
    getSlotsForDate,
    getAvailableSlots,
    getDentistWeeklySchedule,
    getDentistPatients,
    getDentistPatientHistory,
    createExaminationResult
}