exports.up = async (knex) => {
  await knex.schema.createTable('review_comments', (table) => {
    table.increments('id');
    table.timestamps();
    table.integer('review_id').unsigned().notNullable().references('id')
      .inTable('reviews');
    table.integer('user_id').unsigned().notNullable().references('id')
      .inTable('users');
    table.integer('parent_id').unsigned().references('id')
      .inTable('review_comments');
    table.string('text');
    table.dateTime('deactivated_at');
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable('review_comments');
};
