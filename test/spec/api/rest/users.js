const supertest = require('supertest');
const chai = require('chai');
const sinon = require('sinon');

const db = require('../../../../src/lib/db');
const app = require('../../../../app');
const ravenService = require('../../../../src/lib/raven');
const helpers = require('../../../../src/lib/helpers');
const WebToken = require('../../../../src/lib/web-token');
const SirvClient = require('../../../../src/service-clients/SirvClient');

const fixtures = require('../../../fixtures/');
const { clone } = require('../../../util');

const { expect } = chai;

describe('Users', () => {
  describe('POST - /api/v1/users/register', () => {
    it('Should create new user and responds 200 with user details', () => supertest(app.instance())
      .post('/api/v1/users/register')
      .send(fixtures.api.rest.postUserRegister.request)
      .expect(200)
      .then(async (response) => {
        const dbUsers = await db.model('User').fetchAll();
        const dbUserRoles = await db.model('UserRole').fetchAll();
        const dbUserAuth = await db.model('UserAuth').fetchAll();
        const password = dbUserAuth.models[0].get('password');
        const dbUserRefreshTokens = await db.model('UserRefreshToken').fetchAll();
        const refreshToken = dbUserRefreshTokens.models[0].get('token');

        const userAuthFixtureCopy = clone(fixtures.dbHandlers.models.userAuth);
        userAuthFixtureCopy.password = password;
        const userRefreshTokenFixtureCopy = clone(fixtures.dbHandlers.models.userRefreshToken);
        userRefreshTokenFixtureCopy.token = refreshToken;
        expect(clone(dbUsers)).deep.equal([fixtures.dbHandlers.models.user]);
        expect(clone(dbUserRoles)).deep.equal([fixtures.dbHandlers.models.userRole]);
        expect(clone(dbUserAuth)).deep.equal([userAuthFixtureCopy]);
        expect(clone(dbUserRefreshTokens)).deep.equal([userRefreshTokenFixtureCopy]);

        const responseFixtureCopy = clone(fixtures.api.rest.postUserRegister.response);
        responseFixtureCopy.refreshToken = refreshToken; 
        expect(response.body)
          .deep
          .equal(responseFixtureCopy, 'Responds with correct details');
      }));
  });

  describe('POST - /api/v1/users/auth', () => {
    beforeEach(async () => {
      await db.model('User').forge(fixtures.dbHandlers.models.user)
        .save(null, { method: 'insert' });
      await db.model('UserRole').forge(fixtures.dbHandlers.models.userRole)
        .save(null, { method: 'insert' });
      await db.model('UserAuth').forge(fixtures.dbHandlers.models.userAuth)
        .save(null, { method: 'insert' });
      await db.model('UserRefreshToken').forge(fixtures.dbHandlers.models.userRefreshToken)
        .save(null, { method: 'insert' });
    });

    it('Should authenticate user and return user details', () => supertest(app.instance())
      .post('/api/v1/users/auth')
      .send(fixtures.api.rest.postUserAuth.request)
      .expect(200)
      .then(async (response) => {
        const { refreshToken } = fixtures.api.rest.postUserAuth.response;
        const expectedResponse = clone(response.body);
        expectedResponse.refreshToken = refreshToken;
        expect(expectedResponse)
          .deep
          .equal(fixtures.api.rest.postUserAuth.response, 'Responds with correct details');
      }));
  });

  describe('PUT - /api/v1/users/profile', () => {
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
        .resolves('https://picsum.photos/300/300');
    });

    it('Should create user profile for logged in user', async () => {
      const user = {
        id: 1,
        roles: ['USER'],
      };
      const { authToken } = WebToken.instance().generateAccessToken(user);
      await supertest(app.instance())
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(fixtures.api.rest.putUserProfile.request)
        .expect(200);
        
      const dbUserProfiles = await db.model('UserProfile').fetchAll();
      expect(clone(dbUserProfiles)).deep.equal([fixtures.dbHandlers.models.userProfile]);
      expect(sirvClientUploadFileStub.callCount).equal(1, 'Calls uploadFile to upload avatar');
    });

    it('Should update user profile without over writing fields', async () => {
      await db.model('UserProfile').forge(fixtures.dbHandlers.models.userProfile)
        .save(null, { method: 'insert' });
      const user = {
        id: 1,
        roles: ['USER'],
      };
      const { authToken } = WebToken.instance().generateAccessToken(user);
      const requestCopy = clone(fixtures.api.rest.putUserProfile.request);
      delete requestCopy.avatar;
      delete requestCopy.birthday;
      delete requestCopy.username;
      await supertest(app.instance())
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(requestCopy)
        .expect(200);
        
      const dbUserProfiles = await db.model('UserProfile').fetchAll();
      expect(clone(dbUserProfiles)).deep.equal([fixtures.dbHandlers.models.userProfile]);
      expect(sirvClientUploadFileStub.callCount).equal(0, 'No files have been uploaded');
    });
  });

  describe('POST - /api/v1/users/refresh-token', () => {
    beforeEach(async () => {
      await db.model('User').forge(fixtures.dbHandlers.models.user)
        .save(null, { method: 'insert' });
      await db.model('UserAuth').forge(fixtures.dbHandlers.models.userAuth)
        .save(null, { method: 'insert' });
      await db.model('UserRefreshToken').forge(fixtures.dbHandlers.models.userRefreshToken)
        .save(null, { method: 'insert' });
    });

    it('Should reset refreshToken cookie then responds with 200, JWT token', async () => {
      const refreshTokenClone = clone(fixtures.dbHandlers.models.userRefreshToken);
      await supertest(app.instance())
        .post('/api/v1/users/refresh-token')
        .set('cookie', `refreshToken=${refreshTokenClone.token};`)
        .send()
        .expect(200);
        
      const dbUsers = await db.model('User').fetchAll();
      const dbUserAuth = await db.model('UserAuth').fetchAll();

      expect(clone(dbUsers)).deep.equal([fixtures.dbHandlers.models.user]);
      expect(clone(dbUserAuth)).deep.equal([fixtures.dbHandlers.models.userAuth]);  
    });
  });

  describe('POST - /api/v1/users/revoke-token', () => {
    beforeEach(async () => {
      await db.model('User').forge(fixtures.dbHandlers.models.user)
        .save(null, { method: 'insert' });
      await db.model('UserAuth').forge(fixtures.dbHandlers.models.userAuth)
        .save(null, { method: 'insert' });
      await db.model('UserRefreshToken').forge(fixtures.dbHandlers.models.userRefreshToken)
        .save(null, { method: 'insert' });
    });

    it('Should revoke the given token', async () => {
      const refreshTokenClone = clone(fixtures.dbHandlers.models.userRefreshToken);
      const { id } = fixtures.dbHandlers.models.user;
      const user = { id, roles: ['USER'] };
      const { authToken } = WebToken.instance().generateAccessToken(user);
      await supertest(app.instance())
        .post('/api/v1/users/revoke-token')
        .set('Authorization', `Bearer ${authToken}`)
        .set('cookie', `refreshToken=${refreshTokenClone.token};`)
        .send()
        .expect(200);
        
      const dbUserRefreshTokens = await db.model('UserRefreshToken').fetchAll();
      expect(clone(dbUserRefreshTokens)[0].revoked_at).not.equal(null);  
    });
  });

  describe('GET /api/v1/users/authorized', () => {
    beforeEach(async () => {
      await db.model('User').forge(fixtures.dbHandlers.models.user)
        .save(null, { method: 'insert' });
      await db.model('UserRole').forge(fixtures.dbHandlers.models.userRole)
        .save(null, { method: 'insert' });
      await db.model('UserProfile').forge(fixtures.dbHandlers.models.userProfile)
        .save(null, { method: 'insert' });
    });

    it('Should get authorized user and responds with 200', async () => {
      const { id } = fixtures.dbHandlers.models.user;
      const user = { id, roles: ['USER'] };
      const { authToken } = WebToken.instance().generateAccessToken(user);
      const response = await supertest(app.instance())
        .get('/api/v1/users/authorized')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
        
      expect(response.body).deep.equal(fixtures.api.rest.getUser.response);
    });

    it('Should respond with 401 when user is not authorized', () => supertest(app.instance())
      .get('/api/v1/users/authorized')
      .expect(401)
      .then((response) => {
        expect(response.body.message).equal('Unauthorized');
      }));
  });

    /* describe('DELETE', () => {
      it('Should delete a user and respond with 200', async () => {
        await supertest(app.instance())
          .delete('/api/v1/users/1')
          .expect(200);

        const dbUsers = await db.model('User').fetchAll();
        expect(clone(dbUsers)).deep.equal([{
          ...fixtures.dbHandlers.models.user,
          deactivated_at: '2018-01-30T11:26:55.000Z',
        }]);
      });

      it('Should respond with 404 when user does not exist', () => supertest(app.instance())
        .delete('/api/v1/users/2')
        .expect(404)
        .then((response) => {
          expect(response.body.message).equal('No user found with id 2');
        }));
    });

    describe('PUT', () => {
      it('Should update user and roles and respond with 200', async () => {
        await db.model('User')
          .forge({ id: fixtures.dbHandlers.models.user.id })
          .save({ email: 'some@email.com' });
        await db.model('UserRole')
          .forge({ id: fixtures.dbHandlers.models.userRole.id })
          .save({ role: 'advisor' });

        await supertest(app.instance())
          .put('/api/v1/users/1')
          .send(fixtures.api.rest.putUser.request).expect(200);

        const dbUsers = await db.model('User').fetchAll();
        const dbUserRoles = await db.model('UserRole').fetchAll();

        expect(clone(dbUsers)).deep.equal([fixtures.dbHandlers.models.user]);
        expect(clone(dbUserRoles)).deep.equal([{
          ...fixtures.dbHandlers.models.userRole,
          id: 2,
        }]);
      });

      it('Should remove roles when sending no roles and respond with 200', async () => {
        await supertest(app.instance())
          .put('/api/v1/users/1')
          .send({ ...fixtures.api.rest.putUser.request, roles: [] })
          .expect(200);

        const dbUsers = await db.model('User')
          .fetchAll({ withRelated: 'roles' });
        const user = clone(dbUsers)[0];
        expect(user.id).equal(fixtures.dbHandlers.models.user.id);
        expect(user.email).equal(fixtures.api.rest.putUser.request.userData.email);
        expect(user.roles).deep.equal([]);
      });

      it('Should respond with 409 when email already exists', async () => {
        const email = 'random@email.com';
        await db.model('User').forge(fixtures.dbHandlers.models.user)
          .save({ id: 2, email }, { method: 'insert' });
        const response = await supertest(app.instance())
          .put('/api/v1/users/1')
          .send({
            ...fixtures.api.rest.putUser.request,
            userData: {
              email,
            },
          })
          .expect(409);
        expect(response.body.message).equal(`Email ${email} already exists`);
      });

      it('Should respond with 404 when user does not exist', () => supertest(app.instance())
        .put('/api/v1/users/2')
        .send(fixtures.api.rest.putUser.request)
        .expect(404)
        .then((response) => {
          expect(response.body.message).equal('No user found with id 2');
        }));

      it('Should respond with 404 for a deactivated user', async () => {
        await db.model('User').forge({ id: fixtures.dbHandlers.models.user.id })
          .save({ deactivated_at: new Date() });

        const response = await supertest(app.instance())
          .put('/api/v1/users/1')
          .send(fixtures.api.rest.putUser.request)
          .expect(404);

        expect(response.body.message).equal('No user found with id 1');
      });
    });
  });

  describe('GET - /api/v1/users/by-email', () => {
    beforeEach(async () => {
      await db.model('User').forge(fixtures.dbHandlers.models.user)
        .save(null, { method: 'insert' });
      await db.model('UserRole').forge(fixtures.dbHandlers.models.userRole)
        .save(null, { method: 'insert' });
    });

    it('Should get user by email and respond with 200', async () => {
      const response = await supertest(app.instance())
        .get('/api/v1/users/by-email')
        .query(fixtures.api.rest.getUserByEmail.request.query)
        .expect(200);
      expect(response.body).deep.equal(fixtures.api.rest.getUserByEmail.response);
    });

    it('Should respond with 404 when user does not exist', () => supertest(app.instance())
      .get('/api/v1/users/by-email')
      .query({ ...fixtures.api.rest.getUserByEmail.request.query, email: 'unknown@example.com' })
      .expect(404)
      .then((response) => {
        expect(response.body.message).equal('No user found with email unknown@example.com');
      }));
  });

  describe('GET - /api/v1/users', () => {
    it('Should fetch all users and respond with 200', async () => {
      await db.model('User').forge(fixtures.dbHandlers.models.user)
        .save(null, { method: 'insert' });
      await db.model('UserRole').forge(fixtures.dbHandlers.models.userRole)
        .save(null, { method: 'insert' });

      const response = await supertest(app.instance())
        .get('/api/v1/users')
        .expect(200);
      expect(response.body).deep.equal(fixtures.api.rest.getUsers.response);
    });

    it('Should respond with 200 and empty user list', () => supertest(app.instance())
      .get('/api/v1/users')
      .expect(200)
      .then((response) => {
        expect(response.body).deep.equal([]);
      }));
  });*/
});
