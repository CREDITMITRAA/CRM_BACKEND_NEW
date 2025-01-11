const express = require('express')
const router = express.Router()
const LoanReportsController = require('../controllers/loanReportController')

router.get('/get-loan-reports-by-lead-id/:leadId', LoanReportsController.getLoanReportsByLeadId)
router.get('/get-all-loan-reports', LoanReportsController.getAllLoanReports)
router.post('/update-loan-report', LoanReportsController.updateLoanReport)
router.post('/delete-loan-report',LoanReportsController.deleteLoanReport)

module.exports = router