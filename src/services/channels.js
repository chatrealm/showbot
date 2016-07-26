import _ from 'lodash'
import memory from 'feathers-memory'

import config from '../config'
import {disable} from '../hooks'

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
		create: [disable()],
		update: [disable()],
		patch: [disable()],
		remove: [disable()]
	})

	channelsService.after({
	})

	channelsService.filter(data => {
		return _.pick(data, ['id', 'server_id', 'channel'])
	})
}
