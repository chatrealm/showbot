import path from 'path'

import errors from 'feathers-errors/handler'
import feathers from 'feathers'
import ipwareMaker from 'ipware'

const {get_ip} = ipwareMaker() // eslint-disable-line camelcase

export function before() {
	const app = this

	app.use(feathers.static(path.resolve(__dirname, '../public')))
	app.use((req, res, next) => {
		req.feathers.userIP = get_ip(req).clientIp
		next()
	})
}

export function after() {
	const app = this

	app.use(historyAPIFallback.bind(app))
	app.use(errors({
		html: errorRenderer
	}))
}

// Fallback to help with history api on the frontend
// based on https://github.com/cbas/express-history-api-fallback but with views
function historyAPIFallback(req, res, next) {
	if (req.method === 'GET' && req.accepts('html')) {
		res.render('index.html')
	} else {
		next()
	}
}

// Error renderer for html responses
function errorRenderer(error, req, res) {
	res.render('errors/default.html', {
		error
	})
}
