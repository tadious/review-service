exports.up = async (knex) => {
  await knex.schema.createTable('user_profiles', (table) => {
    table.increments('id');
    table.timestamps();
    table.integer('user_id').unsigned().notNullable().references('id')
      .inTable('users');
    table.string('mobile_number');
    table.string('username');
    table.string('name');
    table.string('avatar');
    table.string('avatar_background');
    table.string('bio');
    table.dateTime('birthday');
    table.string('gender');
    table.string('interests');
    table.dateTime('email_verified_at');
    table.dateTime('mobile_number_verified_at');
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable('user_profiles');
};
