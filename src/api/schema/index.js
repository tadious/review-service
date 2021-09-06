const commentCreateBody = require('./comment-create-body');
const commentCreateParams = require('./comment-create-params');
const commentUpdateBody = require('./comment-update-body');
const commentUpdateParams = require('./comment-update-params');
const commentDeleteParams = require('./comment-delete-params');
const commentReactionCreateBody = require('./comment-reaction-create-body');
const commentReactionCreateParams = require('./comment-reaction-create-params');
const commentReactionDeleteParams = require('./comment-reaction-delete-params');
const reviewReactionCreateBody = require('./review-reaction-create-body');
const reviewReactionCreateParams = require('./review-reaction-create-params');
const reviewReactionDeleteParams = require('./review-reaction-delete-params');
const reviewCreateBody = require('./review-create-body');
const reviewUpdateBody = require('./review-update-body');
const reviewUpdateParams = require('./review-update-params');
const reviewGetByIdParams = require('./review-get-by-id-params');
const reviewDeleteParams = require('./review-delete-params');

const userAuthBody = require('./user-auth-body');
const userMobilePhoneBody = require('./user-mobile-phone-body');
const userRegisterBody = require('./user-register-body');
const userUpdateProfileBody = require('./user-update-profile-body');

module.exports = {
  commentCreateBody,
  commentCreateParams,
  commentUpdateBody,
  commentUpdateParams,
  commentDeleteParams,
  commentReactionCreateBody,
  commentReactionCreateParams,
  commentReactionDeleteParams,
  reviewReactionCreateBody,
  reviewReactionCreateParams,
  reviewReactionDeleteParams,
  reviewCreateBody,
  reviewGetByIdParams,
  reviewDeleteParams,
  reviewUpdateBody,
  reviewUpdateParams,

  userAuthBody,
  userMobilePhoneBody,
  userRegisterBody,
  userUpdateProfileBody,
};
