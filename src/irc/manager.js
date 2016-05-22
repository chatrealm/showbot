import _ from 'lodash'

import Connection from './connection'

export default class Manager {
	constructor(app) {
		this.app = app
		this.connections = {}
	}

	async boot() {
		const servers = await this.loadServers()

		_.map(servers, server => {
			this.startConnection(server)
		})
	}

	async loadServers() {
		return this.app.service('api/servers').find()
	}

	startConnection(connectionInfo) {
		this.connections[connectionInfo.id] = new Connection(this, connectionInfo)
	}
}
