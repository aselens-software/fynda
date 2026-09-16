import { ChatInputCommandInteraction, SlashCommandBuilder, MessageFlags } from 'discord.js';
import { injectable, inject } from 'tsyringe';
import { ICommand } from './ICommand';
import { ProfileService } from '../../application/services/ProfileService';

@injectable()
export class VisibilityCommand implements ICommand {
  public data = new SlashCommandBuilder()
    .setName('visibility')
    .setDescription('Toggle your profile visibility in the discovery pool.')
    .addBooleanOption(option => 
      option.setName('discoverable')
        .setDescription('Set to true to be found by others, false to hide.')
        .setRequired(true)
    );

  constructor(
    @inject(ProfileService) private readonly profileService: ProfileService
  ) {}

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const isDiscoverable = interaction.options.getBoolean('discoverable', true);
    
    try {
      await this.profileService.toggleVisibility(interaction.user.id, isDiscoverable);
      
      await interaction.editReply(`Your profile is now **${isDiscoverable ? 'Visible 🟢' : 'Hidden 🔴'}** in the discovery pool.`);
    } catch (error: any) {
      await interaction.editReply(error.message || 'An error occurred.');
    }
  }
}
