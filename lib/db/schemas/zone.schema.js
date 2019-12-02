const definitions = require('./definitions.json');

module.exports = {
	$schema: 'http://json-schema.org/draft-07/schema#',
	title: 'Zone Schema',
	definitions: definitions,
	type: 'object',
	properties: {
		name: {
			type: 'string'
		},
		airport: {
			$ref: '#airport'
		},
		position: {
			$ref: '#position'
		},
		region: {
			oneOf: [
				{
					type: 'object',
					properties: {
						radius: {
							type: 'integer'
						}
					},
					required: ['radius'],
					additionalProperties: false
				},
				{
					type: 'object',
					properties: {
						area: {
							type: 'array',
							items: {
								$ref: '#position'
							}
						}
					},
					required: ['area'],
					additionalProperties: false
				}
			]
		},
		type: {
			type: 'array',
			items: {
				type: 'string',
				enum: ['lab', 'start', 'infection']
			}
		},
		infection: {
			type: 'integer',
			minimum: -1,
			maximum: 3,
			default: 0
		},
		connections: {
			type: 'array',
			items: {
				$ref: '#airport'
			}
		}
	},
	required: ['name', 'airport', 'position', 'type', 'infection']
};
