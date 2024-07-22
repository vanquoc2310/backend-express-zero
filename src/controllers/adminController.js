const clinicService = require('../services/clinicService');
const dentistService = require('../services/dentistService');
const adminService = require('../services/adminService');
const clinicOwnerService = require('../services/clinicOwnerService');
const db = require("./../models");
const { sendEmailNormal } = require('../config/mailer');
const bcrypt = require('bcrypt');



const getAllClinics = async (req, res) => {
    try {
        const clinics = await clinicService.getAllClinics();
        res.json(clinics);
    } catch (err) {
        console.error('Error retrieving clinics:', err);
        res.status(500).json({ error: 'Failed to retrieve clinics' });
    }
};

const getAllDentists = async (req, res) => {
    try {
        const dentists = await dentistService.getAllDentists();
        res.json(dentists);
    } catch (err) {
        console.error('Error retrieving dentists:', err);
        res.status(500).json({ error: 'Failed to retrieve dentists' });
    }
};

const createUser = async (req, res) => {
    const { email, password, name, phonenumber, role_id, image, clinic_id } = req.body;
    try {
        const newUser = await adminService.createUser({ email, password, name, phonenumber, role_id, image, clinic_id });
        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ error: 'Failed to create user' });
    }
};

const updateUser = async (req, res) => {
    const { userId } = req.params;
    const { email, password, name, phonenumber, role_id, image, clinic_id } = req.body;
    try {
        const updatedUser = await adminService.updateUser({ userId, email, password, name, phonenumber, role_id, image, clinic_id });
        res.json(updatedUser);
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ error: 'Failed to update user' });
    }
};

const deleteUser = async (req, res) => {
    const { userId } = req.params;
    try {
        await adminService.deleteUser(userId);
        res.json({ message: 'User status updated to false successfully' });
    } catch (err) {
        console.error('Error updating user status:', err);
        res.status(500).json({ error: 'Failed to update user status' });
    }
};


const getCustomersAndClinicOwners = async (req, res) => {
    try {
        const users = await adminService.getCustomersAndClinicOwners();
        res.status(200).json(users);
    } catch (err) {
        console.error('Error retrieving users:', err);
        res.status(500).json({ error: 'Failed to retrieve users' });
    }
};

const searchClinicsByName = async (req, res) => {
    try {
        const clinics = await clinicService.searchClinicsByName(req.query.name);
        res.json(clinics);
    } catch (err) {
        console.error('Error searching clinics:', err);
        res.status(500).json({ error: 'Failed to search clinics' });
    }
};


const searchClinicOwnersByName = async (req, res) => {
    try {
        const clinicOwners = await clinicOwnerService.searchClinicOwnersByName(req.query.name);
        res.json(clinicOwners);
    } catch (err) {
        console.error('Error searching clinic owners:', err);
        res.status(500).json({ error: 'Failed to search clinic owners' });
    }
};

