const getReview = require('./get-review');
const getReviews = require('./get-reviews');
const postReview = require('./post-review');
const putReview = require('./put-review');
const postComment = require('./post-comment');
const putComment = require('./put-comment');
const postUserAuth = require('./post-user-auth');
const postUserRegister = require('./post-user-register');
const putUser = require('./put-user');
const putUserProfile = require('./put-user-profile');
const getUser = require('./get-user');
const getUserByEmail = require('./get-user-by-email');
const getUsers = require('./get-users');
const postReviewReaction = require('./post-review-reaction');
const postCommentReaction = require('./post-comment-reaction');

module.exports = {
  getReview,
  getReviews,
  postReview,
  putReview,
  postComment,
  putComment,
  postCommentReaction,
  postReviewReaction,
  postUserAuth,
  postUserRegister,
  putUser,
  putUserProfile,
  getUser,
  getUserByEmail,
  getUsers,
};
