const db = require("./../models");


const searchClinicOwnersByName = async (name) => {
    return db.user.findAll({
        where: {
            role_id: 4,
            name: {
                [db.Sequelize.Op.like]: `%${name}%`
            }
        }
    });
};

module.exports = {
    searchClinicOwnersByName
}