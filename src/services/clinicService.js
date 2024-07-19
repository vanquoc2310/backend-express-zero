const db = require("./../models");


// Hàm tạo mới một clinic
async function createNewClinic(item) {
  try {
    let clinic = await db.clinic.create(item);
    return clinic;
  } catch (error) {
    throw error;
  }
}

async function deleteClinicById(id) {
  const transaction = await db.sequelize.transaction();
  try {
    // Cập nhật trạng thái của clinic thành false
    await db.clinic.update({ status: false }, {
      where: { id: id },
      transaction: transaction
    });

    // Cập nhật trạng thái của tất cả bác sĩ thuộc clinic thành false
    await db.user.update({ status: false }, {
      where: {
        id: {
          [db.Sequelize.Op.in]: db.sequelize.literal(`(
                        SELECT dentist_id FROM dentist_info WHERE clinic_id = ${id}
                    )`)
        },
        role_id: 3
      },
      transaction: transaction
    });

    await transaction.commit();
    return 'Delete successful';
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// Hàm lấy thông tin của clinic dựa trên id
async function getClinicById(id) {
  try {
    let clinic = await db.clinic.findOne({
      where: { id: id },
    });
    return clinic;
  } catch (error) {
    throw error;
  }
}

// Hàm cập nhật thông tin của clinic
async function updateClinic(data) {
  try {
    let clinic = await db.clinic.findOne({
      where: { id: data.id }
    });
    if (!clinic) {
      throw new Error(`Clinic with id ${data.id} not found`);
    }
    await clinic.update(data);
    return true;
  } catch (error) {
    throw error;
  }
}


const getAllClinics = async () => {
  return db.clinic.findAll({
    include: [
      {
        model: db.clinic_schedule,
        as: 'clinic_schedules'
      },
      {
        model: db.clinic_service,
        as: 'clinic_services',
        include: [
          {
            model: db.service,
            as: 'service'
          }
        ]
      },
      {
        model: db.user,
        as: 'clinic_owner',
        attributes: ['name', 'email']
      }
    ]
  });
};

const searchClinicsByName = async (name) => {
  return db.clinic.findAll({
    where: {
      name: {
        [db.Sequelize.Op.like]: `%${name}%`
      }
    },
    include: [
      {
        model: db.clinic_schedule,
        as: 'clinic_schedules'
      },
      {
        model: db.clinic_service,
        as: 'clinic_services',
        include: [
          {
            model: db.service,
            as: 'service'
          }
        ]
      },
      {
        model: db.user,
        as: 'clinic_owner',
        attributes: ['name', 'email']
      }
    ]
  });
};

async function getServicesByClinic(clinicId) {
  try {
    const services = await db.service.findAll({
      include: [
        {
          model: db.clinic_service,
          as: 'clinic_services',
          where: {
            clinic_id: clinicId
          }
        }
      ]
    });

    return services;
  } catch (error) {
    console.error('Error fetching services by clinic:', error);
    throw new Error('Failed to fetch services by clinic');
  }
}

const getClinicByIdClinicOwner = async (clinicId) => {
  try {
    const clinic = await db.clinic.findOne({
      where: { id: clinicId, status: true },
      include: [
        {
          model: db.clinic_schedule,
          as: 'clinic_schedules'
        },
        {
          model: db.clinic_service,
          as: 'clinic_services',
          include: [
            {
              model: db.service,
              as: 'service'
            }
          ]
        },
        {
          model: db.user,
          as: 'clinic_owner',
          attributes: ['name', 'email']
        },
        {
          model: db.dentist_info,
          as: 'dentist_infos',
          include: [
            {
              model: db.user,
              as: 'dentist',
              attributes: ['id', 'name', 'email', 'status', 'name'],
            }
          ]
        }
      ]
    });

    if (!clinic) {
      throw new Error('Clinic not found');
    }

    // Format the start_time and end_time fields
    clinic.clinic_schedules.forEach(schedule => {
      schedule.start_time = new Date(schedule.start_time).toISOString().slice(11, 16);
      schedule.end_time = new Date(schedule.end_time).toISOString().slice(11, 16);
    });

    return clinic;
  } catch (error) {
    throw error;
  }
};

const getAppointmentsAndReappointmentsByClinic = async (clinicId) => {
  try {
    // Lấy appointments và sắp xếp
    const appointments = await db.appointment.findAll({
      where: { clinic_id: clinicId },
      order: [
        ['appointment_date', 'DESC'],
        [
          db.sequelize.literal(`CASE 
                        WHEN status = 'Pending' THEN 1
                        WHEN status = 'Confirmed' THEN 2
                        WHEN status = 'Completed' THEN 3
                        WHEN status = 'Cancelled' THEN 4
                        ELSE 5 END`),
          'ASC'
        ]
      ]
    });

    // Lấy reappointments và sắp xếp
    const reappointments = await db.reappointment.findAll({
      where: { clinic_id: clinicId },
      order: [
        ['reappointment_date', 'DESC'],
        [
          db.sequelize.literal(`CASE 
                        WHEN status = 'Pending' THEN 1
                        WHEN status = 'Confirmed' THEN 2
                        WHEN status = 'Completed' THEN 3
                        WHEN status = 'Cancelled' THEN 4
                        ELSE 5 END`),
          'ASC'
        ]
      ]
    });

    // Format appointments
    const formattedAppointments = appointments.map(appointment => ({
      id: appointment.id,
      status: appointment.status,
      appointment_date: appointment.appointment_date,
      type: 'appointment'
    }));

    // Format reappointments
    const formattedReappointments = reappointments.map(reappointment => ({
      id: reappointment.id,
      status: reappointment.status,
      reappointment_date: reappointment.reappointment_date,
      type: 'reappointment'
    }));

    // Lấy các thông tin include sau khi đã sắp xếp
    const appointmentIds = formattedAppointments.map(appointment => appointment.id);
    const reappointmentIds = formattedReappointments.map(reappointment => reappointment.id);

    const appointmentDetails = await db.appointment.findAll({
      where: { id: appointmentIds },
      include: [
        {
          model: db.slot,
          as: 'slot',
          attributes: ['id', 'start_time', 'end_time'],
        },
        {
          model: db.user,
          as: 'customer',
          attributes: ['id', 'name']
        },
        {
          model: db.user,
          as: 'dentist',
          attributes: ['id', 'name']
        },
        {
          model: db.service,
          as: 'service',
          attributes: ['id', 'name']
        },
      ]
    });

    const reappointmentDetails = await db.reappointment.findAll({
      where: { id: reappointmentIds },
      include: [
        {
          model: db.slot,
          as: 'slot',
          attributes: ['id', 'start_time', 'end_time'],
        },
        {
          model: db.user,
          as: 'customer',
          attributes: ['id', 'name']
        },
        {
          model: db.user,
          as: 'dentist',
          attributes: ['id', 'name']
        },
        {
          model: db.service,
          as: 'service',
          attributes: ['id', 'name']
        },
      ]
    });

    // Gộp thông tin include vào dữ liệu đã format
    formattedAppointments.forEach(appointment => {
      const details = appointmentDetails.find(a => a.id === appointment.id);
      if (details) {
        appointment.slot = details.slot.toJSON();
        appointment.customer = details.customer.toJSON();
        appointment.dentist = details.dentist.toJSON();
        appointment.service = details.service.toJSON();
      }
    });

    formattedReappointments.forEach(reappointment => {
      const details = reappointmentDetails.find(r => r.id === reappointment.id);
      if (details) {
        reappointment.slot = details.slot.toJSON();
        reappointment.customer = details.customer.toJSON();
        reappointment.dentist = details.dentist.toJSON();
        reappointment.service = details.service.toJSON();
      }
    });

    return {
      appointments: formattedAppointments,
      reappointments: formattedReappointments
    };
  } catch (error) {
    console.error("Error fetching appointments and reappointments: ", error);
    throw error;
  }
};

const getFilteredAppointmentsAndReappointments = async (filters) => {
  try {
    const { status, dentistId, clinicId, type, date } = filters;

    const appointmentWhere = {
      clinic_id: clinicId  // Áp dụng clinicId vào điều kiện lọc appointment
    };
    const reappointmentWhere = {
      clinic_id: clinicId  // Áp dụng clinicId vào điều kiện lọc reappointment
    };

    if (status) {
      appointmentWhere.status = status;
      reappointmentWhere.status = status;
    }
    if (dentistId) {
      appointmentWhere.dentist_id = dentistId;
      reappointmentWhere.dentist_id = dentistId;
    }
    if (date) {
      appointmentWhere.appointment_date = date;
      reappointmentWhere.reappointment_date = date;
    }

    let appointments = [];
    let reappointments = [];

    if (!type || type === 'Appointment') {
      appointments = await db.appointment.findAll({
        where: appointmentWhere,
        include: [
          {
            model: db.slot,
            as: 'slot',
            attributes: ['id', 'start_time', 'end_time'],
          },
          {
            model: db.user,
            as: 'customer',
            attributes: ['id', 'name']
          },
          {
            model: db.user,
            as: 'dentist',
            attributes: ['id', 'name']
          },
          {
            model: db.service,
            as: 'service',
            attributes: ['id', 'name']
          },
        ],
        order: [['appointment_date', 'DESC']]
      });
    }

    if (!type || type === 'Reappointment') {
      reappointments = await db.reappointment.findAll({
        where: reappointmentWhere,
        include: [
          {
            model: db.slot,
            as: 'slot',
            attributes: ['id', 'start_time', 'end_time'],
          },
          {
            model: db.user,
            as: 'customer',
            attributes: ['id', 'name']
          },
          {
            model: db.user,
            as: 'dentist',
            attributes: ['id', 'name']
          },
          {
            model: db.service,
            as: 'service',
            attributes: ['id', 'name']
          },
        ],
        order: [['reappointment_date', 'DESC']]
      });
    }

    // Thêm thuộc tính type cho mỗi đối tượng
    const formattedAppointments = appointments.map(appointment => ({
      ...appointment.dataValues,
      type: 'Appointment'
    }));

    const formattedReappointments = reappointments.map(reappointment => ({
      ...reappointment.dataValues,
      type: 'Reappointment'
    }));

    return {
      appointments: formattedAppointments,
      reappointments: formattedReappointments
    };
  } catch (error) {
    console.error("Error fetching appointments and reappointments: ", error);
    throw error;
  }
};


const updateDentistSlotsByDate = async (dentistId, slotIds, date) => {
  try {
    // Parse slot_ids if it's a string
    let parsedSlotIds = slotIds;
    if (typeof slotIds === 'string') {
      try {
        parsedSlotIds = JSON.parse(slotIds);
      } catch (error) {
        throw new Error("Invalid slot_ids format. Must be a valid JSON array.");
      }
    }

    // Validate input
    if (!Array.isArray(parsedSlotIds)) {
      throw new Error("slot_ids must be an array");
    }

    // Fetch existing slots
    const existingSlots = await db.dentist_slot.findAll({
      where: { dentist_id: dentistId, date },
    });

    // Map existing slot ids
    const existingSlotIds = existingSlots.map(slot => slot.slot_id);

    // Identify slots to add and remove
    const slotsToAdd = parsedSlotIds.filter(slot_id => !existingSlotIds.includes(slot_id));
    const slotsToRemove = existingSlotIds.filter(slot_id => !parsedSlotIds.includes(slot_id));

    // Remove slots
    await db.dentist_slot.destroy({
      where: { dentist_id: dentistId, slot_id: slotsToRemove, date },
    });

    // Add new slots
    await Promise.all(
      slotsToAdd.map(async (slot_id) => {
        return db.dentist_slot.create({
          dentist_id: dentistId,
          slot_id,
          date,
          current_patients: 0,
        });
      })
    );

    // Fetch updated slots
    const updatedSlots = await db.dentist_slot.findAll({
      where: { dentist_id: dentistId, date },
      include: [{ model: db.slot, as: 'slot', attributes: ['id', 'start_time', 'end_time'] }],
    });

    return updatedSlots;

  } catch (error) {
    console.error('Error in updateDentistSlotsByDate:', error);
    throw new Error('Internal Server Error');
  }
};


module.exports = {
  //getDetailClinicPage,
  createNewClinic,
  deleteClinicById,
  getClinicById,
  updateClinic,
  getAllClinics,
  searchClinicsByName,
  getServicesByClinic,
  getClinicByIdClinicOwner,
  getAppointmentsAndReappointmentsByClinic,
  getFilteredAppointmentsAndReappointments,
  updateDentistSlotsByDate
};
