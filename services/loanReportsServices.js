const { LoanReport } = require("../models");

async function createLoanReports(loanReports, transaction) {
  const createdLoanReports = await LoanReport.bulkCreate(loanReports, {
    transaction,
    returning: true,
  });
  return createdLoanReports; // Return the created loan reports
}


module.exports = {
    createLoanReports
}