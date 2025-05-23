import fs from "node:fs";
import { ActivityType, EmbedBuilder, Events } from "discord.js";
import data from "../data.js";
import functions from "../functions.js";
import { logger } from "../main.js";

export default {
	name: Events.ClientReady,
	/**
	 * @param {import("discord.js").Client<true>} client
	 * @param {[]} registCommands
	 */
	async execute(client, registCommands) {
		async function setAc() {
			client.user.setActivity({
				name: `${(await client.guilds.fetch()).size} servers・${
					client.users.cache.size
				} users・${await functions.googlePing()} ms`,
				type: ActivityType.Custom,
			});
		}

		await setAc();
		setInterval(async () => {
			await setAc();
		}, 30000);

		for (const guild of (await client.guilds.fetch()).toJSON()) {
			const guildsData = JSON.parse(fs.readFileSync("./data/guilds.json"));
			if (!guildsData.find((guildData) => guildData.id === guild.id)) {
				await (await import("../event/guildCreate.js")).default.execute(
					client,
					guild,
				);
				logger.info(`success: ${guild.name} | ${guild.id}`);
			}
		}

		await client.application.commands.set(registCommands);

		logger.info(`${client.user.displayName} ALL READY`);
	},
};
