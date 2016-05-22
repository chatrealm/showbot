import _ from 'lodash'
import errors from 'feathers-errors'
import service from 'feathers-knex'

import knex from '../database'
import {disable, remove} from '../hooks'

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

		if (result.length) {
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

		const votesResult = await knex('votes')
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

export default function () {
	const app = this

	app.service('api/votes', service({
		Model: knex,
		name: 'votes'
	}))

	const votesService = app.service('api/votes')

	votesService.before({
		find: [disable('external')],
		// get: [disable('external')], // bug in feathers-knex
		create: [makeSureUserHasntVoted()],
		update: [disable('external')],
		patch: [disable('external')],
		remove: [disable('external')]
	})

	votesService.after({
		create: [updateSuggestionVoteCounts(), remove('user_ip')],
		remove: [updateSuggestionVoteCounts(), remove('user_ip')]
	})

	votesService.filter(() => false)
}
