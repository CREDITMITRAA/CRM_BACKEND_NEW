const { Op, where } = require("sequelize");
const moment = require("moment-timezone");
const {
  sequelize,
  Lead,
  InvalidLead,
  User,
  LeadAssignment,
  Activity,
} = require("../models");
const { ApiResponse } = require("../utilities/api-responses/ApiResponse");
const LeadServices = require("../services/leadServices");
const ActivityServices = require("../services/activityServices");
const LoanReportServices = require("../services/loanReportsServices");
const CreditReportServices = require("../services/creditReportsServices");
const {
  ROLE_ADMIN,
  ROLE_MANAGER,
  VERIFICATION_STATUSES,
  ROLE_EMPLOYEE,
  LEAD_STATUSES,
} = require("../utilities/constants");

async function createBulkLeads(req, res) {
  console.log(req.body, "Received leads data");

  const transaction = await sequelize.transaction(); // Start a transaction

  // Flags to enable/disable validation for specific fields
  const validatePhone = true; // Set to false to skip phone validation
  const validateEmail = false; // Set to false to skip email validation
  const validateName = true; // Set to false to skip name validation
  const validateSource = true; // Set to false to skip source validation

  try {
    // Validate input: ensure it's a non-empty array
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return ApiResponse(
        res,
        "error",
        400,
        "Invalid input. Please provide an array of leads."
      );
    }

    // If validation is enabled, perform validation
    let validLeads = [];
    let invalidLeads = [];

    // Set to track duplicates
    const phoneSet = new Set();
    const emailSet = new Set();

    // Validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email regex
    const phoneRegex = /^(\+?\d{1,3}[-.\s]?)?(\d{10})$/; // Updated to allow optional country code

    req.body.forEach((lead) => {
      let isValid = true;
      let reason = "";

      // Check for duplicate phone and email
      if (phoneSet.has(lead.phone)) {
        isValid = false;
        reason = "duplicate phone";
      } else if (emailSet.has(lead.email)) {
        isValid = false;
        reason = "duplicate email";
      }

      if (isValid) {
        // Validate name
        if (validateName && !lead.name) {
          invalidLeads.push({ ...lead, reason: "Invalid name" });
        }
        // Validate email
        else if (validateEmail && !emailRegex.test(lead.email)) {
          invalidLeads.push({ ...lead, reason: "Invalid email" });
        }
        // Validate phone
        else if (validatePhone && !phoneRegex.test(lead.phone)) {
          invalidLeads.push({ ...lead, reason: "Invalid phone" });
        }
        // Validate source
        else if (validateSource && !lead.lead_source) {
          invalidLeads.push({ ...lead, reason: "Invalid source" });
        } else {
          validLeads.push(lead);
          phoneSet.add(lead.phone); // Track unique phone numbers
          emailSet.add(lead.email); // Track unique emails
        }
      } else {
        invalidLeads.push({ ...lead, reason: `Duplicate ${reason}` });
      }
    });

    // Handle valid leads: Bulk create within a transaction
    let createdLeads = [];
    if (validLeads.length > 0) {
      try {
        createdLeads = await Lead.bulkCreate(validLeads, {
          validate: true,
          transaction,
        });
      } catch (error) {
        // Handle database error (e.g., ER_DUP_ENTRY)
        if (error.code === "ER_DUP_ENTRY") {
          const dbErrorLeads = validLeads.map((lead) => ({
            ...lead,
            reason: `Database error: ${error.sqlMessage}`,
          }));
          await InvalidLead.bulkCreate(dbErrorLeads, { transaction });
          console.error("Error during bulk creation of valid leads:", error);
        } else {
          const dbErrorLeads = validLeads.map((lead) => ({
            ...lead,
            reason: `Database error: ${error.message}`,
          }));
          await InvalidLead.bulkCreate(dbErrorLeads, { transaction });
          console.error("Error during bulk creation of valid leads:", error);
        }
      }
    }

    // Handle invalid leads: Save to InvalidLeads table
    if (invalidLeads.length > 0) {
      await InvalidLead.bulkCreate(invalidLeads, { transaction });
    }

    // Commit the transaction after all operations
    await transaction.commit();

    // Send success response
    return ApiResponse(res, "success", 201, "Leads processed successfully", {
      totalValidLeads: createdLeads.length,
      totalInvalidLeads: invalidLeads.length,
      createdLeads: createdLeads.map((lead) => ({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        lead_source: lead.lead_source,
      })),
      invalidLeads,
    });
  } catch (error) {
    // Rollback the transaction in case of any error
    if (!transaction.finished) {
      await transaction.rollback();
    }

    console.error("Error creating leads:", error);

    // Handle validation errors
    if (error.errors) {
      return ApiResponse(
        res,
        "error",
        400,
        "Validation errors occurred",
        error.errors.map((e) => e.message)
      );
    }

    // Handle other errors with detailed message
    return ApiResponse(
      res,
      "error",
      500,
      "Failed to process leads",
      `Error: ${error.message}`
    );
  }
}

