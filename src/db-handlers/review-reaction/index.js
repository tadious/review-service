const log = require("loglevel");
const db = require("../../lib/db");
const mappers = require("../mappers");

const {
  ForbiddenReviewReactionUpdateError,
  ReviewReactionNotFoundError,
} = require("../review/errors");

const create = (reviewId, userId, data) =>
  db.transaction(async (transacting) => {
    const ReviewReaction = db.model("ReviewReaction");
    try {
      const reaction = await ReviewReaction.forge(
        mappers.reviewReaction.create(reviewId, userId, data)
      ).save(null, { transacting });
      return mappers.reviewReaction.expose(reaction);
    } catch (error) {
      log.error("Could not create reaction", {
        reviewId,
        userId,
        data,
        error,
      });
      throw error;
    }
  });

const remove = (id, reviewId, userId) =>
  db.transaction(async (transacting) => {
    const ReviewReaction = db.model("ReviewReaction");
    try {
      const reaction = await ReviewReaction.where({
        id,
        review_id: reviewId,
      }).fetch({ transacting });

      if (userId !== reaction.get("user_id")) {
        log.error("User forbidden from removing reaction", {
          id,
          reviewId,
          userId,
        });
        throw new ForbiddenReviewReactionUpdateError(
          "User forbidden from removing reaction"
        );
      }
      await reaction.destroy(null, { transacting });
    } catch (error) {
      if (error instanceof ReviewReaction.NotFoundError) {
        log.info("No Reaction found", { id });
        throw new ReviewReactionNotFoundError(
          `No Reaction found with id ${id}`
        );
      }
      log.error("Could not remove reaction", { id, error });
      throw error;
    }
  });

module.exports = {
  create,
  remove,
};
