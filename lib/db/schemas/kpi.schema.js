const definitions = require('./definitions.json');

module.exports = {
	$schema: 'http://json-schema.org/draft-07/schema#',
	title: 'Analytics Schema',
	definitions: definitions,
	type: 'object',
	properties: {
		id: {
			$ref: '#shortid'
		},
		category: {
			type: 'string'
		},
		name: {
			type: 'string'
		},
		value: {
			type: 'number',
			default: 0
		}
	},
	required: ['id', 'category', 'name', 'value']
};
