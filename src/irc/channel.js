import _ from 'lodash'
import makeDebug from 'debug'

const debug = makeDebug('irc:channel')

const adminModes = ['q', 'a', 'o', 'h']

function canAccess(userFlags, allowed) {
	return _.some(userFlags, _.partial(_.includes, allowed))
}

const handlers = {
	s: {
		async handle(nick, ...values) {
			const suggestion = values.join(' ')
			debug(`Suggestion from ${nick}: ${suggestion}`)

			try {
				await this.app.service('api/suggestions').create({
					channel_id: this.id, // eslint-disable-line camelcase
					suggestion,
					user: nick
				})
				this.client.notice(nick, 'Suggestion has been added')
			} catch (err) {
				this.client.notice(nick, err.message)
			}
		}
	},
	showbot: {
		async handle(nick, command, ...values) {
			debug(`Showbot command: ${command}`, values)
			switch (command) {
				case 'reset': {
					// Check for permission
					if (!canAccess(this.users[nick], adminModes)) {
						debug(`${nick} tried to run reset without permission`)
						break
					}
					await this.app.service('api/suggestions').remove(null, {
						query: {
							channel_id: this.id // eslint-disable-line camelcase
						}
					})
					this.client.say(this.channel, 'Suggestions list has been cleared.')
					break
				}
				case 'top': {
					if (!canAccess(this.users[nick], adminModes)) {
						debug(`${nick} tried to run top without permission`)
						break
					}
					const suggestions = await this.app.service('api/suggestions').find({
						query: {
							channel_id: this.id, // eslint-disable-line camelcase
							$limit: 5,
							$sort: {
								votes: -1
							}
						}
					})
					this.client.say(this.channel, `Current top ${suggestions.length} suggestions:`)
					suggestions.forEach(suggestion => {
						this.client.say(this.channel, `[${suggestion.votes}] ${suggestion.suggestion} (${suggestion.user})`)
					})
					break
				}
				case 'delete':
				case 'remove': {
					if (!canAccess(this.users[nick], adminModes)) {
						debug(`${nick} tried to run delete without permission`)
						break
					}
					const suggestion = values.join(' ')
					const removed = await this.app.service('api/suggestions').remove(null, {
						query: {
							channel_id: this.id, // eslint-disable-line camelcase
							suggestion
						}
					})
					if (removed.length > 0) {
						this.client.notice(nick, `Removed ${removed.length} suggestions`)
					} else {
						this.client.notice(nick, 'Found nothing to remove')
					}
					break
				}
				default: {
					// Command doesn't exist
					break
				}
			}
		}
	}
}

export default class Channel {
	constructor(connection, info) {
		this.connection = connection
		this.info = info
		this.users = {}
		this._unlisteners = []

		this.ignoring = false

		this.joinChannel()
	}

	get app() {
		return this.connection.app
	}

	get channel() {
		return this.info.channel
	}

	get client() {
		return this.connection.client
	}

	get id() {
		return this.info.id
	}

	joinChannel() {
		debug(`Joining server ${this.connection.id} channel ${this.channel}`)
		this.client.join(this.channel)
		this._bindUserEvents()
		this._bindMessages()
	}

	unbindEvents() {
		this._unlisteners.forEach(remover => {
			remover()
		})
	}

	_listenForClientEvent(event, callback) {
		this.client.on(event, callback)
		this._unlisteners.push(() => {
			this.client.removeListener(event, callback)
		})
	}

	_bindUserEvents() {
		// User list management
		this._listenForClientEvent('userlist', ({channel, users}) => {
			if (channel === this.channel) {
				this.users = _(users).keyBy('nick').mapValues('modes').value()
			}
		})
		this._listenForClientEvent('join', ({channel, nick}) => {
			if (channel === this.channel) {
				this.users[nick] = []
			}
		})
		this._listenForClientEvent('nick', ({nick, new_nick}) => { // eslint-disable-line camelcase
			if (nick in this.users) {
				this.users[new_nick] = this.users[nick] // eslint-disable-line camelcase
				delete this.users[nick]
			}
		})
		this._listenForClientEvent('part', ({channel, nick}) => {
			if (channel === this.channel && nick in this.users) {
				delete this.users[nick]
			}
		})
		this._listenForClientEvent('kick', ({channel, nick}) => {
			if (channel === this.channel && nick in this.users) {
				delete this.users[nick]
			}
		})
		this._listenForClientEvent('quit', ({nick}) => {
			if (nick in this.users) {
				delete this.users[nick]
			}
		})
		this._listenForClientEvent('mode', ({target, modes}) => {
			if (target === this.channel) {
				_.map(modes, ({mode, param}) => {
					const [add, letter] = mode.split('')
					// If is in prefix that adds/removes nick to list
					if (_.find(this.client.network.options.PREFIX, ['mode', letter])) {
						if (add === '+') {
							this.users[param].push(letter)
						} else {
							_.pull(this.users[param], letter)
						}
					}
				})
			}
		})
	}

	_bindMessages() {
		this._listenForClientEvent('message', ({target, nick, message, from_server}) => { // eslint-disable-line camelcase
			if (target === this.channel && !this.ignoring) {
				if (from_server) { // eslint-disable-line camelcase
					// handle +H
					if (message.startsWith('Replaying up to')) {
						this.ignoring = true
						setTimeout(() => {
							this.ignoring = false
						}, 200)
					}
					return
				}
				if (message.startsWith('!')) {
					const [command, ...args] = message.substr(1).split(' ')
					if (command in handlers) {
						this.handleCommand(nick, command, ...args)
					}
				}
			}
		})
	}

	handleCommand(nick, command, ...values) {
		const handler = handlers[command]
		if (handler) {
			handler.handle.call(this, nick, ...values).catch(err => {
				this.client.notice(nick, `Internal error: ${err.message}`)
			})
		}
	}
}
