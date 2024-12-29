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

const TASK_STATUSES = [
    "Upcoming",
    "Pending",
    "Completed"
]

const ROLE_ADMIN = "ROLE_ADMIN"
const ROLE_EMPLOYEE = "ROLE_EMPLOYEE"
const ROLE_MANAGER = "ROLE_MANAGER"

const WALK_IN_STATUSES = [
    "Upcoming",
    "Rescheduled",
    "Completed"
]

module.exports = {
    LEAD_STATUSES,
    VERIFICATION_STATUSES,
    ROLE_ADMIN,
    ROLE_EMPLOYEE,
    ROLE_MANAGER,
    TASK_STATUSES,
    WALK_IN_STATUSES
}