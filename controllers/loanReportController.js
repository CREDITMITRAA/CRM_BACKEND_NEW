const { LoanReport, Lead } = require("../models");
const { ApiResponse } = require("../utilities/api-responses/ApiResponse");

async function getLoanReportsByLeadId(req, res) {
  try {
    const { leadId } = req.params;

    // Check if leadId is a valid integer
    if (!leadId || isNaN(leadId) || parseInt(leadId) <= 0) {
      return ApiResponse(res, "error", 400, "Invalid Lead ID!");
    }

    // Convert leadId to integer before querying
    const validLeadId = parseInt(leadId);

    // Check if the lead exists in the Lead table (only retrieve the id field)
    const leadExists = await Lead.findOne({
      where: { id: validLeadId },
      attributes: ["id"], // Only retrieve the 'id' field
    });

    if (!leadExists) {
      return ApiResponse(res, "error", 400, "Lead not found!");
    }

    // Fetch the loan reports for the valid leadId
    const loanReports = await LoanReport.findAll({
      where: { lead_id: validLeadId },
    });

    return ApiResponse(
      res,
      "success",
      200,
      "Loan reports retrieved successfully",
      loanReports
    );
  } catch (error) {
    console.error("Error fetching loan reports by lead ID:", error);
    return ApiResponse(
      res,
      "error",
      500,
      "Failed to fetch loan reports",
      null,
      error,
      null
    );
  }
}

async function getAllLoanReports(req, res) {
  try {
    const loanReports = await LoanReport.findAll();

    return ApiResponse(
      res,
      "success",
      200,
      "Loan reports retrieved successfully",
      loanReports
    );
  } catch (error) {
    console.error("Error fetching all loan reports:", error);
    return ApiResponse(
      res,
      "error",
      500,
      "Failed to fetch loan reports",
      null,
      error,
      null
    );
  }
}

module.exports = {
  getLoanReportsByLeadId,
  getAllLoanReports,
};
