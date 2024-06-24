const db = require("./../models");

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

// // Hàm lấy chi tiết trang thông tin của clinic dựa trên id và ngày
// async function getDetailClinicPage(id, date) {
//     try {
//         let clinic = await db.Clinic.findOne({
//             where: { id: id },
//             attributes: [ 'id', 'name', 'image', 'address', 'phone', 'introductionHTML', 'description' ],
//         });

//         if (!clinic) {
//             throw new Error(`Can't get clinic with id = ${id}`);
//         }

//         // Lấy danh sách các bác sĩ thuộc clinic
//         let doctors = await db.dentist_info.findAll({
//             where: { clinic_id: id },
//             include: {
//                 model: db.user,
//                 attributes: [ 'id', 'name', 'avatar', 'address', 'description', 'status' ]
//             }
//         });

//         // Xử lý lịch làm việc của từng bác sĩ
//         await Promise.all(doctors.map(async (doctor) => {
//             let schedules = await db.Schedule.findAll({
//                 where: {
//                     doctor_id: doctor.user.id,
//                     date: date,
//                     sum_booking: { [Op.lt]: maxBooking } // Giả sử maxBooking đã được khai báo ở nơi khác
//                 },
//                 attributes: ['id', 'date', 'time']
//             });

//             // Xử lý thêm thông tin về lịch làm việc
//             let currentDate = moment().format('DD/MM/YYYY');
//             let currentHour = `${new Date().getHours()}:${new Date().getMinutes()}`;
//             let timeNow = moment(`${currentDate} ${currentHour}`, "DD/MM/YYYY hh:mm").toDate();

//             schedules.forEach((sch) => {
//                 let startTime = sch.time.split('-')[0];
//                 let timeSchedule = moment(`${sch.date} ${startTime}`, "DD/MM/YYYY hh:mm").toDate();
//                 sch.setDataValue('isDisable', timeNow > timeSchedule);
//             });

//             doctor.setDataValue('schedules', schedules);
//         }));

//         return {
//             clinic: clinic,
//             doctors: doctors,
//         };
//     } catch (error) {
//         throw error;
//     }
// }

// Hàm tạo mới một clinic
async function createNewClinic(item) {
    try {
        let clinic = await db.Clinic.create(item);
        return clinic;
    } catch (error) {
        throw error;
    }
}

// Hàm xóa clinic dựa trên id
async function deleteClinicById(id) {
    const transaction = await db.sequelize.transaction();
    try {
        // Cập nhật trạng thái của clinic thành false
        await db.Clinic.update({ status: false }, {
            where: { id: id },
            transaction: transaction
        });

        // Cập nhật trạng thái của tất cả bác sĩ thuộc clinic thành false
        await db.dentist_info.update({ status: false }, {
            where: { clinic_id: id },
            include: {
                model: db.user,
                as: 'dentist_info',
                attributes: ['id'],
                where: { role_id: 3 }
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
        let clinic = await db.Clinic.findOne({
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
        let clinic = await db.Clinic.findOne({
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

module.exports = {
    //getDetailClinicPage,
    createNewClinic,
    deleteClinicById,
    getClinicById,
    updateClinic
};
