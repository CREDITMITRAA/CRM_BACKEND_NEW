const { CreditReport } = require("../models");

async function createCreditReports(creditReports, transaction) {
  const createdCreditReports = await CreditReport.bulkCreate(creditReports, {
    transaction,
    returning: true,
  });
  return createdCreditReports; // Return the created credit reports
}

module.exports = {
    createCreditReports
}