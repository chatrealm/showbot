/* eslint-env browser */
import Vue from 'vue'
import VueSyncersFeathers from 'vue-syncers-feathers'

if (process.env.NODE_ENV !== 'production') {
	Vue.config.debug = true
}

import feathers from './feathers'

// For ease of use
Vue.prototype.$feathers = feathers
Vue.prototype.$service = function (name) {
	return feathers.service(name)
}

Vue.use(VueSyncersFeathers, {
	driverOptions: {
		feathers: feathers
	}
})

// Set up instance
import App from './App.vue'

const app = new Vue({
	el: 'body',
	components: {
		App
	}
})

document.body.removeChild(document.getElementById('loading'))

if (process.env.NODE_ENV !== 'production') {
	global.app = app.$children[0]
}
