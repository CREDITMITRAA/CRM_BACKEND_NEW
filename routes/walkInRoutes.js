const express = require('express')
const router = express.Router()
const WalkInController = require('../controllers/walkInController')

router.post('/schedule-walk-in', WalkInController.scheduleWalkIn)

module.exports = router