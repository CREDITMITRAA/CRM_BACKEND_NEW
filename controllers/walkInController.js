const { Op, where } = require("sequelize");
const { WalkIn, Lead, LeadAssignment, User, sequelize } = require("../models");
const { ApiResponse } = require("../utilities/api-responses/ApiResponse");
const walkIn = require("../models/walkIn");

async function scheduleWalkIn(req, res) {
  const transaction = await sequelize.transaction()
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

    const lead = await Lead.findByPk(lead_id, {transaction})
    if (!lead) {
      await transaction.rollback();
      return ApiResponse(res, "error", 400, "Lead not found!");
    }

    await lead.update({ lead_status: "Scheduled For Walk-In", verification_status: "Scheduled For Walk-In" }, { transaction });

    const savedWalkIn = await WalkIn.create({
      lead_id,
      walk_in_status,
      walk_in_date_time,
      is_rescheduled,
      rescheduled_date_time,
      note,
      created_by,
     },
     {transaction}
  );

    await transaction.commit()

    return ApiResponse(res,"success",201,"Walk In scheduled successfully.",savedWalkIn,null,null);
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.log(error);
    return ApiResponse(res,"error",500,"Failed to schedule a walk in !",null,error,null);
  }
}

async function getWalkIns(req, res) {
  try {
    let { page = 1, pageSize = 10, created_by, date } = req.query;
    let whereConditions = {};
    page = parseInt(page);
    pageSize = parseInt(pageSize);

    // Default validation to prevent non-integer inputs
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(pageSize) || pageSize < 1) pageSize = 10;
    const offset = (page - 1) * pageSize;

    if (created_by) {
      whereConditions.created_by = created_by;
    }

    // Date filter for specific day, if provided
    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0); // Start of the day
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999); // End of the day

      whereConditions.walk_in_date_time = {
        [Op.between]: [targetDate, endOfDay],
      };
    }

    // Fetch walk-ins with associated data
    const { rows, count } = await WalkIn.findAndCountAll({
      where: whereConditions,
      order: [
        // First prioritize rescheduled_date_time, then fall back to walk_in_date_time
        [sequelize.literal("rescheduled_date_time IS NOT NULL"), "DESC"], // Prioritize rows with rescheduled_date_time
        ["walk_in_date_time", "DESC"], // Then order by walk_in_date_time in descending order
      ],
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

    return ApiResponse(
      res,
      "success",
      200,
      "Walk-Ins fetched successfully",
      rows,
      null,
      pagination
    );
  } catch (error) {
    console.log(error);
    return ApiResponse(
      res,
      "error",
      500,
      "Failed to fetch walk-ins!",
      null,
      error,
      null
    );
  }
}

async function updateWalkInStatus(req, res) {
  try {
    const { walk_in_id, walk_in_status } = req.body; // Assuming you're sending the data in the request body

    // Check if the necessary data is provided
    if (!walk_in_id || !walk_in_status) {
      return ApiResponse(res,"error",400,"Missing required fields !");
    }

    // Find the walk-in by ID
    const walkIn = await WalkIn.findOne({
      where: { id: walk_in_id },
    });

    if (!walkIn) {
      return ApiResponse(res,"error",404,"Walk-in not found",null,null,null);
    }

    // Update the walk-in status
    walkIn.walk_in_status = walk_in_status;
    await walkIn.save();
    return ApiResponse(res,"success",200,"Walk-in status updated successfully",walkIn,null,null);
  } catch (error) {
    console.log(error);
    return ApiResponse(res,"error",500,"Failed to update walk-in status!",null,error,null);
  }
}

async function rescheduleWalkIn(req,res){
    try {
        const {walk_in_id, rescheduled_date_time, note} = req.body
        if(!walk_in_id || !rescheduled_date_time){
            return ApiResponse(res,'error',400,"Missing required fields !")
        }

        const rescheduledDate = new Date(rescheduled_date_time)
        if (isNaN(rescheduledDate.getTime())) {
            return ApiResponse(res, "error", 400, "Invalid date format", null, null, null);
        }

        const walkInFromDB = await WalkIn.findOne({
            where: {id:walk_in_id}
        })

        if(!walkIn){
            return ApiResponse(res,'error',400, "Walk In Not found")
        }

        walkInFromDB.is_rescheduled = true
        walkInFromDB.rescheduled_date_time = rescheduledDate
        walkInFromDB.walk_in_status="Rescheduled"
        walkInFromDB.note=note
        await walkInFromDB.save()
        return ApiResponse(res,'success', 200, "Walk In Rescheduled Successfully.", walkIn, null,null)
    } catch (error) {
        return ApiResponse(res,'error',500,"Failed to reschedule walk in 1", null, error, null)
    }
}

module.exports = {
  scheduleWalkIn,
  getWalkIns,
  updateWalkInStatus,
  rescheduleWalkIn
};
