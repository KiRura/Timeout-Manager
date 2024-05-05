/* eslint-disable no-unused-vars */
import {
  Client,
  GuildMember,
  User,
  ChatInputCommandInteraction,
  EmbedBuilder
} from "discord.js";
import ping from "ping";
import fs from "fs";
import data from "./data.js";

export default {
  async googlePing() {
    return (await ping.promise.probe("8.8.8.8")).time;
  },
  /**
   * @param {Client} client
   * @returns
   */
  async fetchAdmin(client) {
    return await client.users.fetch("606093171151208448");
  },
  /**
   * @param {User} user
   */
  avatarToURL(user) {
    return (
      user.avatarURL({ size: 4096 }) || `${user.defaultAvatarURL}?size=4096`
    );
  },
  /**
   * @param {string} filePass
   */
  writeFile(filePass, json) {
    fs.writeFileSync(filePass, Buffer.from(JSON.stringify(json)));
  },
  /**
   * @param {Date} date
   * @param {string} lang
   */
  dateToString(date, lang) {
    lang = lang || "Japanese";
    if (lang === "English") {
      const day = ["Sun.", "Mon.", "Tue.", "Wed.", "Thu.", "Fri.", "Sat."];
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}(${
        day[date.getDay()]
      }) ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    } else if (lang === "Japanese") {
      const day = ["日", "月", "火", "水", "木", "金", "土"];
      return `${date.getFullYear()}年${
        date.getMonth() + 1
      }月${date.getDate()}日(${
        day[date.getDay()]
      }) ${date.getHours()}時${date.getMinutes()}分${date.getSeconds()}秒`;
    }
  },
  /**
   *
   * @param {GuildMember} member
   * @param {PermissionResolvable} permission
   * @param {ChatInputCommandInteraction} interaction
   */
  async hasThisMemberPermission(member, permission, interaction) {
    if (!member.permissions.has(permission)) {
      const content = `あなたの権限に ${permission.toString()} がありません。`;
      if (interaction.replied) {
        await interaction.editReply(content);
      } else if (interaction.deferred) {
        await interaction.followUp(content);
      } else {
        await interaction.reply(content);
      }
      return false;
    }
    return true;
  },
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async isGuild(interaction) {
    if (!interaction.inGuild()) {
      await interaction.reply({
        content: "サーバー内でのみ実行できます。",
        ephemeral: true
      });
      return false;
    }
    return true;
  },
  /**
   * @param {Client} client
   * @param {User | null} user
   * @param {Error} error
   */
  async sendErrorLog(client, user, error) {
    const embed = new EmbedBuilder()
      .setColor(data.redColor)
      .setTimestamp(new Date());
    if (!error.name || !error.message) {
      embed
        .setTitle("Errorじゃないっぽいエラー・例外")
        .setDescription(String(error));
    } else {
      embed
        .setTitle(error.name)
        .setDescription(
          error.message + error.stack ? "```\n" + error.stack + "\n```" : ""
        );
    }
    if (user) {
      const dmChannel = await this.createDMChannel(user);
      if (dmChannel)
        await dmChannel.send({
          content: "開発者に以下のエラーログが送信されました。",
          embeds: [embed]
        });
    }
    const guild = await client.guilds.fetch("1074670271312711740");
    const channel = await guild.channels.fetch("1202967540419002430");
    if (!channel) {
      await (
        await client.users.fetch("606093171151208448")
      ).send("エラーをログするためのチャンネルが見当たらないぞ！");
      return false;
    }
    if (!channel.isTextBased() || !channel.viewable) return false;
    await channel.send({ embeds: [embed] });
    return true;
  },
  /**
   * @param {User} user
   */
  async createDMChannel(user) {
    if (user.dmChannel) return user.dmChannel;
    let dm;
    try {
      dm = await user.createDM();
    } catch (error) {
      return null;
    }
    return dm;
  }
};
