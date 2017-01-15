require('babel-core/register') // eslint-disable-line import/no-unassigned-import

const _ = require('lodash')
const parseConnectionString = require('knex/lib/util/parse-connection')

const config = require('./src/config').default

const connectionOptions = config.get('database.options')

if (config.has('database.url') && config.get('database.url')) {
	_.assign(connectionOptions, parseConnectionString(config.get('database.url')))
}

module.exports = _.defaultsDeep(connectionOptions, {
	migrations: {
		directory: './database/migrations',
		stub: './src/stubs/migration.stub'
	},
	seeds: {
		directory: './database/seeds'
	}
})
