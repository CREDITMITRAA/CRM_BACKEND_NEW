const express = require('express')
const router = express.Router()
const ActivityController = require('../controllers/activityController')

router.post('/add-activity',ActivityController.addActivity)
router.get('/get-activites-by-lead-id/:leadId', ActivityController.getActivitiesByLeadId)
router.put('/update-activity-by-activity-id',  ActivityController.updateActivityByActivityId)
router.get('/get-all-activities', ActivityController.getAllActivities)

module.exports = router