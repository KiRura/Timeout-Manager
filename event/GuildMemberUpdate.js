import { EmbedBuilder, Events, GuildMember } from "discord.js";
import fs from "node:fs";
import functions from "../functions.js";
import data from "../data.js";

export default {
	name: Events.GuildMemberUpdate,
	/**
	 * @param {GuildMember} oldMember
	 * @param {GuildMember} newMember
	 */
	async execute(oldMember, newMember) {
		const guildsData = JSON.parse(fs.readFileSync("./data/guilds.json"));
		const guild = guildsData.find(
			(guildData) => guildData.id === newMember.guild.id,
		);

		if (
			guild.noticeTimeoutMember !== null &&
			((!oldMember.isCommunicationDisabled() &&
				newMember.isCommunicationDisabled()) ||
				(oldMember.isCommunicationDisabled() &&
					!newMember.isCommunicationDisabled()))
		) {
			let channel;
			try {
				channel = await newMember.guild.channels.fetch(
					guild.noticeTimeoutMember,
				);
			} catch (error) {
				guildsData.find(
					(guildData) => guildData.id === newMember.guild.id,
				).noticeTimeoutMember = null;
				functions.writeFile("./data/guilds.json", guildsData);
				return;
			}
			const embed = new EmbedBuilder()
				.setTitle(`${newMember.displayName} がタイムアウトされました。`)
				.setDescription(`プロフィール: <@${newMember.id}>`)
				.setColor(data.redColor)
				.setThumbnail(functions.avatarToURL(newMember.user));
			if (
				!oldMember.isCommunicationDisabled() &&
				newMember.isCommunicationDisabled()
			) {
				if (guild.role) {
					try {
						const role = await newMember.guild.roles.fetch(guild.role);
						await newMember.roles
							.add(role)
							.catch((_error) =>
								embed.setDescription(
									`${embed.data.description}\n<@&${role.id}>は権限不足により付与できませんでした。`,
								),
							);
					} catch (error) {
						guildsData.find(
							(guildData) => guildData.id === newMember.guild.id,
						).role = null;
						functions.writeFile("./data/guilds.json", guildsData);
						embed.setDescription(
							`${embed.data.description}\nロールが見つからなかったため、設定はFalseに変更されました。`,
						);
					}
				}
				await channel.send({ embeds: [embed] }).catch((_error) => {});
			} else if (
				oldMember.isCommunicationDisabled() &&
				!newMember.isCommunicationDisabled()
			) {
				if (guild.role) {
					try {
						const role = await newMember.guild.roles.fetch(guild.role);
						await newMember.roles
							.remove(role)
							.catch((_error) =>
								embed.setDescription(
									`${embed.data.description}\n<@&${role.id}>は権限不足により剥奪できませんでした。`,
								),
							);
					} catch (error) {
						guildsData.find(
							(guildData) => guildData.id === newMember.guild.id,
						).role = null;
						functions.writeFile("./data/guilds.json", guildsData);
						embed.setDescription(
							`${embed.data.description}\nロールが見つからなかったため、設定はFalseに変更されました。`,
						);
					}
				}
				embed
					.setTitle(`${newMember.displayName} のタイムアウトが解除されました。`)
					.setColor(data.greenColor);
				await channel.send({ embeds: [embed] }).catch((_error) => {});
			}
		}
	},
};
