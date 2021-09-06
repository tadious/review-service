module.exports = {
  development: {
    client: 'mysql',
    migrations: {
      directory: './knex/migrations',
    },
    connection: {
      database: 'hotonot',
      host: 'localhost',
      password: 'password123',
      port: 3306,
      user: 'hotonot_user',
    },
  },
};
