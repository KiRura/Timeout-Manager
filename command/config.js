import {
  ChannelType,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder
} from "discord.js";
import functions from "../functions.js";
import fs from "fs";
import data from "../data.js";

export default {
  data: new SlashCommandBuilder()
    .setName("config")
    .setDescription("設定関連")
    .addSubcommand(option => option.setName("list").setDescription("設定一覧"))
    .addSubcommandGroup(option =>
      option
        .setName("manage")
        .setDescription("管理")
        .addSubcommand(option =>
          option
            .setName("noticeleave")
            .setDescription("タイムアウトされたメンバーが退出した時に通知")
            .addChannelOption(option =>
              option
                .setName("channel")
                .setDescription("送信先のチャンネル (空白で無効化)")
                .addChannelTypes(ChannelType.GuildText)
            )
        )
        .addSubcommand(option =>
          option
            .setName("noticetimeout")
            .setDescription("タイムアウト、もしくは解除されたメンバーを通知")
            .addChannelOption(option =>
              option
                .setName("channel")
                .setDescription("送信先のチャンネル (空白で無効化)")
                .addChannelTypes(ChannelType.GuildText)
            )
        )
        .addSubcommand(option =>
          option
            .setName("ban")
            .setDescription(
              "タイムアウトされたメンバーが退出した時にそのメンバーをBANする"
            )
            .addBooleanOption(option =>
              option
                .setName("enable")
                .setDescription("有効にするか否か")
                .setRequired(true)
            )
        )
        .addSubcommand(option =>
          option
            .setName("role")
            .setDescription("タイムアウトされているメンバーにロールを付与する")
            .addRoleOption(option =>
              option.setName("role").setDescription("ロール")
            )
        )
    ),
  /**
   * @param {import("discord.js").Client} client
   * @param {import("discord.js").ChatInputCommandInteraction} interaction
   */
  async execute(client, interaction) {
    if (!(await functions.isGuild(interaction))) return;
    const guildsData = JSON.parse(fs.readFileSync("./data/guilds.json"));
    if (interaction.options.getSubcommand() === "list") {
      const guild = guildsData.find(
        guildData => guildData.id === interaction.guild.id
      );
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("サーバー設定")
            .setFields([
              {
                name: "タイムアウトされたメンバーが退出した時に通知",
                value: guild.noticeTimeoutedMemberRemoved
                  ? `<#${guild.noticeTimeoutedMemberRemoved}>`
                  : "False",
                inline: true
              },
              {
                name: "タイムアウト、もしくは解除されたメンバーを通知",
                value: guild.noticeTimeoutMember
                  ? `<#${guild.noticeTimeoutMember}>`
                  : "False",
                inline: true
              },
              {
                name: "タイムアウトされたメンバーが退出した時にそのメンバーをBANする",
                value: guild.banTimeoutedMemberRemoved ? "True" : "False",
                inline: true
              },
              {
                name: "タイムアウトされたときにそのメンバーにロールを付与する",
                value: guild.role ? `<@&${guild.role}>` : "False",
                inline: true
              }
            ])
            .setColor(data.mutaoColor)
        ]
      });
    }
    if (interaction.options.getSubcommandGroup() === "manage") {
      if (
        !(await functions.hasThisMemberPermission(
          interaction.member,
          PermissionFlagsBits.Administrator,
          interaction
        ))
      )
        return;
      const option =
        interaction.options.getChannel("channel")?.id ||
        interaction.options.getBoolean("enable") ||
        interaction.options.getRole("role")?.id;

      return await interaction.reply({
        embeds: [
          createContent(
            interaction.options.getSubcommand(),
            option,
            interaction,
            guildsData
          )
        ]
      });
    }
    await functions.sendErrorLog(
      interaction.client,
      null,
      `未実装のコマンド ${interaction.command.name}`
    );
    return await interaction.reply({
      content: "未実装っぽいです。",
      ephemeral: true
    });
  }
};

/**
 * @param {EmbedBuilder} embed
 */
function createContent(subCommandName, option, interaction, guildsData) {
  return new EmbedBuilder()
    .setTitle(option ? "有効化" : "無効化")
    .setColor(option ? data.greenColor : data.redColor)
    .setDescription(
      createDescriptionAndWriteFile(
        subCommandName,
        option,
        interaction,
        guildsData
      )
    );
}

function createDescriptionAndWriteFile(
  subCommandName,
  option,
  interaction,
  guildsData
) {
  if (subCommandName === "noticeleave") {
    guildsData.find(
      guildData => guildData.id === interaction.guild.id
    ).noticeTimeoutedMemberRemoved = option;
    functions.writeFile("./data/guilds.json", guildsData);
    return (
      "タイムアウトされたメンバーが退出した時に通知" + channelOfToSendTo(option)
    );
  }
  if (subCommandName === "noticetimeout") {
    guildsData.find(
      guildData => guildData.id === interaction.guild.id
    ).noticeTimeoutMember = option;
    functions.writeFile("./data/guilds.json", guildsData);
    return (
      "タイムアウト、もしくは解除されたメンバーを通知" +
      channelOfToSendTo(option)
    );
  }
  if (subCommandName === "ban") {
    guildsData.find(
      guildData => guildData.id === interaction.guild.id
    ).banTimeoutedMemberRemoved = option;
    functions.writeFile("./data/guilds.json", guildsData);
    return "タイムアウトされたメンバーが退出した時にそのメンバーをBANする";
  }
  if (subCommandName === "role") {
    guildsData.find(guildData => guildData.id === interaction.guild.id).role =
      option;
    functions.writeFile("./data/guilds.json", guildsData);
    if (option) return `<@&${option}> をタイムアウトされているメンバーに付与`;
    return null;
  }
  return null;
}

function channelOfToSendTo(option) {
  if (option) return `\n送信先: <#${option}>`;
  return "";
}
