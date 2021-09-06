exports.up = async (knex) => {
  await knex.schema.createTable('user_auth', (table) => {
    table.increments('id');
    table.timestamps();
    table.integer('user_id').unsigned().notNullable().references('id')
      .inTable('users');
    table.string('password').notNullable();
    table.dateTime('password_changed_at');
    table.string('ip');
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable('user_auth');
};
