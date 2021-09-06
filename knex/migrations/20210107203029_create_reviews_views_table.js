exports.up = async (knex) => {
  await knex.schema.createTable('review_views', (table) => {
    table.increments('id');
    table.timestamps();
    table.integer('review_id').unsigned().notNullable().references('id')
      .inTable('reviews');
    table.integer('user_id').unsigned().notNullable().references('id')
      .inTable('users');
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable('review_views');
};
