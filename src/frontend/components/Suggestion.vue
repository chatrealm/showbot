<template>
	<tr :class="{'voteable': canVote}"
		@click="voteForThis">
		<th class="highlightable"
			:class="{'is-highlighted': isHighlighting}"
			v-text="suggestion.votes">
		</th>
		<td :class="{'is-uppercase': uppercase}"
			v-text="suggestion.suggestion">
		</td>
		<td v-text="suggestion.user"></td>
	</tr>
</template>

<script>

	export default {
		data() {
			return {
				isHighlighting: false
			}
		},
		methods: {
			voteForThis() {
				if(!this.canVote) {
					return
				}
				this.$emit('clear-error')
				return this.$service('api/votes').create({
					suggestion_id: this.suggestion.id
				}).catch(error => {
					this.$emit('error', error)
				})
			}
		},
		props: {
			canVote: Boolean,
			suggestion: Object,
			uppercase: Boolean
		},
		watch: {
			'suggestion.votes'(newVal, oldVal) {
				this.isHighlighting = true
				setTimeout(() => {
					if(this.suggestion.votes === newVal) {
						this.isHighlighting = false
					}
				}, 100)
			}
		}
	}
</script>