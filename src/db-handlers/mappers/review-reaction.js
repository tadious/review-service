const create = (reviewId, userId, reaction) => ({
  review_id: reviewId,
  user_id: userId,
  type: reaction.type,
});

const expose = reaction => ({
  id: reaction.get('id'),
  createdAt: reaction.get('created_at'),
  reviewId: reaction.get('review_id'),
  userId: reaction.get('user_id'),
  type: reaction.get('type'),
});

module.exports = {
  create,
  expose,
};
