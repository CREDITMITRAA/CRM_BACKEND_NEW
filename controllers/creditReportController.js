const { CreditReport, Lead } = require("../models");
const { ApiResponse } = require("../utilities/api-responses/ApiResponse");

async function getCreditReportsByLeadId(req, res) {
  try {
    const { leadId } = req.params;

    // Validate if leadId is provided and valid
    if (!leadId || isNaN(leadId) || parseInt(leadId) <= 0) {
      return ApiResponse(res, "error", 400, "Invalid Lead ID!");
    }

    const validLeadId = parseInt(leadId);

    // Check if the lead exists in the Lead table (only retrieve the 'id' field)
    const leadExists = await Lead.findOne({
      where: { id: validLeadId },
      attributes: ["id"], // Only retrieve the 'id' field
    });

    if (!leadExists) {
      return ApiResponse(res, "error", 400, "Lead not found!");
    }

    // Fetch credit reports for the valid leadId
    const creditReports = await CreditReport.findAll({
      where: { lead_id: validLeadId },
    });

    return ApiResponse(
      res,
      "success",
      200,
      "Credit reports retrieved successfully",
      creditReports
    );
  } catch (error) {
    console.error("Error fetching credit reports by lead ID:", error);
    return ApiResponse(
      res,
      "error",
      500,
      "Failed to fetch credit reports",
      null,
      error,
      null
    );
  }
}

async function getAllCreditReports(req, res) {
  try {
    // Fetch all credit reports from the database
    const creditReports = await CreditReport.findAll();

    return ApiResponse(
      res,
      "success",
      200,
      "All credit reports retrieved successfully",
      creditReports
    );
  } catch (error) {
    console.error("Error fetching all credit reports:", error);
    return ApiResponse(
      res,
      "error",
      500,
      "Failed to fetch credit reports",
      null,
      error,
      null
    );
  }
}

async function deleteCreditReportById(req, res) {
  try {
    const { leadIds, ids } = req.body;

    // Validate if both leadIds and ids are provided
    if (!Array.isArray(leadIds) || !Array.isArray(ids)) {
      return ApiResponse(res, "error", 400, "leadIds and ids must be arrays!");
    }

    // Delete credit reports based on the provided ids
    const deletedCount = await CreditReport.destroy({
      where: {
        lead_id: { [Op.in]: leadIds },
        id: { [Op.in]: ids },
      },
    });

    if (deletedCount === 0) {
      return ApiResponse(
        res,
        "error",
        404,
        "No credit reports found to delete!"
      );
    }

    return ApiResponse(
      res,
      "success",
      200,
      `${deletedCount} credit report(s) deleted successfully!`
    );
  } catch (error) {
    console.error("Error deleting credit report:", error);
    return ApiResponse(
      res,
      "error",
      500,
      "Failed to delete credit report(s)",
      null,
      error.message,
      null
    );
  }
}

module.exports = {
  getCreditReportsByLeadId,
  getAllCreditReports,
  deleteCreditReportById
};
