<template>
	<div class="wrapper">
		<div class="notification"
			v-if="!connection.connected"
			:class="{'is-warning': !initialConnect}">
			<h2>Connecting with backend...</h2>
			<p v-text="connection.reason"></p>
		</div>
		<channel
			v-if="connection.connected"
			:settings="settings"
			@change-setting="changeSetting">
		</channel>
		<footer class="footer">
			<div class="container">
				<div class="content has-text-centered">
					<p>Powered by <a href="https://github.com/chatrealm/showbot" target="_blank">chatrealm/showbot</a>. Based on <a href="https://github.com/lkalif/ShowBot" target="_blank">showbot by lkalif</a>.</p>
				</div>
			</div>
		</footer>
	</div>
</template>

<script>
	import Channel from './components/Channel.vue'

	import connectionMixin from './mixins/connection'

	const defaultSettings = {
		animations: false,
		freezeOnHover: true
	}

	export default {
		mixins: [connectionMixin],
		components: {
			Channel
		},
		computed: {
			initialConnect() {
				return this.connection.reason === 'Connecting...'
			}
		},
		data() {
			let userSettings
			if (localStorage) {
				userSettings = JSON.parse(localStorage.getItem('showbot-settings'))
			}
			if (!userSettings) {
				userSettings = {}
			}

			const settings = Object.assign({}, defaultSettings, userSettings)

			return {
				settings
			}
		},
		methods: {
			changeSetting(setting, value) {
				this.settings[setting] = value
				if (localStorage) {
					localStorage.setItem('showbot-settings', JSON.stringify(this.settings))
				}
			}
		}
	}
</script>
