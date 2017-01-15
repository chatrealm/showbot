import crypto from 'crypto'

import _ from 'lodash'
import errors from 'feathers-errors'
import service from 'feathers-knex'
import {disallow, discard, iff, isProvider} from 'feathers-hooks-common'

import {map, updateTimestamps} from '../hooks'

function checkForDuplicates() {
	return map(async function (hook, item) {
		const {channel_id, suggestion} = item // eslint-disable-line camelcase
		const hash = crypto.createHash('sha1').update(_.toLower(suggestion)).digest('base64')
		// Check if hash already is used
		const result = await this.find({
			query: {
				channel_id, // eslint-disable-line camelcase
				hash
			}
		})

		if (result.length > 0) {
			// Check that any are exactly the same
			const alreadyExists = _.find(result, existing => {
				return _.toLower(existing.suggestion) === _.toLower(suggestion)
			})
			if (alreadyExists) {
				throw new errors.Conflict(`Suggestion has already been submitted by ${alreadyExists.user}`)
			}
		}

		item.hash = hash
		item.votes = 0
	})
}

function cleanSuggestionVotes() {
	return async function (hook) {
		const data = hook.result

		const suggestionIDs = _(data).map('id').value()

		// Remove all votes that are related to this suggestion
		await hook.app.service('api/votes').remove(null, {
			query: {
				suggestion_id: { // eslint-disable-line camelcase
					$in: suggestionIDs
				}
			}
		})
	}
}

export default function () {
	const app = this

	app.service('api/suggestions', service({
		Model: app.db,
		name: 'suggestions'
	}))

	const suggestionsService = app.service('api/suggestions')

	suggestionsService.before({
		create: [disallow('external'), checkForDuplicates(), updateTimestamps()],
		update: [disallow('external'), updateTimestamps()],
		patch: [disallow('external'), updateTimestamps()],
		remove: [disallow('external')]
	})

	suggestionsService.after({
		all: [iff(isProvider('external'), discard('hash'))],
		remove: [cleanSuggestionVotes()]
	})

	suggestionsService.filter(data => {
		return _.omit(data, ['hash'])
	})
}
