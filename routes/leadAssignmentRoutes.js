const express = require('express')
const router = express.Router()
const LeadAssignmentController = require('../controllers/leadAssignmentController')

router.post('/assign', LeadAssignmentController.assignLeadsToEmployee)
router.get('/get-leads-by-assigned-user-id/', LeadAssignmentController.getLeadsByAssignedUserId)

module.exports = router