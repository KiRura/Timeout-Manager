/* eslint-disable no-unused-vars */
import { Logger } from 'tslog'
import functions from '../functions.js'
import { Client, Events } from 'discord.js'
import fs from 'fs'
const logger = new Logger({ hideLogPositionForProduction: true })

export default {
  name: Events.ClientReady,
  /**
   * @param {Client<true>} client
   * @param {*} registCommands
   */
  async execute (client, registCommands) {
    setInterval(async () => {
      client.user.setActivity({ name: `${(await client.guilds.fetch()).size} servers・${client.users.cache.size} users・${await functions.googlePing()} ms` })
    }, 30000)

    logger.info('finding no data generated guild...')
    for (const guild of (await client.guilds.fetch()).toJSON()) {
      const guildsData = JSON.parse(fs.readFileSync('./data/guilds.json'))
      if (!guildsData.find(guildData => guildData.id === guild.id)) {
        await (await import('../event/guildCreate.js')).default.execute(client, guild)
        logger.info(`success: ${guild.name} | ${guild.id}`)
      }
    }

    logger.info('setting commands...')
    await client.application.commands.set(registCommands)

    logger.info(`${client.user.displayName} ALL READY`)
  }
}
