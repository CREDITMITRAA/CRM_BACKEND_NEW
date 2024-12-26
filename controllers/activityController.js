const { Op } = require("sequelize");
const { sequelize, User, Lead, Activity, LeadAssignment } = require("../models");
const { ApiResponse } = require("../utilities/api-responses/ApiResponse");

async function addActivity(req, res) {
  const transaction = await sequelize.transaction();
  try {
    const {
      userId = null,
      leadId = null,
      activity_status, // Mandatory field
      description = null,
      docsCollected = 0, // Default to 0
      followUp = null,
      lead_status = null,
    } = req.body;

    // Validate mandatory fields
    if (!activity_status) {
      return ApiResponse(
        res,
        "error",
        400,
        "activity_status is required!",
        null,
        null
      );
    }

    // Check for existing activity (if leadId is provided)
    let existingActivity;
    if (leadId) {
      existingActivity = await Activity.findOne({
        where: { lead_id: leadId },
        transaction,
      });
    }

    // Calculate new docsCollected based on existing and new values
    let newDocsCollected = docsCollected; 
    if (existingActivity && existingActivity.docs_collected > 0) {
      newDocsCollected = existingActivity.docs_collected; 
    }

    // Create a new Activity
    const activity = await Activity.create(
      {
        lead_id: leadId,
        activity_status,
        description,
        docs_collected: newDocsCollected,
        created_by: userId,
        follow_up: followUp,
        lead_status,
      },
      { transaction }
    );

    // Update lead status if leadId is provided
    if (leadId) {
      const lead = await Lead.findByPk(leadId, { transaction });
      if (!lead) {
        await transaction.rollback();
        return ApiResponse(res, "error", 404, "Lead not found!", null, null);
      }
      if (activity_status === "Verification 1") {
        await lead.update(
          { verification_status: activity_status, lead_status: activity_status },
          { transaction }
        );
      } else {
        await lead.update({ lead_status: activity_status }, { transaction });
      }
    }

    await transaction.commit(); // Commit transaction

    // Response
    return ApiResponse(
      res,
      "success",
      201,
      "Activity added successfully!",
      {
        activityId: activity.id,
        description: activity.description,
        activity_status: activity.activity_status,
        docs_collected: activity.docs_collected,
        follow_up: activity.follow_up,
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt,
        lead_status: activity.lead_status,
      },
      null
    );
  } catch (error) {
    await transaction.rollback(); // Rollback in case of an error
    console.error("Error adding activity:", error);
    return ApiResponse(
      res,
      "error",
      500,
      "Failed to add activity!",
      null,
      error
    );
  }
}

async function getActivitiesByLeadId(req, res) {
  try {
    const { leadId } = req.params; // Extract leadId from request params
    console.log("Received lead ID:", leadId);

    // Validate the leadId
    if (!leadId) {
      return ApiResponse(
        res,
        "error",
        400,
        "Lead ID is required",
        null,
        null,
        null
      );
    }

    // Fetch activities for the given leadId, including createdBy details
    const activities = await Activity.findAll({
      where: { lead_id: leadId }, // Filter activities by lead_id
      include: [
        {
          model: User, // Assuming User is the model for the user table
          as: "CreatedBy", // Alias for the relationship
          required: false, // Include even if no matching user is found
          attributes: ["id", "name"], // Include only the ID and name of the user
        },
      ],
      order: [
        ["id", "DESC"], // Order by activity ID in descending order
        ["createdAt", "DESC"], // Order by createdAt in descending order
      ],
    });

    // Return the activities in the response
    return ApiResponse(
      res,
      "success",
      200,
      "Activities fetched successfully",
      activities,
      null,
      null
    );
  } catch (error) {
    console.error("Error fetching activities:", error);
    return ApiResponse(
      res,
      "error",
      500,
      "Failed to fetch activities",
      null,
      error,
      null
    );
  }
}


