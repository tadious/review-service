module.exports = {
  knex: {
    client: 'mysql',
    migrations: {
      directory: `${__dirname}../../../knex/migrations`,
    },
    connection: {
      database: 'hotonot_test',
      host: 'localhost',
      password: 'password123',
      port: 3306,
      user: 'root',
    },
  },
  webServer: {
    port: 1337,
  },
  smsPortal: {
    url: 'http://smsportal.test',
    authToken: 'authToken',
  },
  webToken: {
    secret: 'superdupersecret',
    expiresIn: 900,
  },
  sirv: {
    hostname: 'test.api.sirv.com',
    clientId: 'clientId',
    secret: 'topqualitysecret',
  },
};
