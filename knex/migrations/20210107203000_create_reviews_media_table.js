exports.up = async (knex) => {
  await knex.schema.createTable('review_media', (table) => {
    table.increments('id');
    table.timestamps();
    table.integer('review_id').unsigned().notNullable().references('id')
      .inTable('reviews');
    table.string('type');
    table.string('filename');
    table.integer('width').unsigned();
    table.integer('height').unsigned();
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable('review_media');
};
