require('app-module-path/cwd');
require('custom-env').env();
const assert = require('assert');
const broker = require('lib/broker');
const shortid = require('shortid');

describe.only('Database', function() {
	before(async function() {
		this.db = await require('lib/db');
	});
	describe('init', function() {
		it('has schema collections', function() {
			const data = this.db.listCollections();
			assert.equal(Array.isArray(data), true);
			assert.equal(data.length, 7);
		});
	});
	describe('log', function() {
		it('validate fails', async function() {
			const doc = { id: 'xyz' };
			const errors = await broker.call('pandemic.log.validate', doc);
			assert.ok(errors);
			assert(Array.isArray(errors), true);
			assert(errors.length, 1);
		});
		it('validate passes', async function() {
			const doc = {
				id: shortid.generate(),
				type: 'info',
				category: 'test',
				message: 'Test',
				timestamp: new Date().toISOString()
			};

			const errors = await broker.call('pandemic.log.validate', doc);
			assert.equal(errors, null);
		});

		it('by passes', async function() {
			const doc = {
				id: shortid.generate(),
				type: 'info',
				category: 'test',
				message: 'Test',
				timestamp: new Date().toISOString()
			};

			const newDoc = await broker.call('pandemic.log.insert', doc);
			const byDoc = await broker.call('pandemic.log.by', 'id', newDoc.id);

			assert.ok(byDoc);
			assert.equal(newDoc.id, byDoc.id);
		});
		it('get passes', async function() {
			const doc = {
				id: shortid.generate(),
				type: 'info',
				category: 'test',
				message: 'Test',
				timestamp: new Date().toISOString()
			};

			const res = await broker.call('pandemic.log.insert', doc);
			assert.ok(res);
			assert.ok(res.$loki);
		});
		it('last transform passes', async function() {
			const doc = {
				id: shortid.generate(),
				type: 'info',
				category: 'test',
				message: 'Test',
				timestamp: new Date().toISOString()
			};

			const newDoc = await broker.call('pandemic.log.insert', doc);
			const results = await broker.call('pandemic.log.last');

			assert.ok(results);
			assert.equal(Array.isArray(results), true);
			assert.equal(results.length, 1);
			assert.equal(results[0].id, newDoc.id);
		});
	});

	describe('pilot', function() {
		it('pilotactive transform success', async function() {
			const doc = {
				id: shortid.generate(),
				type: 'info',
				category: 'test',
				message: 'Test',
				timestamp: new Date().toISOString()
			};

			const newDoc = await broker.call('pandemic.log.insert', doc);
			const results = await broker.call('pandemic.log.last');

			assert.ok(results);
			assert.equal(Array.isArray(results), true);
			assert.equal(results.length, 1);
			assert.equal(results[0].id, newDoc.id);
		});
	});
});
