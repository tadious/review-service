const knex = require('knex');
const sinon = require('sinon');

const db = require('../src/lib/db');
const app = require('../app');
const config = require('./config');
const models = require('../src/db-handlers/models');
const SmsPortalClient = require('../src/service-clients/SmsPortalClient');
const WebToken = require('../src/lib/web-token');
const SirvClient = require('../src/service-clients/SirvClient');

const knexInstance = knex(config.knex);

before(async () => {
  // Init models.
  db.init(knexInstance, models);

  // Create the test database;
  db.testUtils.create();

  // Migrate the test database
  await knexInstance.migrate.latest(config.knex.migrations);

  await SmsPortalClient.init(config.smsPortal);
  await WebToken.init(config.webToken);
  await SirvClient.init(config.sirv);

  app.init();
});

beforeEach(() => {
  sinon.useFakeTimers({
    now: new Date('2020-01-30T11:26:55Z'),
    toFake: ['Date'],
  });
});

afterEach(async () => {
  await db.testUtils.truncate();
  sinon.restore();
});

after(async () => {
  knexInstance.destroy();
});
