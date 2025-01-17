const INITIAL_LEAD_STATUSES = [
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
    "Not Possible"
]

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
    "Verification 1",
    "Scheduled For Walk-In",
    "Okay for Policy",
    "Think and get back",
    "12 documents collected",
    "Not okay for Policy",
    "Not Possible"
]

const VERIFICATION_STATUSES = [
    "Scheduled For Walk-In",
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

const APPLICATION_STATUSES = [
    "Scheduled For Walk-In",
    "Manager 1 Approved",
    "Manager 2 Approved",
    "Rejected",
    "Closed",
    "Login"
]

const S3_BUCKET_NAME = "crm-creditmitra"

module.exports = {
    LEAD_STATUSES,
    VERIFICATION_STATUSES,
    ROLE_ADMIN,
    ROLE_EMPLOYEE,
    ROLE_MANAGER,
    TASK_STATUSES,
    WALK_IN_STATUSES,
    APPLICATION_STATUSES,
    INITIAL_LEAD_STATUSES,
    S3_BUCKET_NAME
}