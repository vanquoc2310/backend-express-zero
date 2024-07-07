const express = require('express');
const router = express.Router();
const { getHomePage, getPageAllClinics, getPageAllDoctors, getPageAllServices, postSearchHomePage, getDetailServicePage, getDetailDoctorPage, getDetailClinicPage, getDentistsByClinic } = require('../controllers/homeController');
const { putUpdateClinic, postCreateClinic, deleteClinicById, searchDentistsByName } = require('../controllers/clinicOwnerController');
const adminController = require('../controllers/adminController');
const authorizeAdmin = require('../middleware/adminMiddleware');
const dentistController = require('../controllers/dentistController');
const authorizeDentist = require('../middleware/dentistMiddleware');
const authorizeLogin = require('../middleware/authMiddleware');
const appointmentController = require('../controllers/appointmentController');
const clinicController = require('../controllers/clinicController');


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
router.get('/clinics/:clinicId/services', clinicController.getServicesByClinic);

router.put('/clinic-owner/clinic/update', putUpdateClinic);
router.delete('/clinic-owner/clinic/delete', deleteClinicById);
router.post('/clinic-owner/clinic/create', postCreateClinic);
router.get('/clinic-owner/dentist/searchdentist', searchDentistsByName);


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



router.get('/appointments/confirm/:appointmentId', appointmentController.confirmAppointment);
router.post('/customer/create-appointment', authorizeLogin, appointmentController.createAppointment);
router.get('/dentists/:dentistId/availble-slots', dentistController.getAvailableSlotsForDate);

module.exports = router;
