class DetailedResponseError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
  }
}

module.exports = DetailedResponseError;
