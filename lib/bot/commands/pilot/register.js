'use strict';

const debug = require('debug')('bot:commands:pilot:register');
const { SenseiCommand } = require('discord-sensei');
const broker = require('lib/broker');
const { RichEmbed } = require('discord.js');

module.exports = class RegisterPilotCommand extends SenseiCommand {
	constructor() {
		super();

		this.setNames(['register', 'reg']);
		this.setCategory('pilot');

		this.setInfo({
			name: 'Register Command',
			description: "Register the pilot's Vatsim id and callsign for the event",
			syntax: 'register [Vastim CID] [Callsign]'
		});

		this.setArguments([
			{
				name: 'cid',
				type: 'number',
				optional: false,
				default: ''
			},
			{
				name: 'callsign',
				type: 'string',
				optional: false,
				default: ''
			}
		]);
	}

	async run(bot, message, args) {
		debug(`run - CID ${args.cid} - Callsign ${args.callsign}`)
		try{
			let embed = new RichEmbed()
				.setThumbnail(message.member.user.displayAvatarURL)
				.setColor(message.member.displayColor)

			// Check if pilot already exists
			// If they do, update rather than insert
			let result = await broker.call("pandemic.pilot.get", parseInt(message.member.id))

			if(result) {
				embed.setTitle(`Updated user in pilot database`)
			
				await broker.call("pandemic.pilot.update", {
					...result,
					id: parseInt(message.member.id), 
					cid: args.cid,
					callsign: args.callsign
				});
			} else {
				embed.setTitle(`Added user to pilot database`)
				
				await broker.call("pandemic.pilot.insert", {
					id: parseInt(message.member.id), 
					cid: args.cid,
					callsign: args.callsign
				});
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
