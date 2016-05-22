import channelsService from '../services/channels'
import serversService from '../services/servers'
import suggestionsService from '../services/suggestions'
import votesService from '../services/votes'

export default function () {
	const app = this

	app.configure(channelsService)
	app.configure(serversService)
	app.configure(suggestionsService)
	app.configure(votesService)
}

