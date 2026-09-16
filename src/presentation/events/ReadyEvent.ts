import { Events, Client, ActivityType } from 'discord.js';
import { injectable } from 'tsyringe';
import { IEvent } from './IEvent';
import { logger } from '../../core/logger/logger';

@injectable()
export class ReadyEvent implements IEvent<Events.ClientReady> {
  public readonly name = Events.ClientReady;
  public readonly once = true;

  public execute(client: Client): void {
    logger.info(`Discord client is ready! Logged in as ${client.user?.tag}`);
    client.user?.setActivity('/discover - Find friends', { type: ActivityType.Listening });
  }
}
