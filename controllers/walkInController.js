const { WalkIn, Lead, LeadAssignment, User } = require("../models");
const { ApiResponse } = require("../utilities/api-responses/ApiResponse");

async function scheduleWalkIn(req, res) {
  try {
    const {
      lead_id,
      walk_in_status,
      walk_in_date_time,
      is_rescheduled,
      rescheduled_date_time,
      note,
      created_by,
    } = req.body;

    if (!lead_id || !walk_in_date_time || !created_by) {
      return ApiResponse(res, "error", 400, "Missing required fields !");
    }

    const savedWalkIn = await WalkIn.create({
      lead_id,
      walk_in_status,
      walk_in_date_time,
      is_rescheduled,
      rescheduled_date_time,
      note,
      created_by,
    });

    return ApiResponse(
      res,
      "success",
      201,
      "Walk In scheduled successfully.",
      savedWalkIn,
      null,
      null
    );
  } catch (error) {
    console.log(error);
    return ApiResponse(
      res,
      "error",
      500,
      "Failed to schedule a walk in !",
      null,
      error,
      null
    );
  }
}

async function getWalkIns(req, res) {
  try {
    let { page = 1, pageSize = 10 } = req.query;
    page = parseInt(page);
    pageSize = parseInt(pageSize);
    // Default validation to prevent non-integer inputs
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(pageSize) || pageSize < 1) pageSize = 10;
    const offset = (page - 1) * pageSize;
    const { rows, count } = await WalkIn.findAndCountAll({
      order: [["walk_in_date_time", "DESC"]],
      limit: pageSize,
      offset: offset,
      distinct: true,
      include: [
        {
          model: Lead, // Include the Lead model
          as: "lead", // The alias defined in the association
          attributes: ["id", "name", "phone"], // Select only required fields from Lead
          include: [
            {
              model: LeadAssignment, // Include the LeadAssignment model
              as: "LeadAssignments", // Alias for the association
              required: false,
              include: [
                {
                  model: User, // Include the User model for the lead owner (AssignedTo)
                  as: "AssignedTo", // Alias defined for the assignment owner
                  attributes: ["id", "name"], // Select lead owner's name and id
                },
              ],
            },
          ],
        },
      ],
    });

    const totalPages = Math.ceil(count / pageSize);
    let pagination = {
      page: page,
      totalPages: totalPages,
      total: count,
      pageSize,
    };
    return ApiResponse(res,"success",200,"Walk-Ins fetched successfully",rows,null,pagination);
  } catch (error) {
    console.log(error);
    return ApiResponse(res,"error",500,"Failed to fetch walk-ins !",null,error,null);
  }
}

module.exports = {
  scheduleWalkIn,
  getWalkIns,
};
