'use strict';

const debug = require('debug')('broker');
const EventEmitter = require('events');
const minimatch = require('minimatch');

const MissingArgError = (name, type) => Error(`${name} is required, and must be a ${type}`);
const MissingSubscriberError = (topic) => Error(`No subscriber was found for the ${topic} topic`);
const NoProviderError = (procedure) => Error(`No provider for the ${procedure} procedure`);
const DuplicateProviderError = (procedure) => Error(`Duplicate provider for the ${procedure} procedure`);

const $providers = Symbol();
const $subscribers = Symbol();

module.exports = new (class Broker extends EventEmitter {
	constructor() {
		super();

		this[$providers] = new Map();
		this[$subscribers] = new Set();
	}

	/** Register a provider for a procedure */
	register(procedure, callback) {
		if (!(typeof procedure === 'string' && procedure.length > 0)) {
			throw MissingArgError('procedure', 'string');
		}

		if (typeof callback !== 'function') {
			throw MissingArgError('callback', 'function');
		}

		procedure = procedure.toLowerCase();

		if (this[$providers].has(procedure)) {
			throw DuplicateProviderError(procedure);
		}

		debug('register', procedure, this[$providers].size);
		this[$providers].set(procedure, callback);
	}

	/** Unregister a provider for a procedure */
	unregister(procedure, callback) {
		if (!(typeof procedure === 'string' && procedure.length > 0)) {
			throw MissingArgError('procedure', 'string');
		}
		if (typeof callback !== 'function') {
			throw MissingArgError('callback', 'function');
		}

		procedure = procedure.toLowerCase();

		if (this[$providers].get(procedure) === callback) {
			this[$providers].delete(procedure);
		}
	}

	/** Call a registered procedure */
	call(procedure, ...params) {
		if (!(typeof procedure === 'string' && procedure.length > 0)) {
			return Promise.reject(MissingArgError('procedure', 'string'));
		}

		procedure = procedure.toLowerCase();

		if (!this[$providers].has(procedure)) {
			return Promise.reject(NoProviderError(procedure));
		}

		try {
			const callback = this[$providers].get(procedure);
			const result = callback(...params);

			if (result && typeof result.then === 'function') {
				return result;
			} else {
				return Promise.resolve(result);
			}
		} catch (err) {
			return Promise.reject(err);
		}
	}

	/** Publish the message to all matching subscribers */
	publish(topic, ...params) {
		if (!(typeof topic === 'string' && topic.length > 0)) {
			throw MissingArgError('topic', 'string');
		}

		topic = topic.toLowerCase();

		for (const subscriber of this[$subscribers]) {
			try {
				if (minimatch(topic, subscriber.filter)) {
					subscriber.callback(topic, ...params);
				}
			} catch (e) {
				this.emit('error', e);
			}
		}
	}

	/** Subscribe to messages to match the filter */
	subscribe(filter, callback) {
		if (!(typeof filter === 'string' && filter.length > 0)) {
			throw MissingArgError('filter', 'string');
		}

		if (typeof callback !== 'function') {
			throw MissingArgError('callback', 'function');
		}

		filter = filter.toLowerCase();

		this[$subscribers].add({
			filter: filter,
			callback: callback
		});
	}

	/** Unsubscribe to messages to match the filter */
	unsubscribe(filter, callback) {
		if (!(typeof filter === 'string' && filter.length > 0)) {
			throw MissingArgError('filter', 'string');
		}

		if (typeof callback !== 'function') {
			throw MissingArgError('callback', 'function');
		}

		filter = filter.toLowerCase();

		for (const subscriber in this[$subscribers]) {
			if (subscriber.filter === filter && subscriber.callback === callback) {
				this[$subscribers].delete(subscriber);
				return;
			}
		}
	}

	clear() {
		this[$providers].clear();
		this[$subscribers].clear();
	}
})();
