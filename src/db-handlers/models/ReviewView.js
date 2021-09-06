const Bookshelf = require('bookshelf');

const model = (bookshelf) => {
  const ReviewView = bookshelf.Model.extend({
    tableName: 'review_views',
    hasTimestamps: true,
  });

  return bookshelf.model('ReviewView', ReviewView);
};

module.exports = {
  model,
};
