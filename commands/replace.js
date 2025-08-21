const { SlashCommandBuilder } = require('discord.js')
const { getRequest } = require('../twitter/twitter-api')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('fxt')
		.setDescription(
			'Add twitter/x link in parameter to change into fxtwitter/fixupx link'
		)
		.addStringOption((option) =>
			option.setName('input').setDescription('Link').setRequired(true)
		),
	async execute(interaction) {
		const link = interaction.options.getString('input')
		console.log(link)

		if (
			link.includes('https://twitter.com') ||
			link.includes('https://x.com/')
		) {
			try {
				// Use regular expression for replacement
				const newLink = link.replace(
					/(https?:\/\/)(twitter\.com|x\.com)\/(.*)/gi,
					'https://fixupx.com/$3' // Use fixupx.com (or fxtwitter.com)
				)

				// Send the new link
				interaction.reply(`${interaction.user} posted: ${newLink}`)
			} catch (e) {
				console.error('Error processing message:', e)
			}
		} else {
			await interaction.reply(
				`${interaction.user} that is not a Twitter Link. Try again.`
			)
		}
	},
}
