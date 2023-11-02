/* eslint-disable no-unused-vars */
import { Client, EmbedBuilder, Events, GuildMember, PermissionFlagsBits } from 'discord.js'
import fs from 'fs'
import functions from '../functions.js'
import data from '../data.js'

export default {
  name: Events.GuildMemberRemove,
  /**
   * @param {Client} client
   * @param {GuildMember} member
   */
  async execute (member) {
    if (!member.isCommunicationDisabled()) return
    const guildsData = JSON.parse(fs.readFileSync('./data/guilds.json'))
    const guild = guildsData.find(guildData => guildData.id === member.guild.id)
    if (guild.noticeTimeoutedMemberRemoved !== null) {
      let channel
      try {
        channel = await member.guild.channels.fetch(guild.noticeTimeoutedMemberRemoved)
      } catch (error) {
        guildsData.find(guildData => guildData.id === member.guild.id).noticeTimeoutedMemberRemoved = null
        return functions.writeFile('./data/guilds.json', guildsData)
      }
      const embed = new EmbedBuilder()
        .setAuthor({ name: `${member.displayName} | ${member.id}` })
        .setThumbnail(functions.avatarToURL(member.user))
        .setDescription(`サーバー参加日: ${functions.dateToString(member.joinedAt)}\nアカウント作成日: ${functions.dateToString(member.user.createdAt)}\nプロフィール: <@${member.id}>`)
        .setColor(member.roles.color?.color ? member.roles.color.color : data.greenColor)

      if (guild.banTimeoutedMemberRemoved) {
        if (!member.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
          embed
            .setTitle('BANの権限が無いためBANができませんでした。')
            .setColor(data.redColor)
          return await channel.send({ embeds: [embed] }).catch(_error => {})
        } else if (!member.bannable) {
          embed
            .setTitle('上位ロールの人だったためBANできませんでした。')
            .setColor(data.redColor)
          return await channel.send({ embeds: [embed] }).catch(_error => {})
        }

        try {
          await member.ban()
        } catch (error) {
          embed
            .setTitle('何故かBANできませんでした。')
            .setColor(data.redColor)
            .setDescription(`${embed.toJSON().description}\nエラー:\n${error}`)
          return await channel.send({ embeds: [embed] }).catch(_error => {})
        }
        embed
          .setTitle('BANが完了しました。')
        await channel.send({ embeds: [embed] }).catch(_error => {})
      } else {
        embed
          .setTitle('タイムアウトされていたメンバーが退出しました。')
          .setColor(data.redColor)
        await channel.send({ embeds: [embed] }).catch(_error => {})
      }
    } else {
      if (guild.banTimeoutedMemberRemoved && member.bannable) {
        try {
          await member.ban()
        } catch (error) {}
      }
    }
  }
}
