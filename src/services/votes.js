import _ from 'lodash'
import errors from 'feathers-errors'
import service from 'feathers-knex'

import {disallow, discard, iff, isProvider} from 'feathers-hooks-common'

export default function () {
	const app = this

	app.service('api/votes', service({
		Model: app.db,
		name: 'votes'
	}))

	const votesService = app.service('api/votes')

	votesService.before({
		find: [disallow('external')],
		get: [disallow('external')],
		create: [makeSureUserHasntVoted()],
		update: [disallow('external')],
		patch: [disallow('external')],
		remove: [disallow('external')]
	})

	votesService.after({
		create: [updateSuggestionVoteCounts(), iff(isProvider('external'), discard('user_ip'))],
		remove: [updateSuggestionVoteCounts(), iff(isProvider('external'), discard('user_ip'))]
	})

	votesService.filter(() => false)
}

function makeSureUserHasntVoted() {
	return async function (hook) {
		if (!hook.params.provider) {
			return
		}

		const user_ip = hook.params.userIP // eslint-disable-line camelcase
		const suggestion_id = hook.data.suggestion_id // eslint-disable-line camelcase
		if (!suggestion_id) { // eslint-disable-line camelcase
			throw new errors.Unprocessable('Missing suggestion to vote for')
		}

		// Check that user hasn't already voted
		const result = await this.find({
			query: {
				suggestion_id, // eslint-disable-line camelcase
				user_ip // eslint-disable-line camelcase
			}
		})

		if (result.length > 0) {
			throw new errors.Conflict('You have already voted for this.')
		}

		hook.data.user_ip = user_ip // eslint-disable-line camelcase
		return hook
	}
}

function updateSuggestionVoteCounts() {
	return async function (hook) {
		const data = Array.isArray(hook.result) ? hook.result : [hook.result]

		const suggestionIDs = _(data).map('suggestion_id').uniq().value()

		const votesResult = await hook.app.db('votes')
			.column('suggestion_id')
			.groupBy('suggestion_id')
			.count('id as votes')
			.whereIn('suggestion_id', suggestionIDs)

		_.map(votesResult, ({suggestion_id, votes}) => { // eslint-disable-line camelcase
			// update suggestions
			hook.app.service('api/suggestions').patch(suggestion_id, {
				votes
			})
		})
	}
}

