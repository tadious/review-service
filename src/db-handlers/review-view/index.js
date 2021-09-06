const db = require('../../lib/db');
const log = require('loglevel');
const mappers = require('../mappers');

const create = (reviewId, userId) => db.transaction(async (transacting) => {
  const ReviewView = db.model('ReviewView');
  try {
    const view = await ReviewView
      .forge(mappers.reviewView.create(reviewId, userId))
      .save(null, { transacting });
    return mappers.reviewView.expose(view);
  } catch (error) {
    log.error('Could not create view', { reviewId, userId, error });
    throw error;
  }
});

module.exports = {
  create,
};
