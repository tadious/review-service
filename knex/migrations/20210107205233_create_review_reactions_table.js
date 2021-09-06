exports.up = async (knex) => {
  await knex.schema.createTable('review_reactions', (table) => {
    table.increments('id');
    table.timestamps();
    table.integer('review_id').unsigned().notNullable().references('id')
      .inTable('reviews');
    table.integer('user_id').unsigned().notNullable().references('id')
      .inTable('users');
    table.string('type');
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable('review_reactions');
};
