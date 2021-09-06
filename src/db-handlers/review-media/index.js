const db = require('../../lib/db');
const log = require('loglevel');
const mappers = require('../mappers');

const create = (reviewId, mediaData) => db.transaction(async (transacting) => {
  const ReviewMedia = db.model('ReviewMedia');
  try {
    const reviewMedia = await ReviewMedia
      .forge(mappers.reviewMedia.create(reviewId, mediaData))
      .save(null, { transacting });
    return mappers.reviewMedia.expose(reviewMedia);
  } catch (error) {
    log.error('Could not create review media', { reviewId, mediaData, error });
    throw error;
  }
});

module.exports = {
  create,
};
