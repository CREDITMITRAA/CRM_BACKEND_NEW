const express = require('express')
const router = express.Router()
const LeadDocumentController = require('../controllers/leadDocumentController')

router.post('/add-lead-documents', LeadDocumentController.addLeadDocuments)

module.exports = router