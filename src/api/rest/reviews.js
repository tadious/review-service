const express = require('express');

const {
  errorHandler,
  requestValidator,
  ResponseError,
  authorize,
} = require('./middleware');
const {
  ReviewNotFoundError,
  ForbiddenReviewUpdateError,
  ForbiddenReviewCommentUpdateError,
  ForbiddenReviewReactionUpdateError,
  ReviewCommentReactionNotFoundError,
  ForbiddenReviewCommentReactionUpdateError,
} = require('../../db-handlers/review/errors');
const schema = require('../schema');
const reviewServiceHandler = require('../../service-handlers/review');
const reviewDbHandler = require('../../db-handlers/review');
const reviewCommentDbHandler = require('../../db-handlers/review-comment');
const reviewReactionDbHandler = require('../../db-handlers/review-reaction');
const reviewCommentReactionDbHandler = require('../../db-handlers/review-comment-reaction');

const reviewsRouter = () => {
  const router = express();
  
  router.post(
    '/v1/reviews',
    authorize,
    requestValidator('body', schema.reviewCreateBody),
    async (req, res, next) => {
      try {
        const { user, body } = req;
        const review = await reviewServiceHandler.create(user, body);
        return res.json(review);
      } catch (error) {
        return next(error);
      }
    },
  );

  router.put(
    '/v1/reviews/:id',
    authorize,
    requestValidator('params', schema.reviewUpdateParams),
    requestValidator('body', schema.reviewUpdateBody),
    async (req, res, next) => {
      try {
        const reviewId = parseInt(req.params.id, 10);
        await reviewDbHandler.update(reviewId, req.user.id, req.body);
        return res.sendStatus(200);
      } catch (error) {
        if (error instanceof ReviewNotFoundError) {
          return next(new ResponseError(404, error.message));
        }
        if (error instanceof ForbiddenReviewUpdateError) {
          return next(new ResponseError(403, error.message));
        }
        return next(error);
      }
    },
  );

  router.get(
    '/v1/reviews/:id',
    authorize,
    requestValidator('params', schema.reviewGetByIdParams),
    async (req, res, next) => {
      try {
        const { user, params: { id } } = req;
        const reviewId = parseInt(id, 10);
        const review = await reviewServiceHandler.getById(reviewId, user);
        return res.json(review);
      } catch (error) {
        if (error instanceof ReviewNotFoundError) {
          return next(new ResponseError(404, error.message));
        }
        return next(error);
      }
    },
  );

  router.get(
    '/v1/reviews',
    authorize,
    async (req, res, next) => {
      try {
        const reviews = await reviewDbHandler.getAll(req.params.id);
        return res.json(reviews);
      } catch (error) {
        return next(error);
      }
    },
  );

  router.delete(
    '/v1/reviews/:id',
    authorize,
    requestValidator('params', schema.reviewDeleteParams),
    async (req, res, next) => {
      try {
        const reviewId = parseInt(req.params.id, 10);
        await reviewDbHandler.deactivate(reviewId, req.user.id);
        return res.sendStatus(200);
      } catch (error) {
        if (error instanceof ReviewNotFoundError) {
          return next(new ResponseError(404, error.message));
        }
        if (error instanceof ForbiddenReviewUpdateError) {
          return next(new ResponseError(403, error.message));
        }
        return next(error);
      }
    },
  );

  router.post(
    '/v1/reviews/:reviewId/comment',
    authorize,
    requestValidator('body', schema.commentCreateBody),
    requestValidator('params', schema.commentCreateParams),
    async (req, res, next) => {
      try {
        const { user, body, params: { reviewId }, } = req;
        const comment = await reviewCommentDbHandler.create(
          parseInt(reviewId, 10),
          user.id,
          body,
        );
        return res.json(comment);
      } catch (error) {
        return next(error);
      }
    },
  );

  router.put(
    '/v1/reviews/:reviewId/comment/:commentId',
    authorize,
    requestValidator('body', schema.commentUpdateBody),
    requestValidator('params', schema.commentUpdateParams),
    async (req, res, next) => {
      try {
        const { user, body, params: { reviewId, commentId } } = req;
        await reviewCommentDbHandler.update(
          parseInt(commentId, 10),
          parseInt(reviewId, 10),
          user.id,
          body,
        );
        return res.sendStatus(200);
      } catch (error) {
        if (error instanceof ForbiddenReviewCommentUpdateError) {
          return next(new ResponseError(403, error.message));
        }
        return next(error);
      }
    },
  );

  router.delete(
    '/v1/reviews/:reviewId/comment/:commentId',
    authorize,
    requestValidator('params', schema.commentDeleteParams),
    async (req, res, next) => {
      try {
        const { user, params: { reviewId, commentId } } = req;
        await reviewCommentDbHandler.deactivate(
          parseInt(commentId, 10),
          parseInt(reviewId, 10),
          user.id,
        );
        return res.sendStatus(200);
      } catch (error) {
        if (error instanceof ForbiddenReviewCommentUpdateError) {
          return next(new ResponseError(403, error.message));
        }
        return next(error);
      }
    },
  );

  router.post(
    '/v1/reviews/:reviewId/reaction',
    authorize,
    requestValidator('body', schema.reviewReactionCreateBody),
    requestValidator('params', schema.reviewReactionCreateParams),
    async (req, res, next) => {
      try {
        const { user, body, params: { reviewId } } = req;
        const reviewReaction = await reviewReactionDbHandler.create(
          parseInt(reviewId, 10),
          user.id,
          body,
        );
        return res.json(reviewReaction);
      } catch (error) {
        return next(error);
      }
    },
  );

  router.delete(
    '/v1/reviews/:reviewId/reaction/:reactionId',
    authorize,
    requestValidator('params', schema.reviewReactionDeleteParams),
    async (req, res, next) => {
      try {
        const { user, params: { reviewId, reactionId } } = req;
        await reviewReactionDbHandler.remove(
          parseInt(reactionId, 10),
          parseInt(reviewId, 10),
          user.id,
        );
        return res.sendStatus(200);
      } catch (error) {
        if (error instanceof ForbiddenReviewReactionUpdateError) {
          return next(new ResponseError(403, error.message));
        }
        return next(error);
      }
    },
  );

  router.post(
    '/v1/reviews/:reviewId/comment/:commentId/reaction',
    authorize,
    requestValidator('body', schema.commentReactionCreateBody),
    requestValidator('params', schema.commentReactionCreateParams),
    async (req, res, next) => {
      try {
        const { user, body, params: { commentId } } = req;
        const reaction = await reviewCommentReactionDbHandler.create(
          parseInt(commentId, 10),
          user.id,
          body,
        );
        return res.json(reaction);
      } catch (error) {
        return next(error);
      }
    },
  );

  router.delete(
    '/v1/reviews/:reviewId/comment/:commentId/reaction/:reactionId',
    authorize,
    requestValidator('params', schema.commentReactionDeleteParams),
    async (req, res, next) => {
      try {
        const { user, params: { commentId, reactionId } } = req;
        await reviewCommentReactionDbHandler.remove(
          parseInt(reactionId, 10),
          parseInt(commentId, 10),
          user.id,
        );
        return res.sendStatus(200);
      } catch (error) {
        if (error instanceof ForbiddenReviewCommentReactionUpdateError) {
          return next(new ResponseError(403, error.message));
        }
        if (error instanceof ReviewCommentReactionNotFoundError) {
          return next(new ResponseError(404, error.message));
        }
        return next(error);
      }
    },
  );

  router.use(errorHandler);

  return router;
};

module.exports = reviewsRouter;
