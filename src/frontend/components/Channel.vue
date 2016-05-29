<template>
	<section class="section">
		<div class="container" v-if="$loadingSyncers">
			<div class="notification">
				<h2>Loading...</h2>
			</div>
		</div>
		<div class="container" v-if="!$loadingSyncers">
			<div class="columns">
				<div class="column is-half">
					<p class="control has-addons">
						<span class="select">
							<select v-model="mode">
								<option value="voting">Voting Mode</option>
								<option value="copying">Copying Mode</option>
							</select>
						</span>
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
				<div class="column is-half">
					<error
						v-if="error"
						transition="hinge-from-top"
						:error="error"
						@click="clearError">
					</error>
				</div>
			</div>
			<table class="table">
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
				<tbody>
					<tr v-if="orderedSuggestions.length === 0">
						<td class="is-empty" colspan="3">This list is empty</td>
					</tr>
					<tr is="suggestion"
						v-for="suggestion in orderedSuggestions"
						track-by="id"
						:transition="showTransition"
						:can-vote="canVote"
						:suggestion="suggestion"
						:uppercase="uppercase"
						@error="onError"
						@clear-error="clearError">
					</tr>
				</tbody>
			</table>
		</div>
	</section>
</template>

<script>
	import orderBy from 'lodash/orderBy'

	import Error from './Error.vue'
	import Suggestion from './Suggestion.vue'

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
				return orderBy(this.suggestions, ['votes', 'created_at'], ['desc', 'asc'])
			}
		},
		data() {
			return {
				channel_id: 1,
				error: null,
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
			onError(error) {
				this.error = error
				setTimeout(() => {
					if(this.error === error) {
						this.error = null
					}
				}, 5000)
			},
			toggleUppercase() {
				this.uppercase = !this.uppercase
			}
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
			'$loadingSyncers'(newValue) {
				this.$nextTick(() => {
					this.showTransition = !newValue ? 'fade' : null
				})
			}
		}
	}
</script>