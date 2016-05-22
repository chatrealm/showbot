import config from 'config'
import debug from 'debug'

export default config

// Configure debug
if (config.get('debug')) {
	debug.enable(config.get('debug'))
}
