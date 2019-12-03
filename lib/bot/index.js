'use strict';

const path = require('path');
const broker = require('lib/broker');
const debug = require('debug')('bot:index');
const { SenseiClient } = require('discord-sensei');
const { RichEmbed } = require('discord.js');

const UserNotFoundError = (id) => new Error(`${id} not found in Discord users`);

const DEP_ICON = 'https://cdn.discordapp.com/emojis/461733071218278410.png?v=1';
const DIV_ICON = '';
const CXD_ICON = 'https://cdn.discordapp.com/emojis/436007034832551938.png?v=1';
const ARR_ICON = 'https://cdn.discordapp.com/emojis/461733151996117012.png?v=1';
const SAMPLE_ICON = 'https://cdn.discordapp.com/emojis/461731079355760640.png?v=1';

/** Default module options */
const DEF_OPTIONS = {
	prefixes: ['!'],
	commandsDirectory: path.join(__dirname, '/commands'),
	logMesages: false,
	reportErrors: false,
	flightLoggingChannel: process.env.PANDEMIC_FLIGHT_LOGGING || 626088187751825413,
	sampleLoggingChannel: process.env.PANDEMIC_SAMPLE_LOGGING || 626088187751825413,
};

let flightChannel = null;
let sampleChannel = null;

module.exports = ((opts) => {;
	opts = { ...DEF_OPTIONS, opts };
	debug('Commands directory:', opts.commandsDirectory)

	debug('client');
	const client = new SenseiClient(opts);

	debug('login');
	client.login(process.env.PANDEMIC_BOT_TOKEN);

	debug('subscribe');
	broker.subscribe('pandemic.flight.update', handleFlightUpdate);
	broker.subscribe('pandemic.samples.assigned', handleSampleAssigned);
	broker.subscribe('pandemic.samples.transfer', handleSampleTransfer);
	broker.subscribe('pandemic.samples.delivered', handleSampleDelivered);

	debug('register');
	broker.register('discord.member.get', (guild, value) => {
		let user = client.guilds.get("" + guild).members.get("" + value);
		if(!user) throw UserNotFoundError(value);
		else return user;
	});

	broker.register('discord.user.get', value => {
		let user = client.users.get("" + value);
		if(!user) throw UserNotFoundError(value);
		else return user;
	});

	flightChannel = client.channels.get("" + opts.flightLoggingChannel);
	sampleChannel = client.channels.get("" + opts.sampleLoggingChannel);

	return Promise.resolve(client);
})();

// pandemic.flight.update
async function handleFlightUpdate(update) {
	debug(`Enter Flight Update - Callsign: ${update.callsign} Status: ${update.status}`);
	let embed = new RichEmbed()
		.setFooter(`${new Date().toUTCString()} | User ID: ${pilot.id}`)
	
	// Get user id and user to DM
	let pilot = await broker.call('pandemic.pilot.by', 'cid', update.cid);
	let user = await broker.call('discord.user.get', pilot.id);

	switch(update.status) {
		// Departing
		case 'ENR':
			embed.setTitle(`${update.callsign} has departed from KSEA`)
			.setDescription(`<@${pilot.id}> is enroute KSEA to KSFO\nPlane: ${update.aircraft}\nDistance: ${null}`)
			.setColor("RED")
			.setThumbnail(DEP_ICON)
			break;

		// Arriving
		case 'ARR':
			embed.setTitle(`${update.callsign} has arrived at KSFO`)
			.setDescription(`<@${pilot.id}> was enroute from KSEA to KSFO`)
			.setColor("RED")
			.setThumbnail(ARR_ICON)
			break;

		// Cancel
		case 'CXD':
			embed.setTitle(`${update.callsign} has canceled their flight`)
			.setDescription(`<${pilot.id}> canceled their flight from KSEA to KSFO\n`)
			.setColor("PURPLE")
			.setThumbnail(CXD_ICON)
			break;
		default:
			debug('Flight Update - invalid state');
			return;
	}

	flightChannel.send({embed: embed});
}

function getSampleEmbed() {
	return new RichEmbed()
		.setColor("GREEN")
		.setThumbnail(SAMPLE_ICON)
}

// pandemic.samples.assigned
async function handleSampleAssigned(sample) {
	let pilot = await broker.call('pandemic.pilot.by', 'callsign', sample.owner);

	let embed = getSampleEmbed()
		.setTitle(`${sample.owner} has received a sample`)
		.setDescription(`<@${pilot.id}> has received sample ${sample.id}\n`)
		.setFooter(`Given at ${new Date().toUTCString()} | User ID: ${pilot.id}`);

	sampleChannel.send({embed: embed});
}

// pandemic.samples.transfer
// This is probably mostly wrong
async function handleSampleTransfer(transfer) {
	let sampleString = ""
	
	for(let i in transfer.samples) {
		if(i === 0) sampleString += transfer.samples[i].id;
		else sampleString += `, ${transfer.samples[i].id}`;
	}

	let fromPilot = await broker.call('pandemic.pilot.by', 'callsign', transfer.from);
	let toPilot = await broker.call('pandemic.pilot.by', 'callsign', transfer.to);

	let embed = getSampleEmbed()
		.setTitle(`${transfer.from.callsign} has transferred samples to ${transfer.to.callsign}`)
		.setDescription(`<@${fromPilot.id}> has received samples ${sampleString}\n`)
		.setFooter(`Transferred at ${new Date().toUTCString()} | User ID One: ${fromPilot.id} | User ID Two: ${toPilot.id}`);

	sampleChannel.send({embed: embed});
}

// pandemic.samples.delivered
// This is probably mostly wrong
async function handleSampleDelivered(transfer) {

}
