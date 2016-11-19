import _ from 'lodash'
import IRC from 'irc-framework'
import makeDebug from 'debug'
import pkgInfo from '../../package.json'

import Channel from './channel'

const debug = makeDebug('irc:connection')

export default class Connection {
	constructor(manager, info) {
		this.manager = manager
		this.info = info
		this.channels = {}

		this.connect()
	}

	get app() {
		return this.manager.app
	}

	get id() {
		return this.info.id
	}

	connect() {
		const client = this.client = new IRC.Client()
		client.connect(_.defaults({
			username: this.info.settings.nick,
			gecos: this.info.settings.nick,
			version: `showbot-node ${pkgInfo.version} https://github.com/chatrealm/showbot`
		}, this.info.settings))

		client.on('registered', () => {
			debug('Connected with server', this.id)
			this.joinChannels().catch(console.error)
		})
		client.on('close', () => {
			_.forEach(this.channels, channel => {
				channel.unbindEvents()
			})
		})
	}

	async joinChannels() {
		const channels = await this.app.service('api/channels').find({
			query: {
				server_id: this.id // eslint-disable-line camelcase
			}
		})

		_.map(channels, info => {
			this.channels[info.id] = new Channel(this, info)
		})
	}
}