async function getAllLeadsWithPagination(req, res) {
  try {
    let {
      page = 1,
      pageSize = 10,
      name,
      email,
      phone,
      leadId,
      activity_status,
      employeeName,
      importedOn,
      verification_status,
      assigned_to,
      lead_status,
      assigned_to_name,
    } = req.query;

    // const limit = parseInt(req.query.limit) || 50;
    page = parseInt(page);
    pageSize = parseInt(pageSize);

    // Default validation to prevent non-integer inputs
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(pageSize) || pageSize < 1) pageSize = 10;

    const whereConditions = {};
    let leadAssignmentConditions = {};
    if (name) whereConditions.name = { [Op.like]: `%${name}%` };
    if (email) whereConditions.email = { [Op.like]: `%${email}%` };
    if (phone) whereConditions.phone = { [Op.like]: `%${phone}%` };
    if (leadId) whereConditions.id = leadId;
    if (activity_status)
      whereConditions.lead_status = { [Op.like]: `%${activity_status}` };
    if (verification_status) {
      whereConditions.verification_status = {
        [Op.like]: `%${verification_status}%`, // Use Op.iLike for case-insensitivity if supported
      };
    }
    if (lead_status) {
      whereConditions.lead_status = {
        [Op.like]: `%${lead_status}%`, // Use Op.iLike for case-insensitivity if supported
      };
    }

    if (importedOn) {
      const startOfDayUTC = moment
        .tz(importedOn, "Asia/Kolkata")
        .startOf("day")
        .utc()
        .toDate();
      const endOfDayUTC = moment
        .tz(importedOn, "Asia/Kolkata")
        .endOf("day")
        .utc()
        .toDate();
      whereConditions.createdAt = {
        [Op.between]: [startOfDayUTC, endOfDayUTC],
      };
    }

    if (assigned_to) {
      leadAssignmentConditions.assigned_to = assigned_to;
    }

    if (assigned_to_name) {
      // Use `Op.like` to filter based on the assigned user's name
      leadAssignmentConditions["AssignedTo.name"] = {
        [Op.like]: `%${assigned_to_name}%`,
      };
    }

    const includeConditions = [
      {
        model: Activity,
        as: "Activities",
        required: false, // Include only if activity_status filter is provided
        order: [["createdAt", "DESC"]], // Ensure the most recent activity is first
        limit: 1, // Only include the most recent activity
      },
      {
        model: LeadAssignment,
        as: "LeadAssignments",
        required: !!assigned_to || !!assigned_to_name,
        where: leadAssignmentConditions,
        include: [
          {
            model: User, // Assuming `User` is your `AssignedTo` model
            as: "AssignedTo", // Alias for the related `User` model
            attributes: ["name"], // Only include the name field
          },
        ],
      },
    ];

    const shouldOrderByUpdatedAt = whereConditions?.verification_status || whereConditions?.lead_status || whereConditions?.activity_status;
    const orderConditions = shouldOrderByUpdatedAt
      ? [
          ["updatedAt", "DESC"], // Apply updatedAt sorting if verification_status is included
          ["createdAt", "DESC"],
          ["id", "DESC"],
        ]
      : [
          ["createdAt", "DESC"], // Default ordering
          ["id", "DESC"],
        ];

    const { count, rows } = await Lead.findAndCountAll({
      where: whereConditions,
      include: includeConditions,
      order: orderConditions,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      distinct: true,
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
      "SUCCESS",
      200,
      "Leads fetched successfully",
      rows,
      null,
      pagination
    );
  } catch (error) {
    console.error("Error fetching leads:", error);
    return ApiResponse(
      res,
      "ERROR",
      500,
      "Failed to fetch leads!",
      null,
      error,
      null
    );
  }
}

