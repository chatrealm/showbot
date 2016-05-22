export async function up(knex) {
	await knex.schema.createTable('suggestions', table => {
		table.increments('id')
		table.integer('channel_id')
		table.string('suggestion', 255)
		table.string('hash', 48)
		table.string('user')
		table.integer('votes')
		table.timestamps()

		table.index('channel_id')
		table.index(['channel_id', 'hash'])
	})
}

export async function down(knex) {
	await knex.schema.dropTable('suggestions')
}
