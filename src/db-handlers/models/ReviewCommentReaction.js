const Bookshelf = require('bookshelf');

const { REACTIONS } = require('./enums');

const enums = {
  REACTIONS,
};

const model = (bookshelf) => {
  const ReviewCommentReaction = bookshelf.Model.extend({
    tableName: 'review_comment_reactions',
    hasTimestamps: true,
  });

  return bookshelf.model('ReviewCommentReaction', ReviewCommentReaction);
};

module.exports = {
  model,
  enums,
};
