/* eslint-disable no-unused-vars */
import { Client, GuildMember, User, ChatInputCommandInteraction } from 'discord.js'
import ping from 'ping'
import fs from 'fs'

export default {
  async googlePing () {
    return (await ping.promise.probe('8.8.8.8')).time
  },
  /**
   * @param {Client} client
   * @returns
   */
  async fetchAdmin (client) {
    return await client.users.fetch('606093171151208448')
  },
  /**
   * @param {User} user
   */
  avatarToURL (user) {
    return user.avatarURL({ size: 4096 }) || `${user.defaultAvatarURL}?size=4096`
  },
  /**
   * @param {string} filePass
   */
  writeFile (filePass, json) {
    fs.writeFileSync(filePass, Buffer.from(JSON.stringify(json)))
  },
  /**
   * @param {Date} date
   * @param {string} lang
   */
  dateToString (date, lang) {
    lang = lang || 'Japanese'
    if (lang === 'English') {
      const day = ['Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.']
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}(${day[date.getDay()]}) ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
    } else if (lang === 'Japanese') {
      const day = ['日', '月', '火', '水', '木', '金', '土']
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日(${day[date.getDay()]}) ${date.getHours()}時${date.getMinutes()}分${date.getSeconds()}秒`
    }
  },
  /**
   *
   * @param {GuildMember} member
   * @param {PermissionResolvable} permission
   * @param {ChatInputCommandInteraction} interaction
   */
  async hasThisMemberPermission (member, permission, interaction) {
    if (!member.permissions.has(permission)) {
      const content = `あなたの権限に ${permission.toString()} がありません。`
      if (interaction.replied) {
        await interaction.editReply(content)
      } else if (interaction.deferred) {
        await interaction.followUp(content)
      } else {
        await interaction.reply(content)
      }
      return false
    }
    return true
  }
}
