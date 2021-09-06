const reviewCommentReactionMapper = require('./review-comment-reaction');

const create = (reviewId, userId, comment) => ({
  review_id: reviewId,
  user_id: userId,
  text: comment.text,
});

const expose = comment => ({
  id: comment.get('id'),
  createdAt: comment.get('created_at'),
  updatedAt: comment.get('updated_at'),
  reviewId: comment.get('review_id'),
  userId: comment.get('user_id'),
  text: comment.get('text'),
  reactions: comment.related('reactions') ? comment.related('reactions')
    .map(reaction => reviewCommentReactionMapper.expose(reaction)) : [],
});

module.exports = {
  create,
  expose,
};
