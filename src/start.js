#!/usr/bin/env node

// Ensure config is loaded first to make sure debug gets configured
import './config' // eslint-disable-line import/no-unassigned-import

import makeServer from './server'

makeServer().then(app => {
	app.start()

	global.app = app
}).catch(err => {
	console.error(err.stack)
	process.exit(1)
})
