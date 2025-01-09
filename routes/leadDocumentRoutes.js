const express = require('express')
const router = express.Router()
const LeadDocumentController = require('../controllers/leadDocumentController')

router.post('/add-lead-documents', LeadDocumentController.addLeadDocuments)
router.get('/get-lead-documents-by-lead-id', LeadDocumentController.getLeadDocumentsByLeadId)

module.exports = router