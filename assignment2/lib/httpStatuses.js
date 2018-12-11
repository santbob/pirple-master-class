/*
 * The Mapping of Http status codes used in the project
 * reference - https://httpstatuses.com/
 */
const httpStatuses = {
  SUCCESS: {
    code: 200,
    message: 'Success'
  },
  INVALID_REQUEST: {
    code: 400,
    message: 'Mandatory fields missing or an invalid request'
  },
  AUTH_FAILED: {
    code: 401,
    message: 'Authentication failed'
  },
  FORBIDDEN: {
    code: 403,
    message: 'Not allowed to modify the data'
  },
  NOT_FOUND: {
    code: 404,
    message: 'Not Found'
  },
  METHOD_NOT_ALLOWED: {
    code: 405,
    message: 'Method not allowed for this request'
  },
  SOMETHING_WRONG: {
    code: 501,
    message: 'Something went'
  },
  ERROR_CREATING_DOCUMENT: {
    code: 510,
    message: "Error creating file"
  },
  ERROR_UPDATING_DOCUMENT: {
    code: 511,
    message: "Error updating document"
  },
  ERROR_DELETING_DOCUMENT: {
    code: 512,
    message: "Error deleting the document"
  },
  ERROR_FINDING_DOCUMENT: {
    code: 513,
    message: "Unable to find the the document"
  },
  TOKEN_EXPIRED: {
    code: 514,
    message: 'Token expired'
  },
  USER_ALREADY_EXISTS: {
    code: 515,
    message: 'User already exists'
  },
  PAYMENT_FAILED: {
    code: 516,
    message: 'Payment failed'
  }
};
module.exports = httpStatuses;
