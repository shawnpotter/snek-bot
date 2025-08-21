/**
 * Bot that converts Twitter links with videos to fxtwitter links
 * @Author Shawn Potter
 * @Version 0.2.0
 */

// Require the necessary discord.js classes
const fs = require('node:fs')
const path = require('node:path')
const { token, MONGO_URI } = require('./config.json')
const { Client, GatewayIntentBits, Collection } = require('discord.js')
const mongoose = require('mongoose')
const database = require('./data/schema/replace-toggle')

// Create client instance
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
})

//Command Handler
client.commands = new Collection()
const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs
	.readdirSync(commandsPath)
	.filter((file) => file.endsWith('.js'))

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file)
	const command = require(filePath)
	// set a new item in the colleciton
	// with the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command)
}

// Connect to database and display ready message
client.once('ready', async () => {
	await mongoose.connect(MONGO_URI, {
		keepAlive: true,
	})
	console.log('S.N.E.K is Ready!')
})

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isChatInputCommand()) return

	const command = interaction.client.commands.get(interaction.commandName)

	if (!command) return

	try {
		await command.execute(interaction)
	} catch (error) {
		console.error(error)
		await interaction.reply({
			content: 'There was an error while executing this command!',
			ephemeral: true,
		})
	}
})

// on messages being created
client.on('messageCreate', async (message) => {
	// If message contains ANY Twitter link (twitter.com or x.com)
	if (
		message.content.includes('https://twitter.com') ||
		message.content.includes('https://x.com/')
	) {
		try {
			// Get replacement setting from database
			const replaceDB = await database.findOne({ id: message.guildId })
			if (!replaceDB || replaceDB.toggled === false) {
				console.log('Replace-All is not toggled on')
				return // Don't replace if not enabled in database
			}

			// Use regular expression for replacement
			const newLink = message.content.replace(
				/(https?:\/\/)(twitter\.com|x\.com)\/(.*)/gi,
				'https://fixupx.com/$3' // Use fixupx.com (or fxtwitter.com)
			)

			// Delete the original message
			message.delete()

			// Send message to denote which user sent the link
			message.channel.send(`${message.author} posted:`, {
				allowedMentions: { users: [] }, // Disable mentions
			})

			// Send the new link
			message.channel.send(newLink)
		} catch (e) {
			console.error('Error processing message:', e)
		}
	}
})

// Log in the client
client.login(token)
