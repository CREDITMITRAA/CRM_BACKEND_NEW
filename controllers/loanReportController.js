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

async function updateLoanReport(req,res){
  try {
    const { id, lead_id, loan_amount, bank_name, loan_type, emi, outstanding, status, updated_by } = req.body;
    if (!id) {
      return ApiResponse(res, 'error', 400, 'LoanReport ID is required.');
    }

    const loanReport = await LoanReport.findByPk(id);
    if (!loanReport) {
      return ApiResponse(res, 'error', 404, 'LoanReport not found.');
    }

    const updateData = {};
    if (lead_id !== undefined) updateData.lead_id = lead_id;
    if (loan_amount !== undefined) updateData.loan_amount = loan_amount;
    if (bank_name !== undefined) updateData.bank_name = bank_name;
    if (loan_type !== undefined) updateData.loan_type = loan_type;
    if (emi !== undefined) updateData.emi = emi;
    if (outstanding !== undefined) updateData.outstanding = outstanding;
    if (status !== undefined) updateData.status = status;
    if (updated_by !== undefined) updateData.updated_by = updated_by;

    await loanReport.update(updateData);
    return ApiResponse(res, 'success', 200, 'LoanReport updated successfully.', loanReport);
  } catch (error) {
    console.log(error);
    return ApiResponse(res,'error', 500, "Failed to update loan report !", null, error,null)
  }
}

async function deleteLoanReport(req, res) {
  try {
    const { updated_by, id } = req.body; // Assume `updatedBy` is passed in the request body

    if (!id) {
      return ApiResponse(res, 'error', 400, "Id is required!");
    }

    if (!updated_by) {
      return ApiResponse(res, 'error', 400, "Updated by ID is required!");
    }

    // Attempt to perform a soft delete by updating the status and updated_by
    const [updatedCount] = await LoanReport.update(
      { status: 'deleted', updated_by: updated_by },
      { where: { id } }
    );

    if (updatedCount === 0) {
      // No record was updated, meaning the record does not exist
      return ApiResponse(res, 'error', 404, "Loan Report Not Found!");
    }

    // Record was successfully updated (soft deleted)
    return ApiResponse(res, 'success', 200, "Loan Report Soft Deleted Successfully!");
  } catch (error) {
    console.error(error);
    return ApiResponse(res, 'error', 500, "Failed to soft delete loan report!", null, error, null);
  }
}

module.exports = {
  getLoanReportsByLeadId,
  getAllLoanReports,
  updateLoanReport,
  deleteLoanReport
};
