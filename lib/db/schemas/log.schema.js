const definitions = require('./definitions.json');

module.exports = {
	$schema: 'http://json-schema.org/draft-07/schema#',
	title: 'Log Schema',
	definitions: definitions,
	type: 'object',
	properties: {
		id: {
			$ref: '#shortid'
		},
		type: {
			type: 'string',
			enum: ['info', 'warning', 'error'],
			default: 'info'
		},
		category: {
			type: 'string',
			default: 'general'
		},
		message: {
			type: 'string'
		},
		timestamp: {
			$ref: '#timestamp'
		}
	},
	required: ['id', 'type', 'category', 'message', 'timestamp'],
	additionalProperties: true
};
