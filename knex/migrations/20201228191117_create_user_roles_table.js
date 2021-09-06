exports.up = async (knex) => {
  await knex.schema.createTable('user_roles', (table) => {
    table.increments('id');
    table.timestamps();
    table.integer('user_id').unsigned().notNullable().references('id')
      .inTable('users');
    table.string('role').notNullable();
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable('users');
  await knex.schema.dropTable('user_roles');
};
