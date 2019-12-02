require('app-module-path/cwd');
require('custom-env').env();
const assert = require('assert');
const broker = require('lib/broker');

describe.only('Vatstats', function() {
	before(function() {
		require('lib/remote/vatstats');
	});
	describe('vatstats.airport.get', function() {
		it('fail', async function() {
			assert.rejects(broker.call('vatstats.airport.get', null));
		});
		it('success', async function() {
			const icao = 'KBOS';
			const data = await broker.call('vatstats.airport.get', icao);
			assert.ok(data);
			assert.equal(typeof data === 'object', true);
			assert.equal(data.icao, icao);
		});
	});
	describe('vatstats.airport.find', function() {
		it('fail', async function() {
			assert.rejects(broker.call('vatstats.airport.find', null));
		});
		it('success', async function() {
			const icao = 'KB';
			const results = await broker.call('vatstats.airport.find', icao);
			assert.equal(Array.isArray(results), true);
			assert.equal(results.length > 0, true);
		});
	});
	describe('vatstats.user.get', function() {
		it('fail', async function() {
			assert.rejects(broker.call('vatstats.user.get', null));
		});
		it('success', async function() {
			const cid = 1395189;
			const data = await broker.call('vatstats.user.get', cid);
			assert.ok(data);
			assert.equal(typeof data === 'object', true);
			assert.equal(data.cid, cid);
		});
	});
	describe('vatstats.flight.get', function() {
		it('fail', async function() {
			assert.rejects(broker.call('vatstats.flight.get', null));
		});
		it('success', async function() {
			const id = 18230627;
			const data = await broker.call('vatstats.flight.get', id);
			assert.ok(data);
			assert.equal(typeof data === 'object', true);
			assert.equal(data.id, id);
		});
	});
	describe('vatstats.flight.current', function() {
		it('success', async function() {
			const data = await broker.call('vatstats.flight.current');
			assert.ok(data);
			assert.equal(typeof data === 'object', true);
			assert.equal(Array.isArray(data.departures), true);
			assert.equal(Array.isArray(data.arrivals), true);
			assert.equal(Array.isArray(data.active_flights), true);
		});
	});
});
