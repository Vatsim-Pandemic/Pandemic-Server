const definitions = require('./definitions.json');

module.exports = {
	$schema: 'http://json-schema.org/draft-07/schema#',
	title: 'Event Schema',
	definitions: definitions,
	type: 'object',
	properties: {
		code: {
			$ref: '#code'
		},
		name: {
			type: 'string'
		},
		settings: {
			type: 'object',
			properties: {
				samples: {
					$ref: '#dice'
				},
				infection: {
					type: 'object',
					properties: {
						startingCards: {
							type: 'integer'
						},
						rollInterval: {
							type: 'integer'
						},
						pandemicCards: {
							type: 'integer'
						}
					},
					required: ['startingCards', 'rollInterval', 'pandemicCards'],
					additionalProperties: false
				},
				cure: {
					type: 'object',
					oneOf: [
						{
							properties: {
								capLevel: {
									type: 'boolean'
								}
							},
							required: ['capLevel'],
							additionalProperties: false
						},
						{
							properties: {
								instantCure: {
									type: 'boolean'
								}
							},
							required: ['instantCure'],
							additionalProperties: false
						}
					]
				}
			},
			required: ['samples', 'infection', 'cure'],
			additionalProperties: false
		},
		area: {
			type: 'array',
			minItems: 4,
			items: {
				$ref: '#position'
			}
		},
		active: {
			type: 'boolean',
			default: false
		}
	},
	required: ['code', 'name', 'settings', 'area', 'active']
};
