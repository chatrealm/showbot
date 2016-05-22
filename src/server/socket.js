import ipwareMaker from 'ipware'

const {get_ip} = ipwareMaker() // eslint-disable-line camelcase

export function configure(io) {
	io.on('connection', socket => {
		socket.feathers.userIP = get_ip(socket.request).clientIp
	})
}
