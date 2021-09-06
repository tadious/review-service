const create = (reviewCommentId, userId, reaction) => ({
  review_comment_id: reviewCommentId,
  user_id: userId,
  type: reaction.type,
});

const expose = reaction => ({
  id: reaction.get('id'),
  createdAt: reaction.get('created_at'),
  reviewCommentId: reaction.get('review_comment_id'),
  userId: reaction.get('user_id'),
  type: reaction.get('type'),
});

module.exports = {
  create,
  expose,
};
