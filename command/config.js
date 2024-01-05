/* eslint-disable no-unused-vars */
import { ChannelType, ChatInputCommandInteraction, Client, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import functions from '../functions.js'
import fs from 'fs'
import data from '../data.js'

export default {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('設定関連')
    .addSubcommand(option => option
      .setName('list')
      .setDescription('設定一覧')
    )
    .addSubcommandGroup(option => option
      .setName('manage')
      .setDescription('管理')
      .addSubcommand(option => option
        .setName('noticeleave')
        .setDescription('タイムアウトされたメンバーが退出した時に通知')
        .addChannelOption(option => option
          .setName('channel')
          .setDescription('送信先のチャンネル (空白で無効化)')
          .addChannelTypes(ChannelType.GuildText)
        )
      )
      .addSubcommand(option => option
        .setName('noticetimeout')
        .setDescription('タイムアウト、もしくは解除されたメンバーを通知')
        .addChannelOption(option => option
          .setName('channel')
          .setDescription('送信先のチャンネル (空白で無効化)')
          .addChannelTypes(ChannelType.GuildText)
        )
      )
      .addSubcommand(option => option
        .setName('ban')
        .setDescription('タイムアウトされたメンバーが退出した時にそのメンバーをBANする')
        .addBooleanOption(option => option
          .setName('enable')
          .setDescription('有効にするか否か')
          .setRequired(true)
        )
      )
      .addSubcommand(option => option
        .setName('role')
        .setDescription('タイムアウトされているメンバーにロールを付与する')
        .addRoleOption(option => option
          .setName('role')
          .setDescription('ロール')
        )
      )
    ),
  /**
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute (client, interaction) {
    if (!(await functions.isGuild(interaction))) return
    const guildsData = JSON.parse(fs.readFileSync('./data/guilds.json'))
    if (interaction.options.getSubcommand() === 'list') {
      const guild = guildsData.find(guildData => guildData.id === interaction.guild.id)
      await interaction.reply({
        embeds: [new EmbedBuilder()
          .setTitle('サーバー設定')
          .setFields([
            {
              name: 'タイムアウトされたメンバーが退出した時に通知',
              value: guild.noticeTimeoutedMemberRemoved ? `<#${guild.noticeTimeoutedMemberRemoved}>` : 'False',
              inline: true
            },
            {
              name: 'タイムアウト、もしくは解除されたメンバーを通知',
              value: guild.noticeTimeoutMember ? `<#${guild.noticeTimeoutMember}>` : 'False',
              inline: true
            },
            {
              name: 'タイムアウトされたメンバーが退出した時にそのメンバーをBANする',
              value: guild.banTimeoutedMemberRemoved ? 'True' : 'False',
              inline: true
            },
            {
              name: 'タイムアウトされたときにそのメンバーにロールを付与する',
              value: guild.role ? `<@&${guild.role}>` : 'False',
              inline: true
            }
          ])
          .setColor(data.mutaoColor)
        ]
      })
    }
    if (interaction.options.getSubcommandGroup() === 'manage') {
      /**
       * @param {EmbedBuilder} embed
       */
      function createContent (embed, option, string) {
        if (option === true || option === false) {
          embed.setDescription(`${string}`)
          return embed
        } else {
          embed.setDescription(`${string}${option ? `\n送信先: <#${option}>` : ''}`)
          return embed
        }
      }
      if (!(await functions.hasThisMemberPermission(interaction.member, PermissionFlagsBits.Administrator, interaction))) return
      const option = interaction.options.getChannel('channel')?.id || interaction.options.getBoolean('enable') || interaction.options.getRole('role')?.id || null
      const embed = new EmbedBuilder()
        .setTitle(option ? '有効化' : '無効化')
        .setColor(option ? data.greenColor : data.redColor)

      if (interaction.options.getSubcommand() === 'noticeleave') {
        guildsData.find(guildData => guildData.id === interaction.guild.id).noticeTimeoutedMemberRemoved = option
        functions.writeFile('./data/guilds.json', guildsData)
        await interaction.reply({ embeds: [createContent(embed, option, 'タイムアウトされたメンバーが退出した時に通知')] })
      } else if (interaction.options.getSubcommand() === 'noticetimeout') {
        guildsData.find(guildData => guildData.id === interaction.guild.id).noticeTimeoutMember = option
        functions.writeFile('./data/guilds.json', guildsData)
        await interaction.reply({ embeds: [createContent(embed, option, 'タイムアウト、もしくは解除されたメンバーを通知')] })
      } else if (interaction.options.getSubcommand() === 'ban') {
        guildsData.find(guildData => guildData.id === interaction.guild.id).banTimeoutedMemberRemoved = option
        functions.writeFile('./data/guilds.json', guildsData)
        await interaction.reply({ embeds: [createContent(embed, option, 'タイムアウトされたメンバーが退出した時にそのメンバーをBANする')] })
      } else if (interaction.options.getSubcommand() === 'role') {
        guildsData.find(guildData => guildData.id === interaction.guild.id).role = option
        functions.writeFile('./data/guilds.json', guildsData)
        await interaction.reply({
          embeds: [new EmbedBuilder()
            .setTitle(option ? '有効化' : '無効化')
            .setDescription(option ? `<@&${option}> をタイムアウトされているメンバーに付与` : null)
            .setColor(option ? data.greenColor : data.redColor)
          ]
        })
      }
    }
  }
}
