import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { inject, injectable } from 'tsyringe';
import { ICommand } from './ICommand';
import { ProfileService } from '../../application/services/ProfileService';
import { logger } from '../../core/logger/logger';

@injectable()
export class ProfileCommand implements ICommand {
  public data = new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View and manage your Fynda discovery profile.');

  constructor(
    @inject(ProfileService) private readonly profileService: ProfileService
  ) {}

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const user = await this.profileService.getOrCreateUser(interaction.user.id);

      const embed = new EmbedBuilder()
        .setTitle('Your Fynda Profile')
        .setColor(user.isDiscoverable ? 0x00ff00 : 0xff0000)
        .setDescription('This profile is completely anonymous in the discovery pool.')
        .addFields(
          { name: 'Status', value: user.isDiscoverable ? '🟢 Discoverable' : '🔴 Hidden', inline: true },
          { name: 'Looking For', value: user.profile.lookingFor.length > 0 ? user.profile.lookingFor.join(', ') : 'None selected', inline: true },
          { name: 'Languages', value: user.profile.languages.length > 0 ? user.profile.languages.join(', ') : 'None selected', inline: false },
          { name: 'Interests', value: user.profile.interests.length > 0 ? user.profile.interests.join(', ') : 'None selected', inline: false },
          { name: 'Bio', value: user.profile.bio || 'No bio set.', inline: false }
        )
        .setFooter({ text: 'Use buttons below to edit (Coming Soon)' });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      logger.error({ err: error, userId: interaction.user.id }, 'Error fetching profile');
      await interaction.editReply('An error occurred while fetching your profile.');
    }
  }
}
