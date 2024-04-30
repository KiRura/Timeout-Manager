/* eslint-disable no-unused-vars */
import { Client, Events, Guild } from "discord.js";
import fs from "fs";
import functions from "../functions.js";

export default {
  name: Events.GuildCreate,
  /**
   * @param {Client} client
   * @param {Guild} guild
   */
  async execute(client, guild) {
    const guilds = JSON.parse(fs.readFileSync("./data/guilds.json"));
    if (guilds.find(guildData => guildData.id === guild.id)) return;
    guilds.push({
      id: guild.id,
      noticeTimeoutedMemberRemoved: null,
      noticeTimeoutMember: null,
      banTimeoutedMemberRemoved: false,
      role: null,
      lang: "English"
    });
    functions.writeFile("./data/guilds.json", guilds);
  }
};
