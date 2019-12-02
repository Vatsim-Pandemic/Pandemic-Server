require('app-module-path/cwd');
require('custom-env').env();
const assert = require('assert');
const broker = require('lib/broker');
const wss = require('lib/wss');
const io = require('socket.io-client');

describe.only('Web Socket Server', function() {
	afterEach(function() {
		broker.clear();
	});
	it('req/res fail', function(done) {
		broker.register('pandemic.wss.test', (...params) => {
			return Promise.reject(Error('test'));
		});

		const socket = io('http://localhost:3000');
		socket.on('connect', () => {
			socket.emit('pandemic.wss.test', 'chrismbeckett', 'bad-password', (err, res) => {
				assert.ok(err);
				done();
			});
		});
	});
	it('req/res success', function(done) {
		broker.register('pandemic.wss.test', (...params) => {
			return Promise.resolve(params);
		});

		const socket = io('http://localhost:3000');
		socket.on('connect', () => {
			socket.emit('pandemic.wss.test', 'chrismbeckett', 'bad-password', (err, res) => {
				assert.ok(res);
				done();
			});
		});
	});
	it('pub/sub', function(done) {
		const _topic = 'pandemic.wss.test';
		const _params = ['foo', 'bar'];

		broker.subscribe('pandemic.wss.test', (topic, ...params) => {
			assert.equal(topic, _topic);
			assert.equal(params[0], 'foo');
			assert.equal(params[1], 'bar');
			done();
		});

		const socket = io('http://localhost:3000');
		socket.on('connect', () => {
			socket.emit(_topic, ..._params);
		});
	});
});
