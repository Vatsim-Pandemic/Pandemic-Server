'use strict';

/** Default module options */
const DEF_OPTIONS = {
	prefixes: ['!'],
	commandsDirectory: path.join(__dirname, '/lib/bot/commands'),
	logMesages: false,
	reportErrors: false
};

module.exports = (db, opts) => {
	opts = { ...DEF_OPTS, opts };

	const debug = require('debug')('bot:index');
	const path = require('path');
	const { SenseiClient } = require('discord-sensei');

	debug('client');
	const client = new SenseiClient(opts);

	debug('login');
	client.login(process.env.PANDEMIC_BOT_TOKEN);

	return Promise.resolve(client);
};
