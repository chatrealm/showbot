import feathers from 'feathers/client'
import feathersHooks from 'feathers-hooks'
import feathersSocketIO from 'feathers-socketio/client'
import io from 'socket.io-client'

const socket = io(undefined, {
	timeout: 5000
})

const client = feathers()

client.configure(feathersSocketIO(socket))
client.configure(feathersHooks())

export default client
