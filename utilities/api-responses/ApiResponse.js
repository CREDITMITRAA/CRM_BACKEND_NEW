exports.ApiResponse = (
    res,
    status,
    statusCode,
    message,
    data = null,
    error = null,
    pagination = null
  ) => {
    // Base structure of the response object
    const response = {
      status, // success or error
      statusCode, // HTTP status code
      message, // message describing the status of the response
    };
  
    // Only include pagination if it exists
    if (pagination) {
      response.pagination = pagination;
    }
  
    // Only include data if it exists
    if (data) {
      response.data = data;
    }
  
    // Only include error if status is "error" and error details exist
    if (status === "error" && error) {
      response.error = {
        code: error.code || "UNKNOWN_ERROR",
        message: error.message || "An error occurred",
        details: error.details || null,
      };
    }
  
    // Send the response with the appropriate status code
    return res.status(statusCode).json(response);
  }
  
  