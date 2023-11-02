/* eslint-disable no-unused-vars */
import { ChatInputCommandInteraction, Client, EmbedBuilder, SlashCommandBuilder } from 'discord.js'

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('注意点とか'),
  /**
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute (client, interaction) {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(client.user.displayName)
          .setDescription('[一応サポート鯖](https://discord.gg/QFXT3fCXZr)\n\n注意点とか\n- 今のところ無し')
      ]
    })
  }
}
