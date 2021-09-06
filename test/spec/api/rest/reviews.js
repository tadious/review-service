const supertest = require('supertest');
const chai = require('chai');
const sinon = require('sinon');

const db = require('../../../../src/lib/db');
const app = require('../../../../app');
const WebToken = require('../../../../src/lib/web-token');
const SirvClient = require('../../../../src/service-clients/SirvClient');

const fixtures = require('../../../fixtures/');
const { clone } = require('../../../util');

const { expect } = chai;

describe('Reviews', () => {
  describe('POST - /api/v1/reviews', () => {
    let sirvClientUploadFileStub;
    beforeEach(async () => {
      await db.model('User').forge(fixtures.dbHandlers.models.user)
        .save(null, { method: 'insert' });
      await db.model('UserRole').forge(fixtures.dbHandlers.models.userRole)
        .save(null, { method: 'insert' });
      await db.model('UserAuth').forge(fixtures.dbHandlers.models.userAuth)
        .save(null, { method: 'insert' });
      await db.model('UserRefreshToken').forge(fixtures.dbHandlers.models.userRefreshToken)
        .save(null, { method: 'insert' });

      sirvClientUploadFileStub = sinon
        .stub(SirvClient.instance(), 'uploadFile')
        .resolves('http://cdn.test.images.net/1-supermanshotdog.jpg');
    });

    it('Should create a review and upload image', async () => {
      const user = {
        id: 1,
        roles: ['USER'],
      };
      const { authToken } = WebToken.instance().generateAccessToken(user);
      const response = await supertest(app.instance())
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send(fixtures.api.rest.postReview.request)
        .expect(200);
        
      const dbReviews = await db.model('Review').fetchAll();
      const dbReviewMedia = await db.model('ReviewMedia').fetchAll();
      expect(clone(dbReviews)).deep.equal([fixtures.dbHandlers.models.review]);
      expect(clone(dbReviewMedia)).deep.equal([fixtures.dbHandlers.models.reviewMedia]);

      expect(sirvClientUploadFileStub.callCount).equal(1, 'Calls uploadFile to upload avatar');

      expect(response.body).deep.equal(fixtures.api.rest.postReview.response);
    });
  });

  describe('PUT - /api/v1/reviews/:id', () => {
    beforeEach(async () => {
      await db.model('User').forge(fixtures.dbHandlers.models.user)
        .save(null, { method: 'insert' });
      await db.model('UserRole').forge(fixtures.dbHandlers.models.userRole)
        .save(null, { method: 'insert' });
      await db.model('UserAuth').forge(fixtures.dbHandlers.models.userAuth)
        .save(null, { method: 'insert' });
      await db.model('UserRefreshToken').forge(fixtures.dbHandlers.models.userRefreshToken)
        .save(null, { method: 'insert' });
      await db.model('Review').forge(fixtures.dbHandlers.models.review)
        .save(null, { method: 'insert' });
      await db.model('ReviewMedia').forge(fixtures.dbHandlers.models.reviewMedia)
        .save(null, { method: 'insert' });
    });

    it('Should update review without over writing fields', async () => {
      const user = {
        id: 1,
        roles: ['USER'],
      };
      const { authToken } = WebToken.instance().generateAccessToken(user);
      await supertest(app.instance())
        .put('/api/v1/reviews/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(fixtures.api.rest.putReview.request)
        .expect(200);
        
      const { tags, rating } = fixtures.api.rest.putReview.request;
      const expectedUpdatedReview = {
        ...fixtures.dbHandlers.models.review,
        tags,
        rating,
      };
      const dbReviews = await db.model('Review').fetchAll();
      expect(clone(dbReviews)).deep.equal([expectedUpdatedReview]);
    });

    it('Should return 403 when trying to update a review by another user', async () => {
      await db.model('User').forge({ ...fixtures.dbHandlers.models.user, id: 2, email: 'foo.bar@hotonot.co.za' })
        .save(null, { method: 'insert' });
      await db.model('UserRole').forge({ ...fixtures.dbHandlers.models.userRole, id: 2, user_id: 2 })
        .save(null, { method: 'insert' });
      const user = {
        id: 2,
        roles: ['USER'],
      };
      const { authToken } = WebToken.instance().generateAccessToken(user);
      const response = await supertest(app.instance())
        .put('/api/v1/reviews/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(fixtures.api.rest.putReview.request)
        .expect(403);
        
      expect(response.body.message).equal('User forbidden to update review');
    });
  });

  describe('GET - /api/v1/reviews/:id', () => {
    beforeEach(async () => {
      await db.model('User').forge(fixtures.dbHandlers.models.user)
        .save(null, { method: 'insert' });
      await db.model('UserRole').forge(fixtures.dbHandlers.models.userRole)
        .save(null, { method: 'insert' });
      await db.model('UserAuth').forge(fixtures.dbHandlers.models.userAuth)
        .save(null, { method: 'insert' });
      await db.model('UserRefreshToken').forge(fixtures.dbHandlers.models.userRefreshToken)
        .save(null, { method: 'insert' });
      await db.model('Review').forge(fixtures.dbHandlers.models.review)
        .save(null, { method: 'insert' });
      await db.model('ReviewMedia').forge(fixtures.dbHandlers.models.reviewMedia)
        .save(null, { method: 'insert' });
    });

    it('Should return review by id and relations', async () => {
      const user = {
        id: 1,
        roles: ['USER'],
      };
      const { authToken } = WebToken.instance().generateAccessToken(user);
      const response = await supertest(app.instance())
        .get('/api/v1/reviews/1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      const expectedResponse = clone(fixtures.api.rest.getReview.response);
      expectedResponse.views = [];
      expect(response.body).deep.equal(expectedResponse);
    });

    it('Should create a view when another user fetches review', async () => {
      await db.model('User').forge({ ...fixtures.dbHandlers.models.user, id: 2, email: 'foo.bar@hotonot.co.za' })
        .save(null, { method: 'insert' });
      await db.model('UserRole').forge({ ...fixtures.dbHandlers.models.userRole, id: 2, user_id: 2 })
        .save(null, { method: 'insert' });
      const user = {
        id: 2,
        roles: ['USER'],
      };
      const { authToken } = WebToken.instance().generateAccessToken(user);
      const response = await supertest(app.instance())
        .get('/api/v1/reviews/1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      expect(response.body).deep.equal(fixtures.api.rest.getReview.response);
    });

    it('Should not create a view when viewing user is ADMIN', async () => {
      await db.model('User').forge({ ...fixtures.dbHandlers.models.user, id: 2, email: 'foo.bar@hotonot.co.za' })
        .save(null, { method: 'insert' });
      await db.model('UserRole').forge({ ...fixtures.dbHandlers.models.userRole, id: 2, user_id: 2, role: 'admin' })
        .save(null, { method: 'insert' });
      const user = {
        id: 2,
        roles: ['ADMIN'],
      };
      const { authToken } = WebToken.instance().generateAccessToken(user);
      const response = await supertest(app.instance())
        .get('/api/v1/reviews/1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const expectedResponse = clone(fixtures.api.rest.getReview.response);
      expectedResponse.views = [];
      expect(response.body).deep.equal(expectedResponse);
    });

    it('Should return 404 when review is not found', async () => {
      const user = {
        id: 1,
        roles: ['USER'],
      };
      const { authToken } = WebToken.instance().generateAccessToken(user);
      await supertest(app.instance())
        .get('/api/v1/reviews/12')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('GET - /api/v1/reviews', () => {
    beforeEach(async () => {
      await db.model('User').forge(fixtures.dbHandlers.models.user)
        .save(null, { method: 'insert' });
      await db.model('UserRole').forge(fixtures.dbHandlers.models.userRole)
        .save(null, { method: 'insert' });
      await db.model('UserAuth').forge(fixtures.dbHandlers.models.userAuth)
        .save(null, { method: 'insert' });
      await db.model('UserRefreshToken').forge(fixtures.dbHandlers.models.userRefreshToken)
        .save(null, { method: 'insert' });
      await db.model('Review').forge(fixtures.dbHandlers.models.review)
        .save(null, { method: 'insert' });
      await db.model('ReviewMedia').forge(fixtures.dbHandlers.models.reviewMedia)
        .save(null, { method: 'insert' });
    });

    it('Should return all reviews and relations', async () => {
      const user = {
        id: 1,
        roles: ['USER'],
      };
      const { authToken } = WebToken.instance().generateAccessToken(user);
      const response = await supertest(app.instance())
        .get('/api/v1/reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
        
      expect(response.body).deep.equal(fixtures.api.rest.getReviews.response);
    });
  });

  describe('DELETE - /api/v1/reviews/:id', () => {
    beforeEach(async () => {
      await db.model('User').forge(fixtures.dbHandlers.models.user)
        .save(null, { method: 'insert' });
      await db.model('UserRole').forge(fixtures.dbHandlers.models.userRole)
        .save(null, { method: 'insert' });
      await db.model('UserAuth').forge(fixtures.dbHandlers.models.userAuth)
        .save(null, { method: 'insert' });
      await db.model('UserRefreshToken').forge(fixtures.dbHandlers.models.userRefreshToken)
        .save(null, { method: 'insert' });
      await db.model('Review').forge(fixtures.dbHandlers.models.review)
        .save(null, { method: 'insert' });
      await db.model('ReviewMedia').forge(fixtures.dbHandlers.models.reviewMedia)
        .save(null, { method: 'insert' });
    });

    it('Should deactivate review', async () => {
      const user = {
        id: 1,
        roles: ['USER'],
      };
      const { authToken } = WebToken.instance().generateAccessToken(user);
      await supertest(app.instance())
        .delete('/api/v1/reviews/1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
        
      const { tags, rating } = fixtures.api.rest.putReview.request;
      const expectedDeactivatedReview = {
        ...fixtures.dbHandlers.models.review,
        deactivated_at: '2020-01-30T11:26:55.000Z',
      };
      const dbReviews = await db.model('Review').fetchAll();
      expect(clone(dbReviews)).deep.equal([expectedDeactivatedReview]);
    });

    it('Should return 403 when trying to delete a review by another user', async () => {
      await db.model('User').forge({ ...fixtures.dbHandlers.models.user, id: 2, email: 'foo.bar@hotonot.co.za' })
        .save(null, { method: 'insert' });
      await db.model('UserRole').forge({ ...fixtures.dbHandlers.models.userRole, id: 2, user_id: 2 })
        .save(null, { method: 'insert' });
      const user = {
        id: 2,
        roles: ['USER'],
      };
      const { authToken } = WebToken.instance().generateAccessToken(user);
      const response = await supertest(app.instance())
        .delete('/api/v1/reviews/1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
        
      expect(response.body.message).equal('User forbidden to deactivate review');
    });
  });

  describe('POST - /api/v1/reviews/:reviewId/comment', () => {
    beforeEach(async () => {
      await db.model('User').forge(fixtures.dbHandlers.models.user)
        .save(null, { method: 'insert' });
      await db.model('UserRole').forge(fixtures.dbHandlers.models.userRole)
        .save(null, { method: 'insert' });
      await db.model('UserAuth').forge(fixtures.dbHandlers.models.userAuth)
        .save(null, { method: 'insert' });
      await db.model('UserRefreshToken').forge(fixtures.dbHandlers.models.userRefreshToken)
        .save(null, { method: 'insert' });
      await db.model('Review').forge(fixtures.dbHandlers.models.review)
        .save(null, { method: 'insert' });
      await db.model('ReviewMedia').forge(fixtures.dbHandlers.models.reviewMedia)
        .save(null, { method: 'insert' });
      await db.model('User').forge({ ...fixtures.dbHandlers.models.user, id: 2, email: 'foo.bar@hotonot.co.za' })
        .save(null, { method: 'insert' });
      await db.model('UserRole').forge({ ...fixtures.dbHandlers.models.userRole, id: 2, user_id: 2 })
        .save(null, { method: 'insert' });
    });

    it('Should create a comment and return it', async () => {
      const user = {
        id: 2,
        roles: ['USER'],
      };
      const { authToken } = WebToken.instance().generateAccessToken(user);
      const response = await supertest(app.instance())
        .post('/api/v1/reviews/1/comment')
        .set('Authorization', `Bearer ${authToken}`)
        .send(fixtures.api.rest.postComment.request)
        .expect(200);

      const dbReviewComments = await db.model('ReviewComment').fetchAll();
      expect(clone(dbReviewComments)).deep.equal([fixtures.dbHandlers.models.reviewComment]);
      
      expect(response.body).deep.equal(fixtures.api.rest.postComment.response);
    });
  });

  describe('PUT - /api/v1/reviews/:reviewId/comment/:commentId', () => {
    beforeEach(async () => {
      await db.model('User').forge(fixtures.dbHandlers.models.user)
        .save(null, { method: 'insert' });
      await db.model('UserRole').forge(fixtures.dbHandlers.models.userRole)
        .save(null, { method: 'insert' });
      await db.model('UserAuth').forge(fixtures.dbHandlers.models.userAuth)
        .save(null, { method: 'insert' });
      await db.model('UserRefreshToken').forge(fixtures.dbHandlers.models.userRefreshToken)
        .save(null, { method: 'insert' });
      await db.model('Review').forge(fixtures.dbHandlers.models.review)
        .save(null, { method: 'insert' });
      await db.model('ReviewMedia').forge(fixtures.dbHandlers.models.reviewMedia)
        .save(null, { method: 'insert' });
      await db.model('User').forge({ ...fixtures.dbHandlers.models.user, id: 2, email: 'foo.bar@hotonot.co.za' })
        .save(null, { method: 'insert' });
      await db.model('UserRole').forge({ ...fixtures.dbHandlers.models.userRole, id: 2, user_id: 2 })
        .save(null, { method: 'insert' });
      await db.model('ReviewComment').forge(fixtures.dbHandlers.models.reviewComment)
        .save(null, { method: 'insert' });
    });

    it('Should update a comment', async () => {
      const user = {
        id: 2,
        roles: ['USER'],
      };
      const { authToken } = WebToken.instance().generateAccessToken(user);
      await supertest(app.instance())
        .put('/api/v1/reviews/1/comment/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(fixtures.api.rest.putComment.request)
        .expect(200);

      const { text } = fixtures.api.rest.putComment.request;
      const expectedUpdatedComment = {
        ...fixtures.dbHandlers.models.reviewComment,
        text,
      };
      const dbReviewComments = await db.model('ReviewComment').fetchAll();
      expect(clone(dbReviewComments)).deep.equal([expectedUpdatedComment]);
    });

    it('Should return 403 when user is not autorized to update comment', async () => {
      const user = {
        id: 1,
        roles: ['USER'],
      };
      const { authToken } = WebToken.instance().generateAccessToken(user);
      const response = await supertest(app.instance())
        .put('/api/v1/reviews/1/comment/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(fixtures.api.rest.putComment.request)
        .expect(403);
      expect(response.body.message).equal('User forbidden to update comment');
    });
  });

  describe('DELETE - /api/v1/reviews/:reviewId/comment/:commentId', () => {
    beforeEach(async () => {
      await db.model('User').forge(fixtures.dbHandlers.models.user)
        .save(null, { method: 'insert' });
      await db.model('UserRole').forge(fixtures.dbHandlers.models.userRole)
        .save(null, { method: 'insert' });
      await db.model('UserAuth').forge(fixtures.dbHandlers.models.userAuth)
        .save(null, { method: 'insert' });
      await db.model('UserRefreshToken').forge(fixtures.dbHandlers.models.userRefreshToken)
        .save(null, { method: 'insert' });
      await db.model('Review').forge(fixtures.dbHandlers.models.review)
        .save(null, { method: 'insert' });
      await db.model('ReviewMedia').forge(fixtures.dbHandlers.models.reviewMedia)
        .save(null, { method: 'insert' });
      await db.model('User').forge({ ...fixtures.dbHandlers.models.user, id: 2, email: 'foo.bar@hotonot.co.za' })
        .save(null, { method: 'insert' });
      await db.model('UserRole').forge({ ...fixtures.dbHandlers.models.userRole, id: 2, user_id: 2 })
        .save(null, { method: 'insert' });
      await db.model('ReviewComment').forge(fixtures.dbHandlers.models.reviewComment)
        .save(null, { method: 'insert' });
    });

    it('Should deactivate a comment', async () => {
      const user = {
        id: 2,
        roles: ['USER'],
      };
      const { authToken } = WebToken.instance().generateAccessToken(user);
      await supertest(app.instance())
        .delete('/api/v1/reviews/1/comment/1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const { text } = fixtures.api.rest.putComment.request;
      const expectedUpdatedComment = {
        ...fixtures.dbHandlers.models.reviewComment,
        deactivated_at: '2020-01-30T11:26:55.000Z',
      };
      const dbReviewComments = await db.model('ReviewComment').fetchAll();
      expect(clone(dbReviewComments)).deep.equal([expectedUpdatedComment]);
    });

    it('Should return 403 when user is not autorized to deactivate comment', async () => {
      const user = {
        id: 1,
        roles: ['USER'],
      };
      const { authToken } = WebToken.instance().generateAccessToken(user);
      const response = await supertest(app.instance())
        .delete('/api/v1/reviews/1/comment/1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
      expect(response.body.message).equal('User forbidden to deactivate comment');
    });
  });

  describe('POST - /api/v1/reviews/:reviewId/reaction', () => {
    beforeEach(async () => {
      await db.model('User').forge(fixtures.dbHandlers.models.user)
        .save(null, { method: 'insert' });
      await db.model('UserRole').forge(fixtures.dbHandlers.models.userRole)
        .save(null, { method: 'insert' });
      await db.model('UserAuth').forge(fixtures.dbHandlers.models.userAuth)
        .save(null, { method: 'insert' });
      await db.model('UserRefreshToken').forge(fixtures.dbHandlers.models.userRefreshToken)
        .save(null, { method: 'insert' });
      await db.model('Review').forge(fixtures.dbHandlers.models.review)
        .save(null, { method: 'insert' });
      await db.model('ReviewMedia').forge(fixtures.dbHandlers.models.reviewMedia)
        .save(null, { method: 'insert' });
      await db.model('User').forge({ ...fixtures.dbHandlers.models.user, id: 2, email: 'foo.bar@hotonot.co.za' })
        .save(null, { method: 'insert' });
      await db.model('UserRole').forge({ ...fixtures.dbHandlers.models.userRole, id: 2, user_id: 2 })
        .save(null, { method: 'insert' });
    });

    it('Should create a reaction and return it', async () => {
      const user = {
        id: 2,
        roles: ['USER'],
      };
      const { authToken } = WebToken.instance().generateAccessToken(user);
      const response = await supertest(app.instance())
        .post('/api/v1/reviews/1/reaction')
        .set('Authorization', `Bearer ${authToken}`)
        .send(fixtures.api.rest.postReviewReaction.request)
        .expect(200);
      const dbReviewReactions = await db.model('ReviewReaction').fetchAll();
      expect(clone(dbReviewReactions)).deep.equal([fixtures.dbHandlers.models.reviewReaction]);
      
      expect(response.body).deep.equal(fixtures.api.rest.postReviewReaction.response);
    });
  });

  describe('DELETE - /api/v1/reviews/:reviewId/reaction/:reactionId', () => {
    beforeEach(async () => {
      await db.model('User').forge(fixtures.dbHandlers.models.user)
        .save(null, { method: 'insert' });
      await db.model('UserRole').forge(fixtures.dbHandlers.models.userRole)
        .save(null, { method: 'insert' });
      await db.model('UserAuth').forge(fixtures.dbHandlers.models.userAuth)
        .save(null, { method: 'insert' });
      await db.model('UserRefreshToken').forge(fixtures.dbHandlers.models.userRefreshToken)
        .save(null, { method: 'insert' });
      await db.model('Review').forge(fixtures.dbHandlers.models.review)
        .save(null, { method: 'insert' });
      await db.model('ReviewMedia').forge(fixtures.dbHandlers.models.reviewMedia)
        .save(null, { method: 'insert' });
      await db.model('User').forge({ ...fixtures.dbHandlers.models.user, id: 2, email: 'foo.bar@hotonot.co.za' })
        .save(null, { method: 'insert' });
      await db.model('UserRole').forge({ ...fixtures.dbHandlers.models.userRole, id: 2, user_id: 2 })
        .save(null, { method: 'insert' });
      await db.model('ReviewReaction').forge(fixtures.dbHandlers.models.reviewReaction)
        .save(null, { method: 'insert' });
    });

    it('Should remove a reaction', async () => {
      const user = {
        id: 2,
        roles: ['USER'],
      };
      const { authToken } = WebToken.instance().generateAccessToken(user);
      await supertest(app.instance())
        .delete('/api/v1/reviews/1/reaction/1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      const dbReviewReactions = await db.model('ReviewReaction').fetchAll();
      expect(clone(dbReviewReactions)).deep.equal([]);
    });

    it('Should return 403 if user is not authorized', async () => {
      const user = {
        id: 1,
        roles: ['USER'],
      };
      const { authToken } = WebToken.instance().generateAccessToken(user);
      const response = await supertest(app.instance())
        .delete('/api/v1/reviews/1/reaction/1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
      expect(response.body.message).equal('User forbidden from removing reaction');
    });
  });

  describe('POST - /api/v1/reviews/:reviewId/comment/:commentId/reaction', () => {
    beforeEach(async () => {
      await db.model('User').forge(fixtures.dbHandlers.models.user)
        .save(null, { method: 'insert' });
      await db.model('UserRole').forge(fixtures.dbHandlers.models.userRole)
        .save(null, { method: 'insert' });
      await db.model('UserAuth').forge(fixtures.dbHandlers.models.userAuth)
        .save(null, { method: 'insert' });
      await db.model('UserRefreshToken').forge(fixtures.dbHandlers.models.userRefreshToken)
        .save(null, { method: 'insert' });
      await db.model('Review').forge(fixtures.dbHandlers.models.review)
        .save(null, { method: 'insert' });
      await db.model('ReviewMedia').forge(fixtures.dbHandlers.models.reviewMedia)
        .save(null, { method: 'insert' });
      await db.model('User').forge({ ...fixtures.dbHandlers.models.user, id: 2, email: 'foo.bar@hotonot.co.za' })
        .save(null, { method: 'insert' });
      await db.model('UserRole').forge({ ...fixtures.dbHandlers.models.userRole, id: 2, user_id: 2 })
        .save(null, { method: 'insert' });
      await db.model('ReviewComment').forge(fixtures.dbHandlers.models.reviewComment)
        .save(null, { method: 'insert' });
    });

    it('Should create a comment reaction and return it', async () => {
      const user = {
        id: 2,
        roles: ['USER'],
      };
      const { authToken } = WebToken.instance().generateAccessToken(user);
      const response = await supertest(app.instance())
        .post('/api/v1/reviews/1/comment/1/reaction')
        .set('Authorization', `Bearer ${authToken}`)
        .send(fixtures.api.rest.postCommentReaction.request)
        .expect(200);
      const dbReviewCommentReactions = await db.model('ReviewCommentReaction').fetchAll();
      expect(clone(dbReviewCommentReactions)).deep.equal([fixtures.dbHandlers.models.reviewCommentReaction]);
      
      expect(response.body).deep.equal(fixtures.api.rest.postCommentReaction.response);
    });
  });

  describe('DELETE - /api/v1/reviews/:reviewId/comment/:commentId/reaction/:reactionId', () => {
    beforeEach(async () => {
      await db.model('User').forge(fixtures.dbHandlers.models.user)
        .save(null, { method: 'insert' });
      await db.model('UserRole').forge(fixtures.dbHandlers.models.userRole)
        .save(null, { method: 'insert' });
      await db.model('UserAuth').forge(fixtures.dbHandlers.models.userAuth)
        .save(null, { method: 'insert' });
      await db.model('UserRefreshToken').forge(fixtures.dbHandlers.models.userRefreshToken)
        .save(null, { method: 'insert' });
      await db.model('Review').forge(fixtures.dbHandlers.models.review)
        .save(null, { method: 'insert' });
      await db.model('ReviewMedia').forge(fixtures.dbHandlers.models.reviewMedia)
        .save(null, { method: 'insert' });
      await db.model('User').forge({ ...fixtures.dbHandlers.models.user, id: 2, email: 'foo.bar@hotonot.co.za' })
        .save(null, { method: 'insert' });
      await db.model('UserRole').forge({ ...fixtures.dbHandlers.models.userRole, id: 2, user_id: 2 })
        .save(null, { method: 'insert' });
      await db.model('ReviewComment').forge(fixtures.dbHandlers.models.reviewComment)
        .save(null, { method: 'insert' });
      await db.model('ReviewCommentReaction').forge(fixtures.dbHandlers.models.reviewCommentReaction)
        .save(null, { method: 'insert' });
    });

    it('Should remove a comment reaction', async () => {
      const user = {
        id: 2,
        roles: ['USER'],
      };
      const { authToken } = WebToken.instance().generateAccessToken(user);
      await supertest(app.instance())
        .delete('/api/v1/reviews/1/comment/1/reaction/1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      const dbReactions = await db.model('ReviewCommentReaction').fetchAll();
      expect(clone(dbReactions)).deep.equal([]);
    });

    it('Should return 403 if user is not authorized', async () => {
      const user = {
        id: 1,
        roles: ['USER'],
      };
      const { authToken } = WebToken.instance().generateAccessToken(user);
      const response = await supertest(app.instance())
        .delete('/api/v1/reviews/1/comment/1/reaction/1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
      expect(response.body.message).equal('User forbidden from removing reaction');
    });
  });
});
