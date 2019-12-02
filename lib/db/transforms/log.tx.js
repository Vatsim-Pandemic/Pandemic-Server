'use strict';

module.exports = {
	last: [
		{ type: 'simplesort', property: '$loki', desc: true },
		{ type: 'limit', value: 1 }
	]
};
