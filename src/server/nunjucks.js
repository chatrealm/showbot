import fs from 'fs'
import path from 'path'

import config from 'config'
import makeDebug from 'debug'
import nunjucks from 'nunjucks'

const debug = makeDebug('nunjucks')

const manifestLocation = path.join(__dirname, '../public/manifest.json')

export default function () {
	const app = this

	const dev = config.has('dev') && config.get('dev')

	const env = nunjucks.configure(path.join(__dirname, '../views'), {
		watch: dev,
		express: app
	})

	env.addGlobal('dev', dev)

	env.addFilter('json', (obj) => {
		return JSON.stringify(obj)
	})

	// Pretty dump
	env.addFilter('dump', (obj) => {
		return JSON.stringify(obj, null, '  ')
	})

	// Production asset build handler
	fs.exists(manifestLocation, (exists) => {
		let filter

		if (exists) {
			debug('assets: production')

			let mapping

			try {
				mapping = fs.readFileSync(manifestLocation, {
					encoding: 'utf8'
				})
				mapping = JSON.parse(mapping)
			} catch (e) { }

			if (!mapping) {
				mapping = {}
			}

			filter = location => {
				location = mapping[location] ? mapping[location] : location
				return location.indexOf('/') === 0 ? location : '/' + location
			}
		} else {
			debug('assets: dev')

			filter = location => {
				return location.indexOf('/') === 0 ? location : '/' + location
			}
		}

		env.addFilter('asset', filter)
	})
}
