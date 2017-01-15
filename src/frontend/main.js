/* eslint-env browser */
import Vue from 'vue'
import VueSyncersFeathers from 'vue-syncers-feathers'
import feathers from './feathers'
import App from './App.vue'

Vue.use(VueSyncersFeathers, {
	aliases: true,
	feathers
})

// Set up instance
const app = new Vue({
	el: '#app',
	render: h => h(App)
})

document.body.removeChild(document.getElementById('loading'))

if (process.env.NODE_ENV !== 'production') {
	global.app = app.$children[0]
}
