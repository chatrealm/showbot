export async function up(knex) {
	await knex.schema.createTable('votes', table => {
		table.increments('id')
		table.integer('suggestion_id')
		table.string('user_ip', 64)
	})
}

export async function down(knex) {
	await knex.schema.dropTable('votes')
}
