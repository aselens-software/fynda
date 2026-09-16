import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export interface ICommand {
  data: any; // Allow all SlashCommandBuilder variations
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
}
