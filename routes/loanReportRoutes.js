const express = require('express')
const router = express.Router()
const LoanReportsController = require('../controllers/loanReportController')

router.get('/get-loan-reports-by-lead-id/:leadId', LoanReportsController.getLoanReportsByLeadId)
router.get('/get-all-loan-reports', LoanReportsController.getAllLoanReports)

module.exports = router