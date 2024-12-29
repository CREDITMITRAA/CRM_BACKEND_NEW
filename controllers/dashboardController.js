const { Sequelize } = require("sequelize");
const { sequelize } = require("../models");

const getDashboardData = async (req, res) => {
  try {
    const { startDate, endDate } = req.query; // Get start and end dates from query params
    const today = new Date().toISOString().split("T")[0]; // Today's date in UTC

    // Convert startDate and endDate to UTC (if provided)
    let start = startDate ? new Date(startDate + "T00:00:00Z") : null; // Convert to UTC
    let end = endDate ? new Date(endDate + "T23:59:59Z") : null; // Convert to UTC

    // If startDate and endDate are not provided, they will be null, and no filtering will be applied
    const metrics = {
      calls_done: await sequelize.query(
        `SELECT created_by, COUNT(*) as count 
         FROM activities 
         WHERE (:startDate IS NULL OR createdAt >= :startDate) 
           AND (:endDate IS NULL OR createdAt <= :endDate)
         GROUP BY created_by`,
        {
          type: Sequelize.QueryTypes.SELECT,
          replacements: {
            startDate: start ? start.toISOString() : null,
            endDate: end ? end.toISOString() : null,
          },
        }
      ),
      connected_calls: await sequelize.query(
        `SELECT created_by, COUNT(*) as count 
         FROM activities 
         WHERE activity_status IN ('Follow Up', 'Interested', 'Not Interested', 'Call Back', 'Verification 1') 
           AND (:startDate IS NULL OR createdAt >= :startDate) 
           AND (:endDate IS NULL OR createdAt <= :endDate)
         GROUP BY created_by`,
        {
          type: Sequelize.QueryTypes.SELECT,
          replacements: {
            startDate: start ? start.toISOString() : null,
            endDate: end ? end.toISOString() : null,
          },
        }
      ),
      interested_leads: await sequelize.query(
        `SELECT created_by, COUNT(*) as count 
         FROM activities 
         WHERE activity_status = 'Interested' 
           AND (:startDate IS NULL OR createdAt >= :startDate) 
           AND (:endDate IS NULL OR createdAt <= :endDate)
         GROUP BY created_by`,
        {
          type: Sequelize.QueryTypes.SELECT,
          replacements: {
            startDate: start ? start.toISOString() : null,
            endDate: end ? end.toISOString() : null,
          },
        }
      ),
      walkins_scheduled: await sequelize.query(
        `SELECT created_by, COUNT(*) as count 
         FROM activities 
         WHERE activity_status = 'Walkin' 
           AND DATE(updatedAt) = :today
           AND (:startDate IS NULL OR createdAt >= :startDate)
           AND (:endDate IS NULL OR createdAt <= :endDate)
         GROUP BY created_by`,
        {
          type: Sequelize.QueryTypes.SELECT,
          replacements: {
            today: today,
            startDate: start ? start.toISOString() : null,
            endDate: end ? end.toISOString() : null,
          },
        }
      ),
      walkins_today: await sequelize.query(
        `SELECT created_by, COUNT(*) as count 
         FROM activities 
         WHERE activity_status = 'Walkin' 
           AND DATE(createdAt) = :today
           AND (:startDate IS NULL OR createdAt >= :startDate) 
           AND (:endDate IS NULL OR createdAt <= :endDate)
         GROUP BY created_by`,
        {
          type: Sequelize.QueryTypes.SELECT,
          replacements: {
            today: today,
            startDate: start ? start.toISOString() : null,
            endDate: end ? end.toISOString() : null,
          },
        }
      ),
    };

    res.json(metrics);
  } catch (error) {
    console.error("Error fetching metrics:", error);
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
};

module.exports = { getDashboardData };
