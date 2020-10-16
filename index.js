//container for bot code
require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
const TOKEN = process.env.TOKEN;
const ytdl = require('ytdl-core');
const queue = new Map();
client.login(TOKEN); //token for bot login
//const serverQueue = queue.get(msg.guild.id);


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
	const serverQueue = queue.get(msg.guild.id);
	if (msg.content.startsWith('./play')){
		execute(msg, serverQueue);
	}
	if (msg.content === './stop'){
		stop(msg, serverQueue);
	}
	if (msg.content === './skip'){
		skip(msg, serverQueue);
	}
});

async function execute (msg, serverQueue){
	const args = msg.content.split(" ");
	const vc = msg.member.voice.channel;
	if (!vc){
		msg.channel.send('You need to be in voice to use my music command!');
	}
	const permissions = vc.permissionsFor(msg.client.user);
	if (!permissions.has('CONNECT') || !permissions.has('SPEAK')){
		msg.channel.send("I don't have permission to join and play in this channel!");
	}
	const songinfo = await ytdl.getInfo(args[1]);
	const song = {
		title: songinfo.title,
		url: songinfo.video_url
	};
	if (!serverQueue){
		const queueConstruct = {
			textchannel: msg.channel,
			voicechannel: vc,
			connection: null,
			songs: [],
			volume: 5,
			playing: true
		};
		queue.set(msg.guild.id, queueConstruct);
		queueConstruct.songs.push(song);
		try{
			var connection = await vc.join();
			queueConstruct.connection = connection;
			play(msg.guild, queueConstruct.songs[0]);
		} catch (error){
			console.info(error);
			queue.delete(msg.guild.id);
			msg.channel.send(error)
		}
	}
	else{
		serverQueue.songs.push(song);
		msg.channel.send('Song has been added to the queue.');
	}
}

function skip(msg, serverQueue){
	if (!msg.member.voice.channel){
		msg.channel.send("I can't skip a song when no one is here to listen to it!");
	}
	if (!serverQueue){
		msg.channel.send("The queue is empty.");
	}
	serverQueue.dispatcher.end();
}
function play(guild, song){
	const serverQueue = queue.get(guild.id);
	if (!song){
		serverQueue.voicechannel.leave();
		queue.delete(guild.id);
		return;
	}
	const dispatcher = serverQueue.connection
    	.play(ytdl(song.url))
    	.on("finish", () => {
     	 	serverQueue.songs.shift();
      		play(guild, serverQueue.songs[0]);
    	})
    	.on("error", error => console.error(error));
  	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  	serverQueue.textchannel.send(`Now playing: **${song.title}**`);
}
function stop(msg, serverQueue){
	if (!msg.member.voice.channel){
		msg.channel.send('Must be in voice channel to stop music.');
	}
	serverQueue.songs = [];
	serverQueue.connection.dispatcher.end();
}
