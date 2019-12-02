'use strict';

const debug = require('debug')('jobs:index');
const cron = require('node-cron');
const broker = require('lib/broker');

const opts = {
	flights: {
		schedule: process.env.PANDEMIC_FLIGHTS_SCHEDULE || '*/2 * * * *'
	}
};

module.exports = (() => {
	cron.schedule(opts.flights.schedule, async () => {
		const res = await broker.call('flight.remote.fetch');
		broker.publish('flight.remote.fetch', res);
	});
})();
