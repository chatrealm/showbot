import Bluebird from 'bluebird'

export {
disable, remove, removeQuery, pluck, pluckQuery
} from 'feathers-hooks'

import errors from 'feathers-errors'

// Mapping over data or result
export function map(callback) {
	return async function (hook) {
		let data

		if (hook.type === 'before') {
			data = hook.data
		} else {
			const isPaginated = (hook.method === 'find' && hook.result.data)
			data = isPaginated ? hook.result.data : hook.result
		}

		if (data) {
			if (Array.isArray(data)) {
				// array
				await Promise.all(data.map(callback.bind(this, hook)))
			} else {
				// one thing
				await callback.call(this, hook, data)
			}
		}

		return hook
	}
}

export function mapSeries(callback) {
	return async function (hook) {
		let data

		if (hook.type === 'before') {
			data = hook.data
		} else {
			const isPaginated = (hook.method === 'find' && hook.result.data)
			data = isPaginated ? hook.result.data : hook.result
		}

		if (data) {
			if (Array.isArray(data)) {
				// array
				await Bluebird.mapSeries(data.map(callback.bind(this, hook)))
			} else {
				// one thing
				await callback.call(this, hook, data)
			}
		}

		return hook
	}
}

// Taken from feathers-hooks, fixed to remove query
export function populate(target, options) {
	options = Object.assign({}, options)

	if (!options.service) {
		throw new Error('You need to provide a service')
	}

	const field = options.field || target

	return function (hook) {
		function populate(item) {
			if (!item[field]) {
				return Promise.resolve(item)
			}

			// Find by the field value by default or a custom query
			const id = item[field]

			if (typeof item.toObject === 'function') {
				// If it's a mongoose model then
				item = item.toObject(options)
			} else if (typeof item.toJSON === 'function') {
				// If it's a Sequelize model
				item = item.toJSON(options)
			}

			const params = Object.assign({}, hook.params, {
				query: {} // Fix extra query being added
			})

			return hook.app.service(options.service)
				.get(id, params)
				.then(relatedItem => {
					if (relatedItem) {
						item[target] = relatedItem
					}

					return item
				}).catch(() => item)
		}

		if (hook.type === 'after') {
			const isPaginated = (hook.method === 'find' && hook.result.data)
			const data = isPaginated ? hook.result.data : hook.result

			if (Array.isArray(data)) {
				return Promise.all(data.map(populate)).then(results => {
					if (isPaginated) {
						hook.result.data = results
					} else {
						hook.result = results
					}

					return hook
				})
			}

			// Handle single objects.
			return populate(hook.result).then(item => {
				hook.result = item
				return hook
			})
		}
	}
}

export function queryMustInclude(...fields) {
	return function (hook) {
		if (!hook.params.provider) {
			return
		}

		fields.forEach(field => {
			if (!hook.params.query || !(field in hook.params.query)) {
				throw new errors.Forbidden('Query is too wide')
			}
		})
	}
}

// Mostly taken from feathers-hooks, changed to run checking per thing
export function removeIndividually(...fields) {
	const callback = typeof fields[fields.length - 1] === 'function' ? fields.pop() : (hook) => Boolean(hook.params.provider)

	const removeFields = function (hook, data) {
		if (callback.call(this, hook, data)) {
			for (let field of fields) {
				data[field] = undefined
				delete data[field]
			}
		}
	}

	return map(removeFields)
}

export function jsonStringifyFields(...fields) {
	return map(function (hooks, item) {
		fields.forEach(field => {
			item[field] = JSON.stringify(item[field])
		})
	})
}

export function jsonParseFields(...fields) {
	return map(function (hooks, item) {
		fields.forEach(field => {
			if (typeof item[field] === 'string') {
				item[field] = JSON.parse(item[field])
			}
		})
	})
}

export function updateTimestamps() {
	return map(function (hook, item) {
		if (hook.method === 'create') {
			item.created_at = new Date() // eslint-disable-line camelcase
		}

		item.updated_at = new Date() // eslint-disable-line camelcase
		return hook
	})
}
