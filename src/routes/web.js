const express = require('express');
const router = express.Router();
const { getHomePage, getPageAllClinics, getPageAllDoctors, getPageAllServices, getPageForPatients, getPageForDoctors, postSearchHomePage, getDetailServicePage, getDetailDoctorPage, postBookingDoctorPageWithoutFiles, postBookingDoctorPageNormal, getDetailClinicPage } = require('../controllers/homeController');
const { putUpdateClinic, postCreateClinic, deleteClinicById } = require('../controllers/clinicOwnerController');

// Home routes
router.get('/all-clinics', getPageAllClinics);
router.get('/all-doctors', getPageAllDoctors);
router.get('/all-services', getPageAllServices);

router.get('/for-patients', getPageForPatients);
router.get('/for-doctors', getPageForDoctors);

router.post('/search-homepage', postSearchHomePage);

router.get('/', getHomePage);
router.get('/detail/service/:id', getDetailServicePage);
router.get('/detail/doctor/:id', getDetailDoctorPage);

router.post('/booking-doctor-without-files/create', postBookingDoctorPageWithoutFiles);
router.post('/booking-doctor-normal/create', postBookingDoctorPageNormal);

router.get('/detail/clinic/:id', getDetailClinicPage);


router.put('/clinic-owner/clinic/update', putUpdateClinic);
router.delete('/clinic-owner/clinic/delete', deleteClinicById);
router.post('/clinic-owner/clinic/create', postCreateClinic);

module.exports = router;
