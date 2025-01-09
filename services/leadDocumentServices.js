const {LeadDocument} = require("../models");

async function addLeadDocument(data, transaction) {
    try {
      // Ensure transaction object is passed correctly
      const options = transaction ? { transaction } : {};
      const addedLeadDocument = await LeadDocument.create(data, options);
      return addedLeadDocument;
    } catch (error) {
      console.error("Error adding LeadDocument:", error);
      throw error; // Rethrow the error to be handled by the calling function
    }
  }

module.exports = {
    addLeadDocument
}