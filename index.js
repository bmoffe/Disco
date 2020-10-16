//container for bot code
require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
const TOKEN = process.env.TOKEN;
client.login(TOKEN); //token for bot login


client.on('ready', () => { //log in as bot user
	console.info('Bot logged in successfully.');
});

client.on('message', async msg => { //commands for bot
	if (msg.content === './ping'){
		msg.channel.send('pong');
	}
	if (msg.content === './join'){
		if(msg.member.voice.channel){
			const connection = await msg.member.voice.channel.join();
			connection.on('error', console.error);
		}
	}
	if (msg.includes('./play'){

});
