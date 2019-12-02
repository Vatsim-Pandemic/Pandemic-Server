const definitions = require('./definitions.json');

module.exports = {
	$schema: 'http://json-schema.org/draft-07/schema#',
	title: 'Pilot Schema',
	definitions: definitions,
	type: 'object',
	properties: {
		id: {
			type: 'integer'
		},
		cid: {
			type: 'integer'
		},
		callsign: {
			$ref: '#callsign'
		},
		location: {
			type: 'object',
			properties: {
				airport: {
					$ref: '#airport'
				},
				position: {
					$ref: '#position'
				}
			},
			required: ['airport', 'position'],
			additionalProperties: false
		},
		cured: {
			type: 'boolean',
			default: true
		}
	},
	required: ['id', 'cid', 'callsign'],
	additionalProperties: true
};
