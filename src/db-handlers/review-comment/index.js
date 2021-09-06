const db = require('../../lib/db');
const log = require('loglevel');
const mappers = require('../mappers');
const {
  ForbiddenReviewCommentUpdateError,
  ReviewCommentNotFoundError,
} = require('../review/errors');

const create = (reviewId, userId, data) => db.transaction(async (transacting) => {
  const ReviewComment = db.model('ReviewComment');
  try {
    const comment = await ReviewComment
      .forge(mappers.reviewComment.create(reviewId, userId, data))
      .save(null, { transacting });
    return mappers.reviewComment.expose(comment);
  } catch (error) {
    log.error('Could not create review-comment', { reviewId, userId, data, error });
    throw error;
  }
});

const update = (id, reviewId, userId, data) => db.transaction(async (transacting) => {
    const ReviewComment = db.model('ReviewComment');
  try {
    const comment = await ReviewComment
      .where({ id, review_id: reviewId, deactivated_at: null })
      .fetch({ transacting });

    if (userId !== comment.get('user_id')) {
      log.error('User forbidden from updating comment', { id, userId });
      throw new ForbiddenReviewCommentUpdateError('User forbidden to update comment');
    }
    await comment.save(mappers.reviewComment.create(reviewId, userId, data), { transacting });
  } catch (error) {
    if (error instanceof ReviewComment.NotFoundError) {
      log.info('No Comment found', { id });
      throw new ReviewCommentNotFoundError(`No Comment found with id ${id}`);
    }
    log.error('Could not update comment', { id, error });
    throw error;
  }
});

const deactivate = (id, reviewId, userId) => db.transaction(async (transacting) => {
  const ReviewComment = db.model('ReviewComment');
  try {
    const comment = await ReviewComment
      .where({ id, review_id: reviewId, deactivated_at: null })
      .fetch({ transacting });

    if (userId !== comment.get('user_id')) {
      log.error('User forbidden from deactivating comment', { id, userId });
      throw new ForbiddenReviewCommentUpdateError('User forbidden to deactivate comment');
    }
    await comment.save({ deactivated_at: new Date() }, { transacting });
  } catch (error) {
    if (error instanceof ReviewComment.NotFoundError) {
      log.info('No Comment found', { id });
      throw new ReviewCommentNotFoundError(`No Comment found with id ${id}`);
    }
    log.error('Could not deactivate comment', { id, error });
    throw error;
  }
});

module.exports = {
  create,
  deactivate,
  update,
};
