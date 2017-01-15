import _ from 'lodash'
import memory from 'feathers-memory'
import {disallow} from 'feathers-hooks-common'

import config from '../config'

export default function () {
	const app = this

	app.service('api/channels', memory({
		store: {
			1: {
				id: 1,
				server_id: 1, // eslint-disable-line camelcase
				channel: config.get('irc.server.channel')
			}
		}
	}))

	const channelsService = app.service('api/channels')

	channelsService.before({
		create: [disallow()],
		update: [disallow()],
		patch: [disallow()],
		remove: [disallow()]
	})

	channelsService.after({
	})

	channelsService.filter(data => {
		return _.pick(data, ['id', 'server_id', 'channel'])
	})
}
