const { LeadDocument, Lead } = require("../models");
const { ApiResponse } = require("../utilities/api-responses/ApiResponse");

async function addLeadDocuments(req, res) {
  try {
    const { lead_id, documents } = req.body;
    if (!lead_id || !Array.isArray(documents) || documents.length === 0) {
      return ApiResponse(
        res,
        "error",
        400,
        "Invalid input: lead_id and documents are required."
      );
    }

    const createdDocuments = await LeadDocument.bulkCreate(
      documents.map((doc) => ({
        lead_id,
        document_url: doc.document_url,
        document_type: doc.document_type,
        document_name: doc.document_name,
        status: doc.status || "active",
      }))
    );

    return ApiResponse(
      res,
      "success",
      201,
      "Documents Added Successfully !",
      createdDocuments
    );
  } catch (error) {
    return ApiResponse(
      res,
      "error",
      500,
      "Failed to Add Lead Documents !",
      null,
      error,
      null
    );
  }
}

async function getLeadDocumentsByLeadId(req, res) {
  try {
    const { lead_id } = req.query;
    if (!lead_id || isNaN(lead_id) || parseInt(lead_id) <= 0) {
      return ApiResponse(res, "error", 400, "Invalid Lead ID!");
    }

    const validLeadId = parseInt(lead_id);
    // Check if the lead exists in the Lead table (only retrieve the id field)
    const leadExists = await Lead.findOne({
      where: { id: validLeadId,  status:'active' },
      attributes: ["id"], // Only retrieve the 'id' field
    });

    if (!leadExists) {
      return ApiResponse(res, "error", 400, "Lead not found!");
    }

    const leadDocuments = await LeadDocument.findAll({
        where:{lead_id: validLeadId, status:'active'}
    })

    return ApiResponse(res, 'success', 200, "Lead Documents Fetch Successfully.", leadDocuments, null,null)
  } catch (error) {
    return ApiResponse(res,"error",500,"Failed to fetch Lead Documents !",null,error,null);
  }
}

async function deleteLeadDocument(req,res){
  try {
    const {lead_document_id, updated_by} = req.body

    if (!lead_document_id) {
      return ApiResponse(res, 'error', 400, "Id is required!");
    }

    // if (!updated_by) {
    //   return ApiResponse(res, 'error', 400, "Updated by ID is required!");
    // }

    const [updatedCount] = await LeadDocument.update(
      { status: 'deleted', updated_by: updated_by },
      { where: { id:lead_document_id } }
    );

    if (updatedCount === 0) {
      // No record was updated, meaning the record does not exist
      return ApiResponse(res, 'error', 404, "Lead Document Not Found!");
    }

    // Record was successfully updated (soft deleted)
    return ApiResponse(res, 'success', 200, "Lead Document Soft Deleted Successfully!");
  } catch (error) {
    return ApiResponse(res, 'error', 500, "Failed to delete lead document !", null, error, null)
  }
}

module.exports = {
  addLeadDocuments,
  getLeadDocumentsByLeadId,
  deleteLeadDocument
};
