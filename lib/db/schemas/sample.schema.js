const definitions = require('./definitions.json');

module.exports = {
	$schema: 'http://json-schema.org/draft-07/schema#',
	title: 'Sample Schema',
	definitions: definitions,
	type: 'object',
	properties: {
		id: {
			type: ['integer', 'string']
		},
		owner: {
			$ref: '#callsign'
		},
		origin: {
			type: 'object',
			properties: {
				flight: {
					$ref: '#flight'
				},
				callsign: {
					$ref: '#callsign'
				},
				zone: {
					$ref: '#icao'
				},
				airport: {
					$ref: '#icao'
				},
				timestamp: {
					type: 'string',
					format: 'date-time'
				}
			},
			required: ['callsign', 'zone', 'airport'],
			additionalProperties: false
		},
		transfers: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					from: {
						$ref: '#callsign'
					},
					to: {
						$ref: '#callsign'
					},
					airport: {
						$ref: '#icao'
					},
					timestamp: {
						type: 'string',
						format: 'date-time'
					}
				},
				required: ['from', 'to', 'airport', 'timestamp'],
				additionalProperties: false
			}
		},
		delivery: {
			type: 'object',
			properties: {
				flight: {
					$ref: '#flight'
				},
				lab: {
					$ref: '#airport'
				},
				by: {
					$ref: '#callsign'
				},
				cure: {
					type: 'integer',
					minimum: 1
				},
				timestamp: {
					type: 'string',
					format: 'date-time'
				}
			}
		}
	},
	required: ['id', 'owner', 'origin']
};
