'use strict';

const opts = {
	port: process.env.PANDEMIC_WSS_PORT || 3000
};

const debug = require('debug')('wss:index');
const broker = require('lib/broker');

module.exports = (() => {
	const io = require('socket.io')(opts.port);
	const wildcard = require('socketio-wildcard')();
	io.use(wildcard);

	/**
	 * pandemic.flights.active, []
	 * pandemic.infections.changed, []
	 * pandemic.zone.getall, []
	 * pandemic.flights.getactive, []
	 */

	io.on('connection', async (socket) => {
		socket.on('*', (packet) => {
			let [topic, ...params] = packet.data;
			let callback = null;

			// check if the final parameter is a function
			if (Array.isArray(params) && params.length > 0 && typeof params[params.length - 1] === 'function') {
				callback = params.pop();
			}

			if (callback) {
				broker.call(topic, ...params).then(
					(data) => {
						callback(null, data);
					},
					(e) => {
						const error = Object.assign({ message: e.message }, e);
						callback(error, null);
					}
				);
			} else {
				broker.publish(topic, ...params);
			}
		});
	});

	io.listen(8080);
})();
