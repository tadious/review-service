const log = require('loglevel');
const knex = require('knex');

const app = require('./app');
const db = require('./src/lib/db');
const models = require('./src/db-handlers/models');
const SmsPortalClient = require('./src/service-clients/SmsPortalClient');
const WebToken = require('./src/lib/web-token');
const SirvClient = require('./src/service-clients/SirvClient');

log.setLevel('trace');

const startServer = (appInstance, config = {}) => new Promise((resolve, reject) => {
  const { port } = config;
  const server = appInstance.listen(port, (error) => {
    if (error) {
      log.error('Failed to start server', { error });
      reject(error);
    } else {
      log.info('Server started', { port });
      resolve(server);
    }
  });
  server.keepAliveTimeout = config.keepAliveTimeout || 61000;
  server.headersTimeout = config.headersTimeout || 62000;
});

const boot = async (config) => {
  try {
    const knexInstance = knex(config.knex);
    await knexInstance.migrate.latest(config.knex.migrations);
    await db.init(knexInstance, models);
    await SmsPortalClient.init(config.smsPortal);
    await WebToken.init(config.webToken);
    await SirvClient.init(config.sirv);

    app.init();
    await startServer(app.instance(), config.webServer);
  } catch (error) {
    log.error('Failed to boot', { error });
    throw Error('Failed to boot');
  }
};

module.exports = {
  boot,
};
