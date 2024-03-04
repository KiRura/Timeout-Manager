import { Client, Collection, EmbedBuilder, Events, GatewayIntentBits } from 'discord.js'
import { config } from 'dotenv'
import fs from 'fs'
import functions from './functions.js'
import data from './data.js'
import { Logger } from 'tslog'
const logger = new Logger({ hideLogPositionForProduction: true })
logger.info('loaded modules')

try {
  JSON.parse(fs.readFileSync('./data/guilds.json'))
} catch (error) {
  throw new Error('guilds.jsonが正しく配置、または書かれていません。')
}

config()

const client = new Client({ intents: Object.values(GatewayIntentBits) })

const eventCommands = new Collection()
const eventFiles = fs.readdirSync('./event').filter(eventFileName => eventFileName.endsWith('.js'))
for (const eventFileName of eventFiles) {
  try {
    const eventCommand = (await import(`./event/${eventFileName}`)).default
    eventCommands.set(eventCommand.name, eventCommand)
    logger.info(`loaded ${eventFileName}`)
  } catch (error) {
    logger.error(`cannot load ${eventFileName}`)
    console.error(error)
  }
}

const commands = new Collection()
const commandFiles = fs.readdirSync('./command').filter(commandFileName => commandFileName.endsWith('.js'))
const registCommands = []
for (const commandFileName of commandFiles) {
  try {
    const command = (await import(`./command/${commandFileName}`)).default
    commands.set(command.data.name, command)
    registCommands.push(command.data.toJSON())
    logger.info(`loaded ${commandFileName}`)
  } catch (error) {
    logger.error(`cannot load ${commandFileName}`)
    console.error(error)
  }
}

client.once(Events.ClientReady, async client => {
  const command = eventCommands.get(Events.ClientReady)
  try {
    await command.execute(client, registCommands)
  } catch (error) {
    logger.error('ClientReady Error')
    console.error(error)
  }
})

client.on(Events.GuildCreate, async guild => {
  const command = eventCommands.get(Events.GuildCreate)
  try {
    await command.execute(client, guild)
  } catch (error) {
    logger.error('GuildCreate Error')
    console.error(error)
    await functions.sendErrorLog(guild.client, null, error)
  }
})

client.on(Events.GuildMemberRemove, async member => {
  const command = eventCommands.get(Events.GuildMemberRemove)
  try {
    await command.execute(member)
  } catch (error) {
    logger.error('GuildMemberRemove Error')
    console.error(error)
    await functions.sendErrorLog(member.client, null, error)
  }
})

client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
  const command = eventCommands.get(Events.GuildMemberUpdate)
  try {
    await command.execute(oldMember, newMember)
  } catch (error) {
    logger.error('GuildMemberUpdate Error')
    console.error(error)
    await functions.sendErrorLog(newMember.client, null, error)
  }
})

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return

  (await (await client.guilds.fetch('1074670271312711740')).channels.fetch('1169563470853836851')).send({
    embeds: [
      new EmbedBuilder()
        .setTitle(interaction.command.name)
        .setAuthor({
          name: `${interaction.user.displayName} | ${interaction.user.id}`,
          iconURL: functions.avatarToURL(interaction.user)
        })
        .setColor(interaction.member?.roles?.color?.color ? interaction.member.roles.color.color : data.mutaoColor)
        .setFooter({
          text: interaction.guild ? `${interaction.guild.name} | ${interaction.guild.id}` : 'DM',
          iconURL: interaction.inGuild() ? interaction.guild.iconURL({ size: 4096 }) : null
        })
    ]
  })

  const command = commands.get(interaction.command.name)
  if (!command) return await interaction.reply({ content: `${interaction.command.name}は未実装です。`, ephemeral: true })

  try {
    await command.execute(client, interaction)
  } catch (error) {
    logger.error(`InteractionCreate (${interaction.command.name}) Error`)
    console.error(error)
    await functions.sendErrorLog(interaction.client, interaction.user, error)
  }
})

client.login(process.env.DISCORD_TOKEN)
