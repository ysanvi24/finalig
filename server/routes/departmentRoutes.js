const express = require('express');
const router = express.Router();
const { getDepartments, updateDepartment } = require('../controllers/departmentController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { processUpload } = require('../middleware/uploadMiddleware');

router.get('/', getDepartments);
router.put('/:id', protect, upload.single('logo'), processUpload, updateDepartment);

module.exports = router;
