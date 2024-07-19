const homeService = require('./../services/homeService');
const userService = require('./../services/userService');
const dentistService = require('./../services/dentistService');
const db = require("./../models");


const getHomePage = async (req, res) => {
    try {
        const doctors = await userService.getTopDentists();
        return res.status(200).json(doctors);
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getPageAllClinics = async (req, res) => {
    try {
        const clinics = await homeService.getDataPageAllClinics();
        return res.status(200).json({ clinics });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getPageAllDoctors = async (req, res) => {
    try {
        const doctors = await homeService.getDataPageAllDoctors();
        return res.status(200).json({ doctors });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getPageAllServices = async (req, res) => {
    try {
        const services = await homeService.getDataPageAllServices();
        return res.status(200).json({ services });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getPageForPatients = (req, res) => {
    return res.status(200).json({ message: 'This is a page for patients.' });
};

const getPageForDoctors = (req, res) => {
    return res.status(200).json({ message: 'This is a page for doctors.' });
};

const postSearchHomePage = async (req, res) => {
    try {
        const { keyword } = req.body;
        const result = await homeService.postSearchHomePage(keyword);
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getDetailServicePage = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await homeService.getServiceById(id);
        if (!service) {
            return res.status(404).json({ error: 'Specialization not found.' });
        }

        // Logic to fetch additional data or process as needed

        return res.status(200).json({ service });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getDetailDoctorPage = async (req, res) => {
    try {
        const { id } = req.params;
        const doctor = await userService.getDoctorById(id);
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found.' });
        }

        // Logic to fetch additional data or process as needed

        return res.status(200).json({ doctor });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const postBookingDoctorPageWithoutFiles = async (req, res) => {
    try {
        const item = req.body;
        item.statusId = statusNewId;
        item.historyBreath = req.body.breath;
        item.moreInfo = req.body.extraOldForms;
        if (item.places === 'none') item.placeId = 0;
        item.placeId = item.places;
        item.createdAt = Date.now();

        const patient = await clinicService.createNewPatient(item);
        return res.status(200).json({
            status: 1,
            message: 'Booking created successfully',
            patient
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const postBookingDoctorPageNormal = async (req, res) => {
    // Handle file upload and other logic if needed
    try {
        const item = req.body;
        // Logic to handle file upload if needed
        item.statusId = statusNewId;
        item.historyBreath = req.body.breath;
        item.moreInfo = req.body.extraOldForms;
        if (item.places === 'none') item.placeId = 0;
        item.placeId = item.places;
        item.createdAt = Date.now();

        const patient = await clinicService.createNewPatient(item);
        return res.status(200).json({
            status: 1,
            message: 'Booking created successfully',
            patient
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getDetailClinicPage = async (req, res) => {
    try {
        let { id } = req.params;
        if (id === undefined) id = req.user.clinicId;
        const clinic = await homeService.getClinicByIdDetail(id);
        if (!clinic) {
            return res.status(404).json({ error: 'Clinic not found.' });
        }

        // Fetch feedbacks for the clinic
        const feedbacks = await homeService.getFeedbackByClinicId(id);

        // Combine clinic data with feedbacks
        const clinicWithFeedbacks = {
            ...clinic.toJSON(),
            feedbacks: feedbacks
        };

        return res.status(200).json({ clinic: clinicWithFeedbacks });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};


const getDentistsByClinic = async (req, res) => {
    try {
        let { clinicId } = req.params;

        if (clinicId === undefined) clinicId = req.user.clinicId;
        
        const clinic = await dentistService.getDentistsByClinic(clinicId)
        if (!clinic) {
            return res.status(404).json({ error: 'Dentists of this clinic not found.' });
        }

        // Logic to fetch additional data or process as needed

        return res.status(200).json({ clinic });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};


const registerClinicRequest = async (req, res) => {
    const { name, address, phonenumber, email, image } = req.body;

    try {
        // Kiểm tra nếu email đã tồn tại
        const existingRequest = await db.clinicRequest.findOne({
            where: { email: email }
        });

        if (existingRequest) {
            return res.status(400).json({ error: 'Email đã tồn tại trong hệ thống yêu cầu' });
        }

        // Lấy ngày hiện tại (chỉ phần ngày)
        const currentDate = new Date().toISOString().split('T')[0];

        // Tạo yêu cầu đăng ký phòng khám
        const clinicRequest = await db.clinicRequest.create({
            name,
            address,
            phonenumber,
            email,
            image,
            status: 'Pending',
            created_at: currentDate
        });

        res.status(201).json({ message: 'Yêu cầu đăng ký phòng khám đã được gửi', clinicRequest });
    } catch (error) {
        console.error('Error creating clinic request:', error);
        res.status(500).json({ error: 'Lỗi khi tạo yêu cầu đăng ký phòng khám' });
    }
};


module.exports = {
    getHomePage,
    getPageAllClinics,
    getPageAllDoctors,
    getPageAllServices,
    getPageForPatients,
    getPageForDoctors,
    postSearchHomePage,
    getDetailServicePage,
    getDetailDoctorPage,
    postBookingDoctorPageWithoutFiles,
    postBookingDoctorPageNormal,
    getDetailClinicPage,
    getDentistsByClinic,
    registerClinicRequest
};



