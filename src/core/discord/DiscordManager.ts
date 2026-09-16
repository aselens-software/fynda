import { Client, Collection, REST, Routes } from 'discord.js';
import { injectable, container } from 'tsyringe';
import { ICommand } from '../../presentation/commands/ICommand';
import { IEvent } from '../../presentation/events/IEvent';
import { config } from '../config/env.config';
import { logger } from '../logger/logger';

@injectable()
export class DiscordManager {
  private commands = new Collection<string, ICommand>();
  private readonly rest = new REST({ version: '10' }).setToken(config.DISCORD_BOT_TOKEN);

  constructor() {}

  public registerCommand(command: ICommand): void {
    this.commands.set(command.data.name, command);
  }

  public registerEvent(client: Client, event: IEvent<any>): void {
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }

  public getCommand(name: string): ICommand | undefined {
    return this.commands.get(name);
  }

  public async deployCommands(): Promise<void> {
    try {
      logger.info(`Started refreshing ${this.commands.size} application (/) commands.`);

      const commandData = this.commands.map(cmd => cmd.data.toJSON());

      await this.rest.put(
        Routes.applicationCommands(config.DISCORD_CLIENT_ID),
        { body: commandData },
      );

      logger.info('Successfully reloaded application (/) commands.');
    } catch (error) {
      logger.error({ err: error }, 'Failed to deploy application commands');
    }
  }
}
