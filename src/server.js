import bodyParser from 'body-parser'
import feathers from 'feathers'
import makeDebug from 'debug'
import rest from 'feathers-rest'
import socketio from 'feathers-socketio'
import hooks from 'feathers-hooks'

import {before as beforeMiddleware, after as afterMiddleware} from './server/middleware'
import config from './config'
import database from './database'
import ircSetup from './server/irc'
import nunjucks from './server/nunjucks'
import services from './server/services'
import {configure as socketioConfigure} from './server/socket'

const debug = makeDebug('app:server')

export default async function () {
	await ensureDatabase()

	const app = feathers()

	app.configure(nunjucks)

	app.use(bodyParser.json())
	app.use(bodyParser.urlencoded({
		extended: true
	}))

	app.configure(hooks())
	app.configure(rest())
	app.configure(socketio(socketioConfigure))

	app.configure(beforeMiddleware)

	app.configure(services)

	app.configure(afterMiddleware)

	app.configure(ircSetup)

	app.start = startServer

	return app
}

async function ensureDatabase() {
	if (await database.migrate.currentVersion() === 'none') {
		throw new Error('Database seems to be misconfigured')
	}
}

function startServer() {
	return new Promise(resolve => {
		const port = config.get('port')
		this.listen(port, () => {
			debug(`Listening on port ${port}`)
			resolve(this.irc.boot())
		})
	})
}

