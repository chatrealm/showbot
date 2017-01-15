import _ from 'lodash'
import memory from 'feathers-memory'
import {disallow, discard, iff, isProvider} from 'feathers-hooks-common'

import config from '../config'

export default function () {
	const app = this

	app.service('api/servers', memory({
		store: {
			1: {
				id: 1,
				slug: 'chatrealm',
				name: config.get('irc.server.name'),
				settings: {
					host: config.get('irc.server.host'),
					nick: config.get('irc.server.nick')
				}
			}
		}
	}))

	const serversService = app.service('api/servers')

	serversService.before({
		create: [disallow()],
		update: [disallow()],
		patch: [disallow()],
		remove: [disallow()]
	})

	serversService.after({
		all: [iff(isProvider('external'), discard('settings'))]
	})

	serversService.filter(data => {
		return _.pick(data, ['id', 'slug', 'name'])
	})
}
