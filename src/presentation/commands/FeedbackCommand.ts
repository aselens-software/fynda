import { ChatInputCommandInteraction, SlashCommandBuilder, MessageFlags } from 'discord.js';
import { injectable } from 'tsyringe';
import { ICommand } from './ICommand';
import { config } from '../../core/config/env.config';
import { logger } from '../../core/logger/logger';

@injectable()
export class FeedbackCommand implements ICommand {
  public data: any = new SlashCommandBuilder()
    .setName('feedback')
    .setDescription('Send feedback to the developers.')
    .addStringOption(option =>
      option
        .setName('message')
        .setDescription('Your feedback message')
        .setRequired(true)
    );

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const webhookUrl = config.FEEDBACK_WEBHOOK_URL;
    if (!webhookUrl) {
      await interaction.editReply('Feedback system is currently unavailable. Please try again later.');
      return;
    }

    const message = interaction.options.getString('message', true);

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: `**New Feedback from <@${interaction.user.id}> (${interaction.user.username})**\n> ${message}`
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook returned ${response.status} ${response.statusText}`);
      }

      await interaction.editReply('Thank you for your feedback! It has been successfully sent to the developers.');
    } catch (error: any) {
      logger.error({ err: error }, 'Failed to send feedback to webhook');
      await interaction.editReply('An error occurred while sending your feedback. Please try again later.');
    }
  }
}
