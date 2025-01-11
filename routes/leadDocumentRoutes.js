const express = require('express')
const router = express.Router()
const LeadDocumentController = require('../controllers/leadDocumentController')

router.post('/add-lead-documents', LeadDocumentController.addLeadDocuments)
router.get('/get-lead-documents-by-lead-id', LeadDocumentController.getLeadDocumentsByLeadId)
router.post('/remove-lead-document-by-lead-id', LeadDocumentController.deleteLeadDocument)

module.exports = router