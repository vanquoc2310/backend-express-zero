const db = require('../models');

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
                        attributes: ['name', 'image', 'email', 'phonenumber']
                    }
                ]
            }
        ]
    });
};

module.exports = {
    getAllDentists,
    searchDentistsByName,
    getDentistsByClinic,
}