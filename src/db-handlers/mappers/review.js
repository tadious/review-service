const reviewCommentMapper = require('./review-comment');
const reviewMediaMapper = require('./review-media');
const reviewReactionMapper = require('./review-reaction');
const reviewViewMapper = require('./review-view');

const create = (userId, review) => ({
  user_id: userId,
  item: review.item,
  brand: review.brand,
  description: review.description,
  tags: review.tags,
  rating: review.rating,
});

const expose = review => ({
  id: review.get('id'),
  createdAt: review.get('created_at'),
  updatedAt: review.get('updated_at'),
  userId: review.get('user_id'),
  item: review.get('item'),
  brand: review.get('brand'),
  description: review.get('description'),
  tags: review.get('tags'),
  rating: review.get('rating'),
  media: review.related('media') ? review.related('media')
    .map(mediaFile => reviewMediaMapper.expose(mediaFile)) : [],
  comments: review.related('comments') ? review.related('comments')
    .map(comment => reviewCommentMapper.expose(comment)) : [],
  reactions: review.related('reactions') ? review.related('reactions')
    .map(reaction => reviewReactionMapper.expose(reaction)) : [],
  views: review.related('views') ? review.related('views')
    .map(view => reviewViewMapper.expose(view)) : [],
});

module.exports = {
  create,
  expose,
};
