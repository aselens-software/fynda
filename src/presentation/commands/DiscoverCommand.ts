import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import { inject, injectable } from 'tsyringe';
import { TopggUtil } from '../../core/utils/TopggUtil';
import { ICommand } from './ICommand';
import { MatchingService } from '../../application/services/MatchingService';
import { ConnectionService } from '../../application/services/ConnectionService';
import { logger } from '../../core/logger/logger';

@injectable()
export class DiscoverCommand implements ICommand {
  public data = new SlashCommandBuilder()
    .setName('discover')
    .setDescription('Find new potential connections anonymously!');

  constructor(
    @inject(MatchingService) private readonly matchingService: MatchingService,
    @inject(ConnectionService) private readonly connectionService: ConnectionService
  ) {}

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const hasVoted = await TopggUtil.hasVoted(interaction.user.id);
      if (!hasVoted) {
        await interaction.editReply('🔒 **You must upvote the bot to use this command!**\n\nPlease vote for Fynda on Top.gg here: https://top.gg/bot/1530886185009021019/vote\n*(It may take a minute for the vote to register)*');
        return;
      }

      const matches = await this.matchingService.getDiscoverableProfiles(interaction.user.id, 1);

      if (matches.length === 0) {
        await interaction.editReply('No new profiles found right now. Check back later or update your profile to increase matches!');
        return;
      }

      const match = matches[0];
      const targetUser = match.user;

      const embed = new EmbedBuilder()
        .setTitle('🔎 New Potential Connection')
        .setColor(0x00aaff)
        .setDescription(`We found a profile with **${match.score}%** compatibility!`)
        .addFields(
          { name: 'Looking For', value: targetUser.profile.lookingFor.join(', ') || 'Unspecified', inline: true },
          { name: 'Shared Languages', value: match.sharedLanguages.join(', ') || 'None', inline: true },
          { name: 'Shared Interests', value: match.sharedInterests.join(', ') || 'None', inline: false },
          { name: 'Bio', value: targetUser.profile.bio || '*This user has no bio.*', inline: false }
        )
        .setFooter({ text: 'This profile is fully anonymous.' });

      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`connect_${targetUser.discordId}`)
            .setLabel('Send Request')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId(`skip_${targetUser.discordId}`)
            .setLabel('Skip')
            .setStyle(ButtonStyle.Secondary)
        );

      await interaction.editReply({ embeds: [embed], components: [row] });
    } catch (error: any) {
      logger.error({ err: error, userId: interaction.user.id }, 'Error during discovery');
      await interaction.editReply(error.message || 'An error occurred during discovery.');
    }
  }
}
