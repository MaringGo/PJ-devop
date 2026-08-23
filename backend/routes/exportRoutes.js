const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/pdf', exportController.exportPDF);
router.get('/excel', exportController.exportExcel);

module.exports = router;