async function getLeadById(req, res) {
  try {
    const { leadId } = req.params;

    if (!leadId) {
      return ApiResponse(res, "error", 400, "Lead Id is required!");
    }

    // Fetch the lead by ID along with related data (activities and lead assignments)
    const lead = await Lead.findOne({
      where: { id: leadId },
      include: [
        {
          model: Activity,
          as: "Activities",
          required: false,
          attributes: [
            "id",
            "activity_status",
            "docs_collected",
            "description",
            "createdAt",
            "follow_up",
          ],
          // No specific order here
        },
        // Other includes...
      ],
      // logging: console.log, // This will log the raw SQL query
    });

    // Check if the lead is found
    if (!lead) {
      return ApiResponse(res, "error", 400, "Lead not found!");
    }

    // Sort activities in JavaScript: first by createdAt in descending order, then by id in descending order
    if (lead.Activities && lead.Activities.length > 0) {
      lead.Activities.sort((a, b) => {
        // Sort by createdAt descending
        if (new Date(b.createdAt) - new Date(a.createdAt) !== 0) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        // If createdAt is the same, sort by id descending
        return b.id - a.id;
      });
    }

    // Return the lead data including activities and assignments
    return ApiResponse(res, "success", 200, "Lead fetched successfully", lead);
  } catch (error) {
    console.error("Error fetching lead by ID:", error);
    return ApiResponse(
      res,
      "error",
      500,
      "Internal server error",
      null,
      error.message
    );
  }
}

async function updateLeadReportsActivities(req, res) {
  const transaction = await sequelize.transaction();
  try {
    const { userId, leadId, lead, loanReports, creditReports, activity } =
      req.body;

    // Validate if user exists
    const user = await User.findByPk(userId, { transaction });

    if (!user) {
      await transaction.rollback();
      return ApiResponse(
        res,
        "error",
        400,
        "User Not Found!",
        null,
        null,
        null
      );
    }

    let updatedLead = null;
    let createdLoanReports = [];
    let createdCreditReports = [];
    let createdActivity = null;

    // 1. Update the Lead if the data is provided
    if (lead) {
      updatedLead = await LeadServices.updateLead(leadId, lead, transaction);
    }

    // 2. Create Loan Reports if provided
    if (loanReports && loanReports.length > 0) {
      createdLoanReports = await LoanReportServices.createLoanReports(
        loanReports,
        transaction
      );
    }

    // 3. Create Credit Reports if provided
    if (creditReports && creditReports.length > 0) {
      createdCreditReports = await CreditReportServices.createCreditReports(
        creditReports,
        transaction
      );
    }

    // 4. Add Activity if provided
    if (activity) {
      createdActivity = await ActivityServices.addActivity(
        activity,
        transaction
      );
    }

    // Commit the transaction after all operations
    await transaction.commit();

    // Return the response with updated data
    return ApiResponse(
      res,
      "success",
      200,
      "Details updated successfully!",
      {
        updatedLead,
        createdLoanReports,
        createdCreditReports,
        createdActivity,
      },
      null,
      null
    );
  } catch (error) {
    // Rollback transaction on error
    await transaction.rollback();
    console.error("Error in updating lead and adding reports:", error);
    return ApiResponse(
      res,
      "error",
      500,
      "Failed to update details!",
      null,
      error,
      null
    );
  }
}

async function updateVerificationStatus(req, res) {
  let transaction;
  try {
    transaction = await sequelize.transaction();
    const { lead_id, verification_status, role } = req.body;

    if (!lead_id || !verification_status || !role) {
      return ApiResponse(res, "error", 400, "Missing required fields!");
    }

    if (role !== ROLE_ADMIN && role !== ROLE_MANAGER) {
      return ApiResponse(
        res,
        "error",
        403,
        "You are not allowed to update verification status!",
        null,
        null,
        null
      );
    }

    const validStatuses = [
      "Under Review",
      "On Hold",
      "Manager 1 Approved",
      "Manager 2 Approved",
      "Approved for Walk-In",
      "Rejected",
    ];
    if (!VERIFICATION_STATUSES.includes(verification_status)) {
      return ApiResponse(res, "error", 400, "Invalid verification status!");
    }

    // Update lead
    const updatedLead = await LeadServices.updateLead(
      lead_id,
      { verification_status },
      transaction
    );

    await transaction.commit();
    return ApiResponse(
      res,
      "success",
      200,
      "Lead updated successfully",
      updatedLead,
      null,
      null
    );
  } catch (error) {
    if (transaction) await transaction.rollback(); // Rollback transaction if initialized
    return ApiResponse(
      res,
      "error",
      500,
      "Failed to update verification status!",
      null,
      error,
      null
    );
  }
}

