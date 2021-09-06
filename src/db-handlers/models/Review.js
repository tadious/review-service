const Bookshelf = require('bookshelf');

const model = (bookshelf) => {
  const Review = bookshelf.Model.extend({
    tableName: 'reviews',
    hasTimestamps: true,
    media() {
      return this.hasMany('ReviewMedia', 'review_id', 'id');
    },
    comments() {
      return this.hasMany('ReviewComment', 'review_id', 'id');
    },
    reactions() {
      return this.hasMany('ReviewReaction', 'review_id', 'id');
    },
    views() {
      return this.hasMany('ReviewView', 'review_id', 'id');
    }
  });

  return bookshelf.model('Review', Review);
};

module.exports = {
  model,
};
