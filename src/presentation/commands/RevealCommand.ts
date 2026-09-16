import { ChatInputCommandInteraction, SlashCommandBuilder, MessageFlags, EmbedBuilder, TextChannel } from 'discord.js';
import { injectable, inject } from 'tsyringe';
import { ICommand } from './ICommand';
import { ConnectionService } from '../../application/services/ConnectionService';

@injectable()
export class RevealCommand implements ICommand {
  public data: any = new SlashCommandBuilder()
    .setName('reveal')
    .setDescription('Vote to reveal your identity. If both vote yes, identities are shared!');

  constructor(
    @inject(ConnectionService) private readonly connectionService: ConnectionService
  ) {}

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    try {
      const { bothRevealed, request } = await this.connectionService.handleReveal(
        interaction.channelId, 
        interaction.user.id
      );

      const otherChannelId = request.senderChannelId === interaction.channelId ? request.receiverChannelId : request.senderChannelId;
      const otherChannel = otherChannelId ? await interaction.client.channels.fetch(otherChannelId) : null;

      if (bothRevealed) {
        // Find both users
        const embed = new EmbedBuilder()
          .setTitle('🎉 Identities Revealed! 🎉')
          .setColor(0xffd700)
          .setDescription(`Both users have agreed to reveal their identities!\n\nThis chat is between <@${request.senderDiscordId}> and <@${request.receiverDiscordId}>. Have fun!`);
          
        await interaction.editReply({ embeds: [embed] });
        if (otherChannel && otherChannel.isTextBased() && 'send' in otherChannel) {
          await (otherChannel as TextChannel).send({ embeds: [embed] });
        }
      } else {
        await interaction.editReply(`🟢 You have voted to reveal your identity! Waiting for the other person to use \`/reveal\`...`);
        if (otherChannel && otherChannel.isTextBased() && 'send' in otherChannel) {
          await (otherChannel as TextChannel).send(`🟢 The other user has voted to reveal their identity! Type \`/reveal\` to agree and reveal yourselves!`);
        }
      }
    } catch (error: any) {
      await interaction.editReply({ content: error.message || 'Failed to reveal identity.', flags: MessageFlags.Ephemeral } as any);
    }
  }
}
