const express = require('express');
const router = express.Router();
const { getHomePage, getPageAllClinics, getPageAllDoctors, getPageAllServices, postSearchHomePage, getDetailServicePage, getDetailDoctorPage, getDetailClinicPage, getDentistsByClinic } = require('../controllers/homeController');
const { putUpdateClinic, postCreateClinic, deleteClinicById, searchDentistsByName, addDentist, updateDentist, deleteDentist, getDentistsByClinicClinicOwner, getDetailClinicByClinicOwner } = require('../controllers/clinicOwnerController');
const adminController = require('../controllers/adminController');
const customerController = require('../controllers/customerController');
const authorizeAdmin = require('../middleware/adminMiddleware');
const dentistController = require('../controllers/dentistController');
const authorizeDentist = require('../middleware/dentistMiddleware');
const authorizeLogin = require('../middleware/authMiddleware');
const appointmentController = require('../controllers/appointmentController');
const clinicController = require('../controllers/clinicController');
const authorizeClinicOwner = require('../middleware/clinicOwnerMiddleware');




// Home routes
router.get('/all-clinics', getPageAllClinics);
router.get('/all-doctors', getPageAllDoctors);
router.get('/all-services', getPageAllServices);

router.post('/search-homepage', postSearchHomePage);

router.get('/', getHomePage);
router.get('/detail/service/:id', getDetailServicePage);
router.get('/detail/doctor/:id', getDetailDoctorPage);

router.get('/detail/clinic/:id', getDetailClinicPage);
router.get('/clinic/:clinicId/dentists', getDentistsByClinic);
router.get('/clinic/:clinicId/services', clinicController.getServicesByClinic);

// api clinic owner
router.put('/clinic-owner/clinic/update', authorizeClinicOwner, putUpdateClinic);
router.delete('/clinic-owner/clinic/delete', authorizeClinicOwner, deleteClinicById);
router.post('/clinic-owner/clinic/create', authorizeClinicOwner, postCreateClinic);

router.get('/clinic-owner/clinic', authorizeClinicOwner, getDetailClinicByClinicOwner);
router.get('/clinic-owner/clinic/dentists/searchdentist', authorizeClinicOwner, searchDentistsByName);
router.get('/clinic-owner/clinic/dentists', authorizeClinicOwner, getDentistsByClinicClinicOwner);
router.post('/clinic-owner/clinic/dentists', authorizeClinicOwner, addDentist);
router.put('/clinic-owner/clinic/dentists/:id', authorizeClinicOwner, updateDentist);
router.delete('/clinic-owner/clinic/dentists/:id', authorizeClinicOwner, deleteDentist);

//-----------------------------------------------------------



router.get('/admin/clinics', authorizeAdmin, adminController.getAllClinics);
router.get('/admin/dentists', authorizeAdmin, adminController.getAllDentists);
router.post('/admin/users', authorizeAdmin, adminController.createUser);
router.put('/admin/users/:userId', authorizeAdmin, adminController.updateUser);
router.delete('/admin/users/:userId', authorizeAdmin, adminController.deleteUser);
router.get('/admin/clinics/search', authorizeAdmin, adminController.searchClinicsByName);
router.get('/admin/clinicowners/search', authorizeAdmin, adminController.searchClinicOwnersByName);

router.get('/admin/users/customers-clinicowners', authorizeAdmin, adminController.getCustomersAndClinicOwners);

router.get('/dentist/slots', authorizeDentist, dentistController.getSlotsForDate);

//route get lịch trong 7 ngày (tuần hiện tại)
router.get('/dentist/schedule', authorizeDentist, dentistController.getDentistWeeklySchedule);
// Route to fetch dentist's patients
router.get('/dentist/patients', authorizeDentist, dentistController.getDentistPatients);
// Route to fetch patient's examination history
router.get('/dentist/patients/:customerId/history', authorizeDentist, dentistController.getDentistPatientHistory);
// Route to create examination result
router.post('/dentist/examination-result', authorizeDentist, dentistController.createExaminationResult);
// Route to create Reappointment
router.post('/dentist/reappointment', authorizeDentist, appointmentController.createReappointment);
router.get('/dentists/:dentistId/available-slots', dentistController.getAvailableSlotsForDate);



router.get('/appointments/confirm/:appointmentId', appointmentController.confirmAppointment);
router.post('/customer/create-appointment', authorizeLogin, appointmentController.createAppointment);

// route để get lịch khám mà chưa được khám 
router.get('/customer/appointments', authorizeLogin, customerController.getPatientAppointments);

// route để get tất cả kết quả khám trong quá khứ
router.get('/customer/histories', authorizeLogin, customerController.getHistoryResult);

// route để tạo feedback
router.post('/customer/feedback/:id', authorizeLogin, customerController.createFeedback);


module.exports = router;
