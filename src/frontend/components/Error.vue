<template>
	<div class="notification is-danger">
		<h4 class="title is-5" v-if="message" v-text="message"></h4>
		<ul v-if="errorList && errorList.length">
			<li v-for="line in errorList" v-text="line"></li>
		</ul>
	</div>
</template>

<script>

	export default {
		computed: {
			errorList() {
				if (!this.isErrorObject) {
					return this.error
				} else if('error' in this.error) {
					return this.error.error
				}
				return []
			},
			isErrorObject() {
				return !('length' in this.error)
			},
			message() {
				if (this.isErrorObject && 'message' in this.error) {
					return this.error.message
				}
				return null
			}
		},
		props: {
			error: null
		}
	}
</script>