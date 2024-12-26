const express =require('express')
const router = express.Router()
const CreditReportController = require('../controllers/creditReportController')

router.get('/get-credit-reports-by-lead-id/:leadId', CreditReportController.getCreditReportsByLeadId)
router.get('/get-all-credit-reports', CreditReportController.getAllCreditReports)
router.delete('/delete-credit-report', CreditReportController.deleteCreditReportById)

module.exports = router