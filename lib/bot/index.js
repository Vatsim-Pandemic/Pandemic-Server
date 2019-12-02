'use strict';

const path = require('path');
const debug = require('debug')('bot:index');
const { SenseiClient } = require('discord-sensei');

/** Default module options */
const DEF_OPTIONS = {
	prefixes: ['!'],
	commandsDirectory: path.join(__dirname, '/commands'),
	logMesages: false,
	reportErrors: false
};

module.exports = ((opts) => {;
	opts = { ...DEF_OPTIONS, opts };
	debug("Commands directory:", opts.commandsDirectory)

	debug('client');
	const client = new SenseiClient(opts);

	debug('login');
	client.login(process.env.PANDEMIC_BOT_TOKEN);

	return Promise.resolve(client);
})();
