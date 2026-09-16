import { ChatInputCommandInteraction, SlashCommandBuilder, MessageFlags, TextChannel } from 'discord.js';
import { injectable, inject } from 'tsyringe';
import { ICommand } from './ICommand';
import { ConnectionService } from '../../application/services/ConnectionService';
import { logger } from '../../core/logger/logger';

@injectable()
export class EndChatCommand implements ICommand {
  public data: any = new SlashCommandBuilder()
    .setName('endchat')
    .setDescription('End this private chat and delete the channel.');

  constructor(
    @inject(ConnectionService) private readonly connectionService: ConnectionService
  ) {}

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const request = await this.connectionService.endChat(interaction.channelId);
      
      const otherChannelId = request.senderChannelId === interaction.channelId ? request.receiverChannelId : request.senderChannelId;
      const otherChannel = otherChannelId ? await interaction.client.channels.fetch(otherChannelId) : null;

      await interaction.editReply('Chat ended. Deleting channel in 5 seconds...');
      if (otherChannel && otherChannel.isTextBased() && 'send' in otherChannel) {
        await (otherChannel as TextChannel).send('The other user ended the chat. Deleting channel in 5 seconds...');
      }
      
      setTimeout(async () => {
        try {
          if (interaction.channel) {
            await interaction.channel.delete('User ended the chat.');
          }
          if (otherChannel) {
            await otherChannel.delete('Other user ended the chat.');
          }
        } catch (e) {
          logger.error({ err: e }, 'Failed to delete channel');
        }
      }, 5000);

    } catch (error: any) {
      await interaction.editReply(error.message || 'Failed to end chat.');
    }
  }
}
