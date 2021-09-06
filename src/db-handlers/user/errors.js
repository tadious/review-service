class UserError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, UserError);
  }
}

class UserNotFoundError extends UserError { }

class DuplicateEmailError extends UserError { }

class DuplicateMobileNumberError extends UserError { }

class InvalidRefreshTokenError extends UserError { }

class AuthenticationError extends UserError { }

class UserRefreshTokenNotFoundError extends UserError { }

module.exports = {
  UserNotFoundError,
  DuplicateEmailError,
  DuplicateMobileNumberError,
  InvalidRefreshTokenError,
  UserRefreshTokenNotFoundError,
  AuthenticationError,
};