const getClinicRequests = async (req, res) => {
    try {
        const clinicRequests = await db.clinicRequest.findAll({
            order: [
                ['created_at', 'DESC'],
                [db.Sequelize.literal(`CASE 
            WHEN status = 'Pending' THEN 1
            WHEN status = 'Cancelled' THEN 2
            WHEN status = 'Approved' THEN 3
            ELSE 4
            END`), 'ASC']
            ]
        });
        res.json(clinicRequests);
    } catch (error) {
        console.error('Error fetching clinic requests:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getClinicRequestsPending = async (req, res) => {
    try {
        const clinicRequestsPending = await db.clinicRequest.findAll({
            where: { status: 'Pending' },
            order: [['created_at', 'DESC']]
        });
        res.json(clinicRequestsPending);
    } catch (error) {
        console.error('Error fetching pending clinic requests:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getClinicRequestsApproved = async (req, res) => {
    try {
        const clinicRequestsApproved = await db.clinicRequest.findAll({
            where: { status: 'Approved' },
            order: [['created_at', 'DESC']]
        });
        res.json(clinicRequestsApproved);
    } catch (error) {
        console.error('Error fetching approved clinic requests:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getClinicRequestsRejected = async (req, res) => {
    try {
        const clinicRequestsRejected = await db.clinicRequest.findAll({
            where: { status: 'Rejected' },
            order: [['created_at', 'DESC']]
        });
        res.json(clinicRequestsRejected);
    } catch (error) {
        console.error('Error fetching rejected clinic requests:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const approveClinicRequest = async (req, res) => {
    try {
        const clinicRequestId = req.params.id; // Lấy clinicRequestId từ req.params.id
        console.log(clinicRequestId);
        const clinicRequest = await db.clinicRequest.findByPk(clinicRequestId);

        if (!clinicRequest) {
            console.log('Yêu cầu đăng ký không tồn tại.');
            return;
        }

        if (clinicRequest.status !== 'Pending') {
            console.log('Yêu cầu đã được xử lý hoặc không ở trạng thái chờ duyệt.');
            return;
        }


        // Tạo tài khoản chủ phòng khám
        const password = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(password, 10);

        const clinicOwner = await db.user.create({
            email: clinicRequest.email,
            phonenumber: clinicRequest.phonenumber,
            password: hashedPassword,
            role_id: 4, 
            status: true
        });

        // Tạo phòng khám và cập nhật clinic_owner_id
        const clinic = await db.clinic.create({
            name: clinicRequest.name,
            address: clinicRequest.address,
            phonenumber: clinicRequest.phonenumber,
            clinic_owner_id: clinicOwner.id,
            status: true,
            image: clinicRequest.image
        });

        
        const subject = 'Thông tin đăng nhập phòng khám của bạn';
        const htmlContent = `
            <p>Xin chào,</p>
            <p>Bạn đã được chấp nhận là chủ phòng khám tại ${clinicRequest.name}.</p>
            <p>Email đăng nhập: ${clinicRequest.email}</p>
            <p>Mật khẩu tạm thời: ${password}</p>
            <p>Vui lòng đổi mật khẩu sau khi đăng nhập.</p>
        `;
        await sendEmailNormal(clinicRequest.email, subject, htmlContent);

        
        clinicRequest.status = 'Approved';
        await clinicRequest.save();

        console.log('Clinic request approved and email sent to clinic owner.');
        res.status(200).json({ message: 'Clinic request approved successfully.' });
    } catch (error) {
        console.error('An error occurred while approving the clinic request:', error);
        res.status(500).json({ error: 'An error occurred while approving the clinic request.' });
    }
};

const rejectClinicRequest = async (req, res) => {
    try {
        const clinicRequestId = req.params.id; // Lấy clinicRequestId từ req.params.id
        const clinicRequest = await db.clinicRequest.findByPk(clinicRequestId);

        if (!clinicRequest) {
            console.log('Yêu cầu đăng ký không tồn tại.');
            return res.status(404).json({ error: 'Yêu cầu đăng ký không tồn tại.' });
        }

        // Cập nhật trạng thái yêu cầu đăng ký thành 'Rejected'
        clinicRequest.status = 'Rejected';
        await clinicRequest.save();

        console.log('Yêu cầu đăng ký đã được từ chối thành công.');
        res.status(200).json({ message: 'Yêu cầu đăng ký đã được từ chối thành công.' });
    } catch (error) {
        console.error('Lỗi xảy ra khi từ chối yêu cầu đăng ký phòng khám:', error);
        res.status(500).json({ error: 'Lỗi xảy ra khi từ chối yêu cầu đăng ký phòng khám.' });
    }
};

const generateRandomPassword = () => {
    let password = '';
    for (let i = 0; i < 6; i++) {
      password += Math.floor(Math.random() * 10); // Generate a random digit (0-9)
    }
    return password;
  };

module.exports = {
    getAllClinics,
    getAllDentists,
    createUser,
    updateUser,
    deleteUser,
    getCustomersAndClinicOwners,
    searchClinicOwnersByName,
    searchClinicsByName,
    getClinicRequests,
    getClinicRequestsPending,
    getClinicRequestsApproved,
    getClinicRequestsRejected,
    approveClinicRequest,
    rejectClinicRequest
}