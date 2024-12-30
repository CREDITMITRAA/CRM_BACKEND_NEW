const express = require('express')
const router = express.Router()
const WalkInController = require('../controllers/walkInController')

router.post('/schedule-walk-in', WalkInController.scheduleWalkIn)
router.get('/get-walk-ins', WalkInController.getWalkIns)

module.exports = router