const express = require('express')
const router = express.Router()
const dashboardController = require('../controllers/dashboardController')

router.get('/get-dashboard-data', dashboardController.getDashboardData)
router.get('/get-charts-data', dashboardController.getChartsData)

module.exports = router