async function updateActivityByActivityId(req, res) {
  try {
    const { activityId } = req.params;
    const {
      activity_status,
      description,
      docs_collected,
      follow_up,
      createdBy,
      lead_status,
    } = req.body;

    // Validate that required fields are provided
    if (!activityId) {
      return ApiResponse(res, "error", 400, "Activity ID is required!");
    }

    if (!activity_status) {
      return ApiResponse(res, "error", 400, "Activity status is required!");
    }

    if (!createdBy) {
      return ApiResponse(res, "error", 400, "CreatedBy is required!");
    }

    // Validate the activity status value
    const validStatuses = ["new", "in_progress", "completed", "follow_up"];
    if (!validStatuses.includes(activity_status)) {
      return ApiResponse(res, "error", 400, "Invalid activity status!");
    }

    // Update the activity fields directly in the database
    const [updatedRows] = await Activity.update(
      {
        activity_status,
        description,
        docs_collected: docs_collected !== undefined ? docs_collected : 0,
        follow_up: follow_up ? new Date(follow_up) : null,
        updatedBy: createdBy, // assuming that `createdBy` refers to the person updating the activity
        lead_status,
      },
      {
        where: { id: activityId },
        returning: true, // This returns the updated rows
      }
    );

    // If no rows were updated, return a not found response
    if (updatedRows === 0) {
      return ApiResponse(res, "error", 404, "Activity not found!");
    }

    // Return the updated activity data
    const updatedActivity = updatedRows[0];
    return ApiResponse(
      res,
      "success",
      200,
      "Activity updated successfully",
      updatedActivity
    );
  } catch (error) {
    console.error("Error updating activity by ID:", error);
    return ApiResponse(
      res,
      "error",
      500,
      "Failed to update activity",
      null,
      error.message
    );
  }
}

async function getAllActivities(req, res) {
  try {
    let {
      page = 1,
      pageSize = 25,
      activity_status,
      createdAt,
      created_by
    } = req.query;

    page = parseInt(page);
    pageSize = parseInt(pageSize);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(pageSize) || pageSize < 1) pageSize = 10;

    const whereConditions = {};
    if (activity_status) whereConditions.activity_status = { [Op.like]: `%${activity_status}%` };
    if (created_by) whereConditions.created_by = {[Op.like] : `%${created_by}`}

    if (createdAt) {
      const startOfDayUTC = moment.tz(createdAt, "Asia/Kolkata").startOf("day").utc().toDate();
      const endOfDayUTC = moment.tz(createdAt, "Asia/Kolkata").endOf("day").utc().toDate();
      whereConditions.createdAt = { [Op.between]: [startOfDayUTC, endOfDayUTC] };
    }

    const includeConditions = [
      {
        model: Lead,
        as: "Lead",
        required: true, // Ensure activity must be linked to a lead.
        include: [
          {
            model: LeadAssignment,
            as: "LeadAssignments",
            required: false, // Include even if there's no LeadAssignment.
            include: [
              {
                model: User,
                as: "AssignedTo",
                attributes: ["id", "name"], // Include only AssignedTo details.
              },
            ],
          },
        ],
      },
    ];

    const { count, rows } = await Activity.findAndCountAll({
      where: whereConditions,
      include: includeConditions,
      order: [["createdAt", "DESC"]],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      distinct: true,
    });

    const totalPages = Math.ceil(count / pageSize);
    const pagination = {
      page,
      totalPages,
      total: count,
      pageSize,
    };

    return ApiResponse(res, "SUCCESS", 200, "Activities fetched successfully", rows, null, pagination);
  } catch (error) {
    console.error("Error fetching activities:", error);
    return ApiResponse(res, "ERROR", 500, "Failed to fetch activities!", null, error, null);
  }
}





module.exports = {
  addActivity,
  getActivitiesByLeadId,
  updateActivityByActivityId,
  getAllActivities
};
