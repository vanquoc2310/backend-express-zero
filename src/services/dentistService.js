const db = require('../models');
const User = db.user;
const DentistInfo = db.dentist_info;
const Clinic = db.clinic;

const getAllDentists = async () => {
    return User.findAll({
        where: { role_id: 3 },
        include: [
            {
                model: DentistInfo,
                as: 'dentist_info',
                include: [
                    {
                        model: Clinic,
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
            }
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

module.exports = {
    getAllDentists,
    searchDentistsByName,
}