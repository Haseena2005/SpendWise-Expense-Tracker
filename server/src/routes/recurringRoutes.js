const express = require('express');
const router = express.Router();
const recurringController = require('../controllers/recurringController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', recurringController.getRecurring);
router.post('/', recurringController.createRecurring);
router.put('/:id', recurringController.updateRecurring);
router.delete('/:id', recurringController.deleteRecurring);

module.exports = router;
