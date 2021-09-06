exports.up = async (knex) => {
  await knex.schema.createTable('users', (table) => {
    table.increments('id');
    table.timestamps();
    table.string('email').notNullable().unique();
    table.dateTime('deactivated_at');
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable('users');
};
