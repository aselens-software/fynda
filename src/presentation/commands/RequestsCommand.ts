import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import { inject, injectable } from 'tsyringe';
import { TopggUtil } from '../../core/utils/TopggUtil';
import { ICommand } from './ICommand';
import { ConnectionService } from '../../application/services/ConnectionService';
import { ProfileService } from '../../application/services/ProfileService';
import { logger } from '../../core/logger/logger';

@injectable()
export class RequestsCommand implements ICommand {
  public data: any = new SlashCommandBuilder()
    .setName('requests')
    .setDescription('View your pending connection requests.');

  constructor(
    @inject(ConnectionService) private readonly connectionService: ConnectionService,
    @inject(ProfileService) private readonly profileService: ProfileService
  ) {}

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const hasVoted = await TopggUtil.hasVoted(interaction.user.id);
      if (!hasVoted) {
        await interaction.editReply('🔒 **You must upvote the bot to use this command!**\n\nPlease vote for Fynda on Top.gg here: https://top.gg/bot/1530886185009021019/vote\n*(It may take a minute for the vote to register)*');
        return;
      }

      const requests = await this.connectionService.getPendingRequests(interaction.user.id);

      if (requests.length === 0) {
        await interaction.editReply('You have no pending connection requests at the moment.');
        return;
      }

      // Display the first request for simplicity, users can keep using /requests to go through them
      const request = requests[0];
      const sender = await this.profileService.getOrCreateUser(request.senderDiscordId);

      const embed = new EmbedBuilder()
        .setTitle('📬 New Connection Request')
        .setColor(0x00ff00)
        .setDescription(`Someone wants to connect with you!`)
        .addFields(
          { name: 'Looking For', value: sender.profile.lookingFor.join(', ') || 'Unspecified', inline: true },
          { name: 'Languages', value: sender.profile.languages.join(', ') || 'None', inline: true },
          { name: 'Interests', value: sender.profile.interests.join(', ') || 'None', inline: false },
          { name: 'Bio', value: sender.profile.bio || '*This user has no bio.*', inline: false }
        )
        .setFooter({ text: 'Accept to reveal identities and chat privately.' });

      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`accept_${request.id}`)
            .setLabel('Accept & Chat')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId(`reject_${request.id}`)
            .setLabel('Reject')
            .setStyle(ButtonStyle.Danger)
        );

      await interaction.editReply({ embeds: [embed], components: [row] });
    } catch (error: any) {
      logger.error({ err: error, userId: interaction.user.id }, 'Error fetching requests');
      await interaction.editReply(error.message || 'An error occurred while fetching requests.');
    }
  }
}
