'use strict';

const debug = require('debug')('bot:commands:pilot:register');
const { SenseiCommand } = require('discord-sensei');

module.exports = class RegisterPilotCommand extends SenseiCommand {
	constructor() {
		super();

		this.setNames(['register', 'reg']);
		this.setCategory('Pilot');

		this.setInfo({
			name: 'Register Command',
			description: "Register the pilot's Vatsim id and callsign for the event",
			syntax: 'register [Vastim CID] [Callsign]'
		});

		this.setArguments([
			{
				name: 'cid',
				type: 'number',
				optional: false
			},
			{
				name: 'callsign',
				type: 'string',
				optional: false
			}
		]);
	}

	async run(bot, message, args) {
		broker.call();
	}
};
