const express = require('express')
const router = express.Router()
const multer = require("multer");
const FileUploadController = require('../controllers/filesUploadController')
// Multer setup for file upload
const upload = multer({ dest: 'uploads/' });

router.post('/upload-file',upload.single('file'),  FileUploadController.uploadFile)
router.post('/upload-files', upload.array('files', 10), FileUploadController.uploadMultipleFiles)

module.exports = router