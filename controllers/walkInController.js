const { WalkIn } = require("../models");
const { ApiResponse } = require("../utilities/api-responses/ApiResponse");

async function scheduleWalkIn(req,res){
    try {
        const {lead_id,walk_in_status,walk_in_date_time,is_rescheduled,rescheduled_date_time,note,created_by,} = req.body

        if(!lead_id || !walk_in_status || !walk_in_date_time || !created_by){
            return ApiResponse(res, 'error', 400, "Missing required fields !")
        }

        const savedWalkIn = await WalkIn.create({
            lead_id,walk_in_status,walk_in_date_time,is_rescheduled,rescheduled_date_time,note,created_by
        })

        return ApiResponse(res, 'success', 201, "Walk In scheduled successfully.", savedWalkIn, null,null)

    } catch (error) {
        console.log(error);
        return ApiResponse(res, 'error', 500, "Failed to schedule a walk in !", null, error, null)
    }
}

module.exports = {
    scheduleWalkIn
}