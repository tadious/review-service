const db = require('../../lib/db');
const log = require('loglevel');
const mappers = require('../mappers');

const {
  ForbiddenReviewCommentReactionUpdateError,
  ReviewCommentReactionNotFoundError,
} = require('../review/errors');

const create = (commentId, userId, data) => db.transaction(async (transacting) => {
  const ReviewCommentReaction = db.model('ReviewCommentReaction');
  try {
    const reaction = await ReviewCommentReaction
      .forge(mappers.reviewCommentReaction.create(commentId, userId, data))
      .save(null, { transacting });
    return mappers.reviewCommentReaction.expose(reaction);
  } catch (error) {
    log.error('Could not create reaction', { commentId, userId, data, error });
    throw error;
  }
});

const remove = (id, commentId, userId) => db.transaction(async (transacting) => {
  const ReviewCommentReaction = db.model('ReviewCommentReaction');
  try {
    const reaction = await ReviewCommentReaction
      .where({ id, review_comment_id: commentId })
      .fetch({ transacting });

    if (userId !== reaction.get('user_id')) {
      log.error('User forbidden from removing reaction', { id, commentId, userId });
      throw new ForbiddenReviewCommentReactionUpdateError('User forbidden from removing reaction');
    }
    await reaction.destroy(null, { transacting });
  } catch (error) {
    if (error instanceof ReviewCommentReaction.NotFoundError) {
      log.info('No Reaction found', { id });
      throw new ReviewCommentReactionNotFoundError(`No Reaction found with id ${id}`);
    }
    log.error('Could not remove reaction', { id, error });
    throw error;
  }
});

module.exports = {
  create,
  remove,
};
