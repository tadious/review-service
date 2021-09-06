const Bookshelf = require('bookshelf');

const { REACTIONS } = require('./enums');

const enums = {
  REACTIONS,
};

const model = (bookshelf) => {
  const ReviewReaction = bookshelf.Model.extend({
    tableName: 'review_reactions',
    hasTimestamps: true,
  });

  return bookshelf.model('ReviewReaction', ReviewReaction);
};

module.exports = {
  model,
  enums,
};
