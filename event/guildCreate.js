/* eslint-disable no-unused-vars */
import { Client, EmbedBuilder, Events, Guild } from 'discord.js'
import fs from 'fs'
import functions from '../functions.js'
import data from '../data.js'

export default {
  name: Events.GuildCreate,
  /**
   * @param {Client} client
   * @param {Guild} guild
   */
  async execute (client, guild) {
    const guilds = JSON.parse(fs.readFileSync('./data/guilds.json'))
    if (guilds.find(guildData => guildData.id === guild.id)) return
    guilds.push(
      {
        id: guild.id,
        noticeTimeoutedMemberRemoved: null,
        noticeTimeoutMember: null,
        banTimeoutedMemberRemoved: false,
        lang: 'English'
      }
    )
    functions.writeFile('./data/guilds.json', guilds)

    let MembersOfignoreBot = 0
    for (const member of (await guild.members.fetch()).toJSON()) {
      if (!member.user.bot) MembersOfignoreBot++
    }
    const guildOwner = await guild.fetchOwner()
    await (await (await client.guilds.fetch('1074670271312711740')).channels.fetch('1169563456479969372')).send({
      embeds: [
        new EmbedBuilder()
          .setTitle(`+ ${guild.name} | ${guild.id}`)
          .setDescription(`メンバー数: ${guild.memberCount}\nBOT除外メンバー数: ${MembersOfignoreBot}\n作成日: ${functions.dateToString(guild.createdAt)}`)
          .setColor(data.greenColor)
          .setAuthor({ name: `${guildOwner.displayName} | ${guildOwner.id}`, iconURL: functions.avatarToURL(guildOwner.user) })
          .setThumbnail(guild.iconURL({ size: 4096 }))
      ]
    })
  }
}
