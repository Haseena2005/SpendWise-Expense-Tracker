const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const { uploadProfilePhoto } = require('../middleware/uploadMiddleware');

router.use(protect);

router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);
router.put('/currency', profileController.updateCurrency);
router.post('/photo', uploadProfilePhoto.single('photo'), profileController.uploadPhoto);
router.delete('/photo', profileController.removePhoto);
router.put('/password', profileController.changePassword);

module.exports = router;
