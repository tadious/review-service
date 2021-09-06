exports.up = async (knex) => {
  await knex.schema.createTable('review_comment_reactions', (table) => {
    table.increments('id');
    table.timestamps();
    table.integer('review_comment_id').unsigned().notNullable().references('id')
      .inTable('review_comments');
    table.integer('user_id').unsigned().notNullable().references('id')
      .inTable('users');
    table.string('type');
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable('review_comment_reactions');
};
