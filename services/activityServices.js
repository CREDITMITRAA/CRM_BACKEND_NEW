const { Activity } = require("../models");

async function addActivity(activityData, transaction) {
  const createdActivity = await Activity.create(
    { ...activityData },
    { transaction }
  );
  return createdActivity; // Return the created activity
}

module.exports = {
    addActivity
}
