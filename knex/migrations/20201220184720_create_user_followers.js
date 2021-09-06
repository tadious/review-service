exports.up = async (knex) => {
  await knex.schema.createTable('user_followers', (table) => {
    table.increments('id');
    table.timestamps();
    table.integer('user_id').unsigned().notNullable().references('id')
      .inTable('users');
    table.integer('follower_user_id').unsigned().notNullable();
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable('user_followers');
};
