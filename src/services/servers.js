import _ from 'lodash'
import memory from 'feathers-memory'

import config from '../config'
import {disable, remove} from '../hooks'

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
		create: [disable()],
		update: [disable()],
		patch: [disable()],
		remove: [disable()]
	})

	serversService.after({
		all: [remove('settings')]
	})

	serversService.filter(data => {
		return _.pick(data, ['id', 'slug', 'name'])
	})
}
