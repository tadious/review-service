const db = require('../../lib/db');
const log = require('loglevel');
const mappers = require('../mappers');

const { ReviewNotFoundError, ForbiddenReviewUpdateError } = require('./errors');

const create = (userId, reviewData) => db.transaction(async (transacting) => {
  const Review = db.model('Review');
  try {
    const review = await Review
      .forge(mappers.review.create(userId, reviewData))
      .save(null, { transacting });
    return mappers.review.expose(review);
  } catch (error) {
    log.error('Could not create review', { userId, reviewData, error });
    throw error;
  }
});

const update = (id, userId, reviewData) => db.transaction(async (transacting) => {
  const Review = db.model('Review');
  try {
    const review = await Review
      .where({ id, deactivated_at: null })
      .fetch({ transacting });

    if (userId !== review.get('user_id')) {
      log.error('User forbidden from updating review', { id, userId });
      throw new ForbiddenReviewUpdateError('User forbidden to update review');
    }
    await review.save(mappers.review.create(userId, reviewData), { transacting });
  } catch (error) {
    if (error instanceof Review.NotFoundError) {
      log.info('No Review found', { id });
      throw new ReviewNotFoundError(`No Review found with id ${id}`);
    }
    log.error('Could not update review', { id, error });
    throw error;
  }
});

const getById = id => db.transaction(async (transacting) => {
  const Review = db.model('Review');
  try {
    const review = await Review
      .where({ id, deactivated_at: null })
      .fetch({
        withRelated: [
          'media',
          'comments',
          'views',
          'reactions'
        ],
        transacting,
      });
    return mappers.review.expose(review);
  } catch (error) {
    if (error instanceof Review.NotFoundError) {
      log.info('No Review found', { id });
      throw new ReviewNotFoundError(`No Review found with id ${id}`);
    }
    log.error('Could not get user by id', { id, error });
    throw error;
  }
});

const getAll = () => db.transaction(async (transacting) => {
  const Review = db.model('Review');
  try {
    const dbReviews = await Review
      .fetchAll({
        withRelated: [
          'media',
          'comments',
          'views',
          'reactions'
        ],
        transacting,
      });
    return dbReviews.map(review => mappers.review.expose(review));
  } catch (error) {
    log.error('Could not fetch reviews', { error });
    throw error;
  }
});

const deactivate = (id, userId) => db.transaction(async (transacting) => {
  const Review = db.model('Review');
  try {
    const review = await Review
      .where({ id, deactivated_at: null })
      .fetch({ transacting });

    if (userId !== review.get('user_id')) {
      log.error('User forbidden from deactivating review', { id, userId });
      throw new ForbiddenReviewUpdateError('User forbidden to deactivate review');
    }
    await review.save({ deactivated_at: new Date() }, { transacting });
  } catch (error) {
    if (error instanceof Review.NotFoundError) {
      log.info('No Review found', { id });
      throw new ReviewNotFoundError(`No Review found with id ${id}`);
    }
    log.error('Could not deactivate review', { id, error });
    throw error;
  }
});

module.exports = {
  create,
  update,
  getById,
  getAll,
  deactivate,
};
