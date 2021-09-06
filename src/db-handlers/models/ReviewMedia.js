const Bookshelf = require('bookshelf');

const enums = {
  TYPES: {
    IMAGE: 'image',
    SPIN: 'spin',
    VIDEO: 'video',
  },
};

const model = (bookshelf) => {
  const ReviewMedia = bookshelf.Model.extend({
    tableName: 'review_media',
    hasTimestamps: true,
  });

  return bookshelf.model('ReviewMedia', ReviewMedia);
};

module.exports = {
  model,
  enums,
};
