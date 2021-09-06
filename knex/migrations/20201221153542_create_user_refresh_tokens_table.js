exports.up = async (knex) => {
  await knex.schema.createTable('user_refresh_tokens', (table) => {
    table.increments('id');
    table.timestamps();
    table.integer('user_id').unsigned().notNullable().references('id')
      .inTable('users');
    table.string('token').notNullable();
    table.dateTime('expires_at').notNullable();
    table.string('ip').notNullable();
    table.dateTime('revoked_at');
    table.string('revoked_by_ip');
    table.string('replaced_by_token');
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable('user_refresh_tokens');
};
