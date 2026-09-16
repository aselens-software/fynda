import { ChatInputCommandInteraction, SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { injectable, inject } from 'tsyringe';
import { ICommand } from './ICommand';
import { ProfileService } from '../../application/services/ProfileService';

@injectable()
export class EditProfileCommand implements ICommand {
  public data = new SlashCommandBuilder()
    .setName('editprofile')
    .setDescription('Edit your Fynda profile (Languages, Interests, Bio)');

  constructor(
    @inject(ProfileService) private readonly profileService: ProfileService
  ) {}

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = await this.profileService.getOrCreateUser(interaction.user.id);

    const modal = new ModalBuilder()
      .setCustomId('edit_profile_modal')
      .setTitle('Edit Your Profile');

    const languagesInput = new TextInputBuilder()
      .setCustomId('languages')
      .setLabel('Languages (comma separated)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('English, Turkish, Spanish')
      .setValue(user.profile.languages.join(', '))
      .setRequired(false);

    const interestsInput = new TextInputBuilder()
      .setCustomId('interests')
      .setLabel('Interests (comma separated)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Coding, Anime, Music')
      .setValue(user.profile.interests.join(', '))
      .setRequired(false);

    const lookingForInput = new TextInputBuilder()
      .setCustomId('lookingFor')
      .setLabel('Looking For (FRIENDSHIP, GAMING, etc)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('FRIENDSHIP, GAMING, PROGRAMMING')
      .setValue(user.profile.lookingFor.join(', '))
      .setRequired(false);

    const bioInput = new TextInputBuilder()
      .setCustomId('bio')
      .setLabel('Short Bio')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Hi! I love writing code and playing games.')
      .setValue(user.profile.bio || '')
      .setRequired(false)
      .setMaxLength(500);

    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(languagesInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(interestsInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(lookingForInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(bioInput)
    );

    await interaction.showModal(modal);
  }
}
