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

module.exports = {
    //getDetailClinicPage,
    createNewClinic,
    deleteClinicById,
    getClinicById,
    updateClinic,
    getAllClinics,
    searchClinicsByName,
    getServicesByClinic,
    getClinicByIdClinicOwner
};
