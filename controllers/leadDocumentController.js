const { LeadDocument } = require("../models");
const { ApiResponse } = require("../utilities/api-responses/ApiResponse");

async function addLeadDocuments(req,res){
    try {
        const {lead_id, documents} = req.body
        if(!lead_id || !Array.isArray(documents) || documents.length === 0){
            return ApiResponse(res, 'error', 400, 'Invalid input: lead_id and documents are required.')
        }

        const createdDocuments = await LeadDocument.bulkCreate(
            documents.map((doc)=>({
                lead_id,
                document_url: doc.document_url,
                document_type: doc.document_type,
                document_name: doc.document_name,
                status: doc.status || 'active',
              }))
        )

        return ApiResponse(res, 'success', 201, "Documents Added Successfully !", createdDocuments)
    } catch (error) {
        return ApiResponse(res,'error', 500, "Failed to Add Lead Documents !", null, error, null)
    }
}

module.exports = {
    addLeadDocuments
}