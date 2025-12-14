// Standardized API Response Utilities

/**
 * Send success response
 */
export const sendSuccess = (res, message = "Success", data = null, statusCode = 200) => {
  const response = {
    success: true,
    message
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send error response
 */
export const sendError = (res, message = "Error", statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send validation error response
 */
export const sendValidationError = (res, errors) => {
  return sendError(res, "Validation error", 400, errors);
};

/**
 * Send not found response
 */
export const sendNotFound = (res, resource = "Resource") => {
  return sendError(res, `${resource} not found`, 404);
};

/**
 * Send unauthorized response
 */
export const sendUnauthorized = (res, message = "Not authorized") => {
  return sendError(res, message, 401);
};

/**
 * Send forbidden response
 */
export const sendForbidden = (res, message = "Access denied") => {
  return sendError(res, message, 403);
};

/**
 * Send paginated response
 */
export const sendPaginated = (res, data, pagination, message = "Success") => {
  return sendSuccess(res, message, {
    items: data,
    pagination: {
      page: pagination.page || 1,
      limit: pagination.limit || 10,
      total: pagination.total || 0,
      totalPages: Math.ceil((pagination.total || 0) / (pagination.limit || 10))
    }
  });
};

/**
 * Send created response
 */
export const sendCreated = (res, message = "Created successfully", data = null) => {
  return sendSuccess(res, message, data, 201);
};

/**
 * Send no content response
 */
export const sendNoContent = (res) => {
  return res.status(204).send();
};

export default {
  sendSuccess,
  sendError,
  sendValidationError,
  sendNotFound,
  sendUnauthorized,
  sendForbidden,
  sendPaginated,
  sendCreated,
  sendNoContent
};

