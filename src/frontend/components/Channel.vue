<template>
	<section class="section">
		<div class="fixed-header">
			<div class="container">
				<div class="columns is-gapless is-block-mobile">
					<div class="column is-half fixed-header-actions">
						<div class="field has-addons">
							<p class="control">
								<span class="select">
									<select v-model="mode">
										<option value="voting">Voting Mode</option>
										<option value="copying">Copying Mode</option>
									</select>
								</span>
							</p>
							<p class="control">
								<a class="button"
									:class="{'is-primary': uppercase}"
									@click="toggleUppercase">
									<span class="icon">
										<i class="material-icons">format_size</i>
									</span>
									<span>Caps</span>
								</a>
							</p>
						</div>
						<div class="field has-addons">
							<p class="control">
								<a class="button"
									:class="{'is-primary': settings.animations}"
									@click="setSetting('animations', !settings.animations)">
									<span class="icon">
										<i class="material-icons">swap_vert</i>
									</span>
									<span>Animations</span>
								</a>
							</p>
							<p class="control">
								<a class="button"
									title="Stops titles from re-ordering while hovering over the list"
									:class="{'is-primary': settings.freezeOnHover}"
									@click="setSetting('freezeOnHover', !settings.freezeOnHover)">
									<span class="icon">
										<i class="material-icons">{{ freezeOrder ? 'pause_circle_filled' : 'pause_circle_outline' }}</i>
									</span>
									<span>
										Freeze while reading
									</span>
								</a>
							</p>
						</div>
					</div>
					<div class="column is-half fixed-header-info">
						<transition name="hinge-from-top" mode="out-in">
							<error
								class="fast"
								v-if="error"
								:error="error"
								@click="clearError">
							</error>
						</transition>
					</div>
				</div>
			</div>
		</div>
		<div style="height: 84px;"><!-- Spacing for header --></div>
		<div class="container" v-if="$loading">
			<div class="notification">
				<h2>Loading...</h2>
			</div>
		</div>
		<div class="container" v-if="!$loading">
			<table class="table"
				@mouseover="mouseEntersList"
				@mouseout="mouseLeavesList"
				@touchstart="mouseEntersList"
				@touchend="mouseLeavesList(e, 10)">
				<thead>
					<tr>
						<th class="is-narrow">Votes</th>
						<th>Suggestion</th>
						<th>By</th>
					</tr>
				</thead>
				<tfoot>
					<tr>
						<th>Votes</th>
						<th>Suggestion</th>
						<th>By</th>
					</tr>
				</tfoot>
				<tbody v-if="orderedSuggestions.length === 0">
					<tr>
						<td class="is-empty" colspan="3">This list is empty</td>
					</tr>
				</tbody>
				<transition-group
					v-if="orderedSuggestions.length > 0"
					name="fade"
					tag="tbody"
					:move-class="settings.animations ? 'list-move' : 'list-disabled-move'">
					<tr is="suggestion"
						v-for="suggestion in orderedSuggestions"
						:key="suggestion.id"
						:can-vote="canVote"
						:suggestion="suggestion"
						:uppercase="uppercase"
						@error="onError"
						@clear-error="clearError">
					</tr>
				</transition-group>
			</table>
		</div>
	</section>
</template>

<script>
	import findIndex from 'lodash/findIndex'
	import orderBy from 'lodash/orderBy'

	import Error from './Error.vue'
	import Suggestion from './Suggestion.vue'

	let touchCount = 1

	export default {
		components: {
			Error,
			Suggestion
		},
		computed: {
			canVote() {
				return this.mode === 'voting'
			},
			orderedSuggestions() {
				this.cachedOrder = orderBy(this.suggestions, [
					item => {
						if (this.freezeOrder && this.settings.freezeOnHover) {
							var foundIndex = findIndex(this.cachedOrder, ['id', item.id])
							return foundIndex > -1 ? foundIndex : Object.keys(this.suggestions).length
						}
						return 0
					},
					'votes', 'created_at'], ['asc', 'desc', 'asc'])
				return this.cachedOrder
			}
		},
		data() {
			return {
				channel_id: 1,
				error: null,
				freezeOrder: false,
				mode: 'voting',
				showTransition: null,
				uppercase: false
			}
		},
		events: {
			'syncer-error'(path, error) {
				this.error = error
			}
		},
		methods: {
			clearError() {
				this.error = null
			},
			mouseEntersList() {
				if (this.settings.freezeOnHover) {
					this.freezeOrder = true
				}
			},
			mouseLeavesList(e, delay) {
				if (delay) {
					const id = ++touchCount
					setTimeout(() => {
						if (id === touchCount) {
							this.freezeOrder = false
						}
					}, delay * 1000)
					return
				}
				this.freezeOrder = false
			},
			onError(error) {
				this.error = error
				setTimeout(() => {
					if(this.error === error) {
						this.error = null
					}
				}, 5000)
			},
			setSetting(setting, value) {
				this.$emit('change-setting', setting, value)
			},
			toggleUppercase() {
				this.uppercase = !this.uppercase
			}
		},
		props: {
			settings: Object
		},
		sync: {
			suggestions: {
				service: 'api/suggestions',
				query() {
					return {
						channel_id: this.channel_id
					}
				}
			}
		},
		watch: {
			'$loading'(newValue) {
				this.$nextTick(() => {
					this.showTransition = !newValue ? 'fade' : null
				})
			}
		}
	}
</script>
