exports.up = async (knex) => {
  await knex.schema.createTable('user_social_media', (table) => {
    table.increments('id');
    table.timestamps();
    table.integer('user_id').unsigned().notNullable().references('id')
      .inTable('users');
    table.string('facebook_id');
    table.integer('facebook_followers').unsigned();
    table.dateTime('facebook_synced_at');
    table.string('twitter_id');
    table.integer('twitter_followers').unsigned();
    table.dateTime('twitter_synced_at');
    table.string('instagram_id');
    table.integer('instagram_followers').unsigned();
    table.dateTime('instagram_synced_at');
    table.string('google_id');
    table.integer('google_contacts').unsigned();
    table.dateTime('google_synced_at');
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable('user_social_media');
};
