require('app-module-path/cwd');
require('custom-env').env();
const assert = require('assert');
const broker = require('lib/broker');

describe('Broker', function() {
	afterEach(function() {
		broker.clear();
	});

	describe('Publish/Subscribe', function() {
		it('subscribe with no topic', function() {
			assert.throws(() => broker.subscribe(null, null));
		});
		it('subscribe with no callback', function() {
			assert.throws(() => broker.subscribe('test', null));
		});
		it('publish with no topic', function() {
			assert.throws(() => broker.publish(null, null));
		});
		it('publish with topic and no subscribers', function() {
			const greeting = { hello: 'world' };
			assert.doesNotThrow(() => broker.publish('broker.test', greeting));
		});
		it('publish with direct subscriber', function(done) {
			const greeting = { hello: 'world' };
			broker.subscribe('broker.test', (topic, data) => {
				assert.equal(topic, 'broker.test');
				assert.equal(data, greeting);
				done();
			});
			assert.doesNotThrow(() => broker.publish('broker.test', greeting));
		});
		it('publish with wildcard subscriber', function(done) {
			const greeting = { hello: 'world' };
			broker.subscribe('*', (topic, data) => {
				assert.equal(topic, 'broker.test');
				assert.equal(data, greeting);
				done();
			});
			assert.doesNotThrow(() => broker.publish('broker.test', greeting));
		});
	});
	describe('Register/Call', function() {
		it('call with no topic', function() {
			assert.rejects(() => broker.call(null, null));
		});
		it('call with no provider', function() {
			const greeting = { hello: 'world' };
			assert.rejects(() => broker.call('broker.test', greeting));
		});
		it('call with provider returns value', async function() {
			const greeting = { hello: 'world' };
			broker.register('broker.test', (data) => {
				return data;
			});
			const result = await broker.call('broker.test', greeting);
			assert.equal(result, greeting);
		});
		it('call with provider returns promise', async function() {
			const greeting = { hello: 'world' };
			broker.register('broker.test', (data) => {
				return Promise.resolve(data);
			});
			const result = await broker.call('broker.test', greeting);
			assert.equal(result, greeting);
		});
	});
});
