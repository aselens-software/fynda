import { Events, Message, TextChannel } from 'discord.js';
import { injectable, inject } from 'tsyringe';
import { IEvent } from './IEvent';
import { ConnectionService } from '../../application/services/ConnectionService';
import { ConnectionChannelCache } from '../../infrastructure/cache/ConnectionChannelCache';
import { logger } from '../../core/logger/logger';

@injectable()
export class MessageCreateEvent implements IEvent<Events.MessageCreate> {
  public readonly name = Events.MessageCreate;

  constructor(
    @inject(ConnectionService) private readonly connectionService: ConnectionService,
    @inject(ConnectionChannelCache) private readonly channelCache: ConnectionChannelCache
  ) {}

  public async execute(message: Message): Promise<void> {
    if (message.author.bot) return;
    if (!message.guildId) return;

    // Fast path: check negative cache first (most channels are NOT connection channels)
    if (this.channelCache.isMiss(message.channelId)) return;

    // Check in-memory cache before hitting the DB
    let request = this.channelCache.get(message.channelId);

    if (!request) {
      // Cache miss — query DB
      request = (await this.connectionService.getRequestByChannelId(message.channelId)) ?? undefined;

      if (!request) {
        // Not a connection channel — cache the miss to avoid future DB lookups
        this.channelCache.setMiss(message.channelId);
        return;
      }

      // Cache the hit for future messages
      this.channelCache.set(request);
    }

    // Relay the message to the other channel
    const isSender = request.senderChannelId === message.channelId;
    const targetChannelId = isSender ? request.receiverChannelId : request.senderChannelId;

    if (!targetChannelId) return;

    try {
      // Use cache first, then fetch from API only if needed
      const targetChannel = message.client.channels.cache.get(targetChannelId)
        ?? await message.client.channels.fetch(targetChannelId);

      if (targetChannel && targetChannel.isTextBased() && 'send' in targetChannel) {
        const prefix = `**Anon:** `;

        const files = Array.from(message.attachments.values()).map(a => a.url);
        const textContent = message.content ? message.content : (files.length > 0 ? '' : '*[Boş/Okunamayan Mesaj]*');

        await (targetChannel as TextChannel).send({
          content: prefix + textContent,
          files: files.length > 0 ? files : undefined
        });
      }
    } catch (error) {
      logger.error({ err: error, channelId: message.channelId }, 'Failed to relay message');
    }
  }
}
