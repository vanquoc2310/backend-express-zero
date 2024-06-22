const express = require('express');
const router = express.Router();
const { getPageAllClinics, getPageAllDoctors, getPageAllServices, getPageForPatients, getPageForDoctors, postSearchHomePage, getDetailServicePage, getDetailDoctorPage, postBookingDoctorPageWithoutFiles, postBookingDoctorPageNormal, getDetailClinicPage } = require('../controllers/homeController');


// Home routes
router.get('/all-clinics', getPageAllClinics);
router.get('/all-doctors', getPageAllDoctors);
router.get('/all-services', getPageAllServices);

router.get('/for-patients', getPageForPatients);
router.get('/for-doctors', getPageForDoctors);

router.post('/search-homepage', postSearchHomePage);

//router.get('/', getHomePage);
router.get('/detail/service/:id', getDetailServicePage);
router.get('/detail/doctor/:id', getDetailDoctorPage);

router.post('/booking-doctor-without-files/create', postBookingDoctorPageWithoutFiles);
router.post('/booking-doctor-normal/create', postBookingDoctorPageNormal);

router.get('/detail/clinic/:id', getDetailClinicPage);


module.exports = router;
