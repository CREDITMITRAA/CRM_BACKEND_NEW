const { Sequelize } = require("sequelize");
const { sequelize } = require("../models");


const getDashboardData = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const metrics = {
      calls_done: await sequelize.query(
        `SELECT created_by, COUNT(*) as count 
         FROM activities 
         GROUP BY created_by`,
        { type: Sequelize.QueryTypes.SELECT }
      ),
      connected_calls: await sequelize.query(
        `SELECT created_by, COUNT(*) as count 
         FROM activities 
         WHERE activity_status IN ('Follow Up', 'Interested', 'Not Interested', 'Call Back', 'Verification 1') 
         GROUP BY created_by`,
        { type: Sequelize.QueryTypes.SELECT }
      ),
      interested_leads: await sequelize.query(
        `SELECT created_by, COUNT(*) as count 
         FROM activities 
         WHERE activity_status = 'Interested' 
         GROUP BY created_by`,
        { type: Sequelize.QueryTypes.SELECT }
      ),
      walkins_scheduled: await sequelize.query(
        `SELECT created_by, COUNT(*) as count 
         FROM activities 
         WHERE activity_status = 'Walkin' AND DATE(updatedAt) = ? 
         GROUP BY created_by`,
        {
          type: Sequelize.QueryTypes.SELECT,
          replacements: [today],
        }
      ),
      walkins_today: await sequelize.query(
        `SELECT created_by, COUNT(*) as count 
         FROM activities 
         WHERE activity_status = 'Walkin' AND DATE(createdAt) = ? 
         GROUP BY created_by`,
        {
          type: Sequelize.QueryTypes.SELECT,
          replacements: [today],
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
