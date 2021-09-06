const create = (reviewId, userId) => ({
  review_id: reviewId,
  user_id: userId,
});

const expose = view => ({
  createdAt: view.get('created_at'),
  userId: view.get('user_id'),
});

module.exports = {
  create,
  expose,
};
