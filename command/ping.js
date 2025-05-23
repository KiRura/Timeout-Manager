import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import data from "../data.js";
import functions from "../functions.js";

export default {
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("pong!")
		.setDescriptionLocalization("ja", "ピンポン"),
	/**
	 * @param {import("discord.js").Client} client
	 * @param {import("discord.js").ChatInputCommandInteraction} interaction
	 */
	async execute(client, interaction) {
		const googlePingResult = await functions.googlePing();
		const fetchAdminResult = await functions.fetchAdmin(client);
		const embed = new EmbedBuilder()
			.setTitle("Pong!")
			.setFields([
				{
					name: "WebSocket",
					value: client.ws.ping === -1 ? "none" : `${client.ws.ping} ms`,
					inline: true,
				},
				{
					name: "Ping Google (8.8.8.8)",
					value: `${googlePingResult} ms`,
					inline: true,
				},
				{
					name: "API Endpoint",
					value: "waiting...",
					inline: true,
				},
			])
			.setColor(data.mutaoColor)
			.setFooter({
				text: `Created by ${fetchAdminResult.displayName} (${fetchAdminResult.username})`,
				iconURL: functions.avatarToURL(fetchAdminResult),
			});

		await interaction.reply({ embeds: [embed] });
		interaction
			.fetchReply()
			.then(async (reply) => {
				embed.spliceFields(-1, 1).addFields({
					name: "API Endpoint",
					value: `${reply.createdTimestamp - interaction.createdTimestamp} ms`,
					inline: true,
				});
				if (!reply.editable) return;
				await interaction.editReply({ embeds: [embed] });
			})
			.catch(async (error) => {
				await functions.sendErrorLog(interaction.client, null, error);
			});
	},
};
