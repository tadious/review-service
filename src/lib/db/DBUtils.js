const childProcess = require('child_process');

module.exports = class TestUtils {
  constructor(knex) {
    this.knexInstance = knex;
  }

  create() {
    const { connection } = this.knexInstance.client.config;
    childProcess.execSync(`MYSQL_PWD='${connection.password}' mysql --host='${connection.host}' --user='${connection.user}' --port='${connection.port}' --execute='CREATE DATABASE IF NOT EXISTS ${connection.database}'`);
  }

  async truncate() {
    const { connection } = this.knexInstance.client.config;
    const ignoreTables = ['knex_migrations', 'knex_migrations_lock'];

    await this.knexInstance.transaction(async (trx) => {
      await trx.raw('SET FOREIGN_KEY_CHECKS=0');

      const rawStmts = await trx.raw(`
        SELECT
          CONCAT("TRUNCATE TABLE ", table_name) as query,
          table_name as name
        FROM information_schema.tables
        WHERE table_schema = ?
        AND table_type = 'BASE TABLE'
      `, [connection.database]);

      const truncateQueries = rawStmts[0]
        .filter(stmt => !ignoreTables.includes(stmt.name))
        .map(stmt => stmt.query);

      await Promise.all(truncateQueries.map(query => trx.raw(query)));

      await trx.raw('SET FOREIGN_KEY_CHECKS=1');
    });
  }
};
