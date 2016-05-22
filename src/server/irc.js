import IRCManager from '../irc/manager'

export default function () {
	const app = this

	app.irc = new IRCManager(app)
}
