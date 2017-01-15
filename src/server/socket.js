import ipwareMaker from 'ipware'

const {get_ip} = ipwareMaker() // eslint-disable-line camelcase

export function configure(io) { // eslint-disable-line import/prefer-default-export
	io.on('connection', socket => {
		socket.feathers.userIP = get_ip(socket.request).clientIp
	})
}
