export default {
	data() {
		return {
			connection: {
				connected: false,
				reason: 'Connecting...'
			}
		}
	},
	ready() {
		// hook into feathers client
		const socket = this.$feathers.io

		socket.on('connect', () => {
			this.connection.connected = true
			this.connection.reason = ''
		})

		socket.on('connect_error', reason => {
			this.connection.connected = false
			this.connection.reason = `Couldn't connect (${reason})`
		})

		socket.on('connect_timeout', time => {
			const formattedTime = Math.round(time / 1000)

			this.connection.connected = false
			this.connection.reason = `Connection timed out (${formattedTime}s)`
		})

		socket.on('reconnecting', attempt => {
			this.connection.connected = false
			this.connection.reason = `Reconnecting... (attempt ${attempt})`
		})

		socket.on('reconnect_failed', () => {
			this.connection.connected = false
			this.connection.reason = `Connection failed, try again later`
		})
	}
}
