const supertest = require('supertest');
const chai = require('chai');
const db = require('../../../../src/lib/db');

const { clone } = require('../../../util');
const app = require('../../../../app');
const fixtures = require('../../../fixtures');

const { expect } = chai;

describe('API', () => {
  describe('_ping', () => {
    it('responds 200', () => supertest(app.instance())
      .get('/_ping')
      .expect(200));
  });

  /*describe('POST - /api/v1/users', () => {
    it('Should create user, responds with 200 and the user', () => supertest(app.instance())
      .post('/api/v1/users')
      .send(fixtures.api.rest.postUserCreate.request)
      .expect(200)
      .then(async (response) => {
        expect(response.body).deep.equal(fixtures.api.rest.postUserCreate.response);
        const dbUsers = await db.model('User').fetchAll();
        const dbUserRoles = await db.model('UserRole').fetchAll();
        expect(clone(dbUsers)).deep.equal([fixtures.dbHandlers.models.user]);
        expect(clone(dbUserRoles)).deep.equal([fixtures.dbHandlers.models.userRole]);
      }));

    it('Should respond with 409 if email already exists', async () => {
      await db.model('User').forge(fixtures.dbHandlers.models.user)
        .save(null, { method: 'insert' });

      const response = await supertest(app.instance())
        .post('/api/v1/users')
        .send(fixtures.api.rest.postUserCreate.request)
        .expect(409);

      expect(response.body.message).equal('Email foo.bar@advisa.se already exists');
    });

    it('Should return 400 if missing required params', async () => {
      const request = clone(fixtures.api.rest.postUserCreate.request);
      delete request.roles;
      await supertest(app.instance())
        .post('/api/v1/users')
        .send(request)
        .expect(400)
        .then(({ body }) => {
          expect(body.name).equal('ValidationError');
        });
    });
  });

  describe('/api/v1/users/:id', () => {
    beforeEach(async () => {
      await db.model('User').forge(fixtures.dbHandlers.models.user)
        .save(null, { method: 'insert' });
      await db.model('UserRole').forge(fixtures.dbHandlers.models.userRole)
        .save(null, { method: 'insert' });
    });

    describe('GET', () => {
      it('Should get user by id and responds with 200', () => supertest(app.instance())
        .get('/api/v1/users/1')
        .expect(200)
        .then((response) => {
          expect(response.body).deep.equal(fixtures.api.rest.getUser.response);
        }));

      it('Should respond with 404 when user does not exist', () => supertest(app.instance())
        .get('/api/v1/users/2')
        .expect(404)
        .then((response) => {
          expect(response.body.message).equal('No user found with id 2');
        }));
    });

    describe('DELETE', () => {
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
