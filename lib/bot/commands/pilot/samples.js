'use strict';

const debug = require('debug')('bot:commands:pilot:samples');
const { SenseiCommand } = require('discord-sensei');
const broker = require('lib/broker');
const { RichEmbed } = require('discord.js');

module.exports = class SamplesCommand extends SenseiCommand {
	constructor() {
		super();

		this.setNames(['samples', 'sample']);
		this.setCategory('pilot');

		this.setInfo({
			name: 'Samples',
			description: "Lists the samples you or other pilots have",
			syntax: 'samples [User Mention (Optional)]'
		});

		this.setArguments([
			{
				name: 'mention',
				type: 'USER_MENTION',
				optional: true
			},
		]);
	}

	async run(bot, message, args) {
		debug(`run`);
		try{
			let embed = new RichEmbed()
				.setThumbnail(message.member.user.displayAvatarURL)
				.setColor(message.member.displayColor)
				.setTitle(`${0}'s Samples`);

			let callsign = "IHS1503"; // Hard coded for now

			// Check if pilot already exists
			// If they do, update rather than insert
			let result = await broker.call("pandemic.sample.find", callsign);

			if(result) {
				
			} else {
			}

			// Show result to make sure it went in correctly
			result = await broker.call("pandemic.pilot.get", parseInt(message.member.id))
			embed.setDescription(`Discord user: ${message.member.toString()}
				Callsign: ${result.callsign}
				CID: ${result.cid}`)

			message.channel.send({ embed: embed});

		} catch (err) {
			debug(err);
			message.reply(`An error occured doing that... ${err.message}`);
		}
		return;
	}
};
