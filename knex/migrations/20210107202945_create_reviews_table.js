exports.up = async (knex) => {
  await knex.schema.createTable('reviews', (table) => {
    table.increments('id');
    table.timestamps();
    table.integer('user_id').unsigned().notNullable().references('id')
      .inTable('users');
    table.string('item').notNullable();
    table.string('brand');
    table.string('description').notNullable();
    table.string('tags');
    table.float('rating').notNullable();
    table.dateTime('deactivated_at');
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable('reviews');
};
