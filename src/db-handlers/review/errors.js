class ReviewError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, ReviewError);
  }
}

class ReviewNotFoundError extends ReviewError { }

class ReviewCommentNotFoundError extends ReviewError { }

class ReviewCommentReactionNotFoundError extends ReviewError { }

class ReviewReactionNotFoundError extends ReviewError { }

class ReviewMediaNotFoundError extends ReviewError { }

class ReviewViewNotFoundError extends ReviewError { }

class ForbiddenReviewUpdateError extends ReviewError { }

class ForbiddenReviewCommentUpdateError extends ReviewError { }

class ForbiddenReviewReactionUpdateError extends ReviewError { }

class ForbiddenReviewCommentReactionUpdateError extends ReviewError { }

class ForbiddenReviewMediaUpdateError extends ReviewError { }

class ForbiddenReviewViewUpdateError extends ReviewError { }



module.exports = {
  ReviewNotFoundError,
  ReviewCommentNotFoundError,
  ReviewCommentReactionNotFoundError,
  ReviewReactionNotFoundError,
  ReviewMediaNotFoundError,
  ReviewViewNotFoundError,
  ForbiddenReviewUpdateError,
  ForbiddenReviewCommentUpdateError,
  ForbiddenReviewReactionUpdateError,
  ForbiddenReviewCommentReactionUpdateError,
  ForbiddenReviewViewUpdateError,
  ForbiddenReviewMediaUpdateError,
};
