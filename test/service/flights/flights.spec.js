require('app-module-path/cwd');
require('custom-env').env();
const assert = require('assert');
const broker = require('lib/broker');
const flights = require('lib/service/flights');

describe('Flights Service', function() {
	afterEach(function() {
		broker.clear();
		flights();
	});
	describe('pandemic.flights.run', function() {
		it('rejects if no active event', async function() {
			broker.register('pandemic.event.active', () => {
				return null;
			});
			assert.rejects(broker.call('pandemic.flights.run'));
		});
		it('no registered pilots', async function() {
			broker.register('pandemic.event.active', () => {
				return { id: 1234567 };
			});
			broker.register('vatstats.flight.current', () => {
				return {
					active_flights: [{ callsign: 'UNO001' }],
					arrivals: []
				};
			});
			broker.register('pandemic.pilot.by', () => null);

			const results = await broker.call('pandemic.flights.run');
			assert.ok(results);
			assert.equal(Array.isArray(results), true);
			assert.equal(results.length, 0);
		});
		it('new flight', function() {
			broker.register('pandemic.event.active', () => {
				return { id: 1234567 };
			});
			broker.register('vatstats.flight.current', () => {
				return {
					active_flights: [{ callsign: 'UNO001' }],
					arrivals: []
				};
			});
			broker.register('pandemic.pilot.by', () => null);
		});
		it('no registered pilot', function() {});
		it('no registered pilot', function() {});
		it('no registered pilot', function() {});
	});
});
