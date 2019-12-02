'use strict';

const debug = require('debug')('service:vatstats');
const axios = require('axios');
const broker = require('lib/broker');

const MissingArgError = (name, type) => Error(`${name} is required, and must be a ${type}`);

const opts = {
	namespace: 'vatstats',
	baseURL: process.env.PANDEMIC_VATSTATS_API_URL || 'https://beta-api.vatstats.net/external_api/',
	timeout: process.env.PANDEMIC_VATSTATS_API_TIMEOUT || 2000
};

const api = axios.create({
	baseURL: opts.baseURL,
	timeout: opts.timeout
});

broker.register(`${opts.namespace}.flight.get`, async (id) => {
	if (!id) throw MissingArgError('id', 'number');

	const url = `/flights/${id}/?format=json`;
	const res = await api.get(url);

	if (res.status === 200) {
		return res.data;
	}
});

broker.register(`${opts.namespace}.user.get`, async (id) => {
	if (!id) throw MissingArgError('id', 'number');

	const url = `/cid_profiles/${id}/?format=json`;
	const res = await api.get(url);

	if (res.status === 200) {
		return res.data;
	}
});

broker.register(`${opts.namespace}.airport.get`, async (id) => {
	if (!id) throw MissingArgError('id', 'string');

	const url = `/airports/${id}/?format=json`;
	const res = await api.get(url);

	if (res.status === 200) {
		return res.data;
	}
});

broker.register(`${opts.namespace}.airport.find`, async (id) => {
	if (!id) throw MissingArgError('id', 'string');

	const url = `/airports/?icao__contains=${id}&format=json`;
	const res = await api.get(url);

	if (res.status === 200) {
		return res.data.results || [];
	}
});

broker.register(`${opts.namespace}.flight.current`, async () => {
	const url = `/home_page/?format=json`;
	const res = await api.get(url);

	if (res.status === 200) {
		return res.data;
	}
});
