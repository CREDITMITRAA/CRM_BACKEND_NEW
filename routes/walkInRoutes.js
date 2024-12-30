const express = require('express')
const router = express.Router()
const WalkInController = require('../controllers/walkInController')

router.post('/schedule-walk-in', WalkInController.scheduleWalkIn)
router.get('/get-walk-ins', WalkInController.getWalkIns)
router.post('/update-walk-in-status', WalkInController.updateWalkInStatus)

module.exports = router