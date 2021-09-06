const reviewDbHandler = require('../../db-handlers/review');
const reviewMediaDbHandler = require('../../db-handlers/review-media');
const reviewViewDbHandler = require('../../db-handlers/review-view');
const SirvClient = require('../../service-clients/SirvClient');

const sanitizeFilaname = (item) => {
  return item
    .replace(/\s/g, '-')
    .replace(/[^\w\s]/gi, '')
    .toLowerCase();
}

const create = async (user, reviewData) => {
  let filename;
  if (reviewData.file) {
    filename = await SirvClient
      .instance()
      .uploadFile(
        `/reviews/${user.id}-${sanitizeFilaname(reviewData.item)}.jpg`,
        reviewData.file,
      );
  }

  const review = await reviewDbHandler.create(user.id, reviewData);
  await reviewMediaDbHandler.create(
    review.id,
    {
      filename,
      type: reviewData.type,
    },
  );
  return reviewDbHandler.getById(review.id);
};

const getById = async (reviewId, loggedUser) => {
  const review = await reviewDbHandler.getById(reviewId);
  if (!loggedUser.roles.includes('ADMIN') && review.userId !== loggedUser.id) {
    const view = await reviewViewDbHandler.create(reviewId, loggedUser.id);
    review.views.push(view);
  }
  return review;
}

module.exports = {
  create,
  getById,
};
