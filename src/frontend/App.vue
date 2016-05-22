<template>
	<div class="wrapper">
		<nav class="nav has-shadow">
			<div class="nav-left">
				<span class="nav-item">Showbot</span>
			</div>
		</nav>
		<div class="notification"
			v-if="!connection.connected"
			:class="{'is-warning': !initialConnect}">
			<h2>Connecting with backend...</h2>
			<p v-text="connection.reason"></p>
		</div>
		<channel v-if="connection.connected"></channel>
		<footer class="footer">
			<div class="container">
				<div class="content has-text-centered">
					<p>Powered by node-showbot. Based on <a href="https://github.com/lkalif/ShowBot" target="_blank">showbot by lkalif</a>.</p>
				</div>
			</div>
		</footer>
	</div>
</template>

<script>
	import Channel from './components/Channel.vue'

	import connectionMixin from './mixins/connection'

	export default {
		mixins: [connectionMixin],
		components: {
			Channel
		},
		computed: {
			initialConnect() {
				return this.connection.reason === 'Connecting...'
			}
		}
	}
</script>