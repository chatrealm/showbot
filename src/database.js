import _ from 'lodash'
import knex from 'knex'
import parseConnectionString from 'knex/lib/util/parse-connection'

import config from './config'

export default function getDatabase() {
	const connectionOptions = config.get('database.options')

	if (config.has('database.url') && config.get('database.url')) {
		_.assign(connectionOptions, parseConnectionString(config.get('database.url')))
	}

	if (_.isEqual(connectionOptions, {})) {
		throw new Error("Looks like you haven't configured a database. Make sure to do it in local.json for your production settings") // eslint-disable-line quotes
	}

	return knex(connectionOptions)
}
