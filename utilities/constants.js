const LEAD_STATUSES = [
    "Not Contacted",
    'Interested',
    "Follow Up",
    "Call Back",
    "RNR ( Ring No Response )",
    "Switched Off",
    "Busy",
    "Not Interested",
    "Not Working / Not Reachable",
    "Message",
    "Email",
    "Verification 1"
]

const VERIFICATION_STATUSES = [
    "Verification 1",
    "Under Review",
    "On Hold",
    "Manager 1 Approved",
    "Manager 2 Approved",
    "Approved for Walk-In",
    "Rejected"
]

const ROLE_ADMIN = "ROLE_ADMIN"
const ROLE_EMPLOYEE = "ROLE_EMPLOYEE"
const ROLE_MANAGER = "ROLE_MANAGER"

module.exports = {
    LEAD_STATUSES,
    VERIFICATION_STATUSES,
    ROLE_ADMIN,
    ROLE_EMPLOYEE,
    ROLE_MANAGER
}