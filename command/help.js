import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import data from "../data.js";

export default {
  data: new SlashCommandBuilder().setName("help").setDescription("注意点とか"),
  /**
   * @param {import("discord.js").Client} client
   * @param {import("discord.js").ChatInputCommandInteraction} interaction
   */
  async execute(client, interaction) {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(client.user.displayName)
          .setDescription(
            "[一応サポート鯖](https://discord.gg/QFXT3fCXZr)\n\n注意点とか\n- 今のところ無し"
          )
          .setColor(data.mutaoColor)
      ]
    });
  }
};
