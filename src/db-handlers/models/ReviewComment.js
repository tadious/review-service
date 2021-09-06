const Bookshelf = require('bookshelf');

const model = (bookshelf) => {
  const ReviewComment = bookshelf.Model.extend({
    tableName: 'review_comments',
    hasTimestamps: true,
    reactions() {
      return this.hasMany('ReviewCommentReaction', 'review_comment_id', 'id');
    },
  });

  return bookshelf.model('ReviewComment', ReviewComment);
};

module.exports = {
  model,
};
