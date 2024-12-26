const jwt = require('jsonwebtoken')
const { ApiResponse } = require('../utilities/api-responses/ApiResponse')
require('dotenv').config()

function authenticate(allowedRoles = []) {
    return (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return ApiResponse(res, 'error', 401, 'Token not provided or invalid format!');
            }

            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
                return ApiResponse(res, 'error', 403, 'Forbidden: Access denied for your role');
            }

            req.user = decoded; // Attach user details to request
            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return ApiResponse(res, 'error', 401, 'Token expired, please log in again');
            } else {
                return ApiResponse(res, 'error', 400, 'Invalid Token!');
            }
        }
    };
}

module.exports = {
    authenticate
}