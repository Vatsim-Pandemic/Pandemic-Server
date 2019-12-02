const definitions = require('./definitions.json');

module.exports = {
	$schema: 'http://json-schema.org/draft-07/schema#',
	title: 'Flight Schema',
	definitions: definitions,
	type: 'object',
	properties: {
		id: {
			type: ['string', 'integer']
		},
		cid: {
			type: ['string', 'integer']
		},
		callsign: {
			$ref: '#callsign'
		},
		status: {
			type: 'string',
			enum: ['DEP', 'ENR', 'ARR', 'CXD']
		},
		planned: {
			type: 'object',
			properties: {
				dep: {
					$ref: '#airport'
				},
				dest: {
					$ref: '#airport'
				}
			},
			required: ['dep', 'dest'],
			additionalProperties: false
		},
		location: {
			type: 'object',
			properties: {
				hdg: {
					type: 'integer'
				},
				alt: {
					type: 'integer'
				},
				gs: {
					type: 'integer'
				},
				position: {
					$ref: '#position'
				}
			},
			required: ['hdg', 'alt', 'gs', 'position'],
			additionalProperties: false
		},
		diverted: {
			$ref: '#airport'
		},
		required: ['id', 'cid', 'callsign', 'status', 'planned', 'location'],
		additionalProperties: true
	}
};
