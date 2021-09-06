class ResponseError extends Error {
  constructor(statusCode, message) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

module.exports = ResponseError;