async function getTotalLeadsCount(req, res) {
  try {
    const {
      status = "active",
      lead_status,
      verification_status,
      today = "false",
      assigned_to,
    } = req.query;

    let leadConditions = {};
    let assignmentConditions = {};

    if (status) leadConditions.status = { [Op.like]: `%${status}%` };
    if (lead_status)
      leadConditions.lead_status = { [Op.like]: `%${lead_status}%` };
    if (verification_status)
      leadConditions.verification_status = {
        [Op.like]: `%${verification_status}%`,
      };

    // Filters for LeadAssignment
    if (assigned_to) assignmentConditions.assigned_to = assigned_to;

    // Handle 'today' filter: Convert IST to UTC
    if (today === "true") {
      // Get today's date in IST
      const todayStartIST = moment.tz("Asia/Kolkata").startOf("day").toDate();
      const todayEndIST = moment.tz("Asia/Kolkata").endOf("day").toDate();

      // Convert to UTC
      const todayStartUTC = moment(todayStartIST).utc().toDate();
      const todayEndUTC = moment(todayEndIST).utc().toDate();

      console.log("Date range in UTC:", todayStartUTC, todayEndUTC);

      if (assigned_to) {
        // Apply to LeadAssignment's `createdAt` if `assigned_to` is provided
        assignmentConditions.createdAt = {
          [Op.between]: [todayStartUTC, todayEndUTC],
        };
      } else {
        // Apply date range to Lead's `createdAt`
        leadConditions.createdAt = {
          [Op.between]: [todayStartUTC, todayEndUTC],
        };
      }
    }

    let totalLeads = 0;

    if (assigned_to) {
      // Count leads based on assigned_to and today filters in LeadAssignment
      totalLeads = await LeadAssignment.count({
        where: assignmentConditions,
        include: [
          {
            model: Lead,
            as: "Lead", // Ensure this matches the alias in your model associations
            where: leadConditions, // Apply Lead filters here
          },
        ],
      });
    } else {
      // Otherwise, count directly from the Lead table
      totalLeads = await Lead.count({
        where: leadConditions,
      });
    }

    console.log("Total leads count:", totalLeads);

    // Return the response
    return ApiResponse(
      res,
      "success",
      200,
      "Leads count fetched successfully",
      totalLeads === 0 ? totalLeads.toString() : totalLeads,
      null,
      null
    );
  } catch (error) {
    console.error("Error fetching leads count:", error);
    return ApiResponse(
      res,
      "error",
      500,
      "Failed to fetch total leads count!",
      null,
      error,
      null
    );
  }
}

async function updateApplicationStatus(req,res){
  const transaction = await sequelize.transaction()
  try {
    const {lead_id, application_status, lead_status, role} = req.body

    if(!lead_id || !application_status || !lead_status || !role){
      return ApiResponse(res, 'error', 400, "Missing required fields !")
    }

    if (role !== ROLE_ADMIN && role !== ROLE_MANAGER) {
      return ApiResponse(res,'error', 403, "Unauthorized Access !")
    }

    const validApplicationStatuses = [
      "Manager 1 Approved",
      "Manager 2 Approved",
      "Rejected",
      "Closed",
      "Login"
    ]

    if(!validApplicationStatuses.includes(application_status)){
      return ApiResponse(res,'error',400, "Invalid Appliation Status !")
    }

    if(lead_status !== "12 documents collected"){
      return ApiResponse(res, 'error', 400, "Application Status Cannot Updated Now !")
    }

    const updatedLead = await LeadServices.updateLead(lead_id,{application_status},transaction)
    await transaction.commit()
    return ApiResponse(res, 'success', 200, "Lead updated with application status successfully.", updatedLead, null,null)
  } catch (error) {
    if(transaction) await transaction.rollback()
    console.log(error);
    return ApiResponse(res,'error', 500, "Failed to update application status !", null,error,null)
  }
}

async function updateLeadStatus(req,res){
  const transaction = await sequelize.transaction()
  try {
      const {lead_id, lead_status, role} = req.body

      if(!lead_id || !lead_status || !role){
        return ApiResponse(res, 'error', 400, "Missing required fields !")
      }

      if (role !== ROLE_EMPLOYEE) {
        return ApiResponse(res,'error', 403, "Only Employee can change lead status !")
      }

      if(!LEAD_STATUSES.includes(lead_status)){
        return ApiResponse(res,'error',400, "Invalid Appliation Status !")
      }

      const updatedLead = await LeadServices.updateLead(lead_id,{lead_status}, transaction)

      await transaction.commit()

      return ApiResponse(res, 'success', 200, "Lead with new lead status updated successfully.", updatedLead, null, null)
  } catch (error) {
    if(transaction) await transaction.rollback()
    console.log(error);
    return ApiResponse(res,'error', 500, "Failed to update lead status !", null, error, null)
  }
}

module.exports = {
  createBulkLeads,
  getAllLeadsWithPagination,
  getLeadById,
  updateLeadReportsActivities,
  updateVerificationStatus,
  getTotalLeadsCount,
  updateApplicationStatus,
  updateLeadStatus
};
